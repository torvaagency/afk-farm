import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { FaTimes, FaCheckCircle, FaLock, FaPlay, FaPause, FaCoins, FaStar } from "react-icons/fa"
import { FAIRY_TIERS } from "./features"

interface BotDialogProps {
  open: boolean
  onClose: () => void
  botLevel: number
  botEnabled: boolean
  money: number
  farmLevel: number
  onToggleBot: () => void
  onUpgradeBot: () => void
}

export default function BotDialog({
  open,
  onClose,
  botLevel,
  botEnabled,
  money,
  farmLevel,
  onToggleBot,
  onUpgradeBot,
}: BotDialogProps) {
  const currentTier = botLevel > 0 ? FAIRY_TIERS[botLevel - 1] : null
  const nextTier = botLevel < FAIRY_TIERS.length ? FAIRY_TIERS[botLevel] : null

  const canAfford = nextTier ? money >= nextTier.cost : false
  const meetsLevel = nextTier ? farmLevel >= nextTier.levelRequired : false

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
            className="panel relative flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="panel-head flex items-center justify-between border-b border-[color:var(--line)] px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="text-base leading-none">🧚</span>
                <h2 className="text-sm font-semibold tracking-wide">Farm Fairy Sanctuary</h2>
              </div>
              <Button size="icon" variant="ghost" className="h-7 w-7 rounded-md" onClick={onClose} aria-label="Close">
                <FaTimes size={12} />
              </Button>
            </div>

            <div className="flex flex-col gap-4 p-4 overflow-y-auto">
              {/* Fairy Status Banner */}
              <div className="chip flex items-center justify-between p-3.5 border-emerald-500/30 bg-emerald-500/[0.04]">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-2xl">
                    🧚
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">
                        {currentTier ? currentTier.name : "Fairy Slumbering"}
                      </span>
                      {botLevel > 0 && (
                        <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-bold text-emerald-400">
                          Tier {botLevel}
                        </span>
                      )}
                    </div>
                    <p className="muted text-xs mt-0.5">
                      {botLevel === 0
                        ? "Befriend a magical fairy companion to flutter over your fields, harvesting and nurturing crops while you are away."
                        : botEnabled
                        ? "Active: Fluttering over crops and nurturing your farm with magic."
                        : "Resting: Your fairy is peacefully resting in the grove."}
                    </p>
                  </div>
                </div>

                {botLevel > 0 && (
                  <Button
                    size="sm"
                    variant={botEnabled ? "outline" : "default"}
                    onClick={onToggleBot}
                    className={`h-8 gap-1.5 px-3 text-xs font-semibold rounded-lg ${
                      botEnabled
                        ? "border-amber-500/50 text-amber-400 hover:bg-amber-500/10"
                        : "bg-emerald-500 text-black hover:bg-emerald-400"
                    }`}
                  >
                    {botEnabled ? (
                      <>
                        <FaPause size={9} /> Rest
                      </>
                    ) : (
                      <>
                        <FaPlay size={9} /> Awaken
                      </>
                    )}
                  </Button>
                )}
              </div>

              {/* Tiers List */}
              <div className="flex flex-col gap-2.5">
                <span className="text-xs font-semibold tracking-wider uppercase muted">Fairy Attunement Progression</span>
                {FAIRY_TIERS.map((tier) => {
                  const isUnlocked = botLevel >= tier.level
                  const isCurrent = botLevel === tier.level
                  const isNext = botLevel + 1 === tier.level

                  return (
                    <div
                      key={tier.level}
                      className={`chip flex flex-col gap-2 p-3 transition-colors ${
                        isCurrent
                          ? "border-emerald-500/60 bg-emerald-500/[0.06]"
                          : isNext
                          ? "border-sky-500/40 bg-sky-500/[0.03]"
                          : "opacity-60"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-xs">
                              Tier {tier.level}: {tier.name}
                            </span>
                            {isCurrent && (
                              <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-bold text-emerald-400">
                                Active
                              </span>
                            )}
                            {isUnlocked && !isCurrent && (
                              <span className="flex items-center gap-1 rounded bg-zinc-800 px-1.5 py-0.5 text-[9px] text-zinc-400">
                                <FaCheckCircle size={8} /> Attuned
                              </span>
                            )}
                            {!isUnlocked && (
                              <span className="flex items-center gap-1 rounded bg-amber-500/15 px-1.5 py-0.5 text-[9px] font-medium text-amber-400">
                                <FaLock size={7} /> Requires Lv {tier.levelRequired}
                              </span>
                            )}
                          </div>
                          <p className="muted text-[11px] mt-0.5">{tier.description}</p>
                        </div>

                        {!isUnlocked && (
                          <div className="flex items-center gap-1 rounded bg-amber-500/15 px-2 py-1 text-[11px] font-bold text-amber-400 border border-amber-500/30">
                            <FaCoins size={9} /> ${tier.cost.toLocaleString()}
                          </div>
                        )}
                      </div>

                      {/* Capabilities pills */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {tier.features.map((feat, i) => (
                          <span
                            key={i}
                            className="rounded bg-[var(--surface-3)] px-2 py-0.5 text-[10px] text-zinc-300"
                          >
                            ✨ {feat}
                          </span>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Next Upgrade Action Card */}
              {nextTier ? (
                <div className="chip flex items-center justify-between p-3.5 border-sky-500/40 bg-sky-500/[0.05]">
                  <div>
                    <span className="text-xs font-semibold text-sky-400">
                      {botLevel === 0 ? "Awaken Companion Fairy" : "Next Attunement"}
                    </span>
                    <div className="flex items-center gap-3 mt-1 text-xs">
                      <span className={`font-semibold tabular-nums ${canAfford ? "text-amber-400" : "text-red-400"}`}>
                        ${nextTier.cost.toLocaleString()}
                      </span>
                      <span className={`flex items-center gap-1 ${meetsLevel ? "text-emerald-400" : "text-amber-400"}`}>
                        <FaStar size={9} /> Farm Lv {nextTier.levelRequired}
                      </span>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    disabled={!canAfford || !meetsLevel}
                    onClick={onUpgradeBot}
                    className={`h-8 px-4 text-xs font-bold rounded-lg ${
                      canAfford && meetsLevel
                        ? "bg-emerald-500 text-black hover:bg-emerald-400 shadow-md shadow-emerald-500/20"
                        : "muted bg-[var(--surface-3)] opacity-60"
                    }`}
                  >
                    {!meetsLevel
                      ? `Need Lv ${nextTier.levelRequired}`
                      : !canAfford
                      ? "Can't Afford"
                      : botLevel === 0
                      ? "Awaken Fairy"
                      : "Attune Fairy"}
                  </Button>
                </div>
              ) : (
                <div className="chip py-3 text-center text-xs font-semibold text-emerald-400 border-emerald-500/30 bg-emerald-500/10">
                  ✨ Supreme Fairy Attunement Achieved!
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
