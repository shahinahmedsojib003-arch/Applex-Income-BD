import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setFadingOut(true);
    }, 1700);

    const doneTimer = setTimeout(() => {
      onFinish();
    }, 2200);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
    };
  }, [onFinish]);

  const handleSkip = () => {
    setFadingOut(true);
    setTimeout(onFinish, 300);
  };

  return (
    <div
      onClick={handleSkip}
      className={`fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-b from-emerald-50 via-white to-emerald-950 transition-opacity duration-500 cursor-pointer select-none ${
        fadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Mobile full-bleed / Desktop centered framed splash */}
      <div className="relative w-full h-full max-w-md mx-auto flex flex-col items-center justify-center overflow-hidden sm:rounded-3xl sm:max-h-[92vh] sm:shadow-2xl sm:border sm:border-emerald-200/60 bg-white">
        <img
          src="/splash-screen.png"
          alt="Applex Income BD - Your Trusted Earning Platform"
          className="w-full h-full object-cover object-center"
        />

        {/* Subtle bottom loading bar overlay */}
        <div className="absolute bottom-3 left-8 right-8 flex flex-col items-center gap-1.5 pointer-events-none">
          <div className="w-36 h-1.5 rounded-full bg-white/30 overflow-hidden backdrop-blur-sm">
            <div className="h-full bg-gradient-to-r from-amber-300 via-yellow-400 to-emerald-300 rounded-full animate-[splashProgress_1.7s_ease-out_forwards]" />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes splashProgress {
          0% { width: 10%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
};
