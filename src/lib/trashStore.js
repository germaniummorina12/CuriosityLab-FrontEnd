// A client-side "Recycle Bin" registry. The real backend has no endpoint to list deleted
// items (only restore-user by id), so there is nothing for the Recycle Bin window to query.
// Instead, whatever in this app actually deletes something (currently: UserProfileWindow's
// Delete button) records a real entry here, backed by localStorage so it survives a reload.
// Restoring an item still calls the real restore-user endpoint — only the *listing* is local.
const STORAGE_KEY = 'xp-recycle-bin'
const listeners = new Set()

function read() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    return Array.isArray(raw) ? raw : []
  } catch {
    return []
  }
}

function write(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  listeners.forEach((fn) => fn(items))
}

export const trashStore = {
  list: () => read(),
  add(entry) {
    const items = read().filter((i) => !(i.id === entry.id && i.sourceKind === entry.sourceKind))
    write([...items, entry])
  },
  removeEntry(id, sourceKind) {
    write(read().filter((i) => !(i.id === id && i.sourceKind === sourceKind)))
  },
  clear() {
    write([])
  },
  subscribe(fn) {
    listeners.add(fn)
    return () => listeners.delete(fn)
  },
}
