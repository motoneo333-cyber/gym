'use client';

import React, { useState } from 'react';
import { MuscleGroup, MuscleProgress } from '../types/gym';

interface RanksGalleryProps {
  muscleProgresses: MuscleProgress[];
}

interface RankTier {
  id: string;
  name: string;
  levelRange: string;
  minLevel: number;
  description: string;
  colorHex: string;
  bgTailwind: string;
  borderTailwind: string;
  glowingClass: string;
  badgeSymbol: string;
}

const RANK_TIERS: RankTier[] = [
  {
    id: 't-1',
    name: 'Rango Principiante (Novato)',
    levelRange: 'Nivel 1 - 5',
    minLevel: 1,
    description: 'Tus músculos están hechos de arcilla y bronce. Estás sentando las bases del poder.',
    colorHex: '#64748b',
    bgTailwind: 'from-slate-800 to-slate-950 text-slate-300',
    borderTailwind: 'border-slate-700/60',
    glowingClass: 'shadow-slate-500/10',
    badgeSymbol: '🪨',
  },
  {
    id: 't-2',
    name: 'Rango Intermedio (Guerrero de Hierro)',
    levelRange: 'Nivel 6 - 10',
    minLevel: 6,
    description: 'La consistencia ha templado tus fibras. Tu estructura es dura como el acero.',
    colorHex: '#10b981',
    bgTailwind: 'from-emerald-900/40 via-slate-900 to-slate-950 text-emerald-400',
    borderTailwind: 'border-emerald-500/30',
    glowingClass: 'shadow-emerald-500/20',
    badgeSymbol: '⚔️',
  },
  {
    id: 't-3',
    name: 'Rango Avanzado (Maestro de Oro)',
    levelRange: 'Nivel 11 - 15',
    minLevel: 11,
    description: 'Levantamientos colosales han esculpido un físico dorado. Destacas en cada sala.',
    colorHex: '#fbbf24',
    bgTailwind: 'from-amber-900/40 via-slate-900 to-slate-950 text-amber-400',
    borderTailwind: 'border-amber-500/30',
    glowingClass: 'shadow-amber-500/20',
    badgeSymbol: '👑',
  },
  {
    id: 't-4',
    name: 'Rango Élite (Leyenda de Platino)',
    levelRange: 'Nivel 16 - 20',
    minLevel: 16,
    description: 'Nivel de sobrecarga sobrehumana. Tu fuerza roza el límite genético natural.',
    colorHex: '#d946ef',
    bgTailwind: 'from-fuchsia-900/40 via-slate-900 to-slate-950 text-fuchsia-400',
    borderTailwind: 'border-fuchsia-500/30',
    glowingClass: 'shadow-fuchsia-500/20',
    badgeSymbol: '⚡',
  },
  {
    id: 't-5',
    name: 'Rango Hércules (Divino)',
    levelRange: 'Nivel 21+',
    minLevel: 21,
    description: 'Inmortalidad física. Has desbloqueado el máximo nivel de maestría anatómica.',
    colorHex: '#a855f7',
    bgTailwind: 'from-purple-900/40 via-slate-900 to-slate-950 text-purple-400',
    borderTailwind: 'border-purple-500/30',
    glowingClass: 'shadow-purple-500/25',
    badgeSymbol: '🌟',
  },
];

export default function RanksGallery({ muscleProgresses }: RanksGalleryProps) {
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup>('Chest');

  // Find user progress for selected muscle
  const userProgress = muscleProgresses.find(p => p.muscleGroup === selectedMuscle);

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border-2 border-slate-800 p-5 rounded-3xl shadow-clay-lg space-y-6">

      {/* Header with Title */}
      <div className="border-b border-slate-800 pb-4">
        <h3 className="text-base font-black text-slate-100 tracking-wide">Matriz de Rangos Alcanzables</h3>
        <p className="text-xs text-slate-400 font-bold mt-1">Explora la línea de tiempo RPG y requisitos de maestría por músculo.</p>
      </div>

      {/* Muscle selector pill list */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {(['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core'] as MuscleGroup[]).map((muscle) => {
          const isSelected = selectedMuscle === muscle;
          return (
            <button
              key={muscle}
              onClick={() => setSelectedMuscle(muscle)}
              className={`px-3.5 py-1.5 rounded-xl text-[10px] font-black tracking-wide whitespace-nowrap cursor-pointer transition-all duration-150 ${
                isSelected
                  ? 'bg-gradient-to-b from-slate-800 to-slate-900 text-emerald-400 border border-slate-700 shadow-clay-sm'
                  : 'bg-slate-950/60 text-slate-500 hover:text-slate-300 border border-transparent'
              }`}
            >
              {muscle === 'Chest' ? 'Pecho' :
               muscle === 'Back' ? 'Espalda' :
               muscle === 'Legs' ? 'Piernas' :
               muscle === 'Shoulders' ? 'Hombros' :
               muscle === 'Arms' ? 'Brazos' : 'Core'}
            </button>
          );
        })}
      </div>

      {/* Active Muscle progression state card */}
      {userProgress && (
        <div className="bg-slate-950/60 border-2 border-slate-900 p-4.5 rounded-2.5xl shadow-sunken flex items-center justify-between">
          <div>
            <span className="text-[9px] text-slate-500 font-black uppercase tracking-wider block">Tu Estado de Rango</span>
            <span className="text-sm font-black text-slate-200 mt-1 block">
              {userProgress.rankName}
            </span>
            <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
              Nivel actual: <strong className="text-emerald-400 font-extrabold">{userProgress.level}</strong>
            </p>
          </div>

          {/* Animated level indicator */}
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 flex flex-col items-center justify-center border border-slate-800 shadow-clay-sm">
            <span className="text-[8px] text-slate-500 uppercase font-black tracking-wide">LV</span>
            <span className="text-sm font-black text-emerald-400 font-mono mt-0.5">{userProgress.level}</span>
          </div>
        </div>
      )}

      {/* Ranks Roadmap Timeline (Scrollable List) */}
      <div className="space-y-4">
        <span className="text-[10px] text-slate-500 font-black uppercase tracking-wider px-1">Línea de Tiempo RPG de Fuerza</span>

        <div className="space-y-4">
          {RANK_TIERS.map((tier) => {
            const isUnlocked = userProgress ? userProgress.level >= tier.minLevel : false;
            const isCurrent = userProgress
              ? userProgress.level >= tier.minLevel &&
                (RANK_TIERS[RANK_TIERS.indexOf(tier) + 1] ? userProgress.level < RANK_TIERS[RANK_TIERS.indexOf(tier) + 1].minLevel : true)
              : false;

            return (
              <div
                key={tier.id}
                className={`bg-gradient-to-br ${tier.bgTailwind} p-4.5 rounded-2.5xl border-2 ${tier.borderTailwind} ${tier.glowingClass} shadow-clay-sm relative transition-all duration-200 ${
                  isCurrent ? 'ring-2 ring-emerald-500/40 shadow-clay-md' : 'opacity-85'
                }`}
              >
                {/* Visual Lock/Unlock indicator */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-center text-xl shadow-sunken">
                      {tier.badgeSymbol}
                    </div>
                    <div>
                      <h4 className="font-black text-xs text-slate-200 tracking-wide uppercase">{tier.name}</h4>
                      <span className="text-[10px] text-slate-400 font-bold">{tier.levelRange}</span>
                    </div>
                  </div>

                  {/* Unlock Status badges */}
                  <div>
                    {isCurrent ? (
                      <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-black px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                        ACTUAL
                      </span>
                    ) : isUnlocked ? (
                      <span className="bg-slate-950/80 text-slate-400 border border-slate-800 text-[9px] font-black px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                        DESBLOQUEADO
                      </span>
                    ) : (
                      <span className="bg-red-950/40 text-red-400 border border-red-500/10 text-[9px] font-black px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                        BLOQUEADO
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-400/90 leading-relaxed font-semibold mt-1">
                  {tier.description}
                </p>

                {/* Progress helper for locked next tier */}
                {!isUnlocked && userProgress && (
                  <div className="mt-3.5 pt-3 border-t border-slate-900/60 text-[10px] text-slate-500 font-bold flex justify-between">
                    <span>Nivel necesario: LV {tier.minLevel}</span>
                    <span className="text-slate-600">Faltan {tier.minLevel - userProgress.level} Niveles</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
