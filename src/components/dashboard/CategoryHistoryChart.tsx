import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { format, parseISO, isValid, startOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import { Transaction } from '@/types';

interface CategoryHistoryChartProps {
  transactions: Transaction[];
  isLoading: boolean;
}

export default function CategoryHistoryChart({ transactions, isLoading }: CategoryHistoryChartProps) {
  const { data, categories } = useMemo(() => {
    if (!transactions.length) return { data: [], categories: [] };

    // Filter only expenses
    const expenses = transactions.filter(t => t.type.includes('expense'));

    // Group by month and category
    const groupedData: Record<string, Record<string, number>> = {};
    const allCategories = new Set<string>();

    expenses.forEach(tx => {
      const date = parseISO(tx.date);
      if (!isValid(date)) return;
      
      const monthKey = format(startOfMonth(date), 'yyyy-MM');
      const categoryName = tx.category?.name || 'Otros';
      
      allCategories.add(categoryName);
      
      if (!groupedData[monthKey]) {
        groupedData[monthKey] = {};
      }
      
      groupedData[monthKey][categoryName] = (groupedData[monthKey][categoryName] || 0) + Number(tx.amount);
    });

    // Transform to array and sort by date
    const chartData = Object.entries(groupedData)
      .map(([month, cats]) => ({
        month,
        formattedMonth: format(parseISO(month + '-01'), 'MMM yyyy', { locale: es }),
        ...cats
      }))
      .sort((a, b) => a.month.localeCompare(b.month))
      // Take last 6 months to avoid overcrowding
      .slice(-6); 

    return { 
      data: chartData, 
      categories: Array.from(allCategories) 
    };
  }, [transactions]);

  const COLORS = ['#F472B6', '#A78BFA', '#6EE7F9', '#818CF8', '#34D399', '#FBBF24', '#60A5FA'];

  if (isLoading) {
    return <div className="h-80 bg-white/5 rounded-xl animate-pulse" />;
  }

  if (data.length === 0) {
    return (
      <div className="glass-card h-80 flex flex-col items-center justify-center text-center">
        <p className="text-gray-400">No hay datos de gastos para mostrar historial</p>
      </div>
    );
  }

  return (
    <div className="glass-card h-80">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 font-heading tracking-wide">
        Gastos por Categoría (Últimos 6 meses)
      </h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
            <XAxis 
              dataKey="formattedMonth" 
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
              formatter={(value: number) => [`$${value.toLocaleString('es-MX')}`]}
              labelStyle={{ color: '#9ca3af', marginBottom: '0.5rem' }}
            />
            <Legend wrapperStyle={{ paddingTop: '10px' }} />
            {categories.map((cat, index) => (
              <Bar 
                key={cat} 
                dataKey={cat} 
                stackId="a" 
                fill={COLORS[index % COLORS.length]} 
                radius={index === categories.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
