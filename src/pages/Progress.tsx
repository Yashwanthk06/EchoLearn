import {
  useMasteryTrend,
  useTopicPerformance,
  useWeeklyStudy,
  useUser,
  useTopicProgress,
} from '../hooks/useMockData';
import { Card } from '../components/ui/Card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  Cell,
} from 'recharts';
import { motion } from 'framer-motion';

export function Progress() {
  const masteryTrend = useMasteryTrend();
  const topicPerformance = useTopicPerformance();
  const weeklyStudy = useWeeklyStudy();
  const user = useUser();
  const progresses = useTopicProgress();

  const totalTopics = progresses.length;
  const avgMastery = Math.round(
    progresses.reduce((acc, curr) => acc + curr.masteryPercentage, 0) / (totalTopics || 1)
  );
  const totalTime = progresses.reduce((acc, curr) => acc + curr.timeSpentMinutes, 0);
  const totalHours = Math.floor(totalTime / 60);

  const getMasteryColor = (score: number) => {
    if (score >= 90) return '#10B981';
    if (score >= 70) return '#06B6D4';
    if (score >= 40) return '#F59E0B';
    return '#EF4444';
  };

  const stats = [
    { label: 'Total Topics', value: `${totalTopics}`, color: 'text-text-primary' },
    { label: 'Avg Mastery', value: `${avgMastery}%`, color: 'text-primary' },
    { label: 'Study Streak', value: `${user.streak} Days`, color: 'text-amber-500' },
    {
      label: 'Total Time',
      value: `${totalHours}h ${totalTime % 60}m`,
      color: 'text-text-primary',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Progress</h1>
        <p className="text-text-secondary mt-1">Your learning analytics and insights</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-5">
            <div className="text-sm font-medium text-text-secondary mb-1">{stat.label}</div>
            <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mastery Over Time */}
        <Card className="p-5 flex flex-col h-[400px]">
          <h3 className="font-semibold text-text-primary mb-6">Mastery Over Time</h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={masteryTrend}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorMastery" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#64748B' }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#64748B' }}
                  domain={[0, 100]}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="mastery"
                  stroke="#6366F1"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorMastery)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Topic Performance */}
        <Card className="p-5 flex flex-col h-[400px]">
          <h3 className="font-semibold text-text-primary mb-6">Topic Performance</h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topicPerformance}
                layout="vertical"
                margin={{ top: 0, right: 10, left: 20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#64748B' }}
                />
                <YAxis
                  dataKey="topicName"
                  type="category"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#475569' }}
                  width={80}
                />
                <Tooltip
                  cursor={{ fill: '#F8FAFC' }}
                  contentStyle={{
                    borderRadius: '8px',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  }}
                />
                <Bar dataKey="mastery" radius={[0, 4, 4, 0]} barSize={16}>
                  {topicPerformance.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getMasteryColor(entry.mastery)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Weekly Study Time */}
      <Card className="p-5 flex flex-col h-[350px]">
        <h3 className="font-semibold text-text-primary mb-6">Weekly Study Time</h3>
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={weeklyStudy}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#64748B' }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#64748B' }}
              />
              <Tooltip
                cursor={{ fill: '#F8FAFC' }}
                contentStyle={{
                  borderRadius: '8px',
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                }}
              />
              <Bar dataKey="minutes" fill="#818CF8" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </motion.div>
  );
}
