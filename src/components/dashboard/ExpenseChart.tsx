import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface ExpenseCategory {
  name: string;
  value: number;
  color: string;
  [key: string]: string | number;
}

interface ExpenseChartProps {
  data: ExpenseCategory[];
  isLoading: boolean;
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

export default function ExpenseChart({ data, isLoading }: ExpenseChartProps) {
  if (isLoading) {
    return <div className="h-80 bg-gray-100 rounded-xl animate-pulse" />;
  }

  if (data.length === 0) {
    return (
      <div className="h-80 bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
        <p className="text-gray-500">No hay datos de gastos para mostrar</p>
      </div>
    );
  }

  return (
    <div className="h-80 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Gastos por Categoría</h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((_entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => [`$${value.toLocaleString('es-MX')}`, 'Monto']}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
