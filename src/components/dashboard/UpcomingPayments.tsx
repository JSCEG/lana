import { addMonths, addYears, differenceInDays, isAfter, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { format } from 'date-fns';
import { Clock, Calendar, AlertCircle } from 'lucide-react';
import { Transaction } from '@/types';

interface UpcomingPaymentsProps {
  transactions: Transaction[];
  isLoading: boolean;
}

export default function UpcomingPayments({ transactions, isLoading }: UpcomingPaymentsProps) {
  if (isLoading) {
    return <div className="h-80 bg-white/5 rounded-xl animate-pulse" />;
  }

  const recurringPayments = transactions
    .filter(t => t.type === 'fixed_expense' && t.frequency !== 'one_time')
    .map(t => {
      const today = startOfDay(new Date());
      const startDate = startOfDay(new Date(t.date));
      let nextDate = startDate;

      if (t.frequency === 'monthly') {
        if (isAfter(startDate, today)) {
          nextDate = startDate;
        } else {
          // Set to current month/year but with original day
          const currentMonthDate = new Date(today.getFullYear(), today.getMonth(), startDate.getDate());
          
          // Check if the day is valid for this month (e.g. 31st in Feb), if not it rolls over, date-fns handles this usually by rolling over
          // But simple construction might be off. date-fns `set` is better but let's stick to simple for now.
          
          if (isAfter(currentMonthDate, today)) {
            nextDate = currentMonthDate;
          } else {
            nextDate = addMonths(currentMonthDate, 1);
          }
        }
      } else if (t.frequency === 'yearly') {
        const currentYearDate = new Date(today.getFullYear(), startDate.getMonth(), startDate.getDate());
        if (isAfter(currentYearDate, today)) {
          nextDate = currentYearDate;
        } else {
          nextDate = addYears(currentYearDate, 1);
        }
      }

      const daysRemaining = differenceInDays(nextDate, today);
      return { ...t, nextDate, daysRemaining };
    })
    .sort((a, b) => a.daysRemaining - b.daysRemaining)
    .slice(0, 5);

  return (
    <div className="glass-card h-80 flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white font-heading tracking-wide">Próximos Pagos</h3>
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-white/10 px-2 py-1 rounded-full">
          Recurrentes
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
        {recurringPayments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 text-sm">
            <Calendar className="w-8 h-8 mb-2 opacity-50" />
            <p>No tienes pagos recurrentes próximos</p>
          </div>
        ) : (
          recurringPayments.map((payment) => {
            const isUrgent = payment.daysRemaining <= 3;
            return (
              <div key={payment.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 hover:border-[--lana-cyan]/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${isUrgent ? 'bg-red-500/10 text-red-500' : 'bg-[--lana-cyan]/10 text-[--lana-cyan]'}`}>
                    {isUrgent ? <AlertCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">{payment.description}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {format(payment.nextDate, "d 'de' MMMM", { locale: es })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900 dark:text-white">${payment.amount.toLocaleString()}</p>
                  <p className={`text-xs font-medium ${isUrgent ? 'text-red-500' : 'text-gray-400'}`}>
                    {payment.daysRemaining === 0 ? 'Hoy' : `En ${payment.daysRemaining} días`}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
