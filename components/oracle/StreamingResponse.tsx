import React, { useState, useEffect } from 'react';

export interface StreamingResponseProps {
  text: string;
  isStreaming?: boolean;
  speedMs?: number;
  onFinish?: () => void;
  className?: string;
}

export const StreamingResponse: React.FC<StreamingResponseProps> = ({
  text,
  isStreaming = false,
  speedMs = 25,
  onFinish,
  className = '',
}) => {
  const [displayedText, setDisplayedText] = useState(isStreaming ? '' : text);

  useEffect(() => {
    if (!isStreaming) {
      setDisplayedText(text);
      return;
    }

    let currentIndex = 0;
    setDisplayedText('');

    const interval = setInterval(() => {
      if (currentIndex < text.length) {
        setDisplayedText(text.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(interval);
        if (onFinish) onFinish();
      }
    }, speedMs);

    return () => clearInterval(interval);
  }, [text, isStreaming, speedMs, onFinish]);

  return (
    <div className={`font-mono text-xs sm:text-sm text-[#f5f3f0] leading-relaxed whitespace-pre-wrap select-text ${className}`}>
      {displayedText}
      {isStreaming && (
        <span className="inline-block w-2 h-4 ml-1 bg-[#C9A84C] animate-pulse align-middle" />
      )}
    </div>
  );
};

export default StreamingResponse;
