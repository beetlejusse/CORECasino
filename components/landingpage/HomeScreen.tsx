"use client";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import {
  Play,
  CloudLightning,
  ChevronRight,
  Sparkles,
  Zap,
  Trophy,
} from "lucide-react";
import { useEffect, useState } from "react";
import WalletModal from "@/components/landingpage/WalletModal";

export default function HeroSection() {
  const router = useRouter();
  const [showWalletModal, setShowWalletModal] = useState(false);
  const { isConnected } = useAccount();

  useEffect(() => {
    if (isConnected) {
      setShowWalletModal(false);
    }
  }, [isConnected]);

  const onArenaClick = () => {
    if (isConnected) {
      router.push("/arena");
    } else {
      setShowWalletModal(true);
    }
  };
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 lg:pt-20">
      <div className="absolute inset-0 bg-zinc-950" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(16,185,129,0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(59,130,246,0.1),transparent_50%)]" />

      <div className="absolute inset-0 opacity-5">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="grid"
              width="80"
              height="80"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 80 0 L 0 0 0 80"
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
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center mb-12">
            <div className="group relative inline-flex items-center space-x-3 px-6 py-3 bg-zinc-900 backdrop-blur-xl border border-zinc-700 hover:border-emerald-500 transition-all duration-500 rounded-full shadow-2xl hover:shadow-emerald-500/20">
              <div className="absolute inset-0 bg-emerald-500/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-400/50" />
              <span className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors duration-300">
                Powered by Core DAO
              </span>
              <CloudLightning className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform duration-300" />
              <div className="absolute -inset-1 bg-emerald-500/20 rounded-full blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
          </div>

          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 space-y-10">
              <div className="space-y-6">
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight">
                  <span className="block text-white hover:text-zinc-200 transition-colors duration-300">
                    No Time Limit
                  </span>
                  <span className="block text-emerald-400 hover:text-emerald-300 transition-colors duration-500">
                    Conquer the Market
                  </span>
                </h1>

                <div className="w-24 h-1 bg-emerald-500 rounded-full" />
              </div>

              <p className="text-xl text-zinc-400 leading-relaxed max-w-2xl hover:text-zinc-300 transition-colors duration-300">
                Step into the ultimate gaming arena where every bet is
                transparent, every win is instant, and every game is
                <span className="text-emerald-400 font-semibold hover:text-emerald-300 transition-colors duration-300">
                  {" "}
                  provably fair
                </span>
                . Built for the next generation of players who demand
                excellence.
              </p>
              <div className="flex flex-wrap gap-6">
                <button
                  onClick={onArenaClick}
                  className="group relative overflow-hidden flex items-center gap-3 px-8 py-4 bg-emerald-800 hover:bg-emerald-900/25 text-white font-semibold rounded-2xl"
                >
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <Play className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                  <span className="text-lg">Enter the Arena</span>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                  <div className="absolute inset-0 rounded-2xl bg-emerald-400/20 blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </button>
              </div>

              <div className="flex flex-wrap gap-8 pt-6">
                {randomData.map((stat, index) => (
                  <div
                    key={index}
                    className="group flex flex-col items-center space-y-2 p-4 rounded-2xl hover:bg-zinc-800/30 transition-all duration-300 cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <stat.icon className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform duration-300" />
                      <span className="text-3xl font-bold text-emerald-400 group-hover:text-emerald-300 transition-colors duration-300">
                        {stat.value}
                      </span>
                    </div>
                    <span className="text-sm text-zinc-500 group-hover:text-zinc-400 transition-colors duration-300">
                      {stat.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-1 w-full max-w-lg">
              <div className="group relative bg-zinc-900 backdrop-blur-2xl border border-zinc-700 rounded-3xl overflow-hidden shadow-2xl hover:shadow-emerald-500/10 transition-all duration-500 hover:scale-105 transform">
                <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="flex items-center justify-between p-6 border-b border-zinc-700 bg-zinc-800">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-4 h-4 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/50" />
                      <div className="absolute inset-0 w-4 h-4 bg-emerald-500 rounded-full animate-ping opacity-20" />
                    </div>
                    <span className="text-lg font-semibold text-zinc-200">
                      Core Arena
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3].map((dot) => (
                      <div
                        key={dot}
                        className="w-3 h-3 bg-zinc-600 rounded-full hover:bg-zinc-500 transition-colors duration-300 cursor-pointer"
                      />
                    ))}
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  <div className="flex justify-between items-center">
                    <div className="text-xl font-semibold text-zinc-200">
                      Live Games
                    </div>
                    <div className="text-sm text-emerald-400 hover:text-emerald-300 cursor-pointer transition-colors duration-300">
                      View All
                    </div>
                  </div>
                  {gameData.map((game, index) => (
                    <div
                      key={game.id}
                      className="group/item flex items-center justify-between p-4 rounded-2xl hover:bg-zinc-800 transition-all duration-300 cursor-pointer border border-transparent hover:border-zinc-700"
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center group-hover/item:scale-110 transition-transform duration-300">
                          <span className="text-sm font-bold text-emerald-400">
                            G{index + 1}
                          </span>
                          <div className="absolute inset-0 bg-emerald-500/10 rounded-2xl blur opacity-0 group-hover/item:opacity-100 transition-opacity duration-300" />
                        </div>
                        <div>
                          <div className="text-base font-semibold text-zinc-300 group-hover/item:text-white transition-colors duration-300">
                            Game #{game.id}
                          </div>
                          <div className="text-sm text-zinc-500 group-hover/item:text-zinc-400 transition-colors duration-300">
                            {game.players} players • {game.prize} prize
                          </div>
                        </div>
                      </div>
                      <button className="px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 text-sm font-semibold rounded-xl transition-all duration-300 hover:scale-105 transform">
                        Join
                      </button>
                    </div>
                  ))}

                  <div className="group/btn w-full py-4 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 text-base font-semibold rounded-2xl border border-emerald-500/20 hover:border-emerald-500/40 relative overflow-hidden cursor-auto">
                    <span className="relative flex items-center justify-center gap-2">
                      Start Playing Games Now
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showWalletModal && (
        <WalletModal onClose={() => setShowWalletModal(false)} />
      )}
    </section>
  );
}

const randomData = [
  { value: "25K+", label: "Active Players", icon: Trophy },
  { value: "$1.2M", label: "Total Prizes", icon: Zap },
  { value: "99.9%", label: "Uptime", icon: Sparkles },
];

const gameData = [
  { id: 1001, players: 12, prize: "$2.5K" },
  { id: 1002, players: 8, prize: "$1.8K" },
  { id: 1003, players: 15, prize: "$3.2K" },
];
