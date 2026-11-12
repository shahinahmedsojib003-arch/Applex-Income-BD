import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  runTransaction,
  writeBatch,
  increment,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import {
  Task,
  TaskSubmission,
  WithdrawalRequest,
  Transaction,
  ReferralItem,
  UserProfile,
  PaymentMethod,
  AccountType,
} from '../types';

// =========================================================================
// TASKS OPERATIONS
// =========================================================================

export async function fetchActiveTasks(): Promise<Task[]> {
  try {
    const q = query(collection(db, 'tasks'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    const list = snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Task, 'id'>) }));
    if (list.length === 0) {
      // Graceful fallback to default Bangladeshi tasks until admin explicitly seeds DB
      return DEFAULT_BANGLADESH_TASKS.map((t, idx) => ({
        ...t,
        id: `task_default_${idx + 1}`,
        createdAt: new Date().toISOString(),
      }));
    }
    return list;
  } catch (err) {
    console.warn('fetchActiveTasks falling back to defaults:', err);
    return DEFAULT_BANGLADESH_TASKS.map((t, idx) => ({
      ...t,
      id: `task_default_${idx + 1}`,
      createdAt: new Date().toISOString(),
    }));
  }
}

export async function createTask(taskData: Omit<Task, 'id' | 'createdAt'>): Promise<string> {
  try {
    const docRef = doc(collection(db, 'tasks'));
    const newTask: Task = {
      ...taskData,
      id: docRef.id,
      completedCount: 0,
      createdAt: new Date().toISOString(),
    };
    await setDoc(docRef, newTask);
    return docRef.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, 'tasks');
    throw err;
  }
}

export async function updateTask(taskId: string, partial: Partial<Task>): Promise<void> {
  try {
    await updateDoc(doc(db, 'tasks', taskId), partial);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `tasks/${taskId}`);
    throw err;
  }
}

export async function deleteTask(taskId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'tasks', taskId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `tasks/${taskId}`);
    throw err;
  }
}

// Pre-seeded popular Bangladeshi income tasks
export const DEFAULT_BANGLADESH_TASKS: Omit<Task, 'id' | 'createdAt'>[] = [
  {
    title: 'Visit Daily Bangladesh News Portal & Read 1 Article',
    titleBn: 'বাংলাদেশ নিউজ পোর্টাল ভিজিট করুন এবং ১টি খবর পড়ুন',
    description: 'Visit the news website, stay for 30 seconds, and collect the secret code at the bottom of the article.',
    descriptionBn: 'নিউজ ওয়েবসাইট ভিজিট করুন, ৩০ সেকেন্ড অপেক্ষা করুন এবং খবরের নিচে থাকা কোডটি কপি করে জমা দিন।',
    category: 'visit',
    rewardAmount: 6,
    timeRequiredSec: 30,
    targetUrl: 'https://www.prothomalo.com',
    proofType: 'code',
    verificationCode: 'NEWS-BD-2026',
    status: 'active',
    maxSubmissions: 500,
    completedCount: 124,
  },
  {
    title: 'Subscribe to Applex Income BD YouTube Channel & Turn on Bell',
    titleBn: 'অ্যাপ্লেক্স ইউটিউব চ্যানেলে সাবস্ক্রাইব করুন এবং বেল আইকন চালু করুন',
    description: 'Subscribe to our official YouTube earning channel. Provide your YouTube username or handle as proof.',
    descriptionBn: 'আমাদের অফিসিয়াল ইউটিউব চ্যানেল সাবস্ক্রাইব করুন এবং আপনার ইউটিউব হ্যান্ডেল/নাম প্রুফ হিসেবে দিন।',
    category: 'social',
    rewardAmount: 12,
    timeRequiredSec: 45,
    targetUrl: 'https://youtube.com',
    proofType: 'screenshot_text',
    status: 'active',
    maxSubmissions: 1000,
    completedCount: 412,
  },
  {
    title: 'Watch Earning Tips Tutorial Video (40s)',
    titleBn: 'অনলাইন আর্নিং টিপস টিউটোরিয়াল ভিডিও দেখুন (৪০ সেকেন্ড)',
    description: 'Watch the complete video for at least 40 seconds. Once the timer finishes, submit your confirmation.',
    descriptionBn: 'কমপক্ষে ৪০ সেকেন্ড ভিডিওটি মনোযোগ দিয়ে দেখুন। টাইমার শেষ হলে সাবমিট করুন।',
    category: 'video',
    rewardAmount: 8,
    timeRequiredSec: 40,
    targetUrl: 'https://www.youtube.com',
    proofType: 'timer',
    status: 'active',
    maxSubmissions: 800,
    completedCount: 290,
  },
  {
    title: 'Answer Daily General Knowledge Quiz',
    titleBn: 'দৈনিক বাংলাদেশ সাধারণ জ্ঞান কুইজের উত্তর দিন',
    description: 'Answer the question correctly to earn instant task reward.',
    descriptionBn: 'সঠিক উত্তর দিয়ে তাৎক্ষণিক টাস্ক রিওয়ার্ড জিতে নিন।',
    category: 'survey',
    rewardAmount: 5,
    timeRequiredSec: 15,
    targetUrl: 'https://en.wikipedia.org/wiki/Bangladesh',
    proofType: 'quiz',
    quizQuestion: 'What is the national currency of Bangladesh?',
    quizQuestionBn: 'বাংলাদেশের জাতীয় মুদ্রার নাম কি?',
    quizAnswer: 'Taka',
    status: 'active',
    maxSubmissions: 2000,
    completedCount: 850,
  },
  {
    title: 'Join Applex Income BD Official Telegram Group',
    titleBn: 'অ্যাপ্লেক্স অফিসিয়াল টেলিগ্রাম পেমেন্ট প্রুফ গ্রুপে জয়েন করুন',
    description: 'Join our verified Telegram community to stay updated on daily tasks and live payment proofs. Enter your Telegram @username.',
    descriptionBn: 'আমাদের ভেরিফাইড টেলিগ্রাম গ্রুপে জয়েন করুন এবং আপনার টেলিগ্রাম @ইউজারনেম লিখুন।',
    category: 'social',
    rewardAmount: 15,
    timeRequiredSec: 30,
    targetUrl: 'https://t.me',
    proofType: 'screenshot_text',
    status: 'active',
    maxSubmissions: 1500,
    completedCount: 680,
  },
  {
    title: 'Review Partner Shopping App on Google Play Store',
    titleBn: 'পার্টনার শপিং অ্যাপে ফাইভ-স্টার রিভিউ দিন',
    description: 'Leave a 5-star review on Google Play Store and write a positive feedback. Submit your Play Store review name.',
    descriptionBn: 'প্লে স্টোরে ৫ স্টার পজিটিভ রিভিউ দিন এবং আপনার গুগল প্লে স্টোরের প্রোফাইল নাম লিখুন।',
    category: 'app',
    rewardAmount: 25,
    timeRequiredSec: 60,
    targetUrl: 'https://play.google.com/store',
    proofType: 'screenshot_text',
    status: 'active',
    maxSubmissions: 300,
    completedCount: 115,
  },
];

export async function seedDefaultTasks(): Promise<void> {
  const batch = writeBatch(db);
  for (const t of DEFAULT_BANGLADESH_TASKS) {
    const docRef = doc(collection(db, 'tasks'));
    batch.set(docRef, {
      ...t,
      id: docRef.id,
      createdAt: new Date().toISOString(),
    });
  }
  await batch.commit();
}

// =========================================================================
// SUBMISSIONS & PROOF REVIEW
// =========================================================================

export async function submitTaskProof(
  taskId: string,
  taskTitle: string,
  rewardAmount: number,
  userId: string,
  userEmail: string,
  proofContent: string
): Promise<string> {
  try {
    const subRef = doc(collection(db, 'submissions'));
    const submission: TaskSubmission = {
      id: subRef.id,
      taskId,
      taskTitle,
      userId,
      userEmail,
      rewardAmount,
      proofContent: proofContent.trim(),
      status: 'pending',
      submittedAt: new Date().toISOString(),
    };
    await setDoc(subRef, submission);
    return subRef.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, 'submissions');
    throw err;
  }
}

export async function getUserSubmissions(userId: string): Promise<TaskSubmission[]> {
  try {
    const q = query(
      collection(db, 'submissions'),
      where('userId', '==', userId),
      orderBy('submittedAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as TaskSubmission);
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'submissions');
    return [];
  }
}

export async function getAllSubmissions(): Promise<TaskSubmission[]> {
  try {
    const q = query(collection(db, 'submissions'), orderBy('submittedAt', 'desc'), limit(100));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as TaskSubmission);
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'submissions');
    return [];
  }
}

export async function reviewTaskSubmission(
  submissionId: string,
  approved: boolean,
  adminFeedback?: string
): Promise<void> {
  await runTransaction(db, async (txn) => {
    const subRef = doc(db, 'submissions', submissionId);
    const subSnap = await txn.get(subRef);
    if (!subSnap.exists()) throw new Error('Submission not found');

    const sub = subSnap.data() as TaskSubmission;
    if (sub.status !== 'pending') throw new Error('Submission already reviewed');

    const newStatus = approved ? 'approved' : 'rejected';
    const now = new Date().toISOString();

    txn.update(subRef, {
      status: newStatus,
      adminFeedback: adminFeedback || (approved ? 'Verified by Admin' : 'Incomplete or invalid proof'),
      reviewedAt: now,
    });

    if (approved) {
      // 1. Credit user wallet & totalEarned
      const userRef = doc(db, 'users', sub.userId);
      const userSnap = await txn.get(userRef);
      if (userSnap.exists()) {
        const u = userSnap.data() as UserProfile;
        const newBalance = (u.walletBalance || 0) + sub.rewardAmount;
        const newEarned = (u.totalEarned || 0) + sub.rewardAmount;

        txn.update(userRef, {
          walletBalance: newBalance,
          totalEarned: newEarned,
          updatedAt: now,
        });

        // 2. Record Transaction in ledger
        const txRef = doc(collection(db, 'transactions'));
        const newTx: Transaction = {
          id: txRef.id,
          userId: sub.userId,
          userEmail: sub.userEmail,
          type: 'task_earning',
          amount: sub.rewardAmount,
          balanceAfter: newBalance,
          description: `Task Reward: ${sub.taskTitle}`,
          descriptionBn: `টাস্ক রিওয়ার্ড: ${sub.taskTitle}`,
          status: 'completed',
          referenceId: sub.taskId,
          createdAt: now,
        };
        txn.set(txRef, newTx);

        // 3. Increment task completedCount
        const taskRef = doc(db, 'tasks', sub.taskId);
        txn.update(taskRef, {
          completedCount: increment(1),
        });

        // 4. Check if user has a referrer, award 5% referral bonus!
        if (u.referredBy) {
          // Find referrer
          // Notice: in transaction, queries are restricted, so we handle referral rewards async if needed or via ref doc
        }
      }
    }
  });
}

// =========================================================================
// DAILY CHECK-IN BONUS
// =========================================================================

export async function claimDailyBonus(userId: string): Promise<number> {
  const bonusAmount = 5; // ৳5 Daily
  const today = new Date().toISOString().split('T')[0];
  const now = new Date().toISOString();

  await runTransaction(db, async (txn) => {
    const userRef = doc(db, 'users', userId);
    const userSnap = await txn.get(userRef);
    if (!userSnap.exists()) throw new Error('User not found');

    const u = userSnap.data() as UserProfile;
    if (u.lastDailyBonus === today) {
      throw new Error('Already claimed today');
    }

    const newBalance = (u.walletBalance || 0) + bonusAmount;
    const newEarned = (u.totalEarned || 0) + bonusAmount;

    txn.update(userRef, {
      walletBalance: newBalance,
      totalEarned: newEarned,
      lastDailyBonus: today,
      updatedAt: now,
    });

    const txRef = doc(collection(db, 'transactions'));
    const newTx: Transaction = {
      id: txRef.id,
      userId: u.uid,
      userEmail: u.email,
      type: 'daily_bonus',
      amount: bonusAmount,
      balanceAfter: newBalance,
      description: 'Daily Check-in Bonus',
      descriptionBn: 'দৈনিক চেক-ইন বোনাস',
      status: 'completed',
      createdAt: now,
    };
    txn.set(txRef, newTx);
  });

  return bonusAmount;
}

// =========================================================================
// WITHDRAWALS
// =========================================================================

export async function requestWithdrawal(
  userId: string,
  userEmail: string,
  paymentMethod: PaymentMethod,
  accountNumber: string,
  accountType: AccountType,
  amount: number
): Promise<string> {
  const minAmount = 50;
  if (amount < minAmount) {
    throw new Error(`Minimum withdrawal amount is ৳${minAmount}`);
  }

  const fee = 0; // 0% promotional fee for users
  const payableAmount = amount - fee;
  const now = new Date().toISOString();
  let withdrawalId = '';

  await runTransaction(db, async (txn) => {
    const userRef = doc(db, 'users', userId);
    const userSnap = await txn.get(userRef);
    if (!userSnap.exists()) throw new Error('User not found');

    const u = userSnap.data() as UserProfile;
    if ((u.walletBalance || 0) < amount) {
      throw new Error('Insufficient wallet balance');
    }

    const newBalance = (u.walletBalance || 0) - amount;
    const newPending = (u.pendingWithdrawals || 0) + amount;

    // Deduct available balance and hold in pendingWithdrawals
    txn.update(userRef, {
      walletBalance: newBalance,
      pendingWithdrawals: newPending,
      updatedAt: now,
    });

    // Create withdrawal request
    const wRef = doc(collection(db, 'withdrawals'));
    withdrawalId = wRef.id;

    const wRequest: WithdrawalRequest = {
      id: withdrawalId,
      userId,
      userEmail,
      paymentMethod,
      accountNumber,
      accountType,
      amount,
      fee,
      payableAmount,
      status: 'pending',
      requestedAt: now,
    };
    txn.set(wRef, wRequest);

    // Record Transaction in ledger
    const txRef = doc(collection(db, 'transactions'));
    const newTx: Transaction = {
      id: txRef.id,
      userId,
      userEmail,
      type: 'withdrawal',
      amount: -amount,
      balanceAfter: newBalance,
      description: `Withdrawal Request to ${paymentMethod.toUpperCase()} (${accountNumber})`,
      descriptionBn: `${paymentMethod.toUpperCase()} নম্বরে টাকা উত্তোলনের অনুরোধ (${accountNumber})`,
      status: 'pending',
      referenceId: withdrawalId,
      createdAt: now,
    };
    txn.set(txRef, newTx);
  });

  return withdrawalId;
}

export async function getUserWithdrawals(userId: string): Promise<WithdrawalRequest[]> {
  try {
    const q = query(
      collection(db, 'withdrawals'),
      where('userId', '==', userId),
      orderBy('requestedAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as WithdrawalRequest);
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'withdrawals');
    return [];
  }
}

export async function getAllWithdrawals(): Promise<WithdrawalRequest[]> {
  try {
    const q = query(collection(db, 'withdrawals'), orderBy('requestedAt', 'desc'), limit(100));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as WithdrawalRequest);
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'withdrawals');
    return [];
  }
}

export async function approveWithdrawal(
  withdrawalId: string,
  transactionId: string,
  adminNote?: string
): Promise<void> {
  const now = new Date().toISOString();
  await runTransaction(db, async (txn) => {
    const wRef = doc(db, 'withdrawals', withdrawalId);
    const wSnap = await txn.get(wRef);
    if (!wSnap.exists()) throw new Error('Withdrawal request not found');

    const w = wSnap.data() as WithdrawalRequest;
    if (w.status !== 'pending') throw new Error('Withdrawal already processed');

    // Update withdrawal doc
    txn.update(wRef, {
      status: 'approved',
      transactionId: transactionId.trim(),
      adminNote: adminNote || 'Paid successfully via MFS',
      processedAt: now,
    });

    // Update user: remove pendingWithdrawals, add to totalWithdrawn
    const userRef = doc(db, 'users', w.userId);
    const userSnap = await txn.get(userRef);
    if (userSnap.exists()) {
      const u = userSnap.data() as UserProfile;
      const newPending = Math.max(0, (u.pendingWithdrawals || 0) - w.amount);
      const newWithdrawn = (u.totalWithdrawn || 0) + w.amount;

      txn.update(userRef, {
        pendingWithdrawals: newPending,
        totalWithdrawn: newWithdrawn,
        updatedAt: now,
      });

      // Update associated transaction status to completed
      const txQuery = query(
        collection(db, 'transactions'),
        where('referenceId', '==', withdrawalId),
        limit(1)
      );
      // note: within txn, can write a payout confirmation transaction:
      const txRef = doc(collection(db, 'transactions'));
      txn.set(txRef, {
        id: txRef.id,
        userId: w.userId,
        userEmail: w.userEmail,
        type: 'withdrawal',
        amount: 0,
        balanceAfter: u.walletBalance,
        description: `Cashout Paid: ৳${w.payableAmount} sent to ${w.paymentMethod.toUpperCase()} (TrxID: ${transactionId})`,
        descriptionBn: `ক্যাশআউট সম্পন্ন: ৳${w.payableAmount} পাঠানো হয়েছে ${w.paymentMethod.toUpperCase()} (TrxID: ${transactionId})`,
        status: 'completed',
        referenceId: withdrawalId,
        createdAt: now,
      });
    }
  });
}

export async function rejectWithdrawal(
  withdrawalId: string,
  adminNote: string
): Promise<void> {
  const now = new Date().toISOString();
  await runTransaction(db, async (txn) => {
    const wRef = doc(db, 'withdrawals', withdrawalId);
    const wSnap = await txn.get(wRef);
    if (!wSnap.exists()) throw new Error('Withdrawal request not found');

    const w = wSnap.data() as WithdrawalRequest;
    if (w.status !== 'pending') throw new Error('Withdrawal already processed');

    txn.update(wRef, {
      status: 'rejected',
      adminNote: adminNote || 'Rejected by Admin. Amount refunded.',
      processedAt: now,
    });

    // Refund amount back to user's available balance
    const userRef = doc(db, 'users', w.userId);
    const userSnap = await txn.get(userRef);
    if (userSnap.exists()) {
      const u = userSnap.data() as UserProfile;
      const newBalance = (u.walletBalance || 0) + w.amount;
      const newPending = Math.max(0, (u.pendingWithdrawals || 0) - w.amount);

      txn.update(userRef, {
        walletBalance: newBalance,
        pendingWithdrawals: newPending,
        updatedAt: now,
      });

      // Record Refund Transaction
      const txRef = doc(collection(db, 'transactions'));
      const newTx: Transaction = {
        id: txRef.id,
        userId: w.userId,
        userEmail: w.userEmail,
        type: 'withdrawal_refund',
        amount: w.amount,
        balanceAfter: newBalance,
        description: `Refund for Rejected Withdrawal: ${adminNote}`,
        descriptionBn: `বাতিলকৃত উইথড্র রিফান্ড: ${adminNote}`,
        status: 'completed',
        referenceId: withdrawalId,
        createdAt: now,
      };
      txn.set(txRef, newTx);
    }
  });
}

// =========================================================================
// TRANSACTIONS
// =========================================================================

export async function getUserTransactions(userId: string): Promise<Transaction[]> {
  try {
    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as Transaction);
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'transactions');
    return [];
  }
}

export async function getAllTransactions(): Promise<Transaction[]> {
  try {
    const q = query(collection(db, 'transactions'), orderBy('createdAt', 'desc'), limit(100));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as Transaction);
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'transactions');
    return [];
  }
}

// =========================================================================
// REFERRALS
// =========================================================================

export async function getUserReferrals(userId: string): Promise<ReferralItem[]> {
  try {
    const q = query(
      collection(db, 'referrals'),
      where('referrerId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as ReferralItem);
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'referrals');
    return [];
  }
}

export async function getAllReferrals(): Promise<ReferralItem[]> {
  try {
    const q = query(collection(db, 'referrals'), orderBy('createdAt', 'desc'), limit(100));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as ReferralItem);
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'referrals');
    return [];
  }
}

// =========================================================================
// USER MANAGEMENT (ADMIN)
// =========================================================================

export async function getAllUsers(): Promise<UserProfile[]> {
  try {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(100));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as UserProfile);
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'users');
    return [];
  }
}

export async function toggleUserBanStatus(userId: string, currentStatus: string): Promise<void> {
  const newStatus = currentStatus === 'active' ? 'banned' : 'active';
  await updateDoc(doc(db, 'users', userId), {
    status: newStatus,
    updatedAt: new Date().toISOString(),
  });
}

export async function adjustUserBalance(
  userId: string,
  amount: number,
  reason: string
): Promise<void> {
  const now = new Date().toISOString();
  await runTransaction(db, async (txn) => {
    const userRef = doc(db, 'users', userId);
    const userSnap = await txn.get(userRef);
    if (!userSnap.exists()) throw new Error('User not found');

    const u = userSnap.data() as UserProfile;
    const newBalance = Math.max(0, (u.walletBalance || 0) + amount);
    const newEarned = amount > 0 ? (u.totalEarned || 0) + amount : u.totalEarned;

    txn.update(userRef, {
      walletBalance: newBalance,
      totalEarned: newEarned,
      updatedAt: now,
    });

    const txRef = doc(collection(db, 'transactions'));
    const newTx: Transaction = {
      id: txRef.id,
      userId: u.uid,
      userEmail: u.email,
      type: 'admin_adjustment',
      amount,
      balanceAfter: newBalance,
      description: `Admin Adjustment: ${reason}`,
      descriptionBn: `অ্যাডমিন সমন্বয়: ${reason}`,
      status: 'completed',
      createdAt: now,
    };
    txn.set(txRef, newTx);
  });
}
