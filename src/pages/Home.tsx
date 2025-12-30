import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import SummaryCards from '@/components/dashboard/SummaryCards';
import ExpenseChart from '@/components/dashboard/ExpenseChart';
import RecentTransactions from '@/components/dashboard/RecentTransactions';
import UpcomingPayments from '@/components/dashboard/UpcomingPayments';
import HistoryModal from '@/components/dashboard/HistoryModal';
import BalanceHistoryChart from '@/components/dashboard/BalanceHistoryChart';
import CategoryHistoryChart from '@/components/dashboard/CategoryHistoryChart';
import TransactionForm from '@/components/transactions/TransactionForm';
import { Transaction } from '@/types';
import { FileText, Download, Loader2 } from 'lucide-react';
import { exportToExcel, exportToPDF } from '@/utils/exportUtils';
import { format } from 'date-fns';

export default function Home() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    totalBalance: 0,
    totalIncome: 0,
    totalExpenses: 0,
    savingsRate: 0,
    recentTransactions: [] as Transaction[],
    allTransactions: [] as Transaction[],
    expenseByCategory: [] as { name: string; value: number; color: string }[]
  });

  const [historyModal, setHistoryModal] = useState<{ isOpen: boolean; title: string; transactions: Transaction[] }>({
    isOpen: false,
    title: '',
    transactions: []
  });

  const [transactionModal, setTransactionModal] = useState<{ isOpen: boolean; prefillData: Partial<Transaction> | null }>({
    isOpen: false,
    prefillData: null
  });

  const fetchDashboardData = useCallback(async () => {
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
        .reduce((acc: Record<string, number>, t) => {
          const tx = t as unknown as Transaction;
          const catName = tx.category?.name || 'Otros';
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
        recentTransactions: transactions.slice(0, 5) as unknown as Transaction[],
        allTransactions: transactions as unknown as Transaction[],
        expenseByCategory: chartData
      });

    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleUpcomingPaymentClick = (payment: any) => {
    setTransactionModal({
      isOpen: true,
      prefillData: {
        description: payment.description,
        amount: payment.amount,
        category: payment.category,
        type: 'fixed_expense',
        frequency: 'one_time',
        date: payment.nextDate ? format(new Date(payment.nextDate), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')
      }
    });
  };

  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      const data = dashboardData.allTransactions.map(t => ({
        Fecha: format(new Date(t.date), 'dd/MM/yyyy'),
        Descripción: t.description,
        Categoría: t.category?.name || 'General',
        Tipo: t.type === 'income' ? 'Ingreso' : 'Gasto',
        Monto: Number(t.amount)
      }));

      exportToExcel(data, `Reporte_Finanzas_${format(new Date(), 'yyyyMMdd')}`);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('Error al exportar a Excel');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const columns = ['Fecha', 'Descripción', 'Categoría', 'Tipo', 'Monto'];
      const data = dashboardData.allTransactions.map(t => [
        format(new Date(t.date), 'dd/MM/yyyy'),
        t.description,
        t.category?.name || 'General',
        t.type === 'income' ? 'Ingreso' : 'Gasto',
        `$${Number(t.amount).toLocaleString('es-MX')}`
      ]);

      exportToPDF(
        'Reporte de Movimientos Financieros',
        columns,
        data,
        `Reporte_Finanzas_${format(new Date(), 'yyyyMMdd')}`
      );
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      alert('Error al exportar a PDF');
    } finally {
      setIsExporting(false);
    }
  };

  const handleCategoryClick = (categoryName: string) => {
    const filtered = dashboardData.allTransactions.filter(
      t => (t.category?.name || 'Otros') === categoryName && t.type.includes('expense')
    );
    setHistoryModal({
      isOpen: true,
      title: `Gastos: ${categoryName}`,
      transactions: filtered
    });
  };

  const handleTransactionClick = (description: string) => {
    // Filter by description (case insensitive partial match)
    const filtered = dashboardData.allTransactions.filter(
      t => t.description.toLowerCase().includes(description.toLowerCase())
    );
    setHistoryModal({
      isOpen: true,
      title: `Historial: "${description}"`,
      transactions: filtered
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <HistoryModal
        isOpen={historyModal.isOpen}
        onClose={() => setHistoryModal(prev => ({ ...prev, isOpen: false }))}
        title={historyModal.title}
        transactions={historyModal.transactions}
      />
      {transactionModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-lg">
            <TransactionForm
              prefillData={transactionModal.prefillData}
              onSuccess={() => {
                setTransactionModal({ isOpen: false, prefillData: null });
                fetchDashboardData();
              }}
              onCancel={() => setTransactionModal({ isOpen: false, prefillData: null })}
            />
          </div>
        </div>
      )}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Hola, {user?.user_metadata?.full_name?.split(' ')[0] || 'Usuario'} 👋
          </h2>
          <p className="text-gray-500 dark:text-gray-400">Aquí está el resumen de tus finanzas</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleExportExcel}
            disabled={isExporting || isLoading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[--lana-cyan] to-[--lana-violet] hover:opacity-90 text-white rounded-lg text-sm font-medium transition-all shadow-lg hover:shadow-[--lana-cyan]/50 disabled:opacity-50"
          >
            {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
            Excel
          </button>
          <button
            onClick={handleExportPDF}
            disabled={isExporting || isLoading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[--lana-pink] to-red-500 hover:opacity-90 text-white rounded-lg text-sm font-medium transition-all shadow-lg hover:shadow-[--lana-pink]/50 disabled:opacity-50"
          >
            {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            PDF
          </button>
        </div>
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
          onCategoryClick={handleCategoryClick}
        />
        <RecentTransactions
          transactions={dashboardData.recentTransactions}
          isLoading={isLoading}
          onTransactionClick={handleTransactionClick}
        />
      </div>



      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BalanceHistoryChart
          transactions={dashboardData.allTransactions}
          isLoading={isLoading}
        />
        <CategoryHistoryChart
          transactions={dashboardData.allTransactions}
          isLoading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UpcomingPayments
          transactions={dashboardData.allTransactions}
          isLoading={isLoading}
          onPaymentClick={handleUpcomingPaymentClick}
        />
      </div>
    </div>
  );
}
