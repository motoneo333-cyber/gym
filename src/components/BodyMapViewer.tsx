'use client';

import React, { useState } from 'react';
import { MuscleGroup, MuscleProgress, WorkoutSession } from '../types/gym';
import { INITIAL_EXERCISES } from '../data/mockData';

interface BodyMapViewerProps {
  muscleProgresses: MuscleProgress[];
  sessions: WorkoutSession[];
  userLevel: number;
}

export default function BodyMapViewer({ muscleProgresses, sessions, userLevel }: BodyMapViewerProps) {
  const [viewMode, setViewMode] = useState<'ranks' | 'fatigue'>('ranks');
  const [activeSide, setActiveSide] = useState<'frente' | 'espalda'>('frente');
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup | null>(null);

  // Stable react state for pura rendering conformity
  const [now] = useState(() => Date.now());

  // Helper to determine recovery/fatigue hours for a muscle
  const getMuscleFatigueInfo = (muscle: MuscleGroup) => {
    let lastTrainedDate: string | null = null;
    let hoursElapsed = 999; // Default: fully recovered

    // Find the latest workout session targeting this muscle
    const sortedSessions = [...sessions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    for (const session of sortedSessions) {
      const hasMuscle = session.sets.some(set => {
        const exercise = INITIAL_EXERCISES.find(e => e.id === set.exerciseId);
        if (!exercise) return false;
        return exercise.primaryMuscleGroup === muscle || exercise.secondaryMuscleGroups?.includes(muscle);
      });

      if (hasMuscle) {
        lastTrainedDate = session.date;
        const lastTimeMs = new Date(session.date).getTime();
        hoursElapsed = Math.max(0, (now - lastTimeMs) / (1000 * 60 * 60));
        break;
      }
    }

    // Fatigue classification & colors
    let status: 'fatigued' | 'optimal' | 'recovered' = 'recovered';
    let label = 'Completamente Recuperado';
    let colorHex = '#10b981'; // Emerald
    let bgTailwind = 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400';

    if (hoursElapsed < 24) {
      status = 'fatigued';
      label = 'Fatigado / En Recuperación';
      colorHex = '#ef4444'; // Red
      bgTailwind = 'bg-red-500/10 border-red-500/25 text-red-400';
    } else if (hoursElapsed < 48) {
      status = 'optimal';
      label = 'Óptimo (Listo para Carga)';
      colorHex = '#f59e0b'; // Amber/Yellow
      bgTailwind = 'bg-amber-500/10 border-amber-500/25 text-amber-400';
    }

    return {
      hoursElapsed,
      lastTrainedDate,
      status,
      label,
      colorHex,
      bgTailwind,
    };
  };

  // Helper to get Rank Colors & Themes
  const getMuscleRankInfo = (progress: MuscleProgress) => {
    let colorHex = '#64748b'; // Novice - Slate Grey
    let bgTailwind = 'from-slate-800 to-slate-950 text-slate-400';
    let badgeText = 'Novato';

    if (progress.level >= 21) {
      colorHex = '#a855f7'; // Hercules - Purple
      bgTailwind = 'from-purple-500 to-fuchsia-600 text-purple-900';
      badgeText = 'Hércules';
    } else if (progress.level >= 16) {
      colorHex = '#d946ef'; // Elite - Fuchsia
      bgTailwind = 'from-fuchsia-500 to-pink-500 text-fuchsia-950';
      badgeText = 'Élite';
    } else if (progress.level >= 11) {
      colorHex = '#fbbf24'; // Advanced - Gold
      bgTailwind = 'from-amber-400 to-yellow-500 text-amber-950';
      badgeText = 'Avanzado';
    } else if (progress.level >= 6) {
      colorHex = '#10b981'; // Intermediate - Emerald
      bgTailwind = 'from-emerald-400 to-teal-500 text-emerald-950';
      badgeText = 'Intermedio';
    }

    return { colorHex, bgTailwind, badgeText };
  };

  // Get dynamic fill color for an SVG muscle group based on current View Mode
  const getMuscleFillColor = (muscle: MuscleGroup) => {
    const progress = muscleProgresses.find(p => p.muscleGroup === muscle);
    if (!progress) return '#334155';

    if (viewMode === 'ranks') {
      return getMuscleRankInfo(progress).colorHex;
    } else {
      return getMuscleFatigueInfo(muscle).colorHex;
    }
  };

  // Calculate overall player metallic shield rank based on level
  const getOverallRankBadge = () => {
    if (userLevel >= 21) {
      return {
        text: 'Hércules I',
        style: 'from-purple-600 via-fuchsia-500 to-purple-700 border-purple-400 text-slate-100 shadow-[0_0_15px_rgba(168,85,247,0.5)]',
        emoji: '🌟',
      };
    } else if (userLevel >= 16) {
      return {
        text: 'Élite II',
        style: 'from-fuchsia-600 via-pink-500 to-fuchsia-700 border-fuchsia-400 text-slate-100 shadow-[0_0_15px_rgba(217,70,239,0.5)]',
        emoji: '⚡',
      };
    } else if (userLevel >= 11) {
      return {
        text: 'Oro II',
        style: 'from-amber-500 via-yellow-400 to-amber-600 border-yellow-300 text-slate-950',
        emoji: '👑',
      };
    } else if (userLevel >= 6) {
      return {
        text: 'Plata I',
        style: 'from-slate-400 via-slate-300 to-slate-500 border-slate-200 text-slate-950',
        emoji: '⚔️',
      };
    }
    return {
      text: 'Bronze III',
      style: 'from-amber-700 via-orange-600 to-amber-800 border-orange-500 text-slate-100',
      emoji: '🛡️',
    };
  };

  const overallRank = getOverallRankBadge();

  // Selected muscle metadata for Bottom Sheet
  const selectedProgress = selectedMuscle ? muscleProgresses.find(p => p.muscleGroup === selectedMuscle) : null;
  const selectedFatigue = selectedMuscle ? getMuscleFatigueInfo(selectedMuscle) : null;
  const selectedRank = selectedProgress ? getMuscleRankInfo(selectedProgress) : null;
  const selectedExercises = selectedMuscle ? INITIAL_EXERCISES.filter(e => e.primaryMuscleGroup === selectedMuscle) : [];

  return (
    <div className="bg-gradient-to-br from-slate-950/85 via-slate-900 to-slate-950/95 border-2 border-purple-500/25 p-5 rounded-3xl shadow-clay-lg space-y-6 relative overflow-hidden">

      {/* Subtle Floating Portal Runes inside body map background */}
      <div className="absolute top-8 left-6 text-fuchsia-500/10 text-lg font-mono floating-rune pointer-events-none select-none">𐏓</div>
      <div className="absolute top-20 right-8 text-purple-500/15 text-xl font-mono floating-rune pointer-events-none select-none" style={{ animationDelay: '2s' }}>𐎚</div>
      <div className="absolute bottom-12 left-10 text-cyan-500/10 text-sm font-mono floating-rune pointer-events-none select-none" style={{ animationDelay: '4s' }}>𐎽</div>

      {/* HEADER & DUAL-MODE SWITCHER (Centered RPG Portal layout) */}
      <div className="flex flex-col items-center text-center space-y-4 border-b border-slate-900 pb-5">
        <div>
          <h3 className="text-sm font-black text-slate-200 tracking-wide uppercase">MAPA CORPORAL INTERACTIVO</h3>
          <p className="text-[11px] text-slate-400 font-bold mt-1">Explora tu progreso en tiempo real dentro del portal RPG.</p>
        </div>

        {/* Dual Mode Toggle (Ranks vs Fatigue) */}
        <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-900 shadow-sunken">
          <button
            onClick={() => setViewMode('ranks')}
            className={`px-4 py-2 text-[10px] font-black rounded-xl transition-all duration-200 cursor-pointer ${
              viewMode === 'ranks'
                ? 'bg-gradient-to-b from-slate-800 to-slate-900 text-emerald-400 shadow-clay-sm border border-slate-700/50'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            🏆 MODO RANGOS
          </button>
          <button
            onClick={() => setViewMode('fatigue')}
            className={`px-4 py-2 text-[10px] font-black rounded-xl transition-all duration-200 cursor-pointer ${
              viewMode === 'fatigue'
                ? 'bg-gradient-to-b from-slate-800 to-slate-900 text-emerald-400 shadow-clay-sm border border-slate-700/50'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            ⚡ MODO FATIGA
          </button>
        </div>
      </div>

      {/* ANATOMICAL SILHOUETTE CONTAINER (Centered & framed inside glowing magical ring) */}
      <div className="flex flex-col items-center space-y-5 py-2">

        {/* Anatomical Side Selector */}
        <div className="flex bg-slate-950 p-1.5 rounded-xl border border-slate-900 shadow-sunken z-20">
          <button
            onClick={() => setActiveSide('frente')}
            className={`px-4 py-1.5 text-[9px] font-black rounded-lg transition-all duration-200 cursor-pointer ${
              activeSide === 'frente'
                ? 'bg-slate-800 text-slate-100'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Frente
          </button>
          <button
            onClick={() => setActiveSide('espalda')}
            className={`px-4 py-1.5 text-[9px] font-black rounded-lg transition-all duration-200 cursor-pointer ${
              activeSide === 'espalda'
                ? 'bg-slate-800 text-slate-100'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Espalda
          </button>
        </div>

        {/* MAGICAL PORTAL HALO FRAMING THE BODY (From 1.webp reference) */}
        <div className="relative w-full max-w-[270px] aspect-square flex items-center justify-center py-6">

          {/* Glowing spinning halo backing representing the portal */}
          <div className="absolute w-[240px] h-[240px] rounded-full border-4 border-dashed border-purple-500/40 spin-portal-ring blur-[0.5px] shadow-[0_0_35px_rgba(139,92,246,0.6)] pointer-events-none" />
          <div className="absolute w-[230px] h-[240px] rounded-full border border-fuchsia-500/25 blur-[4px] pointer-events-none" />

          {/* Svg Silhouette Body Map sits inside this portal */}
          <div className="relative w-full max-w-[200px] flex items-center justify-center z-10">
            <svg viewBox="0 0 160 280" className="w-48 h-72 select-none filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.6)]">
              {/* Defs block to hold dynamic cybernetic glow filter parameters */}
              <defs>
                <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Stylized Human Body Head & Neck Base */}
              <circle cx="80" cy="24" r="13" fill="#111827" stroke="#334155" strokeWidth="1.5" />
              <path d="M74 36 C74 44, 86 44, 86 36 Z" fill="#111827" stroke="#334155" strokeWidth="1.5" />

              {/* FRENTE VIEW - Organic Curved Paths */}
              {activeSide === 'frente' && (
                <>
                  {/* Chest (Pecho Left & Right) */}
                  <g onClick={() => setSelectedMuscle('Chest')} className="cursor-pointer group">
                    <path
                      d="M 64,48 C 54,48 50,56 50,68 C 50,78 64,81 79,81 C 79,66 79,52 64,48 Z"
                      fill={getMuscleFillColor('Chest')}
                      stroke="#070a13"
                      strokeWidth="2.5"
                      className="transition-all duration-300 hover:opacity-90"
                      style={{
                        filter: selectedMuscle === 'Chest' ? `url(#neon-glow)` : 'none',
                      }}
                    />
                    <path
                      d="M 96,48 C 106,48 110,56 110,68 C 110,78 96,81 81,81 C 81,66 81,52 96,48 Z"
                      fill={getMuscleFillColor('Chest')}
                      stroke="#070a13"
                      strokeWidth="2.5"
                      className="transition-all duration-300 hover:opacity-90"
                      style={{
                        filter: selectedMuscle === 'Chest' ? `url(#neon-glow)` : 'none',
                      }}
                    />
                  </g>

                  {/* Core (Abdominales / Abs Matrix) */}
                  <path
                    d="M 68,84 C 65,108 67,136 70,146 C 74,146 86,146 90,146 C 93,136 95,108 92,84 Z"
                    fill={getMuscleFillColor('Core')}
                    stroke="#070a13"
                    strokeWidth="2.5"
                    onClick={() => setSelectedMuscle('Core')}
                    className="cursor-pointer transition-all duration-300 hover:opacity-90"
                    style={{
                      filter: selectedMuscle === 'Core' ? `url(#neon-glow)` : 'none',
                    }}
                  />

                  {/* Shoulders (Hombros Left & Right front) */}
                  <g onClick={() => setSelectedMuscle('Shoulders')} className="cursor-pointer group">
                    <path
                      d="M 47,48 C 38,52 36,66 44,72 C 48,70 50,60 50,48 Z"
                      fill={getMuscleFillColor('Shoulders')}
                      stroke="#070a13"
                      strokeWidth="2.5"
                      className="transition-all duration-300 hover:opacity-90"
                      style={{
                        filter: selectedMuscle === 'Shoulders' ? `url(#neon-glow)` : 'none',
                      }}
                    />
                    <path
                      d="M 113,48 C 122,52 124,66 116,72 C 112,70 110,60 110,48 Z"
                      fill={getMuscleFillColor('Shoulders')}
                      stroke="#070a13"
                      strokeWidth="2.5"
                      className="transition-all duration-300 hover:opacity-90"
                      style={{
                        filter: selectedMuscle === 'Shoulders' ? `url(#neon-glow)` : 'none',
                      }}
                    />
                  </g>

                  {/* Arms (Brazos / Biceps - Frente) */}
                  <g onClick={() => setSelectedMuscle('Arms')} className="cursor-pointer group">
                    <path
                      d="M 33,68 C 24,78 26,108 34,124 C 38,124 43,112 43,84 Z"
                      fill={getMuscleFillColor('Arms')}
                      stroke="#070a13"
                      strokeWidth="2.5"
                      className="transition-all duration-300 hover:opacity-90"
                      style={{
                        filter: selectedMuscle === 'Arms' ? `url(#neon-glow)` : 'none',
                      }}
                    />
                    <path
                      d="M 127,68 C 136,78 134,108 126,124 C 122,124 117,112 117,84 Z"
                      fill={getMuscleFillColor('Arms')}
                      stroke="#070a13"
                      strokeWidth="2.5"
                      className="transition-all duration-300 hover:opacity-90"
                      style={{
                        filter: selectedMuscle === 'Arms' ? `url(#neon-glow)` : 'none',
                      }}
                    />
                  </g>

                  {/* Legs (Piernas / Quads - Frente) */}
                  <g onClick={() => setSelectedMuscle('Legs')} className="cursor-pointer group">
                    <path
                      d="M 52,148 C 42,168 44,208 55,236 C 62,236 67,218 70,178 Z"
                      fill={getMuscleFillColor('Legs')}
                      stroke="#070a13"
                      strokeWidth="2.5"
                      className="transition-all duration-300 hover:opacity-90"
                      style={{
                        filter: selectedMuscle === 'Legs' ? `url(#neon-glow)` : 'none',
                      }}
                    />
                    <path
                      d="M 108,148 C 118,168 116,208 105,236 C 98,236 93,218 90,178 Z"
                      fill={getMuscleFillColor('Legs')}
                      stroke="#070a13"
                      strokeWidth="2.5"
                      className="transition-all duration-300 hover:opacity-90"
                      style={{
                        filter: selectedMuscle === 'Legs' ? `url(#neon-glow)` : 'none',
                      }}
                    />
                  </g>
                </>
              )}

              {/* ESPALDA VIEW - Organic Curved Paths */}
              {activeSide === 'espalda' && (
                <>
                  {/* Back (Dorsales / Trapecios / Lumbar V-Taper) */}
                  <path
                    d="M 50,48 C 50,48 110,48 110,48 C 110,64 102,112 80,132 C 58,112 50,64 50,48 Z"
                    fill={getMuscleFillColor('Back')}
                    stroke="#070a13"
                    strokeWidth="2.5"
                    onClick={() => setSelectedMuscle('Back')}
                    className="cursor-pointer transition-all duration-300 hover:opacity-90"
                    style={{
                      filter: selectedMuscle === 'Back' ? `url(#neon-glow)` : 'none',
                    }}
                  />

                  {/* Shoulders (Hombros - Espalda) */}
                  <g onClick={() => setSelectedMuscle('Shoulders')} className="cursor-pointer group">
                    <path
                      d="M 47,48 C 38,52 36,66 44,72 C 48,70 50,60 50,48 Z"
                      fill={getMuscleFillColor('Shoulders')}
                      stroke="#070a13"
                      strokeWidth="2.5"
                      className="transition-all duration-300 hover:opacity-90"
                      style={{
                        filter: selectedMuscle === 'Shoulders' ? `url(#neon-glow)` : 'none',
                      }}
                    />
                    <path
                      d="M 113,48 C 122,52 124,66 116,72 C 112,70 110,60 110,48 Z"
                      fill={getMuscleFillColor('Shoulders')}
                      stroke="#070a13"
                      strokeWidth="2.5"
                      className="transition-all duration-300 hover:opacity-90"
                      style={{
                        filter: selectedMuscle === 'Shoulders' ? `url(#neon-glow)` : 'none',
                      }}
                    />
                  </g>

                  {/* Arms (Triceps / Brazos - Espalda) */}
                  <g onClick={() => setSelectedMuscle('Arms')} className="cursor-pointer group">
                    <path
                      d="M 33,68 C 24,78 26,108 34,124 C 38,124 43,112 43,84 Z"
                      fill={getMuscleFillColor('Arms')}
                      stroke="#070a13"
                      strokeWidth="2.5"
                      className="transition-all duration-300 hover:opacity-90"
                      style={{
                        filter: selectedMuscle === 'Arms' ? `url(#neon-glow)` : 'none',
                      }}
                    />
                    <path
                      d="M 127,68 C 136,78 134,108 126,124 C 122,124 117,112 117,84 Z"
                      fill={getMuscleFillColor('Arms')}
                      stroke="#070a13"
                      strokeWidth="2.5"
                      className="transition-all duration-300 hover:opacity-90"
                      style={{
                        filter: selectedMuscle === 'Arms' ? `url(#neon-glow)` : 'none',
                      }}
                    />
                  </g>

                  {/* Legs (Femorales / Piernas - Espalda) */}
                  <g onClick={() => setSelectedMuscle('Legs')} className="cursor-pointer group">
                    <path
                      d="M 52,148 C 42,168 44,208 55,236 C 62,236 67,218 70,178 Z"
                      fill={getMuscleFillColor('Legs')}
                      stroke="#070a13"
                      strokeWidth="2.5"
                      className="transition-all duration-300 hover:opacity-90"
                      style={{
                        filter: selectedMuscle === 'Legs' ? `url(#neon-glow)` : 'none',
                      }}
                    />
                    <path
                      d="M 108,148 C 118,168 116,208 105,236 C 98,236 93,218 90,178 Z"
                      fill={getMuscleFillColor('Legs')}
                      stroke="#070a13"
                      strokeWidth="2.5"
                      className="transition-all duration-300 hover:opacity-90"
                      style={{
                        filter: selectedMuscle === 'Legs' ? `url(#neon-glow)` : 'none',
                      }}
                    />
                  </g>
                </>
              )}
            </svg>
          </div>

        </div>

        {/* METALLIC 3D OVERALL SHIELD BADGE (Centered and positioned directly beneath portal as in 1.webp) */}
        <div className={`bg-gradient-to-r ${overallRank.style} border-2 px-5 py-2.5 rounded-2xl shadow-clay-badge flex items-center space-x-3 mx-auto w-fit z-20`}>
          <span className="text-sm filter drop-shadow">{overallRank.emoji}</span>
          <div className="text-left leading-none">
            <span className="text-[8px] uppercase tracking-widest font-black text-slate-400 block mb-0.5">Overall Rank</span>
            <span className="text-xs font-black tracking-wide uppercase">{overallRank.text}</span>
          </div>
        </div>
      </div>

      {/* MOBILE-FIRST SLIDING BOTTOM SHEET */}
      {selectedMuscle && selectedProgress && selectedRank && selectedFatigue && (
        <>
          {/* Backdrop Overlay */}
          <div
            onClick={() => setSelectedMuscle(null)}
            className="fixed inset-0 bg-slate-950/85 backdrop-blur-xs z-[115] transition-opacity duration-300"
          />

          {/* Sliding Bottom Sheet Card */}
          <div className="fixed inset-x-0 bottom-0 z-[120] bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 rounded-t-[36px] border-t-2 border-slate-800 shadow-clay-lg p-6 max-w-md mx-auto animate-fade-in relative">

            {/* Handle visual */}
            <div className="w-14 h-1.5 bg-slate-800 rounded-full mx-auto mb-4 cursor-pointer" onClick={() => setSelectedMuscle(null)} />

            {/* Bottom Sheet Header */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="text-lg font-black text-slate-100 flex items-center gap-2 uppercase tracking-wide">
                  {selectedMuscle === 'Chest' ? 'Pectoral' :
                   selectedMuscle === 'Back' ? 'Espalda (Dorsal)' :
                   selectedMuscle === 'Legs' ? 'Piernas (Quads/Femoral)' :
                   selectedMuscle === 'Shoulders' ? 'Hombros (Deltoides)' :
                   selectedMuscle === 'Arms' ? 'Brazos (Bíceps/Tríceps)' : 'Abdomen (Core)'}
                </h4>
                <p className="text-xs text-slate-400 font-bold mt-1">Ficha de Progresión Médica y RPG</p>
              </div>
              <button
                onClick={() => setSelectedMuscle(null)}
                className="w-8 h-8 rounded-full bg-slate-950 flex items-center justify-center text-slate-500 hover:text-slate-300 font-black border border-slate-800 cursor-pointer shadow-clay-sm"
              >
                ✕
              </button>
            </div>

            {/* Mode-specific detail card */}
            {viewMode === 'ranks' ? (
              /* Modo Rango Card Details */
              <div className="bg-slate-950/80 p-4.5 rounded-2.5xl border border-slate-900 shadow-sunken space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-black uppercase tracking-wider">RANGO RPG ALCANZADO</span>
                  <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase bg-gradient-to-r ${selectedRank.bgTailwind} shadow-clay-badge border border-white/10`}>
                    {selectedProgress.rankName}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] text-slate-400 font-black uppercase tracking-wide">
                    <span>Nivel {selectedProgress.level} • {selectedProgress.currentXp} / {selectedProgress.xpToNextLevel} XP</span>
                    <span className="text-emerald-400 font-extrabold">{Math.round((selectedProgress.currentXp / selectedProgress.xpToNextLevel) * 100)}%</span>
                  </div>
                  {/* Thick cylinder progress tube */}
                  <div className="h-5.5 bg-slate-950 rounded-full border border-slate-900 p-[3.5px] shadow-sunken overflow-hidden relative">
                    <div className="absolute inset-x-0 top-0.5 h-1.5 bg-white/10 rounded-full blur-[0.5px] z-10 pointer-events-none" />
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-500 relative shadow-[inset_1px_2px_2px_rgba(255,255,255,0.4)]"
                      style={{ width: `${(selectedProgress.currentXp / selectedProgress.xpToNextLevel) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              /* Modo Fatiga Card Details */
              <div className="bg-slate-950/80 p-4.5 rounded-2.5xl border border-slate-900 shadow-sunken space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-black uppercase tracking-wider">CIENCIA DE RECUPERACIÓN</span>
                  <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase border ${selectedFatigue.bgTailwind}`}>
                    {selectedFatigue.label}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3.5 text-xs font-bold text-slate-300">
                  <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-900">
                    <span className="text-[9px] text-slate-500 uppercase font-black block">Fibras Transcurridas</span>
                    <span className="font-mono mt-1 block text-slate-200 text-sm font-black">
                      {selectedFatigue.hoursElapsed >= 999 ? 'Ninguna' : `${selectedFatigue.hoursElapsed.toFixed(1)} hrs`}
                    </span>
                  </div>
                  <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-900">
                    <span className="text-[9px] text-slate-500 uppercase font-black block">Último Estímulo</span>
                    <span className="mt-1 block text-slate-200 text-sm font-black">
                      {selectedFatigue.lastTrainedDate || 'Sin registro'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* List of Primary Exercises related to Muscle */}
            <div className="mt-5 space-y-2">
              <span className="text-[10px] text-slate-500 font-black uppercase tracking-wider px-1">Ejercicios del Catálogo Registrados</span>
              <div className="max-h-28 overflow-y-auto space-y-1.5 pr-1">
                {selectedExercises.map(ex => (
                  <div key={ex.id} className="text-[11px] font-black text-slate-300 bg-slate-950 p-2.5 rounded-xl border border-slate-900 shadow-clay-sm flex justify-between items-center">
                    <span>{ex.name}</span>
                    <span className="text-[8px] bg-slate-900 text-slate-500 px-2 py-0.5 rounded-md uppercase font-black">FIBRA PRIMARIA</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setSelectedMuscle(null)}
              className="mt-6 w-full bg-slate-950 border border-slate-800 py-3.5 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-200 active:scale-95 transition-all shadow-clay-sm cursor-pointer"
            >
              CERRAR FICHA
            </button>
          </div>
        </>
      )}

    </div>
  );
}
