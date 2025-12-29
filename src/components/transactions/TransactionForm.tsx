import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Plus, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

const transactionSchema = z.object({
  amount: z.number().min(0.01, 'El monto debe ser mayor a 0'),
  description: z.string().min(3, 'La descripción es muy corta'),
  category_name: z.string().min(1, 'Selecciona una categoría'), // Simplificado: guardaremos el nombre por ahora o crearemos categorías al vuelo
  type: z.enum(['fixed_expense', 'variable_expense', 'income']),
  frequency: z.enum(['one_time', 'monthly', 'yearly']),
  date: z.string(),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

interface TransactionFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function TransactionForm({ onSuccess, onCancel }: TransactionFormProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      type: 'variable_expense',
      frequency: 'one_time'
    }
  });

  const type = watch('type');

  const onSubmit = async (data: TransactionFormData) => {
    if (!user) return;
    setIsLoading(true);
    setError(null);

    try {
      // 1. Primero buscamos o creamos la categoría (lógica simplificada)
      // En una app real, esto debería ser un select de categorías existentes
      let categoryId;
      const { data: categories } = await supabase
        .from('categories')
        .select('id')
        .eq('name', data.category_name)
        .eq('user_id', user.id)
        .single();

      if (categories) {
        categoryId = categories.id;
      } else {
        const { data: newCategory, error: catError } = await supabase
          .from('categories')
          .insert({
            user_id: user.id,
            name: data.category_name,
            type: data.type === 'income' ? 'income' : 'expense',
            icon: 'Circle', // Default icon
            color: '#6366f1' // Default color
          })
          .select()
          .single();

        if (catError) throw catError;
        categoryId = newCategory.id;
      }

      // 2. Insertamos la transacción
      const { error: txError } = await supabase.from('transactions').insert({
        user_id: user.id,
        category_id: categoryId,
        amount: data.amount,
        description: data.description,
        date: data.date,
        type: data.type,
        frequency: data.frequency,
      });

      if (txError) throw txError;

      reset();
      onSuccess();
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : 'Error al guardar la transacción';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 glass-card">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-white font-heading">Nueva Transacción</h3>
        <button type="button" onClick={onCancel} className="text-gray-400 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Tipo</label>
          <select
            {...register('type')}
            className="input-primary p-2.5"
          >
            <option value="variable_expense" className="bg-[#0B0F1A]">Gasto Variable</option>
            <option value="fixed_expense" className="bg-[#0B0F1A]">Gasto Fijo</option>
            <option value="income" className="bg-[#0B0F1A]">Ingreso</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Monto</label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-gray-500">$</span>
            <input
              type="number"
              step="0.01"
              {...register('amount', { valueAsNumber: true })}
              className="input-primary pl-7 p-2.5"
              placeholder="0.00"
            />
          </div>
          {errors.amount && <p className="text-[#F472B6] text-xs mt-1">{errors.amount.message}</p>}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-300 mb-1">Descripción</label>
          <input
            type="text"
            {...register('description')}
            className="input-primary p-2.5"
            placeholder="Ej: Compra de supermercado"
          />
          {errors.description && <p className="text-[#F472B6] text-xs mt-1">{errors.description.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Categoría</label>
          <input
            type="text"
            {...register('category_name')}
            className="input-primary p-2.5"
            placeholder="Ej: Alimentación, Transporte"
          />
          {errors.category_name && <p className="text-[#F472B6] text-xs mt-1">{errors.category_name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Fecha</label>
          <input
            type="date"
            {...register('date')}
            className="input-primary p-2.5"
          />
        </div>

        {type === 'fixed_expense' && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Frecuencia</label>
            <select
              {...register('frequency')}
              className="input-primary p-2.5"
            >
              <option value="monthly" className="bg-[#0B0F1A]">Mensual</option>
              <option value="yearly" className="bg-[#0B0F1A]">Anual</option>
            </select>
          </div>
        )}
      </div>

      {error && (
        <div className="text-red-300 text-sm bg-red-900/20 border border-red-500/20 p-2 rounded">
          {error}
        </div>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-300 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white btn-primary disabled:opacity-50"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Guardar Transacción
        </button>
      </div>
    </form>
  );
}
