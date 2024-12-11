import React from 'react';
import styles from './GameModeSelector.module.scss';

interface GameModeSelectorProps {
  mode: 'multiplayer' | 'ai';
  onModeChange: (mode: 'multiplayer' | 'ai') => void;
  onModeSelect: () => void;
  gameStarted: boolean;
  showModeSelect: boolean;
}

export default function GameModeSelector({ 
  mode, 
  onModeChange, 
  onModeSelect,
  gameStarted,
  showModeSelect 
}: GameModeSelectorProps) {
  if (!showModeSelect && !gameStarted) return null;
  
  return (
  <>
    {!gameStarted && 

      <div className={`${styles.container} ${showModeSelect ? styles.fullscreen : ''}`}>
        <div className={styles.selector}>
          <h2>{showModeSelect ? 'Select Game Mode' : 'Game Mode:'}</h2>
          <select 
            value={mode}
            onChange={(e) => onModeChange(e.target.value as 'multiplayer' | 'ai')}
            className={styles.dropdown}
            disabled={gameStarted}
          >
            <option value="multiplayer">Multiplayer</option>
            <option value="ai">Play vs AI</option>
          </select>
          {showModeSelect && (
            <button 
              onClick={onModeSelect}
              className={styles.continueButton}
            >
              Continue
            </button>
          )}
        </div>
      </div>
    }
  </>
  );
} 