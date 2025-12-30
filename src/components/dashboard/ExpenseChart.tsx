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
  onCategoryClick?: (categoryName: string) => void;
}

const COLORS = ['#F472B6', '#A78BFA', '#6EE7F9', '#818CF8', '#34D399', '#FBBF24', '#60A5FA'];

export default function ExpenseChart({ data, isLoading, onCategoryClick }: ExpenseChartProps) {
  if (isLoading) {
    return <div className="h-80 bg-white/5 rounded-xl animate-pulse" />;
  }

  if (data.length === 0) {
    return (
      <div className="glass-card h-80 flex flex-col items-center justify-center text-center">
        <p className="text-gray-400">No hay datos de gastos para mostrar</p>
      </div>
    );
  }

  return (
    <div className="glass-card h-80">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 font-heading tracking-wide">Gastos por Categoría</h3>
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
              stroke="none"
              onClick={(data) => onCategoryClick?.(data.name)}
              className="cursor-pointer outline-none"
            >
              {data.map((_entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => [`$${value.toLocaleString('es-MX')}`, 'Monto']}
              contentStyle={{
                backgroundColor: 'rgba(11, 15, 26, 0.9)',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.36)',
                backdropFilter: 'blur(10px)',
                color: '#fff'
              }}
              itemStyle={{ color: '#fff' }}
            />
            <Legend wrapperStyle={{ color: '#9ca3af' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
