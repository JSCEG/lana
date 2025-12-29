import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Plus, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

const investmentSchema = z.object({
  name: z.string().min(3, 'Nombre requerido'),
  asset_type: z.string().min(1, 'Tipo requerido'),
  invested_amount: z.number().min(0.01, 'Monto inválido'),
  current_value: z.number().min(0, 'Valor inválido'),
  purchase_date: z.string(),
});

type InvestmentFormData = z.infer<typeof investmentSchema>;

export default function Investments() {
  const { user } = useAuth();
  const [investments, setInvestments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<InvestmentFormData>({
    resolver: zodResolver(investmentSchema),
    defaultValues: {
      purchase_date: new Date().toISOString().split('T')[0]
    }
  });

  const fetchInvestments = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('investments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvestments(data || []);
    } catch (error) {
      console.error('Error fetching investments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestments();
  }, [user]);

  const onSubmit = async (data: InvestmentFormData) => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('investments')
        .insert({
          user_id: user.id,
          ...data
        });

      if (error) throw error;
      reset();
      setShowForm(false);
      fetchInvestments();
    } catch (error) {
      console.error('Error saving investment:', error);
    } finally {
      setSaving(false);
    }
  };

  const calculateReturn = (invested: number, current: number) => {
    const diff = current - invested;
    const percentage = (diff / invested) * 100;
    return { diff, percentage };
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Portafolio de Inversiones</h2>
          <p className="text-gray-500">Monitorea el rendimiento de tus activos</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          {showForm ? 'Cancelar' : <><Plus className="w-4 h-4" /> Nuevo Activo</>}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Activo</label>
              <input {...register('name')} placeholder="Ej: Apple Inc." className="w-full rounded-lg border p-2.5" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
              <select {...register('asset_type')} className="w-full rounded-lg border p-2.5">
                <option value="Stock">Acciones</option>
                <option value="Crypto">Criptomonedas</option>
                <option value="Bond">Bonos</option>
                <option value="Real Estate">Bienes Raíces</option>
                <option value="ETF">ETF</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Inversión Inicial</label>
              <input type="number" step="0.01" {...register('invested_amount', { valueAsNumber: true })} className="w-full rounded-lg border p-2.5" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valor Actual</label>
              <input type="number" step="0.01" {...register('current_value', { valueAsNumber: true })} className="w-full rounded-lg border p-2.5" />
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={saving} className="px-6 py-2 bg-indigo-600 text-white rounded-lg flex items-center gap-2">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />} Registrar
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 gap-4">
        {/* Header Row */}
        <div className="hidden md:grid grid-cols-5 gap-4 px-6 py-3 bg-gray-50 rounded-lg text-sm font-medium text-gray-500">
          <div className="col-span-2">Activo</div>
          <div className="text-right">Inversión</div>
          <div className="text-right">Valor Actual</div>
          <div className="text-right">Rendimiento</div>
        </div>

        {loading ? (
          [1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)
        ) : (
          investments.map((inv) => {
            const { diff, percentage } = calculateReturn(inv.invested_amount, inv.current_value);
            const isPositive = diff >= 0;

            return (
              <div key={inv.id} className="bg-white p-4 md:px-6 rounded-xl border border-gray-100 shadow-sm flex flex-col md:grid md:grid-cols-5 gap-4 items-center hover:bg-gray-50 transition-colors">
                <div className="w-full md:col-span-2 flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{inv.name}</h3>
                    <p className="text-xs text-gray-500">{inv.asset_type}</p>
                  </div>
                </div>

                <div className="w-full md:w-auto flex justify-between md:block text-right">
                  <span className="md:hidden text-sm text-gray-500">Inversión:</span>
                  <p className="font-medium text-gray-900">${inv.invested_amount.toLocaleString()}</p>
                </div>

                <div className="w-full md:w-auto flex justify-between md:block text-right">
                  <span className="md:hidden text-sm text-gray-500">Valor Actual:</span>
                  <p className="font-bold text-gray-900">${inv.current_value.toLocaleString()}</p>
                </div>

                <div className="w-full md:w-auto flex justify-between md:block text-right">
                  <span className="md:hidden text-sm text-gray-500">Rendimiento:</span>
                  <div className={`flex items-center justify-end gap-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    <span className="font-bold">{percentage.toFixed(2)}%</span>
                  </div>
                  <p className={`text-xs ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {isPositive ? '+' : ''}${diff.toLocaleString()}
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
