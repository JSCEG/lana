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
      color: 'bg-[#A78BFA]',
      textColor: 'text-[#A78BFA]',
      bgColor: 'bg-[#A78BFA]/10',
    },
    {
      title: 'Ingresos del Mes',
      amount: totalIncome,
      icon: ArrowDownLeft,
      color: 'bg-[#6EE7F9]',
      textColor: 'text-[#6EE7F9]',
      bgColor: 'bg-[#6EE7F9]/10',
    },
    {
      title: 'Gastos del Mes',
      amount: totalExpenses,
      icon: ArrowUpRight,
      color: 'bg-[#F472B6]',
      textColor: 'text-[#F472B6]',
      bgColor: 'bg-[#F472B6]/10',
    },
    {
      title: 'Tasa de Ahorro',
      amount: savingsRate,
      isPercentage: true,
      icon: PiggyBank,
      color: 'bg-[#6EE7F9]',
      textColor: 'text-[#6EE7F9]',
      bgColor: 'bg-[#6EE7F9]/10',
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div key={card.title} className="glass-card">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-2 rounded-lg ${card.bgColor}`}>
              <card.icon className={`w-5 h-5 ${card.textColor}`} />
            </div>
            {card.title === 'Balance Total' && (
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                Actual
              </span>
            )}
          </div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{card.title}</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {card.isPercentage
              ? `${card.amount.toFixed(1)}%`
              : `$${card.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}
          </p>
        </div>
      ))}
    </div>
  );
}
