import { User, Exercise, MuscleProgress, WorkoutSession } from '../types/gym';

export const INITIAL_USER: User = {
  id: 'u-1',
  name: 'Alejandro',
  level: 4,
  totalXp: 3450,
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
  rankName: 'Atleta de Hierro',
};

export const INITIAL_EXERCISES: Exercise[] = [
  // Pecho
  {
    id: 'ex-1',
    name: 'Press de Banca Plano',
    primaryMuscleGroup: 'Chest',
    secondaryMuscleGroups: ['Shoulders', 'Arms'],
    description: 'Press clásico con barra en banco plano para pectoral mayor.',
  },
  {
    id: 'ex-2',
    name: 'Aperturas con Mancuernas',
    primaryMuscleGroup: 'Chest',
    secondaryMuscleGroups: ['Arms'],
    description: 'Aperturas para enfocar el estiramiento pectoral.',
  },
  // Espalda
  {
    id: 'ex-3',
    name: 'Dominadas',
    primaryMuscleGroup: 'Back',
    secondaryMuscleGroups: ['Arms', 'Core'],
    description: 'Dominadas con agarre prono para amplitud dorsal.',
  },
  {
    id: 'ex-4',
    name: 'Remo con Barra',
    primaryMuscleGroup: 'Back',
    secondaryMuscleGroups: ['Arms', 'Core'],
    description: 'Remo inclinado con barra para grosor de espalda.',
  },
  // Piernas
  {
    id: 'ex-5',
    name: 'Sentadillas Traseras',
    primaryMuscleGroup: 'Legs',
    secondaryMuscleGroups: ['Core'],
    description: 'Sentadilla clásica profunda para cuádriceps y glúteos.',
  },
  {
    id: 'ex-6',
    name: 'Peso Muerto Rumano',
    primaryMuscleGroup: 'Legs',
    secondaryMuscleGroups: ['Back', 'Core'],
    description: 'Enfoque en femorales y glúteos.',
  },
  // Hombros
  {
    id: 'ex-7',
    name: 'Press Militar',
    primaryMuscleGroup: 'Shoulders',
    secondaryMuscleGroups: ['Arms', 'Core'],
    description: 'Press vertical de pie para hombros fuertes.',
  },
  {
    id: 'ex-8',
    name: 'Elevaciones Laterales',
    primaryMuscleGroup: 'Shoulders',
    description: 'Aislamiento de la cabeza lateral del deltoides.',
  },
  // Brazos
  {
    id: 'ex-9',
    name: 'Curl de Bíceps con Barra',
    primaryMuscleGroup: 'Arms',
    description: 'Curl clásico para el desarrollo de bíceps.',
  },
  {
    id: 'ex-10',
    name: 'Extensión de Tríceps en Polea Alta',
    primaryMuscleGroup: 'Arms',
    description: 'Aislamiento de tríceps para definir el brazo.',
  },
  // Core
  {
    id: 'ex-11',
    name: 'Plancha Abdominal',
    primaryMuscleGroup: 'Core',
    description: 'Isométrico para fortalecimiento de la sección media.',
  },
  {
    id: 'ex-12',
    name: 'Elevaciones de Pierna Colgado',
    primaryMuscleGroup: 'Core',
    secondaryMuscleGroups: ['Arms'],
    description: 'Fortalecimiento de abdomen inferior.',
  },
];

export const INITIAL_MUSCLE_PROGRESS: MuscleProgress[] = [
  {
    muscleGroup: 'Chest',
    level: 3,
    currentXp: 450,
    xpToNextLevel: 1000,
    rankName: 'Pectoral de Acero',
  },
  {
    muscleGroup: 'Back',
    level: 2,
    currentXp: 800,
    xpToNextLevel: 1000,
    rankName: 'Espalda de Cobre',
  },
  {
    muscleGroup: 'Legs',
    level: 4,
    currentXp: 200,
    xpToNextLevel: 1000,
    rankName: 'Piernas de Titanio',
  },
  {
    muscleGroup: 'Shoulders',
    level: 2,
    currentXp: 150,
    xpToNextLevel: 1000,
    rankName: 'Hombros de Piedra',
  },
  {
    muscleGroup: 'Arms',
    level: 3,
    currentXp: 750,
    xpToNextLevel: 1000,
    rankName: 'Brazos de Bronce',
  },
  {
    muscleGroup: 'Core',
    level: 1,
    currentXp: 900,
    xpToNextLevel: 1000,
    rankName: 'Core de Arcilla',
  },
];

export const HISTORICAL_SESSIONS: WorkoutSession[] = [
  {
    id: 's-1',
    userId: 'u-1',
    name: 'Entrenamiento de Pecho & Tríceps',
    date: '2025-05-15',
    xpGained: 400,
    sets: [
      {
        id: 'set-1',
        exerciseId: 'ex-1',
        weight: 60,
        reps: 10,
        rpe: 8,
        timestamp: '2025-05-15T18:30:00Z',
      },
      {
        id: 'set-2',
        exerciseId: 'ex-1',
        weight: 60,
        reps: 10,
        rpe: 8.5,
        timestamp: '2025-05-15T18:33:00Z',
      },
      {
        id: 'set-3',
        exerciseId: 'ex-1',
        weight: 65,
        reps: 8,
        rpe: 9,
        timestamp: '2025-05-15T18:36:00Z',
      },
      {
        id: 'set-4',
        exerciseId: 'ex-10',
        weight: 25,
        reps: 12,
        rpe: 8,
        timestamp: '2025-05-15T18:45:00Z',
      },
      {
        id: 'set-5',
        exerciseId: 'ex-10',
        weight: 25,
        reps: 12,
        rpe: 8,
        timestamp: '2025-05-15T18:48:00Z',
      },
    ],
  },
];
