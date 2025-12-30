import { useMemo } from 'react';
import {
  BarChart,
  Bar,
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

interface TransactionHistoryChartProps {
  transactions: Transaction[];
}

export default function TransactionHistoryChart({ transactions }: TransactionHistoryChartProps) {
  const data = useMemo(() => {
    if (!transactions.length) return [];

    // Sort by date ascending
    const sorted = [...transactions].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return sorted.map(tx => ({
      date: tx.date,
      amount: Number(tx.amount),
      type: tx.type,
      formattedDate: isValid(parseISO(tx.date)) ? format(parseISO(tx.date), 'd MMM', { locale: es }) : tx.date
    }));
  }, [transactions]);

  if (data.length === 0) return null;

  return (
    <div className="h-60 w-full mb-6 bg-white/5 rounded-xl p-4 border border-white/5">
      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">Tendencia Histórica</h4>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
          <XAxis 
            dataKey="formattedDate" 
            stroke="#9ca3af" 
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            stroke="#9ca3af" 
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `$${value.toLocaleString('es-MX', { notation: 'compact' })}`}
          />
          <Tooltip
            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
            contentStyle={{
              backgroundColor: 'rgba(11, 15, 26, 0.9)',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.36)',
              backdropFilter: 'blur(10px)',
              color: '#fff'
            }}
            formatter={(value: number) => [`$${value.toLocaleString('es-MX')}`, 'Monto']}
            labelStyle={{ color: '#9ca3af', marginBottom: '0.5rem' }}
          />
          <ReferenceLine y={0} stroke="#4B5563" />
          <Bar 
            dataKey="amount" 
            fill="#818CF8" 
            radius={[4, 4, 4, 4]}
            barSize={40}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
