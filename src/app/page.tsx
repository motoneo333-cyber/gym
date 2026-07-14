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

// Safe muscle icons/indicators
const MUSCLE_EMOJIS: Record<MuscleGroup, string> = {
  Chest: '💪',
  Back: '📐',
  Legs: '🦵',
  Shoulders: '🛡️',
  Arms: '🦾',
  Core: '🧱',
};

// Colors optimized for smooth matte claymorphism gradients and rounded gloss styling
const MUSCLE_COLORS: Record<MuscleGroup, { bg: string; text: string; border: string; bar: string; glow: string }> = {
  Chest: {
    bg: 'from-red-950/40 to-red-900/10',
    text: 'text-red-400',
    border: 'border-red-500/20',
    bar: 'bg-gradient-to-r from-red-500 to-rose-400',
    glow: 'shadow-red-500/10'
  },
  Back: {
    bg: 'from-emerald-950/40 to-emerald-900/10',
    text: 'text-emerald-400',
    border: 'border-emerald-500/20',
    bar: 'bg-gradient-to-r from-emerald-500 to-teal-400',
    glow: 'shadow-emerald-500/10'
  },
  Legs: {
    bg: 'from-amber-950/40 to-amber-900/10',
    text: 'text-amber-400',
    border: 'border-amber-500/20',
    bar: 'bg-gradient-to-r from-amber-500 to-orange-400',
    glow: 'shadow-amber-500/10'
  },
  Shoulders: {
    bg: 'from-indigo-950/40 to-indigo-900/10',
    text: 'text-indigo-400',
    border: 'border-indigo-500/20',
    bar: 'bg-gradient-to-r from-indigo-500 to-violet-400',
    glow: 'shadow-indigo-500/10'
  },
  Arms: {
    bg: 'from-purple-950/40 to-purple-900/10',
    text: 'text-purple-400',
    border: 'border-purple-500/20',
    bar: 'bg-gradient-to-r from-purple-500 to-fuchsia-400',
    glow: 'shadow-purple-500/10'
  },
  Core: {
    bg: 'from-cyan-950/40 to-cyan-900/10',
    text: 'text-cyan-400',
    border: 'border-cyan-500/20',
    bar: 'bg-gradient-to-r from-cyan-500 to-sky-400',
    glow: 'shadow-cyan-500/10'
  },
};

export default function Dashboard() {
  // State for user details, progress, and history
  const [user, setUser] = useState(INITIAL_USER);
  const [muscleProgresses, setMuscleProgresses] = useState<MuscleProgress[]>(() => {
    // Standardize initial level curves on startup using our utility
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

  // UX Improvement 1: Store the last performed set data per exercise ID
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

  // Synchronize input loading on exercise change directly without triggering useEffect react-hooks warnings
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

  // Handle automatic countdown timer ticking using standard effect and avoiding synchronous cascading warnings
  useEffect(() => {
    if (isTimerActive && !isTimerPaused) {
      if (timeLeft > 0) {
        timerRef.current = setTimeout(() => {
          setTimeLeft((prev) => prev - 1);
        }, 1000);
      } else {
        // Handle expiration inside a timeout to run completely outside the render cycle
        setTimeout(() => {
          setIsTimerActive(false);
          alert('⏰ ¡Tiempo de descanso completado! Listo para la siguiente serie.');
        }, 10);
      }
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isTimerActive, isTimerPaused, timeLeft]);

  // Incrementor helpers with double borders and physical feedback click responses
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

    // Save as last set for this exercise to load next time
    setLastSetPerExercise((prev) => ({
      ...prev,
      [selectedExerciseId]: {
        weight: Number(inputWeight),
        reps: Number(inputReps),
        rpe: Number(inputRpe),
      },
    }));

    setActiveSets([...activeSets, newSet]);

    // UX Improvement 3: Activate automatic floating overlay rest timer!
    setTimeLeft(90);
    setIsTimerActive(true);
    setIsTimerPaused(false);
  };

  // Remove a set during the current session
  const handleRemoveSet = (index: number) => {
    setActiveSets(activeSets.filter((_, i) => i !== index));
  };

  // Complete session & trigger dynamic tonnage-based XP progression mathematics
  const handleCompleteSession = () => {
    if (activeSets.length === 0) {
      alert('¡Agrega al menos una serie para poder guardar el entrenamiento!');
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
        // Calculate exact Tonnage * RPE Factor XP
        const primaryXpGained = calculateSetXp(set, true);
        const secondaryXpGained = calculateSetXp(set, false);

        xpUpdates[exercise.primaryMuscleGroup] += primaryXpGained;
        exercise.secondaryMuscleGroups?.forEach((sec) => {
          xpUpdates[sec] += secondaryXpGained;
        });
      }
    });

    const totalGainedXp = Object.values(xpUpdates).reduce((sum, val) => sum + val, 0);

    // Apply progressive scaling level thresholds and dynamic ranks
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
    setIsTimerActive(false); // Turn off rest timer when workout is closed

    alert(`¡Entrenamiento registrado con éxito!\nFórmula Tonelaje + RPE calculó un total de +${totalGainedXp} XP ganados.`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-32">
      {/* HEADER SECTION (Claymorphic Navigation style) */}
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-800/60 px-4 py-3.5 shadow-clay-sm">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {user.avatarUrl ? (
              <div className="relative w-11 h-11 shadow-clay-sm rounded-full overflow-hidden">
                <Image
                  src={user.avatarUrl}
                  alt={user.name}
                  width={44}
                  height={44}
                  className="rounded-full border-2 border-emerald-500 object-cover"
                />
              </div>
            ) : (
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center font-bold text-slate-950 shadow-clay-sm">
                {user.name.charAt(0)}
              </div>
            )}
            <div>
              <div className="flex items-center space-x-1.5">
                <h2 className="text-sm font-bold text-slate-200">{user.name}</h2>
                <span className="bg-emerald-500/10 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full font-extrabold uppercase border border-emerald-500/20 shadow-clay-sm">
                  {user.rankName}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Nivel General {user.level} • {user.totalXp} XP Totales</p>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-xl font-extrabold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">GymRPG</span>
            <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Hito 2b Clay</span>
          </div>
        </div>
      </header>

      {/* FLOATING AUTOMATIC REST TIMER OVERLAY */}
      {isTimerActive && (
        <div className="fixed bottom-24 right-4 z-50 animate-bounce">
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-emerald-500/30 p-3.5 rounded-2xl shadow-clay-md flex items-center space-x-3 text-xs w-56">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-mono font-bold border border-emerald-500/25">
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </div>
            <div className="flex-1">
              <span className="font-extrabold text-slate-300 block">Descanso Activo</span>
              <div className="flex space-x-2 mt-1">
                <button
                  onClick={() => setIsTimerPaused(!isTimerPaused)}
                  className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-200 px-1.5 py-0.5 rounded font-bold transition-all"
                >
                  {isTimerPaused ? 'Reanudar' : 'Pausar'}
                </button>
                <button
                  onClick={() => setIsTimerActive(false)}
                  className="text-[10px] bg-red-950/40 text-red-400 px-1.5 py-0.5 rounded font-bold border border-red-500/10 transition-all"
                >
                  Saltar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTAINER */}
      <main className="max-w-md mx-auto px-4 pt-5 space-y-6">

        {/* TABS SELECTOR (Sunken track + clay pills) */}
        <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-900 shadow-sunken">
          <button
            onClick={() => setActiveTab('progress')}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all duration-200 ${
              activeTab === 'progress'
                ? 'bg-gradient-to-b from-slate-800 to-slate-900 text-emerald-400 shadow-clay-sm border border-slate-700/30'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Progreso Muscular
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all duration-200 ${
              activeTab === 'history'
                ? 'bg-gradient-to-b from-slate-800 to-slate-900 text-emerald-400 shadow-clay-sm border border-slate-700/30'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Historial ({sessions.length})
          </button>
          <button
            onClick={() => setActiveTab('exercises')}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all duration-200 ${
              activeTab === 'exercises'
                ? 'bg-gradient-to-b from-slate-800 to-slate-900 text-emerald-400 shadow-clay-sm border border-slate-700/30'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Ejercicios ({INITIAL_EXERCISES.length})
          </button>
        </div>

        {/* TAB 1: MUSCLE PROGRESS DASHBOARD */}
        {activeTab === 'progress' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-extrabold tracking-wider text-slate-500 uppercase">Progresión 3D de Rangos</h3>
              <span className="text-[11px] font-bold text-teal-400 bg-teal-500/10 px-3 py-1 rounded-full border border-teal-500/10 shadow-clay-sm">
                ¡Matemáticas de Tonelaje Activas!
              </span>
            </div>

            {/* CLAYMORPHIC MUSCLE CARDS LIST */}
            <div className="grid grid-cols-1 gap-4">
              {muscleProgresses.map((progress) => {
                const color = MUSCLE_COLORS[progress.muscleGroup];
                const percentage = Math.min(100, (progress.currentXp / progress.xpToNextLevel) * 100);
                const primaryExercises = INITIAL_EXERCISES.filter(e => e.primaryMuscleGroup === progress.muscleGroup);

                return (
                  <div
                    key={progress.muscleGroup}
                    className={`bg-gradient-to-br ${color.bg} p-5 rounded-3xl border ${color.border} shadow-clay-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-clay-lg`}
                  >
                    {/* Muscle Top Line */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-2xl bg-slate-950/40 flex items-center justify-center text-2xl border border-white/5 shadow-clay-sm">
                          {MUSCLE_EMOJIS[progress.muscleGroup]}
                        </div>
                        <div>
                          <h4 className="font-extrabold text-slate-100 text-base flex items-center gap-2">
                            {progress.muscleGroup === 'Chest' ? 'Pecho' :
                             progress.muscleGroup === 'Back' ? 'Espalda' :
                             progress.muscleGroup === 'Legs' ? 'Piernas' :
                             progress.muscleGroup === 'Shoulders' ? 'Hombros' :
                             progress.muscleGroup === 'Arms' ? 'Brazos' : 'Core'}
                            <span className="text-xs bg-slate-950/60 text-slate-300 px-2 py-0.5 rounded-full font-mono font-bold shadow-sunken border border-white/5">
                              Niv. {progress.level}
                            </span>
                          </h4>
                          <p className="text-xs text-slate-400/90 font-semibold">{progress.rankName}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-mono font-bold text-slate-300">
                          {progress.currentXp} <span className="text-[10px] text-slate-500">/ {progress.xpToNextLevel} XP</span>
                        </span>
                      </div>
                    </div>

                    {/* Claymorphic Sunken Progress Bar Container */}
                    <div className="mt-4 h-3 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-900 shadow-sunken p-[2px]">
                      <div
                        className={`h-full rounded-full ${color.bar} transition-all duration-500 shadow-[inset_1px_1px_2px_rgba(255,255,255,0.4)]`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>

                    {/* Exercise context details */}
                    <div className="mt-4 flex items-center justify-between text-[11px] text-slate-500 pt-3 border-t border-slate-900/50">
                      <span className="font-medium">{primaryExercises.length} Ejercicios registrados</span>
                      <span className="text-slate-600 font-extrabold tracking-wider uppercase text-[9px]">Foco Principal</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: HISTORICAL LOGS */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            <h3 className="text-xs font-extrabold tracking-wider text-slate-500 uppercase px-1">Tus Sesiones Realizadas</h3>
            {sessions.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-10">Aún no has registrado ningún entrenamiento.</p>
            ) : (
              <div className="space-y-4">
                {sessions.map((session) => (
                  <div key={session.id} className="bg-gradient-to-br from-slate-900 to-slate-950 p-5 rounded-3xl border border-slate-800/80 shadow-clay-md">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-extrabold text-slate-200 text-sm">{session.name}</h4>
                        <p className="text-[11px] text-slate-500 font-semibold">{session.date}</p>
                      </div>
                      {session.xpGained && (
                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-extrabold px-3 py-1 rounded-full shadow-clay-sm">
                          +{session.xpGained} EXP
                        </span>
                      )}
                    </div>

                    {/* Sets summary */}
                    <div className="space-y-2 border-t border-slate-900 pt-3.5">
                      {session.sets.map((set, idx) => {
                        const exercise = INITIAL_EXERCISES.find(e => e.id === set.exerciseId);
                        return (
                          <div key={set.id} className="flex justify-between text-xs text-slate-300">
                            <span>
                              Serie {idx + 1}: <strong className="text-slate-200 font-bold">{exercise?.name}</strong>
                            </span>
                            <span className="font-mono text-slate-400 font-semibold">
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
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold tracking-wider text-slate-500 uppercase px-1">Catálogo de Ejercicios</h3>
            <div className="space-y-3">
              {INITIAL_EXERCISES.map((exercise) => (
                <div key={exercise.id} className="bg-gradient-to-br from-slate-900 to-slate-950 p-4.5 rounded-3xl border border-slate-800/60 shadow-clay-sm">
                  <div className="flex justify-between items-start mb-1.5">
                    <h4 className="font-extrabold text-sm text-slate-100">{exercise.name}</h4>
                    <span className="bg-slate-950 text-slate-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-slate-800 shadow-clay-sm">
                      {exercise.primaryMuscleGroup}
                    </span>
                  </div>
                  {exercise.description && (
                    <p className="text-xs text-slate-400/90 leading-relaxed">{exercise.description}</p>
                  )}
                  {exercise.secondaryMuscleGroups && exercise.secondaryMuscleGroups.length > 0 && (
                    <div className="flex items-center space-x-2 mt-3 pt-2.5 border-t border-slate-950">
                      <span className="text-[9px] text-slate-500 uppercase font-extrabold tracking-wider">Músculos Secundarios:</span>
                      <div className="flex flex-wrap gap-1">
                        {exercise.secondaryMuscleGroups.map(sec => (
                          <span key={sec} className="bg-slate-900/60 text-slate-400 text-[9px] px-2 py-0.5 rounded-full border border-slate-800 font-medium">
                            {sec}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* TACTILE 3D BOTTOM NAV BAR WITH CLAY CTA */}
      <div className="fixed bottom-0 inset-x-0 bg-slate-950/90 backdrop-blur-md border-t border-slate-900/80 p-4.5 z-40 max-w-md mx-auto shadow-clay-lg">
        <button
          onClick={() => {
            setIsTrainingOpen(true);
            setActiveSets([]);
          }}
          className="w-full bg-gradient-to-b from-emerald-400 via-emerald-500 to-teal-600 hover:from-emerald-300 hover:to-teal-500 text-slate-950 font-black tracking-wide py-4 rounded-2xl flex items-center justify-center space-x-3 shadow-clay-emerald border border-emerald-300/20 transition-all duration-200 active:scale-95 active:shadow-sunken"
        >
          <span className="text-xl filter drop-shadow">🏋️‍♂️</span>
          <span className="text-sm">INICIAR ENTRENAMIENTO</span>
        </button>
      </div>

      {/* CLAYMORPHIC INTERACTIVE WORKOUT MODAL */}
      {isTrainingOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-end justify-center p-0 sm:p-4">
          <div className="bg-gradient-to-b from-slate-900 to-slate-950 border-t sm:border border-slate-800 w-full max-w-md rounded-t-3xl sm:rounded-3xl max-h-[92vh] overflow-y-auto flex flex-col shadow-clay-lg">

            {/* Modal Header */}
            <div className="p-5 border-b border-slate-950 flex justify-between items-center sticky top-0 z-10 bg-slate-900/95 backdrop-blur">
              <div className="flex-1 mr-4">
                <input
                  type="text"
                  value={sessionName}
                  onChange={(e) => setSessionName(e.target.value)}
                  className="bg-slate-950 border-none text-slate-100 font-extrabold text-base px-3 py-1.5 rounded-xl focus:ring-2 focus:ring-emerald-500/50 w-full shadow-sunken border border-slate-800"
                />
                <p className="text-[10px] text-slate-400 font-semibold mt-1 px-1">Registra tus series para ganar experiencia en tus músculos.</p>
              </div>
              <button
                onClick={() => setIsTrainingOpen(false)}
                className="text-slate-400 hover:text-slate-200 bg-slate-950/60 w-8 h-8 rounded-full flex items-center justify-center shadow-clay-sm hover:scale-105 active:scale-95 border border-slate-800/50 transition-all"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-5 flex-1">

              {/* Form to log a new set (Sunken block) */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-900 shadow-sunken space-y-5">
                <span className="text-[10px] font-black text-slate-500 tracking-wider uppercase block">Agregar Serie</span>

                {/* Select Exercise (Tactile drop-down) */}
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-500 font-bold px-1">Ejercicio</label>
                  <select
                    value={selectedExerciseId}
                    onChange={(e) => handleExerciseChange(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800/80 rounded-xl p-3 text-xs text-slate-200 font-bold shadow-clay-sm focus:ring-2 focus:ring-emerald-500/50 transition-all cursor-pointer"
                  >
                    {INITIAL_EXERCISES.map((ex) => (
                      <option key={ex.id} value={ex.id}>
                        [{ex.primaryMuscleGroup}] - {ex.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Metrics Form with Increment/Decrement Buttons */}
                <div className="space-y-4">
                  {/* Weight Control Row */}
                  <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-900 shadow-sunken">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[11px] text-slate-400 font-bold px-1">Peso (kg)</span>
                      <span className="text-[11px] text-slate-500 font-mono font-bold">Activo: {inputWeight} kg</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => changeWeight(-5)}
                        className="w-10 h-9 rounded-lg bg-slate-950 text-xs font-bold text-slate-300 border border-slate-800 shadow-clay-sm active:scale-90 active:shadow-sunken transition-all cursor-pointer"
                      >
                        -5
                      </button>
                      <button
                        onClick={() => changeWeight(-2.5)}
                        className="w-11 h-9 rounded-lg bg-slate-950 text-xs font-bold text-slate-300 border border-slate-800 shadow-clay-sm active:scale-90 active:shadow-sunken transition-all cursor-pointer"
                      >
                        -2.5
                      </button>

                      <input
                        type="number"
                        value={inputWeight}
                        onChange={(e) => setInputWeight(Number(e.target.value))}
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-center text-xs text-slate-200 font-bold shadow-sunken"
                      />

                      <button
                        onClick={() => changeWeight(2.5)}
                        className="w-11 h-9 rounded-lg bg-slate-950 text-xs font-bold text-emerald-400 border border-slate-800 shadow-clay-sm active:scale-90 active:shadow-sunken transition-all cursor-pointer"
                      >
                        +2.5
                      </button>
                      <button
                        onClick={() => changeWeight(5)}
                        className="w-10 h-9 rounded-lg bg-slate-950 text-xs font-bold text-emerald-400 border border-slate-800 shadow-clay-sm active:scale-90 active:shadow-sunken transition-all cursor-pointer"
                      >
                        +5
                      </button>
                    </div>
                  </div>

                  {/* Reps and RPE side-by-side controls */}
                  <div className="grid grid-cols-2 gap-3">

                    {/* Reps Control */}
                    <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-900 shadow-sunken">
                      <span className="text-[11px] text-slate-400 font-bold block mb-1 px-1">Reps</span>
                      <div className="flex items-center justify-between space-x-1">
                        <button
                          onClick={() => changeReps(-1)}
                          className="w-8 h-8 rounded-lg bg-slate-950 text-xs font-bold text-slate-300 border border-slate-800 shadow-clay-sm active:scale-90 transition-all cursor-pointer"
                        >
                          -1
                        </button>
                        <input
                          type="number"
                          value={inputReps}
                          onChange={(e) => setInputReps(Number(e.target.value))}
                          className="w-12 bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-center text-xs text-slate-200 font-bold shadow-sunken"
                        />
                        <button
                          onClick={() => changeReps(1)}
                          className="w-8 h-8 rounded-lg bg-slate-950 text-xs font-bold text-emerald-400 border border-slate-800 shadow-clay-sm active:scale-90 transition-all cursor-pointer"
                        >
                          +1
                        </button>
                      </div>
                    </div>

                    {/* RPE Control */}
                    <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-900 shadow-sunken">
                      <span className="text-[11px] text-slate-400 font-bold block mb-1 px-1">RPE (1-10)</span>
                      <div className="flex items-center justify-between space-x-1">
                        <button
                          onClick={() => changeRpe(-1)}
                          className="w-8 h-8 rounded-lg bg-slate-950 text-xs font-bold text-slate-300 border border-slate-800 shadow-clay-sm active:scale-90 transition-all cursor-pointer"
                        >
                          -1
                        </button>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={inputRpe}
                          onChange={(e) => setInputRpe(Number(e.target.value))}
                          className="w-12 bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-center text-xs text-slate-200 font-bold shadow-sunken"
                        />
                        <button
                          onClick={() => changeRpe(1)}
                          className="w-8 h-8 rounded-lg bg-slate-950 text-xs font-bold text-emerald-400 border border-slate-800 shadow-clay-sm active:scale-90 transition-all cursor-pointer"
                        >
                          +1
                        </button>
                      </div>
                    </div>

                  </div>
                </div>

                <button
                  onClick={handleAddSet}
                  className="w-full bg-gradient-to-b from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 text-emerald-400 font-extrabold border border-slate-700/50 py-3 rounded-xl text-xs shadow-clay-sm hover:scale-[1.01] active:scale-95 active:shadow-sunken transition-all duration-150 cursor-pointer"
                >
                  + Agregar Serie (Iniciar Descanso)
                </button>
              </div>

              {/* Added sets list */}
              <div className="space-y-2.5">
                <div className="flex justify-between items-center px-1">
                  <span className="text-[10px] font-black text-slate-500 tracking-wider uppercase">Series en Sesión Actual ({activeSets.length})</span>
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
                  <div className="space-y-2 max-h-[20vh] overflow-y-auto pr-1">
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
                            <span className="font-mono text-slate-300 font-bold bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
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
                className="flex-1 bg-gradient-to-b from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 text-slate-300 py-3.5 rounded-2xl text-xs font-bold shadow-clay-sm active:scale-95 active:shadow-sunken transition-all border border-slate-700/20 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleCompleteSession}
                className="flex-[2] bg-gradient-to-b from-emerald-400 to-teal-600 hover:from-emerald-300 hover:to-teal-500 text-slate-950 py-3.5 rounded-2xl text-xs font-black tracking-wide shadow-clay-emerald border border-emerald-300/10 active:scale-95 active:shadow-sunken transition-all cursor-pointer"
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
