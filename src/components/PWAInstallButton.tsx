import React, { useState } from 'react';
import { Download, Smartphone, Share, PlusSquare, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { useLanguage } from '../context/LanguageContext';

interface PWAInstallButtonProps {
  variant?: 'header' | 'banner';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'header' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const { t } = useLanguage();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  // Never show when already running as an installed standalone PWA
  if (isInstalled) {
    return null;
  }

  // Only show when browser supports install prompt or user is on iOS Safari
  if (!isInstallable && !isIOS) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      await install();
    } else if (isIOS) {
      setShowIOSGuide(true);
    }
  };

  const iosModal = showIOSGuide ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/80 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-3xl bg-white text-gray-900 shadow-2xl border border-emerald-100 overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-900 to-green-800 px-5 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img
              src="/pwa-192x192.png"
              alt="Applex BD"
              className="w-8 h-8 rounded-lg shadow-sm"
            />
            <h3 className="text-base font-extrabold">{t('installIOSGuideTitle')}</h3>
          </div>
          <button
            onClick={() => setShowIOSGuide(false)}
            className="p-1 rounded-full bg-emerald-950/50 hover:bg-emerald-950 text-emerald-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-3 text-xs sm:text-sm text-gray-700">
          <div className="flex items-start gap-3 p-3 rounded-2xl bg-emerald-50 border border-emerald-100">
            <Share className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <p className="font-medium">{t('installIOSStep1')}</p>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-2xl bg-emerald-50 border border-emerald-100">
            <PlusSquare className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <p className="font-medium">{t('installIOSStep2')}</p>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-2xl bg-gray-50 border border-gray-200">
            <Smartphone className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <p className="font-medium">{t('installIOSStep3')}</p>
          </div>

          <button
            onClick={() => setShowIOSGuide(false)}
            className="mt-2 w-full py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs transition-colors"
          >
            {t('close')}
          </button>
        </div>
      </div>
    </div>
  ) : null;

  if (variant === 'banner') {
    if (bannerDismissed) return iosModal;

    return (
      <>
        <div className="mb-5 rounded-2xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-green-800 text-white p-3.5 sm:p-4 shadow-md border border-emerald-700/60 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src="/pwa-192x192.png"
              alt="Applex Income BD"
              className="w-11 h-11 rounded-xl shadow-md shrink-0 border border-emerald-400/40"
            />
            <div className="min-w-0">
              <h4 className="text-xs sm:text-sm font-extrabold truncate">
                {t('installAppBannerTitle')}
              </h4>
              <p className="text-[11px] text-emerald-100/90 line-clamp-2 sm:line-clamp-1">
                {t('installAppBannerDesc')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleInstallClick}
              className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-white text-emerald-900 hover:bg-emerald-50 font-extrabold text-xs flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t('installNow')}</span>
            </button>
            <button
              onClick={() => setBannerDismissed(true)}
              aria-label={t('close')}
              className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-950/50 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        {iosModal}
      </>
    );
  }

  return (
    <>
      <button
        onClick={handleInstallClick}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 text-emerald-100 text-xs font-bold transition-all shadow-sm"
        title={t('installApp')}
      >
        <Download className="w-3.5 h-3.5 text-emerald-300" />
        <span className="hidden sm:inline">{t('installApp')}</span>
      </button>
      {iosModal}
    </>
  );
};
