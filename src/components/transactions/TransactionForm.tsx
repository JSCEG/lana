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
  frequency: z.enum(['one_time', 'monthly', 'yearly']).default('one_time'),
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
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error al guardar la transacción');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Nueva Transacción</h3>
        <button type="button" onClick={onCancel} className="text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
          <select
            {...register('type')}
            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 border"
          >
            <option value="variable_expense">Gasto Variable</option>
            <option value="fixed_expense">Gasto Fijo</option>
            <option value="income">Ingreso</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Monto</label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-gray-500">$</span>
            <input
              type="number"
              step="0.01"
              {...register('amount', { valueAsNumber: true })}
              className="pl-7 w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 border"
              placeholder="0.00"
            />
          </div>
          {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
          <input
            type="text"
            {...register('description')}
            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 border"
            placeholder="Ej: Compra de supermercado"
          />
          {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
          <input
            type="text"
            {...register('category_name')}
            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 border"
            placeholder="Ej: Alimentación, Transporte"
          />
          {errors.category_name && <p className="text-red-500 text-xs mt-1">{errors.category_name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
          <input
            type="date"
            {...register('date')}
            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 border"
          />
        </div>

        {type === 'fixed_expense' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Frecuencia</label>
            <select
              {...register('frequency')}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 border"
            >
              <option value="monthly">Mensual</option>
              <option value="yearly">Anual</option>
            </select>
          </div>
        )}
      </div>

      {error && (
        <div className="text-red-500 text-sm bg-red-50 p-2 rounded">
          {error}
        </div>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Guardar Transacción
        </button>
      </div>
    </form>
  );
}
