import { WorkoutSet, MuscleProgress } from '../types/gym';

/**
 * Calculates XP gained from a single workout set.
 * If weight or reps are zero/negative, no XP is gained.
 * Formula: Tonnage * RPE factor * priority multiplier
 */
export function calculateSetXp(set: WorkoutSet, isPrimary: boolean): number {
  if (set.weight <= 0 || set.reps <= 0) {
    return 0;
  }

  const tonnage = set.weight * set.reps;
  // If RPE is not specified or 0, default to a standard 0.8 factor (8 out of 10 effort)
  const rpeFactor = set.rpe ? Math.min(10, Math.max(1, set.rpe)) / 10 : 0.8;
  const multiplier = isPrimary ? 1.0 : 0.4;

  const xp = tonnage * rpeFactor * multiplier;
  return Math.round(xp);
}

/**
 * Returns the XP required to level up to the next level.
 * Formula: level * 500 XP
 */
export function getXpRequiredForNextLevel(level: number): number {
  return Math.max(500, level * 500);
}

/**
 * Updates rank name based on the level.
 */
export function getRankNameForLevel(level: number): string {
  if (level >= 21) return 'Rango Hércules (Divino)';
  if (level >= 16) return 'Rango Élite (Legendario)';
  if (level >= 11) return 'Rango Avanzado (Maestro)';
  if (level >= 6) return 'Rango Intermedio (Guerrero)';
  return 'Rango Principiante (Iniciado)';
}

/**
 * Adds XP to a muscle group progression, handles leveling up progressively.
 */
export function addXpToMuscle(progress: MuscleProgress, gainedXp: number): MuscleProgress {
  if (gainedXp <= 0) return progress;

  let currentXp = progress.currentXp + gainedXp;
  let level = progress.level;
  let xpToNextLevel = getXpRequiredForNextLevel(level);

  while (currentXp >= xpToNextLevel) {
    currentXp -= xpToNextLevel;
    level += 1;
    xpToNextLevel = getXpRequiredForNextLevel(level);
  }

  return {
    ...progress,
    level,
    currentXp,
    xpToNextLevel,
    rankName: getRankNameForLevel(level),
  };
}
