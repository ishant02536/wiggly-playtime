
import React from "react";

interface ScoreBoardProps {
  score: number;
  highScore: number;
}

const ScoreBoard: React.FC<ScoreBoardProps> = ({ score, highScore }) => {
  return (
    <div className="flex justify-between items-center w-full max-w-md px-4 py-2 bg-white rounded-lg shadow-sm mb-4">
      <div className="flex flex-col items-center">
        <span className="text-xs uppercase tracking-wider text-gray-500">Score</span>
        <span className="font-bold text-2xl">{score}</span>
      </div>
      
      <div className="h-12 w-px bg-gray-200"></div>
      
      <div className="flex flex-col items-center">
        <span className="text-xs uppercase tracking-wider text-gray-500">High Score</span>
        <span className="font-bold text-2xl">{highScore}</span>
      </div>
    </div>
  );
};

export default ScoreBoard;
