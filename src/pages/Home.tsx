import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import SummaryCards from '@/components/dashboard/SummaryCards';
import ExpenseChart from '@/components/dashboard/ExpenseChart';
import RecentTransactions from '@/components/dashboard/RecentTransactions';

export default function Home() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    totalBalance: 0,
    totalIncome: 0,
    totalExpenses: 0,
    savingsRate: 0,
    recentTransactions: [],
    expenseByCategory: []
  });

  useEffect(() => {
    async function fetchDashboardData() {
      if (!user) return;
      
      try {
        // Fetch transactions for calculations
        const { data: transactions } = await supabase
          .from('transactions')
          .select(`
            *,
            category:categories(name)
          `)
          .order('date', { ascending: false });

        if (!transactions) return;

        // Calculate totals
        const income = transactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + Number(t.amount), 0);
          
        const expenses = transactions
          .filter(t => t.type.includes('expense'))
          .reduce((sum, t) => sum + Number(t.amount), 0);

        // Calculate expenses by category for chart
        const expensesByCategory = transactions
          .filter(t => t.type.includes('expense'))
          .reduce((acc: any, t) => {
            const catName = t.category?.name || 'Otros';
            acc[catName] = (acc[catName] || 0) + Number(t.amount);
            return acc;
          }, {});

        const chartData = Object.entries(expensesByCategory).map(([name, value]) => ({
          name,
          value: Number(value),
          color: '#6366f1' // Colors handled in component
        }));

        setDashboardData({
          totalBalance: income - expenses,
          totalIncome: income,
          totalExpenses: expenses,
          savingsRate: income > 0 ? ((income - expenses) / income) * 100 : 0,
          recentTransactions: transactions.slice(0, 5) as any,
          expenseByCategory: chartData as any
        });

      } catch (error) {
        console.error('Error loading dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDashboardData();
  }, [user]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Hola, {user?.user_metadata?.full_name?.split(' ')[0] || 'Usuario'} 👋</h2>
        <p className="text-gray-500">Aquí está el resumen de tus finanzas</p>
      </div>

      <SummaryCards
        totalBalance={dashboardData.totalBalance}
        totalIncome={dashboardData.totalIncome}
        totalExpenses={dashboardData.totalExpenses}
        savingsRate={dashboardData.savingsRate}
        isLoading={isLoading}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ExpenseChart 
          data={dashboardData.expenseByCategory}
          isLoading={isLoading}
        />
        <RecentTransactions 
          transactions={dashboardData.recentTransactions}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
