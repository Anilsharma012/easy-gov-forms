import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface SplashScreenProps {
  onComplete?: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const duration = 2500;
    const interval = 30;
    const increment = 100 / (duration / interval);
    
    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + increment;
        if (next >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            if (onComplete) {
              onComplete();
            } else {
              navigate("/home", { replace: true });
            }
          }, 300);
          return 100;
        }
        return next;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [navigate, onComplete]);

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-b from-[#0a1628] via-[#0d1f3c] to-[#0a1628] overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative z-10 flex flex-col items-center">
        <div className="w-32 h-32 bg-white rounded-3xl shadow-2xl flex items-center justify-center mb-8 animate-pulse">
          <svg
            viewBox="0 0 100 100"
            className="w-20 h-20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M50 10 L85 25 L85 50 C85 72 68 88 50 95 C32 88 15 72 15 50 L15 25 Z"
              fill="#1e40af"
              stroke="#1e3a8a"
              strokeWidth="2"
            />
            <path
              d="M50 20 L75 32 L75 50 C75 67 62 80 50 85 C38 80 25 67 25 50 L25 32 Z"
              fill="#2563eb"
            />
            <path
              d="M50 35 L50 70 L65 52 Z"
              fill="white"
            />
            <path
              d="M50 35 L35 52 L50 52 Z"
              fill="#dc2626"
            />
          </svg>
        </div>
        
        <h1 className="text-4xl font-bold text-white mb-2 tracking-wide">
          My Gov Form
        </h1>
        <p className="text-gray-400 text-lg mb-16">
          Simplifying Services
        </p>
      </div>
      
      <div className="absolute bottom-24 left-0 right-0 px-12">
        <div className="flex justify-between items-center mb-2">
          <span className="text-blue-400 text-sm font-medium tracking-wider">
            LOADING
          </span>
          <span className="text-gray-400 text-sm">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="w-full h-1.5 bg-gray-700/50 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all duration-100 ease-out"
            style={{ width: `${progress}%` }}
            role="progressbar"
            aria-valuenow={Math.round(progress)}
            aria-valuemin={0}
            aria-valuemax={100}
          ></div>
        </div>
      </div>
      
      <div className="absolute bottom-8 flex flex-col items-center">
        <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
            <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          </svg>
          <span className="tracking-widest">MADE IN INDIA</span>
        </div>
        <span className="text-gray-500 text-xs">v1.0.0</span>
      </div>
    </div>
  );
}
