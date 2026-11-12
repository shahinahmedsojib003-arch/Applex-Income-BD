import React, { useState } from 'react';
import {
  X,
  Wallet,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  Smartphone,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PaymentMethod, AccountType } from '../types';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { requestWithdrawal } from '../services/dbService';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWithdrawSuccess: () => void;
}

export const WithdrawModal: React.FC<WithdrawModalProps> = ({
  isOpen,
  onClose,
  onWithdrawSuccess,
}) => {
  const { currentUser, profile } = useAuth();
  const { t } = useLanguage();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bkash');
  const [accountType, setAccountType] = useState<AccountType>('personal');
  const [accountNumber, setAccountNumber] = useState(profile?.phone || '');
  const [amount, setAmount] = useState<string>('50');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen || !currentUser || !profile) return null;

  const minWithdrawal = 50;
  const numAmount = parseFloat(amount) || 0;
  const fee = 0; // 0% promotional fee
  const payableAmount = Math.max(0, numAmount - fee);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanNumber = accountNumber.trim().replace(/[-+ ]/g, '');
    const bdRegex = /^(?:\+?88)?01[3-9]\d{8}$/;
    if (!bdRegex.test(cleanNumber)) {
      setErrorMsg(t('invalidNumber'));
      return;
    }

    if (numAmount < minWithdrawal) {
      setErrorMsg(t('minWithdrawalNotice'));
      return;
    }

    if (numAmount > (profile.walletBalance || 0)) {
      setErrorMsg(t('insufficientBalance'));
      return;
    }

    setLoading(true);
    try {
      await requestWithdrawal(
        currentUser.uid,
        currentUser.email || '',
        paymentMethod,
        cleanNumber,
        accountType,
        numAmount
      );

      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });

      onWithdrawSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit withdrawal request.');
    } finally {
      setLoading(false);
    }
  };

  const methods: { id: PaymentMethod; name: string; color: string; border: string; bg: string }[] = [
    {
      id: 'bkash',
      name: 'bKash',
      color: 'text-pink-600',
      border: 'border-pink-500',
      bg: 'bg-pink-50',
    },
    {
      id: 'nagad',
      name: 'Nagad',
      color: 'text-orange-600',
      border: 'border-orange-500',
      bg: 'bg-orange-50',
    },
    {
      id: 'rocket',
      name: 'Rocket',
      color: 'text-purple-600',
      border: 'border-purple-500',
      bg: 'bg-purple-50',
    },
    {
      id: 'upay',
      name: 'Upay',
      color: 'text-blue-600',
      border: 'border-blue-500',
      bg: 'bg-blue-50',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-emerald-100 overflow-hidden text-gray-800">
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-emerald-800 to-green-700 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-900/60 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="text-lg font-bold tracking-tight">{t('requestWithdrawal')}</h3>
              <p className="text-xs text-emerald-100/90">
                {t('availableBalance')}: ৳{(profile.walletBalance || 0).toFixed(2)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-emerald-900/60 hover:bg-emerald-900 text-emerald-200 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">
              {t('withdrawMethod')} *
            </label>
            <div className="grid grid-cols-4 gap-2">
              {methods.map((m) => {
                const isSelected = paymentMethod === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      setPaymentMethod(m.id);
                      if (profile?.paymentNumbers?.[m.id]) {
                        setAccountNumber(profile.paymentNumbers[m.id]!);
                      }
                    }}
                    className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center ${
                      isSelected
                        ? `${m.bg} ${m.border} ring-2 ring-emerald-500 shadow-sm`
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <span className={`text-xs font-extrabold ${m.color}`}>{m.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Account Type (Personal vs Agent) */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              {t('accountType')} *
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAccountType('personal')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                  accountType === 'personal'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-1 ring-emerald-400'
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {t('personal')}
              </button>
              <button
                type="button"
                onClick={() => setAccountType('agent')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                  accountType === 'agent'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-1 ring-emerald-400'
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {t('agent')}
              </button>
            </div>
          </div>

          {/* Account Number */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              {t('accountNumber')} *
            </label>
            <div className="relative">
              <Smartphone className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                type="tel"
                required
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="017XXXXXXXX"
                className="w-full pl-9 pr-3 py-2 text-sm font-mono border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Amount and presets */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-gray-700">{t('withdrawAmount')} (৳) *</label>
              <span className="text-[11px] text-gray-500">{t('minWithdrawalNotice')}</span>
            </div>
            <input
              type="number"
              min={minWithdrawal}
              max={profile.walletBalance || 0}
              step="1"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3.5 py-2 text-base font-bold font-mono border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
            {/* Quick Preset Buttons */}
            <div className="flex gap-1.5 mt-2">
              {[50, 100, 200, 500].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAmount(String(preset))}
                  className="flex-1 py-1 px-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-700 transition-colors"
                >
                  ৳{preset}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setAmount(String(Math.floor(profile.walletBalance || 0)))}
                className="py-1 px-2.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-xs font-extrabold text-emerald-800 transition-colors"
              >
                Max
              </button>
            </div>
          </div>

          {/* Summary Box */}
          <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 space-y-1.5 text-xs">
            <div className="flex justify-between text-gray-600">
              <span>{t('withdrawAmount')}:</span>
              <span className="font-bold">৳{numAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>{t('feeCharge')}:</span>
              <span className="text-emerald-700 font-bold">৳0.00</span>
            </div>
            <div className="flex justify-between text-emerald-900 font-extrabold text-sm pt-1 border-t border-gray-200">
              <span>{t('payableAmount')}:</span>
              <span>৳{payableAmount.toFixed(2)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || (profile.walletBalance || 0) < minWithdrawal}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 hover:scale-101"
          >
            {loading ? (
              <span>{t('loading')}</span>
            ) : (
              <>
                <span>{t('confirm')}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <p className="text-[11px] text-gray-500 text-center leading-relaxed">
            {t('noticeText')}
          </p>
        </form>
      </div>
    </div>
  );
};
