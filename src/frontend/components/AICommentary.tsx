import React from 'react';
import styles from './AICommentary.module.css';
import ThisTurn from '../../logic/models/this-turn';
import Game from '../../logic/models/game';

type Props = {
  game: Game;
  thisTurn: ThisTurn;
};

export default function AICommentary({ game, thisTurn }: Props) {
  function getSuggestion(): string {
    if (!game.gameOn) return "Start the game to get move suggestions!";
    if (!thisTurn.rolledDice) return "Roll the dice first!";

    // Basic strategy suggestions
    if (thisTurn.turnPlayer.outBar.length > 0) {
      return "Priority: Get your pieces out of the bar first!";
    }

    // Check if player can bear off
    const canBearOff = thisTurn.turnPlayer.inTheEnd;
    if (canBearOff) {
      return "You can bear off pieces - focus on moving highest pieces first!";
    }

    // Basic positional strategy
    const isBlocked = checkBlockedPositions(game, thisTurn);
    if (isBlocked) {
      return "Warning: You have exposed pieces. Consider defensive moves!";
    }

    return "Look for opportunities to make points or block opponent's movement";
  }

  function checkBlockedPositions(game: Game, thisTurn: ThisTurn): boolean {
    // Simple check for exposed pieces
    for (let i = 0; i < game.board.length; i++) {
      const bar = game.board[i];
      if (bar.length === 1 && bar[0] === thisTurn.turnPlayer.name) {
        return true;
      }
    }
    return false;
  }

  return (
    <div className={styles.commentary}>
      <h3>AI Suggestion</h3>
      <p>{getSuggestion()}</p>
    </div>
  );
} 