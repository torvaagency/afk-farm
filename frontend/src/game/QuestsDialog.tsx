import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FaTimes, FaCheck, FaTrophy, FaScroll, FaCoins, FaStar } from "react-icons/fa"
import { ACHIEVEMENTS, type Quest } from "./features"
import type { GameStats } from "./useGameStore"

interface QuestsDialogProps {
  open: boolean
  onClose: () => void
  quests: Quest[]
  achievementsClaimed: Record<string, boolean>
  stats: GameStats
  unlockedSlots: number
  autoHarvesterLevel: number
  onClaimQuest: (id: string) => void
  onClaimAchievement: (id: string) => void
}

const compact = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 })

export default function QuestsDialog({
  open,
  onClose,
  quests,
  achievementsClaimed,
  stats,
  unlockedSlots,
  autoHarvesterLevel,
  onClaimQuest,
  onClaimAchievement,
}: QuestsDialogProps) {
  const [tab, setTab] = useState<"quests" | "achievements">("quests")

  const getAchievementProgress = (achId: string, target: number) => {
    let current = 0
    if (achId.startsWith("ach_harvest_")) current = stats.totalHarvested
    else if (achId.startsWith("ach_plots_")) current = unlockedSlots
    else if (achId.startsWith("ach_earn_")) current = stats.totalEarned
    else if (achId.startsWith("ach_storm_")) current = stats.rainHarvests
    else if (achId.startsWith("ach_bot_")) current = autoHarvesterLevel
    return { current: Math.min(target, current), raw: current, isReady: current >= target }
  }

  const claimableQuests = quests.filter((q) => q.completed && !q.claimed).length
  const claimableAchievements = ACHIEVEMENTS.filter((a) => {
    const { isReady } = getAchievementProgress(a.id, a.target)
    return isReady && !achievementsClaimed[a.id]
  }).length

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            className="panel relative flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="panel-head flex items-center justify-between border-b border-[color:var(--line)] px-4 py-3">
              <div className="flex items-center gap-2">
                <FaScroll className="text-amber-400" size={15} />
                <h2 className="text-sm font-semibold tracking-wide">Missions & Achievements</h2>
              </div>
              <Button size="icon" variant="ghost" className="h-7 w-7 rounded-md" onClick={onClose} aria-label="Close">
                <FaTimes size={12} />
              </Button>
            </div>

            {/* Quick Stats Bar */}
            <div className="grid grid-cols-2 gap-2 border-b border-[color:var(--line)] bg-[var(--surface-2)] p-3 sm:grid-cols-4 text-xs">
              <div className="chip flex flex-col items-center justify-center py-1.5 text-center">
                <span className="muted text-[10px]">Total Harvested</span>
                <span className="font-bold tabular-nums text-emerald-400">{stats.totalHarvested.toLocaleString()}</span>
              </div>
              <div className="chip flex flex-col items-center justify-center py-1.5 text-center">
                <span className="muted text-[10px]">Total Earned</span>
                <span className="font-bold tabular-nums text-amber-400">${compact.format(stats.totalEarned)}</span>
              </div>
              <div className="chip flex flex-col items-center justify-center py-1.5 text-center">
                <span className="muted text-[10px]">Seeds Planted</span>
                <span className="font-bold tabular-nums text-sky-400">{stats.totalPlanted.toLocaleString()}</span>
              </div>
              <div className="chip flex flex-col items-center justify-center py-1.5 text-center">
                <span className="muted text-[10px]">Storm Harvests</span>
                <span className="font-bold tabular-nums text-purple-400">{stats.rainHarvests.toLocaleString()}</span>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-[color:var(--line)] px-3 pt-2">
              <button
                onClick={() => setTab("quests")}
                className={`relative flex items-center gap-2 px-4 py-2 text-xs font-semibold transition-colors ${
                  tab === "quests" ? "text-emerald-400" : "muted hover:text-[color:var(--ink)]"
                }`}
              >
                <FaScroll size={11} />
                <span>Active Missions</span>
                {claimableQuests > 0 && (
                  <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-emerald-500 px-1 text-[9px] font-bold text-black animate-pulse">
                    {claimableQuests}
                  </span>
                )}
                {tab === "quests" && <motion.div layoutId="questTabLine" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400" />}
              </button>

              <button
                onClick={() => setTab("achievements")}
                className={`relative flex items-center gap-2 px-4 py-2 text-xs font-semibold transition-colors ${
                  tab === "achievements" ? "text-amber-400" : "muted hover:text-[color:var(--ink)]"
                }`}
              >
                <FaTrophy size={11} />
                <span>Achievements</span>
                {claimableAchievements > 0 && (
                  <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-amber-500 px-1 text-[9px] font-bold text-black animate-pulse">
                    {claimableAchievements}
                  </span>
                )}
                {tab === "achievements" && <motion.div layoutId="questTabLine" className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400" />}
              </button>
            </div>

            {/* Content List */}
            <ScrollArea className="max-h-[50vh] flex-1 p-3">
              {tab === "quests" ? (
                <div className="flex flex-col gap-2.5">
                  {(() => {
                    const sortedQuests = [...quests].sort((a, b) => {
                      const scoreA = a.claimed ? 2 : a.completed ? 0 : 1
                      const scoreB = b.claimed ? 2 : b.completed ? 0 : 1
                      return scoreA - scoreB
                    })

                    return sortedQuests.map((q) => {
                      const isClaimed = q.claimed
                      const isClaimable = q.completed && !q.claimed
                      const percent = isClaimed ? 100 : Math.min(100, Math.floor((q.progress / q.target) * 100))

                      return (
                        <div
                          key={q.id}
                          className={`chip flex flex-col gap-2 p-3 transition-colors ${
                            isClaimed
                              ? "opacity-60 bg-[var(--surface-2)]"
                              : isClaimable
                              ? "border-emerald-500/50 bg-emerald-500/[0.04]"
                              : ""
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-xs">{q.title}</span>
                                {isClaimed ? (
                                  <span className="flex items-center gap-1 rounded bg-zinc-800 px-1.5 py-0.5 text-[9px] font-medium text-zinc-400">
                                    <FaCheck size={7} /> Completed
                                  </span>
                                ) : isClaimable ? (
                                  <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-bold text-emerald-400">
                                    Ready to Claim!
                                  </span>
                                ) : null}
                              </div>
                              <p className="muted text-[11px] mt-0.5">{q.description}</p>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="flex items-center gap-1 rounded bg-amber-500/15 px-2 py-1 text-[10px] font-bold text-amber-400 border border-amber-500/30">
                                <FaCoins size={9} /> ${q.reward.money.toLocaleString()}
                              </span>
                              <span className="flex items-center gap-1 rounded bg-emerald-500/15 px-2 py-1 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                                <FaStar size={9} /> +{q.reward.exp} XP
                              </span>
                            </div>
                          </div>

                          {/* Progress bar & action */}
                          <div className="flex items-center gap-3 pt-1">
                            <div className="flex-1">
                              <div className="flex justify-between text-[10px] font-mono muted mb-1">
                                <span>Progress</span>
                                <span>
                                  {isClaimed
                                    ? `${q.target.toLocaleString()} / ${q.target.toLocaleString()} (100%)`
                                    : `${q.progress.toLocaleString()} / ${q.target.toLocaleString()} (${percent}%)`}
                                </span>
                              </div>
                              <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--surface-3)]">
                                <div
                                  className={`h-full transition-all duration-300 rounded-full ${
                                    isClaimed
                                      ? "bg-zinc-600"
                                      : isClaimable
                                      ? "bg-emerald-400"
                                      : "bg-emerald-500/60"
                                  }`}
                                  style={{ width: `${percent}%` }}
                                />
                              </div>
                            </div>

                            <Button
                              size="sm"
                              disabled={!isClaimable}
                              onClick={() => onClaimQuest(q.id)}
                              className={`h-7 px-3 text-xs shrink-0 rounded-md font-semibold ${
                                isClaimed
                                  ? "bg-zinc-800 text-zinc-500 cursor-default"
                                  : isClaimable
                                  ? "bg-emerald-500 text-black hover:bg-emerald-400 shadow-md shadow-emerald-500/20"
                                  : "muted bg-[var(--surface-3)] opacity-60"
                              }`}
                            >
                              {isClaimed ? "Claimed ✓" : isClaimable ? "Claim" : "In Progress"}
                            </Button>
                          </div>
                        </div>
                      )
                    })
                  })()}
                </div>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {ACHIEVEMENTS.map((ach) => {
                    const isClaimed = !!achievementsClaimed[ach.id]
                    const { current, isReady } = getAchievementProgress(ach.id, ach.target)
                    const percent = Math.min(100, Math.floor((current / ach.target) * 100))

                    return (
                      <div
                        key={ach.id}
                        className={`chip flex items-center justify-between gap-3 p-3 transition-colors ${
                          isClaimed
                            ? "opacity-60 bg-[var(--surface-2)]"
                            : isReady
                            ? "border-amber-500/50 bg-amber-500/[0.04]"
                            : ""
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <span className="text-2xl shrink-0">{ach.icon}</span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-xs truncate">{ach.title}</span>
                              {isClaimed && (
                                <span className="flex items-center gap-0.5 rounded bg-zinc-800 px-1.5 py-0.5 text-[9px] font-medium text-zinc-400">
                                  <FaCheck size={7} /> Claimed
                                </span>
                              )}
                              {!isClaimed && isReady && (
                                <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-bold text-amber-400">
                                  Unlocked!
                                </span>
                              )}
                            </div>
                            <p className="muted text-[11px] truncate mt-0.5">{ach.description}</p>

                            {!isClaimed && (
                              <div className="mt-2 flex items-center gap-2">
                                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--surface-3)]">
                                  <div
                                    className="h-full bg-amber-400 rounded-full transition-all duration-300"
                                    style={{ width: `${percent}%` }}
                                  />
                                </div>
                                <span className="text-[10px] font-mono muted tabular-nums shrink-0">
                                  {current.toLocaleString()} / {ach.target.toLocaleString()}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                          <div className="flex items-center gap-1">
                            <span className="flex items-center gap-1 rounded bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-400 border border-amber-500/30">
                              <FaCoins size={8} /> ${ach.reward.money.toLocaleString()}
                            </span>
                            <span className="flex items-center gap-1 rounded bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                              <FaStar size={8} /> +{ach.reward.exp}
                            </span>
                          </div>

                          {!isClaimed && (
                            <Button
                              size="sm"
                              disabled={!isReady}
                              onClick={() => onClaimAchievement(ach.id)}
                              className={`h-7 px-3 text-xs rounded-md font-semibold ${
                                isReady
                                  ? "bg-amber-500 text-black hover:bg-amber-400 shadow-md shadow-amber-500/20"
                                  : "muted bg-[var(--surface-3)] opacity-60"
                              }`}
                            >
                              {isReady ? "Claim" : "Locked"}
                            </Button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </ScrollArea>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
