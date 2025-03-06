
import React from "react";
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Pause, Play } from "lucide-react";

type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";

interface GameControlsProps {
  onControl: (direction: Direction) => void;
  onPause: () => void;
  isPaused: boolean;
  gameOver: boolean;
}

const GameControls: React.FC<GameControlsProps> = ({ onControl, onPause, isPaused, gameOver }) => {
  return (
    <div className="w-full max-w-xs mt-6">
      <div className="flex justify-center mb-4">
        <button
          className="control-btn w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center shadow-md focus:outline-none active:shadow-inner disabled:opacity-50"
          onClick={() => onControl("UP")}
          disabled={gameOver}
          aria-label="Move Up"
        >
          <ArrowUp className="w-8 h-8 text-gray-700" />
        </button>
      </div>
      
      <div className="flex justify-between">
        <button
          className="control-btn w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center shadow-md focus:outline-none active:shadow-inner disabled:opacity-50"
          onClick={() => onControl("LEFT")}
          disabled={gameOver}
          aria-label="Move Left"
        >
          <ArrowLeft className="w-8 h-8 text-gray-700" />
        </button>
        
        <button
          className="control-btn w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center shadow-md focus:outline-none active:shadow-inner"
          onClick={onPause}
          aria-label={isPaused ? "Resume" : "Pause"}
        >
          {isPaused ? (
            <Play className="w-6 h-6 text-gray-700" />
          ) : (
            <Pause className="w-6 h-6 text-gray-700" />
          )}
        </button>
        
        <button
          className="control-btn w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center shadow-md focus:outline-none active:shadow-inner disabled:opacity-50"
          onClick={() => onControl("RIGHT")}
          disabled={gameOver}
          aria-label="Move Right"
        >
          <ArrowRight className="w-8 h-8 text-gray-700" />
        </button>
      </div>
      
      <div className="flex justify-center mt-4">
        <button
          className="control-btn w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center shadow-md focus:outline-none active:shadow-inner disabled:opacity-50"
          onClick={() => onControl("DOWN")}
          disabled={gameOver}
          aria-label="Move Down"
        >
          <ArrowDown className="w-8 h-8 text-gray-700" />
        </button>
      </div>
    </div>
  );
};

export default GameControls;
