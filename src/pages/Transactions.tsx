import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import TransactionForm from '@/components/transactions/TransactionForm';
import TransactionList from '@/components/transactions/TransactionList';

import { Transaction } from '@/types';

export default function Transactions() {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          category:categories(name, color, icon)
        `)
        .order('date', { ascending: false });

      if (error) throw error;
      setTransactions(data as unknown as Transaction[] || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este movimiento?')) return;

    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchTransactions();
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-white font-heading tracking-wide">Historial de Movimientos</h2>
          <p className="text-sm text-gray-400">Gestiona tus ingresos y gastos detalladamente</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 btn-primary font-medium text-sm"
          >
            <Plus className="w-4 h-4" />
            Nuevo Movimiento
          </button>
        )}
      </div>

      {showForm && (
        <TransactionForm
          onSuccess={() => {
            setShowForm(false);
            fetchTransactions();
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      <TransactionList
        transactions={transactions}
        onDelete={handleDelete}
        isLoading={loading}
      />
    </div>
  );
}
