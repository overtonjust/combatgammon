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

    // Handle pieces in the outBar first
    if (thisTurn.turnPlayer.outBar.length > 0) {
      const outMoves = calcGettingOutOfOutMoves(game, thisTurn);
      outMoves.forEach(toIdx => {
        moves.push({ fromIdx: thisTurn.turnPlayer.outBarIdx, toIdx });
      });
      return moves;
    }

    // Handle regular moves
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

      // Safety evaluation
      const safetyScore = this.evaluateSafety(game, thisTurn, move);
      score += safetyScore * weights.safety;
      reasoning.push(`Safety: ${safetyScore.toFixed(2)}`);

      // Offense evaluation
      const offenseScore = this.evaluateOffense(game, thisTurn, move);
      score += offenseScore * weights.offense;
      reasoning.push(`Offense: ${offenseScore.toFixed(2)}`);

      // Progress evaluation
      const progressScore = this.evaluateProgress(game, thisTurn, move);
      score += progressScore * weights.progress;
      reasoning.push(`Progress: ${progressScore.toFixed(2)}`);

      return {
        ...move,
        score,
        reasoning
      };
    });
  }

  private evaluateSafety(game: Game, thisTurn: ThisTurn, move: { fromIdx: number | string, toIdx: number }): number {
    let score = 0;
    
    // Check if move creates or maintains a block
    if (typeof move.fromIdx === 'number' && game.board[move.fromIdx].length > 1) {
      score += 0.5;
    }
    
    // Check if destination creates a block
    if (game.board[move.toIdx].length > 0 && 
        game.board[move.toIdx][0] === thisTurn.turnPlayer.name) {
      score += 1;
    }
    
    // Penalize leaving single pieces exposed
    if (typeof move.fromIdx === 'number' && 
        game.board[move.fromIdx].length === 2 &&
        game.board[move.toIdx].length === 0) {
      score -= 0.5;
    }

    return score;
  }

  private evaluateOffense(game: Game, thisTurn: ThisTurn, move: { fromIdx: number | string, toIdx: number }): number {
    let score = 0;
    
    // Reward hitting opponent's blots
    if (game.board[move.toIdx].length === 1 && 
        game.board[move.toIdx][0] === thisTurn.opponentPlayer.name) {
      score += 1;
    }
    
    // Reward blocking opponent's return path
    if (this.isStrategicBlock(game, thisTurn, move.toIdx)) {
      score += 0.8;
    }

    return score;
  }

  private evaluateProgress(game: Game, thisTurn: ThisTurn, move: { fromIdx: number | string, toIdx: number }): number {
    let score = 0;
    
    // Reward moving pieces towards home
    const direction = thisTurn.turnPlayer.name === 'White' ? 1 : -1;
    if (typeof move.fromIdx === 'number') {
      const progress = (move.toIdx - move.fromIdx) * direction;
      score += progress * 0.1;
    }
    
    // Extra reward for getting pieces to home board
    if (this.isInHomeBoard(thisTurn, move.toIdx)) {
      score += 0.5;
    }

    return score;
  }

  private isStrategicBlock(game: Game, thisTurn: ThisTurn, position: number): boolean {
    // Define strategic positions based on player
    const strategicPositions = thisTurn.turnPlayer.name === 'White' 
      ? [18, 19, 20, 21] // Example positions for White
      : [3, 4, 5, 6];    // Example positions for Black
    
    return strategicPositions.includes(position);
  }

  private isInHomeBoard(thisTurn: ThisTurn, position: number): boolean {
    return thisTurn.turnPlayer.name === 'White'
      ? position >= 18 && position <= 23
      : position >= 0 && position <= 5;
  }

  private selectBestMove(evaluatedMoves: MoveEvaluation[]): { fromIdx: number | string, toIdx: number } {
    if (evaluatedMoves.length === 0) {
      throw new Error('No moves available');
    }

    const bestMove = evaluatedMoves.reduce((best, current) => 
      current.score > best.score ? current : best
    );

    return {
      fromIdx: bestMove.fromIdx,
      toIdx: bestMove.toIdx
    };
  }

  setDifficulty(difficulty: DifficultyLevel) {
    this.difficulty = difficulty;
  }
} 