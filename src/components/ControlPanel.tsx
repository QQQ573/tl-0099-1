import { useRef } from 'react'
import { useFireworkStore } from '../store/useFireworkStore'
import { downloadPresetJson, importPresetFromJson } from '../utils/presetValidator'
import type { FireworkPreset } from '../types'

export default function ControlPanel() {
  const { isPaused, togglePause, isAutoLaunch, toggleAutoLaunch, clearFireworkInstances, preset, importPreset } = useFireworkStore()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExport = () => {
    downloadPresetJson(preset)
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      const { preset: imported, validation } = importPresetFromJson(text)
      if (validation.valid && imported) {
        importPreset(imported as FireworkPreset)
      } else {
        alert(`Import failed:\n${validation.errors.join('\n')}`)
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <div className="absolute top-4 left-4 z-20 flex gap-2">
      <button
        onClick={togglePause}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-sm transition-all duration-200
          ${isPaused
            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30'
            : 'bg-amber-500/20 text-amber-400 border border-amber-500/40 hover:bg-amber-500/30'
          }`}
      >
        {isPaused ? (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3" /></svg>
            Resume
          </>
        ) : (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
            Pause
          </>
        )}
      </button>

      <button
        onClick={clearFireworkInstances}
        className="flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-sm
          bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30 transition-all duration-200"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M8 6V4h8v2M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6" /></svg>
        Clear
      </button>

      <button
        onClick={toggleAutoLaunch}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-sm transition-all duration-200
          ${isAutoLaunch
            ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40 hover:bg-orange-500/30'
            : 'bg-gray-500/20 text-gray-400 border border-gray-500/40 hover:bg-gray-500/30'
          }`}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></svg>
        Auto
      </button>

      <button
        onClick={handleExport}
        className="flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-sm
          bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 hover:bg-cyan-500/30 transition-all duration-200"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg>
        Export
      </button>

      <button
        onClick={handleImportClick}
        className="flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-sm
          bg-violet-500/20 text-violet-400 border border-violet-500/40 hover:bg-violet-500/30 transition-all duration-200"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" /></svg>
        Import
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleImport}
        className="hidden"
      />
    </div>
  )
}
