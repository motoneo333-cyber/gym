'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { MuscleGroup, WorkoutSet, WorkoutSession, MuscleProgress } from '../types/gym';
import {
  INITIAL_USER,
  INITIAL_EXERCISES,
  INITIAL_MUSCLE_PROGRESS,
  HISTORICAL_SESSIONS,
} from '../data/mockData';
import { calculateSetXp, addXpToMuscle, getXpRequiredForNextLevel } from '../utils/xpCalculator';

// Import our new premium interactive components
import BodyMapViewer from '../components/BodyMapViewer';
import RanksGallery from '../components/RanksGallery';

// Color definitions for Hito 3 premium claymorphism visuals (vibrant gradients, borders, and glowing rings)
const MUSCLE_THEMES: Record<MuscleGroup, {
  bg: string;
  text: string;
  border: string;
  barFrom: string;
  barTo: string;
  iconBg: string;
  iconColor: string;
  accentGlow: string;
  accentText: string;
}> = {
  Chest: {
    bg: 'from-rose-950/40 via-slate-900/90 to-slate-950/95',
    text: 'text-rose-400',
    border: 'border-rose-500/20 hover:border-rose-500/40',
    barFrom: 'from-rose-500',
    barTo: 'to-red-400',
    iconBg: 'bg-rose-500/10 border-rose-500/30',
    iconColor: '#f43f5e',
    accentGlow: 'shadow-rose-500/20',
    accentText: 'text-rose-300'
  },
  Back: {
    bg: 'from-emerald-950/40 via-slate-900/90 to-slate-950/95',
    text: 'text-emerald-400',
    border: 'border-emerald-500/20 hover:border-emerald-500/40',
    barFrom: 'from-emerald-500',
    barTo: 'to-teal-400',
    iconBg: 'bg-emerald-500/10 border-emerald-500/30',
    iconColor: '#10b981',
    accentGlow: 'shadow-emerald-500/20',
    accentText: 'text-emerald-300'
  },
  Legs: {
    bg: 'from-amber-950/40 via-slate-900/90 to-slate-950/95',
    text: 'text-amber-400',
    border: 'border-amber-500/20 hover:border-amber-500/40',
    barFrom: 'from-amber-500',
    barTo: 'to-orange-400',
    iconBg: 'bg-amber-500/10 border-amber-500/30',
    iconColor: '#f59e0b',
    accentGlow: 'shadow-amber-500/20',
    accentText: 'text-amber-300'
  },
  Shoulders: {
    bg: 'from-indigo-950/40 via-slate-900/90 to-slate-950/95',
    text: 'text-indigo-400',
    border: 'border-indigo-500/20 hover:border-indigo-500/40',
    barFrom: 'from-indigo-500',
    barTo: 'to-violet-400',
    iconBg: 'bg-indigo-500/10 border-indigo-500/30',
    iconColor: '#6366f1',
    accentGlow: 'shadow-indigo-500/20',
    accentText: 'text-indigo-300'
  },
  Arms: {
    bg: 'from-fuchsia-950/40 via-slate-900/90 to-slate-950/95',
    text: 'text-fuchsia-400',
    border: 'border-fuchsia-500/20 hover:border-fuchsia-500/40',
    barFrom: 'from-fuchsia-500',
    barTo: 'to-purple-400',
    iconBg: 'bg-fuchsia-500/10 border-fuchsia-500/30',
    iconColor: '#d946ef',
    accentGlow: 'shadow-fuchsia-500/20',
    accentText: 'text-fuchsia-300'
  },
  Core: {
    bg: 'from-cyan-950/40 via-slate-900/90 to-slate-950/95',
    text: 'text-cyan-400',
    border: 'border-cyan-500/20 hover:border-cyan-500/40',
    barFrom: 'from-cyan-500',
    barTo: 'to-sky-400',
    iconBg: 'bg-cyan-500/10 border-cyan-500/30',
    iconColor: '#06b6d4',
    accentGlow: 'shadow-cyan-500/20',
    accentText: 'text-cyan-300'
  },
};

// Render custom volumetric 3D vector illustration inline SVGs for high-quality visual finish
function renderMuscleIcon(muscle: MuscleGroup, theme: typeof MUSCLE_THEMES[MuscleGroup]) {
  switch (muscle) {
    case 'Chest':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={theme.iconColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
          <path d="M12 2L4 5v6c0 5.5 3.5 10 8 11 4.5-1 8-5.5 8-11V5l-8-3z" />
          <path d="M12 22V10" />
          <path d="M6 9h12" />
          <path d="M7 13c2 2 4 2 5 2s3 0 5-2" />
        </svg>
      );
    case 'Back':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={theme.iconColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
          <path d="M12 3l-8 4v2c0 4 3 8 8 12 5-4 8-8 8-12V7l-8-4z" />
          <path d="M7 11h10" />
          <path d="M8 15h8" />
          <path d="M9 19h6" />
        </svg>
      );
    case 'Legs':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={theme.iconColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
          <rect x="5" y="3" width="5" height="18" rx="2" />
          <rect x="14" y="3" width="5" height="18" rx="2" />
          <path d="M10 8h4" />
          <path d="M10 14h4" />
        </svg>
      );
    case 'Shoulders':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={theme.iconColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
          <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
          <path d="M3.27 6.96L12 12.01l8.73-5.05" />
          <path d="M12 22.08V12" />
        </svg>
      );
    case 'Arms':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={theme.iconColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
          <path d="M15 14c.2-1 .7-1.7 1.5-2 2.2-.7 3.5-2.5 3.5-5a5 5 0 00-5-5c-1.5 0-2.8.5-4 1.5M11 12H7a4 4 0 00-4 4v4h12v-6" />
          <circle cx="14" cy="18" r="1.5" />
        </svg>
      );
    case 'Core':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={theme.iconColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
      );
  }
}

interface AchievementToast {
  title: string;
  message: string;
  type: 'success' | 'info' | 'timer';
}

export default function Dashboard() {
  // State for user details, progress, and history
  const [user, setUser] = useState(INITIAL_USER);
  const [muscleProgresses, setMuscleProgresses] = useState<MuscleProgress[]>(() => {
    return INITIAL_MUSCLE_PROGRESS.map((p) => ({
      ...p,
      xpToNextLevel: getXpRequiredForNextLevel(p.level),
    }));
  });
  const [sessions, setSessions] = useState<WorkoutSession[]>(HISTORICAL_SESSIONS);

  // Modal / Session states
  const [isTrainingOpen, setIsTrainingOpen] = useState(false);
  const [sessionName, setSessionName] = useState('Entrenamiento Rápido');
  const [activeSets, setActiveSets] = useState<WorkoutSet[]>([]);

  // State-driven 3D Achievement Toast / Banner to replace native alerts
  const [toast, setToast] = useState<AchievementToast | null>(null);

  // UX Improvement 1: Store the last performed set data per exercise ID to load on selection
  const [lastSetPerExercise, setLastSetPerExercise] = useState<Record<string, { weight: number; reps: number; rpe: number }>>({
    'ex-1': { weight: 65, reps: 8, rpe: 9 }, // Initialize with historical bench press
    'ex-10': { weight: 25, reps: 12, rpe: 8 },
  });

  // Current inputs for adding a set
  const [selectedExerciseId, setSelectedExerciseId] = useState(INITIAL_EXERCISES[0].id);
  const [inputWeight, setInputWeight] = useState<number>(60);
  const [inputReps, setInputReps] = useState<number>(10);
  const [inputRpe, setInputRpe] = useState<number>(8);

  // UX Improvement 3: Auto rest-timer states
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(90); // default 90 seconds rest
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // State for active tabs
  const [activeTab, setActiveTab] = useState<'progress' | 'history' | 'exercises'>('progress');

  // Sub-tabs state inside the Progress section to avoid cluttering mobile viewport
  const [progressViewMode, setProgressViewMode] = useState<'map' | 'cards' | 'matrix'>('map');

  // Trigger custom 3D slide-down toast notification
  const triggerToast = (title: string, message: string, type: 'success' | 'info' | 'timer' = 'success') => {
    setToast({ title, message, type });
  };

  // Auto-dismiss the toast after 3.5 seconds
  useEffect(() => {
    if (toast) {
      const dismissTimer = setTimeout(() => {
        setToast(null);
      }, 3500);
      return () => clearTimeout(dismissTimer);
    }
  }, [toast]);

  // Synchronize input loading on exercise change directly inside selection handler
  const handleExerciseChange = (exerciseId: string) => {
    setSelectedExerciseId(exerciseId);
    if (lastSetPerExercise[exerciseId]) {
      const last = lastSetPerExercise[exerciseId];
      setInputWeight(last.weight);
      setInputReps(last.reps);
      setInputRpe(last.rpe);
    } else {
      setInputWeight(60);
      setInputReps(10);
      setInputRpe(8);
    }
  };

  // Handle automatic countdown timer ticking inside standard effect
  useEffect(() => {
    if (isTimerActive && !isTimerPaused) {
      if (timeLeft > 0) {
        timerRef.current = setTimeout(() => {
          setTimeLeft((prev) => prev - 1);
        }, 1000);
      } else {
        setTimeout(() => {
          setIsTimerActive(false);
          triggerToast('⏰ ¡Descanso Terminado!', 'Tu cuerpo se ha recuperado. ¡Listo para la siguiente serie!', 'timer');
        }, 10);
      }
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isTimerActive, isTimerPaused, timeLeft]);

  // Incrementor helpers with physical click scale effects
  const changeWeight = (amount: number) => {
    setInputWeight((prev) => Math.max(0, prev + amount));
  };

  const changeReps = (amount: number) => {
    setInputReps((prev) => Math.max(0, prev + amount));
  };

  const changeRpe = (amount: number) => {
    setInputRpe((prev) => Math.min(10, Math.max(1, prev + amount)));
  };

  // Handle adding a set in current active session
  const handleAddSet = () => {
    if (!selectedExerciseId) return;

    const newSet: WorkoutSet = {
      id: `set-temp-${Date.now()}-${Math.random()}`,
      exerciseId: selectedExerciseId,
      weight: Number(inputWeight),
      reps: Number(inputReps),
      rpe: Number(inputRpe),
      timestamp: new Date().toISOString(),
    };

    setLastSetPerExercise((prev) => ({
      ...prev,
      [selectedExerciseId]: {
        weight: Number(inputWeight),
        reps: Number(inputReps),
        rpe: Number(inputRpe),
      },
    }));

    setActiveSets([...activeSets, newSet]);

    // Activate automatic floating overlay rest timer
    setTimeLeft(90);
    setIsTimerActive(true);
    setIsTimerPaused(false);

    triggerToast('✓ Serie Registrada', 'Se ha activado tu temporizador de descanso de 90s.', 'info');
  };

  // Remove a set during the current session
  const handleRemoveSet = (index: number) => {
    setActiveSets(activeSets.filter((_, i) => i !== index));
  };

  // Complete session & trigger dynamic tonnage-based XP progression mathematics
  const handleCompleteSession = () => {
    if (activeSets.length === 0) {
      triggerToast('⚠️ Error de Guardado', '¡Agrega al menos una serie para poder guardar el entrenamiento!', 'info');
      return;
    }

    // Accumulate actual math XP per muscle group
    const xpUpdates: Record<MuscleGroup, number> = {
      Chest: 0,
      Back: 0,
      Legs: 0,
      Shoulders: 0,
      Arms: 0,
      Core: 0,
    };

    activeSets.forEach((set) => {
      const exercise = INITIAL_EXERCISES.find((e) => e.id === set.exerciseId);
      if (exercise) {
        const primaryXpGained = calculateSetXp(set, true);
        const secondaryXpGained = calculateSetXp(set, false);

        xpUpdates[exercise.primaryMuscleGroup] += primaryXpGained;
        exercise.secondaryMuscleGroups?.forEach((sec) => {
          xpUpdates[sec] += secondaryXpGained;
        });
      }
    });

    const totalGainedXp = Object.values(xpUpdates).reduce((sum, val) => sum + val, 0);

    const updatedProgress = muscleProgresses.map((progress) => {
      const addedXp = xpUpdates[progress.muscleGroup];
      if (addedXp === 0) return progress;

      return addXpToMuscle(progress, addedXp);
    });

    const newTotalXp = user.totalXp + totalGainedXp;
    let newUserLevel = user.level;
    const userXpPerLevel = 2500;

    while (newTotalXp >= userXpPerLevel * newUserLevel) {
      newUserLevel += 1;
    }

    const updatedUser = {
      ...user,
      totalXp: newTotalXp,
      level: newUserLevel,
    };

    const newSession: WorkoutSession = {
      id: `s-${Date.now()}`,
      userId: user.id,
      name: sessionName,
      // Record complete current ISO date to accurately feed recovery fatigue calculations
      date: new Date().toISOString().split('T')[0],
      sets: activeSets,
      xpGained: totalGainedXp,
    };

    setMuscleProgresses(updatedProgress);
    setUser(updatedUser);
    setSessions([newSession, ...sessions]);

    setActiveSets([]);
    setSessionName('Entrenamiento Rápido');
    setIsTrainingOpen(false);
    setIsTimerActive(false);

    triggerToast('🏆 ¡Entrenamiento Completado!', `Fórmula Tonelaje + RPE calculó un total de +${totalGainedXp} EXP.`, 'success');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-36 relative overflow-hidden">

      {/* ANIMATED 3D ACHIEVEMENT TOAST BANNER (Top floating, z-[110]) */}
      {toast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[110] w-[90%] max-w-sm pointer-events-none animate-bounce">
          <div className={`p-4.5 rounded-2.5xl border shadow-clay-lg flex items-start space-x-3.5 pointer-events-auto bg-gradient-to-b ${
            toast.type === 'success'
              ? 'from-emerald-900/95 via-slate-900 to-slate-950 border-emerald-500/50'
              : toast.type === 'timer'
              ? 'from-amber-900/95 via-slate-900 to-slate-950 border-amber-500/50'
              : 'from-blue-900/95 via-slate-900 to-slate-950 border-blue-500/50'
          }`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg border shadow-clay-sm ${
              toast.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : toast.type === 'timer'
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                : 'bg-blue-500/10 border-blue-500/30 text-blue-400'
            }`}>
              {toast.type === 'success' ? '🏆' : toast.type === 'timer' ? '⏰' : '✓'}
            </div>
            <div className="flex-1">
              <h5 className="font-black text-xs uppercase tracking-wide text-slate-100">{toast.title}</h5>
              <p className="text-[11px] text-slate-300 font-semibold mt-1 leading-relaxed">{toast.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* 3D AMBIENT MESH GLOWS */}
      <div className="fixed -top-16 -right-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed top-1/3 -left-36 w-96 h-96 bg-indigo-500/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="fixed bottom-10 -right-24 w-80 h-80 bg-rose-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* HEADER SECTION (Elevated Character Profile Card) */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-4 shadow-clay-md">
        <div className="max-w-md mx-auto">
          <div className="bg-gradient-to-br from-slate-900/95 via-slate-950 to-slate-900 p-4.5 rounded-3xl border border-slate-800 shadow-clay-sm flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-13 h-13 rounded-full overflow-hidden border-2 border-emerald-500 ring-4 ring-emerald-500/20 shadow-neon-glow flex items-center justify-center bg-slate-950">
                  {user.avatarUrl ? (
                    <Image
                      src={user.avatarUrl}
                      alt={user.name}
                      width={52}
                      height={52}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <span className="font-black text-xl text-emerald-400">{user.name.charAt(0)}</span>
                  )}
                </div>
                <div className="absolute -bottom-1.5 -right-1 bg-gradient-to-b from-amber-400 to-orange-500 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-full shadow-clay-badge border border-white/20">
                  LV {user.level}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <h2 className="text-sm font-black text-slate-200 tracking-wide">{user.name}</h2>
                  <span className="bg-gradient-to-r from-emerald-500/15 to-teal-500/15 text-emerald-400 text-[9px] px-2 py-0.5 rounded-md font-black uppercase tracking-wider border border-emerald-500/30">
                    PLAYER
                  </span>
                </div>
                <div className="text-xs text-slate-400 font-bold mt-0.5 flex items-center gap-1.5">
                  <span className="text-amber-400 font-extrabold">{user.rankName}</span>
                  <span className="text-slate-600">•</span>
                  <span>{user.totalXp} XP</span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xl font-black bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent tracking-tight">GymRPG</span>
              <span className="text-[8px] text-slate-500 uppercase tracking-widest font-black block mt-0.5">MÓVIL NATIVO</span>
            </div>
          </div>
        </div>
      </header>

      {/* HIGH Z-INDEX FLOATING AUTOMATIC REST TIMER countdown (z-[100]) */}
      {isTimerActive && (
        <div className="fixed bottom-28 right-4 z-[100] animate-bounce">
          <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border-2 border-emerald-500/60 p-4 rounded-2.5xl shadow-clay-lg flex items-center space-x-3.5 text-xs w-64 relative overflow-hidden">
            <div className="absolute inset-x-0 top-0.5 h-1 bg-white/10 rounded-full blur-xs mx-4" />
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-b from-slate-950 to-slate-900 flex items-center justify-center text-emerald-400 font-mono font-black border border-emerald-500/30 shadow-sunken">
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </div>
            <div className="flex-1">
              <span className="font-black text-slate-200 block text-[11px] tracking-wide uppercase">Descanso Activo</span>
              <div className="flex space-x-2 mt-1.5">
                <button
                  onClick={() => setIsTimerPaused(!isTimerPaused)}
                  className="text-[10px] bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700/40 text-slate-200 px-2 py-1 rounded-md font-extrabold shadow-clay-sm active:scale-95 transition-all cursor-pointer"
                >
                  {isTimerPaused ? 'Reanudar' : 'Pausar'}
                </button>
                <button
                  onClick={() => setIsTimerActive(false)}
                  className="text-[10px] bg-red-950/60 text-red-400 px-2 py-1 rounded-md font-extrabold border border-red-500/20 active:scale-95 transition-all cursor-pointer"
                >
                  Saltar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTAINER */}
      <main className="max-w-md mx-auto px-4 pt-6 space-y-6">

        {/* TABS SELECTOR */}
        <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-900 shadow-sunken">
          <button
            onClick={() => setActiveTab('progress')}
            className={`flex-1 py-3 text-xs font-black rounded-xl transition-all duration-200 cursor-pointer ${
              activeTab === 'progress'
                ? 'bg-gradient-to-b from-slate-800 to-slate-900 text-emerald-400 shadow-clay-sm border border-slate-700/50'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Progreso Muscular
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-3 text-xs font-black rounded-xl transition-all duration-200 cursor-pointer ${
              activeTab === 'history'
                ? 'bg-gradient-to-b from-slate-800 to-slate-900 text-emerald-400 shadow-clay-sm border border-slate-700/50'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Historial ({sessions.length})
          </button>
          <button
            onClick={() => setActiveTab('exercises')}
            className={`flex-1 py-3 text-xs font-black rounded-xl transition-all duration-200 cursor-pointer ${
              activeTab === 'exercises'
                ? 'bg-gradient-to-b from-slate-800 to-slate-900 text-emerald-400 shadow-clay-sm border border-slate-700/50'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Ejercicios ({INITIAL_EXERCISES.length})
          </button>
        </div>

        {/* TAB 1: PROGRESS SUB-TABS (Anatomy Map, Details, Ranks Matrix) */}
        {activeTab === 'progress' && (
          <div className="space-y-6">

            {/* Elegant Sub-Tab Selector */}
            <div className="flex bg-slate-950/60 p-1 rounded-xl border border-slate-900/80 shadow-sunken w-full">
              <button
                onClick={() => setProgressViewMode('map')}
                className={`flex-1 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all duration-150 cursor-pointer ${
                  progressViewMode === 'map'
                    ? 'bg-slate-800 text-slate-100 shadow-clay-sm border border-slate-700/30'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                🗺️ MAPA ANATOMÍA
              </button>
              <button
                onClick={() => setProgressViewMode('cards')}
                className={`flex-1 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all duration-150 cursor-pointer ${
                  progressViewMode === 'cards'
                    ? 'bg-slate-800 text-slate-100 shadow-clay-sm border border-slate-700/30'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                📋 MIS TARJETAS
              </button>
              <button
                onClick={() => setProgressViewMode('matrix')}
                className={`flex-1 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all duration-150 cursor-pointer ${
                  progressViewMode === 'matrix'
                    ? 'bg-slate-800 text-slate-100 shadow-clay-sm border border-slate-700/30'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                🏆 MATRIZ RANGOS
              </button>
            </div>

            {/* RENDER ACTIVE VIEW SUB-MODE */}
            {progressViewMode === 'map' && (
              <div className="animate-fade-in">
                <BodyMapViewer muscleProgresses={muscleProgresses} sessions={sessions} />
              </div>
            )}

            {progressViewMode === 'matrix' && (
              <div className="animate-fade-in">
                <RanksGallery muscleProgresses={muscleProgresses} />
              </div>
            )}

            {progressViewMode === 'cards' && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-[11px] font-black tracking-wider text-slate-500 uppercase">Tarjetas de Maestría</h3>
                  <span className="text-[10px] font-black text-teal-400 bg-teal-500/10 px-3 py-1 rounded-full border border-teal-500/20 shadow-clay-badge">
                    Maestría RPG
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-5">
                  {muscleProgresses.map((progress) => {
                    const theme = MUSCLE_THEMES[progress.muscleGroup];
                    const percentage = Math.min(100, (progress.currentXp / progress.xpToNextLevel) * 100);
                    const primaryExercises = INITIAL_EXERCISES.filter(e => e.primaryMuscleGroup === progress.muscleGroup);

                    return (
                      <div
                        key={progress.muscleGroup}
                        className={`bg-gradient-to-br ${theme.bg} p-5.5 rounded-3xl border-2 ${theme.border} ${theme.accentGlow} shadow-clay-md transition-all duration-300 hover:-translate-y-1 hover:shadow-clay-lg`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className={`w-14 h-14 rounded-2xl ${theme.iconBg} border flex items-center justify-center shadow-clay-sm`}>
                              {renderMuscleIcon(progress.muscleGroup, theme)}
                            </div>
                            <div>
                              <h4 className="font-black text-slate-100 text-base flex items-center gap-2">
                                {progress.muscleGroup === 'Chest' ? 'Pecho' :
                                 progress.muscleGroup === 'Back' ? 'Espalda' :
                                 progress.muscleGroup === 'Legs' ? 'Piernas' :
                                 progress.muscleGroup === 'Shoulders' ? 'Hombros' :
                                 progress.muscleGroup === 'Arms' ? 'Brazos' : 'Core'}
                              </h4>
                              <p className="text-[11px] text-slate-400 font-bold tracking-wide mt-0.5">{progress.rankName}</p>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-1.5">
                            <span className="bg-gradient-to-b from-slate-800 to-slate-950 text-emerald-400 text-[10px] font-black px-3 py-1 rounded-xl border border-emerald-500/30 shadow-clay-badge">
                              NIV. {progress.level}
                            </span>
                            <span className="text-[10px] font-mono font-black text-slate-400">
                              {progress.currentXp} <span className="text-[9px] text-slate-600">/ {progress.xpToNextLevel} XP</span>
                            </span>
                          </div>
                        </div>

                        <div className="mt-5 h-5.5 w-full bg-slate-950 rounded-full border border-slate-900 shadow-sunken p-[3.5px] relative overflow-hidden">
                          <div className="absolute inset-x-0 top-0.5 h-1 bg-white/10 rounded-full blur-[0.5px] z-10 pointer-events-none mx-2" />
                          <div
                            className={`h-full rounded-full bg-gradient-to-r ${theme.barFrom} ${theme.barTo} transition-all duration-500 relative shadow-[inset_1px_2px_2px_rgba(255,255,255,0.4)]`}
                            style={{ width: `${percentage}%` }}
                          >
                            {percentage > 3 && (
                              <div className="absolute right-0 top-0 bottom-0 w-2.5 bg-white rounded-r-full blur-xs animate-pulse opacity-90" />
                            )}
                          </div>
                        </div>

                        <div className="mt-4.5 flex items-center justify-between text-[11px] text-slate-500 pt-3 border-t border-slate-900/40">
                          <span className="font-semibold">{primaryExercises.length} Ejercicios disponibles</span>
                          <span className={`font-black uppercase tracking-widest text-[9px] ${theme.accentText}`}>Grupo Primario</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        )}

        {/* TAB 2: HISTORICAL LOGS */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            <h3 className="text-[11px] font-black tracking-wider text-slate-500 uppercase px-1">Tus Sesiones Realizadas</h3>
            {sessions.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-10">Aún no has registrado ningún entrenamiento.</p>
            ) : (
              <div className="space-y-4">
                {sessions.map((session) => (
                  <div key={session.id} className="bg-gradient-to-br from-slate-900 to-slate-950 p-5 rounded-3xl border border-slate-800/80 shadow-clay-md">
                    <div className="flex justify-between items-start mb-3.5">
                      <div>
                        <h4 className="font-black text-slate-200 text-sm tracking-wide">{session.name}</h4>
                        <p className="text-[11px] text-slate-500 font-bold mt-0.5">{session.date}</p>
                      </div>
                      {session.xpGained && (
                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 text-xs font-black px-3.5 py-1.5 rounded-xl shadow-clay-badge">
                          +{session.xpGained} EXP
                        </span>
                      )}
                    </div>

                    <div className="space-y-2 border-t border-slate-900/80 pt-4">
                      {session.sets.map((set, idx) => {
                        const exercise = INITIAL_EXERCISES.find(e => e.id === set.exerciseId);
                        return (
                          <div key={set.id} className="flex justify-between text-xs text-slate-300 bg-slate-950/40 p-2 rounded-lg border border-slate-900">
                            <span>
                              Serie {idx + 1}: <strong className="text-slate-200 font-bold">{exercise?.name}</strong>
                            </span>
                            <span className="font-mono text-slate-400 font-bold">
                              {set.weight} kg × {set.reps} {set.rpe ? `(RPE ${set.rpe})` : ''}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: EXERCISE DIRECTORY */}
        {activeTab === 'exercises' && (
          <div className="space-y-4">
            <h3 className="text-[11px] font-black tracking-wider text-slate-500 uppercase px-1">Catálogo de Ejercicios</h3>
            <div className="space-y-3">
              {INITIAL_EXERCISES.map((exercise) => {
                const theme = MUSCLE_THEMES[exercise.primaryMuscleGroup];
                return (
                  <div key={exercise.id} className="bg-gradient-to-br from-slate-900/90 via-slate-950 to-slate-900 p-4.5 rounded-3xl border border-slate-800/80 shadow-clay-sm">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-black text-sm text-slate-100 tracking-wide">{exercise.name}</h4>
                      <span className={`bg-gradient-to-b from-slate-950 to-slate-900 ${theme.text} text-[10px] font-black px-3 py-1 rounded-full border border-slate-800 shadow-clay-badge`}>
                        {exercise.primaryMuscleGroup}
                      </span>
                    </div>
                    {exercise.description && (
                      <p className="text-xs text-slate-400/95 leading-relaxed font-medium">{exercise.description}</p>
                    )}
                    {exercise.secondaryMuscleGroups && exercise.secondaryMuscleGroups.length > 0 && (
                      <div className="flex items-center space-x-2 mt-3 pt-3 border-t border-slate-950">
                        <span className="text-[9px] text-slate-500 uppercase font-black tracking-wider">Secundarios:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {exercise.secondaryMuscleGroups.map(sec => {
                            const secTheme = MUSCLE_THEMES[sec];
                            return (
                              <span key={sec} className={`bg-slate-950 ${secTheme.text} text-[9px] px-2 py-0.5 rounded-md border border-slate-900 font-bold`}>
                                {sec}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* TACTILE 3D BOTTOM NAV BAR WITH CLAY CTA */}
      <div className="fixed bottom-0 inset-x-0 bg-slate-950/95 backdrop-blur-md border-t border-slate-900/80 p-5 z-40 max-w-md mx-auto shadow-clay-lg">
        <button
          onClick={() => {
            setIsTrainingOpen(true);
            setActiveSets([]);
          }}
          className="w-full bg-gradient-to-b from-emerald-400 via-emerald-500 to-teal-600 hover:from-emerald-300 hover:to-teal-500 text-slate-950 font-black tracking-wider py-4.5 rounded-2xl flex items-center justify-center space-x-3 shadow-clay-emerald border border-emerald-300/25 transition-all duration-200 active:scale-[0.98] cursor-pointer"
        >
          <span className="text-xl filter drop-shadow">🏋️‍♂️</span>
          <span className="text-sm uppercase tracking-wide">INICIAR ENTRENAMIENTO</span>
        </button>
      </div>

      {/* CLAYMORPHIC INTERACTIVE WORKOUT MODAL */}
      {isTrainingOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-end justify-center p-0 sm:p-4">
          <div className="bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border-t sm:border border-slate-800 w-full max-w-md rounded-t-3xl sm:rounded-3xl max-h-[92vh] overflow-y-auto flex flex-col shadow-clay-lg">

            {/* Modal Header */}
            <div className="p-5 border-b border-slate-950 flex justify-between items-center sticky top-0 z-10 bg-slate-900/95 backdrop-blur">
              <div className="flex-1 mr-4">
                <input
                  type="text"
                  value={sessionName}
                  onChange={(e) => setSessionName(e.target.value)}
                  className="bg-slate-950 border-none text-slate-100 font-extrabold text-base px-3 py-2 rounded-xl focus:ring-2 focus:ring-emerald-500/50 w-full shadow-sunken border border-slate-800"
                />

                {/* INLINE HEADER REST TIMER INDICATOR */}
                {isTimerActive && (
                  <div className="mt-2.5 flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl text-[10px] text-emerald-400 font-bold w-fit animate-pulse">
                    <span>⏱️ TIEMPO DE DESCANSO: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
                    <button onClick={() => setIsTimerActive(false)} className="text-[9px] bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 px-1.5 py-0.5 rounded font-black cursor-pointer">
                      SALTAR
                    </button>
                  </div>
                )}
                {!isTimerActive && (
                  <p className="text-[10px] text-slate-400 font-bold mt-1.5 px-1">Registra tus series para ganar experiencia en tus músculos.</p>
                )}
              </div>
              <button
                onClick={() => setIsTrainingOpen(false)}
                className="text-slate-400 hover:text-slate-200 bg-slate-950/60 w-8 h-8 rounded-full flex items-center justify-center shadow-clay-sm hover:scale-105 active:scale-95 border border-slate-800/50 transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-5 flex-1">

              {/* Form to log a new set (Sunken block) */}
              <div className="p-4.5 rounded-2.5xl bg-slate-950 border border-slate-900 shadow-sunken space-y-5">
                <span className="text-[10px] font-black text-slate-500 tracking-wider uppercase block">Agregar Serie</span>

                {/* Select Exercise */}
                <div className="space-y-1.5">
                  <label className="text-[11px] text-slate-500 font-black px-1 uppercase tracking-wide">Ejercicio</label>
                  <select
                    value={selectedExerciseId}
                    onChange={(e) => handleExerciseChange(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800/80 rounded-xl p-3 text-xs text-slate-200 font-black shadow-clay-sm focus:ring-2 focus:ring-emerald-500/50 transition-all cursor-pointer"
                  >
                    {INITIAL_EXERCISES.map((ex) => (
                      <option key={ex.id} value={ex.id}>
                        [{ex.primaryMuscleGroup}] - {ex.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Metrics Form with Increment/Decrement Buttons */}
                <div className="space-y-4.5">
                  {/* Weight Control Row */}
                  <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-900 shadow-sunken">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[11px] text-slate-400 font-black px-1 uppercase tracking-wide">Peso (kg)</span>
                      <span className="text-[11px] text-emerald-400 font-mono font-black">{inputWeight} kg</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => changeWeight(-5)}
                        className="w-10 h-10 rounded-xl bg-slate-950 text-xs font-black text-slate-300 border border-slate-800 shadow-clay-badge active:scale-90 transition-all cursor-pointer"
                      >
                        -5
                      </button>
                      <button
                        onClick={() => changeWeight(-2.5)}
                        className="w-11 h-10 rounded-xl bg-slate-950 text-xs font-black text-slate-300 border border-slate-800 shadow-clay-badge active:scale-90 transition-all cursor-pointer"
                      >
                        -2.5
                      </button>

                      <input
                        type="number"
                        value={inputWeight}
                        onChange={(e) => setInputWeight(Number(e.target.value))}
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-2 text-center text-xs text-slate-200 font-black shadow-sunken focus:shadow-sunken-active focus:ring-1 focus:ring-emerald-500/50"
                      />

                      <button
                        onClick={() => changeWeight(2.5)}
                        className="w-11 h-10 rounded-xl bg-slate-950 text-xs font-black text-emerald-400 border border-slate-800 shadow-clay-badge active:scale-90 transition-all cursor-pointer"
                      >
                        +2.5
                      </button>
                      <button
                        onClick={() => changeWeight(5)}
                        className="w-10 h-10 rounded-xl bg-slate-950 text-xs font-black text-emerald-400 border border-slate-800 shadow-clay-badge active:scale-90 transition-all cursor-pointer"
                      >
                        +5
                      </button>
                    </div>
                  </div>

                  {/* Reps and RPE side-by-side controls */}
                  <div className="grid grid-cols-2 gap-3.5">

                    {/* Reps Control */}
                    <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-900 shadow-sunken">
                      <span className="text-[11px] text-slate-400 font-black block mb-1.5 px-1 uppercase tracking-wide">Reps</span>
                      <div className="flex items-center justify-between space-x-1">
                        <button
                          onClick={() => changeReps(-1)}
                          className="w-9 h-9 rounded-xl bg-slate-950 text-xs font-black text-slate-300 border border-slate-800 shadow-clay-badge active:scale-90 transition-all cursor-pointer"
                        >
                          -1
                        </button>
                        <input
                          type="number"
                          value={inputReps}
                          onChange={(e) => setInputReps(Number(e.target.value))}
                          className="w-12 bg-slate-950 border border-slate-800 rounded-xl p-2 text-center text-xs text-slate-200 font-black shadow-sunken focus:shadow-sunken-active focus:ring-1 focus:ring-emerald-500/50"
                        />
                        <button
                          onClick={() => changeReps(1)}
                          className="w-9 h-9 rounded-xl bg-slate-950 text-xs font-black text-emerald-400 border border-slate-800 shadow-clay-badge active:scale-90 transition-all cursor-pointer"
                        >
                          +1
                        </button>
                      </div>
                    </div>

                    {/* RPE Control */}
                    <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-900 shadow-sunken">
                      <span className="text-[11px] text-slate-400 font-black block mb-1.5 px-1 uppercase tracking-wide">RPE (1-10)</span>
                      <div className="flex items-center justify-between space-x-1">
                        <button
                          onClick={() => changeRpe(-1)}
                          className="w-9 h-9 rounded-xl bg-slate-950 text-xs font-black text-slate-300 border border-slate-800 shadow-clay-badge active:scale-90 transition-all cursor-pointer"
                        >
                          -1
                        </button>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={inputRpe}
                          onChange={(e) => setInputRpe(Number(e.target.value))}
                          className="w-12 bg-slate-950 border border-slate-800 rounded-xl p-2 text-center text-xs text-slate-200 font-black shadow-sunken focus:shadow-sunken-active focus:ring-1 focus:ring-emerald-500/50"
                        />
                        <button
                          onClick={() => changeRpe(1)}
                          className="w-9 h-9 rounded-xl bg-slate-950 text-xs font-black text-emerald-400 border border-slate-800 shadow-clay-badge active:scale-90 transition-all cursor-pointer"
                        >
                          +1
                        </button>
                      </div>
                    </div>

                  </div>
                </div>

                <button
                  onClick={handleAddSet}
                  className="w-full bg-gradient-to-b from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 text-emerald-400 font-black border border-slate-700/50 py-3.5 rounded-xl text-xs uppercase tracking-wide shadow-clay-badge active:scale-[0.98] transition-all duration-150 cursor-pointer"
                >
                  + Agregar Serie (Iniciar Descanso)
                </button>
              </div>

              {/* Added sets list */}
              <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                  <span className="text-[10px] font-black text-slate-500 tracking-wider uppercase">Series en Sesión ({activeSets.length})</span>
                  {activeSets.length > 0 && (
                    <button onClick={() => setActiveSets([])} className="text-[10px] text-rose-400 hover:text-rose-300 font-bold transition-all">
                      Limpiar todo
                    </button>
                  )}
                </div>

                {activeSets.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-6 border border-dashed border-slate-800 rounded-2xl">
                    No has agregado ninguna serie todavía.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-[22vh] overflow-y-auto pr-1">
                    {activeSets.map((set, idx) => {
                      const exercise = INITIAL_EXERCISES.find((e) => e.id === set.exerciseId);
                      return (
                        <div
                          key={set.id}
                          className="flex justify-between items-center p-3 rounded-xl border border-slate-800 bg-slate-950/60 text-xs shadow-clay-sm"
                        >
                          <div>
                            <span className="font-extrabold text-slate-400">#{idx + 1} - </span>
                            <span className="text-slate-200 font-bold">{exercise?.name}</span>
                            <div className="text-[9px] text-slate-500 font-semibold mt-0.5">
                              {exercise?.primaryMuscleGroup}
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className="font-mono text-slate-300 font-bold bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-800">
                              {set.weight}kg x {set.reps} (RPE {set.rpe})
                            </span>
                            <button
                              onClick={() => handleRemoveSet(idx)}
                              className="text-red-400 hover:text-red-300 w-6 h-6 rounded-full bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center font-bold text-xs cursor-pointer"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>

            {/* Modal Footer / Complete Workout Button */}
            <div className="p-5 border-t border-slate-950 bg-slate-900/95 sticky bottom-0 z-10 flex gap-3">
              <button
                onClick={() => setIsTrainingOpen(false)}
                className="flex-1 bg-gradient-to-b from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 text-slate-300 py-4 rounded-2xl text-xs font-black shadow-clay-sm active:scale-95 transition-all border border-slate-700/20 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleCompleteSession}
                className="flex-[2] bg-gradient-to-b from-emerald-400 to-teal-600 hover:from-emerald-300 hover:to-teal-500 text-slate-950 py-4 rounded-2xl text-xs font-black tracking-wide shadow-clay-emerald border border-emerald-300/10 active:scale-95 transition-all cursor-pointer"
              >
                💾 GUARDAR & GANAR XP
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
