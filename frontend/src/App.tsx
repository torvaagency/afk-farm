import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useGameStore } from "./game/useGameStore"
import { PLANTS } from "./game/constants"
import { cn } from "@/lib/utils"

// React Icons
import {
  FaCoins,
  FaBriefcase,
  FaLock,
  FaChevronLeft,
  FaChevronRight,
  FaStore,
  FaBolt,
  FaMagic,
  FaTerminal
} from "react-icons/fa"
import { GiPotionBall, GiCrystalGrowth } from "react-icons/gi"
import { HiSparkles } from "react-icons/hi"
import { HubConnectionBuilder, HubConnection, LogLevel } from "@microsoft/signalr"
import { FaSun, FaMoon, FaCommentAlt, FaPaperPlane } from "react-icons/fa"

const MagicGrowth = () => (
  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
    <svg viewBox="0 0 100 100" className="w-full h-full opacity-60">
      <motion.circle
        cx="50"
        cy="50"
        r="40"
        fill="none"
        stroke="url(#magicGradient)"
        strokeWidth="1"
        strokeDasharray="10 5"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
      />
      {[0, 72, 144, 216, 288].map((angle, i) => (
        <motion.circle
          key={i}
          cx={50}
          cy={50}
          r="1.5"
          fill="#22d3ee"
          animate={{
            cx: [
              50 + 35 * Math.cos((angle * Math.PI) / 180),
              50 + 35 * Math.cos(((angle + 360) * Math.PI) / 180)
            ],
            cy: [
              50 + 35 * Math.sin((angle * Math.PI) / 180),
              50 + 35 * Math.sin(((angle + 360) * Math.PI) / 180)
            ],
            opacity: [0.2, 1, 0.2],
          }}
          transition={{
            repeat: Infinity,
            duration: 5,
            ease: "linear",
          }}
        />
      ))}
      <defs>
        <linearGradient id="magicGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="50%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
      </defs>
    </svg>
    <div className="absolute inset-0">
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-0.5 h-0.5 bg-cyan-300 rounded-full blur-[1px]"
          initial={{ x: "50%", y: "70%", opacity: 0 }}
          animate={{
            y: ["70%", "10%"],
            x: ["45%", "55%", "40%", "60%"],
            opacity: [0, 1, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: 3,
            delay: i * 0.6,
          }}
        />
      ))}
    </div>
  </div>
)

export default function App() {
  const { state, toasts, buySeed, plantSeed, harvestCrop, sellCrop, sellAllCrops, buySlot, nextSlotCost, useItem, isSpeedBoosted, expToNextLevel, resetGame, addToast } = useGameStore()
  const [selectedSeed, setSelectedSeed] = useState<string | null>(null)
  const [showSellConfirm, setShowSellConfirm] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme")
      return saved ? saved === "dark" : true
    }
    return true
  })
  const scrollRef = useRef<HTMLDivElement>(null)
  const chatScrollRef = useRef<HTMLDivElement>(null)

  // Chat State
  const [messages, setMessages] = useState<{ user: string; message: string; timestamp: number }[]>([])
  const [currentMessage, setCurrentMessage] = useState("")
  const [connection, setConnection] = useState<HubConnection | null>(null)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [username] = useState(() => `Player_${Math.floor(Math.random() * 9000) + 1000}`)

  useEffect(() => {
    const newConnection = new HubConnectionBuilder()
      .withUrl("https://localhost:7164/chatHub") // Default ASP.NET core HTTPS port
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Information)
      .build()

    setConnection(newConnection)
  }, [])

  useEffect(() => {
    if (connection) {
      connection.start()
        .then(() => {
          console.log("Connected to SignalR!")
          connection.on("ReceiveMessage", (user, message) => {
            setMessages(prev => [...prev, { user, message, timestamp: Date.now() }].slice(-50))
          })
        })
        .catch(e => console.log("Connection failed: ", e))
    }
  }, [connection])

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight
    }
  }, [messages, isChatOpen])

  const sendMessage = async () => {
    if (connection && currentMessage.trim()) {
      try {
        await connection.invoke("SendMessage", username, currentMessage)
        setCurrentMessage("")
      } catch (e) {
        console.error(e)
      }
    }
  }

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const next = !prev
      localStorage.setItem("theme", next ? "dark" : "light")
      return next
    })
  }

  useEffect(() => {
    const root = window.document.documentElement
    if (isDarkMode) {
      root.classList.add("dark")
      root.classList.remove("light")
    } else {
      root.classList.add("light")
      root.classList.remove("dark")
    }
  }, [isDarkMode])

  const magicStyle = "magic-panel rounded-none"

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft } = scrollRef.current
      const scrollTo = direction === "left" ? scrollLeft - 300 : scrollLeft + 300
      scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" })
    }
  }

  return (
    <TooltipProvider>
      <div className={cn(
        "min-h-screen font-sans transition-colors duration-500",
        isDarkMode ? "bg-black text-white selection:bg-cyan-900" : "bg-white text-black selection:bg-cyan-200"
      )}>
        <div className="scanline" />

        {/* Toast Notifications - Arcane Whispers */}
        <div className="fixed top-24 right-6 z-50 flex flex-col gap-2 pointer-events-none items-end">
          <AnimatePresence>
            {toasts.map((toast) => (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, x: 50, transition: { duration: 0.3 } }}
                className={cn(
                  "px-8 py-1 border-r-2 shadow-[0_0_20px_rgba(0,0,0,0.5)] font-gamer text-[10px] uppercase tracking-tighter backdrop-blur-xl min-w-[180px]",
                  isDarkMode ? "bg-black/90" : "bg-white/90 border-l border-t border-b border-black/5",
                  toast.type === "success" && "border-emerald-500 text-emerald-400 text-glow-cyan",
                  toast.type === "info" && "border-cyan-500 text-cyan-400 text-glow-cyan",
                  toast.type === "xp" && "border-amber-500 text-amber-400",
                  toast.type === "item" && "border-purple-500 text-purple-400 text-glow-purple"
                )}
              >
                <div className="flex items-center gap-2">
                  <HiSparkles className="animate-pulse icon-themed" />
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
          className={cn(
            "sticky top-0 z-50 border-b backdrop-blur-md px-6 py-3",
            isDarkMode ? "border-white/5 bg-black/80" : "border-black/5 bg-white/80"
          )}
        >
          <div className="mx-auto flex max-w-6xl items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex flex-col">
                <h1 className="text-lg md:text-2xl font-gamer font-black tracking-tighter leading-none text-glow-cyan">AFK FARM</h1>
                <div className="flex items-center gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="icon-themed text-[8px] uppercase tracking-widest font-bold flex items-center gap-1 cursor-help">
                        <FaMagic size={8} /> SYSTEM_ONLINE
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="bg-black border-cyan-500/50 text-cyan-400 font-gamer text-[10px]">
                      AFK Farm System — Running
                    </TooltipContent>
                  </Tooltip>

                  {isSpeedBoosted && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-1 text-[8px] text-purple-400 uppercase font-bold animate-pulse text-glow-purple cursor-help">
                          <FaBolt size={8} /> Chrono_Burst
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="bg-black border-purple-500/50 text-purple-400 font-gamer text-[10px]">
                        2× Growth Speed Active!
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2 md:gap-4 w-auto md:w-44">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex flex-col gap-1 cursor-help items-end">
                      <div className="flex items-center justify-between w-full">
                        <div className="text-[10px] font-gamer font-bold text-cyan-400 flex items-center gap-2 mr-3">
                          Level {state.level}
                        </div>
                        <div className="text-[9px] text-neutral-500 font-mono tracking-widest">
                          EXP {state.exp}/{expToNextLevel}
                        </div>
                      </div>
                      <div className={cn(
                        "w-full h-1 overflow-hidden border relative",
                        isDarkMode ? "bg-neutral-900 border-white/5" : "bg-neutral-100 border-black/5"
                      )}>
                        <motion.div
                          className="h-full bg-cyan-500 shadow-[0_0_15px_#22d3ee]"
                          initial={{ width: 0 }}
                          animate={{ width: `${(state.exp / expToNextLevel) * 100}%` }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="bg-black border-cyan-500/50 text-cyan-400 font-gamer text-[10px]">
                    {expToNextLevel - state.exp} EXP to Level {state.level + 1}
                  </TooltipContent>
                </Tooltip>
              </div>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div className={cn(
                    "flex items-center gap-3 px-5 py-2 border shadow-[0_0_15px_rgba(34,211,238,0.1)] transition-colors duration-500 cursor-help",
                    isDarkMode ? "bg-black border-cyan-500/20" : "bg-white border-cyan-500/40"
                  )}>
                    <FaCoins size={16} className={cn("arcane-glow", isDarkMode ? "text-amber-400" : "text-amber-600")} />
                    <span className={cn("font-gamer font-bold text-base tracking-tight text-glow-cyan", isDarkMode ? "text-white" : "text-black")}>${state.money.toLocaleString()}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="bg-black border-amber-500/50 text-amber-500 font-gamer text-[10px]">
                  Available Coins
                </TooltipContent>
              </Tooltip>

              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className={cn(
                  "h-10 w-10 rounded-none border text-cyan-400 transition-all",
                  isDarkMode ? "border-white/10 hover:bg-white/5" : "border-black/10 hover:bg-black/5"
                )}
              >
                {isDarkMode ? <FaSun size={18} /> : <FaMoon size={18} />}
              </Button>
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
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className="font-mono text-[9px] text-neutral-500 border-neutral-800 cursor-help">Node_{state.unlockedSlots}/16</Badge>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="bg-black border-cyan-500/50 text-cyan-400 font-gamer text-[10px]">
                    Field Node Capacity
                  </TooltipContent>
                </Tooltip>
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
                    <Tooltip key={i}>
                      <TooltipTrigger asChild>
                        <motion.button
                          whileHover={isNextToUnlock ? { backgroundColor: "rgba(34, 211, 238, 0.1)" } : {}}
                          whileTap={isNextToUnlock ? { scale: 0.95 } : {}}
                          onClick={() => isNextToUnlock && buySlot()}
                          disabled={!isNextToUnlock || state.money < unlockCost}
                          className={cn(
                            "relative aspect-square flex flex-col items-center justify-center transition-all duration-500 overflow-hidden border",
                            isNextToUnlock
                              ? "bg-cyan-500/5 border-cyan-500/30 hover:border-cyan-500 cursor-pointer"
                              : isDarkMode ? "bg-black border-white/5 cursor-default opacity-10" : "bg-white border-black/5 cursor-default opacity-10"
                          )}
                        >
                          {isNextToUnlock ? (
                            <div className="flex flex-col items-center gap-1 text-center">
                              <div className={cn("text-[9px] font-mono", isDarkMode ? "text-white opacity-40" : "text-black opacity-40")}>
                                ${unlockCost.toLocaleString()}
                              </div>
                            </div>
                          ) : (
                            <FaLock size={12} className={isDarkMode ? "text-neutral-400 opacity-60" : "text-neutral-600 opacity-60"} />
                          )}
                        </motion.button>
                      </TooltipTrigger>
                      <TooltipContent className="bg-black border-cyan-500/50 text-cyan-400 font-gamer text-[10px]">
                        {isNextToUnlock ? `Unlock Node for $${unlockCost.toLocaleString()}` : "Node Locked"}
                      </TooltipContent>
                    </Tooltip>
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
                  <Tooltip key={i}>
                    <TooltipTrigger asChild>
                      <motion.button
                        whileHover={{ scale: 1.05, zIndex: 1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          if (slot?.isHarvestable) {
                            harvestCrop(i)
                          } else if (!slot) {
                            if (selectedSeed) {
                              const success = plantSeed(i, selectedSeed)
                              if (success && (state.inventory[selectedSeed] || 0) <= 1) {
                                setSelectedSeed(null)
                              }
                            } else {
                              addToast("Select a seed from inventory first!", "info")
                            }
                          }
                        }}
                        disabled={!slot && !selectedSeed}
                        className={cn(
                          "relative aspect-square flex flex-col items-center justify-center transition-all duration-500 group overflow-hidden border",
                          !slot ? (isDarkMode ? "border-white/5 hover:border-cyan-500/50" : "border-black/5 hover:border-cyan-500/50") : (isDarkMode ? "border-white/10 shadow-2xl" : "border-black/10 shadow-lg"),
                          slot?.isHarvestable && "border-cyan-400 shadow-[0_0_25px_#22d3ee55] animate-magic-float"
                        )}
                        style={{
                          backgroundImage: isDarkMode ? 'linear-gradient(rgba(0,10,20,0.3), rgba(0,10,20,0.3)), url(/farm-patch.jpg)' : 'linear-gradient(rgba(255,255,255,0.8), rgba(255,255,255,0.8)), url(/farm-patch.jpg)',
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
                            <MagicGrowth />
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
                    </TooltipTrigger>
                    <TooltipContent className="bg-black border-cyan-500/50 text-cyan-400 font-gamer text-[10px]">
                      {slot?.isHarvestable ? `Harvest ${plant?.name}` : slot ? `Growing ${plant?.name} (${remainingSeconds}s)` : selectedSeed ? `Plant ${PLANTS[selectedSeed].name}` : "Empty Node"}
                    </TooltipContent>
                  </Tooltip>
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
            <Card className={cn(
              magicStyle,
              isDarkMode ? "border-white/5" : "border-black/20"
            )}>
              <CardHeader className={cn(
                "py-1.5 px-4 border-b",
                isDarkMode ? "border-white/5 bg-white/5" : "border-black/10 bg-black/5"
              )}>
                <CardTitle className="text-[10px] font-gamer font-bold flex items-center gap-3 tracking-widest uppercase icon-themed">
                  <FaBriefcase size={10} className="icon-themed" /> Inventory
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
                          <Tooltip key={id}>
                            <TooltipTrigger asChild>
                              <motion.button
                                layout
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                whileHover={{ backgroundColor: "rgba(34, 211, 238, 0.05)", borderColor: "rgba(34, 211, 238, 0.5)" }}
                                onClick={() => setSelectedSeed(id)}
                                className={cn(
                                  "px-3 py-1 border flex items-center gap-3 transition-all",
                                  selectedSeed === id ? "border-cyan-500 text-cyan-400 bg-cyan-500/10 shadow-[0_0_10px_rgba(34,211,238,0.2)]" : (isDarkMode ? "border-white/5 text-neutral-400" : "border-black/5 text-neutral-600")
                                )}
                              >
                                <span className="text-lg arcane-glow">{plant.emoji}</span>
                                <span className="text-[10px] font-mono font-bold">x{count}</span>
                              </motion.button>
                            </TooltipTrigger>
                            <TooltipContent className="bg-black border-cyan-500/50 text-cyan-400 font-gamer text-[10px]">
                              Select {plant.name} Seeds
                            </TooltipContent>
                          </Tooltip>
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
                  <GiPotionBall size={14} className="icon-themed" /> Potions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2 px-4">
                <div className="flex flex-wrap gap-3 min-h-[40px] items-center">
                  <AnimatePresence>
                    {(state.items?.speed_potion || 0) > 0 ? (
                      <Tooltip key="speed_potion">
                        <TooltipTrigger asChild>
                          <motion.button
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(168, 85, 247, 0.3)" }}
                            onClick={() => useItem("speed_potion")}
                            className={cn(
                              "px-4 py-1 border flex items-center gap-3 transition-all",
                              isDarkMode ? "bg-black border-purple-500 hover:bg-purple-500/10" : "bg-white border-purple-400 hover:bg-purple-400/10"
                            )}
                          >
                            <GiPotionBall size={16} className="icon-themed" />
                            <div className="text-[9px] font-gamer font-bold text-purple-300 uppercase tracking-widest">
                              Haste_Essence [x{state.items.speed_potion}]
                            </div>
                          </motion.button>
                        </TooltipTrigger>
                        <TooltipContent className="bg-black border-purple-500/50 text-purple-400 font-gamer text-[10px]">
                          Consume for 2x Growth Speed
                        </TooltipContent>
                      </Tooltip>
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
            <Card className={cn(
              magicStyle,
              isDarkMode ? "border-white/5" : "border-black/20",
              "pb-2"
            )}>
              <CardHeader className={cn(
                "py-2 px-5 border-b flex flex-row items-center justify-between",
                isDarkMode ? "border-white/5 bg-white/5" : "border-black/10 bg-black/5"
              )}>
                <CardTitle className="text-[10px] font-gamer font-bold flex items-center gap-3 opacity-80 tracking-widest">
                  <FaStore size={14} className="icon-themed" /> Seed Shop
                </CardTitle>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    className={cn(
                      "h-7 w-7 rounded-none border hover:border-cyan-500/50",
                      isDarkMode ? "border-white/10 bg-black text-white" : "border-black/10 bg-white text-black"
                    )}
                    onClick={() => scroll("left")}
                  >
                    <FaChevronLeft size={10} />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className={cn(
                      "h-7 w-7 rounded-none border hover:border-cyan-500/50",
                      isDarkMode ? "border-white/10 bg-black text-white" : "border-black/10 bg-white text-black"
                    )}
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
                            "inline-flex flex-col min-w-[140px] p-3 transition-all rounded-none relative border",
                            isDarkMode ? "border-white/5 bg-black/60" : "border-black/5 bg-white/60",
                            isLocked && "opacity-40 grayscale"
                          )}
                        >
                          {isLocked && (
                            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-1.5 pointer-events-none">
                              <FaLock size={14} className="text-cyan-400 arcane-glow" />
                              <div className="bg-black/80 px-2 py-0.5 border border-cyan-500/30">
                                <span className="text-[10px] font-gamer text-cyan-300 tracking-[0.2em] font-bold text-glow-cyan">LOCKED_L{plant.levelRequired}</span>
                              </div>
                            </div>
                          )}
                          <div className={cn("flex items-center justify-center mb-3 h-14 w-full border-b", isDarkMode ? "bg-black/40 border-white/5" : "bg-white/40 border-black/5")}>
                            <span className={cn("text-3xl group-hover:scale-125 transition-transform duration-500 arcane-glow", isLocked && "opacity-20")}>{plant.seedEmoji}</span>
                          </div>
                          <div className="mb-3">
                            <h3 className={cn("font-gamer font-bold text-[10px] truncate tracking-widest opacity-80", isDarkMode ? "text-white" : "text-black")}>{plant.name}</h3>
                            <div className="flex items-center justify-between mt-1">
                              <div className="text-[11px] font-mono font-bold text-amber-500 text-glow-cyan">
                                ${plant.cost.toLocaleString()}
                              </div>
                              <div className="text-[9px] text-neutral-600 font-mono font-bold uppercase">
                                {plant.growTime}S
                              </div>
                            </div>
                          </div>
                          <Tooltip>
                            <TooltipTrigger asChild>
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
                            </TooltipTrigger>
                            <TooltipContent className="bg-black border-cyan-500/50 text-cyan-400 font-gamer text-[10px]">
                              {isLocked ? `Unlock at Level ${plant.levelRequired}` : `Buy ${plant.name} Seed for $${plant.cost}`}
                            </TooltipContent>
                          </Tooltip>
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
                  <GiCrystalGrowth size={16} className="icon-themed" /> Sell Station
                </CardTitle>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      className="bg-amber-600/80 hover:bg-amber-500 text-black font-gamer font-bold h-7 rounded-none px-5 text-[9px] border-none tracking-[0.2em]"
                      onClick={() => setShowSellConfirm(true)}
                      disabled={Object.values(state.crops).every(count => count === 0)}
                    >
                      TRANSMUTE_ALL
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-black border-amber-500/50 text-amber-500 font-gamer text-[10px]">
                    Sell All Harvested Crops
                  </TooltipContent>
                </Tooltip>
              </CardHeader>
              <CardContent className="p-3">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
                  <AnimatePresence>
                    {Object.values(PLANTS).map((plant) => {
                      const count = state.crops[plant.id] || 0
                      if (count === 0) return null

                      return (
                        <Tooltip key={plant.id}>
                          <TooltipTrigger asChild>
                            <motion.div
                              layout
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0 }}
                              className={cn(
                                "border p-3 transition-all rounded-none flex flex-col items-center group shadow-[0_0_15px_rgba(0,0,0,0.5)]",
                                isDarkMode ? "border-white/5 bg-black/60" : "border-black/5 bg-white/60"
                              )}
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
                                className={cn(
                                  "w-full border-amber-500/30 hover:bg-amber-500/10 text-amber-500 rounded-none h-6 text-[9px] font-gamer tracking-widest",
                                  isDarkMode ? "bg-black" : "bg-white"
                                )}
                              >
                                CONVERT
                              </Button>
                            </motion.div>
                          </TooltipTrigger>
                          <TooltipContent className="bg-black border-amber-500/50 text-amber-500 font-gamer text-[10px]">
                            Transmute {count}x {plant.name} for ${(count * plant.sellPrice).toLocaleString()}
                          </TooltipContent>
                        </Tooltip>
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
        <footer className={cn(
          "mt-20 border-t py-8 px-6 transition-colors duration-500",
          isDarkMode ? "border-white/5 bg-black/80" : "border-black/5 bg-white/80"
        )}>
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
                <p className={cn(
                  "text-xs font-mono mb-6 uppercase tracking-wider leading-relaxed",
                  isDarkMode ? "text-neutral-400" : "text-neutral-600"
                )}>
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
                    className={cn(
                      "flex-1 border-white/10 hover:bg-white/5 rounded-none font-gamer font-bold h-10 tracking-[0.2em]",
                      isDarkMode ? "text-neutral-400 border-white/10" : "text-neutral-600 border-black/10"
                    )}
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
                  <FaTerminal size={24} className="animate-pulse text-white" />
                  <h3 className="text-xl font-gamer font-bold tracking-widest uppercase">Critical_Failure</h3>
                </div>
                <p className={cn(
                  "text-xs font-mono mb-8 uppercase tracking-wider leading-relaxed",
                  isDarkMode ? "text-neutral-400" : "text-neutral-600"
                )}>
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

        {/* Global Chat HUD */}
        <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-end gap-3">
          <AnimatePresence>
            {isChatOpen && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.9 }}
                className={cn(
                  "w-80 h-96 flex flex-col border shadow-2xl overflow-hidden",
                  magicStyle,
                  isDarkMode ? "bg-black/90 border-cyan-500/30" : "bg-white/95 border-cyan-500/50"
                )}
              >
                <div className="p-3 border-b border-white/10 bg-cyan-500/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-gamer font-bold text-cyan-400 tracking-widest uppercase">Global_Comm_Link</span>
                  </div>
                  <span className="text-[9px] font-mono text-neutral-500">ID: {username}</span>
                </div>

                <ScrollArea className="flex-1 p-4" ref={chatScrollRef}>
                  <div className="space-y-3">
                    {messages.length === 0 ? (
                      <div className="text-[9px] font-mono text-neutral-600 italic text-center py-4 uppercase tracking-widest">Awaiting signal...</div>
                    ) : (
                      messages.map((msg, i) => (
                        <div key={i} className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "text-[8px] px-1 font-bold rounded-none border",
                              msg.user === username ? "text-cyan-400 border-cyan-500/30 bg-cyan-500/5" : "text-purple-400 border-purple-500/30 bg-purple-500/5"
                            )}>
                              {msg.user}
                            </span>
                            <span className="text-[7px] font-mono text-neutral-700">[{new Date(msg.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' })}]</span>
                          </div>
                          <p className={cn(
                            "text-[10px] font-mono leading-relaxed break-words pl-1 border-l border-white/5",
                            isDarkMode ? "text-neutral-300" : "text-neutral-700"
                          )}>
                            {msg.message}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>

                <div className="p-3 border-t border-white/10 bg-black/20 flex gap-2">
                  <input
                    type="text"
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    placeholder="ENTER MESSAGE..."
                    className={cn(
                      "flex-1 bg-transparent border border-white/10 px-3 py-1.5 text-[10px] font-mono focus:outline-none focus:border-cyan-500/50 transition-colors",
                      isDarkMode ? "text-white" : "text-black"
                    )}
                  />
                  <Button
                    size="icon"
                    onClick={sendMessage}
                    disabled={!currentMessage.trim()}
                    className="h-8 w-8 bg-cyan-600 hover:bg-cyan-500 text-black rounded-none"
                  >
                    <FaPaperPlane size={10} />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <Button
            size="icon"
            onClick={() => setIsChatOpen(!isChatOpen)}
            className={cn(
              "h-12 w-12 rounded-none shadow-2xl transition-all duration-300 border-2",
              isChatOpen ? "bg-red-500/20 border-red-500 text-red-500" : "bg-cyan-600 border-cyan-400 text-black hover:scale-110",
              "arcane-glow"
            )}
          >
            <FaCommentAlt size={18} />
          </Button>
        </div>
      </div>
    </TooltipProvider>
  )
}
