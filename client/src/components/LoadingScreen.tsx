import { useState, useEffect } from 'react';

interface LoadingScreenProps {
  onRetry?: () => void;
  error?: string | null;
}

export default function LoadingScreen({ onRetry, error }: LoadingScreenProps) {
  const [dots, setDots] = useState('');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const dotsInterval = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 15;
      });
    }, 400);

    return () => {
      clearInterval(dotsInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <div className="loading-screen">
      <div className="loading-content">
        <div className="logo">
          <svg viewBox="0 0 512 512" className="w-16 h-16">
            <circle cx="170" cy="256" r="80" fill="white" />
            <circle cx="342" cy="256" r="80" fill="white" />
            <circle cx="155" cy="240" r="25" fill="#1a1b1e" />
            <circle cx="327" cy="240" r="25" fill="#1a1b1e" />
            <path d="M 200 300 Q 256 360 312 300" stroke="white" strokeWidth="12" fill="none" strokeLinecap="round" />
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-white mb-2">VoiceFlow</h2>
        <p className="text-secondary-100 mb-6">
          {error ? '⚠️ Сервер недоступен' : 'Подключение к серверу...'}{dots}
        </p>

        <div className="progress-container">
          <div 
            className="progress-bar" 
            style={{ 
              width: `${Math.min(progress, 90)}%`,
              background: error ? 'linear-gradient(90deg, #da373c 0%, #ff6b6b 100%)' : undefined
            }}
          ></div>
        </div>

        {error && onRetry && (
          <>
            <button className="btn-discord mb-3" onClick={onRetry}>
              Попробовать снова
            </button>
            <p className="text-secondary-300 text-xs mt-2">
              Или подождите, страница откроется автоматически...
            </p>
          </>
        )}

        {!error && (
          <p className="text-secondary-300 text-sm">
            Загрузка приложения...
          </p>
        )}
      </div>
    </div>
  );
}
