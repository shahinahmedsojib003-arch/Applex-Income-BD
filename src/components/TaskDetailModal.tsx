import React, { useState, useEffect } from 'react';
import {
  X,
  ExternalLink,
  Clock,
  Coins,
  ShieldCheck,
  CheckCircle,
  HelpCircle,
  AlertTriangle,
  Play,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Task } from '../types';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { submitTaskProof } from '../services/dbService';

interface TaskDetailModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmittedSuccess: () => void;
  onOpenAuth: () => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  isOpen,
  onClose,
  onSubmittedSuccess,
  onOpenAuth,
}) => {
  const { currentUser } = useAuth();
  const { language, t } = useLanguage();

  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [timerRunning, setTimerRunning] = useState<boolean>(false);
  const [proofInput, setProofInput] = useState<string>('');
  const [quizSelection, setQuizSelection] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [hasVisited, setHasVisited] = useState<boolean>(false);

  useEffect(() => {
    if (task && isOpen) {
      setTimeLeft(task.timeRequiredSec || 15);
      setTimerRunning(false);
      setProofInput('');
      setQuizSelection('');
      setErrorMsg('');
      setHasVisited(false);
    }
  }, [task, isOpen]);

  useEffect(() => {
    let interval: any = null;
    if (timerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => Math.max(0, prev - 1));
      }, 1000);
    } else if (timeLeft === 0 && timerRunning) {
      setTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [timerRunning, timeLeft]);

  if (!isOpen || !task) return null;

  const handleOpenLink = () => {
    setHasVisited(true);
    setTimerRunning(true);
    // Open target url in new tab safely
    window.open(task.targetUrl, '_blank', 'noopener,noreferrer');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuth();
      return;
    }

    setErrorMsg('');

    // Verification validations based on proofType
    let finalProof = proofInput.trim();

    if (task.proofType === 'timer') {
      if (timeLeft > 0) {
        setErrorMsg(`Please wait ${timeLeft}s before submitting.`);
        return;
      }
      finalProof = `Timer completed (${task.timeRequiredSec}s)`;
    } else if (task.proofType === 'code') {
      if (!finalProof) {
        setErrorMsg('Please enter the secret code from the task.');
        return;
      }
      if (
        task.verificationCode &&
        finalProof.toUpperCase() !== task.verificationCode.trim().toUpperCase()
      ) {
        setErrorMsg('The verification code is incorrect. Please check again.');
        return;
      }
    } else if (task.proofType === 'quiz') {
      const selected = quizSelection || proofInput;
      if (!selected.trim()) {
        setErrorMsg('Please select or write your answer.');
        return;
      }
      finalProof = `Answer: ${selected.trim()}`;
    } else {
      if (!finalProof) {
        setErrorMsg('Please provide proof (e.g. username, screenshot URL, or details).');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      await submitTaskProof(
        task.id,
        task.title,
        task.rewardAmount,
        currentUser.uid,
        currentUser.email || '',
        finalProof
      );

      confetti({
        particleCount: 90,
        spread: 60,
        origin: { y: 0.6 },
      });

      onSubmittedSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to submit proof. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const title = language === 'bn' && task.titleBn ? task.titleBn : task.title;
  const description =
    language === 'bn' && task.descriptionBn ? task.descriptionBn : task.description;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-emerald-100 overflow-hidden text-gray-800">
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-emerald-900 to-green-800 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-700/80 text-emerald-200 border border-emerald-600">
              {task.category}
            </span>
            <div className="flex items-center gap-1 text-amber-300 font-extrabold text-lg">
              <Coins className="w-5 h-5 text-amber-400" />
              <span>+৳{task.rewardAmount.toFixed(2)}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-emerald-950/60 hover:bg-emerald-950 text-emerald-200 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[80vh] overflow-y-auto space-y-5">
          {/* Title & Description */}
          <div>
            <h3 className="text-xl font-extrabold text-gray-900 leading-snug">{title}</h3>
            <p className="text-sm text-gray-600 mt-2 whitespace-pre-line leading-relaxed">
              {description}
            </p>
          </div>

          {/* Target link button & timer status */}
          <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                <Clock className="w-4 h-4 text-emerald-700" />
                <span>
                  {t('timeRequired')}: {task.timeRequiredSec} {t('seconds')}
                </span>
              </div>
              {timerRunning ? (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-700 text-white text-xs font-mono font-bold animate-pulse">
                  <span>{timeLeft}s remaining</span>
                </div>
              ) : timeLeft === 0 && hasVisited ? (
                <div className="flex items-center gap-1 text-emerald-700 text-xs font-bold">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Time completed!</span>
                </div>
              ) : null}
            </div>

            <button
              type="button"
              onClick={handleOpenLink}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all hover:scale-101"
            >
              <ExternalLink className="w-4 h-4" />
              <span>{t('visitLink')}</span>
            </button>

            <p className="text-[11px] text-emerald-800/80 text-center italic">
              {t('stayOnPageAlert')}
            </p>
          </div>

          {/* Proof Form */}
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <h4 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              {t('proofVerification')}
            </h4>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Proof Type: CODE */}
            {task.proofType === 'code' && (
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {t('enterSecretCode')}
                </label>
                <input
                  type="text"
                  required
                  value={proofInput}
                  onChange={(e) => setProofInput(e.target.value)}
                  placeholder="e.g. NEWS-BD-2026"
                  className="w-full px-3.5 py-2.5 text-sm uppercase tracking-wider font-mono border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            )}

            {/* Proof Type: QUIZ */}
            {task.proofType === 'quiz' && (
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-2">
                <p className="text-xs font-bold text-gray-800">
                  {language === 'bn' && task.quizQuestionBn
                    ? task.quizQuestionBn
                    : task.quizQuestion || 'Answer the quiz question:'}
                </p>
                <div className="space-y-1.5 pt-1">
                  {['Taka', 'Dollar', 'Rupee', 'Riyal'].map((opt) => (
                    <label
                      key={opt}
                      className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer text-xs font-medium transition-all ${
                        quizSelection === opt
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold'
                          : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="quiz"
                        value={opt}
                        checked={quizSelection === opt}
                        onChange={(e) => setQuizSelection(e.target.value)}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Proof Type: TEXT / SCREENSHOT LINK */}
            {task.proofType === 'screenshot_text' && (
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {t('enterProofUrlText')}
                </label>
                <textarea
                  rows={3}
                  required
                  value={proofInput}
                  onChange={(e) => setProofInput(e.target.value)}
                  placeholder="e.g. My YouTube handle: @shahin_earner or Telegram: @user_bd"
                  className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            )}

            {/* Proof Type: TIMER ONLY */}
            {task.proofType === 'timer' && (
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-600 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  {timeLeft > 0
                    ? `${t('timerWaitMsg')} ${timeLeft}s`
                    : 'Timer completed! Click submit below to record your proof.'}
                </span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || (task.proofType === 'timer' && timeLeft > 0)}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 hover:scale-101"
            >
              {isSubmitting ? (
                <span>{t('loading')}</span>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>{t('submitProof')}</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
