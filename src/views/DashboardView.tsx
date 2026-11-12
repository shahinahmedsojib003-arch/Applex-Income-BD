import React from 'react';
import {
  Wallet,
  ArrowUpRight,
  Sparkles,
  CheckSquare,
  Gift,
  Users,
  Clock,
  Coins,
  ShieldCheck,
  TrendingUp,
  AlertCircle,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Task, Transaction } from '../types';

interface DashboardViewProps {
  tasks: Task[];
  transactions: Transaction[];
  onOpenTaskModal: (task: Task) => void;
  onOpenWithdraw: () => void;
  onOpenDailyBonus: () => void;
  onOpenAuth: () => void;
  setActiveTab: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  tasks,
  transactions,
  onOpenTaskModal,
  onOpenWithdraw,
  onOpenDailyBonus,
  onOpenAuth,
  setActiveTab,
}) => {
  const { currentUser, profile } = useAuth();
  const { language, t } = useLanguage();

  const balance = profile?.walletBalance || 0;
  const totalEarned = profile?.totalEarned || 0;
  const pendingCashout = profile?.pendingWithdrawals || 0;
  const totalWithdrawn = profile?.totalWithdrawn || 0;

  const today = new Date().toISOString().split('T')[0];
  const isDailyClaimed = profile?.lastDailyBonus === today;

  return (
    <div className="space-y-6 pb-20 md:pb-12">
      {/* Hero Wallet Card */}
      <div className="relative rounded-3xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-green-950 text-white p-6 sm:p-8 shadow-2xl shadow-emerald-950/30 overflow-hidden border border-emerald-700/40">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-green-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-extrabold tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-800/80 text-emerald-200 border border-emerald-600/50">
                {t('welcomeBack')}
              </span>
              <span className="text-xs text-emerald-300 font-medium">
                {profile?.displayName || currentUser?.email?.split('@')[0] || 'Guest Earner'}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-emerald-200/90 font-medium">
              {t('availableBalance')}
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-black tracking-tight text-white font-mono">
                ৳{balance.toFixed(2)}
              </span>
              <span className="text-sm font-bold text-green-300">BDT</span>
            </div>
          </div>

          {/* Quick Actions in Hero */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            <button
              onClick={() => {
                if (!currentUser) onOpenAuth();
                else onOpenWithdraw();
              }}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-900/40 transition-all flex items-center justify-center gap-2 hover:scale-102"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>{t('requestWithdrawal')}</span>
            </button>

            <button
              onClick={() => {
                if (!currentUser) onOpenAuth();
                else onOpenDailyBonus();
              }}
              className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 border ${
                isDailyClaimed
                  ? 'bg-emerald-900/40 text-emerald-300 border-emerald-700/60'
                  : 'bg-amber-500/20 text-amber-200 border-amber-400/50 hover:bg-amber-500/30 hover:scale-102'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{isDailyClaimed ? t('claimedToday') : t('claimDailyBonus')}</span>
            </button>

            <button
              onClick={() => setActiveTab('referrals')}
              className="hidden sm:flex px-4 py-2.5 rounded-xl bg-emerald-900/80 hover:bg-emerald-900 text-emerald-200 border border-emerald-700/70 text-xs sm:text-sm font-semibold items-center gap-1.5 transition-colors"
            >
              <Users className="w-4 h-4" />
              <span>{t('navReferrals')}</span>
            </button>
          </div>
        </div>

        {/* 3 Metric Cards Under Balance */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-6 pt-6 border-t border-emerald-800/60">
          <div className="bg-emerald-950/40 rounded-2xl p-3 sm:p-4 border border-emerald-800/40">
            <p className="text-[10px] sm:text-xs text-emerald-300/80 font-medium">
              {t('totalEarned')}
            </p>
            <p className="text-sm sm:text-lg font-extrabold text-white font-mono mt-0.5">
              ৳{totalEarned.toFixed(2)}
            </p>
          </div>
          <div className="bg-emerald-950/40 rounded-2xl p-3 sm:p-4 border border-emerald-800/40">
            <p className="text-[10px] sm:text-xs text-amber-300/80 font-medium">
              {t('pendingWithdrawal')}
            </p>
            <p className="text-sm sm:text-lg font-extrabold text-amber-300 font-mono mt-0.5">
              ৳{pendingCashout.toFixed(2)}
            </p>
          </div>
          <div className="bg-emerald-950/40 rounded-2xl p-3 sm:p-4 border border-emerald-800/40">
            <p className="text-[10px] sm:text-xs text-emerald-300/80 font-medium">
              {t('totalWithdrawn')}
            </p>
            <p className="text-sm sm:text-lg font-extrabold text-green-300 font-mono mt-0.5">
              ৳{totalWithdrawn.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Official Notice Alert Box */}
      <div className="rounded-2xl bg-amber-50 border border-amber-200/80 p-4 flex items-start gap-3 text-amber-900 shadow-sm">
        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm leading-relaxed">
          <span className="font-extrabold block text-amber-950 mb-0.5">
            📢 {t('noticeTitle')}:
          </span>
          <span>{t('noticeText')}</span>
        </div>
      </div>

      {/* Featured Daily Tasks */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-emerald-700" />
              <span>{t('tasksAvailable')}</span>
            </h3>
            <p className="text-xs text-gray-500">
              Complete tasks honestly to earn instant rewards
            </p>
          </div>
          <button
            onClick={() => setActiveTab('tasks')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
          >
            <span>{t('viewAll')}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {tasks.slice(0, 6).map((task) => {
            const taskTitle =
              language === 'bn' && task.titleBn ? task.titleBn : task.title;
            return (
              <div
                key={task.id}
                onClick={() => {
                  if (!currentUser) onOpenAuth();
                  else onOpenTaskModal(task);
                }}
                className="bg-white rounded-2xl p-4 border border-gray-100 hover:border-emerald-300 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {task.category}
                    </span>
                    <div className="flex items-center gap-1 text-xs font-bold text-gray-500">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      <span>{task.timeRequiredSec}s</span>
                    </div>
                  </div>

                  <h4 className="font-bold text-gray-900 text-sm group-hover:text-emerald-800 transition-colors line-clamp-2">
                    {taskTitle}
                  </h4>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-emerald-800 font-extrabold text-sm font-mono">
                    <Coins className="w-4 h-4 text-amber-500" />
                    <span>+৳{task.rewardAmount.toFixed(2)}</span>
                  </div>

                  <span className="px-3 py-1 rounded-xl bg-emerald-700 group-hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-sm">
                    {t('startTask')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Referral Teaser Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-800 to-green-700 text-white p-5 sm:p-6 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0">
            <Gift className="w-6 h-6 text-amber-300" />
          </div>
          <div>
            <h4 className="font-bold text-base sm:text-lg">
              {t('referralHeadline')}
            </h4>
            <p className="text-xs text-emerald-100/90 mt-0.5 max-w-lg">
              {t('referralSubhead')}
            </p>
          </div>
        </div>
        <button
          onClick={() => setActiveTab('referrals')}
          className="shrink-0 px-4 py-2.5 rounded-xl bg-white text-emerald-900 font-bold text-xs sm:text-sm hover:bg-emerald-50 transition-all shadow-md"
        >
          {t('yourReferralLink')}
        </button>
      </div>

      {/* Recent Transactions List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-700" />
            <span>{t('recentTransactions')}</span>
          </h3>
          <button
            onClick={() => setActiveTab('wallet')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-900"
          >
            {t('viewAll')}
          </button>
        </div>

        {transactions.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 text-center border border-gray-100 text-gray-400 text-xs">
            {t('noTransactions')}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-100 overflow-hidden">
            {transactions.slice(0, 5).map((tx) => {
              const isCredit = tx.amount > 0;
              const desc = language === 'bn' && tx.descriptionBn ? tx.descriptionBn : tx.description;
              return (
                <div key={tx.id} className="p-3.5 sm:p-4 flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <p className="text-xs sm:text-sm font-semibold text-gray-800 line-clamp-1">
                      {desc}
                    </p>
                    <p className="text-[11px] text-gray-400">
                      {new Date(tx.createdAt).toLocaleDateString()} • {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <p
                      className={`text-sm sm:text-base font-extrabold font-mono ${
                        isCredit ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {isCredit ? `+৳${tx.amount.toFixed(2)}` : `-৳${Math.abs(tx.amount).toFixed(2)}`}
                    </p>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        tx.status === 'completed'
                          ? 'bg-emerald-50 text-emerald-700'
                          : tx.status === 'pending'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      {tx.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
