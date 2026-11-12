import React, { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  Shield,
  Smartphone,
  CheckCircle,
  Save,
  Globe,
  LogOut,
  Calendar,
  Lock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export const ProfileView: React.FC = () => {
  const { currentUser, profile, updateUserContact, logout, resetPassword, isAdmin } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const [displayName, setDisplayName] = useState(profile?.displayName || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [bkash, setBkash] = useState(profile?.paymentNumbers?.bkash || '');
  const [nagad, setNagad] = useState(profile?.paymentNumbers?.nagad || '');
  const [rocket, setRocket] = useState(profile?.paymentNumbers?.rocket || '');

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  if (!currentUser || !profile) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      await updateUserContact(displayName, phone, {
        bkash: bkash.trim(),
        nagad: nagad.trim(),
        rocket: rocket.trim(),
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleResetPass = async () => {
    if (!currentUser.email) return;
    try {
      await resetPassword(currentUser.email);
      setResetSent(true);
      setTimeout(() => setResetSent(false), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-20 md:pb-12">
      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-600 to-green-400 p-1 shadow-md shadow-emerald-500/20">
          <div className="w-full h-full bg-emerald-950 rounded-[20px] flex items-center justify-center text-white text-3xl font-black">
            {profile.displayName ? profile.displayName.charAt(0).toUpperCase() : 'U'}
          </div>
        </div>

        <div className="space-y-1 flex-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h3 className="text-xl font-extrabold text-gray-900">{profile.displayName}</h3>
            <span
              className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full border ${
                isAdmin
                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200'
              }`}
            >
              {isAdmin ? '🛡️ Administrator' : 'Verified Earner'}
            </span>
          </div>

          <p className="text-xs text-gray-500 flex items-center justify-center sm:justify-start gap-1">
            <Mail className="w-3.5 h-3.5" />
            <span>{currentUser.email}</span>
          </p>

          <p className="text-[11px] text-gray-400 flex items-center justify-center sm:justify-start gap-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>
              {t('memberSince')}: {new Date(profile.createdAt).toLocaleDateString()}
            </span>
          </p>
        </div>
      </div>

      {/* Edit Form */}
      <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-6">
        <h4 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
          <User className="w-5 h-5 text-emerald-700" />
          <span>{t('accountOverview')}</span>
        </h4>

        {saveSuccess && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>{t('profileUpdated')}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">{t('fullName')}</label>
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">{t('phone')}</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="017XXXXXXXX"
              className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Default Payment Accounts Preset */}
        <div className="pt-2 border-t border-gray-100 space-y-3">
          <div>
            <h5 className="text-xs font-extrabold uppercase tracking-wider text-gray-700">
              {t('linkedWallets')}
            </h5>
            <p className="text-[11px] text-gray-400">
              Save your mobile account numbers to auto-fill them when withdrawing.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-pink-700 mb-1">
                {t('bkashNumber')}
              </label>
              <input
                type="tel"
                value={bkash}
                onChange={(e) => setBkash(e.target.value)}
                placeholder="01XXXXXXXXX"
                className="w-full px-3 py-2 text-xs font-mono border border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-orange-700 mb-1">
                {t('nagadNumber')}
              </label>
              <input
                type="tel"
                value={nagad}
                onChange={(e) => setNagad(e.target.value)}
                placeholder="01XXXXXXXXX"
                className="w-full px-3 py-2 text-xs font-mono border border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-purple-700 mb-1">
                {t('rocketNumber')}
              </label>
              <input
                type="tel"
                value={rocket}
                onChange={(e) => setRocket(e.target.value)}
                placeholder="01XXXXXXXXX"
                className="w-full px-3 py-2 text-xs font-mono border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Language Selection Setting */}
        <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-emerald-700" />
            <span className="text-xs font-bold text-gray-700">{t('languagePreference')}</span>
          </div>

          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => setLanguage('bn')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                language === 'bn'
                  ? 'bg-emerald-800 text-white border-emerald-800'
                  : 'bg-white text-gray-600 border-gray-200'
              }`}
            >
              বাংলা (Bengali)
            </button>
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                language === 'en'
                  ? 'bg-emerald-800 text-white border-emerald-800'
                  : 'bg-white text-gray-600 border-gray-200'
              }`}
            >
              English
            </button>
          </div>
        </div>

        {/* Password Reset */}
        <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-gray-500" />
            <span className="text-xs font-bold text-gray-700">Account Security</span>
          </div>
          <button
            type="button"
            onClick={handleResetPass}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-900 hover:underline"
          >
            {resetSent ? 'Check email for link!' : 'Send Password Reset Email'}
          </button>
        </div>

        {/* Save Changes Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 hover:scale-101"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? t('loading') : t('saveChanges')}</span>
          </button>
        </div>
      </form>

      {/* Logout Card */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center justify-between">
        <div>
          <h5 className="text-sm font-bold text-gray-800">{t('logout')}</h5>
          <p className="text-xs text-gray-400">End your current session safely</p>
        </div>
        <button
          onClick={logout}
          className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-colors flex items-center gap-1.5"
        >
          <LogOut className="w-4 h-4" />
          <span>{t('logout')}</span>
        </button>
      </div>
    </div>
  );
};
