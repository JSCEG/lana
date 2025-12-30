import { X, FileText, Download, Loader2 } from 'lucide-react';
import { Transaction } from '@/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useState } from 'react';
import { exportToExcel, exportToPDF } from '@/utils/exportUtils';
import TransactionHistoryChart from './TransactionHistoryChart';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  transactions: Transaction[];
}

export default function HistoryModal({ isOpen, onClose, title, transactions }: HistoryModalProps) {
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      const data = transactions.map(t => ({
        Fecha: format(new Date(t.date), 'dd/MM/yyyy'),
        Descripción: t.description,
        Categoría: t.category?.name || 'General',
        Tipo: t.type === 'income' ? 'Ingreso' : 'Gasto',
        Monto: Number(t.amount)
      }));
      exportToExcel(data, `Reporte_${title.replace(/\s+/g, '_')}_${format(new Date(), 'yyyyMMdd')}`);
    } catch (error) {
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const columns = ['Fecha', 'Descripción', 'Categoría', 'Tipo', 'Monto'];
      const data = transactions.map(t => [
        format(new Date(t.date), 'dd/MM/yyyy'),
        t.description,
        t.category?.name || 'General',
        t.type === 'income' ? 'Ingreso' : 'Gasto',
        `$${Number(t.amount).toLocaleString('es-MX')}`
      ]);
      exportToPDF(
        `Reporte: ${title}`,
        columns,
        data,
        `Reporte_${title.replace(/\s+/g, '_')}_${format(new Date(), 'yyyyMMdd')}`
      );
    } catch (error) {
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#0B0F1A] rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl border border-white/10">
        <div className="p-6 border-b border-gray-100 dark:border-white/10 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{transactions.length} movimientos encontrados</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4 flex gap-2 justify-end border-b border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5">
          <button
            onClick={handleExportExcel}
            disabled={isExporting}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50"
          >
            {isExporting ? <Loader2 className="w-3 h-3 animate-spin" /> : <FileText className="w-3 h-3" />}
            Excel
          </button>
          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
          >
            {isExporting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
            PDF
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {transactions.length === 0 ? (
            <p className="text-center text-gray-400">No hay movimientos para mostrar.</p>
          ) : (
            <>
              <TransactionHistoryChart transactions={transactions} />
              <div className="space-y-3">
                {transactions.map((tx) => (
                  <div key={tx.id} className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{tx.description}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {format(new Date(tx.date), "d MMM yyyy", { locale: es })} • {tx.category?.name}
                      </p>
                    </div>
                    <span className={`font-semibold ${tx.type === 'income' ? 'text-[#6EE7F9]' : 'text-gray-900 dark:text-white'}`}>
                      {tx.type === 'income' ? '+' : '-'}${Number(tx.amount).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
