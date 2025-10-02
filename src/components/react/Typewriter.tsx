import { useState, useEffect } from 'react';

interface TypewriterProps {
  text: string;
  speed?: number;
  cursorChar?: string;
}

export default function Typewriter({ text, speed = 80, cursorChar = '|' }: TypewriterProps) {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);

      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text, speed]);

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);

    return () => clearInterval(cursorInterval);
  }, []);

  return (
    <span>
      {displayText}
      <span style={{ opacity: showCursor ? 1 : 0 }}>
        {cursorChar}
      </span>
    </span>
  );
}