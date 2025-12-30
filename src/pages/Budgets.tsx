import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Plus, PieChart, AlertCircle, Pencil, Trash2, X } from 'lucide-react';

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
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [deletingBudget, setDeletingBudget] = useState<Budget | null>(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<BudgetFormData>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      category_name: '',
      amount_limit: 0,
      period: new Date().toISOString().slice(0, 7)
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

  const handleEdit = (budget: Budget) => {
    setEditingBudget(budget);
    setValue('category_name', budget.category.name);
    setValue('amount_limit', budget.amount_limit);
    setValue('period', budget.period);
    setShowForm(true);
  };

  const confirmDelete = async () => {
    if (!deletingBudget) return;
    try {
      const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', deletingBudget.id);

      if (error) throw error;
      setDeletingBudget(null);
      fetchBudgets();
    } catch (error) {
      console.error('Error deleting budget:', error);
    }
  };

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

      if (editingBudget) {
        const { error } = await supabase
          .from('budgets')
          .update({
            category_id: categoryId,
            amount_limit: data.amount_limit,
            period: data.period
          })
          .eq('id', editingBudget.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('budgets')
          .insert({
            user_id: user.id,
            category_id: categoryId,
            amount_limit: data.amount_limit,
            period: data.period
          });
        if (error) throw error;
      }

      reset({
        category_name: '',
        amount_limit: 0,
        period: new Date().toISOString().slice(0, 7)
      });
      setShowForm(false);
      setEditingBudget(null);
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
          onClick={() => {
            setEditingBudget(null);
            reset({
              category_name: '',
              amount_limit: 0,
              period: new Date().toISOString().slice(0, 7)
            });
            setShowForm(!showForm);
          }}
          className="flex items-center gap-2 px-4 py-2 btn-primary rounded-lg transition-colors"
        >
          {showForm ? 'Cancelar' : <><Plus className="w-4 h-4" /> Nuevo Presupuesto</>}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit(onSubmit)} className="glass-card space-y-4 relative">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {editingBudget ? `Editar Presupuesto: ${editingBudget.category.name}` : 'Crear Nuevo Presupuesto'}
            </h3>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingBudget(null);
                reset({
                  category_name: '',
                  amount_limit: 0,
                  period: new Date().toISOString().slice(0, 7)
                });
              }}
              className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Categoría</label>
              <input
                {...register('category_name')}
                placeholder="Ej: Restaurantes"
                className="input-primary p-2.5"
              />
              {errors.category_name && <p className="text-[#F472B6] text-xs mt-1">{errors.category_name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Límite Mensual</label>
              <input
                type="number"
                step="0.01"
                {...register('amount_limit', { valueAsNumber: true })}
                className="input-primary p-2.5"
              />
              {errors.amount_limit && <p className="text-[#F472B6] text-xs mt-1">{errors.amount_limit.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Periodo</label>
              <input
                type="month"
                {...register('period')}
                className="input-primary p-2.5 dark:[color-scheme:dark]"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingBudget(null);
                reset({
                  category_name: '',
                  amount_limit: 0,
                  period: new Date().toISOString().slice(0, 7)
                });
              }}
              className="px-6 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 btn-primary rounded-lg disabled:opacity-50 flex items-center gap-2"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {editingBudget ? 'Actualizar' : 'Guardar'}
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
            const remaining = Math.max(budget.amount_limit - budget.spent, 0);

            return (
              <div key={budget.id} className="glass-card hover:bg-white/5 transition-colors relative overflow-hidden group">
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <button onClick={() => handleEdit(budget)} className="p-1.5 bg-black/20 hover:bg-black/40 rounded-lg text-white transition-colors">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => setDeletingBudget(budget)} className="p-1.5 bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

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

                  <div className="flex justify-between text-xs">
                    <p className={`text-right ${isOverLimit ? 'text-[#F472B6] font-bold' : 'text-gray-400'}`}>
                      {percentage.toFixed(1)}% utilizado
                    </p>
                    <p className="text-right text-[#A78BFA]">
                      Restante: ${remaining.toLocaleString('es-MX')}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {deletingBudget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#0B0F1A] rounded-2xl w-full max-w-sm p-6 shadow-2xl border border-white/10">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Eliminar Presupuesto</h3>
              <button
                onClick={() => setDeletingBudget(null)}
                className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              ¿Estás seguro que deseas eliminar el presupuesto de <span className="font-bold text-gray-900 dark:text-white">"{deletingBudget.category.name}"</span>? Esta acción no se puede deshacer.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setDeletingBudget(null)}
                className="flex-1 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
