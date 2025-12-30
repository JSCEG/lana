import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { format, parseISO, isValid } from 'date-fns';
import { es } from 'date-fns/locale';
import { Transaction } from '@/types';

interface BalanceHistoryChartProps {
  transactions: Transaction[];
  isLoading: boolean;
}

export default function BalanceHistoryChart({ transactions, isLoading }: BalanceHistoryChartProps) {
  const data = useMemo(() => {
    if (!transactions.length) return [];

    // 1. Sort transactions by date ascending
    const sorted = [...transactions].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // 2. Calculate running balance day by day
    const balanceByDate: Record<string, number> = {};
    let currentBalance = 0;

    // We need to initialize with the first date's starting balance or just accumulate
    // Assuming starting balance is 0 before the first transaction
    
    sorted.forEach(tx => {
      const dateKey = tx.date.split('T')[0]; // YYYY-MM-DD
      const amount = tx.type === 'income' ? Number(tx.amount) : -Number(tx.amount);
      currentBalance += amount;
      balanceByDate[dateKey] = currentBalance;
    });

    // 3. Transform to array
    return Object.entries(balanceByDate).map(([date, balance]) => ({
      date,
      balance,
      formattedDate: isValid(parseISO(date)) ? format(parseISO(date), 'd MMM', { locale: es }) : date
    }));
  }, [transactions]);

  if (isLoading) {
    return <div className="h-80 bg-white/5 rounded-xl animate-pulse" />;
  }

  if (data.length === 0) {
    return (
      <div className="glass-card h-80 flex flex-col items-center justify-center text-center">
        <p className="text-gray-400">No hay datos suficientes para el historial</p>
      </div>
    );
  }

  return (
    <div className="glass-card h-80">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 font-heading tracking-wide">
        Evolución del Saldo
      </h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
            <XAxis 
              dataKey="formattedDate" 
              stroke="#9ca3af" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
              minTickGap={30}
            />
            <YAxis 
              stroke="#9ca3af" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${value.toLocaleString('es-MX', { notation: 'compact' })}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(11, 15, 26, 0.9)',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.36)',
                backdropFilter: 'blur(10px)',
                color: '#fff'
              }}
              formatter={(value: number) => [`$${value.toLocaleString('es-MX')}`, 'Saldo']}
              labelStyle={{ color: '#9ca3af', marginBottom: '0.5rem' }}
            />
            <ReferenceLine y={0} stroke="#EF4444" strokeDasharray="3 3" opacity={0.5} />
            <Line 
              type="monotone" 
              dataKey="balance" 
              stroke="url(#colorBalance)" 
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6, fill: '#fff' }}
            />
            <defs>
              <linearGradient id="colorBalance" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#6EE7F9" />
                <stop offset="100%" stopColor="#A78BFA" />
              </linearGradient>
            </defs>
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
