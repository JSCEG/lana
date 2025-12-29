import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Link } from 'react-router-dom';

interface Transaction {
  id: string;
  amount: number;
  description: string;
  date: string;
  type: string;
  category?: {
    name: string;
  };
}

interface RecentTransactionsProps {
  transactions: Transaction[];
  isLoading: boolean;
}

export default function RecentTransactions({ transactions, isLoading }: RecentTransactionsProps) {
  if (isLoading) {
    return <div className="h-80 bg-white/5 rounded-xl animate-pulse" />;
  }

  return (
    <div className="glass-card h-80 flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white font-heading tracking-wide">Actividad Reciente</h3>
        <Link to="/transactions" className="text-sm text-[#A78BFA] hover:text-[#F472B6] font-medium transition-colors">
          Ver todo
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
        {transactions.length === 0 ? (
          <p className="text-center text-gray-400 py-8">No hay movimientos recientes</p>
        ) : (
          transactions.map((tx) => {
            const isExpense = tx.type.includes('expense');
            return (
              <div key={tx.id} className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${isExpense ? 'bg-[#F472B6]/10 text-[#F472B6]' : 'bg-[#6EE7F9]/10 text-[#6EE7F9]'
                    }`}>
                    {isExpense ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">{tx.description}</p>
                    <p className="text-xs text-gray-400">
                      {format(new Date(tx.date), "d MMM", { locale: es })} • {tx.category?.name || 'General'}
                    </p>
                  </div>
                </div>
                <span className={`text-sm font-semibold whitespace-nowrap ${isExpense ? 'text-gray-900 dark:text-white' : 'text-[#6EE7F9]'
                  }`}>
                  {isExpense ? '-' : '+'}${tx.amount.toLocaleString('es-MX', { minimumFractionDigits: 0 })}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
