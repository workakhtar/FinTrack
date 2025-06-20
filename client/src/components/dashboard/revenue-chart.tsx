import { formatCurrency } from '@/lib/utils';
import Chart from '@/components/ui/chart';

interface RevenueData {
  month: string;
  year: number;
  revenue: number;
  expenses: number;
  profit: number;
}

interface RevenueChartProps {
  data: RevenueData[];
  selectedTimeframe: 'monthly' | 'quarterly' | 'yearly';
  onTimeframeChange: (tf: 'monthly' | 'quarterly' | 'yearly') => void;
}

const RevenueChart: React.FC<RevenueChartProps> = ({ data, selectedTimeframe, onTimeframeChange }) => {
  // Sort data by year and month ascending before mapping for the chart
  const sortedData = [...data].sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    // If monthly or quarterly, sort by month as well
    if (a.month && b.month) {
      const monthOrder = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      return monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month);
    }
    return 0;
  });

  const chartData = sortedData.map(item => ({
    name: selectedTimeframe === 'yearly' ? `${item.year}` : `${item.month} ${item.year}`,
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
            onClick={() => onTimeframeChange('monthly')}
          >
            Monthly
          </button>
          <button 
            className={buttonClasses('quarterly')}
            onClick={() => onTimeframeChange('quarterly')}
          >
            Quarterly
          </button>
          <button 
            className={buttonClasses('yearly')}
            onClick={() => onTimeframeChange('yearly')}
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
