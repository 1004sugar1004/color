
export interface MunsellColor {
  code: string;
  name: string;
  hex: string;
}

export interface SavedColor {
  id: string;
  customName: string;
  color: MunsellColor;
}

export type RelationType = 'SIMILAR' | 'OPPOSITE';

export type MixQuizQuestion = {
  type: 'MIX';
  targetColor: MunsellColor;
  options: [MunsellColor, MunsellColor][];
  correctAnswer: [MunsellColor, MunsellColor];
};

export type RelationQuizQuestion = {
  type: 'RELATION';
  relationType: RelationType;
  targetColor: MunsellColor;
  options: MunsellColor[];
  correctAnswers: MunsellColor[];
};

export type QuizQuestion = MixQuizQuestion | RelationQuizQuestion;
