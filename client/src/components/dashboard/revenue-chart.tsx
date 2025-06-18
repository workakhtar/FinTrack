import { useState } from 'react';
import Chart from '@/components/ui/chart';
import { formatCurrency } from '@/lib/utils';

interface RevenueData {
  month: string;
  year: number;
  revenue: number;
  expenses: number;
  profit: number;
}

interface RevenueChartProps {
  data: RevenueData[];
}

const RevenueChart: React.FC<RevenueChartProps> = ({ data }) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');

  const chartData = data.map(item => ({
    name: `${item.month} ${item.year}`,
    revenue: item.revenue,
    expenses: item.expenses,
    profit: item.profit
  }));

  const buttonClasses = (timeframe: 'monthly' | 'quarterly' | 'yearly') => 
    `px-3 py-1 text-xs rounded-md ${
      selectedTimeframe === timeframe 
        ? 'bg-primary text-white' 
        : 'bg-neutral-100 text-neutral-600'
    }`;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-neutral-700">Monthly Revenue</h2>
        <div className="flex space-x-2">
          <button 
            className={buttonClasses('monthly')}
            onClick={() => setSelectedTimeframe('monthly')}
          >
            Monthly
          </button>
          <button 
            className={buttonClasses('quarterly')}
            onClick={() => setSelectedTimeframe('quarterly')}
          >
            Quarterly
          </button>
          <button 
            className={buttonClasses('yearly')}
            onClick={() => setSelectedTimeframe('yearly')}
          >
            Yearly
          </button>
        </div>
      </div>
      
      {data.length === 0 ? (
        <div className="h-64 flex items-center justify-center bg-neutral-50 rounded-lg">
          <p className="text-neutral-500">No revenue data available</p>
        </div>
      ) : (
        <div className="h-64">
          <Chart 
            type="area"
            data={chartData}
            xKey="name"
            yKeys={[
              { key: 'revenue', name: 'Revenue', color: '#1565C0' },
              { key: 'expenses', name: 'Expenses', color: '#D32F2F' },
              { key: 'profit', name: 'Profit', color: '#388E3C' }
            ]}
            height={250}
          />
        </div>
      )}
    </div>
  );
};

export default RevenueChart;
