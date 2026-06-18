'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getStoredUser, PublicUser } from '@/lib/api';

interface Transaction {
  id: string;
  type: 'deposit' | 'release' | 'refund' | 'fund_in';
  amount: number;
  date: string;
  description: string;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
}

export default function EmployerWalletPage() {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [balance, setBalance] = useState(75000);
  const [escrow, setEscrow] = useState(25000);
  const [showFundModal, setShowFundModal] = useState(false);
  const [fundAmount, setFundAmount] = useState('10000');
  const [funding, setFunding] = useState(false);

  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: 'tx-001',
      type: 'deposit',
      amount: 25000,
      date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2h ago
      description: 'OPay Milestone Escrow Lock – Event Setup Crew',
      status: 'SUCCESS',
    },
    {
      id: 'tx-002',
      type: 'fund_in',
      amount: 100000,
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      description: 'OPay Wallet Top-Up via Card',
      status: 'SUCCESS',
    },
    {
      id: 'tx-003',
      type: 'release',
      amount: 15000,
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
      description: 'OPay Escrow Released to Worker (Tunde Bakare)',
      status: 'SUCCESS',
    },
  ]);

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  const handleFundWallet = () => {
    setFunding(true);
    setTimeout(() => {
      const amt = Number(fundAmount);
      setBalance((prev) => prev + amt);
      setTransactions((prev) => [
        {
          id: `tx-${Date.now()}`,
          type: 'fund_in',
          amount: amt,
          date: new Date().toISOString(),
          description: 'OPay Wallet Top-Up via Card',
          status: 'SUCCESS',
        },
        ...prev,
      ]);
      setFunding(false);
      setShowFundModal(false);
    }, 1500);
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto w-full relative min-h-screen">
      {/* Top Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-[#9CA3AF] mb-4">
        <Link href="/employer" className="hover:text-[#00C16A]">
          Dashboard
        </Link>
        <span>/</span>
        <span className="font-medium">Wallet</span>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#111827]">Employer Wallet</h1>
        <p className="text-sm text-[#4B5563] mt-1">
          Manage your job funding balance and escrow deposits via OPay.
        </p>
      </div>

      {/* Grid of Balances */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Wallet Balance Card */}
        <div className="card !bg-[#00C16A] text-white border-none flex flex-col justify-between min-h-[160px] relative overflow-hidden">
          <div className="absolute right-4 top-4 text-white/10 font-black text-7xl select-none pointer-events-none">
            op
          </div>
          <div>
            <div className="text-xs uppercase font-bold tracking-wider text-white/80">Available OPay Balance</div>
            <div className="text-3xl font-black mt-1">₦{balance.toLocaleString('en-NG')}</div>
          </div>
          <div className="flex justify-between items-center mt-4 border-t border-white/20 pt-4 z-10">
            <span className="text-xs text-white/80">Linked Account: OPay Wallet</span>
            <button 
              onClick={() => setShowFundModal(true)}
              className="px-4 py-2 bg-white text-[#00C16A] font-bold text-xs rounded-[8px] hover:bg-gray-50 transition-colors cursor-pointer"
            >
              + Fund Wallet
            </button>
          </div>
        </div>

        {/* Escrow Locked Card */}
        <div className="card flex flex-col justify-between min-h-[160px]">
          <div>
            <div className="text-xs uppercase font-bold tracking-wider text-[#9CA3AF]">Locked in Escrow</div>
            <div className="text-3xl font-black text-[#111827] mt-1">₦{escrow.toLocaleString('en-NG')}</div>
          </div>
          <div className="flex justify-between items-center mt-4 border-t border-[#F3F4F6] pt-4">
            <span className="text-xs text-[#4B5563]">Security status: Milestone Protected</span>
            <span className="inline-flex items-center gap-1 text-[10px] text-[#00C16A] font-bold bg-[#E6FAF2] px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00C16A] animate-pulse" />
              Secured
            </span>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="card">
        <h2 className="text-base font-bold text-[#111827] mb-4 border-b border-[#E5E7EB] pb-2">
          Transaction History
        </h2>

        <div className="flex flex-col gap-3">
          {transactions.map((tx) => (
            <div key={tx.id} className="flex justify-between items-center gap-4 py-3 border-b border-[#F9FAFB] last:border-0">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  tx.type === 'fund_in' 
                    ? 'bg-emerald-50 text-[#00C16A]' 
                    : tx.type === 'deposit' 
                      ? 'bg-amber-50 text-amber-600' 
                      : 'bg-red-50 text-red-600'
                }`}>
                  {tx.type === 'fund_in' ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <polyline points="19 12 12 19 5 12" />
                    </svg>
                  ) : tx.type === 'deposit' ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  )}
                </div>
                <div>
                  <div className="text-sm font-semibold text-[#111827]">{tx.description}</div>
                  <div className="text-xs text-[#9CA3AF] mt-0.5">
                    {new Date(tx.date).toLocaleDateString('en-NG', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className={`font-bold text-sm ${
                  tx.type === 'fund_in' ? 'text-[#00C16A]' : 'text-[#111827]'
                }`}>
                  {tx.type === 'fund_in' ? '+' : '-'} ₦{tx.amount.toLocaleString()}
                </div>
                <div className="text-[10px] text-gray-400 font-semibold uppercase mt-0.5">{tx.status}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top-up Modal */}
      {showFundModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            onClick={() => setShowFundModal(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
          />

          <div className="relative bg-white w-full max-w-md rounded-[12px] p-6 shadow-2xl flex flex-col z-10 border border-[#E5E7EB]">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#00C16A] flex items-center justify-center text-white font-bold text-lg">
                  op
                </div>
                <span className="font-bold text-[#00C16A]">OPay Wallet Top-Up</span>
              </div>
              <button onClick={() => setShowFundModal(false)} className="text-gray-400 hover:text-gray-600 font-bold">✕</button>
            </div>

            <div className="mb-6">
              <label htmlFor="fundAmount" className="label">Amount to Deposit (NGN)</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500 font-semibold">
                  ₦
                </span>
                <input
                  id="fundAmount"
                  type="number"
                  value={fundAmount}
                  onChange={(e) => setFundAmount(e.target.value)}
                  className="input-field !pl-8"
                />
              </div>
            </div>

            <button
              onClick={handleFundWallet}
              disabled={funding || !fundAmount}
              className="btn-primary !min-h-[48px] w-full flex items-center justify-center gap-2 cursor-pointer"
            >
              {funding ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Fund Wallet'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
