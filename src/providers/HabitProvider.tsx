import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { toBackup } from '../lib/backup'
import { DEFAULT_SETTINGS, deleteHabit, loadAll, openHabitDb, putHabit, replaceAll, saveSettings, setCompletion, type HabitDb } from '../lib/db'
import { toDateKey } from '../lib/date'
import { makeDemo } from '../lib/demo'
import type { Completion, DateKey, Habit, Settings } from '../types'
import { HabitsContext, type HabitsApi } from './habits'

interface Data {
  ready: boolean
  habits: Habit[]
  completions: Map<string, Set<DateKey>>
  settings: Settings
}

const EMPTY: Data = { ready: false, habits: [], completions: new Map(), settings: DEFAULT_SETTINGS }
const SEEDED_KEY = 'habitgrid-seeded'

function toMap(completions: readonly Completion[]): Map<string, Set<DateKey>> {
  const map = new Map<string, Set<DateKey>>()
  for (const c of completions) {
    const days = map.get(c.habitId) ?? new Set<DateKey>()
    days.add(c.date)
    map.set(c.habitId, days)
  }
  return map
}

function toList(completions: ReadonlyMap<string, ReadonlySet<DateKey>>): Completion[] {
  return [...completions].flatMap(([habitId, days]) => [...days].map((date) => ({ habitId, date })))
}

// A flag in localStorage records that the demo year was added once, so deleting every habit later does not bring it back.
function wasSeeded(): boolean {
  try {
    return localStorage.getItem(SEEDED_KEY) === '1'
  } catch {
    return false
  }
}

function markSeeded(): void {
  try {
    localStorage.setItem(SEEDED_KEY, '1')
  } catch {
    // ignore: worst case the demo is offered again on an empty database
  }
}

/** Holds habits, check-ins and settings in memory for instant rendering, and writes every change to IndexedDB. */
export function HabitProvider({ children }: { children: ReactNode }) {
  const dbRef = useRef<HabitDb | null>(null)
  const [data, setData] = useState<Data>(EMPTY)
  const [today, setToday] = useState<DateKey>(() => toDateKey(new Date()))
  const [persistent, setPersistent] = useState(true)
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const db = await openHabitDb()
        dbRef.current = db
        let stored = await loadAll(db)
        if (stored.habits.length === 0 && !wasSeeded()) {
          stored = { ...stored, ...makeDemo(toDateKey(new Date())) }
          await replaceAll(db, stored)
          markSeeded()
        }
        if (!cancelled) setData({ ready: true, habits: stored.habits, completions: toMap(stored.completions), settings: stored.settings })
      } catch {
        // Storage is blocked (some private modes): run from memory with the demo so the app is still usable.
        const demo = makeDemo(toDateKey(new Date()))
        if (!cancelled) {
          setPersistent(false)
          setData({ ready: true, habits: demo.habits, completions: toMap(demo.completions), settings: DEFAULT_SETTINGS })
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  // Move "today" on at midnight, and re-check when the app comes back to the foreground after a long time away.
  useEffect(() => {
    const refresh = () => setToday(toDateKey(new Date()))
    const untilMidnight = () => {
      const now = new Date()
      return new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime() - now.getTime() + 1000
    }
    let timer = window.setTimeout(function tick() {
      refresh()
      timer = window.setTimeout(tick, untilMidnight())
    }, untilMidnight())
    const onVisible = () => {
      if (document.visibilityState === 'visible') refresh()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      window.clearTimeout(timer)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [])

  const persist = useCallback((work: (db: HabitDb) => Promise<void>) => {
    const db = dbRef.current
    if (!db) return
    work(db).then(
      () => setSaveError(null),
      () => setSaveError('Your last change could not be saved on this device.'),
    )
  }, [])

  const api = useMemo<HabitsApi>(() => {
    const replace = (habits: Habit[], completions: Completion[], settings: Settings) => {
      setData({ ready: true, habits, completions: toMap(completions), settings })
      persist((db) => replaceAll(db, { habits, completions, settings }))
    }
    return {
      ready: data.ready,
      today,
      habits: data.habits,
      completions: data.completions,
      settings: data.settings,
      persistent,
      saveError,
      toggle: (habitId, date) => {
        const habit = data.habits.find((h) => h.id === habitId)
        if (!habit || date > today) return
        const done = !(data.completions.get(habitId)?.has(date) ?? false)
        // Ticking a day before the habit's start date moves the start back, so the history stays consistent.
        const earlier = done && date < habit.createdAt ? { ...habit, createdAt: date } : null
        setData((d) => {
          const days = new Set(d.completions.get(habitId))
          if (done) days.add(date)
          else days.delete(date)
          return { ...d, completions: new Map(d.completions).set(habitId, days), habits: earlier ? d.habits.map((h) => (h.id === habitId ? earlier : h)) : d.habits }
        })
        persist((db) => setCompletion(db, habitId, date, done))
        if (earlier) persist((db) => putHabit(db, earlier))
      },
      addHabit: (input) => {
        const habit: Habit = { id: crypto.randomUUID(), name: input.name.trim(), category: input.category.trim(), color: input.color, createdAt: today, archivedAt: null }
        setData((d) => ({ ...d, habits: [...d.habits, habit] }))
        persist((db) => putHabit(db, habit))
      },
      updateHabit: (id, input) => {
        const habit = data.habits.find((h) => h.id === id)
        if (!habit) return
        const updated: Habit = { ...habit, name: input.name.trim(), category: input.category.trim(), color: input.color }
        setData((d) => ({ ...d, habits: d.habits.map((h) => (h.id === id ? updated : h)) }))
        persist((db) => putHabit(db, updated))
      },
      setArchived: (id, archived) => {
        const habit = data.habits.find((h) => h.id === id)
        if (!habit) return
        const updated: Habit = { ...habit, archivedAt: archived ? today : null }
        setData((d) => ({ ...d, habits: d.habits.map((h) => (h.id === id ? updated : h)) }))
        persist((db) => putHabit(db, updated))
      },
      removeHabit: (id) => {
        setData((d) => {
          const completions = new Map(d.completions)
          completions.delete(id)
          return { ...d, habits: d.habits.filter((h) => h.id !== id), completions }
        })
        persist((db) => deleteHabit(db, id))
      },
      updateSettings: (patch) => {
        const settings = { ...data.settings, ...patch }
        setData((d) => ({ ...d, settings }))
        persist((db) => saveSettings(db, settings))
      },
      exportData: () => toBackup(data.habits, toList(data.completions), data.settings),
      importData: (backup) => replace(backup.habits, backup.completions, backup.settings),
      loadDemo: () => {
        const demo = makeDemo(today)
        replace(demo.habits, demo.completions, data.settings)
      },
      clearAll: () => replace([], [], data.settings),
    }
  }, [data, today, persistent, saveError, persist])

  return <HabitsContext.Provider value={api}>{children}</HabitsContext.Provider>
}
