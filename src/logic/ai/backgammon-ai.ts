<<<<<<< Updated upstream
import Game from '../models/game';
import ThisTurn from '../models/this-turn';
import { calcPossibleMoves, calcGettingOutOfOutMoves } from '../calculations/calc-possible-moves';
import { AIDecision, MoveEvaluation, DifficultyLevel, WeightFactors } from './types';

export class BackgammonAI {
  private difficultyWeights: Record<DifficultyLevel, WeightFactors> = {
    easy: {
      safety: 0.8,
      offense: 0.2,
      progress: 0.4,
      blockade: 0.3,
      homeBoard: 0.5
    },
    medium: {
      safety: 0.6,
      offense: 0.6,
      progress: 0.6,
      blockade: 0.6,
      homeBoard: 0.6
    },
    hard: {
      safety: 0.4,
      offense: 0.8,
      progress: 0.7,
      blockade: 0.8,
      homeBoard: 0.7
    }
  };

  constructor(private difficulty: DifficultyLevel = 'medium') {}

  decideBestMove(game: Game, thisTurn: ThisTurn): AIDecision {
    const possibleMoves = this.getAllPossibleMoves(game, thisTurn);
    const evaluatedMoves = this.evaluateAllMoves(game, thisTurn, possibleMoves);
    const selectedMove = this.selectBestMove(evaluatedMoves);

    return {
      selectedMove,
      allMoves: evaluatedMoves
    };
  }

  private getAllPossibleMoves(game: Game, thisTurn: ThisTurn): { fromIdx: number | string, toIdx: number }[] {
    const moves: { fromIdx: number | string, toIdx: number }[] = [];

    if (thisTurn.turnPlayer.outBar.length > 0) {
      const outMoves = calcGettingOutOfOutMoves(game, thisTurn);
      outMoves.forEach(toIdx => {
        moves.push({ fromIdx: thisTurn.turnPlayer.outBarIdx, toIdx });
      });
      return moves;
    }

    game.board.forEach((bar, fromIdx) => {
      if (bar.includes(thisTurn.turnPlayer.name)) {
        const possibleToIdxs = calcPossibleMoves(game, fromIdx, thisTurn);
        possibleToIdxs.forEach(toIdx => {
          moves.push({ fromIdx, toIdx });
        });
      }
    });

    return moves;
  }

  private evaluateAllMoves(
    game: Game, 
    thisTurn: ThisTurn, 
    moves: { fromIdx: number | string, toIdx: number }[]
  ): MoveEvaluation[] {
    const weights = this.difficultyWeights[this.difficulty];
    
    return moves.map(move => {
      const reasoning: string[] = [];
      let score = 0;

      const safetyScore = this.evaluateSafety(game, thisTurn, move);
      score += safetyScore * weights.safety;
      reasoning.push(`Safety: ${safetyScore.toFixed(2)}`);

      const offenseScore = this.evaluateOffense(game, thisTurn, move);
      score += offenseScore * weights.offense;
      reasoning.push(`Offense: ${offenseScore.toFixed(2)}`);

      return {
        ...move,
        score,
        reasoning
      };
    });
  }

  private evaluateSafety(game: Game, thisTurn: ThisTurn, move: { fromIdx: number | string, toIdx: number }): number {
    let score = 0;
    if (typeof move.fromIdx === 'number' && game.board[move.fromIdx].length > 1) score += 0.5;
    if (game.board[move.toIdx].length > 0 && game.board[move.toIdx][0] === thisTurn.turnPlayer.name) score += 1;
    return score;
  }

  private evaluateOffense(game: Game, thisTurn: ThisTurn, move: { fromIdx: number | string, toIdx: number }): number {
    let score = 0;
    if (game.board[move.toIdx].length === 1 && game.board[move.toIdx][0] === thisTurn.opponentPlayer.name) score += 1;
    return score;
  }

  private selectBestMove(evaluatedMoves: MoveEvaluation[]): { fromIdx: number | string, toIdx: number } {
    if (evaluatedMoves.length === 0) throw new Error('No moves available');
    return evaluatedMoves.reduce((best, current) => current.score > best.score ? current : best);
  }

  setDifficulty(difficulty: DifficultyLevel) {
    this.difficulty = difficulty;
  }
}
=======
>>>>>>> Stashed changes
