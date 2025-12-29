import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Plus, PieChart, AlertCircle } from 'lucide-react';

const budgetSchema = z.object({
  category_name: z.string().min(1, 'La categoría es requerida'),
  amount_limit: z.number().min(1, 'El límite debe ser mayor a 0'),
  period: z.string().regex(/^\d{4}-\d{2}$/, 'Formato inválido (YYYY-MM)'),
});

type BudgetFormData = z.infer<typeof budgetSchema>;

import { Budget } from '@/types';

export default function Budgets() {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<BudgetFormData>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      period: new Date().toISOString().slice(0, 7) // Current YYYY-MM
    }
  });

  const fetchBudgets = async () => {
    if (!user) return;
    try {
      // 1. Get budgets
      const { data: budgetsData, error: budgetError } = await supabase
        .from('budgets')
        .select(`
          *,
          category:categories(name, color)
        `)
        .eq('user_id', user.id);

      if (budgetError) throw budgetError;

      // 2. Calculate spent amount for each budget in the current period
      const budgetsWithProgress = await Promise.all(budgetsData.map(async (budget) => {
        const { data: transactions } = await supabase
          .from('transactions')
          .select('amount')
          .eq('category_id', budget.category_id)
          .gte('date', `${budget.period}-01`)
          .lte('date', `${budget.period}-31`);

        const spent = transactions?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;
        return { ...budget, spent };
      }));

      setBudgets(budgetsWithProgress as unknown as Budget[]);
    } catch (error) {
      console.error('Error fetching budgets:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const onSubmit = async (data: BudgetFormData) => {
    if (!user) return;
    setSaving(true);
    try {
      // Find category first
      let categoryId;
      const { data: category } = await supabase
        .from('categories')
        .select('id')
        .eq('name', data.category_name)
        .eq('user_id', user.id)
        .single();

      if (category) {
        categoryId = category.id;
      } else {
        // Create category if not exists
        const { data: newCategory, error: catError } = await supabase
          .from('categories')
          .insert({
            user_id: user.id,
            name: data.category_name,
            type: 'expense',
            icon: 'PieChart',
            color: '#6366f1'
          })
          .select()
          .single();
        if (catError) throw catError;
        categoryId = newCategory.id;
      }

      const { error } = await supabase
        .from('budgets')
        .upsert({
          user_id: user.id,
          category_id: categoryId,
          amount_limit: data.amount_limit,
          period: data.period
        });

      if (error) throw error;

      reset();
      setShowForm(false);
      fetchBudgets();
    } catch (error) {
      console.error('Error saving budget:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white font-heading tracking-wide">Presupuestos Mensuales</h2>
          <p className="text-gray-400">Define límites para mantener tus gastos bajo control</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 btn-primary rounded-lg transition-colors"
        >
          {showForm ? 'Cancelar' : <><Plus className="w-4 h-4" /> Nuevo Presupuesto</>}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit(onSubmit)} className="glass-card space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Categoría</label>
              <input
                {...register('category_name')}
                placeholder="Ej: Restaurantes"
                className="input-primary p-2.5"
              />
              {errors.category_name && <p className="text-[#F472B6] text-xs mt-1">{errors.category_name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Límite Mensual</label>
              <input
                type="number"
                step="0.01"
                {...register('amount_limit', { valueAsNumber: true })}
                className="input-primary p-2.5"
              />
              {errors.amount_limit && <p className="text-[#F472B6] text-xs mt-1">{errors.amount_limit.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Periodo</label>
              <input
                type="month"
                {...register('period')}
                className="input-primary p-2.5"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 btn-primary rounded-lg disabled:opacity-50 flex items-center gap-2"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              Guardar
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map(i => <div key={i} className="h-32 bg-white/5 rounded-xl animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgets.map((budget) => {
            const percentage = Math.min((budget.spent / budget.amount_limit) * 100, 100);
            const isOverLimit = budget.spent > budget.amount_limit;

            return (
              <div key={budget.id} className="glass-card hover:bg-white/5 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#A78BFA]/10 rounded-lg text-[#A78BFA]">
                      <PieChart className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{budget.category.name}</h3>
                      <p className="text-xs text-gray-400">{budget.period}</p>
                    </div>
                  </div>
                  {isOverLimit && (
                    <div className="text-[#F472B6]" title="Has excedido el límite">
                      <AlertCircle className="w-5 h-5" />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Gastado</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      ${budget.spent.toLocaleString('es-MX')} / ${budget.amount_limit.toLocaleString('es-MX')}
                    </span>
                  </div>

                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${isOverLimit ? 'bg-[#F472B6]' : percentage > 80 ? 'bg-yellow-500' : 'bg-[#6EE7F9]'
                        }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  <p className="text-xs text-right text-gray-400">
                    {percentage.toFixed(1)}% utilizado
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
