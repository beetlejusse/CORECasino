"use client";
import { ArrowRight, Shield, Zap, Trophy, Play, Sparkles } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 lg:pt-20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.1),transparent_50%)]" />
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
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 px-6 py-3 bg-zinc-900/60 backdrop-blur-sm border border-zinc-700/50 rounded-full mb-8 hover:bg-zinc-900/80 transition-all duration-300">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-zinc-300">
              Live Beta • Out Now
            </span>
            <Shield className="w-4 h-4 text-emerald-400" />
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-8xl font-bold mb-8 leading-tight">
            <span className="block">Where Skill Meets</span>
            <span className="block bg-gradient-to-r from-emerald-400 via-emerald-300 to-emerald-500 bg-clip-text text-transparent">
              Fortune
            </span>
          </h1>

          <p className="text-lg sm:text-xl lg:text-2xl text-zinc-400 mb-12 max-w-4xl mx-auto leading-relaxed">
            Step into the ultimate gaming arena where every bet is transparent,
            every win is instant, and every game is
            <span className="text-emerald-400 font-semibold">
              {" "}
              provably fair
            </span>
            . Built for the next generation of players.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center mb-16">
            <Link href="/home">
              <button className="group relative px-8 py-4 bg-emerald-600 text-white font-semibold rounded-2xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/25">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative flex items-center justify-center space-x-3">
                  <Play className="w-5 h-5" />
                  <span className="text-lg">Enter the Arena</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            </Link>

            <button className="group px-8 py-4 bg-transparent border-2 border-zinc-700 text-zinc-300 font-semibold rounded-2xl hover:border-emerald-500/50 hover:text-emerald-400 transition-all duration-300 hover:scale-105">
              <span className="text-lg">Watch Gameplay</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              {
                icon: Zap,
                text: "Lightning Payouts",
                color: "text-yellow-400",
              },
              {
                icon: Trophy,
                text: "Daily Competitions",
                color: "text-purple-400",
              },
              {
                icon: Shield,
                text: "Provably Fair Games",
                color: "text-emerald-400",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="flex flex-col items-center space-y-3 p-6 bg-zinc-900/30 backdrop-blur-sm border border-zinc-800/50 rounded-2xl hover:bg-zinc-900/50 transition-all duration-300 hover:scale-105"
              >
                <feature.icon className={`w-8 h-8 ${feature.color}`} />
                <span className="text-zinc-300 font-medium">
                  {feature.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
