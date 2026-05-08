import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { useGameStore } from "./game/useGameStore"
import { PLANTS } from "./game/constants"
import { cn } from "@/lib/utils"

// React Icons
import {
  FaSeedling,
  FaCoins,
  FaBriefcase,
  FaTrophy,
  FaLock,
  FaChevronLeft,
  FaChevronRight,
  FaFlask,
  FaStore,
  FaStar,
  FaBolt,
  FaMagic,
  FaTerminal
} from "react-icons/fa"
import { GiPotionBall, GiMagicGate, GiCrystalGrowth, GiDna2 } from "react-icons/gi"
import { HiSparkles } from "react-icons/hi"

export default function App() {
  const { state, toasts, buySeed, plantSeed, harvestCrop, sellCrop, sellAllCrops, buySlot, nextSlotCost, useItem, isSpeedBoosted, expToNextLevel, resetGame } = useGameStore()
  const [selectedSeed, setSelectedSeed] = useState<string | null>(null)
  const [showSellConfirm, setShowSellConfirm] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const magicStyle = "magic-panel rounded-none"

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft } = scrollRef.current
      const scrollTo = direction === "left" ? scrollLeft - 300 : scrollLeft + 300
      scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" })
    }
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-cyan-900 overflow-x-hidden">
      <div className="scanline" />

      {/* Toast Notifications - Arcane Whispers */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none items-end">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, x: 50, transition: { duration: 0.3 } }}
              className={cn(
                "px-5 py-2 border-r-2 shadow-[0_0_20px_rgba(0,0,0,0.5)] font-gamer text-[10px] uppercase tracking-tighter bg-black/90 backdrop-blur-xl",
                toast.type === "success" && "border-emerald-500 text-emerald-400 text-glow-cyan",
                toast.type === "info" && "border-cyan-500 text-cyan-400 text-glow-cyan",
                toast.type === "xp" && "border-amber-500 text-amber-400",
                toast.type === "item" && "border-purple-500 text-purple-400 text-glow-purple"
              )}
            >
              <div className="flex items-center gap-2">
                <HiSparkles className="animate-pulse" />
                {toast.message}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Header / Navbar - Magitech Core */}
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-10 border-b border-white/5 bg-black/80 backdrop-blur-md px-6 py-3"
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <h1 className="text-2xl font-gamer font-black tracking-tighter leading-none text-glow-cyan">AFK FARM</h1>
              <div className="flex items-center gap-2">
                <span className="text-[8px] text-cyan-500 uppercase tracking-widest font-bold flex items-center gap-1">
                  <FaMagic size={8} /> SYSTEM_ONLINE
                </span>
                {isSpeedBoosted && (
                  <div className="flex items-center gap-1 text-[8px] text-purple-400 uppercase font-bold animate-pulse text-glow-purple">
                    <FaBolt size={8} /> Chrono_Burst
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-8">
            <div className="hidden md:flex items-center gap-4 w-44">
              <div className="flex flex-col items-end leading-tight">
                <div className="text-[10px] font-gamer font-bold text-cyan-400 flex items-center gap-2">
                  Tier_{state.level}
                </div>
                <div className="text-[9px] text-neutral-500 font-mono tracking-widest">
                  EXP_{state.exp}/{expToNextLevel}
                </div>
              </div>
              <div className="flex-1 h-1 bg-neutral-900 overflow-hidden border border-white/5 relative">
                <motion.div
                  className="h-full bg-cyan-500 shadow-[0_0_15px_#22d3ee]"
                  initial={{ width: 0 }}
                  animate={{ width: `${(state.exp / expToNextLevel) * 100}%` }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
              </div>
            </div>

            <div className="flex items-center gap-3 px-5 py-2 bg-black border border-cyan-500/20 shadow-[0_0_15px_rgba(34,211,238,0.1)]">
              <FaCoins size={16} className="text-amber-500 arcane-glow" />
              <span className="font-gamer font-bold text-lg tracking-tight text-amber-500 text-glow-cyan">${state.money.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </motion.header>

      <main className="mx-auto max-w-6xl p-4 space-y-4">
        {/* Farm Grid - The Celestial Garden */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-gamer font-bold flex items-center gap-3 text-glow-cyan">
              Field
              <Badge variant="outline" className="font-mono text-[9px] text-neutral-500 border-neutral-800">Node_{state.unlockedSlots}/16</Badge>
            </h2>
            <AnimatePresence>
              {selectedSeed && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex items-center gap-2"
                >
                  <span className="text-[9px] text-neutral-500 font-gamer uppercase tracking-widest">Planting:</span>
                  <div className="bg-cyan-500/10 border border-cyan-500/50 px-4 py-1 flex items-center gap-3 animate-magic-float shadow-[0_0_10px_rgba(34,211,238,0.2)]">
                    <span className="text-[10px] font-gamer text-cyan-400 uppercase tracking-widest">
                      {PLANTS[selectedSeed].name}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-3 w-3 rounded-none hover:bg-cyan-500/20 p-0 text-white"
                      onClick={() => setSelectedSeed(null)}
                    >
                      ×
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className={cn("grid grid-cols-4 md:grid-cols-8 gap-2 p-3 neon-border-emerald", magicStyle)}>
            {state.slots.map((slot, i) => {
              const isUnlocked = i < state.unlockedSlots
              const isNextToUnlock = i === state.unlockedSlots
              const unlockCost = nextSlotCost

              if (!isUnlocked) {
                return (
                  <motion.button
                    key={i}
                    whileHover={isNextToUnlock ? { backgroundColor: "rgba(34, 211, 238, 0.1)" } : {}}
                    whileTap={isNextToUnlock ? { scale: 0.95 } : {}}
                    onClick={() => isNextToUnlock && buySlot()}
                    disabled={!isNextToUnlock || state.money < unlockCost}
                    className={cn(
                      "relative aspect-square flex flex-col items-center justify-center transition-all duration-500 overflow-hidden border border-white/5",
                      isNextToUnlock
                        ? "bg-cyan-500/5 border-cyan-500/30 hover:border-cyan-500 cursor-pointer"
                        : "bg-black cursor-not-allowed opacity-10"
                    )}
                  >
                    {isNextToUnlock ? (
                      <div className="flex flex-col items-center gap-1 text-center">
                        <div className="text-cyan-500 font-gamer text-[8px] tracking-widest">UNLOCK</div>
                        <div className="text-[9px] font-mono text-white opacity-40">
                          ${unlockCost.toLocaleString()}
                        </div>
                      </div>
                    ) : (
                      <FaLock size={12} className="text-neutral-400 opacity-60" />
                    )}
                  </motion.button>
                )
              }

              const plant = slot ? PLANTS[slot.plantId] : null
              const elapsedSeconds = slot ? (Date.now() - slot.plantedAt) / 1000 : 0
              const speedMultiplier = isSpeedBoosted ? 2 : 1
              const adjustedElapsed = elapsedSeconds * speedMultiplier
              const remainingSeconds = slot ? Math.max(0, Math.ceil((plant!.growTime - adjustedElapsed) / speedMultiplier)) : 0
              const progress = slot ? Math.min(100, (adjustedElapsed / plant!.growTime) * 100) : 0

              let currentEmoji = "🕳️"
              if (slot) {
                const stageIndex = Math.floor((progress / 100) * (plant!.stages.length - 1))
                currentEmoji = plant!.stages[stageIndex]
              }

              return (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.05, zIndex: 1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    if (slot?.isHarvestable) {
                      harvestCrop(i)
                    } else if (!slot && selectedSeed) {
                      const success = plantSeed(i, selectedSeed)
                      if (success && state.inventory[selectedSeed] <= 1) {
                        setSelectedSeed(null)
                      }
                    }
                  }}
                  disabled={!slot && !selectedSeed}
                  className={cn(
                    "relative aspect-square flex flex-col items-center justify-center transition-all duration-500 group overflow-hidden border",
                    !slot ? "border-white/5 hover:border-cyan-500/50" : "border-white/10 shadow-2xl",
                    slot?.isHarvestable && "border-cyan-400 shadow-[0_0_25px_#22d3ee55] animate-magic-float"
                  )}
                  style={{
                    backgroundImage: 'linear-gradient(rgba(0,10,20,0.3), rgba(0,10,20,0.3)), url(/farm-patch.jpg)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                  <motion.span
                    animate={slot?.isHarvestable ? { scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] } : {}}
                    transition={slot?.isHarvestable ? { repeat: Infinity, duration: 2 } : {}}
                    className={cn(
                      "text-2xl transition-transform duration-700 arcane-glow",
                      !slot && "opacity-5 group-hover:opacity-40 grayscale"
                    )}
                  >
                    {currentEmoji}
                  </motion.span>

                  {slot && !slot.isHarvestable && (
                    <>
                      <div className="absolute top-1 right-1 text-[7px] px-1.5 font-mono bg-black/90 text-cyan-500 border border-cyan-500/30">
                        {remainingSeconds}s
                      </div>
                      <div className="absolute bottom-0 left-0 w-full h-1 bg-white/5 overflow-hidden">
                        <motion.div
                          className={cn(
                            "h-full bg-cyan-500 shadow-[0_0_10px_#22d3ee]",
                            isSpeedBoosted && "bg-purple-400 shadow-[0_0_10px_#a855f7]"
                          )}
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                        />
                      </div>
                    </>
                  )}

                  {slot?.isHarvestable && (
                    <div className="absolute inset-0 bg-cyan-500/5 flex items-center justify-center overflow-hidden">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                        className="w-full h-full border border-cyan-500/10 rounded-full scale-[1.5]"
                      />
                      <div className="text-cyan-300 font-gamer text-[8px] tracking-[0.2em] animate-pulse text-glow-cyan">BLOOMED</div>
                    </div>
                  )}
                </motion.button>
              )
            })}
          </div>
        </motion.section>

        {/* Middle Section: Mana & Artifacts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-3"
        >
          <Card className={cn(magicStyle, "border border-white/5")}>
            <CardHeader className="py-1.5 px-4 border-b border-white/5 bg-white/5">
              <CardTitle className="text-[10px] font-gamer font-bold flex items-center gap-3 opacity-80 tracking-widest uppercase">
                <FaBriefcase size={10} className="text-cyan-500" /> Inventory
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 px-4">
              <ScrollArea className="h-12 w-full">
                <div className="flex flex-wrap gap-2 min-h-[30px]">
                  <AnimatePresence>
                    {Object.entries(state.inventory).map(([id, count]) => {
                      if (count === 0) return null
                      const plant = PLANTS[id]
                      return (
                        <motion.button
                          key={id}
                          layout
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0 }}
                          whileHover={{ backgroundColor: "rgba(34, 211, 238, 0.05)", borderColor: "rgba(34, 211, 238, 0.5)" }}
                          onClick={() => setSelectedSeed(id)}
                          className={cn(
                            "px-3 py-1 border flex items-center gap-3 transition-all",
                            selectedSeed === id ? "border-cyan-500 text-cyan-400 bg-cyan-500/10 shadow-[0_0_10px_rgba(34,211,238,0.2)]" : "border-white/5 text-neutral-400"
                          )}
                        >
                          <span className="text-lg arcane-glow">{plant.emoji}</span>
                          <span className="text-[10px] font-mono font-bold">x{count}</span>
                        </motion.button>
                      )
                    })}
                  </AnimatePresence>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <Card className={cn(magicStyle, "neon-border-purple")}>
            <CardHeader className="py-1.5 px-4 border-b border-purple-500/20 bg-purple-500/5">
              <CardTitle className="text-[10px] font-gamer font-bold text-purple-400 flex items-center gap-3 tracking-widest text-glow-purple uppercase">
                <GiPotionBall size={14} /> Potions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 px-4">
              <div className="flex flex-wrap gap-3 min-h-[40px] items-center">
                <AnimatePresence>
                  {(state.items?.speed_potion || 0) > 0 ? (
                    <motion.button
                      key="speed_potion"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(168, 85, 247, 0.3)" }}
                      onClick={() => useItem("speed_potion")}
                      className="px-4 py-1 bg-black border border-purple-500 flex items-center gap-3 hover:bg-purple-500/10 transition-all"
                    >
                      <GiPotionBall size={16} className="text-purple-400" />
                      <div className="text-[9px] font-gamer font-bold text-purple-300 uppercase tracking-widest">
                        Haste_Essence [x{state.items.speed_potion}]
                      </div>
                    </motion.button>
                  ) : (
                    <div className="text-[8px] font-gamer text-purple-500/20 italic uppercase tracking-widest">No Elixirs Found</div>
                  )}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Shop - The Grand Bazaar */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-2"
        >
          <Card className={cn(magicStyle, "border border-white/5 pb-2")}>
            <CardHeader className="py-2 px-5 border-b border-white/5 bg-white/5 flex flex-row items-center justify-between">
              <CardTitle className="text-[10px] font-gamer font-bold flex items-center gap-3 opacity-80 tracking-widest">
                <FaStore size={14} className="text-cyan-500" /> Seed Shop
              </CardTitle>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7 rounded-none border-white/10 bg-black hover:border-cyan-500/50 text-white"
                  onClick={() => scroll("left")}
                >
                  <FaChevronLeft size={10} />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7 rounded-none border-white/10 bg-black hover:border-cyan-500/50 text-white"
                  onClick={() => scroll("right")}
                >
                  <FaChevronRight size={10} />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0 relative">
              <ScrollArea ref={scrollRef} className="w-full whitespace-nowrap">
                <div className="flex p-3 gap-4 pb-6">
                  {Object.values(PLANTS).map((plant) => {
                    const isLocked = state.level < plant.levelRequired
                    return (
                      <motion.div
                        key={plant.id}
                        whileHover={!isLocked ? { y: -4, borderColor: "rgba(34, 211, 238, 0.3)" } : {}}
                        className={cn(
                          "inline-flex flex-col min-w-[140px] p-3 transition-all rounded-none relative border border-white/5 bg-black/60",
                          isLocked && "opacity-60 grayscale"
                        )}
                      >
                        {isLocked && (
                          <div className="absolute inset-0 z-10 bg-black/80 flex flex-col items-center justify-center text-white gap-2">
                            <FaLock size={16} className="text-cyan-500/50" />
                            <span className="text-[9px] font-gamer text-cyan-500/50 tracking-widest font-bold">LOCKED_T{plant.levelRequired}</span>
                          </div>
                        )}
                        <div className="flex items-center justify-center mb-3 h-14 w-full bg-black/40 border-b border-white/5">
                          <span className={cn("text-3xl group-hover:scale-125 transition-transform duration-500 arcane-glow", isLocked && "blur-md")}>{plant.seedEmoji}</span>
                        </div>
                        <div className="mb-3">
                          <h3 className="font-gamer font-bold text-[10px] truncate tracking-widest text-white">{plant.name}</h3>
                          <div className="flex items-center justify-between mt-1">
                            <div className="text-[11px] font-mono font-bold text-amber-500 text-glow-cyan">
                              ${plant.cost.toLocaleString()}
                            </div>
                            <div className="text-[9px] text-neutral-600 font-mono font-bold uppercase">
                              {plant.growTime}S
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <Button
                            size="sm"
                            onClick={() => buySeed(plant.id)}
                            disabled={state.money < plant.cost || isLocked}
                            className="w-full bg-cyan-600/80 hover:bg-cyan-500 text-black rounded-none h-7 text-[9px] font-gamer font-bold border-none tracking-[0.2em]"
                          >
                            PURCHASE
                          </Button>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
                <ScrollBar orientation="horizontal" className="h-2" />
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.section>

        {/* Sell Station - Alchemy & Transmutation */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-2"
        >
          <Card className={cn(magicStyle, "neon-border-amber")}>
            <CardHeader className="py-2 px-5 border-b border-amber-500/20 bg-amber-500/5 flex flex-row items-center justify-between">
              <CardTitle className="text-[10px] font-gamer font-bold text-amber-500 flex items-center gap-3 tracking-widest">
                <GiCrystalGrowth size={16} /> Sell Station
              </CardTitle>
              <Button
                size="sm"
                className="bg-amber-600/80 hover:bg-amber-500 text-black font-gamer font-bold h-7 rounded-none px-5 text-[9px] border-none tracking-[0.2em]"
                onClick={() => setShowSellConfirm(true)}
                disabled={Object.values(state.crops).every(count => count === 0)}
              >
                TRANSMUTE_ALL
              </Button>
            </CardHeader>
            <CardContent className="p-3">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
                <AnimatePresence>
                  {Object.values(PLANTS).map((plant) => {
                    const count = state.crops[plant.id] || 0
                    if (count === 0) return null

                    return (
                      <motion.div
                        key={plant.id}
                        layout
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0 }}
                        className="border border-white/5 p-3 bg-black/60 transition-all rounded-none flex flex-col items-center group shadow-[0_0_15px_rgba(0,0,0,0.5)]"
                      >
                        <div className="text-3xl mb-2 group-hover:scale-110 transition-transform arcane-glow">{plant.emoji}</div>
                        <h3 className="font-gamer font-bold text-[8px] text-neutral-500 mb-1 truncate w-full text-center tracking-widest">{plant.name}</h3>
                        <div className="text-[11px] font-mono font-bold text-amber-500 mb-3 text-glow-cyan">
                          {count}x ${plant.sellPrice.toLocaleString()}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => sellCrop(plant.id)}
                          className="w-full border-amber-500/30 hover:bg-amber-500/10 text-amber-500 rounded-none h-6 text-[9px] font-gamer bg-black tracking-widest"
                        >
                          CONVERT
                        </Button>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
                {Object.values(state.crops).every(count => count === 0) && (
                  <div className="col-span-full py-8 flex flex-col items-center justify-center text-neutral-800 border border-dashed border-white/5">
                    <p className="text-[9px] font-gamer font-bold opacity-20 tracking-[0.5em]">VAULT_EMPTY</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.section>
      </main>

      {/* Footer - HUD Console */}
      <footer className="mt-20 border-t border-white/5 bg-black/80 backdrop-blur-md py-8 px-6">
        <div className="mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-1">
            <h2 className="text-sm font-gamer font-bold text-glow-cyan text-cyan-400 tracking-widest">AFK FARM // WRAITH22444</h2>
            <p className="text-[9px] text-neutral-600 font-mono uppercase tracking-[0.3em]">All rights reserved © 2026</p>
          </div>

          <div className="flex items-center gap-6">
            <a
              href="https://github.com/wraith22444/afk-farming"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] font-gamer font-bold text-neutral-400 hover:text-cyan-400 transition-colors tracking-widest border-b border-transparent hover:border-cyan-400 pb-1"
            >
              SOURCE_CODE
            </a>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowResetConfirm(true)}
              className="text-[10px] font-gamer font-bold text-red-500/50 hover:text-red-500 hover:bg-red-500/10 rounded-none tracking-widest"
            >
              WIPE_MEMORY
            </Button>
          </div>
        </div>
      </footer>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showSellConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSellConfirm(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className={cn("relative w-full max-w-sm p-6 neon-border-amber", magicStyle)}
            >
              <h3 className="text-xl font-gamer font-bold text-amber-500 mb-2 tracking-widest text-glow-cyan">Confirm_Transmutation</h3>
              <p className="text-xs text-neutral-400 font-mono mb-6 uppercase tracking-wider leading-relaxed">
                Are you sure you wish to convert all harvested items into wealth? This process is irreversible.
              </p>
              <div className="flex gap-4">
                <Button
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-black rounded-none font-gamer font-bold h-10 tracking-[0.2em]"
                  onClick={() => {
                    sellAllCrops()
                    setShowSellConfirm(false)
                  }}
                >
                  PROCEED
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-white/10 hover:bg-white/5 rounded-none font-gamer font-bold h-10 tracking-[0.2em] text-neutral-400"
                  onClick={() => setShowSellConfirm(false)}
                >
                  ABORT
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showResetConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowResetConfirm(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={cn("relative w-full max-w-sm p-8 border border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.3)]", magicStyle)}
            >
              <div className="flex items-center gap-4 mb-4 text-red-500">
                <FaTerminal size={24} className="animate-pulse" />
                <h3 className="text-xl font-gamer font-bold tracking-widest uppercase">Critical_Failure</h3>
              </div>
              <p className="text-xs text-neutral-400 font-mono mb-8 uppercase tracking-wider leading-relaxed">
                Warning: Initiating a global memory wipe will permanently erase all credits, levels, and items. This action cannot be undone.
              </p>
              <div className="flex flex-col gap-3">
                <Button
                  className="w-full bg-red-600 hover:bg-red-500 text-white rounded-none font-gamer font-bold h-12 tracking-[0.3em]"
                  onClick={() => {
                    resetGame()
                    setShowResetConfirm(false)
                  }}
                >
                  CONFIRM_WIPE
                </Button>
                <Button
                  variant="ghost"
                  className="w-full text-neutral-500 hover:text-white rounded-none font-gamer font-bold h-10 tracking-[0.2em]"
                  onClick={() => setShowResetConfirm(false)}
                >
                  CANCEL_ABORT
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
