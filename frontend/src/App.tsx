import { useState, useRef, useEffect, lazy, Suspense } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useGameStore } from "./game/useGameStore"
import { PLANTS } from "./game/constants"
import GrowingPanel from "./game/GrowingPanel"
import { useTheme } from "@/components/theme-provider"
import { cn } from "@/lib/utils"

const FarmScene3D = lazy(() => import("./game/FarmScene3D"))

import { supabase, isSupabaseConfigured } from "@/lib/supabase"

// React Icons
import {
  FaCoins,
  FaBriefcase,
  FaLock,
  FaStore,
  FaBolt,
  FaSeedling,
  FaComments,
  FaEllipsisH,
  FaTrashAlt,
  FaPaperPlane,
  FaTimes,
  FaSun,
  FaMoon,
} from "react-icons/fa"
import { GiPotionBall, GiCrystalGrowth } from "react-icons/gi"

const compact = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 })

const formatDuration = (seconds: number) => {
  if (seconds < 60) return `${seconds}s`
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`
  return `${Math.round(seconds / 3600)}h`
}

const tipClass = "border border-slate-700 bg-slate-900 text-xs text-slate-100"

const POTIONS = [
  { id: "speed_potion", name: "Haste Essence", hint: "Consume for 2x growth speed", Icon: GiPotionBall, tone: "t-violet" },
  { id: "harvest_potion", name: "Gatherer's Gale", hint: "Instantly harvest all ready crops", Icon: GiCrystalGrowth, tone: "t-gold" },
  { id: "finish_potion", name: "Chrono Essence", hint: "Select, then click a growing crop to finish it", Icon: GiCrystalGrowth, tone: "t-sky" },
] as const

interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  confirmLabel: string
  tone: "amber" | "emerald" | "red"
  onConfirm: () => void
  onCancel: () => void
}

function ConfirmDialog({ open, title, description, confirmLabel, tone, onConfirm, onCancel }: ConfirmDialogProps) {
  const toneClass = {
    amber: "bg-amber-500 text-black hover:bg-amber-400",
    emerald: "bg-emerald-500 text-black hover:bg-emerald-400",
    red: "bg-red-600 text-white hover:bg-red-500",
  }[tone]

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.96, opacity: 0, y: 8 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: 8 }}
            className="panel relative w-full max-w-sm p-5"
          >
            <h3 className="ink text-base font-semibold">{title}</h3>
            <p className="muted mt-2 text-sm leading-relaxed">{description}</p>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="outline" size="sm" className="rounded-md" onClick={onCancel}>
                Cancel
              </Button>
              <Button size="sm" className={cn("rounded-md font-semibold", toneClass)} onClick={onConfirm}>
                {confirmLabel}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default function App() {
  const { state, toasts, buySeed, plantSeed, harvestCrop, sellCrop, sellSeed, instantFinish, sellAllCrops, buySlot, sellSlot, nextSlotCost, lastSlotSellPrice, useItem: consumeItem, isSpeedBoosted, expToNextLevel, resetGame, addToast } = useGameStore()
  const [selectedSeed, setSelectedSeed] = useState<string | null>(null)
  const [selectedItem, setSelectedItem] = useState<string | null>(null)
  const [showSellConfirm, setShowSellConfirm] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [slotToSell, setSlotToSell] = useState<number | null>(null)
  
  const { theme, setTheme } = useTheme()
  const isDarkMode = theme === "dark" || (theme === "system" && typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches)
  const toggleTheme = () => {
    setTheme(isDarkMode ? "light" : "dark")
  }
  const chatScrollRef = useRef<HTMLDivElement>(null)

  // Chat State
  const [messages, setMessages] = useState<{ id: string; user: string; message: string; timestamp: number }[]>([])
  const [currentMessage, setCurrentMessage] = useState("")
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [username] = useState(() => `Player_${Math.floor(Math.random() * 9000) + 1000}`)
  const [isChatConnected, setIsChatConnected] = useState(false)
  const channelRef = useRef<ReturnType<NonNullable<typeof supabase>["channel"]> | null>(null)

  useEffect(() => {
    if (!supabase) {
      console.log("Supabase chat: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY not set. Using local channel mode.")
      setIsChatConnected(true)
      return
    }

    const client = supabase

    // Initial load: fetch past messages from 'messages' table if it exists
    const loadPastMessages = async () => {
      try {
        const { data, error } = await client
          .from("messages")
          .select("id, user, message, created_at")
          .order("created_at", { ascending: false })
          .limit(50)

        if (!error && data && data.length > 0) {
          const loaded = data.reverse().map((row: { id: string | number; user?: string; username?: string; message: string; created_at?: string }) => ({
            id: String(row.id),
            user: row.user || row.username || "Anonymous",
            message: row.message,
            timestamp: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
          }))
          setMessages(loaded)
        }
      } catch (err) {
        console.warn("Supabase initial messages fetch skipped:", err)
      }
    }
    loadPastMessages()

    // Subscribe to both real-time broadcast and DB inserts
    const channel = client.channel("global-chat", {
      config: { broadcast: { self: true } },
    })

    channel
      .on("broadcast", { event: "chat_message" }, (payload) => {
        if (payload?.payload) {
          setMessages((prev) => [...prev, payload.payload].slice(-50))
        }
      })
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const newRow = payload.new as { id?: string | number; user?: string; username?: string; message?: string; created_at?: string }
          if (newRow?.message) {
            const formatted = {
              id: String(newRow.id || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`),
              user: newRow.user || newRow.username || "Anonymous",
              message: newRow.message,
              timestamp: newRow.created_at ? new Date(newRow.created_at).getTime() : Date.now(),
            }
            setMessages((prev) => {
              if (prev.some((m) => m.id === formatted.id)) return prev
              return [...prev, formatted].slice(-50)
            })
          }
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setIsChatConnected(true)
        } else if (status === "CHANNEL_ERROR") {
          setIsChatConnected(false)
          addToast("Chat connection issue", "xp")
        }
      })

    channelRef.current = channel

    return () => {
      client.removeChannel(channel)
    }
  }, [addToast])

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight
    }
  }, [messages, isChatOpen])

  const sendMessage = async () => {
    const trimmed = currentMessage.trim()
    if (!trimmed) return

    const newMsg = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      user: username,
      message: trimmed,
      timestamp: Date.now(),
    }

    setCurrentMessage("")

    if (supabase && channelRef.current) {
      try {
        // Send via realtime broadcast
        await channelRef.current.send({
          type: "broadcast",
          event: "chat_message",
          payload: newMsg,
        })

        // Also persist to Supabase database table if available
        supabase
          .from("messages")
          .insert({
            user: username,
            message: trimmed,
          })
          .then(({ error }) => {
            if (error) {
              console.debug("Note: 'messages' table not configured or insert restricted:", error.message)
            }
          })
      } catch (err) {
        console.error("Supabase send error:", err)
        // Ensure local feedback
        setMessages((prev) => [...prev, newMsg].slice(-50))
      }
    } else {
      // Local fallback when Supabase keys are not set yet
      setMessages((prev) => [...prev, newMsg].slice(-50))
    }
  }

  const [selectedPlot, setSelectedPlot] = useState<number | null>(null)

  const plantSelectedSeed = (index: number) => {
    if (!selectedSeed) return
    const success = plantSeed(index, selectedSeed)
    if (success && (state.inventory[selectedSeed] || 0) <= 1) {
      setSelectedSeed(null)
    }
  }

  // Clicking a plot does the obvious thing when there is one, otherwise it selects the plot
  const handlePlotSelect = (index: number) => {
    const slot = state.slots[index]
    if (slot?.isHarvestable) {
      harvestCrop(index)
      return
    }
    if (!slot && selectedSeed) {
      plantSelectedSeed(index)
      return
    }
    if (slot && selectedItem === "finish_potion") {
      instantFinish(index)
      setSelectedItem(null)
      return
    }
    setSelectedPlot((prev) => (prev === index ? null : index))
  }

  const ownedSeeds = Object.entries(state.inventory).filter(([, count]) => count > 0)
  const ownedCrops = Object.values(PLANTS).filter((plant) => (state.crops[plant.id] || 0) > 0)
  const cropsValue = ownedCrops.reduce((sum, plant) => sum + (state.crops[plant.id] || 0) * plant.sellPrice, 0)

  const toastTone = {
    success: "border-l-emerald-400",
    info: "border-l-sky-400",
    xp: "border-l-amber-400",
    item: "border-l-violet-400",
  } as const

  return (
    <TooltipProvider delayDuration={200}>
      <div className="ink flex min-h-screen flex-col font-sans transition-colors duration-300 selection:bg-emerald-500/30 lg:h-screen lg:overflow-hidden">
        {/* Toast notifications */}
        <div className="pointer-events-none fixed right-4 top-16 z-50 flex flex-col items-end gap-2">
          <AnimatePresence>
            {toasts.map((toast) => (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 24, transition: { duration: 0.2 } }}
                className={cn("panel ink min-w-[200px] border-l-4 px-3 py-2 text-sm font-medium", toastTone[toast.type])}
              >
                {toast.message}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Header */}
        <header className="app-header relative z-40 flex h-14 shrink-0 items-center justify-between gap-3 px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
              <FaSeedling size={16} />
            </div>
            <div className="flex items-center gap-3">
              <h1
                className="ink cursor-default text-base font-semibold tracking-tight"
              >
                AFK Farm
              </h1>
              {isSpeedBoosted && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="pill t-violet cursor-help">
                      <FaBolt size={10} /> 2x growth
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className={tipClass}>
                    Haste Essence active
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="hidden w-40 cursor-help flex-col gap-1 sm:flex">
                  <div className="flex items-baseline justify-between text-xs">
                    <span className="ink font-semibold">Level {state.level}</span>
                    <span className="muted tabular-nums">
                      {state.exp}/{expToNextLevel} XP
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-[var(--surface-3)]">
                    <motion.div
                      className="h-full rounded-full bg-emerald-400"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (state.exp / expToNextLevel) * 100)}%` }}
                    />
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className={tipClass}>
                {expToNextLevel - state.exp} XP to level {state.level + 1}
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <div className="chip flex h-9 cursor-help items-center gap-2 px-3">
                  <FaCoins size={14} className="t-gold" />
                  <span className="ink text-sm font-semibold tabular-nums">{state.money.toLocaleString()}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className={tipClass}>
                Available coins
              </TooltipContent>
            </Tooltip>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsChatOpen((open) => !open)}
              className={cn("chip h-9 gap-2 rounded-lg px-3 text-xs", isChatOpen && "border-emerald-400")}
              data-active={isChatOpen}
            >
              <FaComments size={13} />
              <span className="hidden md:inline">Chat</span>
            </Button>

            <Button variant="ghost" size="icon" onClick={toggleTheme} className="chip h-9 w-9 rounded-lg" aria-label="Toggle theme">
              {isDarkMode ? <FaSun size={14} /> : <FaMoon size={14} />}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="chip h-9 w-9 rounded-lg" aria-label="More">
                  <FaEllipsisH size={14} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[170px] text-sm">
                <DropdownMenuItem onClick={() => setShowResetConfirm(true)} className="t-danger cursor-pointer focus:text-red-400">
                  <FaTrashAlt /> Reset save
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Chat popover */}
        <AnimatePresence>
          {isChatOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="panel fixed right-4 top-16 z-[60] flex w-[min(360px,calc(100vw-2rem))] flex-col overflow-hidden"
            >
              <div className="panel-head">
                <div className="panel-title">
                  <span className={cn("h-2 w-2 rounded-full", isChatConnected ? "bg-emerald-400" : "bg-amber-400 animate-pulse")} />
                  Global chat
                  {isSupabaseConfigured && (
                    <span className="pill text-[9px] t-sky">Supabase</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="muted text-[11px]">{username}</span>
                  <button className="muted hover:text-[color:var(--ink)]" onClick={() => setIsChatOpen(false)} aria-label="Close chat">
                    <FaTimes size={12} />
                  </button>
                </div>
              </div>
              <ScrollArea className="h-64 w-full" ref={chatScrollRef}>
                <div className="space-y-2 p-3">
                  {messages.length === 0 ? (
                    <div className="muted py-10 text-center text-xs">No messages yet. Say hello!</div>
                  ) : (
                    messages.map((msg) => (
                      <div key={msg.id} className="text-[13px] leading-snug">
                        <span className={cn("mr-2 text-xs font-semibold", msg.user === username ? "t-accent" : "t-violet")}>{msg.user}</span>
                        <span className="ink opacity-90">{msg.message}</span>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
              <div className="flex gap-2 border-t border-[color:var(--line)] p-2">
                <input
                  type="text"
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Send a message..."
                  className="field-input"
                />
                <Button
                  onClick={sendMessage}
                  disabled={!currentMessage.trim()}
                  size="icon"
                  className="h-9 w-9 shrink-0 rounded-lg bg-emerald-500 text-black hover:bg-emerald-400"
                  aria-label="Send"
                >
                  <FaPaperPlane size={12} />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dashboard */}
        <main className="grid min-h-0 flex-1 gap-3 p-3 lg:grid-cols-[minmax(0,1fr)_320px] lg:grid-rows-[minmax(0,1fr)_auto]">
          {/* Field */}
          <section className="panel flex h-[380px] min-h-0 flex-col overflow-hidden lg:col-start-1 lg:row-start-1 lg:h-auto">
            <div className="panel-head">
              <div className="panel-title">
                <FaSeedling size={12} /> Field
                <span className="pill normal-case tracking-normal">{state.unlockedSlots} plots</span>
              </div>
              <AnimatePresence mode="wait">
                {selectedSeed ? (
                  <motion.div key="seed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2 text-xs">
                    <span className="muted">Planting</span>
                    <span className="pill t-accent">
                      {PLANTS[selectedSeed].emoji} {PLANTS[selectedSeed].name}
                      <button onClick={() => setSelectedSeed(null)} aria-label="Cancel planting" className="ml-1 opacity-70 hover:opacity-100">
                        <FaTimes size={10} />
                      </button>
                    </span>
                  </motion.div>
                ) : selectedItem === "finish_potion" ? (
                  <motion.div key="item" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2 text-xs">
                    <span className="muted">Click a growing crop</span>
                    <span className="pill t-sky">
                      Chrono Essence
                      <button onClick={() => setSelectedItem(null)} aria-label="Cancel" className="ml-1 opacity-70 hover:opacity-100">
                        <FaTimes size={10} />
                      </button>
                    </span>
                  </motion.div>
                ) : (
                  <motion.span key="hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="muted hidden text-xs sm:inline">
                    Drag to orbit - scroll to zoom - click a plot
                  </motion.span>
                )}
              </AnimatePresence>
            </div>

            <div className="relative min-h-[240px] flex-1">
              <div className="absolute inset-0">
                <Suspense
                  fallback={<div className="muted flex h-full w-full animate-pulse items-center justify-center text-xs">Loading field...</div>}
                >
                  <FarmScene3D
                    slots={state.slots}
                    unlockedSlots={state.unlockedSlots}
                    nextSlotCost={nextSlotCost}
                    money={state.money}
                    isSpeedBoosted={isSpeedBoosted}
                    isDarkMode={isDarkMode}
                    selectedPlot={selectedPlot}
                    onSelectPlot={handlePlotSelect}
                    onBuySlot={buySlot}
                  />
                </Suspense>
              </div>

              <AnimatePresence>
                {selectedPlot !== null && selectedPlot < state.unlockedSlots && (() => {
                  const slot = state.slots[selectedPlot]
                  const plant = slot ? PLANTS[slot.plantId] : null
                  return (
                    <motion.div
                      key="plot-actions"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="panel absolute bottom-3 left-1/2 flex max-w-[calc(100%-1.5rem)] -translate-x-1/2 flex-wrap items-center justify-center gap-2 px-3 py-2 text-xs"
                    >
                      <span className="ink mr-1 font-medium">
                        Plot {selectedPlot + 1}
                        <span className="muted font-normal"> - {slot ? `${plant?.name} (${slot.isHarvestable ? "ready" : "growing"})` : "empty"}</span>
                      </span>
                      {slot?.isHarvestable && (
                        <Button size="sm" className="h-7 rounded-md bg-emerald-500 px-3 text-xs text-black hover:bg-emerald-400" onClick={() => harvestCrop(selectedPlot)}>
                          Harvest
                        </Button>
                      )}
                      {slot && !slot.isHarvestable && selectedItem === "finish_potion" && (
                        <Button size="sm" className="h-7 rounded-md bg-sky-500 px-3 text-xs text-black hover:bg-sky-400" onClick={() => { instantFinish(selectedPlot); setSelectedItem(null) }}>
                          Use Chrono Essence
                        </Button>
                      )}
                      {!slot && selectedSeed && (
                        <Button size="sm" className="h-7 rounded-md bg-emerald-500 px-3 text-xs text-black hover:bg-emerald-400" onClick={() => plantSelectedSeed(selectedPlot)}>
                          Plant {PLANTS[selectedSeed].name}
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="t-danger h-7 rounded-md px-3 text-xs"
                        disabled={state.unlockedSlots <= 1 || slot !== null}
                        onClick={() => setSlotToSell(selectedPlot)}
                      >
                        Sell plot ${compact.format(lastSlotSellPrice)}
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 rounded-md" onClick={() => setSelectedPlot(null)} aria-label="Close">
                        <FaTimes size={11} />
                      </Button>
                    </motion.div>
                  )
                })()}
              </AnimatePresence>
            </div>
          </section>

          {/* Seed shop */}
          <section className="panel lg:col-start-1 lg:row-start-2">
            <div className="panel-head">
              <div className="panel-title">
                <FaStore size={12} /> Seed shop
              </div>
              <span className="muted text-xs">Click a seed to buy</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 p-2 sm:grid-cols-5 md:grid-cols-6 xl:grid-cols-9">
              {Object.values(PLANTS).map((plant) => {
                const isLocked = state.level < plant.levelRequired
                const canAfford = state.money >= plant.cost
                return (
                  <Tooltip key={plant.id}>
                    <TooltipTrigger asChild>
                      <div>
                        <button
                          onClick={() => buySeed(plant.id)}
                          disabled={isLocked || !canAfford}
                          className={cn(
                            "chip relative flex w-full flex-col items-center gap-0.5 px-1.5 pb-1.5 pt-2 text-center transition-all",
                            isLocked
                              ? "border-amber-500/25 bg-amber-500/[0.03] cursor-not-allowed"
                              : canAfford
                              ? "hover:border-emerald-500/40 hover:bg-emerald-500/[0.04]"
                              : "opacity-80"
                          )}
                        >
                          {isLocked && (
                            <span className="absolute top-1 right-1 flex items-center gap-0.5 rounded bg-zinc-950/90 px-1 py-0.5 text-[8px] font-bold text-amber-400 border border-amber-500/40 shadow-xs">
                              <FaLock size={7} />
                              <span>Lv {plant.levelRequired}</span>
                            </span>
                          )}
                          <span className="text-2xl leading-none">{plant.seedEmoji}</span>
                          <span className="ink mt-1 w-full truncate text-[11px] font-medium">{plant.name}</span>
                          <span className={cn("text-[11px] font-semibold tabular-nums", !isLocked && canAfford ? "t-gold" : "muted")}>
                            ${compact.format(plant.cost)}
                          </span>
                          <span className="muted text-[10px] leading-none">{formatDuration(plant.growTime)}</span>
                        </button>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className={tipClass}>
                      {isLocked
                        ? `Locked - Unlocks at level ${plant.levelRequired} ($${plant.cost.toLocaleString()} to buy, sells for $${plant.sellPrice.toLocaleString()})`
                        : `${plant.name}: $${plant.cost.toLocaleString()} - sells for $${plant.sellPrice.toLocaleString()} - grows in ${formatDuration(plant.growTime)}`}
                    </TooltipContent>
                  </Tooltip>
                )
              })}
            </div>
          </section>

          {/* Sidebar: inventory, potions, sell station */}
          <aside className="flex min-h-0 flex-col gap-3 lg:col-start-2 lg:row-span-2 lg:row-start-1">
            <section className="panel shrink-0">
              <div className="panel-head">
                <div className="panel-title">
                  <FaBriefcase size={12} /> Inventory
                </div>
                <span className="muted text-xs">{ownedSeeds.reduce((n, [, c]) => n + c, 0)} seeds</span>
              </div>
              <div className="flex min-h-[3.25rem] flex-wrap content-start gap-1.5 p-2">
                {ownedSeeds.length === 0 ? (
                  <span className="muted self-center px-1 text-xs">No seeds. Buy some from the shop.</span>
                ) : (
                  ownedSeeds.map(([id, count]) => {
                    const plant = PLANTS[id]
                    return (
                      <Tooltip key={id}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <TooltipTrigger asChild>
                              <button
                                data-active={selectedSeed === id}
                                className="chip flex items-center gap-1.5 px-2 py-1"
                              >
                                <span className="text-lg leading-none">{plant.emoji}</span>
                                <span className="ink text-xs font-semibold tabular-nums">{count}</span>
                              </button>
                            </TooltipTrigger>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="min-w-[150px] text-sm">
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedSeed(id)
                                setSelectedItem(null)
                              }}
                              className="cursor-pointer"
                            >
                              Plant {plant.name}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => sellSeed(id)} className="t-danger cursor-pointer focus:text-red-400">
                              Sell 1x for ${Math.floor(plant.cost * 0.5).toLocaleString()}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <TooltipContent className={tipClass}>{plant.name} seeds - click for options</TooltipContent>
                      </Tooltip>
                    )
                  })
                )}
              </div>
            </section>

            <section className="panel shrink-0">
              <div className="panel-head">
                <div className="panel-title">
                  <GiPotionBall size={14} /> Potions
                </div>
              </div>
              <div className="grid grid-cols-3 gap-1.5 p-2">
                {POTIONS.map(({ id, name, hint, Icon, tone }) => {
                  const count = state.items?.[id] || 0
                  const active = selectedItem === id
                  return (
                    <Tooltip key={id}>
                      <TooltipTrigger asChild>
                        <div>
                          <button
                            disabled={count === 0}
                            data-active={active}
                            onClick={() => {
                              if (id === "finish_potion") {
                                if (active) {
                                  setSelectedItem(null)
                                } else {
                                  setSelectedItem("finish_potion")
                                  setSelectedSeed(null)
                                }
                              } else {
                                consumeItem(id)
                              }
                            }}
                            className={cn("chip flex w-full flex-col items-center gap-0.5 px-1 py-1.5", count === 0 && "opacity-40")}
                          >
                            <Icon size={18} className={tone} />
                            <span className="ink w-full truncate text-[10px] font-medium">{name.split(" ")[0]}</span>
                            <span className="muted text-[11px] font-semibold tabular-nums">x{count}</span>
                          </button>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className={tipClass}>
                        {name}: {hint}
                      </TooltipContent>
                    </Tooltip>
                  )
                })}
              </div>
            </section>

            <GrowingPanel
              slots={state.slots}
              unlockedSlots={state.unlockedSlots}
              isSpeedBoosted={isSpeedBoosted}
              onSelectPlot={handlePlotSelect}
              className="flex-1"
            />

            <section className="panel flex min-h-0 flex-1 flex-col">
              <div className="panel-head">
                <div className="panel-title">
                  <GiCrystalGrowth size={14} /> Sell station
                </div>
                <Button
                  size="sm"
                  className="h-7 rounded-md bg-amber-500 px-3 text-xs font-semibold text-black hover:bg-amber-400"
                  onClick={() => setShowSellConfirm(true)}
                  disabled={ownedCrops.length === 0}
                >
                  Sell all{cropsValue > 0 && ` - $${compact.format(cropsValue)}`}
                </Button>
              </div>
              <div className="min-h-[7rem] flex-1 overflow-y-auto p-2">
                {ownedCrops.length === 0 ? (
                  <div className="muted flex h-full min-h-[5rem] items-center justify-center rounded-lg border border-dashed border-[color:var(--line)] text-xs">
                    Harvested crops will appear here
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-1.5">
                    {ownedCrops.map((plant) => {
                      const count = state.crops[plant.id] || 0
                      return (
                        <Tooltip key={plant.id}>
                          <TooltipTrigger asChild>
                            <button onClick={() => sellCrop(plant.id)} className="chip flex items-center gap-1.5 px-2 py-1.5">
                              <span className="text-base leading-none">{plant.emoji}</span>
                              <span className="ink text-[11px] font-semibold tabular-nums">x{count}</span>
                              <span className="t-gold ml-auto text-[11px] font-semibold tabular-nums">${compact.format(count * plant.sellPrice)}</span>
                            </button>
                          </TooltipTrigger>
                          <TooltipContent className={tipClass}>
                            Sell {count}x {plant.name} for ${(count * plant.sellPrice).toLocaleString()}
                          </TooltipContent>
                        </Tooltip>
                      )
                    })}
                  </div>
                )}
              </div>
            </section>
          </aside>
        </main>

        <ConfirmDialog
          open={showSellConfirm}
          title="Sell all crops?"
          description={`Convert every harvested crop into coins${cropsValue > 0 ? ` (about $${cropsValue.toLocaleString()})` : ""}. This can't be undone.`}
          confirmLabel="Sell all"
          tone="amber"
          onConfirm={() => {
            sellAllCrops()
            setShowSellConfirm(false)
          }}
          onCancel={() => setShowSellConfirm(false)}
        />

        <ConfirmDialog
          open={slotToSell !== null}
          title="Sell this plot?"
          description={`Are you sure you want to deconstruct this field node? You will receive a 50% refund of $${lastSlotSellPrice.toLocaleString()}.`}
          confirmLabel="Confirm"
          tone="emerald"
          onConfirm={() => {
            if (slotToSell !== null) sellSlot(slotToSell)
            setSlotToSell(null)
            setSelectedPlot(null)
          }}
          onCancel={() => setSlotToSell(null)}
        />

        <ConfirmDialog
          open={showResetConfirm}
          title="Reset your save?"
          description="This permanently erases all coins, levels and items. This action cannot be undone."
          confirmLabel="Reset everything"
          tone="red"
          onConfirm={() => {
            resetGame()
            setShowResetConfirm(false)
          }}
          onCancel={() => setShowResetConfirm(false)}
        />
      </div>
    </TooltipProvider>
  )
}
