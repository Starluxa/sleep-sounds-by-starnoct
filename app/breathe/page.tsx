'use client'

import { ChevronDown, Home, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import BreathingCircle from "@/components/custom/BreathingCircle"
import { useState } from "react"
import { cn, formatTimerDisplay } from "@/lib/utils"
import { useBreathing } from "@/hooks/useBreathing"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

export default function BreathePage() {
  const [duration, setDuration] = useState(4);
  const [uiVisible, setUiVisible] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const { phase, isActive, timeLeft, cycles, totalTime, toggle } = useBreathing()

  return (
    <div
      className="min-h-screen relative flex flex-col transition-opacity duration-500"
      onClick={(e) => {
        if (!(e.target as HTMLElement).closest('button') && !(e.target as HTMLElement).closest('[data-collapsible]') && !(e.target as HTMLElement).closest('a')) {
          setUiVisible((prev) => !prev)
        }
      }}
    >
      <header className={cn(
        "absolute top-0 left-0 right-0 p-4 z-30 max-w-4xl mx-auto flex items-center justify-between gap-4 transition-opacity duration-300",
        uiVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      )}>
        <h1 className="text-xl font-semibold text-white/90">Breathe</h1>
        <Link
          href="/"
          aria-label="Home"
          className="inline-flex items-center justify-center rounded-xl p-2.5 min-w-11 min-h-11 text-white/70 hover:text-white hover:bg-white/5 transition-colors shrink-0"
        >
          <Home className="h-6 w-6" />
        </Link>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4 pb-40 w-full max-w-md mx-auto">
        <div className="flex-1 flex flex-col items-center justify-center w-full">
          <BreathingCircle phase={phase} isActive={isActive} timeLeft={timeLeft} toggle={toggle} />
          
          <div className={cn(
            "flex gap-12 text-white/80 font-mono text-sm mt-8 transition-opacity duration-500",
            isActive ? "opacity-100" : "opacity-0"
          )}>
            <div className="flex flex-col items-center gap-1">
              <span className="text-[10px] uppercase tracking-widest opacity-50">Cycles</span>
              <span className="text-2xl font-bold">{cycles}</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-[10px] uppercase tracking-widest opacity-50">Time</span>
              <span className="text-2xl font-bold">{formatTimerDisplay(totalTime)}</span>
            </div>
          </div>
        </div>

        <div className={cn(
          "w-full space-y-4 transition-all duration-500 ease-in-out mb-8",
          uiVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        )}>
          <Collapsible
            open={isOpen}
            onOpenChange={setIsOpen}
            className="w-full bg-white/5 backdrop-blur-md rounded-xl border border-white/10 overflow-hidden"
            data-collapsible="true"
          >
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full flex items-center justify-between p-4 h-auto hover:bg-white/5 text-white/90">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-sky-400" />
                  <span className="font-medium">About 4-7-8 Breathing</span>
                </div>
                <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", isOpen && "rotate-180")} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="px-4 pb-4 text-sm text-white/70 space-y-3 animate-slide-down">
              <p>
                The 4-7-8 breathing technique is a rhythmic breathing pattern that aims to reduce anxiety and help people get to sleep.
              </p>
              <ul className="list-disc pl-4 space-y-1">
                <li><strong className="text-sky-300">Inhale</strong> quietly through the nose for 4 seconds.</li>
                <li><strong className="text-purple-300">Hold</strong> the breath for 7 seconds.</li>
                <li><strong className="text-indigo-300">Exhale</strong> forcefully through the mouth for 8 seconds.</li>
              </ul>
              <p className="text-xs opacity-80 pt-2 border-t border-white/10">
                <strong>Recommended Duration:</strong> 4 cycles (approx. 1 minute) for beginners, up to 8 cycles as you get comfortable.
              </p>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </main>
    </div>
  )
}