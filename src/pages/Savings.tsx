import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Plus, Target, Trophy, X, Pencil, Trash2, TrendingUp } from 'lucide-react';
import { format, parseISO, isValid, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';

const savingsSchema = z.object({
  name: z.string().min(3, 'Nombre muy corto'),
  target_amount: z.number().min(1, 'La meta debe ser mayor a 0'),
  current_amount: z.number().min(0, 'No puede ser negativo'),
  deadline: z.string().optional(),
});

type SavingsFormData = z.infer<typeof savingsSchema>;

import { SavingsGoal } from '@/types';

export default function Savings() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);

  const [deletingGoal, setDeletingGoal] = useState<SavingsGoal | null>(null);

  // State for adding/removing funds modal
  const [managingFundsFor, setManagingFundsFor] = useState<SavingsGoal | null>(null);
  const [amountToManage, setAmountToManage] = useState('');
  const [transactionType, setTransactionType] = useState<'deposit' | 'withdraw'>('deposit');

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<SavingsFormData>({
    resolver: zodResolver(savingsSchema),
    defaultValues: {
      name: '',
      target_amount: 0,
      current_amount: 0,
      deadline: ''
    }
  });

  const fetchGoals = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('savings_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGoals(data as SavingsGoal[] || []);
    } catch (error) {
      console.error('Error fetching savings goals:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleEdit = (goal: SavingsGoal) => {
    setEditingGoal(goal);
    setValue('name', goal.name);
    setValue('target_amount', goal.target_amount);
    setValue('current_amount', goal.current_amount);
    if (goal.deadline) {
      setValue('deadline', goal.deadline);
    }
    setShowForm(true);
  };

  const confirmDelete = async () => {
    if (!deletingGoal) return;
    try {
      const { error } = await supabase
        .from('savings_goals')
        .delete()
        .eq('id', deletingGoal.id);

      if (error) throw error;
      setDeletingGoal(null);
      fetchGoals();
    } catch (error) {
      console.error('Error deleting goal:', error);
    }
  };

  const onSubmit = async (data: SavingsFormData) => {
    if (!user) return;
    setSaving(true);
    try {
      if (editingGoal) {
        const { error } = await supabase
          .from('savings_goals')
          .update({
            name: data.name,
            target_amount: data.target_amount,
            current_amount: data.current_amount,
            deadline: data.deadline || null
          })
          .eq('id', editingGoal.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('savings_goals')
          .insert({
            user_id: user.id,
            name: data.name,
            target_amount: data.target_amount,
            current_amount: data.current_amount,
            deadline: data.deadline || null
          });
        if (error) throw error;
      }

      reset();
      setShowForm(false);
      setEditingGoal(null);
      fetchGoals();
    } catch (error) {
      console.error('Error saving goal:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleManageFunds = async () => {
    if (!managingFundsFor || !amountToManage) return;

    const amount = Number(amountToManage);
    if (isNaN(amount) || amount <= 0) return;

    const newAmount = transactionType === 'deposit'
      ? managingFundsFor.current_amount + amount
      : managingFundsFor.current_amount - amount;

    if (newAmount < 0) {
      alert('No puedes retirar más de lo que tienes ahorrado.');
      return;
    }

    try {
      const { error } = await supabase
        .from('savings_goals')
        .update({ current_amount: newAmount })
        .eq('id', managingFundsFor.id);

      if (error) throw error;

      setManagingFundsFor(null);
      setAmountToManage('');
      fetchGoals();
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white font-heading tracking-wide">Metas de Ahorro</h2>
          <p className="text-gray-400">Visualiza y alcanza tus objetivos financieros</p>
        </div>
        <button
          onClick={() => {
            setEditingGoal(null);
            reset({
              name: '',
              target_amount: 0,
              current_amount: 0,
              deadline: ''
            });
            setShowForm(!showForm);
          }}
          className="flex items-center gap-2 px-4 py-2 btn-primary rounded-lg transition-colors"
        >
          {showForm ? 'Cancelar' : <><Plus className="w-4 h-4" /> Nueva Meta</>}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit(onSubmit)} className="glass-card space-y-4 relative">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {editingGoal ? `Editar Meta: ${editingGoal.name}` : 'Crear Nueva Meta'}
            </h3>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingGoal(null);
                reset({
                  name: '',
                  target_amount: 0,
                  current_amount: 0,
                  deadline: ''
                });
              }}
              className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre de la Meta</label>
              <input
                {...register('name')}
                placeholder="Ej: Viaje a Europa"
                className="input-primary p-2.5"
              />
              {errors.name && <p className="text-[#F472B6] text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Monto Objetivo</label>
              <input
                type="number"
                step="0.01"
                {...register('target_amount', { valueAsNumber: true })}
                className="input-primary p-2.5"
              />
              {errors.target_amount && <p className="text-[#F472B6] text-xs mt-1">{errors.target_amount.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ahorro Actual</label>
              <input
                type="number"
                step="0.01"
                {...register('current_amount', { valueAsNumber: true })}
                className="input-primary p-2.5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha Límite (Opcional)</label>
              <input
                type="date"
                {...register('deadline')}
                className="input-primary p-2.5 dark:[color-scheme:dark]"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingGoal(null);
                reset({
                  name: '',
                  target_amount: 0,
                  current_amount: 0,
                  deadline: ''
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
              {editingGoal ? 'Actualizar Meta' : 'Crear Meta'}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <div key={i} className="h-40 bg-white/5 rounded-xl animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal) => {
            const percentage = Math.min((goal.current_amount / goal.target_amount) * 100, 100);
            const isCompleted = percentage === 100;
            const remaining = Math.max(goal.target_amount - goal.current_amount, 0);

            return (
              <div key={goal.id} className="glass-card hover:bg-white/5 transition-colors relative overflow-hidden group">
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <button onClick={() => handleEdit(goal)} className="p-1.5 bg-black/20 hover:bg-black/40 rounded-lg text-white transition-colors">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => setDeletingGoal(goal)} className="p-1.5 bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {isCompleted && (
                  <div className="absolute top-0 right-0 bg-yellow-400 p-2 rounded-bl-xl shadow-sm z-0">
                    <Trophy className="w-5 h-5 text-white" />
                  </div>
                )}

                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2 rounded-lg ${isCompleted ? 'bg-yellow-500/20 text-yellow-400' : 'bg-[#6EE7F9]/10 text-[#6EE7F9]'}`}>
                    <Target className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 dark:text-white truncate">{goal.name}</h3>
                    {goal.deadline && (
                      <div className="flex flex-col">
                        <p className="text-xs text-gray-500">
                          Vence: {format(parseISO(goal.deadline), "d MMM yyyy", { locale: es })}
                        </p>
                        {(() => {
                          const daysLeft = differenceInDays(parseISO(goal.deadline), new Date());
                          return (
                            <span className={`text-xs font-medium mt-0.5 ${daysLeft < 0 ? 'text-red-400' :
                              daysLeft < 30 ? 'text-yellow-400' : 'text-green-400'
                              }`}>
                              {daysLeft < 0 ? `Venció hace ${Math.abs(daysLeft)} días` :
                                daysLeft === 0 ? 'Vence hoy' :
                                  `Quedan ${daysLeft} días`}
                            </span>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-sm text-gray-400">Progreso</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">${goal.current_amount.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-400 mb-1">de ${goal.target_amount.toLocaleString()}</p>
                      <p className="text-xs text-[#A78BFA]">Faltan: ${remaining.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-[#6EE7F9]">{percentage.toFixed(1)}%</span>
                      {percentage < 50 ? (
                        <span className="text-gray-500">¡Buen comienzo! 🚀</span>
                      ) : percentage < 80 ? (
                        <span className="text-[#A78BFA]">¡Ya falta poco! 🔥</span>
                      ) : (
                        <span className="text-yellow-400">¡Casi lo logras! 🏆</span>
                      )}
                    </div>
                    <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ${isCompleted ? 'bg-yellow-400' : 'bg-gradient-to-r from-[#6EE7F9] to-[#A78BFA]'}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => {
                        setManagingFundsFor(goal);
                        setTransactionType('deposit');
                      }}
                      className="flex-1 py-2 text-sm font-medium text-[#6EE7F9] bg-[#6EE7F9]/10 rounded-lg hover:bg-[#6EE7F9]/20 transition-colors flex items-center justify-center gap-1"
                    >
                      <TrendingUp className="w-4 h-4" />
                      Ingresar
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal para gestionar fondos */}
      {managingFundsFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#0B0F1A] rounded-2xl w-full max-w-sm p-6 shadow-2xl border border-white/10">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Gestionar Fondos</h3>
              <button
                onClick={() => {
                  setManagingFundsFor(null);
                  setAmountToManage('');
                }}
                className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-gray-500 mb-6">
              {transactionType === 'deposit' ? 'Agregando a' : 'Retirando de'}: <span className="font-semibold text-gray-900 dark:text-white">{managingFundsFor.name}</span>
            </p>

            <div className="flex p-1 bg-gray-100 dark:bg-white/5 rounded-lg mb-6">
              <button
                onClick={() => setTransactionType('deposit')}
                className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${transactionType === 'deposit'
                  ? 'bg-white dark:bg-[#6EE7F9]/20 text-gray-900 dark:text-[#6EE7F9] shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                  }`}
              >
                Ingresar
              </button>
              <button
                onClick={() => setTransactionType('withdraw')}
                className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${transactionType === 'withdraw'
                  ? 'bg-white dark:bg-red-500/20 text-gray-900 dark:text-red-400 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                  }`}
              >
                Retirar
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Monto</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                  <input
                    type="number"
                    value={amountToManage}
                    onChange={(e) => setAmountToManage(e.target.value)}
                    className="input-primary pl-7 p-2.5 w-full"
                    placeholder="0.00"
                    autoFocus
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setManagingFundsFor(null);
                    setAmountToManage('');
                  }}
                  className="flex-1 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleManageFunds}
                  disabled={!amountToManage || Number(amountToManage) <= 0}
                  className={`flex-1 py-2 text-sm font-medium text-white rounded-lg transition-all disabled:opacity-50 ${transactionType === 'deposit'
                    ? 'bg-gradient-to-r from-[#6EE7F9] to-[#A78BFA] hover:opacity-90'
                    : 'bg-red-500 hover:bg-red-600'
                    }`}
                >
                  {transactionType === 'deposit' ? 'Confirmar Ingreso' : 'Confirmar Retiro'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {deletingGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#0B0F1A] rounded-2xl w-full max-w-sm p-6 shadow-2xl border border-white/10">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Eliminar Meta</h3>
              <button
                onClick={() => setDeletingGoal(null)}
                className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              ¿Estás seguro que deseas eliminar la meta <span className="font-bold text-gray-900 dark:text-white">"{deletingGoal.name}"</span>? Esta acción no se puede deshacer.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setDeletingGoal(null)}
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
