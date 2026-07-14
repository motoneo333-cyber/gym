'use client';

import React, { useState } from 'react';
import { MuscleGroup, MuscleProgress, WorkoutSession } from '../types/gym';
import { INITIAL_EXERCISES } from '../data/mockData';

interface BodyMapViewerProps {
  muscleProgresses: MuscleProgress[];
  sessions: WorkoutSession[];
}

export default function BodyMapViewer({ muscleProgresses, sessions }: BodyMapViewerProps) {
  const [viewMode, setViewMode] = useState<'ranks' | 'fatigue'>('ranks');
  const [activeSide, setActiveSide] = useState<'frente' | 'espalda'>('frente');
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup | null>(null);

  // Use a stable react state to hold current timestamp to conform to React pure-render lint rules
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
    let bgTailwind = 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';

    if (hoursElapsed < 24) {
      status = 'fatigued';
      label = 'Fatigado / En Recuperación';
      colorHex = '#ef4444'; // Red
      bgTailwind = 'bg-red-500/10 border-red-500/20 text-red-400';
    } else if (hoursElapsed < 48) {
      status = 'optimal';
      label = 'Óptimo (Listo para Carga)';
      colorHex = '#eab308'; // Amber/Yellow
      bgTailwind = 'bg-amber-500/10 border-amber-500/20 text-amber-400';
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
    if (!progress) return '#475569';

    if (viewMode === 'ranks') {
      return getMuscleRankInfo(progress).colorHex;
    } else {
      return getMuscleFatigueInfo(muscle).colorHex;
    }
  };

  // Selected muscle metadata
  const selectedProgress = selectedMuscle ? muscleProgresses.find(p => p.muscleGroup === selectedMuscle) : null;
  const selectedFatigue = selectedMuscle ? getMuscleFatigueInfo(selectedMuscle) : null;
  const selectedRank = selectedProgress ? getMuscleRankInfo(selectedProgress) : null;
  const selectedExercises = selectedMuscle ? INITIAL_EXERCISES.filter(e => e.primaryMuscleGroup === selectedMuscle) : [];

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border-2 border-slate-800 p-5 rounded-3xl shadow-clay-lg space-y-6">

      {/* Dynamic Header & Visual Dual-Mode Toggles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-base font-black text-slate-100 tracking-wide">Mapa Corporal Interactivo</h3>
          <p className="text-xs text-slate-400 font-bold mt-1">Explora el estado y desarrollo de tus músculos.</p>
        </div>

        {/* Dual Mode Toggle Button (Ranks vs Fatigue) */}
        <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-900 shadow-sunken w-fit">
          <button
            onClick={() => setViewMode('ranks')}
            className={`px-4 py-2 text-[11px] font-black rounded-xl transition-all duration-200 cursor-pointer ${
              viewMode === 'ranks'
                ? 'bg-gradient-to-b from-slate-800 to-slate-900 text-emerald-400 shadow-clay-sm border border-slate-700/50'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            🏆 MODO RANGOS
          </button>
          <button
            onClick={() => setViewMode('fatigue')}
            className={`px-4 py-2 text-[11px] font-black rounded-xl transition-all duration-200 cursor-pointer ${
              viewMode === 'fatigue'
                ? 'bg-gradient-to-b from-slate-800 to-slate-900 text-emerald-400 shadow-clay-sm border border-slate-700/50'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            ⚡ MODO FATIGA
          </button>
        </div>
      </div>

      {/* Main Body Map Render (Frente / Espalda Toggles and Human Silhouette SVG) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">

        {/* Human Silhouette Viewer Column */}
        <div className="flex flex-col items-center space-y-4">

          {/* Anatomical Side Selector */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-900 shadow-sunken w-fit">
            <button
              onClick={() => setActiveSide('frente')}
              className={`px-3.5 py-1.5 text-[10px] font-black rounded-lg transition-all duration-200 cursor-pointer ${
                activeSide === 'frente'
                  ? 'bg-slate-800 text-slate-100'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Frente
            </button>
            <button
              onClick={() => setActiveSide('espalda')}
              className={`px-3.5 py-1.5 text-[10px] font-black rounded-lg transition-all duration-200 cursor-pointer ${
                activeSide === 'espalda'
                  ? 'bg-slate-800 text-slate-100'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Espalda
            </button>
          </div>

          {/* Render Vector Human SVG (Sleek interactive cyberpunk dashboard silhouette) */}
          <div className="bg-slate-950/60 border-2 border-slate-900 p-6 rounded-3xl shadow-sunken relative w-full max-w-[240px] flex items-center justify-center">

            <svg viewBox="0 0 160 280" className="w-48 h-72 select-none filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
              {/* Head & Neck (Non-clickable, style reference) */}
              <circle cx="80" cy="26" r="14" fill="#1e293b" stroke="#334155" strokeWidth="1.5" />
              <rect x="76" y="40" width="8" height="12" fill="#1e293b" stroke="#334155" strokeWidth="1.5" />

              {/* FRENTE VIEW */}
              {activeSide === 'frente' && (
                <>
                  {/* Chest (Pecho) */}
                  <g onClick={() => setSelectedMuscle('Chest')} className="cursor-pointer group">
                    <path
                      d="M62 60h17v18c0 3-2 5-5 5h-12V60z"
                      fill={getMuscleFillColor('Chest')}
                      stroke="#0f172a"
                      strokeWidth="2.5"
                      className="transition-all duration-300 hover:opacity-80 group-hover:stroke-slate-100"
                    />
                    <path
                      d="M81 60h17v18c0 3-2 5-5 5h-12V60z"
                      transform="scale(-1, 1) translate(-160, 0)"
                      fill={getMuscleFillColor('Chest')}
                      stroke="#0f172a"
                      strokeWidth="2.5"
                      className="transition-all duration-300 hover:opacity-80 group-hover:stroke-slate-100"
                    />
                  </g>

                  {/* Core (Abdominales) */}
                  <path
                    d="M68 88h24v42a4 4 0 01-4 4H72a4 4 0 01-4-4V88z"
                    fill={getMuscleFillColor('Core')}
                    stroke="#0f172a"
                    strokeWidth="2.5"
                    onClick={() => setSelectedMuscle('Core')}
                    className="cursor-pointer transition-all duration-300 hover:opacity-80 hover:stroke-slate-100"
                  />

                  {/* Shoulders (Hombros - Frente) */}
                  <g onClick={() => setSelectedMuscle('Shoulders')} className="cursor-pointer group">
                    <path
                      d="M45 52c6 0 12 4 12 10v12c-5 0-12-5-12-11V52z"
                      fill={getMuscleFillColor('Shoulders')}
                      stroke="#0f172a"
                      strokeWidth="2.5"
                      className="transition-all duration-300 hover:opacity-80 group-hover:stroke-slate-100"
                    />
                    <path
                      d="M103 52c-6 0-12 4-12 10v12c5 0 12-5 12-11V52z"
                      fill={getMuscleFillColor('Shoulders')}
                      stroke="#0f172a"
                      strokeWidth="2.5"
                      className="transition-all duration-300 hover:opacity-80 group-hover:stroke-slate-100"
                    />
                  </g>

                  {/* Arms (Brazos/Biceps - Frente) */}
                  <g onClick={() => setSelectedMuscle('Arms')} className="cursor-pointer group">
                    <rect
                      x="34"
                      y="68"
                      width="12"
                      height="60"
                      rx="4"
                      fill={getMuscleFillColor('Arms')}
                      stroke="#0f172a"
                      strokeWidth="2.5"
                      className="transition-all duration-300 hover:opacity-80 group-hover:stroke-slate-100"
                    />
                    <rect
                      x="114"
                      y="68"
                      width="12"
                      height="60"
                      rx="4"
                      fill={getMuscleFillColor('Arms')}
                      stroke="#0f172a"
                      strokeWidth="2.5"
                      className="transition-all duration-300 hover:opacity-80 group-hover:stroke-slate-100"
                    />
                  </g>

                  {/* Legs (Piernas/Quads - Frente) */}
                  <g onClick={() => setSelectedMuscle('Legs')} className="cursor-pointer group">
                    <rect
                      x="53"
                      y="138"
                      width="24"
                      height="100"
                      rx="6"
                      fill={getMuscleFillColor('Legs')}
                      stroke="#0f172a"
                      strokeWidth="2.5"
                      className="transition-all duration-300 hover:opacity-80 group-hover:stroke-slate-100"
                    />
                    <rect
                      x="83"
                      y="138"
                      width="24"
                      height="100"
                      rx="6"
                      fill={getMuscleFillColor('Legs')}
                      stroke="#0f172a"
                      strokeWidth="2.5"
                      className="transition-all duration-300 hover:opacity-80 group-hover:stroke-slate-100"
                    />
                  </g>
                </>
              )}

              {/* ESPALDA VIEW */}
              {activeSide === 'espalda' && (
                <>
                  {/* Back (Espalda) */}
                  <path
                    d="M50 56h60l-8 42c0 14-8 28-22 36-14-8-22-22-22-36l-8-42z"
                    fill={getMuscleFillColor('Back')}
                    stroke="#0f172a"
                    strokeWidth="2.5"
                    onClick={() => setSelectedMuscle('Back')}
                    className="cursor-pointer transition-all duration-300 hover:opacity-80 hover:stroke-slate-100"
                  />

                  {/* Shoulders (Hombros - Espalda) */}
                  <g onClick={() => setSelectedMuscle('Shoulders')} className="cursor-pointer group">
                    <path
                      d="M44 54c5 0 10 4 10 8v12c-4 0-10-4-10-10V54z"
                      fill={getMuscleFillColor('Shoulders')}
                      stroke="#0f172a"
                      strokeWidth="2.5"
                      className="transition-all duration-300 hover:opacity-80 group-hover:stroke-slate-100"
                    />
                    <path
                      d="M106 54c-5 0-10 4-10 8v12c4 0 10-4 10-10V54z"
                      fill={getMuscleFillColor('Shoulders')}
                      stroke="#0f172a"
                      strokeWidth="2.5"
                      className="transition-all duration-300 hover:opacity-80 group-hover:stroke-slate-100"
                    />
                  </g>

                  {/* Arms (Triceps - Espalda) */}
                  <g onClick={() => setSelectedMuscle('Arms')} className="cursor-pointer group">
                    <rect
                      x="34"
                      y="68"
                      width="12"
                      height="60"
                      rx="4"
                      fill={getMuscleFillColor('Arms')}
                      stroke="#0f172a"
                      strokeWidth="2.5"
                      className="transition-all duration-300 hover:opacity-80 group-hover:stroke-slate-100"
                    />
                    <rect
                      x="114"
                      y="68"
                      width="12"
                      height="60"
                      rx="4"
                      fill={getMuscleFillColor('Arms')}
                      stroke="#0f172a"
                      strokeWidth="2.5"
                      className="transition-all duration-300 hover:opacity-80 group-hover:stroke-slate-100"
                    />
                  </g>

                  {/* Legs (Piernas/Femorales - Espalda) */}
                  <g onClick={() => setSelectedMuscle('Legs')} className="cursor-pointer group">
                    <rect
                      x="53"
                      y="138"
                      width="24"
                      height="100"
                      rx="6"
                      fill={getMuscleFillColor('Legs')}
                      stroke="#0f172a"
                      strokeWidth="2.5"
                      className="transition-all duration-300 hover:opacity-80 group-hover:stroke-slate-100"
                    />
                    <rect
                      x="83"
                      y="138"
                      width="24"
                      height="100"
                      rx="6"
                      fill={getMuscleFillColor('Legs')}
                      stroke="#0f172a"
                      strokeWidth="2.5"
                      className="transition-all duration-300 hover:opacity-80 group-hover:stroke-slate-100"
                    />
                  </g>
                </>
              )}
            </svg>

            {/* Guide label */}
            <span className="absolute bottom-2 text-[9px] font-black tracking-widest text-slate-500 uppercase">
              Toca para inspeccionar
            </span>
          </div>
        </div>

        {/* Dynamic RPG Tooltip/Detail Column */}
        <div className="flex flex-col justify-center min-h-[280px]">
          {!selectedMuscle ? (
            <div className="text-center py-10 border-2 border-dashed border-slate-800 rounded-3xl p-5 bg-slate-950/40">
              <span className="text-3xl filter drop-shadow block mb-3">🤖</span>
              <p className="text-xs text-slate-400 font-extrabold leading-relaxed">
                Selecciona un grupo muscular de la silueta 3D para desplegar su estado de recuperación y maestría RPG.
              </p>
            </div>
          ) : (
            selectedProgress && selectedRank && selectedFatigue && (
              <div className="bg-slate-950/80 border-2 border-slate-800 p-5 rounded-3xl shadow-clay-sm space-y-4 animate-fade-in">

                {/* Muscle Title & Side Tag */}
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-base font-black text-slate-100 flex items-center gap-1.5 uppercase tracking-wide">
                      {selectedMuscle === 'Chest' ? 'Pecho' :
                       selectedMuscle === 'Back' ? 'Espalda' :
                       selectedMuscle === 'Legs' ? 'Piernas' :
                       selectedMuscle === 'Shoulders' ? 'Hombros' :
                       selectedMuscle === 'Arms' ? 'Brazos' : 'Core'}
                    </h4>
                    <p className="text-[11px] text-slate-400 font-bold mt-0.5">Enfoque Primario</p>
                  </div>
                  <button
                    onClick={() => setSelectedMuscle(null)}
                    className="text-xs text-slate-500 hover:text-slate-300 font-black cursor-pointer"
                  >
                    Cerrar ✕
                  </button>
                </div>

                {/* Mode-specific detail card */}
                {viewMode === 'ranks' ? (
                  /* Modo Rango Card Details */
                  <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800/80 shadow-sunken space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-500 font-black uppercase tracking-wider">Maestría Actual</span>
                      <span className={`px-2.5 py-0.5 rounded-md text-[9px] font-black uppercase bg-gradient-to-r ${selectedRank.bgTailwind}`}>
                        NIV. {selectedProgress.level} - {selectedRank.badgeText}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-slate-400 font-extrabold">
                        <span>Puntos de EXP</span>
                        <span>{selectedProgress.currentXp} / {selectedProgress.xpToNextLevel} XP</span>
                      </div>
                      {/* Thicker cylindrical progress indicator */}
                      <div className="h-4.5 bg-slate-950 rounded-full border border-slate-900 p-[2.5px] shadow-sunken overflow-hidden relative">
                        <div className="absolute inset-x-0 top-0.5 h-1 bg-white/10 rounded-full blur-[0.5px] z-10" />
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300 shadow-[inset_1px_1.5px_1px_rgba(255,255,255,0.4)]"
                          style={{ width: `${(selectedProgress.currentXp / selectedProgress.xpToNextLevel) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Modo Fatiga Card Details */
                  <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800/80 shadow-sunken space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-500 font-black uppercase tracking-wider">Ciencia de Fatiga</span>
                      <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase border ${selectedFatigue.bgTailwind}`}>
                        {selectedFatigue.label}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs font-bold text-slate-300">
                      <div className="bg-slate-950/40 p-2 rounded-xl border border-slate-900">
                        <span className="text-[9px] text-slate-500 uppercase block">Horas Transcurridas</span>
                        <span className="font-mono mt-0.5 block text-slate-200">
                          {selectedFatigue.hoursElapsed >= 999 ? 'Ninguna' : `${selectedFatigue.hoursElapsed.toFixed(1)} hrs`}
                        </span>
                      </div>
                      <div className="bg-slate-950/40 p-2 rounded-xl border border-slate-900">
                        <span className="text-[9px] text-slate-500 uppercase block">Último Entrenamiento</span>
                        <span className="mt-0.5 block text-slate-200">
                          {selectedFatigue.lastTrainedDate || 'Sin registro'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Sub-exercises catalog for muscle group */}
                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-500 font-black uppercase tracking-wider px-1">Ejercicios del Catálogo</span>
                  <div className="max-h-24 overflow-y-auto space-y-1 pr-1">
                    {selectedExercises.map(ex => (
                      <div key={ex.id} className="text-[11px] font-bold text-slate-300 bg-slate-900/40 border border-slate-900 p-2 rounded-xl shadow-clay-sm flex justify-between items-center">
                        <span>{ex.name}</span>
                        <span className="text-[8px] bg-slate-950 text-slate-500 px-2 py-0.5 rounded-md uppercase font-black">CAT</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )
          )}
        </div>
      </div>

    </div>
  );
}
