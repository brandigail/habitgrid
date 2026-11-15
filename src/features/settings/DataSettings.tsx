import { Download, Upload } from 'lucide-react'
import { useRef, useState, type ChangeEvent } from 'react'
import { cardClass, dangerButton, errorText, mutedText, primaryButton, secondaryButton } from '../../components/ui'
import { parseBackup } from '../../lib/backup'
import { toDateKey } from '../../lib/date'
import { downloadJson } from '../../lib/download'
import { useHabits } from '../../providers/habits'
import type { BackupFile } from '../../types'

type Pending = { kind: 'import'; data: BackupFile } | { kind: 'demo' } | { kind: 'clear' }

export function DataSettings() {
  const { habits, completions, persistent, exportData, importData, loadDemo, clearAll } = useHabits()
  const [pending, setPending] = useState<Pending | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState<string | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)
  const checkIns = [...completions.values()].reduce((n, days) => n + days.size, 0)

  async function onFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setDone(null)
    const result = parseBackup(await file.text())
    if (result.ok) {
      setError(null)
      setPending({ kind: 'import', data: result.data })
    } else {
      setPending(null)
      setError(result.error)
    }
  }

  function confirm() {
    if (!pending) return
    if (pending.kind === 'import') {
      importData(pending.data)
      setDone(`Imported ${pending.data.habits.length} habits and ${pending.data.completions.length} check-ins.`)
    } else if (pending.kind === 'demo') {
      loadDemo()
      setDone('Loaded a year of demo data.')
    } else {
      clearAll()
      setDone('Everything was deleted.')
    }
    setPending(null)
  }

  const question =
    pending?.kind === 'import'
      ? `Replace your ${habits.length} habits and ${checkIns} check-ins with ${pending.data.habits.length} habits and ${pending.data.completions.length} check-ins from the file?`
      : pending?.kind === 'demo'
        ? 'This replaces your habits and history with a year of demo data. Export first if you want to keep yours.'
        : 'This deletes every habit and check-in on this device. This cannot be undone.'

  return (
    <section className={`${cardClass} space-y-4 p-4`} aria-labelledby="data-heading">
      <h2 id="data-heading" className="text-lg font-semibold">
        Your data
      </h2>
      <p className={`text-sm ${mutedText}`}>
        Everything lives on this device, in your browser. {persistent ? 'Export a backup now and then, especially before clearing browser data.' : 'Your browser is blocking storage, so changes will be lost when you close the page.'}
      </p>
      <div className="flex flex-wrap gap-2">
        <button type="button" className={secondaryButton} onClick={() => downloadJson(`habitgrid-backup-${toDateKey(new Date())}.json`, exportData())}>
          <Download className="size-4" aria-hidden /> Export backup
        </button>
        <button type="button" className={secondaryButton} onClick={() => fileInput.current?.click()}>
          <Upload className="size-4" aria-hidden /> Import backup
        </button>
        <input ref={fileInput} type="file" accept="application/json,.json" className="hidden" aria-label="Choose a backup file" onChange={(e) => void onFile(e)} />
        <button type="button" className={secondaryButton} onClick={() => setPending({ kind: 'demo' })}>
          Load demo year
        </button>
        <button type="button" className={secondaryButton} onClick={() => setPending({ kind: 'clear' })}>
          Delete everything
        </button>
      </div>

      {pending && (
        <div role="alertdialog" aria-label="Confirm" className="space-y-3 rounded-xl border border-amber-300 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950/40">
          <p className="text-sm">{question}</p>
          <div className="flex gap-2">
            <button type="button" className={pending.kind === 'clear' ? dangerButton : primaryButton} onClick={confirm} autoFocus>
              {pending.kind === 'import' ? 'Replace my data' : pending.kind === 'demo' ? 'Load demo' : 'Delete everything'}
            </button>
            <button type="button" className={secondaryButton} onClick={() => setPending(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}
      {error && (
        <p role="alert" className={`text-sm ${errorText}`}>
          {error}
        </p>
      )}
      {done && (
        <p role="status" className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
          {done}
        </p>
      )}
    </section>
  )
}
