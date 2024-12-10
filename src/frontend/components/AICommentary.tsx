import React from 'react';
import styles from './AICommentary.module.css';
import ThisTurn from '../../logic/models/this-turn';
import Game from '../../logic/models/game';
import { BackgammonAI } from '../../logic/ai/backgammon-ai';

type Props = {
  game: Game;
  thisTurn: ThisTurn;
};

export default function AICommentary({ game, thisTurn }: Props) {
  const ai = new BackgammonAI('medium');

  function getSuggestion(): string {
    if (!game.gameOn) return "Start the game to get move suggestions!";
    if (!thisTurn.rolledDice) return "Roll the dice first!";

    try {
      const aiDecision = ai.decideBestMove(game, thisTurn);
      const bestMove = aiDecision.selectedMove;
      const reasoning = aiDecision.allMoves.find(
        move => move.fromIdx === bestMove.fromIdx && move.toIdx === bestMove.toIdx
      )?.reasoning;

      if (thisTurn.turnPlayer.outBar.length > 0) {
        return "Priority: Get your pieces out of the bar first!";
      }

      if (bestMove) {
        return `Suggested move: ${bestMove.fromIdx} → ${bestMove.toIdx}\n${reasoning?.join(', ')}`;
      }
    } catch (error) {
      console.error('AI suggestion error:', error);
    }

    return "Look for opportunities to make points or block opponent's movement";
  }

  return (
    <div className={styles.commentary}>
      <h3>AI Suggestion</h3>
      <p>{getSuggestion()}</p>
    </div>
  );
}