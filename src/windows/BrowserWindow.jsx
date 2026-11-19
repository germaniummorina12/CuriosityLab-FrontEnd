import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, RotateCw, Home, AlertTriangle, Plus, X, Globe, Search } from 'lucide-react'
import { buttonXp, fieldInset, statusBar, sectionGroove } from '../styles/xpTheme'

const SEARCH_HOME = 'app:search'
const searchUrl = (q) => `app:search?q=${encodeURIComponent(q)}`

// A bare word or phrase ("cats", "best pizza near me") isn't a URL — only treat the address
// bar input as a URL if it actually looks like one (has a dot-separated host, no spaces).
const looksLikeUrl = (input) => /^(https?:\/\/)?[\w-]+(\.[\w-]+)+(:\d+)?(\/\S*)?$/i.test(input.trim())

const normalize = (url) => {
  const trimmed = url.trim()
  if (!trimmed) return trimmed
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
}

const tabLabel = (url) => {
  if (url === SEARCH_HOME) return 'New Tab'
  if (url.startsWith('app:search?')) return new URLSearchParams(url.split('?')[1]).get('q') ?? 'Search'
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

// These sites send X-Frame-Options/CSP headers that refuse to render inside an <iframe> at
// all — that's enforced by the browser before any JS here runs, so it can't be detected or
// worked around from this code. Listing the known offenders up front lets us show an
// authentic-looking "can't display this page" screen instead of a permanently blank frame.
const FRAME_BLOCKED_HOSTS = [
  'google.com',
  'bing.com',
  'duckduckgo.com',
  'youtube.com',
  'facebook.com',
  'twitter.com',
  'x.com',
  'instagram.com',
  'linkedin.com',
  'amazon.com',
  'microsoft.com',
]

const isFrameBlocked = (url) => {
  try {
    const host = new URL(url).hostname.replace(/^www\./, '')
    return FRAME_BLOCKED_HOSTS.some((h) => host === h || host.endsWith(`.${h}`))
  } catch {
    return false
  }
}

function BlockedPage({ url, browser, onRetry }) {
  const host = tabLabel(url)

  if (browser === 'chrome') {
    return (
      <div className="w-full h-full flex items-center justify-center bg-white px-10">
        <div className="max-w-[420px] text-[#202124]">
          <div className="text-[52px] mb-4">😕</div>
          <p className="text-[15px] mb-3">
            <span className="font-medium">{host}</span> refused to connect.
          </p>
          <p className="text-[13px] text-[#5f6368] mb-4">
            ERR_BLOCKED_BY_RESPONSE — this site sets security headers (X-Frame-Options / CSP)
            that block it from being shown inside another page, so it won't load in this
            simulated browser window.
          </p>
          <button className="text-[13px] text-[#1a73e8] hover:underline" onClick={onRetry}>
            Reload
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full bg-white px-8 py-6 text-[#111] text-[13px] leading-[1.6]">
      <div className="flex items-start gap-3 mb-3">
        <AlertTriangle size={36} className="text-[#d33b1f] shrink-0 mt-1" />
        <div>
          <p className="font-bold text-[14px] mb-1">The page cannot be displayed</p>
          <p>
            The page you are looking for is currently unavailable. The web site might be
            experiencing technical difficulties, or you may need to adjust your browser
            settings.
          </p>
        </div>
      </div>
      <p className="font-bold mb-1">Please try the following:</p>
      <ul className="list-disc ml-9 mb-3 space-y-0.5">
        <li>
          <span className="font-bold">{host}</span> does not allow its pages to be opened
          inside another frame or window (X-Frame-Options). This is the site's own setting,
          not an error in this browser.
        </li>
        <li>Click the Refresh button, or try again later.</li>
      </ul>
      <button className={buttonXp} onClick={onRetry}>
        Refresh
      </button>
    </div>
  )
}

function SearchHomePage({ browser, onSearch }) {
  const [q, setQ] = useState('')
  const title = browser === 'chrome' ? 'Google' : 'Search the web'

  return (
    <div className="w-full h-full flex items-center justify-center bg-white px-10">
      <form
        className="w-full max-w-[480px] flex flex-col items-center gap-4"
        onSubmit={(e) => {
          e.preventDefault()
          if (q.trim()) onSearch(q.trim())
        }}
      >
        <p className="text-[26px] font-semibold text-[#1a1a2e] tracking-tight">{title}</p>
        <div className="w-full flex items-center gap-2">
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search Wikipedia…"
            className={`${fieldInset} flex-1 py-2`}
          />
          <button type="submit" className={buttonXp}>
            <Search size={14} />
          </button>
        </div>
        <p className="text-[11px] text-[#777] text-center">
          Results come from Wikipedia's public search API — real queries, real articles.
        </p>
      </form>
    </div>
  )
}

function SearchResultsPage({ url, onOpen }) {
  const query = useMemo(() => new URLSearchParams(url.split('?')[1]).get('q') ?? '', [url])
  const [state, setState] = useState({ status: 'loading', results: [] })

  useEffect(() => {
    let cancelled = false
    setState({ status: 'loading', results: [] })
    const endpoint = `https://en.wikipedia.org/w/api.php?action=opensearch&format=json&origin=*&limit=8&search=${encodeURIComponent(query)}`
    fetch(endpoint)
      .then((res) => res.json())
      .then(([, titles, descriptions, urls]) => {
        if (cancelled) return
        const results = titles.map((title, i) => ({ title, description: descriptions[i], url: urls[i] }))
        setState({ status: results.length ? 'ready' : 'empty', results })
      })
      .catch(() => {
        if (!cancelled) setState({ status: 'error', results: [] })
      })
    return () => {
      cancelled = true
    }
  }, [query])

  return (
    <div className="w-full h-full overflow-auto bg-white px-6 py-4">
      <p className="text-[12px] text-[#555] mb-3">
        Results for <span className="font-bold text-[#111]">{query}</span>
      </p>
      {state.status === 'loading' ? <p className="text-[13px] text-[#777]">Searching…</p> : null}
      {state.status === 'error' ? (
        <p className="text-[13px] text-[#8a1a1a]">Could not reach the search service. Check your connection.</p>
      ) : null}
      {state.status === 'empty' ? <p className="text-[13px] text-[#777]">No results found.</p> : null}
      {state.status === 'ready' ? (
        <div className={`${sectionGroove} divide-y divide-[#e3e1d6]`}>
          {state.results.map((r) => (
            <button
              key={r.url}
              onClick={() => onOpen(r.url)}
              className="w-full text-left px-3 py-2.5 hover:bg-[#f0f4fb]"
            >
              <div className="text-[13px] text-[#1a0dab] hover:underline">{r.title}</div>
              <div className="text-[11px] text-[#1a7a2e]">{r.url}</div>
              {r.description ? <div className="text-[12px] text-[#444] mt-0.5">{r.description}</div> : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}

const makeTab = (id, url) => ({ id, history: [url], index: 0, address: '', reloadKey: 0 })

export default function BrowserWindow({ homeUrl = SEARCH_HOME, browser = 'ie' }) {
  const idRef = useRef(1)
  const [tabs, setTabs] = useState(() => [makeTab(idRef.current, homeUrl)])
  const [activeId, setActiveId] = useState(1)

  const activeTab = tabs.find((t) => t.id === activeId) ?? tabs[0]
  const loadedUrl = activeTab.history[activeTab.index]
  const isAppUrl = loadedUrl.startsWith('app:')
  const blocked = useMemo(() => (isAppUrl ? false : isFrameBlocked(loadedUrl)), [loadedUrl, isAppUrl])

  const updateTab = (id, updater) =>
    setTabs((prev) => prev.map((t) => (t.id === id ? updater(t) : t)))

  const navigate = (url, id = activeId) => {
    const target = url.startsWith('app:') ? url : normalize(url)
    if (!target) return
    updateTab(id, (t) => {
      const next = t.history.slice(0, t.index + 1).concat(target)
      return { ...t, history: next, index: next.length - 1, address: target.startsWith('app:') ? '' : target }
    })
  }

  const submitAddress = (input) => {
    const trimmed = input.trim()
    if (!trimmed) return
    navigate(looksLikeUrl(trimmed) ? trimmed : searchUrl(trimmed))
  }

  const goBack = () =>
    updateTab(activeId, (t) => {
      if (t.index === 0) return t
      const url = t.history[t.index - 1]
      return { ...t, index: t.index - 1, address: url.startsWith('app:') ? '' : url }
    })

  const goForward = () =>
    updateTab(activeId, (t) => {
      if (t.index === t.history.length - 1) return t
      const url = t.history[t.index + 1]
      return { ...t, index: t.index + 1, address: url.startsWith('app:') ? '' : url }
    })

  const goHome = () => navigate(homeUrl)
  const refresh = () => updateTab(activeId, (t) => ({ ...t, reloadKey: t.reloadKey + 1 }))
  const setAddress = (value) => updateTab(activeId, (t) => ({ ...t, address: value }))

  const newTab = () => {
    const id = ++idRef.current
    setTabs((prev) => [...prev, makeTab(id, homeUrl)])
    setActiveId(id)
  }

  const closeTab = (id) => {
    setTabs((prev) => {
      const next = prev.filter((t) => t.id !== id)
      if (next.length === 0) {
        const freshId = ++idRef.current
        const fresh = makeTab(freshId, homeUrl)
        setActiveId(freshId)
        return [fresh]
      }
      if (id === activeId) setActiveId(next[next.length - 1].id)
      return next
    })
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col gap-2">
      <div className="flex items-center gap-0.5">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveId(t.id)}
            className={`flex items-center gap-1.5 max-w-[150px] px-2.5 py-1 rounded-t-[4px] text-[12px] truncate border ${
              t.id === activeId
                ? 'bg-white border-[#8a9aad] border-b-white text-[#111] relative -mb-px'
                : 'bg-[#d8dde3] border-[#aab4c2] text-[#444] hover:bg-[#e4e9f0]'
            }`}
          >
            <Globe size={12} className="shrink-0" />
            <span className="truncate">{tabLabel(t.history[t.index])}</span>
            {tabs.length > 1 ? (
              <span
                role="button"
                onClick={(e) => {
                  e.stopPropagation()
                  closeTab(t.id)
                }}
                className="hover:bg-black/10 rounded-[2px] p-0.5"
              >
                <X size={11} />
              </span>
            ) : null}
          </button>
        ))}
        <button onClick={newTab} title="New Tab" className={`${buttonXp} px-1.5 py-0.5`}>
          <Plus size={12} />
        </button>
      </div>

      <div className="flex items-center gap-1.5">
        <button className={buttonXp} onClick={goBack} disabled={activeTab.index === 0} title="Back">
          <ArrowLeft size={14} />
        </button>
        <button
          className={buttonXp}
          onClick={goForward}
          disabled={activeTab.index === activeTab.history.length - 1}
          title="Forward"
        >
          <ArrowRight size={14} />
        </button>
        <button className={buttonXp} onClick={refresh} title="Refresh">
          <RotateCw size={14} />
        </button>
        <button className={buttonXp} onClick={goHome} title="Home">
          <Home size={14} />
        </button>
        <input
          className={`${fieldInset} flex-1`}
          value={activeTab.address}
          placeholder="Type a web address, or search…"
          onChange={(e) => setAddress(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submitAddress(activeTab.address)
          }}
        />
        <button className={buttonXp} onClick={() => submitAddress(activeTab.address)}>
          Go
        </button>
      </div>

      <div className="flex-1 min-h-0 bg-white border border-[#8a9aad] overflow-hidden">
        {loadedUrl === SEARCH_HOME ? (
          <SearchHomePage browser={browser} onSearch={(q) => navigate(searchUrl(q))} />
        ) : loadedUrl.startsWith('app:search?') ? (
          <SearchResultsPage url={loadedUrl} onOpen={(u) => navigate(u)} />
        ) : blocked ? (
          <BlockedPage url={loadedUrl} browser={browser} onRetry={refresh} />
        ) : (
          <iframe
            key={`${activeTab.id}-${loadedUrl}-${activeTab.reloadKey}`}
            src={loadedUrl}
            title="browser-frame"
            className="w-full h-full border-0"
            referrerPolicy="no-referrer"
          />
        )}
      </div>

      <div className={statusBar}>
        {isAppUrl ? 'Done' : blocked ? 'Done, with errors on page.' : `${loadedUrl} — Done`}
      </div>
    </div>
  )
}
