import React from 'react';
import {
  Coins,
  Globe,
  ShieldCheck,
  User as UserIcon,
  LogIn,
  LogOut,
  Bell,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { PWAInstallButton } from './PWAInstallButton';

interface NavbarProps {
  onOpenAuth: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenDailyBonus: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAuth,
  activeTab,
  setActiveTab,
  onOpenDailyBonus,
}) => {
  const { currentUser, profile, isAdmin, logout } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();

  return (
    <header className="sticky top-0 z-40 bg-emerald-950/95 backdrop-blur-md border-b border-emerald-800/50 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <img
              src="/app-logo.png"
              alt="Applex Income BD"
              className="w-10 h-10 rounded-xl shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform object-cover border border-amber-400/50"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-emerald-200 via-white to-green-300 bg-clip-text text-transparent">
                  Applex Income
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-800/80 text-emerald-200 border border-emerald-700">
                  BD
                </span>
              </div>
              <p className="text-[11px] text-emerald-400/80 font-medium hidden sm:block">
                {t('taglineShort')}
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-emerald-800 text-emerald-100 shadow-sm'
                  : 'text-emerald-200/80 hover:text-white hover:bg-emerald-900/60'
              }`}
            >
              {t('navDashboard')}
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'tasks'
                  ? 'bg-emerald-800 text-emerald-100 shadow-sm'
                  : 'text-emerald-200/80 hover:text-white hover:bg-emerald-900/60'
              }`}
            >
              {t('navTasks')}
            </button>
            <button
              onClick={() => setActiveTab('wallet')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'wallet'
                  ? 'bg-emerald-800 text-emerald-100 shadow-sm'
                  : 'text-emerald-200/80 hover:text-white hover:bg-emerald-900/60'
              }`}
            >
              {t('navWallet')}
            </button>
            <button
              onClick={() => setActiveTab('referrals')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'referrals'
                  ? 'bg-emerald-800 text-emerald-100 shadow-sm'
                  : 'text-emerald-200/80 hover:text-white hover:bg-emerald-900/60'
              }`}
            >
              {t('navReferrals')}
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'profile'
                  ? 'bg-emerald-800 text-emerald-100 shadow-sm'
                  : 'text-emerald-200/80 hover:text-white hover:bg-emerald-900/60'
              }`}
            >
              {t('navProfile')}
            </button>
            {isAdmin && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all border ${
                  activeTab === 'admin'
                    ? 'bg-amber-500/20 text-amber-200 border-amber-500/50 shadow-sm'
                    : 'text-amber-300/90 border-amber-500/30 hover:bg-amber-500/10'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                {t('navAdmin')}
              </button>
            )}
          </nav>

          {/* Right Controls: Balance, Daily Bonus, Language, Auth */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Daily Bonus Quick Button */}
            {currentUser && (
              <button
                onClick={onOpenDailyBonus}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-emerald-500/20 border border-amber-400/30 text-amber-200 hover:border-amber-400 text-xs font-semibold hover:scale-105 transition-all shadow-sm"
                title={t('dailyBonusTitle')}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>+৳5 {t('dailyBonusTitle')}</span>
              </button>
            )}

            {/* Wallet Balance Pill */}
            {currentUser && profile && (
              <div
                onClick={() => setActiveTab('wallet')}
                className="flex items-center gap-2 bg-emerald-900/80 border border-emerald-700/60 hover:border-emerald-500 px-3 py-1.5 rounded-full cursor-pointer transition-all shadow-sm group"
              >
                <div className="w-2 h-2 rounded-full bg-green-400 animate-ping" />
                <span className="text-xs text-emerald-300 hidden xs:inline">{t('currency')}:</span>
                <span className="text-sm font-bold text-emerald-100 group-hover:text-green-300">
                  ৳{(profile.walletBalance || 0).toFixed(2)}
                </span>
              </div>
            )}

            {/* In-App PWA Install Button */}
            <PWAInstallButton variant="header" />

            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-900/60 hover:bg-emerald-800 border border-emerald-700/50 text-xs font-bold text-emerald-200 hover:text-white transition-colors"
              title="Toggle English / বাংলা"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span>{language === 'en' ? 'বাংলা' : 'EN'}</span>
            </button>

            {/* Auth Button */}
            {currentUser ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('profile')}
                  className="w-9 h-9 rounded-full bg-emerald-800 border border-emerald-600 flex items-center justify-center text-sm font-bold text-white hover:ring-2 hover:ring-emerald-400 transition-all"
                  title={currentUser.email || ''}
                >
                  {profile?.displayName?.charAt(0).toUpperCase() || 'U'}
                </button>
                <button
                  onClick={logout}
                  className="hidden md:flex p-2 rounded-lg text-emerald-300/80 hover:text-rose-300 hover:bg-emerald-900/80 transition-colors"
                  title={t('logout')}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-semibold text-xs sm:text-sm shadow-md shadow-emerald-600/30 transition-all hover:scale-102"
              >
                <LogIn className="w-4 h-4" />
                <span>{t('login')}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
