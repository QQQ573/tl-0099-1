import SceneCanvas from '@/components/SceneCanvas'
import ControlPanel from '@/components/ControlPanel'
import GUIPanel from '@/components/GUIPanel'
import { useFireworkStore } from '@/store/useFireworkStore'

export default function Home() {
  const { isPaused, selectedParticle } = useFireworkStore()

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#0a0a1a]">
      <SceneCanvas />

      <ControlPanel />
      <GUIPanel />

      {isPaused && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20
          px-4 py-2 rounded-lg bg-amber-500/20 border border-amber-500/40
          text-amber-400 text-xs font-mono animate-pulse">
          ⏸ PAUSED — Click a particle to inspect velocity
        </div>
      )}

      {selectedParticle && isPaused && (
        <div className="absolute bottom-4 left-4 z-20
          px-4 py-3 rounded-lg bg-gray-900/85 backdrop-blur-md border border-emerald-500/30
          font-mono text-xs max-w-xs">
          <div className="text-emerald-400 mb-2 text-xs uppercase tracking-wider">Particle Info</div>
          <div className="text-gray-400 space-y-1">
            <div>Pos: <span className="text-cyan-400">({selectedParticle.position.x.toFixed(2)}, {selectedParticle.position.y.toFixed(2)}, {selectedParticle.position.z.toFixed(2)})</span></div>
            <div>Vel: <span className="text-emerald-400">({selectedParticle.velocity.x.toFixed(2)}, {selectedParticle.velocity.y.toFixed(2)}, {selectedParticle.velocity.z.toFixed(2)})</span></div>
            <div>Speed: <span className="text-amber-400">{selectedParticle.velocity.length().toFixed(2)} m/s</span></div>
            <div>Age: <span className="text-gray-300">{selectedParticle.age.toFixed(2)} / {selectedParticle.maxAge.toFixed(2)}s</span></div>
            <div>Phase: <span className="text-violet-400">{selectedParticle.phase}</span></div>
            <div>Alpha: <span className="text-gray-300">{selectedParticle.alpha.toFixed(2)}</span></div>
          </div>
        </div>
      )}

      <div className="absolute bottom-4 right-4 z-10
        px-3 py-1.5 rounded bg-gray-800/40 border border-gray-700/20
        text-gray-600 text-[10px] font-mono">
        Click scene to launch fireworks
      </div>
    </div>
  )
}
