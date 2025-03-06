
import React from "react";
import SnakeGame from "@/components/SnakeGame";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 px-4 py-10">
      <div className="w-full max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium mb-2 animate-pulse-gentle">
            CLASSIC GAME
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            Snake
          </h1>
          <p className="text-gray-500">
            Use arrow keys or control buttons to navigate the snake and eat the food.
          </p>
        </div>
        
        <div className="bg-white rounded-xl shadow-xl overflow-hidden backdrop-blur-sm border border-gray-100">
          <div className="relative p-6">
            <SnakeGame />
          </div>
        </div>
        
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Press space or use the pause button to pause the game.</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
