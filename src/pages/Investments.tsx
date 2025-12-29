import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Plus, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { Investment } from '@/types';

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
  const [investments, setInvestments] = useState<Investment[]>([]);
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
      setInvestments(data as Investment[] || []);
    } catch (error) {
      console.error('Error fetching investments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          <h2 className="text-2xl font-bold text-white font-heading tracking-wide">Portafolio de Inversiones</h2>
          <p className="text-gray-400">Monitorea el rendimiento de tus activos</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 btn-primary rounded-lg transition-colors"
        >
          {showForm ? 'Cancelar' : <><Plus className="w-4 h-4" /> Nuevo Activo</>}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit(onSubmit)} className="glass-card space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-1">Nombre del Activo</label>
              <input {...register('name')} placeholder="Ej: Apple Inc." className="input-primary p-2.5" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Tipo</label>
              <select {...register('asset_type')} className="input-primary p-2.5">
                <option value="Stock" className="bg-[#0B0F1A]">Acciones</option>
                <option value="Crypto" className="bg-[#0B0F1A]">Criptomonedas</option>
                <option value="Bond" className="bg-[#0B0F1A]">Bonos</option>
                <option value="Real Estate" className="bg-[#0B0F1A]">Bienes Raíces</option>
                <option value="ETF" className="bg-[#0B0F1A]">ETF</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Inversión Inicial</label>
              <input type="number" step="0.01" {...register('invested_amount', { valueAsNumber: true })} className="input-primary p-2.5" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Valor Actual</label>
              <input type="number" step="0.01" {...register('current_value', { valueAsNumber: true })} className="input-primary p-2.5" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Fecha Compra</label>
              <input type="date" {...register('purchase_date')} className="input-primary p-2.5" />
              {errors.purchase_date && <p className="text-[#F472B6] text-xs mt-1">{errors.purchase_date.message}</p>}
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={saving} className="px-6 py-2 btn-primary rounded-lg flex items-center gap-2">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />} Registrar
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 gap-4">
        {/* Header Row */}
        <div className="hidden md:grid grid-cols-5 gap-4 px-6 py-3 bg-white/5 rounded-lg text-sm font-medium text-gray-400">
          <div className="col-span-2">Activo</div>
          <div className="text-right">Inversión</div>
          <div className="text-right">Valor Actual</div>
          <div className="text-right">Rendimiento</div>
        </div>

        {loading ? (
          [1, 2, 3].map(i => <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />)
        ) : (
          investments.map((inv) => {
            const { diff, percentage } = calculateReturn(inv.invested_amount, inv.current_value);
            const isPositive = diff >= 0;

            return (
              <div key={inv.id} className="glass-card flex flex-col md:grid md:grid-cols-5 gap-4 items-center hover:bg-white/5 transition-colors">
                <div className="w-full md:col-span-2 flex items-center gap-3">
                  <div className="p-2 bg-[#A78BFA]/10 rounded-lg text-[#A78BFA]">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{inv.name}</h3>
                    <p className="text-xs text-gray-400">{inv.asset_type}</p>
                  </div>
                </div>

                <div className="w-full md:w-auto flex justify-between md:block text-right">
                  <span className="md:hidden text-sm text-gray-400">Inversión:</span>
                  <p className="font-medium text-white">${inv.invested_amount.toLocaleString()}</p>
                </div>

                <div className="w-full md:w-auto flex justify-between md:block text-right">
                  <span className="md:hidden text-sm text-gray-400">Valor Actual:</span>
                  <p className="font-bold text-white">${inv.current_value.toLocaleString()}</p>
                </div>

                <div className="w-full md:w-auto flex justify-between md:block text-right">
                  <span className="md:hidden text-sm text-gray-400">Rendimiento:</span>
                  <div className={`flex items-center justify-end gap-1 ${isPositive ? 'text-[#6EE7F9]' : 'text-[#F472B6]'}`}>
                    {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    <span className="font-bold">{percentage.toFixed(2)}%</span>
                  </div>
                  <p className={`text-xs ${isPositive ? 'text-[#6EE7F9]' : 'text-[#F472B6]'}`}>
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
