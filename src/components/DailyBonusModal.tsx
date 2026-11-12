import React, { useState } from 'react';
import { X, Sparkles, CheckCircle, Calendar, Gift, Coins } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { claimDailyBonus } from '../services/dbService';

interface DailyBonusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessClaim?: () => void;
}

export const DailyBonusModal: React.FC<DailyBonusModalProps> = ({
  isOpen,
  onClose,
  onSuccessClaim,
}) => {
  const { currentUser, profile } = useAuth();
  const { t } = useLanguage();

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [claimedSuccess, setClaimedSuccess] = useState(false);

  if (!isOpen) return null;

  const today = new Date().toISOString().split('T')[0];
  const alreadyClaimed = profile?.lastDailyBonus === today;

  const handleClaim = async () => {
    if (!currentUser) return;
    setLoading(true);
    setErrorMsg('');

    try {
      await claimDailyBonus(currentUser.uid);
      setClaimedSuccess(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
      if (onSuccessClaim) onSuccessClaim();
    } catch (err: any) {
      if (err.message?.includes('Already claimed')) {
        setErrorMsg('You have already claimed your daily bonus today. Come back tomorrow!');
      } else {
        setErrorMsg(err.message || 'Failed to claim daily bonus');
      }
    } finally {
      setLoading(false);
    }
  };

  const daysOfWeek = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const currentDayIndex = new Date().getDay(); // 0 is Sun

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-emerald-100 overflow-hidden text-center">
        {/* Glow Header */}
        <div className="relative bg-gradient-to-b from-emerald-800 to-green-700 px-6 pt-8 pb-12 text-white overflow-hidden">
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-green-400/20 rounded-full blur-2xl" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-amber-400/20 rounded-full blur-xl" />

          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-emerald-900/60 hover:bg-emerald-900 text-emerald-200 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-200 p-1 shadow-lg shadow-amber-500/30 flex items-center justify-center transform hover:rotate-6 transition-transform">
            <Gift className="w-9 h-9 text-emerald-950" />
          </div>

          <h3 className="text-2xl font-extrabold tracking-tight">
            {t('dailyBonusTitle')}
          </h3>
          <p className="text-xs text-emerald-100/90 max-w-xs mx-auto mt-1">
            {t('dailyBonusDesc')}
          </p>
        </div>

        {/* Floating Reward Amount Box */}
        <div className="-mt-7 px-6">
          <div className="bg-white rounded-2xl shadow-xl border border-emerald-100 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center">
                <Coins className="w-6 h-6 text-emerald-700" />
              </div>
              <div className="text-left">
                <p className="text-xs text-gray-500 font-medium">Today's Check-in</p>
                <p className="text-lg font-bold text-gray-900">+৳5.00 BDT</p>
              </div>
            </div>
            <div className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
              FREE
            </div>
          </div>
        </div>

        {/* 7-Day Streak Row */}
        <div className="px-6 py-5">
          <p className="text-xs font-bold text-gray-600 mb-3 text-left flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
            7-Day Streak Rewards
          </p>
          <div className="grid grid-cols-7 gap-1.5">
            {daysOfWeek.map((day, idx) => {
              const isToday = idx === currentDayIndex;
              const isDone = alreadyClaimed && isToday;
              return (
                <div
                  key={day}
                  className={`py-2 px-1 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${
                    isDone
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : isToday
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-400'
                      : 'bg-gray-50 border-gray-100 text-gray-400'
                  }`}
                >
                  <span className="text-[10px] font-semibold">{day}</span>
                  {isDone ? (
                    <CheckCircle className="w-3.5 h-3.5 my-1" />
                  ) : (
                    <span className="text-xs font-extrabold my-0.5">৳5</span>
                  )}
                  <span className="text-[9px] opacity-80">Day {idx + 1}</span>
                </div>
              );
            })}
          </div>

          {errorMsg && (
            <p className="mt-3 text-xs text-rose-600 font-medium bg-rose-50 p-2 rounded-xl border border-rose-200">
              {errorMsg}
            </p>
          )}

          {claimedSuccess && (
            <p className="mt-3 text-xs text-emerald-700 font-semibold bg-emerald-50 p-2 rounded-xl border border-emerald-200 flex items-center justify-center gap-1">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              ৳5.00 has been credited to your wallet balance!
            </p>
          )}

          <div className="mt-6 mb-2">
            {alreadyClaimed || claimedSuccess ? (
              <button
                disabled
                className="w-full py-3 rounded-2xl bg-gray-100 text-gray-400 font-bold text-sm cursor-not-allowed flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                {t('claimedToday')}
              </button>
            ) : (
              <button
                onClick={handleClaim}
                disabled={loading}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 hover:scale-102"
              >
                <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
                <span>{loading ? t('loading') : t('claimDailyBonus')}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
