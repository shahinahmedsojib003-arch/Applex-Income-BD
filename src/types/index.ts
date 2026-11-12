export type UserRole = 'user' | 'admin';
export type UserStatus = 'active' | 'banned';

export interface UserPaymentNumbers {
  bkash?: string;
  nagad?: string;
  rocket?: string;
  upay?: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  walletBalance: number;
  totalEarned: number;
  totalWithdrawn: number;
  pendingWithdrawals: number;
  referralCode: string;
  referredBy?: string;
  phone?: string;
  paymentNumbers?: UserPaymentNumbers;
  status: UserStatus;
  lastDailyBonus?: string; // YYYY-MM-DD
  createdAt: string;
  updatedAt?: string;
}

export type TaskCategory = 'visit' | 'video' | 'social' | 'survey' | 'app' | 'daily';
export type TaskProofType = 'timer' | 'code' | 'screenshot_text' | 'quiz';
export type TaskStatus = 'active' | 'paused' | 'completed';

export interface Task {
  id: string;
  title: string;
  titleBn?: string;
  description: string;
  descriptionBn?: string;
  category: TaskCategory;
  rewardAmount: number; // in BDT (৳)
  timeRequiredSec: number; // e.g. 30 sec
  targetUrl: string;
  proofType: TaskProofType;
  verificationCode?: string;
  quizQuestion?: string;
  quizQuestionBn?: string;
  quizAnswer?: string;
  maxSubmissions?: number;
  completedCount?: number;
  status: TaskStatus;
  createdAt: string;
}

export type SubmissionStatus = 'pending' | 'approved' | 'rejected';

export interface TaskSubmission {
  id: string;
  taskId: string;
  taskTitle: string;
  userId: string;
  userEmail: string;
  rewardAmount: number;
  proofContent: string;
  status: SubmissionStatus;
  adminFeedback?: string;
  submittedAt: string;
  reviewedAt?: string;
}

export type PaymentMethod = 'bkash' | 'nagad' | 'rocket' | 'upay';
export type AccountType = 'personal' | 'agent';
export type WithdrawalStatus = 'pending' | 'approved' | 'rejected';

export interface WithdrawalRequest {
  id: string;
  userId: string;
  userEmail: string;
  paymentMethod: PaymentMethod;
  accountNumber: string;
  accountType: AccountType;
  amount: number;
  fee: number;
  payableAmount: number;
  status: WithdrawalStatus;
  transactionId?: string; // TrxID provided by admin when sending funds
  adminNote?: string;
  requestedAt: string;
  processedAt?: string;
}

export type TransactionType =
  | 'task_earning'
  | 'referral_bonus'
  | 'withdrawal'
  | 'withdrawal_refund'
  | 'admin_adjustment'
  | 'daily_bonus';

export interface Transaction {
  id: string;
  userId: string;
  userEmail?: string;
  type: TransactionType;
  amount: number; // positive for credit, negative for debit
  balanceAfter: number;
  description: string;
  descriptionBn?: string;
  status: 'completed' | 'pending' | 'rejected';
  referenceId?: string; // taskId, withdrawalId, etc.
  createdAt: string;
}

export interface ReferralItem {
  id: string;
  referrerId: string;
  referredUserId: string;
  referredEmail: string;
  referredName: string;
  bonusEarned: number;
  status: 'registered' | 'active';
  createdAt: string;
}
