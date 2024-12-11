import { useState } from "react";
import { toast } from "react-hot-toast";
import "./App.css";
import { backgammon, startingGame } from "./logic/events/start-game";
import { rollingDice } from "./logic/events/roll-dice";
import { selecting } from "./logic/events/select";
import BoardBottom from "./frontend/BoardBottom";
import ThisTurn from "./logic/models/this-turn";
import Game from "./logic/models/game";
import ThisMove from "./logic/models/this-move";
import BoardTop from "./frontend/BoardTop";
import { checkCantMove } from "./logic/calculations/calc-possible-moves";
import { BackgammonAI } from './logic/ai/backgammon-ai';
import AICommentary from "./frontend/components/AICommentary";
import GameModeSelector from './frontend/components/GameModeSelector';
import GameTitle from './frontend/components/GameTitle';

export const toastStyle = (thisTurn: ThisTurn) => {
  return {
    style: {
      borderRadius: "10px",
      background: thisTurn.turnPlayer.name,
      color: thisTurn.opponentPlayer.name,
      border:
        thisTurn.turnPlayer.name === "White"
          ? "2px solid black"
          : "2px solid white",
    },
  };
};

function App() {
  const [game, setGame] = useState(Game.new);
  const [thisTurn, setThisTurn] = useState(ThisTurn.new);
  const [thisMove, setThisMove] = useState(ThisMove.new);
  const [ai] = useState(new BackgammonAI('medium'));
  const [gameMode, setGameMode] = useState<'multiplayer' | 'ai'>('multiplayer');
  const [showModeSelect, setShowModeSelect] = useState(true);

  window.onload = () => backgammon();

  function handleStartGame(mode: 'multiplayer' | 'ai') {
    setGameMode(mode);
    const tempGame = Game.new();
    tempGame.gameOn = true;
    setGame(tempGame);

    const tempThisTurn = startingGame(game.clone());
    setThisTurn(tempThisTurn);

    const tempThisMove = ThisMove.new();
    setThisMove(tempThisMove);
  }

  function startGame() {
    const tempGame = Game.new();
    tempGame.gameOn = true;
    setGame(tempGame);

    const tempThisTurn = startingGame(game.clone());
    setThisTurn(tempThisTurn);

    const tempThisMove = ThisMove.new();
    setThisMove(tempThisMove);
  }

  function handleModeChange(mode: 'multiplayer' | 'ai') {
    if (game.gameOn) return;
    setGameMode(mode);
  }

  function handleModeSelect() {
    setShowModeSelect(false);
  }

  function rollDice() {
    if (thisTurn.rolledDice) {
      toast.error(
        `Play your move first
          ${thisTurn.turnPlayer.icon} 🎲 ${thisTurn.dices} 🎲`,
        toastStyle(thisTurn)
      );
      return;
    }

    var returnedThisTurn = rollingDice(thisTurn.clone());

    if (returnedThisTurn.rolledDice)
      returnedThisTurn = checkCantMove(game, returnedThisTurn.clone());

    setThisTurn(returnedThisTurn);
  }

  function select(index: number | string) {
    const [returnedGame, returnedThisTurn, returnedThisMove] = selecting(
      index,
      game.clone(),
      thisTurn.clone(),
      thisMove.clone()
    );

    setGame(returnedGame);
    setThisTurn(returnedThisTurn);
    setThisMove(returnedThisMove);

    if (returnedThisTurn.turnPlayer.name === 'Black' && gameMode === 'ai' && !returnedThisTurn.rolledDice) {
      setTimeout(handleAITurn, 1000);
    }
  }

  function handleAITurn() {
    var aiTurn = rollingDice(thisTurn.clone());
    
    toast.success(
      `AI rolls: 🎲 ${aiTurn.dices} 🎲`,
      {
        ...toastStyle(aiTurn),
        duration: 2000,
      }
    );

    if (aiTurn.rolledDice) {
      aiTurn = checkCantMove(game, aiTurn.clone());
    }
    
    setThisTurn(aiTurn);

    setTimeout(() => makeAIMove(), 1000);
  }

  function makeAIMove() {
    if (!game.gameOn || !thisTurn.rolledDice || gameMode !== 'ai') return;
    
    try {
      const aiDecision = ai.decideBestMove(game, thisTurn);
      
      toast.success(
        `AI moves from ${aiDecision.selectedMove.fromIdx} to ${aiDecision.selectedMove.toIdx}`,
        {
          ...toastStyle(thisTurn),
          duration: 2000,
        }
      );

      select(aiDecision.selectedMove.fromIdx);
      setTimeout(() => {
        select(aiDecision.selectedMove.toIdx);
      }, 500);
    } catch (error) {
      console.error('AI move error:', error);
    }
  }

 return (
   <>
     <GameTitle />
     <GameModeSelector
       mode={gameMode}
       onModeChange={handleModeChange}
       onModeSelect={handleModeSelect}
       gameStarted={game.gameOn}
       showModeSelect={showModeSelect}
     />
     {!showModeSelect && (
       <>
         <div className={game.gameOn ? '' : 'preview-mode'}>
           <BoardTop
             game={game}
             thisMove={thisMove}
             select={select}
           />
           <BoardBottom
             game={game}
             thisMove={thisMove}
             rollDice={rollDice}
             startGame={startGame}
             select={select}
           />
           <AICommentary game={game} thisTurn={thisTurn} />
         </div>
         {!game.gameOn && (
           <div className='start-overlay'>
             <button
               onClick={() => handleStartGame(gameMode)}
               className='start-button'
             >
               Begin Game
             </button>
           </div>
         )}
       </>
     )}
   </>
 );
}

export default App;
