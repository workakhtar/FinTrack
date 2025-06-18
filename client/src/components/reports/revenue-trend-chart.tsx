import { useState } from 'react';
import Chart from '@/components/ui/chart';

interface RevenueData {
  id: number;
  month: string;
  year: number;
  amount: number;
  expenses: number;
  profit: number;
}

interface RevenueTrendChartProps {
  data: RevenueData[];
}

const RevenueTrendChart: React.FC<RevenueTrendChartProps> = ({ data }) => {
  const [chartType, setChartType] = useState<'area' | 'bar'>('area');
  const [timeframe, setTimeframe] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');

  // Sort data by year and month
  const sortedData = [...data].sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return months.indexOf(a.month) - months.indexOf(b.month);
  });

  // Process data for display
  const chartData = sortedData.map(item => ({
    name: item.month.slice(0, 3) + ' ' + item.year,
    revenue: item.amount,
    expenses: item.expenses,
    profit: item.profit
  }));

  const buttonTypeClasses = (type: 'area' | 'bar') => 
    `px-3 py-1 text-xs rounded-md ${
      chartType === type 
        ? 'bg-primary text-white' 
        : 'bg-neutral-100 text-neutral-600'
    }`;

  const buttonTimeframeClasses = (time: 'monthly' | 'quarterly' | 'yearly') => 
    `px-3 py-1 text-xs rounded-md ${
      timeframe === time 
        ? 'bg-primary text-white' 
        : 'bg-neutral-100 text-neutral-600'
    }`;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex space-x-2">
          <button 
            className={buttonTypeClasses('area')}
            onClick={() => setChartType('area')}
          >
            Area
          </button>
          <button 
            className={buttonTypeClasses('bar')}
            onClick={() => setChartType('bar')}
          >
            Bar
          </button>
        </div>
        <div className="flex space-x-2">
          <button 
            className={buttonTimeframeClasses('monthly')}
            onClick={() => setTimeframe('monthly')}
          >
            Monthly
          </button>
          <button 
            className={buttonTimeframeClasses('quarterly')}
            onClick={() => setTimeframe('quarterly')}
          >
            Quarterly
          </button>
          <button 
            className={buttonTimeframeClasses('yearly')}
            onClick={() => setTimeframe('yearly')}
          >
            Yearly
          </button>
        </div>
      </div>

      <div className="h-64">
        <Chart 
          type={chartType}
          data={chartData.slice(-6)}
          xKey="name"
          yKeys={[
            { key: 'revenue', name: 'Revenue', color: '#1565C0' },
            { key: 'expenses', name: 'Expenses', color: '#D32F2F' },
            { key: 'profit', name: 'Profit', color: '#388E3C' }
          ]}
          height={250}
        />
      </div>
    </div>
  );
};

export default RevenueTrendChart;
