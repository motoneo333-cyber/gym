'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { MuscleGroup, WorkoutSet, WorkoutSession, MuscleProgress } from '../types/gym';
import {
  INITIAL_USER,
  INITIAL_EXERCISES,
  INITIAL_MUSCLE_PROGRESS,
  HISTORICAL_SESSIONS,
} from '../data/mockData';

// Safe muscle icons/indicators
const MUSCLE_EMOJIS: Record<MuscleGroup, string> = {
  Chest: '💪',
  Back: '📐',
  Legs: '🦵',
  Shoulders: '🛡️',
  Arms: '🦾',
  Core: '🧱',
};

// Colors for visual appeal
const MUSCLE_COLORS: Record<MuscleGroup, { bg: string; text: string; border: string; bar: string }> = {
  Chest: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30', bar: 'bg-red-500' },
  Back: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30', bar: 'bg-emerald-500' },
  Legs: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30', bar: 'bg-amber-500' },
  Shoulders: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/30', bar: 'bg-indigo-500' },
  Arms: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30', bar: 'bg-purple-500' },
  Core: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/30', bar: 'bg-cyan-500' },
};

export default function Dashboard() {
  // State for user details, progress, and history to make it interactive!
  const [user, setUser] = useState(INITIAL_USER);
  const [muscleProgresses, setMuscleProgresses] = useState<MuscleProgress[]>(INITIAL_MUSCLE_PROGRESS);
  const [sessions, setSessions] = useState<WorkoutSession[]>(HISTORICAL_SESSIONS);

  // Modal / Session states
  const [isTrainingOpen, setIsTrainingOpen] = useState(false);
  const [sessionName, setSessionName] = useState('Entrenamiento Rápido');
  const [activeSets, setActiveSets] = useState<WorkoutSet[]>([]);

  // Current inputs for adding a set
  const [selectedExerciseId, setSelectedExerciseId] = useState(INITIAL_EXERCISES[0].id);
  const [inputWeight, setInputWeight] = useState<number>(60);
  const [inputReps, setInputReps] = useState<number>(10);
  const [inputRpe, setInputRpe] = useState<number>(8);

  // State for active tabs
  const [activeTab, setActiveTab] = useState<'progress' | 'history' | 'exercises'>('progress');

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

    setActiveSets([...activeSets, newSet]);
  };

  // Remove a set during the current session
  const handleRemoveSet = (index: number) => {
    setActiveSets(activeSets.filter((_, i) => i !== index));
  };

  // Helper to complete the training session and calculate EXP gamification!
  const handleCompleteSession = () => {
    if (activeSets.length === 0) {
      alert('¡Agrega al menos una serie para poder guardar el entrenamiento!');
      return;
    }

    // EXP Calculation:
    // Every set done gives XP to its primary muscle group and secondary muscle groups.
    // Let's do: 100 XP per set for Primary Muscle, 30 XP per set for Secondary Muscle.
    // Also, User level XP gains is the sum of all.
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
        xpUpdates[exercise.primaryMuscleGroup] += 100;
        exercise.secondaryMuscleGroups?.forEach((sec) => {
          xpUpdates[sec] += 30;
        });
      }
    });

    // Total XP gained in session
    const totalGainedXp = Object.values(xpUpdates).reduce((sum, val) => sum + val, 0);

    // Update Muscle Progress levels/XP
    const updatedProgress = muscleProgresses.map((progress) => {
      const addedXp = xpUpdates[progress.muscleGroup];
      if (addedXp === 0) return progress;

      let newXp = progress.currentXp + addedXp;
      let newLevel = progress.level;
      const xpNeeded = progress.xpToNextLevel; // e.g. 1000

      // Levelling up logic
      while (newXp >= xpNeeded) {
        newXp -= xpNeeded;
        newLevel += 1;
      }

      // Dynamic rank names based on level
      let rankName = progress.rankName;
      if (newLevel >= 5) rankName = `${progress.muscleGroup === 'Chest' ? 'Titán del Pectoral' : 'Titán de ' + progress.muscleGroup}`;
      else if (newLevel >= 3) rankName = `${progress.muscleGroup === 'Chest' ? 'Pectoral de Acero' : 'Fuerza de ' + progress.muscleGroup}`;

      return {
        ...progress,
        level: newLevel,
        currentXp: newXp,
        rankName,
      };
    });

    // Update overall user profile
    const newTotalXp = user.totalXp + totalGainedXp;
    let newUserLevel = user.level;
    const userXpPerLevel = 2500; // XP per overall user level

    while (newTotalXp >= userXpPerLevel * newUserLevel) {
      newUserLevel += 1;
    }

    const updatedUser = {
      ...user,
      totalXp: newTotalXp,
      level: newUserLevel,
    };

    // Save session to history
    const newSession: WorkoutSession = {
      id: `s-${Date.now()}`,
      userId: user.id,
      name: sessionName,
      date: new Date().toISOString().split('T')[0],
      sets: activeSets,
      xpGained: totalGainedXp,
    };

    // Commit States
    setMuscleProgresses(updatedProgress);
    setUser(updatedUser);
    setSessions([newSession, ...sessions]);

    // Reset session form
    setActiveSets([]);
    setSessionName('Entrenamiento Rápido');
    setIsTrainingOpen(false);

    alert(`¡Entrenamiento registrado con éxito! Ganaste +${totalGainedXp} XP de rango.`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-24">
      {/* HEADER SECTION */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-3">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {user.avatarUrl ? (
              <div className="relative w-11 h-11">
                <Image
                  src={user.avatarUrl}
                  alt={user.name}
                  width={44}
                  height={44}
                  className="rounded-full border-2 border-emerald-500 object-cover"
                />
              </div>
            ) : (
              <div className="w-11 h-11 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-slate-100">
                {user.name.charAt(0)}
              </div>
            )}
            <div>
              <div className="flex items-center space-x-1.5">
                <h2 className="text-sm font-semibold text-slate-200">{user.name}</h2>
                <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wide">
                  {user.rankName}
                </span>
              </div>
              <p className="text-xs text-slate-400">Nivel General {user.level} • {user.totalXp} XP Totales</p>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-xl font-bold text-emerald-400">GymRPG</span>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest">Hito 1 MVP</span>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-md mx-auto px-4 pt-5 space-y-6">

        {/* PROGRESS CARDS TABS SELECTOR */}
        <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveTab('progress')}
            className={`flex-1 py-2 text-xs font-medium rounded-md transition-all ${
              activeTab === 'progress' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Progreso Muscular
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2 text-xs font-medium rounded-md transition-all ${
              activeTab === 'history' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Historial ({sessions.length})
          </button>
          <button
            onClick={() => setActiveTab('exercises')}
            className={`flex-1 py-2 text-xs font-medium rounded-md transition-all ${
              activeTab === 'exercises' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Ejercicios ({INITIAL_EXERCISES.length})
          </button>
        </div>

        {/* TAB 1: MUSCLE PROGRESS DASHBOARD */}
        {activeTab === 'progress' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold tracking-wider text-slate-400 uppercase">Gamificación por Rangos</h3>
              <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                ¡Entrena para subir de nivel!
              </span>
            </div>

            {/* MUSCLE GRID */}
            <div className="grid grid-cols-1 gap-3">
              {muscleProgresses.map((progress) => {
                const color = MUSCLE_COLORS[progress.muscleGroup];
                const percentage = Math.min(100, (progress.currentXp / progress.xpToNextLevel) * 100);
                const primaryExercises = INITIAL_EXERCISES.filter(e => e.primaryMuscleGroup === progress.muscleGroup);

                return (
                  <div
                    key={progress.muscleGroup}
                    className={`p-4 rounded-xl border ${color.border} ${color.bg} transition-all hover:scale-[1.01]`}
                  >
                    {/* Muscle Top Line */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2.5">
                        <span className="text-2xl">{MUSCLE_EMOJIS[progress.muscleGroup]}</span>
                        <div>
                          <h4 className="font-bold text-slate-100 flex items-center gap-1.5">
                            {progress.muscleGroup === 'Chest' ? 'Pecho' :
                             progress.muscleGroup === 'Back' ? 'Espalda' :
                             progress.muscleGroup === 'Legs' ? 'Piernas' :
                             progress.muscleGroup === 'Shoulders' ? 'Hombros' :
                             progress.muscleGroup === 'Arms' ? 'Brazos' : 'Core'}
                            <span className="text-xs bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded-full font-mono">
                              Nivel {progress.level}
                            </span>
                          </h4>
                          <p className="text-xs text-slate-400 font-semibold">{progress.rankName}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-mono text-slate-300">
                          {progress.currentXp} / {progress.xpToNextLevel} <span className="text-[10px] text-slate-500">XP</span>
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-3.5 h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800/50">
                      <div
                        className={`h-full ${color.bar} transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>

                    {/* Simple exercise tag count */}
                    <div className="mt-3.5 flex items-center justify-between text-[11px] text-slate-400 pt-3 border-t border-slate-800/40">
                      <span>{primaryExercises.length} Ejercicios disponibles</span>
                      <span className="text-slate-500">Primary Muscle</span>
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
            <h3 className="text-sm font-bold tracking-wider text-slate-400 uppercase">Tus Entrenamientos</h3>
            {sessions.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-8">Aún no has registrado ningún entrenamiento.</p>
            ) : (
              <div className="space-y-3">
                {sessions.map((session) => (
                  <div key={session.id} className="p-4 rounded-xl border border-slate-800 bg-slate-900/60">
                    <div className="flex justify-between items-start mb-2.5">
                      <div>
                        <h4 className="font-bold text-slate-200 text-sm">{session.name}</h4>
                        <p className="text-[11px] text-slate-400">{session.date}</p>
                      </div>
                      {session.xpGained && (
                        <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-[11px] font-bold px-2 py-0.5 rounded-full">
                          +{session.xpGained} EXP
                        </span>
                      )}
                    </div>

                    {/* Sets summary */}
                    <div className="space-y-1.5 border-t border-slate-800/50 pt-2.5">
                      {session.sets.map((set, idx) => {
                        const exercise = INITIAL_EXERCISES.find(e => e.id === set.exerciseId);
                        return (
                          <div key={set.id} className="flex justify-between text-xs text-slate-300">
                            <span>
                              Serie {idx + 1}: <strong className="text-slate-100">{exercise?.name}</strong>
                            </span>
                            <span className="font-mono text-slate-400">
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
            <h3 className="text-sm font-bold tracking-wider text-slate-400 uppercase">Catálogo de Ejercicios</h3>
            <div className="space-y-2">
              {INITIAL_EXERCISES.map((exercise) => (
                <div key={exercise.id} className="p-3.5 rounded-lg border border-slate-800 bg-slate-900/40">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-sm text-slate-100">{exercise.name}</h4>
                    <span className="bg-slate-800 text-slate-400 text-[10px] px-2 py-0.5 rounded font-mono">
                      {exercise.primaryMuscleGroup}
                    </span>
                  </div>
                  {exercise.description && (
                    <p className="text-xs text-slate-400 mt-1">{exercise.description}</p>
                  )}
                  {exercise.secondaryMuscleGroups && exercise.secondaryMuscleGroups.length > 0 && (
                    <div className="flex items-center space-x-1.5 mt-2.5">
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider">Secundarios:</span>
                      {exercise.secondaryMuscleGroups.map(sec => (
                        <span key={sec} className="bg-slate-900 text-slate-400 text-[9px] px-1.5 py-0.5 rounded border border-slate-800">
                          {sec}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* QUICK TRAINING ACTION CALL TO ACTION BAR */}
      <div className="fixed bottom-0 inset-x-0 bg-slate-900/95 border-t border-slate-800 p-4 z-40 max-w-md mx-auto">
        <button
          onClick={() => {
            setIsTrainingOpen(true);
            setActiveSets([]);
          }}
          className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-slate-950 font-extrabold py-3.5 rounded-xl flex items-center justify-center space-x-2.5 shadow-lg shadow-emerald-500/10 transition-transform active:scale-[0.98]"
        >
          <span className="text-lg">🏋️‍♂️</span>
          <span>INICIAR ENTRENAMIENTO</span>
        </button>
      </div>

      {/* INTERACTIVE WORKOUT MODAL / FLOATING DRAWER */}
      {isTrainingOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-end justify-center p-0 sm:p-4">
          <div className="bg-slate-900 border-t sm:border border-slate-800 w-full max-w-md rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900 sticky top-0 z-10">
              <div>
                <input
                  type="text"
                  value={sessionName}
                  onChange={(e) => setSessionName(e.target.value)}
                  className="bg-slate-800 border-none text-slate-100 font-bold text-base px-2 py-1 rounded focus:ring-1 focus:ring-emerald-500 w-full"
                />
                <p className="text-[11px] text-slate-400 mt-1">Registra series en tiempo real para subir tu nivel muscular.</p>
              </div>
              <button
                onClick={() => setIsTrainingOpen(false)}
                className="text-slate-400 hover:text-slate-200 text-xl font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 space-y-5 flex-1">

              {/* Form to log a new set */}
              <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950 space-y-3.5">
                <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase block">Agregar Serie</span>

                {/* Select Exercise */}
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400">Ejercicio</label>
                  <select
                    value={selectedExerciseId}
                    onChange={(e) => setSelectedExerciseId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:ring-1 focus:ring-emerald-500"
                  >
                    {INITIAL_EXERCISES.map((ex) => (
                      <option key={ex.id} value={ex.id}>
                        [{ex.primaryMuscleGroup}] - {ex.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Metrics Form Grid */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400">Peso (kg)</label>
                    <input
                      type="number"
                      value={inputWeight}
                      onChange={(e) => setInputWeight(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-center text-xs text-slate-200"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400">Reps</label>
                    <input
                      type="number"
                      value={inputReps}
                      onChange={(e) => setInputReps(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-center text-xs text-slate-200"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400">RPE (1-10)</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={inputRpe}
                      onChange={(e) => setInputRpe(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-center text-xs text-slate-200"
                    />
                  </div>
                </div>

                <button
                  onClick={handleAddSet}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/20 py-2.5 rounded-lg text-xs font-bold transition-all"
                >
                  + Agregar Serie al Listado
                </button>
              </div>

              {/* Added sets list */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">Series en Sesión Actual ({activeSets.length})</span>
                  {activeSets.length > 0 && (
                    <button onClick={() => setActiveSets([])} className="text-[10px] text-red-400 hover:underline">
                      Limpiar todo
                    </button>
                  )}
                </div>

                {activeSets.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-4 border border-dashed border-slate-800 rounded-xl">
                    No has agregado ninguna serie todavía.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-[25vh] overflow-y-auto pr-1">
                    {activeSets.map((set, idx) => {
                      const exercise = INITIAL_EXERCISES.find((e) => e.id === set.exerciseId);
                      return (
                        <div
                          key={set.id}
                          className="flex justify-between items-center p-2.5 rounded-lg border border-slate-800 bg-slate-950/40 text-xs"
                        >
                          <div>
                            <span className="font-semibold text-slate-300">#{idx + 1} - </span>
                            <span className="text-slate-100 font-medium">{exercise?.name}</span>
                            <div className="text-[10px] text-slate-500 mt-0.5">
                              {exercise?.primaryMuscleGroup}
                            </div>
                          </div>
                          <div className="flex items-center space-x-3.5">
                            <span className="font-mono text-slate-300">
                              {set.weight}kg x {set.reps} (RPE {set.rpe})
                            </span>
                            <button
                              onClick={() => handleRemoveSet(idx)}
                              className="text-red-400 hover:text-red-300 p-1"
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
            <div className="p-4 border-t border-slate-800 bg-slate-900 sticky bottom-0 z-10 flex gap-3">
              <button
                onClick={() => setIsTrainingOpen(false)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-xl text-xs font-bold"
              >
                Cancelar
              </button>
              <button
                onClick={handleCompleteSession}
                className="flex-[2] bg-emerald-500 hover:bg-emerald-600 text-slate-950 py-3 rounded-xl text-xs font-extrabold tracking-wide"
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
