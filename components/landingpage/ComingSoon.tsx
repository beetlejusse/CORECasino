"use client"

import { Card } from "@/components/ui/card"
import { Clock, Bell, Sparkles, Zap, Brain, Eye, Gamepad } from "lucide-react"
import { useState } from "react"

export function ComingSoonSection() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)

  return (
    <section className="py-16 lg:py-24 relative overflow-hidden">
        {/* <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.1),transparent_70%)]" /> */}

        <div className="absolute inset-0 opacity-20">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="grid"
              width="60"
              height="60"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 60 0 L 0 0 0 60"
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-6xl font-bold mb-6">
            Next-Gen Gaming
            <span className="block text-emerald-400">Experiences</span>
          </h2>

          <p className="text-lg sm:text-xl text-zinc-400 max-w-3xl mx-auto leading-relaxed">
            We're crafting revolutionary gaming experiences that push the boundaries of what's possible. Each game is
            designed to challenge, entertain, and reward in ways never seen before.
          </p>
        </div>

        {/* Newsletter Section */}
        <div className="max-w-2xl mx-auto">
          <Card className="bg-zinc-900/30 border-zinc-800/50 p-8 text-center backdrop-blur-sm">
            <div className="mb-6">
              <h3 className="text-2xl lg:text-3xl font-bold mb-3">Stay Ahead of the Game</h3>
              <p className="text-zinc-400">
                Join our exclusive community and be the first to experience these revolutionary games
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-white placeholder-zinc-400 focus:outline-none focus:border-emerald-500/50 transition-colors"
              />
              <button className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-semibold rounded-xl hover:from-emerald-500 hover:to-emerald-400 transition-all duration-300 hover:scale-105">
                Join Waitlist
              </button>
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}
