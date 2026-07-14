export type MuscleGroup =
  | 'Chest'
  | 'Back'
  | 'Legs'
  | 'Shoulders'
  | 'Arms'
  | 'Core';

export interface User {
  id: string;
  name: string;
  level: number;
  totalXp: number;
  avatarUrl?: string;
  rankName: string; // e.g. "Novice", "Iron Lifter", "Titan"
}

export interface Exercise {
  id: string;
  name: string;
  primaryMuscleGroup: MuscleGroup;
  secondaryMuscleGroups?: MuscleGroup[];
  description?: string;
}

export interface WorkoutSet {
  id: string;
  exerciseId: string;
  weight: number; // in kg or lbs (e.g., 60)
  reps: number;
  rpe?: number; // Rate of Perceived Exertion (1 to 10)
  timestamp: string; // ISO string or simple date
}

export interface WorkoutSession {
  id: string;
  userId: string;
  name: string; // e.g., "Routines A: Push day"
  date: string; // e.g., "2025-05-18"
  sets: WorkoutSet[];
  xpGained?: number;
}

export interface MuscleProgress {
  muscleGroup: MuscleGroup;
  level: number;
  currentXp: number;
  xpToNextLevel: number;
  rankName: string; // e.g., "Iron Chest", "Steel Back"
}
