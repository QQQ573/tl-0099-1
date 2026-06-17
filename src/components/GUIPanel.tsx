import { useState } from 'react'
import { useFireworkStore } from '../store/useFireworkStore'
import type { EasingType, FireworkPreset } from '../types'
import { BURST_COUNT_MIN, BURST_COUNT_MAX, EASING_OPTIONS, ALL_PRESETS } from '../types'
import { EASING_LABELS } from '../engine/EasingCurves'

interface SliderProps {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (v: number) => void
  unit?: string
}

function Slider({ label, value, min, max, step, onChange, unit = '' }: SliderProps) {
  return (
    <div className="mb-3">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-gray-400 font-mono">{label}</span>
        <span className="text-xs text-cyan-400 font-mono">
          {value.toFixed(step < 1 ? 1 : 0)}{unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer
          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3
          [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-400
          [&::-webkit-slider-thumb]:shadow-[0_0_6px_rgba(0,255,255,0.5)]"
      />
    </div>
  )
}

interface EasingSelectProps {
  label: string
  value: EasingType
  onChange: (v: EasingType) => void
}

function EasingSelect({ label, value, onChange }: EasingSelectProps) {
  return (
    <div className="mb-3">
      <span className="text-xs text-gray-400 font-mono block mb-1">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as EasingType)}
        className="w-full bg-gray-800/80 text-cyan-400 text-xs font-mono rounded px-2 py-1.5
          border border-gray-700/50 focus:border-cyan-500/50 focus:outline-none"
      >
        {EASING_OPTIONS.map((opt) => (
          <option key={opt} value={opt}>
            {EASING_LABELS[opt]}
          </option>
        ))}
      </select>
    </div>
  )
}

function ColorInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <span className="text-xs text-gray-400 font-mono w-12">{label}</span>
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-8 h-6 rounded border border-gray-700/50 cursor-pointer bg-transparent"
      />
      <span className="text-xs text-gray-500 font-mono">{value}</span>
    </div>
  )
}

interface SectionProps {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}

function Section({ title, children, defaultOpen = true }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border border-gray-700/30 rounded-lg mb-3 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2 bg-gray-800/40 hover:bg-gray-800/60 transition-colors"
      >
        <span className="text-xs font-mono text-gray-300 uppercase tracking-wider">{title}</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && <div className="px-3 py-2">{children}</div>}
    </div>
  )
}

export default function GUIPanel() {
  const { preset, updatePreset, showGUI, toggleGUI } = useFireworkStore()

  const updateLaunch = (key: keyof FireworkPreset['launch'], value: number) => {
    updatePreset({ launch: { ...preset.launch, [key]: value } })
  }

  const updateBurst = (key: keyof FireworkPreset['burst'], value: number) => {
    updatePreset({ burst: { ...preset.burst, [key]: value } })
  }

  const updateColor = (index: number, value: string) => {
    const newGradient: [string, string, string] = [...preset.color.gradient]
    newGradient[index] = value
    updatePreset({ color: { ...preset.color, gradient: newGradient } })
  }

  const updateEasing = (key: keyof FireworkPreset['easing'], value: EasingType) => {
    updatePreset({ easing: { ...preset.easing, [key]: value } })
  }

  const handlePresetSelect = (name: string) => {
    const found = ALL_PRESETS.find((p) => p.name === name)
    if (found) {
      updatePreset(found)
    }
  }

  if (!showGUI) {
    return (
      <button
        onClick={toggleGUI}
        className="absolute right-4 top-4 z-30 p-2 rounded-lg bg-gray-800/60 border border-gray-700/50
          text-gray-400 hover:text-cyan-400 hover:border-cyan-500/50 transition-all"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.73V20a2 2 0 002 2h.44a2 2 0 002-2v-.18a2 2 0 011-1.73l.43-.25a2 2 0 012 0l.15.08a2 2 0 002.73-.73l.22-.39a2 2 0 00-.73-2.73l-.15-.08a2 2 0 01-1-1.74v-.5a2 2 0 011-1.74l.15-.09a2 2 0 00.73-2.73l-.22-.38a2 2 0 00-2.73-.73l-.15.08a2 2 0 01-2 0l-.43-.25a2 2 0 01-1-1.73V4a2 2 0 00-2-2z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </button>
    )
  }

  return (
    <div className="absolute right-0 top-0 bottom-0 z-20 w-72 bg-gray-900/85 backdrop-blur-md
      border-l border-gray-700/30 overflow-y-auto scrollbar-thin">
      <div className="p-3">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-mono text-cyan-400 tracking-wider uppercase">Parameters</h2>
          <button
            onClick={toggleGUI}
            className="p-1 rounded hover:bg-gray-700/50 text-gray-500 hover:text-gray-300 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <Section title="Preset">
          <select
            value={preset.name}
            onChange={(e) => handlePresetSelect(e.target.value)}
            className="w-full bg-gray-800/80 text-cyan-400 text-xs font-mono rounded px-2 py-1.5
              border border-gray-700/50 focus:border-cyan-500/50 focus:outline-none mb-2"
          >
            {ALL_PRESETS.map((p) => (
              <option key={p.name} value={p.name}>
                {p.name}
              </option>
            ))}
          </select>
          <div className="text-xs text-gray-500 font-mono">{preset.name} v{preset.version}</div>
        </Section>

        <Section title="Launch">
          <Slider
            label="Burst Count"
            value={preset.launch.burstCount}
            min={BURST_COUNT_MIN}
            max={BURST_COUNT_MAX}
            step={10}
            onChange={(v) => updateLaunch('burstCount', v)}
          />
          <Slider
            label="Launch Height"
            value={preset.launch.launchHeight}
            min={2}
            max={30}
            step={0.5}
            onChange={(v) => updateLaunch('launchHeight', v)}
            unit="m"
          />
          <Slider
            label="Launch Duration"
            value={preset.launch.launchDuration}
            min={0.3}
            max={4}
            step={0.1}
            onChange={(v) => updateLaunch('launchDuration', v)}
            unit="s"
          />
          <Slider
            label="Launch Interval"
            value={preset.launch.launchInterval}
            min={0.1}
            max={3}
            step={0.1}
            onChange={(v) => updateLaunch('launchInterval', v)}
            unit="s"
          />
        </Section>

        <Section title="Burst">
          <Slider
            label="Radius"
            value={preset.burst.radius}
            min={1}
            max={15}
            step={0.5}
            onChange={(v) => updateBurst('radius', v)}
            unit="m"
          />
          <Slider
            label="Duration"
            value={preset.burst.duration}
            min={0.5}
            max={5}
            step={0.1}
            onChange={(v) => updateBurst('duration', v)}
            unit="s"
          />
          <Slider
            label="Trail Length"
            value={preset.burst.trailLength}
            min={0}
            max={20}
            step={1}
            onChange={(v) => updateBurst('trailLength', v)}
          />
          <Slider
            label="Gravity"
            value={preset.burst.gravity}
            min={0}
            max={3}
            step={0.05}
            onChange={(v) => updateBurst('gravity', v)}
            unit="g"
          />
        </Section>

        <Section title="Color">
          <ColorInput label="Start" value={preset.color.gradient[0]} onChange={(v) => updateColor(0, v)} />
          <ColorInput label="Mid" value={preset.color.gradient[1]} onChange={(v) => updateColor(1, v)} />
          <ColorInput label="End" value={preset.color.gradient[2]} onChange={(v) => updateColor(2, v)} />
          <Slider
            label="Hue Variation"
            value={preset.color.hueVariation}
            min={0}
            max={1}
            step={0.01}
            onChange={(v) => updatePreset({ color: { ...preset.color, hueVariation: v } })}
          />
        </Section>

        <Section title="Easing">
          <EasingSelect label="Launch Ease" value={preset.easing.launchEase} onChange={(v) => updateEasing('launchEase', v)} />
          <EasingSelect label="Burst Ease" value={preset.easing.burstEase} onChange={(v) => updateEasing('burstEase', v)} />
          <EasingSelect label="Fade Ease" value={preset.easing.fadeEase} onChange={(v) => updateEasing('fadeEase', v)} />
        </Section>

        <div className="mt-4 p-2 rounded-lg bg-gray-800/30 border border-gray-700/20">
          <p className="text-xs text-gray-500 font-mono leading-relaxed">
            Click the 3D scene to launch fireworks. Pause to inspect particle velocity vectors.
          </p>
        </div>
      </div>
    </div>
  )
}
