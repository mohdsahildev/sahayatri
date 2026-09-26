"use client";

import { useState, useCallback } from "react";
import ScenicCanvas from "@/components/scenic-route/scenic-canvas";
import ScenicHUD, { type ScenicMetrics } from "@/components/scenic-route/scenic-hud";
import ScenicStartScreen from "@/components/scenic-route/scenic-start-screen";
import ScenicPauseMenu from "@/components/scenic-route/scenic-pause-menu";
import { X, Keyboard } from "lucide-react";

export default function ScenicRoutePage() {
  const [gameState, setGameState] = useState<"start" | "playing" | "paused">("start");
  const [showHelp, setShowHelp] = useState(false);
  const [resetTrigger, setResetTrigger] = useState(0);

  const [metrics, setMetrics] = useState<ScenicMetrics>({
    speedKmh: 0,
    distanceMeters: 0,
    gear: "P",
    headingDeg: 0,
    isOnRoad: true,
  });

  const handleMetricsUpdate = useCallback((newMetrics: ScenicMetrics) => {
    setMetrics(newMetrics);
  }, []);

  const handleStartGame = () => {
    setGameState("playing");
  };

  const handleTogglePause = useCallback(() => {
    setGameState((prev) => {
      if (prev === "start") return "start";
      return prev === "playing" ? "paused" : "playing";
    });
  }, []);

  const handleResume = () => {
    setGameState("playing");
  };

  const handleResetCar = useCallback(() => {
    setResetTrigger((prev) => prev + 1);
  }, []);

  return (
    <main className="relative w-full h-screen overflow-hidden select-none bg-sky-200">
      {/* 3D Canvas Scene */}
      <ScenicCanvas
        gameState={gameState}
        onMetricsUpdate={handleMetricsUpdate}
        resetTrigger={resetTrigger}
        onPauseToggle={handleTogglePause}
        onResetCar={handleResetCar}
      />

      {/* Start Screen Overlay */}
      {gameState === "start" && (
        <ScenicStartScreen onStart={handleStartGame} />
      )}

      {/* In-Game HUD (Visible during gameplay and paused) */}
      {gameState !== "start" && (
        <ScenicHUD
          metrics={metrics}
          isPaused={gameState === "paused"}
          onTogglePause={handleTogglePause}
          onResetCar={handleResetCar}
          onShowHelp={() => setShowHelp(true)}
        />
      )}

      {/* Pause Menu Overlay */}
      {gameState === "paused" && (
        <ScenicPauseMenu
          metrics={metrics}
          onResume={handleResume}
          onResetCar={handleResetCar}
        />
      )}

      {/* Controls & Tips Help Modal */}
      {showHelp && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-[#1E2022]/40 p-4 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl border border-[#EAE6DF] bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE6DF]">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FAF0EB] text-[#C8522E]">
                  <Keyboard size={16} />
                </div>
                <div>
                  <h3 className="font-sans text-sm font-black text-[#1E2022]">
                    Driving Guide & Controls
                  </h3>
                  <span className="text-[10px] text-slate-400">
                    SahaYatri Scenic Simulator
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowHelp(false)}
                aria-label="Close help"
                className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-[#1E2022] transition"
              >
                <X size={16} />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="flex items-center justify-between rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] p-2.5">
                <span className="font-medium text-slate-700">Accelerate Forward</span>
                <div className="flex gap-1 font-mono">
                  <kbd className="rounded bg-white border px-2 py-0.5 font-bold text-[#1E2022]">W</kbd>
                  <span className="text-slate-400">or</span>
                  <kbd className="rounded bg-white border px-2 py-0.5 font-bold text-[#1E2022]">↑</kbd>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] p-2.5">
                <span className="font-medium text-slate-700">Brake / Reverse</span>
                <div className="flex gap-1 font-mono">
                  <kbd className="rounded bg-white border px-2 py-0.5 font-bold text-[#1E2022]">S</kbd>
                  <span className="text-slate-400">or</span>
                  <kbd className="rounded bg-white border px-2 py-0.5 font-bold text-[#1E2022]">↓</kbd>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] p-2.5">
                <span className="font-medium text-slate-700">Steer Left & Right</span>
                <div className="flex gap-1 font-mono">
                  <kbd className="rounded bg-white border px-2 py-0.5 font-bold text-[#1E2022]">A</kbd>
                  <kbd className="rounded bg-white border px-2 py-0.5 font-bold text-[#1E2022]">D</kbd>
                  <span className="text-slate-400">or</span>
                  <kbd className="rounded bg-white border px-2 py-0.5 font-bold text-[#1E2022]">←</kbd>
                  <kbd className="rounded bg-white border px-2 py-0.5 font-bold text-[#1E2022]">→</kbd>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] p-2.5">
                <span className="font-medium text-slate-700">Look Around / Orbit</span>
                <span className="font-semibold text-slate-600">Click & Move Mouse</span>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] p-2.5">
                <span className="font-medium text-slate-700">Respawn to Road</span>
                <kbd className="rounded bg-white border px-2 py-0.5 font-bold text-[#1E2022] font-mono">R</kbd>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] p-2.5">
                <span className="font-medium text-slate-700">Pause / Resume</span>
                <div className="flex gap-1 font-mono">
                  <kbd className="rounded bg-white border px-2 py-0.5 font-bold text-[#1E2022]">ESC</kbd>
                  <span className="text-slate-400">or</span>
                  <kbd className="rounded bg-white border px-2 py-0.5 font-bold text-[#1E2022]">P</kbd>
                </div>
              </div>
            </div>

            <div className="mt-5">
              <button
                type="button"
                onClick={() => setShowHelp(false)}
                className="w-full py-2.5 rounded-2xl bg-[#C8522E] font-sans text-xs font-bold text-white shadow-md hover:bg-[#B34524] transition"
              >
                Got It, Let&apos;s Drive!
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
