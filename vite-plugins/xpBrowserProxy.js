import http from 'node:http'

// Dev-only same-origin proxy for the simulated IE/Chrome windows (BrowserWindow.jsx).
// It exists so a navigated page's HTML can be fetched and rewritten (to neutralize
// target="_blank" links and window.open) server-side, instead of relying on a third-party
// CORS-proxy service that would see all the simulated browser's traffic. Runs only inside
// `vite dev`; there is no production equivalent, since a static build has no server to host it.
//
// It listens on its OWN port, separate from the main Vite dev server, and the embedded iframe
// is pointed at it directly via `src` (not `srcdoc`). That matters: with no `allow-same-origin`,
// a sandboxed `srcdoc` frame gets a fresh opaque origin every load, and real sites' own scripts
// that touch localStorage/sessionStorage (extremely common) throw a SecurityError there and
// crash before finishing their own render — which was silently hiding Bing's real search
// results even though the fetched HTML had them. Giving the proxy a real, stable origin of its
// own lets `allow-same-origin` be used safely: the embedded page's scripts get working storage,
// while the browser's actual Same-Origin Policy still blocks it from ever reaching into this
// app's window/DOM, since the app and the proxy are genuinely different origins (different
// ports). The trade-off: every proxied site shares one localStorage (keyed by the proxy's own
// origin, not the real site's), so cross-site storage isn't isolated — a cosmetic quirk, not a
// safety issue, and not something a simulated-desktop toy needs to solve.
const PROXY_PORT = 57671

function isPrivateHost(hostname) {
  const h = hostname.toLowerCase()
  if (h === 'localhost' || h === '::1' || h === '0.0.0.0') return true
  if (h.startsWith('127.')) return true
  if (h.startsWith('10.')) return true
  if (h.startsWith('192.168.')) return true
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(h)) return true
  if (h.startsWith('169.254.')) return true
  return false
}

function errorPage(message) {
  return `<!doctype html><html><head><meta charset="utf-8"></head><body style="font:13px sans-serif;padding:24px;color:#333">
    <p><strong>This page can't be reached through the simulated browser.</strong></p>
    <p>${message}</p>
  </body></html>`
}

// A real `<iframe src="https://...">` can never have `target="_blank"` links redirected into
// itself (cross-origin content can't be read/rewritten from outside), so instead the fetched
// HTML is rewritten here before being served: blank-target links are stripped and every
// click/`window.open` is caught and relayed to BrowserWindow.jsx via `postMessage`, which drives
// its own tab/history state instead of letting the browser spawn a real new tab.
function rewriteHtmlForEmbedding(html, baseUrl) {
  const escapedBase = baseUrl.replace(/"/g, '&quot;')
  const injected = `<base href="${escapedBase}"><script>(function(){
    var __baseUrl = ${JSON.stringify(baseUrl)};
    function stripFragment(u) { return u.split('#')[0] }
    document.addEventListener('click', function(e) {
      var a = e.target && e.target.closest ? e.target.closest('a[href]') : null
      if (!a || !a.href || a.href.indexOf('javascript:') === 0) return
      if (a.href.indexOf('#') !== -1 && stripFragment(a.href) === stripFragment(__baseUrl)) return
      e.preventDefault()
      try { parent.postMessage({ type: 'xp-browser-navigate', url: a.href }, '*') } catch (err) {}
    }, true)
    window.open = function(url) {
      try {
        if (url) parent.postMessage({ type: 'xp-browser-navigate', url: new URL(url, __baseUrl).href }, '*')
      } catch (err) {}
      return null
    }
  })();</script>`
  const withoutBlankTargets = html.replace(/\s(target)\s*=\s*(["'])_(blank|new)\2/gi, '')
  if (/<head[^>]*>/i.test(withoutBlankTargets)) {
    return withoutBlankTargets.replace(/<head([^>]*)>/i, `<head$1>${injected}`)
  }
  if (/<html[^>]*>/i.test(withoutBlankTargets)) {
    return withoutBlankTargets.replace(/<html([^>]*)>/i, `<html$1><head>${injected}</head>`)
  }
  return `${injected}${withoutBlankTargets}`
}

function startProxyServer() {
  const server = http.createServer(async (req, res) => {
    let target
    try {
      const requested = new URL(req.url, `http://localhost:${PROXY_PORT}`).searchParams.get('url')
      target = new URL(requested)
    } catch {
      res.statusCode = 400
      res.setHeader('Content-Type', 'text/html')
      res.end(errorPage('Missing or invalid url parameter.'))
      return
    }

    if (!/^https?:$/.test(target.protocol) || isPrivateHost(target.hostname)) {
      res.statusCode = 400
      res.setHeader('Content-Type', 'text/html')
      res.end(errorPage('That host is blocked by the dev proxy.'))
      return
    }

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000)
    try {
      const upstream = await fetch(target.href, {
        redirect: 'follow',
        signal: controller.signal,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 5.1) AppleWebKit/537.36 (KHTML, like Gecko) XP-Sim-Browser/1.0',
          Accept: 'text/html,application/xhtml+xml,*/*;q=0.8',
        },
      })
      const contentType = upstream.headers.get('content-type') || 'text/plain'
      res.statusCode = upstream.status

      if (!contentType.includes('text/html')) {
        res.setHeader('Content-Type', contentType)
        const buf = Buffer.from(await upstream.arrayBuffer())
        res.end(buf)
        return
      }

      const html = await upstream.text()
      res.setHeader('Content-Type', 'text/html; charset=utf-8')
      res.end(rewriteHtmlForEmbedding(html, upstream.url))
    } catch (err) {
      res.statusCode = 502
      res.setHeader('Content-Type', 'text/html')
      res.end(errorPage(err?.message || 'unknown proxy error'))
    } finally {
      clearTimeout(timeout)
    }
  })
  server.listen(PROXY_PORT)
  server.on('error', (err) => {
    console.error(`[xp-browser-proxy] failed to start on port ${PROXY_PORT}:`, err.message)
  })
  return server
}

export default function xpBrowserProxy() {
  return {
    name: 'xp-browser-proxy',
    configureServer(server) {
      const proxyServer = startProxyServer()
      server.httpServer?.once('close', () => proxyServer.close())
    },
  }
}
