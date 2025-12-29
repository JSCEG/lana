import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ArrowDownLeft, ArrowUpRight, Calendar, Trash2 } from 'lucide-react';

interface Transaction {
  id: string;
  amount: number;
  description: string;
  date: string;
  type: 'fixed_expense' | 'variable_expense' | 'income';
  category?: {
    name: string;
    color: string;
  };
}

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  isLoading: boolean;
}

export default function TransactionList({ transactions, onDelete, isLoading }: TransactionListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 glass-card">
        <div className="mx-auto w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-3">
          <Calendar className="w-6 h-6 text-gray-400" />
        </div>
        <h3 className="text-sm font-medium text-gray-900 dark:text-white">No hay movimientos</h3>
        <p className="mt-1 text-sm text-gray-400">Registra tu primer gasto o ingreso para comenzar.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {transactions.map((tx) => {
        const isExpense = tx.type.includes('expense');
        return (
          <div
            key={tx.id}
            className="flex items-center justify-between p-4 glass-card hover:bg-white/5 transition-colors group"
          >
            <div className="flex items-center gap-4">
              <div className={`p-2 rounded-full ${isExpense ? 'bg-[#F472B6]/10 text-[#F472B6]' : 'bg-[#6EE7F9]/10 text-[#6EE7F9]'
                }`}>
                {isExpense ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />}
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{tx.description}</p>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <span className="capitalize">{tx.category?.name || 'Sin categoría'}</span>
                  <span>•</span>
                  <span>{format(new Date(tx.date), "d 'de' MMM, yyyy", { locale: es })}</span>
                </div>
                {tx.notes && (
                  <div className="flex items-center gap-1 mt-1 text-xs text-gray-500 dark:text-gray-400">
                    <StickyNote className="w-3 h-3" />
                    <p className="line-clamp-1">{tx.notes}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className={`font-semibold ${isExpense ? 'text-gray-900 dark:text-white' : 'text-[#6EE7F9]'
                }`}>
                {isExpense ? '-' : '+'}${tx.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </span>
              <button
                onClick={() => onDelete(tx.id)}
                className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                title="Eliminar"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
