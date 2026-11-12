import React, { useState } from 'react';
import {
  Wallet,
  ArrowUpRight,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Smartphone,
  ShieldCheck,
  FileText,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Transaction, WithdrawalRequest } from '../types';

interface WalletViewProps {
  transactions: Transaction[];
  withdrawals: WithdrawalRequest[];
  onOpenWithdraw: () => void;
  onOpenAuth: () => void;
}

export const WalletView: React.FC<WalletViewProps> = ({
  transactions,
  withdrawals,
  onOpenWithdraw,
  onOpenAuth,
}) => {
  const { currentUser, profile } = useAuth();
  const { language, t } = useLanguage();

  const [activeTab, setActiveTab] = useState<'transactions' | 'withdrawals'>('withdrawals');
  const [filterType, setFilterType] = useState<string>('all');

  const balance = profile?.walletBalance || 0;
  const totalEarned = profile?.totalEarned || 0;
  const pendingCashout = profile?.pendingWithdrawals || 0;
  const totalWithdrawn = profile?.totalWithdrawn || 0;

  const filteredTransactions = transactions.filter((tx) => {
    if (filterType === 'all') return true;
    if (filterType === 'earnings') return tx.type === 'task_earning' || tx.type === 'daily_bonus';
    if (filterType === 'withdrawals') return tx.type === 'withdrawal';
    if (filterType === 'referrals') return tx.type === 'referral_bonus';
    return true;
  });

  return (
    <div className="space-y-6 pb-20 md:pb-12">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <Wallet className="w-6 h-6 text-emerald-700" />
            <span>{t('myWallet')}</span>
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">{t('walletSummary')}</p>
        </div>

        <button
          onClick={() => {
            if (!currentUser) onOpenAuth();
            else onOpenWithdraw();
          }}
          className="self-start sm:self-auto px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2 hover:scale-102"
        >
          <ArrowUpRight className="w-4 h-4" />
          <span>{t('requestWithdrawal')}</span>
        </button>
      </div>

      {/* 4 Financial Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-gradient-to-br from-emerald-800 to-emerald-950 text-white rounded-3xl p-5 shadow-lg shadow-emerald-950/20 border border-emerald-700/50">
          <p className="text-xs text-emerald-300 font-medium">{t('availableBalance')}</p>
          <p className="text-2xl sm:text-3xl font-black font-mono mt-1 text-white">
            ৳{balance.toFixed(2)}
          </p>
          <span className="text-[10px] text-emerald-400 font-semibold mt-2 inline-block">
            Instant Withdrawable
          </span>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-500 font-medium">{t('totalEarned')}</p>
          <p className="text-2xl sm:text-3xl font-black font-mono mt-1 text-gray-900">
            ৳{totalEarned.toFixed(2)}
          </p>
          <span className="text-[10px] text-emerald-600 font-bold mt-2 inline-block">
            Lifetime Income
          </span>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-500 font-medium">{t('pendingWithdrawal')}</p>
          <p className="text-2xl sm:text-3xl font-black font-mono mt-1 text-amber-600">
            ৳{pendingCashout.toFixed(2)}
          </p>
          <span className="text-[10px] text-amber-600 font-bold mt-2 inline-block">
            In Verification
          </span>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-500 font-medium">{t('totalWithdrawn')}</p>
          <p className="text-2xl sm:text-3xl font-black font-mono mt-1 text-emerald-700">
            ৳{totalWithdrawn.toFixed(2)}
          </p>
          <span className="text-[10px] text-emerald-700 font-bold mt-2 inline-block">
            Received in bKash/Nagad
          </span>
        </div>
      </div>

      {/* Bangladeshi Mobile Payment Gateways Banner */}
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-green-50 rounded-3xl p-5 border border-emerald-200/80">
        <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-900 mb-3 flex items-center gap-1.5">
          <Smartphone className="w-4 h-4 text-emerald-700" />
          Supported Bangladeshi Mobile Financial Services
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white p-3 rounded-2xl border border-pink-200 shadow-sm flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-pink-100 text-pink-700 font-extrabold text-sm flex items-center justify-center">
              bK
            </div>
            <div>
              <p className="text-xs font-black text-pink-700">bKash</p>
              <p className="text-[10px] text-gray-400">Personal / Agent</p>
            </div>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-orange-200 shadow-sm flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-700 font-extrabold text-sm flex items-center justify-center">
              Ng
            </div>
            <div>
              <p className="text-xs font-black text-orange-700">Nagad</p>
              <p className="text-[10px] text-gray-400">Personal / Agent</p>
            </div>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-purple-200 shadow-sm flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 font-extrabold text-sm flex items-center justify-center">
              Rk
            </div>
            <div>
              <p className="text-xs font-black text-purple-700">Rocket</p>
              <p className="text-[10px] text-gray-400">DBBL Mobile</p>
            </div>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-blue-200 shadow-sm flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 font-extrabold text-sm flex items-center justify-center">
              Up
            </div>
            <div>
              <p className="text-xs font-black text-blue-700">Upay</p>
              <p className="text-[10px] text-gray-400">UCB Mobile</p>
            </div>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-emerald-200/60 flex items-center justify-between text-[11px] text-emerald-800 font-medium">
          <span>• Minimum Withdrawal: ৳50</span>
          <span>• Processing Fee: 0%</span>
          <span>• Payout Time: 1 - 12 Hours</span>
        </div>
      </div>

      {/* Tab Switcher: Cashout Requests vs Transaction Ledger */}
      <div className="space-y-4">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('withdrawals')}
            className={`pb-3 px-4 text-xs sm:text-sm font-extrabold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'withdrawals'
                ? 'border-emerald-700 text-emerald-800'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Withdrawals ({withdrawals.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`pb-3 px-4 text-xs sm:text-sm font-extrabold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'transactions'
                ? 'border-emerald-700 text-emerald-800'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>{t('transactionHistory')} ({transactions.length})</span>
          </button>
        </div>

        {/* Withdrawals List */}
        {activeTab === 'withdrawals' && (
          <div className="space-y-3">
            {withdrawals.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 text-center border border-gray-100 shadow-sm space-y-2">
                <p className="text-xs text-gray-400">No withdrawal requests yet.</p>
                <button
                  onClick={onOpenWithdraw}
                  className="text-xs font-bold text-emerald-700 hover:underline"
                >
                  Request your first payout →
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm divide-y divide-gray-100 overflow-hidden">
                {withdrawals.map((w) => (
                  <div
                    key={w.id}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-gray-900 uppercase">
                          {w.paymentMethod} ({w.accountType})
                        </span>
                        <span className="font-mono text-xs text-gray-500">
                          {w.accountNumber}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400">
                        Requested: {new Date(w.requestedAt).toLocaleString()}
                      </p>
                      {w.transactionId && (
                        <p className="text-xs text-emerald-800 font-mono font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block">
                          TrxID: {w.transactionId}
                        </p>
                      )}
                      {w.adminNote && (
                        <p className="text-xs text-gray-600 italic">Note: {w.adminNote}</p>
                      )}
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1.5">
                      <span className="text-base font-black font-mono text-gray-900">
                        ৳{w.payableAmount.toFixed(2)}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 ${
                          w.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : w.status === 'pending'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {w.status === 'approved' && <CheckCircle className="w-3 h-3" />}
                        {w.status === 'pending' && <Clock className="w-3 h-3" />}
                        {w.status === 'rejected' && <XCircle className="w-3 h-3" />}
                        {w.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Transactions List */}
        {activeTab === 'transactions' && (
          <div className="space-y-3">
            {/* Filter buttons */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {['all', 'earnings', 'withdrawals', 'referrals'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilterType(f)}
                  className={`px-3 py-1 rounded-full text-xs font-bold capitalize transition-all border ${
                    filterType === f
                      ? 'bg-emerald-800 text-white border-emerald-800'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {filteredTransactions.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 text-center border border-gray-100 shadow-sm text-xs text-gray-400">
                {t('noTransactions')}
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm divide-y divide-gray-100 overflow-hidden">
                {filteredTransactions.map((tx) => {
                  const isCredit = tx.amount > 0;
                  const desc =
                    language === 'bn' && tx.descriptionBn ? tx.descriptionBn : tx.description;
                  return (
                    <div
                      key={tx.id}
                      className="p-4 flex items-center justify-between gap-3"
                    >
                      <div className="space-y-0.5">
                        <p className="text-xs sm:text-sm font-bold text-gray-800">{desc}</p>
                        <p className="text-[11px] text-gray-400">
                          {new Date(tx.createdAt).toLocaleString()} • Balance after: ৳
                          {tx.balanceAfter.toFixed(2)}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <p
                          className={`text-sm sm:text-base font-extrabold font-mono ${
                            isCredit ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          {isCredit
                            ? `+৳${tx.amount.toFixed(2)}`
                            : `-৳${Math.abs(tx.amount).toFixed(2)}`}
                        </p>
                        <span className="text-[10px] text-gray-400 font-semibold uppercase">
                          {tx.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
