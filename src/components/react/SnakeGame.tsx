import { useState, useEffect, useCallback, useRef } from 'react';

interface Position {
  x: number;
  y: number;
}

interface SnakeGameProps {
  width?: number;
  height?: number;
  cellSize?: number;
  lang?: 'es' | 'en';
}

export default function SnakeGame({ width = 20, height = 20, cellSize = 19, lang = 'en' }: SnakeGameProps) {
  const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Position>({ x: 15, y: 15 });
  const [direction, setDirection] = useState<Position>({ x: 0, y: -1 });
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [directionQueue, setDirectionQueue] = useState<Position[]>([]);
  
  // Touch handling refs
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const generateFood = useCallback(() => {
    let newFood: Position;
    do {
      newFood = {
        x: Math.floor(Math.random() * width),
        y: Math.floor(Math.random() * height)
      };
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    return newFood;
  }, [snake, width, height]);

  const resetGame = () => {
    setSnake([{ x: 10, y: 10 }]);
    setFood({ x: 15, y: 15 });
    setDirection({ x: 0, y: -1 });
    setGameOver(false);
    setScore(0);
    setGameStarted(true);
    setDirectionQueue([]);
  };

  const addDirectionToQueue = useCallback((newDirection: Position) => {
    if (!gameStarted) return;
    
    setDirectionQueue(currentQueue => {
      // Limit queue size to prevent excessive buffering
      if (currentQueue.length < 3) {
        // Check if the new direction is different from the last queued direction
        const lastDirection = currentQueue[currentQueue.length - 1] || direction;
        if (lastDirection.x !== newDirection.x || lastDirection.y !== newDirection.y) {
          return [...currentQueue, newDirection];
        }
      }
      return currentQueue;
    });
  }, [direction, gameStarted]);

  const moveSnake = useCallback(() => {
    if (gameOver || !gameStarted) return;

    // Process next direction from queue if available
    setDirectionQueue(currentQueue => {
      if (currentQueue.length > 0) {
        const nextDirection = currentQueue[0];
        const remainingQueue = currentQueue.slice(1);
        setDirection(nextDirection);
        return remainingQueue;
      }
      return currentQueue;
    });

    setSnake(currentSnake => {
      const newSnake = [...currentSnake];
      const head = { ...newSnake[0] };
      head.x += direction.x;
      head.y += direction.y;

      // Wrap around the map edges for infinite travel
      if (head.x < 0) head.x = width - 1;
      if (head.x >= width) head.x = 0;
      if (head.y < 0) head.y = height - 1;
      if (head.y >= height) head.y = 0;

      // Check self collision
      if (newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
        setGameOver(true);
        return currentSnake;
      }

      newSnake.unshift(head);

      // Check food collision
      if (head.x === food.x && head.y === food.y) {
        setScore(prev => prev + 1);
        setFood(generateFood());
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [direction, food, gameOver, gameStarted, generateFood, width, height]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!gameStarted) return;
      
      let newDirection: Position | null = null;
      
      switch (e.key) {
        case 'w':
          if (direction.y !== 1) newDirection = { x: 0, y: -1 };
          break;
        case 's':
          if (direction.y !== -1) newDirection = { x: 0, y: 1 };
          break;
        case 'a':
          if (direction.x !== 1) newDirection = { x: -1, y: 0 };
          break;
        case 'd':
          if (direction.x !== -1) newDirection = { x: 1, y: 0 };
          break;
      }
      
      if (newDirection) {
        addDirectionToQueue(newDirection);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [addDirectionToQueue]);

  useEffect(() => {
    // Increased framerate for smoother gameplay
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const gameSpeed = isMobile ? 90 : 60;
    const gameLoop = setInterval(moveSnake, gameSpeed);
    return () => clearInterval(gameLoop);
  }, [moveSnake]);

  // Mobile touch handling with native DOM events
  useEffect(() => {
    const gameArea = gameAreaRef.current;
    if (!gameArea) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (!gameStarted) return;
      
      e.preventDefault();
      e.stopPropagation();
      
      const touch = e.touches[0];
      touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!gameStarted) return;
      
      // Prevent scrolling and other default behaviors
      e.preventDefault();
      e.stopPropagation();
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!gameStarted || !touchStartRef.current) return;
      
      e.preventDefault();
      e.stopPropagation();
      
      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;
      
      // Minimum swipe distance (reduced for better mobile responsiveness)
      const minSwipeDistance = 15;
      
      // Only process if we have a significant swipe
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      if (distance < minSwipeDistance) {
        touchStartRef.current = null;
        return;
      }
      
      // Determine the primary direction of the swipe
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (deltaX > 0) {
          // Swipe right
          if (direction.x !== -1) addDirectionToQueue({ x: 1, y: 0 });
        } else {
          // Swipe left
          if (direction.x !== 1) addDirectionToQueue({ x: -1, y: 0 });
        }
      } else {
        // Vertical swipe
        if (deltaY > 0) {
          // Swipe down
          if (direction.y !== -1) addDirectionToQueue({ x: 0, y: 1 });
        } else {
          // Swipe up
          if (direction.y !== 1) addDirectionToQueue({ x: 0, y: -1 });
        }
      }
      
      touchStartRef.current = null;
    };

    // Add event listeners with proper options for mobile
    gameArea.addEventListener('touchstart', handleTouchStart, { passive: false });
    gameArea.addEventListener('touchmove', handleTouchMove, { passive: false });
    gameArea.addEventListener('touchend', handleTouchEnd, { passive: false });

    // Cleanup
    return () => {
      gameArea.removeEventListener('touchstart', handleTouchStart);
      gameArea.removeEventListener('touchmove', handleTouchMove);
      gameArea.removeEventListener('touchend', handleTouchEnd);
    };
  }, [gameStarted, direction, addDirectionToQueue]);

  const startGame = () => {
    resetGame();
  };

  return (
    <div className="flex flex-col items-center p-4 select-none">
      <div className="mb-4 text-center">
        <div className="text-lg font-semibold text-blue-600 dark:text-green-400">
          {lang === 'es' ? 'Puntuación:' : 'Score:'} {score}
        </div>
      </div>
      
      <div
        ref={gameAreaRef}
        className="relative border-2 rounded-lg shadow-lg border-gray-600 dark:border-gray-800 bg-white dark:bg-gray-900 touch-none select-none"
        style={{
          width: width * cellSize,
          height: height * cellSize,
          WebkitTouchCallout: 'none',
          WebkitUserSelect: 'none',
          touchAction: 'none',
        }}
      >
        {/* Snake */}
        {snake.map((segment, index) => (
          <div
            key={index}
            className={`absolute ${
              index === 0
                ? 'bg-green-800 dark:bg-green-600'
                : 'bg-green-500 dark:bg-green-300'
            } rounded-sm`}
            style={{
              left: segment.x * cellSize,
              top: segment.y * cellSize,
              width: cellSize - 1,
              height: cellSize - 1,
            }}
          />
        ))}
        
        {/* Food */}
        <div
          className="absolute bg-red-500 dark:bg-red-400 rounded-full"
          style={{
            left: food.x * cellSize + 2,
            top: food.y * cellSize + 2,
            width: cellSize - 4,
            height: cellSize - 4,
          }}
        />
      </div>

      <div className="mt-4 text-center">
        {!gameStarted && !gameOver && (
          <button
            onClick={startGame}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 dark:bg-green-500 dark:hover:bg-green-600 text-white font-semibold rounded-lg transition-colors"
          >
            {lang === 'es' ? 'Iniciar Juego' : 'Start Game'}
          </button>
        )}
        
        {gameOver && (
          <div className="space-y-2">
            <div className="text-red-600 dark:text-red-400 font-semibold mb-2">
                {lang === 'es' ? '¡Fin del Juego!' : 'Game Over!'}
                </div>
            <button
              onClick={resetGame}
              className="px-6 py-2 bg-blue-500 hover:bg-blue-600 dark:bg-green-500 dark:hover:bg-green-600 text-white font-semibold rounded-lg transition-colors"
            >
              {lang === 'es' ? 'Jugar de Nuevo' : 'Play Again'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}