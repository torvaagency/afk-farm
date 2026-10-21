import { useEffect, useState } from "react"
import { FaSeedling } from "react-icons/fa"
import { PLANTS } from "./constants"
import type { FarmSlot } from "./useGameStore"
import { cn } from "@/lib/utils"

const formatRemaining = (seconds: number) => {
  if (seconds >= 3600) {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    return `${h}h ${String(m).padStart(2, "0")}m`
  }
  if (seconds >= 60) {
    const m = Math.floor(seconds / 60)
    return `${m}m ${String(seconds % 60).padStart(2, "0")}s`
  }
  return `${seconds}s`
}

interface Group {
  plantId: string
  growing: number
  ready: number
  soonestIndex: number
  remaining: number
  progress: number
}

interface GrowingPanelProps {
  slots: (FarmSlot | null)[]
  unlockedSlots: number
  isSpeedBoosted: boolean
  onSelectPlot: (index: number) => void
  className?: string
}

/**
 * Lists everything that is currently growing, grouped by crop. It owns its own
 * 1s clock so ticking never re-renders the rest of the app (or the 3D scene).
 */
export default function GrowingPanel({ slots, unlockedSlots, isSpeedBoosted, onSelectPlot, className }: GrowingPanelProps) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])

  const mult = isSpeedBoosted ? 2 : 1
  const byPlant = new Map<string, Group>()

  slots.slice(0, unlockedSlots).forEach((slot, index) => {
    if (!slot) return
    const plant = PLANTS[slot.plantId]
    if (!plant) return

    const group =
      byPlant.get(slot.plantId) ??
      ({ plantId: slot.plantId, growing: 0, ready: 0, soonestIndex: -1, remaining: Infinity, progress: 0 } satisfies Group)

    if (slot.isHarvestable) {
      group.ready += 1
    } else {
      const elapsed = ((now - slot.plantedAt) / 1000) * mult
      const remaining = Math.max(0, Math.ceil((plant.growTime - elapsed) / mult))
      group.growing += 1
      if (remaining < group.remaining) {
        group.remaining = remaining
        group.soonestIndex = index
        group.progress = Math.min(100, (elapsed / plant.growTime) * 100)
      }
    }
    byPlant.set(slot.plantId, group)
  })

  // Stable order (shop order) so rows never jump around while timers tick
  const groups = Object.keys(PLANTS)
    .map((id) => byPlant.get(id))
    .filter((g): g is Group => !!g)

  const totalGrowing = groups.reduce((n, g) => n + g.growing, 0)
  const totalReady = groups.reduce((n, g) => n + g.ready, 0)

  return (
    <section className={cn("panel flex min-h-0 flex-col", className)}>
      <div className="panel-head">
        <div className="panel-title">
          <FaSeedling size={12} /> Growing
        </div>
        <div className="flex items-center gap-1.5 text-[11px]">
          <span className="muted">{totalGrowing} growing</span>
          {totalReady > 0 && <span className="pill t-sky">{totalReady} ready</span>}
        </div>
      </div>

      <div className="min-h-[4rem] flex-1 overflow-y-auto p-2">
        {groups.length === 0 ? (
          <div className="muted flex h-full min-h-[3rem] items-center justify-center rounded-lg border border-dashed border-[color:var(--line)] px-2 text-center text-xs">
            Nothing planted yet
          </div>
        ) : (
          <ul className="space-y-1.5">
            {groups.map((group) => {
              const plant = PLANTS[group.plantId]
              const allReady = group.growing === 0
              const clickIndex = allReady ? -1 : group.soonestIndex
              return (
                <li key={group.plantId}>
                  <button
                    disabled={allReady}
                    onClick={() => clickIndex >= 0 && onSelectPlot(clickIndex)}
                    className="chip flex w-full items-center gap-2 px-2 py-1.5 text-left disabled:cursor-default"
                  >
                    <span className="text-base leading-none">{plant.emoji}</span>
                    <span className="ink w-[5.5rem] shrink-0 truncate text-xs font-medium">
                      {plant.name}
                      <span className="muted font-normal"> x{group.growing + group.ready}</span>
                    </span>
                    <div className="h-1.5 min-w-6 flex-1 overflow-hidden rounded-full bg-[var(--surface-3)]">
                      {/* key resets the bar (no backwards animation) when a different plot becomes the soonest */}
                      <div
                        key={group.soonestIndex}
                        className={cn(
                          "h-full rounded-full ease-linear",
                          allReady ? "bg-sky-400" : isSpeedBoosted ? "bg-violet-400" : "bg-emerald-400",
                          !allReady && "transition-[width] duration-1000"
                        )}
                        style={{ width: `${allReady ? 100 : group.progress}%` }}
                      />
                    </div>
                    {group.ready > 0 && !allReady && <span className="pill t-sky !px-1.5 !py-0">{group.ready} ready</span>}
                    <span className={cn("w-14 shrink-0 text-right text-xs font-semibold tabular-nums", allReady ? "t-sky" : "ink")}>
                      {allReady ? "Ready" : formatRemaining(group.remaining)}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </section>
  )
}
