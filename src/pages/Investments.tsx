import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Plus, TrendingUp, TrendingDown, DollarSign, Pencil, Trash2, X } from 'lucide-react';
import { Investment } from '@/types';

const investmentSchema = z.object({
  name: z.string().min(3, 'Nombre requerido'),
  asset_type: z.string().min(1, 'Tipo requerido'),
  invested_amount: z.number().min(0.01, 'Monto inválido'),
  current_value: z.number().min(0, 'Valor inválido'),
  quantity: z.number().min(0.000001, 'Cantidad inválida'),
  purchase_date: z.string(),
});

type InvestmentFormData = z.infer<typeof investmentSchema>;

export default function Investments() {
  const { user } = useAuth();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState<Investment | null>(null);
  const [deletingInvestment, setDeletingInvestment] = useState<Investment | null>(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<InvestmentFormData>({
    resolver: zodResolver(investmentSchema),
    defaultValues: {
      name: '',
      asset_type: 'Stock',
      invested_amount: 0,
      current_value: 0,
      quantity: 1,
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

  const handleEdit = (investment: Investment) => {
    setEditingInvestment(investment);
    setValue('name', investment.name);
    setValue('asset_type', investment.asset_type);
    setValue('invested_amount', investment.invested_amount);
    setValue('current_value', investment.current_value);
    setValue('quantity', investment.quantity || 1);
    setValue('purchase_date', investment.purchase_date);
    setShowForm(true);
  };

  const confirmDelete = async () => {
    if (!deletingInvestment) return;
    try {
      const { error } = await supabase
        .from('investments')
        .delete()
        .eq('id', deletingInvestment.id);

      if (error) throw error;
      setDeletingInvestment(null);
      fetchInvestments();
    } catch (error) {
      console.error('Error deleting investment:', error);
    }
  };

  const onSubmit = async (data: InvestmentFormData) => {
    if (!user) return;
    setSaving(true);
    try {
      if (editingInvestment) {
        const { error } = await supabase
          .from('investments')
          .update({
            name: data.name,
            asset_type: data.asset_type,
            invested_amount: data.invested_amount,
            current_value: data.current_value,
            quantity: data.quantity,
            purchase_date: data.purchase_date
          })
          .eq('id', editingInvestment.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('investments')
          .insert({
            user_id: user.id,
            ...data
          });
        if (error) throw error;
      }

      reset({
        name: '',
        asset_type: 'Stock',
        invested_amount: 0,
        current_value: 0,
        quantity: 1,
        purchase_date: new Date().toISOString().split('T')[0]
      });
      setShowForm(false);
      setEditingInvestment(null);
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white font-heading tracking-wide">Portafolio de Inversiones</h2>
          <p className="text-gray-400">Monitorea el rendimiento de tus activos</p>
        </div>
        <button
          onClick={() => {
            setEditingInvestment(null);
            reset({
              name: '',
              asset_type: 'Stock',
              invested_amount: 0,
              current_value: 0,
              quantity: 1,
              purchase_date: new Date().toISOString().split('T')[0]
            });
            setShowForm(!showForm);
          }}
          className="flex items-center gap-2 px-4 py-2 btn-primary rounded-lg transition-colors"
        >
          {showForm ? 'Cancelar' : <><Plus className="w-4 h-4" /> Nuevo Activo</>}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit(onSubmit)} className="glass-card space-y-4 relative">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {editingInvestment ? `Editar Inversión: ${editingInvestment.name}` : 'Registrar Nueva Inversión'}
            </h3>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingInvestment(null);
                reset({
                  name: '',
                  asset_type: 'Stock',
                  invested_amount: 0,
                  current_value: 0,
                  quantity: 1,
                  purchase_date: new Date().toISOString().split('T')[0]
                });
              }}
              className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre del Activo</label>
              <input {...register('name')} placeholder="Ej: Apple Inc." className="input-primary p-2.5" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo</label>
              <select {...register('asset_type')} className="input-primary p-2.5 dark:[color-scheme:dark]">
                <option value="Stock">Acciones</option>
                <option value="Crypto">Criptomonedas</option>
                <option value="Bond">Bonos</option>
                <option value="Real Estate">Bienes Raíces</option>
                <option value="ETF">ETF</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Inversión Inicial</label>
              <input type="number" step="0.01" {...register('invested_amount', { valueAsNumber: true })} className="input-primary p-2.5" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Valor Actual Total</label>
              <input type="number" step="0.01" {...register('current_value', { valueAsNumber: true })} className="input-primary p-2.5" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cantidad / Acciones</label>
              <input type="number" step="0.000001" {...register('quantity', { valueAsNumber: true })} className="input-primary p-2.5" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha Compra</label>
              <input type="date" {...register('purchase_date')} className="input-primary p-2.5 dark:[color-scheme:dark]" />
              {errors.purchase_date && <p className="text-[#F472B6] text-xs mt-1">{errors.purchase_date.message}</p>}
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingInvestment(null);
                reset({
                  name: '',
                  asset_type: 'Stock',
                  invested_amount: 0,
                  current_value: 0,
                  quantity: 1,
                  purchase_date: new Date().toISOString().split('T')[0]
                });
              }}
              className="px-6 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
            >
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="px-6 py-2 btn-primary rounded-lg flex items-center gap-2">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {editingInvestment ? 'Actualizar' : 'Registrar'}
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 gap-4">
        {/* Header Row */}
        <div className="hidden md:grid grid-cols-6 gap-4 px-6 py-3 bg-white/5 rounded-lg text-sm font-medium text-gray-400">
          <div className="col-span-2">Activo</div>
          <div className="text-right">Cantidad</div>
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
            const unitPrice = inv.quantity > 0 ? inv.current_value / inv.quantity : 0;

            return (
              <div key={inv.id} className="glass-card flex flex-col md:grid md:grid-cols-6 gap-4 items-center hover:bg-white/5 transition-colors relative overflow-hidden group">
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 md:static md:opacity-100 md:hidden">
                  <button onClick={() => handleEdit(inv)} className="p-1.5 bg-black/20 hover:bg-black/40 rounded-lg text-white transition-colors">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => setDeletingInvestment(inv)} className="p-1.5 bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="w-full md:col-span-2 flex items-center gap-3">
                  <div className="p-2 bg-[#A78BFA]/10 rounded-lg text-[#A78BFA]">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{inv.name}</h3>
                    <p className="text-xs text-gray-400">{inv.asset_type}</p>
                  </div>
                </div>

                <div className="w-full md:w-auto flex justify-between md:block text-right">
                  <span className="md:hidden text-sm text-gray-400">Cantidad:</span>
                  <p className="font-medium text-gray-900 dark:text-white">{inv.quantity?.toLocaleString() || 1}</p>
                </div>

                <div className="w-full md:w-auto flex justify-between md:block text-right">
                  <span className="md:hidden text-sm text-gray-400">Inversión:</span>
                  <p className="font-medium text-gray-900 dark:text-white">${inv.invested_amount.toLocaleString()}</p>
                </div>

                <div className="w-full md:w-auto flex justify-between md:block text-right">
                  <span className="md:hidden text-sm text-gray-400">Valor Actual:</span>
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">${inv.current_value.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">Unit: ${unitPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                  </div>
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

                <div className="hidden md:flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEdit(inv)} className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => setDeletingInvestment(inv)} className="p-1.5 hover:bg-red-500/20 rounded-lg text-gray-400 hover:text-red-400 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal de confirmación de eliminación */}
      {deletingInvestment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#0B0F1A] rounded-2xl w-full max-w-sm p-6 shadow-2xl border border-white/10">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Eliminar Inversión</h3>
              <button
                onClick={() => setDeletingInvestment(null)}
                className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              ¿Estás seguro que deseas eliminar la inversión <span className="font-bold text-gray-900 dark:text-white">"{deletingInvestment.name}"</span>? Esta acción no se puede deshacer.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setDeletingInvestment(null)}
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
