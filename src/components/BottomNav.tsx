import React from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  Wallet,
  Users,
  User,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAuth: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenAuth,
}) => {
  const { currentUser, isAdmin } = useAuth();
  const { t } = useLanguage();

  const handleTabClick = (tab: string) => {
    if (!currentUser && (tab === 'wallet' || tab === 'referrals' || tab === 'profile')) {
      onOpenAuth();
      return;
    }
    setActiveTab(tab);
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-emerald-950/95 backdrop-blur-lg border-t border-emerald-800/60 shadow-2xl px-2 py-1.5 safe-area-pb">
      <div className="grid grid-cols-5 gap-1 items-center max-w-md mx-auto">
        {/* Dashboard */}
        <button
          onClick={() => handleTabClick('dashboard')}
          className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all ${
            activeTab === 'dashboard'
              ? 'text-emerald-300 font-bold scale-105'
              : 'text-emerald-400/60 hover:text-emerald-200'
          }`}
        >
          <LayoutDashboard className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] leading-tight truncate max-w-full">
            {t('navDashboard')}
          </span>
        </button>

        {/* Tasks */}
        <button
          onClick={() => handleTabClick('tasks')}
          className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all ${
            activeTab === 'tasks'
              ? 'text-emerald-300 font-bold scale-105'
              : 'text-emerald-400/60 hover:text-emerald-200'
          }`}
        >
          <div className="relative">
            <CheckSquare className="w-5 h-5 mb-0.5" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          </div>
          <span className="text-[10px] leading-tight truncate max-w-full">
            {t('navTasks')}
          </span>
        </button>

        {/* Wallet */}
        <button
          onClick={() => handleTabClick('wallet')}
          className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all ${
            activeTab === 'wallet'
              ? 'text-emerald-300 font-bold scale-105'
              : 'text-emerald-400/60 hover:text-emerald-200'
          }`}
        >
          <Wallet className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] leading-tight truncate max-w-full">
            {t('navWallet')}
          </span>
        </button>

        {/* Referrals */}
        <button
          onClick={() => handleTabClick('referrals')}
          className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all ${
            activeTab === 'referrals'
              ? 'text-emerald-300 font-bold scale-105'
              : 'text-emerald-400/60 hover:text-emerald-200'
          }`}
        >
          <Users className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] leading-tight truncate max-w-full">
            {t('navReferrals')}
          </span>
        </button>

        {/* Profile / Admin */}
        <button
          onClick={() => (isAdmin ? handleTabClick('admin') : handleTabClick('profile'))}
          className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all ${
            activeTab === 'profile' || activeTab === 'admin'
              ? 'text-emerald-300 font-bold scale-105'
              : 'text-emerald-400/60 hover:text-emerald-200'
          }`}
        >
          {isAdmin ? (
            <ShieldCheck className="w-5 h-5 mb-0.5 text-amber-400" />
          ) : (
            <User className="w-5 h-5 mb-0.5" />
          )}
          <span className="text-[10px] leading-tight truncate max-w-full">
            {isAdmin ? t('navAdmin') : t('navProfile')}
          </span>
        </button>
      </div>
    </div>
  );
};
