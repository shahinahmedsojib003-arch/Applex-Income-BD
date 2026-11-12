# Applex Income BD - Security Specification & Threat Model

## 1. Data Invariants
1. **Wallet Balance Immunity**: Standard users cannot modify `walletBalance`, `totalEarned`, `totalWithdrawn`, `pendingWithdrawals`, or `role`. Balance mutations must be strictly governed by authorized administrative operations or system-verified transactions.
2. **Withdrawal Integrity**: A user can only create a withdrawal request with status `pending`, payableAmount <= amount, and valid Bangladeshi MFS provider (bKash, Nagad, Rocket, Upay). Once submitted, only an admin can update the status to `approved` or `rejected`.
3. **Task Completion Authenticity**: A user can only submit task proofs for themselves (`userId == request.auth.uid`). Users cannot mark their own submissions as `approved`.
4. **Referral Lineage**: Referral documents link a referrer to a referee and cannot have their `referrerId` or `referredUserId` mutated once created.
5. **Admin Access Control**: All administrative operations require authorization verified against the `/admins/{userId}` document or the bootstrapped verified administrator email (`shahinahmedsojib9@gmail.com`).

## 2. The Dirty Dozen Payloads (Adversarial Tests)
1. **Balance Inflation Attack**: User attempts to `update` `/users/{uid}` with `walletBalance: 999999`. -> `PERMISSION_DENIED`
2. **Role Escalation Attack**: User attempts to update their own document with `role: 'admin'`. -> `PERMISSION_DENIED`
3. **Withdrawal Auto-Approval**: User submits `/withdrawals/{id}` with `status: 'approved'`. -> `PERMISSION_DENIED`
4. **Negative Withdrawal Exploitation**: User creates `/withdrawals/{id}` with `amount: -500`. -> `PERMISSION_DENIED`
5. **Task Self-Reward**: User creates `/submissions/{id}` with `status: 'approved'` and immediately credits their own balance. -> `PERMISSION_DENIED`
6. **Impersonated Submission**: User A submits a task proof with `userId: 'user_b'`. -> `PERMISSION_DENIED`
7. **Junk ID Poisoning**: Attacker requests a document with an ID containing 2000 invalid characters. -> `PERMISSION_DENIED`
8. **Admin Collection Tampering**: Non-admin attempts to write to `/admins/{uid}`. -> `PERMISSION_DENIED`
9. **Transaction History Forgery**: Non-admin attempts to inject a fake `task_earning` transaction in `/transactions/{id}`. -> `PERMISSION_DENIED`
10. **Terminal State Tampering**: User attempts to re-open an already `approved` or `rejected` withdrawal. -> `PERMISSION_DENIED`
11. **PII Scraping**: Anonymous or regular user tries to list all documents in `/users` without admin rights. -> `PERMISSION_DENIED`
12. **Ghost Field Injection**: User attempts to append an un-whitelisted attribute (e.g. `isVip: true`) to user document. -> `PERMISSION_DENIED`
