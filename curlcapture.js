(function() {
    if (window.__curlLoggerInstalled) {
        console.warn('[cURL Logger] Already installed.');
        return;
    }
    window.__curlLoggerInstalled = true;

    // ── Save originals ──
    const _origFetch         = window.fetch;
    const _origXHROpen       = XMLHttpRequest.prototype.open;
    const _origXHRSend       = XMLHttpRequest.prototype.send;
    const _origXHRSetHeader  = XMLHttpRequest.prototype.setRequestHeader;

    // ── Per-XHR state store ──
    const _xhrMeta = new WeakMap();

    // ── Helpers ──
    function _esc(str) {
        if (typeof str !== 'string') str = String(str);
        // Escape single quotes for shell single-quote strings:  ' → '\''
        return str.replace(/'/g, "'\\''");
    }

    function _currCookies() {
        return document.cookie ? document.cookie : null;
    }

    function _curlCmd(method, url, headers, body) {
        let cmd = `curl -X ${method}`;

        // URL
        cmd += ` \\\n  '${_esc(url)}'`;

        // Headers, sorted for repeatability
        const keys = Object.keys(headers).sort();
        for (const k of keys) {
            cmd += ` \\\n  -H '${_esc(k)}: ${_esc(headers[k])}'`;
        }

        // JavaScript-visible cookies
        const cookies = _currCookies();
        if (cookies) {
            cmd += ` \\\n  -H 'Cookie: ${_esc(cookies)}'`;
        }

        // Body
        if (body !== null && body !== undefined && body !== '') {
            if (body instanceof FormData) {
                const entries = [...body.entries()];
                cmd += ` \\\n  --data 'FORM_DATA(${entries.length} entries)'`;
            } else if (body instanceof URLSearchParams) {
                cmd += ` \\\n  --data-urlencode '${_esc(body.toString())}'`;
            } else if (body instanceof Blob || body instanceof ArrayBuffer) {
                cmd += ` \\\n  --data-raw 'BINARY_DATA(${body.size || body.byteLength || '?'} bytes)'`;
            } else {
                cmd += ` \\\n  --data-raw '${_esc(typeof body === 'string' ? body : String(body))}'`;
            }
        }

        return cmd;
    }

    function _emit(method, url, headers, body) {
        const cmd = _curlCmd(method, url, headers, body);
        console.group(`%c🌐 ${method}  ${url}`, 'color:#4CAF50;font-weight:700');
        console.log(cmd);
        console.groupEnd();
    }

    // ── Fetch hook ──
    window.fetch = function(input, init) {
        let method = 'GET';
        let url = '';
        const headers = {};

        try {
            // Derive method & url
            if (input instanceof Request) {
                method = ((init && init.method) || input.method || 'GET').toUpperCase();
                url   = (init && init.url)    || input.url;
                // Copy Request headers
                input.headers.forEach((v, k) => { headers[k] = v; });
            } else {
                method = ((init && init.method) || 'GET').toUpperCase();
                url    = String(input);
            }

            // Merge / override with init.headers
            if (init && init.headers) {
                const h = init.headers;
                if (h instanceof Headers) {
                    h.forEach((v, k) => { headers[k] = v; });
                } else if (Array.isArray(h)) {
                    h.forEach(([k, v]) => { headers[k] = v; });
                } else {
                    Object.entries(h).forEach(([k, v]) => { headers[k] = v; });
                }
            }

            const hasBody = !['GET', 'HEAD'].includes(method);

            if (!hasBody) {
                _emit(method, url, headers, null);
            } else {
                let bodyFound = false;

                // 1) body from init
                if (init && init.body !== undefined && init.body !== null) {
                    const b = init.body;
                    if (typeof b === 'string' || b instanceof URLSearchParams) {
                        _emit(method, url, headers, b);
                    } else if (b instanceof FormData) {
                        _emit(method, url, headers, b);
                    } else if (b instanceof Blob || b instanceof ArrayBuffer || ArrayBuffer.isView(b)) {
                        _emit(method, url, headers, b);
                    } else if (typeof b === 'object') {
                        // Could be a plain object serialised as JSON by the caller
                        try { _emit(method, url, headers, JSON.stringify(b)); }
                        catch { _emit(method, url, headers, String(b)); }
                    } else {
                        _emit(method, url, headers, String(b));
                    }
                    bodyFound = true;
                }

                // 2) body from Request object (clone so we don't consume the original)
                if (!bodyFound && input instanceof Request && !input.bodyUsed) {
                    try {
                        const clone = input.clone();
                        clone.text().then(t => _emit(method, url, headers, t))
                                   .catch(() => _emit(method, url, headers, '[body unreadable]'));
                    } catch {
                        _emit(method, url, headers, '[body clone failed]');
                    }
                    bodyFound = true;
                }

                if (!bodyFound) {
                    _emit(method, url, headers, null);
                }
            }
        } catch (err) {
            console.warn('[cURL Logger] fetch introspection error:', err);
        }

        return _origFetch.call(this, input, init);
    };

    // ── XMLHttpRequest hook ──
    XMLHttpRequest.prototype.open = function(method, url) {
        _xhrMeta.set(this, {
            method:  (method || 'GET').toUpperCase(),
            url:     String(url),
            headers: {}
        });
        return _origXHROpen.apply(this, arguments);
    };

    XMLHttpRequest.prototype.setRequestHeader = function(header, value) {
        const meta = _xhrMeta.get(this);
        if (meta) meta.headers[header] = value;
        return _origXHRSetHeader.apply(this, arguments);
    };

    XMLHttpRequest.prototype.send = function(body) {
        const meta = _xhrMeta.get(this);
        if (meta) {
            _emit(meta.method, meta.url, meta.headers, body !== undefined ? body : null);
        }
        return _origXHRSend.apply(this, arguments);
    };

    // ── Install notice & disable function ──
    console.log(
        '%c🕵  cURL Logger installed.  Run disableCurlLogger() to remove the hooks.',
        'font-size:14px;font-weight:700;color:#4CAF50'
    );

    window.disableCurlLogger = function() {
        if (!window.__curlLoggerInstalled) return;
        window.fetch                     = _origFetch;
        XMLHttpRequest.prototype.open    = _origXHROpen;
        XMLHttpRequest.prototype.send    = _origXHRSend;
        XMLHttpRequest.prototype.setRequestHeader = _origXHRSetHeader;
        window.__curlLoggerInstalled     = false;
        console.log(
            '%c🕵  cURL Logger uninstalled.',
            'font-size:14px;font-weight:700;color:#FF5722'
        );
        delete window.disableCurlLogger;
    };
})();
