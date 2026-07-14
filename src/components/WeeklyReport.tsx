'use client';

import React, { useState } from 'react';
import { WorkoutSession } from '../types/gym';

interface WeeklyReportProps {
  sessions: WorkoutSession[];
}

export default function WeeklyReport({ sessions }: WeeklyReportProps) {
  // Stable react state for pura rendering conformity
  const [now] = useState(() => Date.now());

  // Let's filter sessions from the last 7 days to represent the current week
  const getWeeklyStats = () => {
    const oneWeekAgoMs = now - 7 * 24 * 60 * 60 * 1000;
    const weeklySessions = sessions.filter(s => new Date(s.date).getTime() >= oneWeekAgoMs);

    // completed workouts (cap at 5 for progress target)
    const completedCount = Math.min(5, weeklySessions.length);

    // total sets count
    const totalSets = weeklySessions.reduce((sum, s) => sum + s.sets.length, 0);

    // XP earned
    const xpEarned = weeklySessions.reduce((sum, s) => sum + (s.xpGained || 0), 0);

    // Tonnage volume calculation: Weight * Reps per set, converted to Metric Tonnes (t)
    const totalKg = weeklySessions.reduce((sum, s) => {
      const sessionKg = s.sets.reduce((setSum, set) => setSum + (set.weight * set.reps), 0);
      return sum + sessionKg;
    }, 0);
    const volumeTonnes = (totalKg / 1000).toFixed(1);

    // Personal Records (PRs) -> calculate sets with RPE >= 9
    const prCount = weeklySessions.reduce((sum, s) => {
      const prSets = s.sets.filter(set => set.rpe && set.rpe >= 9).length;
      return sum + prSets;
    }, 0);

    // Map which week days (Mon-Sun) have sessions
    const completedDays = {
      Mon: false,
      Tue: false,
      Wed: false,
      Thu: false,
      Fri: false,
      Sat: false,
      Sun: false,
    };

    weeklySessions.forEach(s => {
      const dayIndex = new Date(s.date).getDay(); // 0 is Sunday, 1 is Monday, etc.
      const daysMap: Array<keyof typeof completedDays> = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const dayName = daysMap[dayIndex];
      completedDays[dayName] = true;
    });

    return {
      completedCount,
      totalSets,
      xpEarned,
      volumeTonnes,
      prCount,
      completedDays,
    };
  };

  const stats = getWeeklyStats();

  // Mon-Sun list for the weekly indicator tracker
  const DAYS_LIST: Array<{ key: keyof typeof stats.completedDays; label: string }> = [
    { key: 'Mon', label: 'Mon' },
    { key: 'Tue', label: 'Tue' },
    { key: 'Wed', label: 'Wed' },
    { key: 'Thu', label: 'Thu' },
    { key: 'Fri', label: 'Fri' },
    { key: 'Sat', label: 'Sat' },
    { key: 'Sun', label: 'Sun' },
  ];

  return (
    <div className="space-y-6">

      {/* Central Completed Workouts Card (With Purple Fire Aura & Circular Progress Ring - as in 2.webp) */}
      <div className="purple-fire-aura p-6 rounded-3xl text-center space-y-4 relative overflow-hidden">
        {/* Soft background grid lines */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.06)_0%,transparent_70%)] pointer-events-none" />

        <span className="text-[10px] text-fuchsia-400 font-black tracking-widest uppercase block">WEEKLY REPORT</span>

        {/* SVG Circular Progress Ring */}
        <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Dark background track */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="transparent"
              stroke="#0f172a"
              strokeWidth="8"
            />
            {/* Glowing neon progress arc */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="transparent"
              stroke="url(#progress-grad)"
              strokeWidth="8"
              strokeDasharray={251.2}
              strokeDashoffset={251.2 - (251.2 * (stats.completedCount / 5))}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />

            {/* Gradients declaration inside SVG */}
            <defs>
              <linearGradient id="progress-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
          </svg>

          {/* Centered count metrics */}
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-3xl font-black text-slate-100 font-mono leading-none">
              {stats.completedCount}
            </span>
            <span className="text-xs text-slate-500 font-bold mt-1">/ 5</span>
          </div>
        </div>

        <h4 className="text-sm font-black text-slate-200 uppercase tracking-wide">Workouts Completed</h4>
      </div>

      {/* Selector de días de la semana with cybernetic ticks (as in 2.webp) */}
      <div className="bg-slate-950 p-4.5 rounded-2.5xl border border-slate-900 shadow-sunken flex justify-between items-center">
        {DAYS_LIST.map((day) => {
          const isDone = stats.completedDays[day.key];
          return (
            <div key={day.key} className="flex flex-col items-center space-y-2">
              <span className="text-[10px] text-slate-500 font-black">{day.label}</span>

              {/* Circular Day tick node */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all ${
                isDone
                  ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.25)]'
                  : 'bg-slate-900/60 border-slate-800 text-slate-600'
              }`}>
                {isDone ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4.5 h-4.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Grid of four Weekly Stats Cards wrapped in Purple Fire Aura */}
      <div className="grid grid-cols-2 gap-4">

        {/* XP Earned Card */}
        <div className="purple-fire-aura p-4 rounded-2xl relative overflow-hidden">
          <div className="absolute top-2 right-2 text-fuchsia-500 font-bold text-xs opacity-30">★</div>
          <span className="text-[9px] text-slate-500 font-black uppercase tracking-wider block">XP Earned</span>
          <span className="text-xl font-black text-slate-200 mt-2 block font-mono">{stats.xpEarned}</span>
        </div>

        {/* Volume Card */}
        <div className="purple-fire-aura p-4 rounded-2xl relative overflow-hidden">
          <div className="absolute top-2 right-2 text-cyan-500 font-bold text-xs opacity-30">⚔</div>
          <span className="text-[9px] text-slate-500 font-black uppercase tracking-wider block">Volume</span>
          <span className="text-xl font-black text-slate-200 mt-2 block font-mono">
            {stats.volumeTonnes}<span className="text-xs text-slate-500 font-black uppercase ml-0.5">t</span>
          </span>
        </div>

        {/* Total Sets Card */}
        <div className="purple-fire-aura p-4 rounded-2xl relative overflow-hidden">
          <div className="absolute top-2 right-2 text-purple-500 font-bold text-xs opacity-30">⟳</div>
          <span className="text-[9px] text-slate-500 font-black uppercase tracking-wider block">Total Sets</span>
          <span className="text-xl font-black text-slate-200 mt-2 block font-mono">{stats.totalSets}</span>
        </div>

        {/* PRs Card */}
        <div className="purple-fire-aura p-4 rounded-2xl relative overflow-hidden">
          <div className="absolute top-2 right-2 text-yellow-500 font-bold text-xs opacity-30">🏆</div>
          <span className="text-[9px] text-slate-500 font-black uppercase tracking-wider block">PRs</span>
          <span className="text-xl font-black text-slate-200 mt-2 block font-mono">{stats.prCount}</span>
        </div>

      </div>

      {/* Weekly Highlights Info Panel */}
      <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2.5xl shadow-clay-sm space-y-3">
        <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest block">HIGHLIGHTS</span>

        <div className="space-y-2 text-xs font-bold text-slate-300">
          <div className="flex items-center space-x-2.5 bg-slate-950/40 p-2.5 rounded-xl border border-slate-900">
            <span className="text-cyan-400">⚡</span>
            <span>Top Músculo: <strong className="text-cyan-400">Pecho (+150 XP)</strong></span>
          </div>
          <div className="flex items-center space-x-2.5 bg-slate-950/40 p-2.5 rounded-xl border border-slate-900">
            <span className="text-emerald-400">📉</span>
            <span>Peso Corporal: <strong className="text-emerald-400">-0.3kg esta semana</strong></span>
          </div>
        </div>
      </div>

    </div>
  );
}
