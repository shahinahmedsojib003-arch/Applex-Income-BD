/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { AuthModal } from './components/AuthModal';
import { DailyBonusModal } from './components/DailyBonusModal';
import { TaskDetailModal } from './components/TaskDetailModal';
import { WithdrawModal } from './components/WithdrawModal';
import { DashboardView } from './views/DashboardView';
import { TasksView } from './views/TasksView';
import { WalletView } from './views/WalletView';
import { ReferralView } from './views/ReferralView';
import { ProfileView } from './views/ProfileView';
import { AdminView } from './views/AdminView';
import {
  fetchActiveTasks,
  getUserSubmissions,
  getUserWithdrawals,
  getUserTransactions,
  getUserReferrals,
  seedDefaultTasks,
} from './services/dbService';
import { Task, TaskSubmission, WithdrawalRequest, Transaction, ReferralItem } from './types';

function MainLayout() {
  const { currentUser, profile, isAdmin } = useAuth();
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [userSubmissions, setUserSubmissions] = useState<TaskSubmission[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [referrals, setReferrals] = useState<ReferralItem[]>([]);

  // Modals state
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [initialRefCode, setInitialRefCode] = useState('');
  const [isDailyBonusOpen, setIsDailyBonusOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);

  // Parse URL for ?ref= query parameter on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref && !currentUser) {
      setInitialRefCode(ref.toUpperCase());
      setAuthMode('register');
      setIsAuthOpen(true);
    }
  }, [currentUser]);

  // Load active tasks
  const refreshTasks = async () => {
    try {
      const active = await fetchActiveTasks();
      setTasks(active);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    }
  };

  // Load user data
  const refreshUserData = async () => {
    if (!currentUser) {
      setUserSubmissions([]);
      setWithdrawals([]);
      setTransactions([]);
      setReferrals([]);
      return;
    }

    try {
      const [subs, wds, txs, refs] = await Promise.all([
        getUserSubmissions(currentUser.uid),
        getUserWithdrawals(currentUser.uid),
        getUserTransactions(currentUser.uid),
        getUserReferrals(currentUser.uid),
      ]);
      setUserSubmissions(subs);
      setWithdrawals(wds);
      setTransactions(txs);
      setReferrals(refs);
    } catch (err) {
      console.error('Error fetching user data:', err);
    }
  };

  useEffect(() => {
    refreshTasks();
  }, []);

  useEffect(() => {
    refreshUserData();
  }, [currentUser]);

  const handleOpenTask = (task: Task) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 flex flex-col font-sans selection:bg-emerald-200 selection:text-emerald-900">
      {/* Top Navbar */}
      <Navbar
        onOpenAuth={() => {
          setAuthMode('login');
          setIsAuthOpen(true);
        }}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenDailyBonus={() => setIsDailyBonusOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            tasks={tasks}
            transactions={transactions}
            onOpenTaskModal={handleOpenTask}
            onOpenWithdraw={() => setIsWithdrawOpen(true)}
            onOpenDailyBonus={() => setIsDailyBonusOpen(true)}
            onOpenAuth={() => {
              setAuthMode('login');
              setIsAuthOpen(true);
            }}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'tasks' && (
          <TasksView
            tasks={tasks}
            userSubmissions={userSubmissions}
            onOpenTaskModal={handleOpenTask}
            onOpenAuth={() => {
              setAuthMode('login');
              setIsAuthOpen(true);
            }}
          />
        )}

        {activeTab === 'wallet' && (
          <WalletView
            transactions={transactions}
            withdrawals={withdrawals}
            onOpenWithdraw={() => setIsWithdrawOpen(true)}
            onOpenAuth={() => {
              setAuthMode('login');
              setIsAuthOpen(true);
            }}
          />
        )}

        {activeTab === 'referrals' && (
          <ReferralView
            referrals={referrals}
            onOpenAuth={() => {
              setAuthMode('register');
              setIsAuthOpen(true);
            }}
          />
        )}

        {activeTab === 'profile' && <ProfileView />}

        {activeTab === 'admin' && (
          <AdminView
            tasks={tasks}
            onRefreshData={() => {
              refreshTasks();
              refreshUserData();
            }}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={() => {
          setAuthMode('login');
          setIsAuthOpen(true);
        }}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialMode={authMode}
        initialRefCode={initialRefCode}
      />

      {/* Daily Bonus Modal */}
      <DailyBonusModal
        isOpen={isDailyBonusOpen}
        onClose={() => setIsDailyBonusOpen(false)}
        onSuccessClaim={refreshUserData}
      />

      {/* Task Detail Modal */}
      <TaskDetailModal
        task={selectedTask}
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSubmittedSuccess={() => {
          refreshUserData();
          refreshTasks();
        }}
        onOpenAuth={() => {
          setAuthMode('login');
          setIsAuthOpen(true);
        }}
      />

      {/* Withdraw Modal */}
      <WithdrawModal
        isOpen={isWithdrawOpen}
        onClose={() => setIsWithdrawOpen(false)}
        onWithdrawSuccess={refreshUserData}
      />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <MainLayout />
      </AuthProvider>
    </LanguageProvider>
  );
}
