import React, { useState } from 'react';
import {
  Users,
  Copy,
  Check,
  Share2,
  Gift,
  Coins,
  ArrowRight,
  ShieldCheck,
  Award,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { ReferralItem } from '../types';

interface ReferralViewProps {
  referrals: ReferralItem[];
  onOpenAuth: () => void;
}

export const ReferralView: React.FC<ReferralViewProps> = ({
  referrals,
  onOpenAuth,
}) => {
  const { currentUser, profile } = useAuth();
  const { t } = useLanguage();

  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const refCode = profile?.referralCode || 'APXBD1';
  const appBaseUrl = window.location.origin;
  const referralLink = `${appBaseUrl}?ref=${refCode}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(refCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const shareText = encodeURIComponent(
    `Join Applex Income BD and earn daily money by completing simple tasks! Use my referral code: ${refCode}\n${referralLink}`
  );

  const totalBonus = referrals.reduce((acc, r) => acc + (r.bonusEarned || 0), 0);

  return (
    <div className="space-y-6 pb-20 md:pb-12">
      {/* Hero Banner */}
      <div className="relative rounded-3xl bg-gradient-to-br from-emerald-900 via-green-900 to-emerald-950 text-white p-6 sm:p-8 shadow-2xl border border-emerald-700/50 overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Applex Referral Program</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            {t('referralHeadline')}
          </h2>

          <p className="text-xs sm:text-sm text-emerald-200/90 leading-relaxed">
            {t('referralSubhead')}
          </p>
        </div>

        {/* 2 Big Stat Badges */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-6 pt-6 border-t border-emerald-800/60 max-w-md">
          <div className="bg-emerald-950/60 rounded-2xl p-3.5 border border-emerald-800/50">
            <p className="text-xs text-emerald-300/90 font-medium">
              {t('totalReferredFriends')}
            </p>
            <p className="text-2xl sm:text-3xl font-black font-mono mt-0.5 text-white">
              {referrals.length}
            </p>
          </div>
          <div className="bg-emerald-950/60 rounded-2xl p-3.5 border border-emerald-800/50">
            <p className="text-xs text-emerald-300/90 font-medium">
              {t('totalReferralEarnings')}
            </p>
            <p className="text-2xl sm:text-3xl font-black font-mono mt-0.5 text-amber-300">
              ৳{totalBonus.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Share Boxes Card */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Referral Code Box */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700">{t('yourReferralCode')}</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={refCode}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-base font-black tracking-wider uppercase font-mono text-emerald-900"
              />
              <button
                onClick={handleCopyCode}
                className="shrink-0 px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-2xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
              >
                {copiedCode ? <Check className="w-4 h-4 text-green-300" /> : <Copy className="w-4 h-4" />}
                <span>{copiedCode ? t('copied') : t('copy')}</span>
              </button>
            </div>
          </div>

          {/* Referral Link Box */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700">{t('yourReferralLink')}</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={referralLink}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-mono text-gray-600 truncate"
              />
              <button
                onClick={handleCopyLink}
                className="shrink-0 px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-2xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
              >
                {copiedLink ? <Check className="w-4 h-4 text-green-300" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? t('copied') : t('copy')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Social Share Buttons */}
        <div className="pt-2 flex flex-wrap gap-2.5">
          <a
            href={`https://api.whatsapp.com/send?text=${shareText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 min-w-[150px] py-2.5 px-4 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <Share2 className="w-4 h-4" />
            <span>{t('shareOnWhatsApp')}</span>
          </a>
          <a
            href={`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${shareText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 min-w-[150px] py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <Share2 className="w-4 h-4" />
            <span>{t('shareOnTelegram')}</span>
          </a>
        </div>
      </div>

      {/* How it works 3-step breakdown */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
        <h3 className="text-base font-extrabold text-gray-900">{t('howItWorks')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white font-black text-sm flex items-center justify-center">
              1
            </div>
            <h4 className="text-sm font-bold text-emerald-950">{t('step1Title')}</h4>
            <p className="text-xs text-emerald-900/80 leading-relaxed">{t('step1Desc')}</p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white font-black text-sm flex items-center justify-center">
              2
            </div>
            <h4 className="text-sm font-bold text-emerald-950">{t('step2Title')}</h4>
            <p className="text-xs text-emerald-900/80 leading-relaxed">{t('step2Desc')}</p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white font-black text-sm flex items-center justify-center">
              3
            </div>
            <h4 className="text-sm font-bold text-emerald-950">{t('step3Title')}</h4>
            <p className="text-xs text-emerald-900/80 leading-relaxed">{t('step3Desc')}</p>
          </div>
        </div>
      </div>

      {/* Referred Users Table */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
        <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
          <Users className="w-5 h-5 text-emerald-700" />
          <span>{t('referredUsersList')}</span>
        </h3>

        {referrals.length === 0 ? (
          <div className="py-8 text-center text-xs text-gray-400">
            {t('noReferralsYet')}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {referrals.map((r) => (
              <div
                key={r.id}
                className="py-3 flex items-center justify-between text-xs"
              >
                <div>
                  <p className="font-bold text-gray-800">{r.referredName || r.referredEmail}</p>
                  <p className="text-[11px] text-gray-400">
                    Joined: {new Date(r.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-extrabold font-mono text-emerald-700 block">
                    +৳{(r.bonusEarned || 0).toFixed(2)}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    {r.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
