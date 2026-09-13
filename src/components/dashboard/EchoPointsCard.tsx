import React from 'react';
import { motion } from 'framer-motion';
import { Zap, ArrowRight, Award, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../ui/Card';
import { useEchoPoints } from '../../hooks/useMockData';

export const EchoPointsCard: React.FC = () => {
  const echoPoints = useEchoPoints();
  const navigate = useNavigate();

  const recentTransactions = echoPoints.transactions.slice(0, 3);

  const handleRewardStore = () => {
    navigate('/progress');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.1 }}
      className="h-full"
    >
      <Card className="h-full flex flex-col p-5 bg-white border border-border shadow-card hover:shadow-card-hover transition-shadow duration-300">

        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <Zap className="w-4 h-4 fill-amber-500 text-amber-500" />
            </div>

            <div>
              <h2 className="text-sm font-semibold text-text-primary tracking-tight">
                EchoPoints
              </h2>

              <p className="text-[11px] text-text-secondary">
                Earned through deep mastery
              </p>
            </div>
          </div>

          <span className="flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full">
            <Sparkles className="w-3 h-3 text-amber-500" />
            Tier 2
          </span>
        </div>

        {/* Balance & Total */}
        <div className="flex items-baseline justify-between py-2 border-b border-slate-100 mb-3">
          <div>
            <div className="text-3xl font-extrabold text-text-primary tracking-tight">
              {echoPoints.balance.toLocaleString()}
            </div>

            <div className="text-[11px] text-text-secondary">
              Available balance
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs font-semibold text-slate-700">
              {echoPoints.totalEarned.toLocaleString()}
            </div>

            <div className="text-[10px] text-text-secondary uppercase">
              Lifetime earned
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="flex-1 space-y-2 mb-3">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            <span>Recent Activity</span>
            <span>Pts</span>
          </div>

          {recentTransactions.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between py-1 px-2 rounded-md hover:bg-slate-50 transition-colors text-xs"
            >
              <span
                className="text-text-primary font-medium truncate pr-2"
                title={tx.reason}
              >
                {tx.reason}
              </span>

              <span
                className={`font-bold shrink-0 ${
                  tx.amount > 0
                    ? 'text-emerald-600'
                    : 'text-red-500'
                }`}
              >
                {tx.amount > 0 ? `+${tx.amount}` : tx.amount}
              </span>
            </div>
          ))}
        </div>

        {/* Reward Store CTA */}
        <button
          onClick={handleRewardStore}
          className="flex items-center justify-center gap-1.5 w-full py-2 px-3 text-xs font-semibold text-indigo-600 bg-indigo-50/80 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer mt-auto"
        >
          <Award className="w-3.5 h-3.5 text-indigo-500" />

          <span>Reward Store & Perks</span>

          <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
        </button>

      </Card>
    </motion.div>
  );
};