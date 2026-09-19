import React, { useMemo, useState } from 'react';
import { Gift, Lock, CheckCircle2, Zap } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useEchoPoints } from '../hooks/useMockData';

interface Reward {
  id: string;
  title: string;
  detail: string;
  cost: number;
}

interface Redemption {
  rewardId: string;
  title: string;
  cost: number;
  redeemedAt: string;
}

const MOCK_REWARDS: Reward[] = [
  { id: 'rw-10', title: '$5 Study Fuel Voucher', detail: 'Coffee or snack voucher', cost: 500 },
  { id: 'rw-25', title: '$10 Bookstore Voucher', detail: 'Bookstore gift voucher', cost: 1000 },
  { id: 'rw-50', title: '$25 Learning Grant Voucher', detail: 'Course or supply voucher', cost: 2000 },
  { id: 'rw-100', title: '$50 Achievement Voucher', detail: 'Premium reward voucher', cost: 3500 },
];

const BALANCE_KEY = 'echolearn-rewards-balance';
const HISTORY_KEY = 'echolearn-rewards-history';

function loadNumber(key: string, fallback: number): number {
  try {
    const raw = localStorage.getItem(key);
    if (raw == null) return fallback;
    const n = Number(raw);
    return Number.isFinite(n) && n >= 0 ? n : fallback;
  } catch {
    return fallback;
  }
}

function loadHistory(): Redemption[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export const RewardsStore: React.FC = () => {
  const { balance: startingBalance } = useEchoPoints();
  const [balance, setBalance] = useState<number>(() => loadNumber(BALANCE_KEY, startingBalance));
  const [history, setHistory] = useState<Redemption[]>(loadHistory);
  const [confirmed, setConfirmed] = useState<Redemption | null>(null);

  const persist = (nextBalance: number, nextHistory: Redemption[]) => {
    setBalance(nextBalance);
    setHistory(nextHistory);
    try {
      localStorage.setItem(BALANCE_KEY, String(nextBalance));
      localStorage.setItem(HISTORY_KEY, JSON.stringify(nextHistory));
    } catch {
      /* ignore */
    }
  };

  const redeem = (reward: Reward) => {
    if (balance < reward.cost) return;
    const entry: Redemption = {
      rewardId: reward.id,
      title: reward.title,
      cost: reward.cost,
      redeemedAt: new Date().toISOString(),
    };
    persist(balance - reward.cost, [entry, ...history]);
    setConfirmed(entry);
  };

  const rows = useMemo(
    () =>
      MOCK_REWARDS.map((reward) => {
        const eligible = balance >= reward.cost;
        const redeemedCount = history.filter((h) => h.rewardId === reward.id).length;
        return { reward, eligible, redeemedCount, shortfall: reward.cost - balance };
      }),
    [balance, history]
  );

  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-text-primary">Rewards Store</h1>
          <p className="text-sm text-text-secondary mt-1">Redeem EchoPoints for gift vouchers</p>
        </div>
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-primary-50 dark:bg-[#12352a] flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">Available EchoPoints</p>
              <p className="text-2xl font-bold text-text-primary">{balance.toLocaleString()} pts</p>
            </div>
          </div>
        </Card>

        {confirmed && (
          <div className="mb-6 p-4 rounded-xl border border-primary/30 bg-primary-50 dark:bg-[#12352a] flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
            <p className="text-sm font-medium text-text-primary">
              Redeemed {confirmed.title} for {confirmed.cost.toLocaleString()} pts. New balance: {balance.toLocaleString()} pts.
            </p>
          </div>
        )}

        <h2 className="text-lg font-semibold text-text-primary mb-4">Available Rewards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {rows.map(({ reward, eligible, redeemedCount, shortfall }) => (
            <Card key={reward.id} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-[#242d38] flex items-center justify-center shrink-0">
                    {eligible ? (
                      <Gift className="w-5 h-5 text-primary" />
                    ) : (
                      <Lock className="w-5 h-5 text-text-secondary" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-text-primary">{reward.title}</p>
                    <p className="text-sm text-text-secondary">{reward.detail}</p>
                  </div>
                </div>
                <Badge variant={eligible ? 'success' : 'warning'}>
                  {reward.cost.toLocaleString()} pts
                </Badge>
              </div>
              <div className="mt-4 flex items-center justify-between gap-3">
                {eligible ? (
                  <Button onClick={() => redeem(reward)}>Redeem</Button>
                ) : (
                  <p className="text-sm text-text-secondary">
                    Locked. Earn {shortfall.toLocaleString()} more pts to unlock.
                  </p>
                )}
                {redeemedCount > 0 && (
                  <span className="text-xs text-text-secondary">Redeemed {redeemedCount}x</span>
                )}
              </div>
            </Card>
          ))}
        </div>

        <h2 className="text-lg font-semibold text-text-primary mb-4">Redemption History</h2>
        <Card className="p-5">
          {history.length === 0 ? (
            <p className="text-sm text-text-secondary">No redemptions yet. Redeem a reward above to see it here.</p>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-[#2f3a46]">
              {history.map((h, i) => (
                <li key={`${h.rewardId}-${h.redeemedAt}-${i}`} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-text-primary">{h.title}</p>
                      <p className="text-xs text-text-secondary">
                        {new Date(h.redeemedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-text-primary">-{h.cost.toLocaleString()} pts</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
};
