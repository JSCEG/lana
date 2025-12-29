import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Plus, Target, Trophy } from 'lucide-react';

const savingsSchema = z.object({
  name: z.string().min(3, 'Nombre muy corto'),
  target_amount: z.number().min(1, 'La meta debe ser mayor a 0'),
  current_amount: z.number().min(0, 'No puede ser negativo'),
  deadline: z.string().optional(),
});

type SavingsFormData = z.infer<typeof savingsSchema>;

export default function Savings() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<SavingsFormData>({
    resolver: zodResolver(savingsSchema)
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
      setGoals(data || []);
    } catch (error) {
      console.error('Error fetching savings goals:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, [user]);

  const onSubmit = async (data: SavingsFormData) => {
    if (!user) return;
    setSaving(true);
    try {
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
      reset();
      setShowForm(false);
      fetchGoals();
    } catch (error) {
      console.error('Error saving goal:', error);
    } finally {
      setSaving(false);
    }
  };

  const updateProgress = async (id: string, newAmount: number) => {
    try {
      const { error } = await supabase
        .from('savings_goals')
        .update({ current_amount: newAmount })
        .eq('id', id);
      
      if (error) throw error;
      fetchGoals();
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Metas de Ahorro</h2>
          <p className="text-gray-500">Visualiza y alcanza tus objetivos financieros</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          {showForm ? 'Cancelar' : <><Plus className="w-4 h-4" /> Nueva Meta</>}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Meta</label>
              <input
                {...register('name')}
                placeholder="Ej: Viaje a Europa"
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 border"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Monto Objetivo</label>
              <input
                type="number"
                step="0.01"
                {...register('target_amount', { valueAsNumber: true })}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 border"
              />
              {errors.target_amount && <p className="text-red-500 text-xs mt-1">{errors.target_amount.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ahorro Inicial</label>
              <input
                type="number"
                step="0.01"
                {...register('current_amount', { valueAsNumber: true })}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 border"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              Crear Meta
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <div key={i} className="h-40 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal) => {
            const percentage = Math.min((goal.current_amount / goal.target_amount) * 100, 100);
            const isCompleted = percentage === 100;

            return (
              <div key={goal.id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                {isCompleted && (
                  <div className="absolute top-0 right-0 bg-yellow-400 p-2 rounded-bl-xl shadow-sm">
                    <Trophy className="w-5 h-5 text-white" />
                  </div>
                )}
                
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2 rounded-lg ${isCompleted ? 'bg-yellow-50 text-yellow-600' : 'bg-blue-50 text-blue-600'}`}>
                    <Target className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-gray-900 truncate flex-1">{goal.name}</h3>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-sm text-gray-500">Progreso</p>
                      <p className="text-2xl font-bold text-gray-900">${goal.current_amount.toLocaleString()}</p>
                    </div>
                    <p className="text-sm font-medium text-gray-500 mb-1">de ${goal.target_amount.toLocaleString()}</p>
                  </div>

                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${
                        isCompleted ? 'bg-yellow-400' : 'bg-blue-600'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const add = Number(prompt('Monto a agregar:'));
                        if (add > 0) updateProgress(goal.id, goal.current_amount + add);
                      }}
                      className="flex-1 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      + Agregar Fondos
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
