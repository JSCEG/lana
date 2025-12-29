import { ArrowDownLeft, ArrowUpRight, Wallet, PiggyBank } from 'lucide-react';

interface SummaryCardsProps {
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
  savingsRate: number;
  isLoading: boolean;
}

export default function SummaryCards({ 
  totalBalance, 
  totalIncome, 
  totalExpenses, 
  savingsRate,
  isLoading 
}: SummaryCardsProps) {
  const cards = [
    {
      title: 'Balance Total',
      amount: totalBalance,
      icon: Wallet,
      color: 'bg-indigo-600',
      textColor: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
    {
      title: 'Ingresos del Mes',
      amount: totalIncome,
      icon: ArrowDownLeft,
      color: 'bg-green-600',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Gastos del Mes',
      amount: totalExpenses,
      icon: ArrowUpRight,
      color: 'bg-red-600',
      textColor: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      title: 'Tasa de Ahorro',
      amount: savingsRate,
      isPercentage: true,
      icon: PiggyBank,
      color: 'bg-blue-600',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div key={card.title} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-2 rounded-lg ${card.bgColor}`}>
              <card.icon className={`w-5 h-5 ${card.textColor}`} />
            </div>
            {card.title === 'Balance Total' && (
              <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                Actual
              </span>
            )}
          </div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">{card.title}</h3>
          <p className={`text-2xl font-bold ${card.title === 'Gastos del Mes' ? 'text-gray-900' : 'text-gray-900'}`}>
            {card.isPercentage 
              ? `${card.amount.toFixed(1)}%` 
              : `$${card.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}
          </p>
        </div>
      ))}
    </div>
  );
}
