export interface MoveEvaluation {
  fromIdx: number | string;
  toIdx: number;
  score: number;
  reasoning: string[];
}

export interface AIDecision {
  selectedMove: {
    fromIdx: number | string;
    toIdx: number;
  };
  allMoves: MoveEvaluation[];
}

export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export interface WeightFactors {
  safety: number;
  offense: number;
  progress: number;
  blockade: number;
  homeBoard: number;
} 