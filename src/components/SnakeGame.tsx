
import React, { useState, useEffect, useCallback, useRef } from "react";
import GameControls from "./GameControls";
import ScoreBoard from "./ScoreBoard";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";

// Direction types
type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";

// Cell type for the snake and food
interface Cell {
  x: number;
  y: number;
}

const GRID_SIZE = 20;
const INITIAL_SPEED = 150;
const MAX_SPEED = 80;
const SPEED_INCREMENT = 5;

const SnakeGame: React.FC = () => {
  const [snake, setSnake] = useState<Cell[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Cell>({ x: 15, y: 15 });
  const [direction, setDirection] = useState<Direction>("RIGHT");
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [speed, setSpeed] = useState<number>(INITIAL_SPEED);
  const [gridSize, setGridSize] = useState<number>(GRID_SIZE);
  const [highScore, setHighScore] = useState<number>(0);
  const [isGameStarted, setIsGameStarted] = useState<boolean>(false);
  
  const directionRef = useRef<Direction>(direction);
  const isMobile = useIsMobile();
  const gameContainerRef = useRef<HTMLDivElement>(null);

  // Update direction ref when direction changes
  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);

  // Load high score from localStorage on component mount
  useEffect(() => {
    const savedHighScore = localStorage.getItem("snakeHighScore");
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore, 10));
    }
    
    // Set grid size based on screen size
    const updateGridSize = () => {
      if (gameContainerRef.current) {
        const width = Math.min(window.innerWidth, 500);
        const size = Math.floor(width / 25);
        setGridSize(size);
      }
    };
    
    updateGridSize();
    window.addEventListener("resize", updateGridSize);
    return () => window.removeEventListener("resize", updateGridSize);
  }, []);

  // Generate random food position that is not on the snake
  const generateFood = useCallback((): Cell => {
    const newFood: Cell = {
      x: Math.floor(Math.random() * gridSize),
      y: Math.floor(Math.random() * gridSize),
    };

    // Check if food is on the snake
    const isOnSnake = snake.some(segment => 
      segment.x === newFood.x && segment.y === newFood.y
    );

    if (isOnSnake) {
      return generateFood();
    }

    return newFood;
  }, [snake, gridSize]);

  // Handle keyboard inputs
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (gameOver) return;

    switch (e.key) {
      case "ArrowUp":
        if (directionRef.current !== "DOWN") {
          setDirection("UP");
        }
        break;
      case "ArrowDown":
        if (directionRef.current !== "UP") {
          setDirection("DOWN");
        }
        break;
      case "ArrowLeft":
        if (directionRef.current !== "RIGHT") {
          setDirection("LEFT");
        }
        break;
      case "ArrowRight":
        if (directionRef.current !== "LEFT") {
          setDirection("RIGHT");
        }
        break;
      case " ":
        // Space to pause/resume
        setIsPaused(prev => !prev);
        break;
      default:
        break;
    }
  }, [gameOver]);

  // Control handler for mobile
  const handleControl = (newDirection: Direction) => {
    if (gameOver) return;
    
    // Prevent moving in the opposite direction
    if (
      (newDirection === "UP" && directionRef.current !== "DOWN") ||
      (newDirection === "DOWN" && directionRef.current !== "UP") ||
      (newDirection === "LEFT" && directionRef.current !== "RIGHT") ||
      (newDirection === "RIGHT" && directionRef.current !== "LEFT")
    ) {
      setDirection(newDirection);
      
      // Start the game if it's not started yet
      if (!isGameStarted) {
        setIsGameStarted(true);
      }
    }
  };

  // Move the snake
  const moveSnake = useCallback(() => {
    if (isPaused || gameOver || !isGameStarted) return;
    
    setSnake(prevSnake => {
      const head = { ...prevSnake[0] };
      
      // Calculate new head position
      switch (directionRef.current) {
        case "UP":
          head.y = (head.y - 1 + gridSize) % gridSize;
          break;
        case "DOWN":
          head.y = (head.y + 1) % gridSize;
          break;
        case "LEFT":
          head.x = (head.x - 1 + gridSize) % gridSize;
          break;
        case "RIGHT":
          head.x = (head.x + 1) % gridSize;
          break;
        default:
          break;
      }
      
      // Check if snake hit itself
      for (let i = 1; i < prevSnake.length; i++) {
        if (prevSnake[i].x === head.x && prevSnake[i].y === head.y) {
          setGameOver(true);
          return prevSnake;
        }
      }
      
      const newSnake = [head, ...prevSnake];
      
      // Check if snake ate food
      if (head.x === food.x && head.y === food.y) {
        const newScore = score + 1;
        setScore(newScore);
        
        // Update high score if needed
        if (newScore > highScore) {
          setHighScore(newScore);
          localStorage.setItem("snakeHighScore", newScore.toString());
        }
        
        // Generate new food
        setFood(generateFood());
        
        // Increase speed
        if (speed > MAX_SPEED) {
          setSpeed(prevSpeed => prevSpeed - SPEED_INCREMENT);
        }
        
        // Show score animation
        toast.success(`Score: ${newScore}`, {
          position: "top-center",
          duration: 1000,
        });
      } else {
        // Remove the tail if the snake didn't eat food
        newSnake.pop();
      }
      
      return newSnake;
    });
  }, [isPaused, gameOver, isGameStarted, gridSize, food, score, highScore, speed, generateFood]);

  // Game loop
  useEffect(() => {
    const intervalId = setInterval(moveSnake, speed);
    return () => clearInterval(intervalId);
  }, [moveSnake, speed]);

  // Set up keyboard event listeners
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Reset the game
  const resetGame = () => {
    setSnake([{ x: Math.floor(gridSize / 2), y: Math.floor(gridSize / 2) }]);
    setFood(generateFood());
    setDirection("RIGHT");
    setGameOver(false);
    setIsPaused(false);
    setScore(0);
    setSpeed(INITIAL_SPEED);
    setIsGameStarted(false);
    directionRef.current = "RIGHT";
  };

  const startGame = () => {
    if (!isGameStarted) {
      setIsGameStarted(true);
    } else if (isPaused) {
      setIsPaused(false);
    }
  };

  // Calculate the appropriate cell size based on grid size
  const cellSize = Math.min(
    Math.floor(
      Math.min(
        gameContainerRef.current?.clientWidth || 400, 
        (gameContainerRef.current?.clientHeight || 400) - 40
      ) / gridSize
    ),
    20
  );

  return (
    <div 
      className="flex flex-col items-center justify-center space-y-4 w-full max-w-lg mx-auto"
      ref={gameContainerRef}
    >
      <ScoreBoard score={score} highScore={highScore} />
      
      <div 
        className="game-board bg-snake-background border border-gray-200"
        style={{
          gridTemplateColumns: `repeat(${gridSize}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${gridSize}, ${cellSize}px)`,
        }}
      >
        {/* Grid background */}
        {Array.from({ length: gridSize * gridSize }).map((_, index) => {
          const x = index % gridSize;
          const y = Math.floor(index / gridSize);
          
          // Check if this cell is part of the snake
          const isSnake = snake.some(segment => segment.x === x && segment.y === y);
          
          // Check if this cell is the food
          const isFood = food.x === x && food.y === y;
          
          return (
            <div
              key={`${x}-${y}`}
              className={`snake-cell ${
                isSnake 
                  ? "bg-snake-body rounded-sm" 
                  : isFood 
                    ? "bg-snake-food rounded-full snake-food" 
                    : ""
              }`}
              style={{
                width: `${cellSize}px`,
                height: `${cellSize}px`,
                borderRight: x < gridSize - 1 ? "1px solid rgba(226, 232, 240, 0.1)" : "none",
                borderBottom: y < gridSize - 1 ? "1px solid rgba(226, 232, 240, 0.1)" : "none",
              }}
            />
          );
        })}
      </div>
      
      {gameOver && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-10 animate-fade-in">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center animate-scale-in">
            <h2 className="text-2xl font-bold mb-4">Game Over</h2>
            <p className="mb-2">Your score: {score}</p>
            <p className="mb-4">High score: {highScore}</p>
            <button
              onClick={resetGame}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Play Again
            </button>
          </div>
        </div>
      )}
      
      {!isGameStarted && !gameOver && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm z-10 animate-fade-in">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center animate-scale-in">
            <h2 className="text-2xl font-bold mb-4">Snake Game</h2>
            <p className="mb-4">Use arrow keys or swipe to control the snake</p>
            <button
              onClick={startGame}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Start Game
            </button>
          </div>
        </div>
      )}
      
      {isPaused && isGameStarted && !gameOver && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm z-10 animate-fade-in">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center animate-scale-in">
            <h2 className="text-2xl font-bold mb-4">Game Paused</h2>
            <button
              onClick={() => setIsPaused(false)}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Resume
            </button>
          </div>
        </div>
      )}
      
      {isMobile && (
        <GameControls 
          onControl={handleControl} 
          onPause={() => setIsPaused(prev => !prev)}
          isPaused={isPaused}
          gameOver={gameOver}
        />
      )}
    </div>
  );
};

export default SnakeGame;
