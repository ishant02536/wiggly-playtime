import React, { useState, useEffect, useCallback, useRef } from "react";
import GameControls from "./GameControls";
import ScoreBoard from "./ScoreBoard";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { RotateCcw } from "lucide-react";

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
const SWIPE_THRESHOLD = 50; // Minimum distance for a swipe to be detected

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
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  
  const directionRef = useRef<Direction>(direction);
  const isMobile = useIsMobile();
  const gameContainerRef = useRef<HTMLDivElement>(null);
  
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);

  useEffect(() => {
    const savedHighScore = localStorage.getItem("snakeHighScore");
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore, 10));
    }
    
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(prefersDark);
    document.documentElement.classList.toggle('dark', prefersDark);
    
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

  const generateFood = useCallback((): Cell => {
    const newFood: Cell = {
      x: Math.floor(Math.random() * gridSize),
      y: Math.floor(Math.random() * gridSize),
    };

    const isOnSnake = snake.some(segment => 
      segment.x === newFood.x && segment.y === newFood.y
    );

    if (isOnSnake) {
      return generateFood();
    }

    return newFood;
  }, [snake, gridSize]);

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
        setIsPaused(prev => !prev);
        break;
      default:
        break;
    }
  }, [gameOver]);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    document.documentElement.classList.toggle('dark', newMode);
  };

  const handleControl = (newDirection: Direction) => {
    if (gameOver) return;
    
    if (
      (newDirection === "UP" && directionRef.current !== "DOWN") ||
      (newDirection === "DOWN" && directionRef.current !== "UP") ||
      (newDirection === "LEFT" && directionRef.current !== "RIGHT") ||
      (newDirection === "RIGHT" && directionRef.current !== "LEFT")
    ) {
      setDirection(newDirection);
      
      if (!isGameStarted) {
        setIsGameStarted(true);
      }
    }
  };

  const moveSnake = useCallback(() => {
    if (isPaused || gameOver || !isGameStarted) return;
    
    setSnake(prevSnake => {
      const head = { ...prevSnake[0] };
      
      switch (directionRef.current) {
        case "UP":
          head.y = head.y - 1;
          break;
        case "DOWN":
          head.y = head.y + 1;
          break;
        case "LEFT":
          head.x = head.x - 1;
          break;
        case "RIGHT":
          head.x = head.x + 1;
          break;
        default:
          break;
      }
      
      if (head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize) {
        setGameOver(true);
        toast.error("Game Over! Snake hit the border.", {
          position: "top-center",
          duration: 2000,
        });
        return prevSnake;
      }
      
      for (let i = 1; i < prevSnake.length; i++) {
        if (prevSnake[i].x === head.x && prevSnake[i].y === head.y) {
          setGameOver(true);
          toast.error("Game Over! Snake hit itself.", {
            position: "top-center",
            duration: 2000,
          });
          return prevSnake;
        }
      }
      
      const newSnake = [head, ...prevSnake];
      
      if (head.x === food.x && head.y === food.y) {
        const newScore = score + 1;
        setScore(newScore);
        
        if (newScore > highScore) {
          setHighScore(newScore);
          localStorage.setItem("snakeHighScore", newScore.toString());
        }
        
        setFood(generateFood());
        
        if (speed > MAX_SPEED) {
          setSpeed(prevSpeed => prevSpeed - SPEED_INCREMENT);
        }
        
        toast.success(`Score: ${newScore}`, {
          position: "top-center",
          duration: 1000,
        });
      } else {
        newSnake.pop();
      }
      
      return newSnake;
    });
  }, [isPaused, gameOver, isGameStarted, gridSize, food, score, highScore, speed, generateFood]);

  useEffect(() => {
    const intervalId = setInterval(moveSnake, speed);
    return () => clearInterval(intervalId);
  }, [moveSnake, speed]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

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
      <div className="flex w-full justify-between items-center mb-2">
        <ScoreBoard score={score} highScore={highScore} />
        
        <div className="flex gap-2">
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
            aria-label={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDarkMode ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"/>
                <path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
              </svg>
            )}
          </button>
          
          <button
            onClick={resetGame}
            className="p-2 rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
            aria-label="Reset Game"
          >
            <RotateCcw size={20} />
          </button>
        </div>
      </div>
      
      <div 
        className="game-board bg-snake-background dark:bg-snake-background-dark"
        style={{
          gridTemplateColumns: `repeat(${gridSize}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${gridSize}, ${cellSize}px)`,
          borderColor: isDarkMode ? 'var(--snake-border-color-dark, #263238)' : 'var(--snake-border-color, #455A64)'
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchMove}
      >
        {Array.from({ length: gridSize * gridSize }).map((_, index) => {
          const x = index % gridSize;
          const y = Math.floor(index / gridSize);
          
          const isSnakeHead = snake.length > 0 && snake[0].x === x && snake[0].y === y;
          const isSnakeBody = !isSnakeHead && snake.some((segment, idx) => idx > 0 && segment.x === x && segment.y === y);
          
          const isFood = food.x === x && food.y === y;
          
          return (
            <div
              key={`${x}-${y}`}
              className={`snake-cell ${
                isSnakeHead 
                  ? "bg-snake-head dark:bg-snake-head-dark snake-head" 
                  : isSnakeBody 
                    ? "bg-snake-body dark:bg-snake-body-dark snake-body" 
                    : isFood 
                      ? "bg-snake-food dark:bg-snake-food-dark snake-food" 
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
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg text-center animate-scale-in">
            <h2 className="text-2xl font-bold mb-4 dark:text-white">Game Over</h2>
            <p className="mb-2 dark:text-gray-200">Your score: {score}</p>
            <p className="mb-4 dark:text-gray-200">High score: {highScore}</p>
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
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg text-center animate-scale-in">
            <h2 className="text-2xl font-bold mb-4 dark:text-white">Snake Game</h2>
            <p className="mb-4 dark:text-gray-200">Use arrow keys or swipe to control the snake</p>
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
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg text-center animate-scale-in">
            <h2 className="text-2xl font-bold mb-4 dark:text-white">Game Paused</h2>
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
          onReset={resetGame}
          isPaused={isPaused}
          gameOver={gameOver}
        />
      )}
      
      {isMobile && isGameStarted && !gameOver && !isPaused && (
        <div className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400 animate-fade-in">
          <p>Swipe to control the snake</p>
        </div>
      )}
    </div>
  );
};

export default SnakeGame;
