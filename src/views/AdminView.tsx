import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Users,
  CheckSquare,
  ArrowUpRight,
  TrendingUp,
  FileCheck,
  Plus,
  Trash2,
  Check,
  X,
  Search,
  AlertCircle,
  Clock,
  Coins,
  ExternalLink,
  Sparkles,
  Ban,
  DollarSign,
  Smartphone,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  Task,
  TaskSubmission,
  WithdrawalRequest,
  Transaction,
  UserProfile,
  ReferralItem,
  TaskCategory,
  TaskProofType,
} from '../types';
import {
  getAllUsers,
  getAllSubmissions,
  getAllWithdrawals,
  getAllTransactions,
  getAllReferrals,
  reviewTaskSubmission,
  approveWithdrawal,
  rejectWithdrawal,
  createTask,
  deleteTask,
  updateTask,
  toggleUserBanStatus,
  adjustUserBalance,
  seedDefaultTasks,
} from '../services/dbService';

interface AdminViewProps {
  tasks: Task[];
  onRefreshData: () => void;
}

export const AdminView: React.FC<AdminViewProps> = ({ tasks, onRefreshData }) => {
  const { currentUser, isAdmin } = useAuth();
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'submissions' | 'withdrawals' | 'tasks' | 'users' | 'transactions' | 'referrals'
  >('overview');

  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [allSubmissions, setAllSubmissions] = useState<TaskSubmission[]>([]);
  const [allWithdrawals, setAllWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [allReferrals, setAllReferrals] = useState<ReferralItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionSuccess, setActionSuccess] = useState<string>('');
  const [actionError, setActionError] = useState<string>('');

  // Task creation state
  const [showCreateTask, setShowCreateTask] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTitleBn, setNewTitleBn] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState<TaskCategory>('visit');
  const [newReward, setNewReward] = useState('10');
  const [newTime, setNewTime] = useState('30');
  const [newUrl, setNewUrl] = useState('https://');
  const [newProofType, setNewProofType] = useState<TaskProofType>('code');
  const [newVerificationCode, setNewVerificationCode] = useState('');
  const [newQuizQ, setNewQuizQ] = useState('');
  const [newQuizAns, setNewQuizAns] = useState('');

  // Search queries
  const [userSearch, setUserSearch] = useState('');

  // Withdrawal approval state
  const [approvingWithdrawalId, setApprovingWithdrawalId] = useState<string | null>(null);
  const [inputTrxId, setInputTrxId] = useState('');

  // Withdrawal rejection state
  const [rejectingWithdrawalId, setRejectingWithdrawalId] = useState<string | null>(null);
  const [inputRejectReason, setInputRejectReason] = useState('');

  // Balance adjustment modal
  const [adjustingUser, setAdjustingUser] = useState<UserProfile | null>(null);
  const [adjustAmount, setAdjustAmount] = useState('50');
  const [adjustReason, setAdjustReason] = useState('Manual bonus');

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [u, s, w, tx, r] = await Promise.all([
        getAllUsers(),
        getAllSubmissions(),
        getAllWithdrawals(),
        getAllTransactions(),
        getAllReferrals(),
      ]);
      setAllUsers(u);
      setAllSubmissions(s);
      setAllWithdrawals(w);
      setAllTransactions(tx);
      setAllReferrals(r);
    } catch (err: any) {
      console.error('Admin data load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadAdminData();
    }
  }, [isAdmin]);

  const notify = (msg: string) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(''), 4000);
    loadAdminData();
    onRefreshData();
  };

  const notifyError = (msg: string) => {
    setActionError(msg);
    setTimeout(() => setActionError(''), 4000);
  };

  // Seed default tasks
  const handleSeedTasks = async () => {
    try {
      await seedDefaultTasks();
      notify('Default Bangladeshi tasks seeded successfully!');
    } catch (err: any) {
      notifyError(err.message || 'Failed to seed tasks');
    }
  };

  // Create task
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createTask({
        title: newTitle.trim(),
        titleBn: newTitleBn.trim() || undefined,
        description: newDesc.trim(),
        category: newCategory,
        rewardAmount: parseFloat(newReward) || 10,
        timeRequiredSec: parseInt(newTime) || 30,
        targetUrl: newUrl.trim(),
        proofType: newProofType,
        verificationCode: newProofType === 'code' ? newVerificationCode.trim() : undefined,
        quizQuestion: newProofType === 'quiz' ? newQuizQ.trim() : undefined,
        quizAnswer: newProofType === 'quiz' ? newQuizAns.trim() : undefined,
        status: 'active',
        maxSubmissions: 1000,
      });

      setShowCreateTask(false);
      // Reset form
      setNewTitle('');
      setNewTitleBn('');
      setNewDesc('');
      setNewVerificationCode('');
      setNewQuizQ('');
      setNewQuizAns('');
      notify('New task created successfully!');
    } catch (err: any) {
      notifyError(err.message || 'Failed to create task');
    }
  };

  // Submission review
  const handleReviewSubmission = async (subId: string, approved: boolean) => {
    try {
      await reviewTaskSubmission(subId, approved);
      notify(approved ? 'Submission approved and reward credited!' : 'Submission rejected.');
    } catch (err: any) {
      notifyError(err.message || 'Failed to review submission');
    }
  };

  // Withdrawal approve
  const handleApproveWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!approvingWithdrawalId || !inputTrxId.trim()) return;
    try {
      await approveWithdrawal(approvingWithdrawalId, inputTrxId.trim());
      setApprovingWithdrawalId(null);
      setInputTrxId('');
      notify('Withdrawal approved and marked as paid!');
    } catch (err: any) {
      notifyError(err.message || 'Failed to approve withdrawal');
    }
  };

  // Withdrawal reject
  const handleRejectWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingWithdrawalId) return;
    try {
      await rejectWithdrawal(rejectingWithdrawalId, inputRejectReason.trim() || 'Invalid details');
      setRejectingWithdrawalId(null);
      setInputRejectReason('');
      notify('Withdrawal rejected and amount refunded to user balance.');
    } catch (err: any) {
      notifyError(err.message || 'Failed to reject withdrawal');
    }
  };

  // Toggle user ban
  const handleToggleBan = async (user: UserProfile) => {
    try {
      await toggleUserBanStatus(user.uid, user.status);
      notify(`User ${user.status === 'active' ? 'banned' : 'unbanned'} successfully!`);
    } catch (err: any) {
      notifyError(err.message || 'Failed to toggle ban');
    }
  };

  // Adjust balance
  const handleAdjustBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingUser) return;
    const amount = parseFloat(adjustAmount);
    if (isNaN(amount) || amount === 0) return;
    try {
      await adjustUserBalance(adjustingUser.uid, amount, adjustReason.trim());
      setAdjustingUser(null);
      notify(`User balance adjusted by ৳${amount}`);
    } catch (err: any) {
      notifyError(err.message || 'Failed to adjust balance');
    }
  };

  // Overview stats
  const totalUsersCount = allUsers.length;
  const pendingSubmissionsCount = allSubmissions.filter((s) => s.status === 'pending').length;
  const pendingWithdrawalsCount = allWithdrawals.filter((w) => w.status === 'pending').length;
  const totalPayout = allWithdrawals
    .filter((w) => w.status === 'approved')
    .reduce((sum, w) => sum + (w.payableAmount || 0), 0);

  if (!isAdmin) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm space-y-3">
        <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto" />
        <h3 className="text-lg font-bold text-gray-900">Access Restricted</h3>
        <p className="text-xs text-gray-500 max-w-sm mx-auto">{t('adminAccessOnly')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 md:pb-12">
      {/* Admin Top Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-green-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-800/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-extrabold tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40">
                Super Admin Access
              </span>
              <span className="text-xs text-emerald-400 font-mono">
                {currentUser?.email}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight mt-1">
              {t('adminDashboard')}
            </h2>
            <p className="text-xs text-emerald-200/80 mt-0.5">{t('adminNotice')}</p>
          </div>

          <button
            onClick={loadAdminData}
            className="self-start sm:self-auto px-4 py-2 rounded-xl bg-emerald-900/80 hover:bg-emerald-800 border border-emerald-700 text-xs font-bold text-emerald-200 flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Data</span>
          </button>
        </div>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-emerald-800/60">
          <div className="bg-emerald-900/40 rounded-2xl p-4 border border-emerald-800/40">
            <p className="text-xs text-emerald-300/80 font-medium">{t('statTotalUsers')}</p>
            <p className="text-2xl sm:text-3xl font-black font-mono mt-1 text-white">
              {totalUsersCount}
            </p>
          </div>
          <div className="bg-emerald-900/40 rounded-2xl p-4 border border-emerald-800/40">
            <p className="text-xs text-emerald-300/80 font-medium">{t('statTotalPayout')}</p>
            <p className="text-2xl sm:text-3xl font-black font-mono mt-1 text-green-300">
              ৳{totalPayout.toFixed(2)}
            </p>
          </div>
          <div className="bg-emerald-900/40 rounded-2xl p-4 border border-emerald-800/40">
            <p className="text-xs text-amber-300/80 font-medium">
              {t('statPendingWithdrawals')}
            </p>
            <p className="text-2xl sm:text-3xl font-black font-mono mt-1 text-amber-300">
              {pendingWithdrawalsCount}
            </p>
          </div>
          <div className="bg-emerald-900/40 rounded-2xl p-4 border border-emerald-800/40">
            <p className="text-xs text-emerald-300/80 font-medium">
              {t('statPendingSubmissions')}
            </p>
            <p className="text-2xl sm:text-3xl font-black font-mono mt-1 text-emerald-300">
              {pendingSubmissionsCount}
            </p>
          </div>
        </div>
      </div>

      {/* Global Alerts */}
      {actionSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-bold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{actionSuccess}</span>
        </div>
      )}
      {actionError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Admin Tab Navigation */}
      <div className="flex border-b border-gray-200 overflow-x-auto scrollbar-none gap-2">
        {[
          { id: 'overview', label: 'Overview', icon: TrendingUp },
          { id: 'withdrawals', label: `${t('tabWithdrawals')} (${pendingWithdrawalsCount})`, icon: ArrowUpRight },
          { id: 'submissions', label: `${t('tabSubmissions')} (${pendingSubmissionsCount})`, icon: FileCheck },
          { id: 'tasks', label: t('tabTasks'), icon: CheckSquare },
          { id: 'users', label: `${t('tabUsers')} (${totalUsersCount})`, icon: Users },
          { id: 'referrals', label: 'Referrals Tree', icon: Sparkles },
          { id: 'transactions', label: t('tabTransactions'), icon: DollarSign },
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 px-3 text-xs sm:text-sm font-extrabold whitespace-nowrap transition-all border-b-2 flex items-center gap-1.5 ${
                isSelected
                  ? 'border-emerald-700 text-emerald-800'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* =============================================================== */}
      {/* TAB 1: OVERVIEW */}
      {/* =============================================================== */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Quick Action: Seed Default Tasks */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-3">
              <h4 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                <span>Quick Setup: Bangladeshi Tasks</span>
              </h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Automatically seed 6 high-converting daily tasks designed for Bangladesh users
                (YouTube Subscribe, News Visit, Facebook, General Knowledge Quiz, Telegram Channel, App Review).
              </p>
              <button
                onClick={handleSeedTasks}
                className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>{t('seedTasksBtn')}</span>
              </button>
            </div>

            {/* Cashout Alerts */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-3">
              <h4 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-emerald-600" />
                <span>Pending Cashout Requests</span>
              </h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                There are currently <strong className="text-amber-600">{pendingWithdrawalsCount} pending</strong> withdrawal requests awaiting bKash / Nagad payout.
              </p>
              <button
                onClick={() => setActiveTab('withdrawals')}
                className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>Review Cashouts Now</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =============================================================== */}
      {/* TAB 2: WITHDRAWAL CASHOUTS */}
      {/* =============================================================== */}
      {activeTab === 'withdrawals' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-gray-900">
              Manage Bangladeshi Cashout Requests
            </h3>
            <span className="text-xs text-gray-500">
              Total: {allWithdrawals.length} requests
            </span>
          </div>

          {allWithdrawals.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-gray-100 shadow-sm text-xs text-gray-400">
              No withdrawal requests recorded yet.
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm divide-y divide-gray-100 overflow-hidden">
              {allWithdrawals.map((w) => (
                <div
                  key={w.id}
                  className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-gray-900 uppercase">
                        {w.paymentMethod} ({w.accountType})
                      </span>
                      <span className="font-mono text-sm font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                        {w.accountNumber}
                      </span>
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                          w.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : w.status === 'pending'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {w.status}
                      </span>
                    </div>

                    <p className="text-xs text-gray-500">
                      User: <strong>{w.userEmail}</strong> • Requested:{' '}
                      {new Date(w.requestedAt).toLocaleString()}
                    </p>

                    {w.transactionId && (
                      <p className="text-xs font-mono font-bold text-emerald-800">
                        Paid TrxID: {w.transactionId}
                      </p>
                    )}
                    {w.adminNote && (
                      <p className="text-xs text-gray-600 italic">Note: {w.adminNote}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 self-end md:self-auto">
                    <div className="text-right mr-2">
                      <p className="text-lg font-black font-mono text-gray-900">
                        ৳{w.payableAmount.toFixed(2)}
                      </p>
                      <span className="text-[10px] text-gray-400">Fee: ৳0.00</span>
                    </div>

                    {w.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => setApprovingWithdrawalId(w.id)}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-sm transition-all"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Pay & Approve</span>
                        </button>
                        <button
                          onClick={() => setRejectingWithdrawalId(w.id)}
                          className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs flex items-center gap-1 transition-all"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Reject & Refund</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Payout Approval Modal */}
      {approvingWithdrawalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <form
            onSubmit={handleApproveWithdrawal}
            className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl space-y-4 text-gray-800"
          >
            <h4 className="text-base font-extrabold text-gray-900">{t('processWithdrawal')}</h4>
            <p className="text-xs text-gray-500">
              Send the money via your bKash/Nagad Merchant or Personal app, then enter the transaction ID below.
            </p>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {t('enterTrxId')}
              </label>
              <input
                type="text"
                required
                value={inputTrxId}
                onChange={(e) => setInputTrxId(e.target.value.toUpperCase())}
                placeholder="e.g. BL92KJ791"
                className="w-full px-3.5 py-2 text-sm uppercase font-mono font-bold border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setApprovingWithdrawalId(null)}
                className="flex-1 py-2 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-xl"
              >
                {t('cancel')}
              </button>
              <button
                type="submit"
                className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
              >
                {t('confirmPayout')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Payout Rejection Modal */}
      {rejectingWithdrawalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <form
            onSubmit={handleRejectWithdrawal}
            className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl space-y-4 text-gray-800"
          >
            <h4 className="text-base font-extrabold text-rose-700">Reject Withdrawal</h4>
            <p className="text-xs text-gray-500">
              The withdrawal amount will be instantly refunded to the user's available wallet balance.
            </p>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Reason for Rejection:
              </label>
              <input
                type="text"
                required
                value={inputRejectReason}
                onChange={(e) => setInputRejectReason(e.target.value)}
                placeholder="e.g. Invalid account number / suspicious activity"
                className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectingWithdrawalId(null)}
                className="flex-1 py-2 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-xl"
              >
                {t('cancel')}
              </button>
              <button
                type="submit"
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
              >
                {t('rejectAndRefund')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =============================================================== */}
      {/* TAB 3: PROOF REVIEWS */}
      {/* =============================================================== */}
      {activeTab === 'submissions' && (
        <div className="space-y-4">
          <h3 className="text-base font-extrabold text-gray-900">Review Task Submissions</h3>

          {allSubmissions.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-gray-100 shadow-sm text-xs text-gray-400">
              No submissions to review yet.
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm divide-y divide-gray-100 overflow-hidden">
              {allSubmissions.map((sub) => (
                <div
                  key={sub.id}
                  className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 max-w-xl">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-gray-900">{sub.taskTitle}</h4>
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                          sub.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : sub.status === 'pending'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {sub.status}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-200">
                      <p className="text-xs font-mono text-gray-700 font-semibold break-all">
                        Proof: {sub.proofContent}
                      </p>
                    </div>

                    <p className="text-[11px] text-gray-400">
                      User: <strong>{sub.userEmail}</strong> • Submitted:{' '}
                      {new Date(sub.submittedAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 self-end md:self-auto">
                    <span className="font-black font-mono text-base text-emerald-700 mr-2">
                      +৳{sub.rewardAmount.toFixed(2)}
                    </span>

                    {sub.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleReviewSubmission(sub.id, true)}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-sm transition-all"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve & Credit</span>
                        </button>
                        <button
                          onClick={() => handleReviewSubmission(sub.id, false)}
                          className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs flex items-center gap-1 transition-all"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =============================================================== */}
      {/* TAB 4: TASKS MANAGER */}
      {/* =============================================================== */}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-gray-900">Active Task Catalog</h3>
            <button
              onClick={() => setShowCreateTask(true)}
              className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>{t('addNewTask')}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {task.category}
                    </span>
                    <span className="text-xs text-gray-400 font-mono">
                      {task.completedCount || 0} / {task.maxSubmissions || '∞'} completed
                    </span>
                  </div>

                  <h4 className="font-extrabold text-sm text-gray-900">{task.title}</h4>
                  {task.titleBn && (
                    <p className="text-xs text-gray-500 mt-0.5">{task.titleBn}</p>
                  )}
                  <p className="text-xs text-gray-600 mt-2 line-clamp-2">{task.description}</p>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="font-black font-mono text-emerald-700 text-sm">
                    +৳{task.rewardAmount.toFixed(2)} ({task.timeRequiredSec}s)
                  </span>

                  <button
                    onClick={async () => {
                      if (confirm('Are you sure you want to delete this task?')) {
                        await deleteTask(task.id);
                        notify('Task deleted');
                      }
                    }}
                    className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Create Task Modal */}
          {showCreateTask && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
              <form
                onSubmit={handleCreateTask}
                className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto text-gray-800"
              >
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                  <h4 className="text-base font-extrabold text-gray-900">
                    {t('createTaskModalTitle')}
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowCreateTask(false)}
                    className="p-1 text-gray-400 hover:text-gray-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {t('taskTitle')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Subscribe to Official YouTube Channel"
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {t('taskTitleBn')}
                  </label>
                  <input
                    type="text"
                    value={newTitleBn}
                    onChange={(e) => setNewTitleBn(e.target.value)}
                    placeholder="e.g. অফিসিয়াল ইউটিউব চ্যানেলে সাবস্ক্রাইব করুন"
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {t('taskDesc')} *
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="Instructions for the user..."
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      {t('taskCategory')}
                    </label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                    >
                      <option value="visit">Web Visit</option>
                      <option value="video">Watch Video</option>
                      <option value="social">Social Media</option>
                      <option value="survey">Quick Survey</option>
                      <option value="app">App Review</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      {t('taskReward')} *
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      required
                      value={newReward}
                      onChange={(e) => setNewReward(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-bold font-mono border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      {t('taskTime')} *
                    </label>
                    <input
                      type="number"
                      required
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      {t('taskProofType')}
                    </label>
                    <select
                      value={newProofType}
                      onChange={(e) => setNewProofType(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                    >
                      <option value="code">{t('proofCode')}</option>
                      <option value="timer">{t('proofTimer')}</option>
                      <option value="screenshot_text">{t('proofText')}</option>
                      <option value="quiz">{t('proofQuiz')}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {t('taskTargetUrl')} *
                  </label>
                  <input
                    type="url"
                    required
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                {newProofType === 'code' && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      {t('secretVerificationCode')} *
                    </label>
                    <input
                      type="text"
                      required
                      value={newVerificationCode}
                      onChange={(e) => setNewVerificationCode(e.target.value.toUpperCase())}
                      placeholder="e.g. TASK2026"
                      className="w-full px-3 py-2 text-xs font-mono uppercase border border-gray-300 rounded-xl"
                    />
                  </div>
                )}

                {newProofType === 'quiz' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        {t('quizQuestionInput')}
                      </label>
                      <input
                        type="text"
                        required
                        value={newQuizQ}
                        onChange={(e) => setNewQuizQ(e.target.value)}
                        placeholder="What is...?"
                        className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        {t('quizAnswerInput')}
                      </label>
                      <input
                        type="text"
                        required
                        value={newQuizAns}
                        onChange={(e) => setNewQuizAns(e.target.value)}
                        placeholder="Correct Answer"
                        className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl"
                      />
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateTask(false)}
                    className="flex-1 py-2 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-xl"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                  >
                    Create Task
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* =============================================================== */}
      {/* TAB 5: USERS MANAGER */}
      {/* =============================================================== */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-base font-extrabold text-gray-900">User Base & Accounts</h3>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm divide-y divide-gray-100 overflow-hidden">
            {allUsers
              .filter(
                (u) =>
                  u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
                  u.displayName.toLowerCase().includes(userSearch.toLowerCase())
              )
              .map((user) => (
                <div
                  key={user.uid}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-gray-900">{user.displayName}</span>
                      <span
                        className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                          user.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {user.status}
                      </span>
                      {user.role === 'admin' && (
                        <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          Admin
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400 font-mono">{user.email}</p>
                    <p className="text-gray-500">
                      Ref Code: <strong>{user.referralCode}</strong> • Phone:{' '}
                      {user.phone || 'N/A'}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <div className="text-right mr-2">
                      <p className="font-mono font-black text-sm text-gray-900">
                        Balance: ৳{(user.walletBalance || 0).toFixed(2)}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        Earned: ৳{(user.totalEarned || 0).toFixed(2)}
                      </p>
                    </div>

                    <button
                      onClick={() => setAdjustingUser(user)}
                      className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-[11px]"
                    >
                      Adjust ৳
                    </button>

                    <button
                      onClick={() => handleToggleBan(user)}
                      className={`px-2.5 py-1 rounded-lg font-bold text-[11px] border ${
                        user.status === 'active'
                          ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                          : 'bg-green-50 hover:bg-green-100 text-green-700 border-green-200'
                      }`}
                    >
                      {user.status === 'active' ? 'Ban' : 'Unban'}
                    </button>
                  </div>
                </div>
              ))}
          </div>

          {/* Adjust Balance Modal */}
          {adjustingUser && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
              <form
                onSubmit={handleAdjustBalance}
                className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl space-y-4 text-gray-800"
              >
                <h4 className="text-base font-extrabold text-gray-900">
                  Adjust Wallet Balance for {adjustingUser.displayName}
                </h4>
                <p className="text-xs text-gray-500">
                  Current Balance: ৳{(adjustingUser.walletBalance || 0).toFixed(2)}
                </p>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Amount (Enter negative to deduct, e.g. -20)
                  </label>
                  <input
                    type="number"
                    step="1"
                    required
                    value={adjustAmount}
                    onChange={(e) => setAdjustAmount(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm font-mono font-bold border border-gray-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Audit Reason</label>
                  <input
                    type="text"
                    required
                    value={adjustReason}
                    onChange={(e) => setAdjustReason(e.target.value)}
                    placeholder="e.g. Special campaign bonus"
                    className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setAdjustingUser(null)}
                    className="flex-1 py-2 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                  >
                    Apply Adjustment
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* =============================================================== */}
      {/* TAB 6: REFERRALS TREE */}
      {/* =============================================================== */}
      {activeTab === 'referrals' && (
        <div className="space-y-4">
          <h3 className="text-base font-extrabold text-gray-900">Platform Referral Tree</h3>

          {allReferrals.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-gray-100 shadow-sm text-xs text-gray-400">
              No referral partnerships formed yet.
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm divide-y divide-gray-100 overflow-hidden">
              {allReferrals.map((r) => (
                <div key={r.id} className="p-4 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-gray-800">
                      Referee: {r.referredName} ({r.referredEmail})
                    </p>
                    <p className="text-[11px] text-gray-400 font-mono">
                      Referrer UID: {r.referrerId}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-black font-mono text-emerald-700 block">
                      Commission: ৳{(r.bonusEarned || 0).toFixed(2)}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =============================================================== */}
      {/* TAB 7: TRANSACTIONS AUDIT */}
      {/* =============================================================== */}
      {activeTab === 'transactions' && (
        <div className="space-y-4">
          <h3 className="text-base font-extrabold text-gray-900">
            System Financial Audit Ledger
          </h3>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm divide-y divide-gray-100 overflow-hidden">
            {allTransactions.slice(0, 50).map((tx) => (
              <div key={tx.id} className="p-4 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <p className="font-bold text-gray-800">{tx.description}</p>
                  <p className="text-[11px] text-gray-400 font-mono">
                    User: {tx.userEmail || tx.userId} • Type: {tx.type} •{' '}
                    {new Date(tx.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className={`font-mono font-black text-sm ${
                      tx.amount > 0 ? 'text-emerald-700' : 'text-rose-700'
                    }`}
                  >
                    {tx.amount > 0 ? `+৳${tx.amount.toFixed(2)}` : `-৳${Math.abs(tx.amount).toFixed(2)}`}
                  </p>
                  <span className="text-[10px] uppercase font-bold text-gray-400">
                    {tx.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
