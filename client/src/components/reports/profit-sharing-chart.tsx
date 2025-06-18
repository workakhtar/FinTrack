import Chart from "@/components/ui/chart";
import { useState } from "react";
import { formatCurrency } from "@/lib/utils";

interface Partner {
  id: number;
  name: string;
  email: string;
  share: number;
}

interface ProfitDistribution {
  id: number;
  partnerId: number;
  month: string;
  year: number;
  amount: number;
  percentage: number;
}

interface ProfitSharingChartProps {
  partners: Partner[];
  distributions: ProfitDistribution[];
}

const ProfitSharingChart: React.FC<ProfitSharingChartProps> = ({
  partners,
  distributions
}) => {
  const [chartType, setChartType] = useState<'pie' | 'bar'>('pie');
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  
  // Get the most recent month and year
  const sortedDistributions = [...distributions].sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    return monthNames.indexOf(b.month) - monthNames.indexOf(a.month);
  });
  
  const latestMonth = sortedDistributions.length > 0 ? sortedDistributions[0].month : '';
  const latestYear = sortedDistributions.length > 0 ? sortedDistributions[0].year : new Date().getFullYear();
  
  // Filter distributions for the latest month
  const currentDistributions = distributions.filter(
    dist => dist.month === latestMonth && dist.year === latestYear
  );

  // Prepare data for the chart
  const chartData = partners.map(partner => {
    const distribution = currentDistributions.find(dist => dist.partnerId === partner.id);
    return {
      name: partner.name,
      value: distribution ? distribution.amount : 0,
      share: partner.share
    };
  });

  // Prepare historical data for partners (last 6 months)
  const months = monthNames
    .map((month, index) => {
      const date = new Date();
      date.setMonth(date.getMonth() - index);
      return {
        month: monthNames[date.getMonth()],
        year: date.getFullYear()
      };
    })
    .slice(0, 6)
    .reverse();

  const historicalData = months.map(({ month, year }) => {
    const monthData: any = { month: `${month.slice(0, 3)} ${year}` };
    
    partners.forEach(partner => {
      const distribution = distributions.find(dist => 
        dist.partnerId === partner.id && dist.month === month && dist.year === year
      );
      monthData[partner.name] = distribution ? distribution.amount : 0;
    });
    
    return monthData;
  });

  // Colors for each partner (up to 5 partners)
  const partnerColors = ['#1565C0', '#388E3C', '#F57C00', '#D32F2F', '#5C6BC0'];

  const buttonClasses = (type: 'pie' | 'bar') => 
    `px-3 py-1 text-xs rounded-md ${
      chartType === type 
        ? 'bg-primary text-white' 
        : 'bg-neutral-100 text-neutral-600'
    }`;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-neutral-700">
          {latestMonth} {latestYear} Distribution
        </h2>
        <div className="flex space-x-2">
          <button 
            className={buttonClasses('pie')}
            onClick={() => setChartType('pie')}
          >
            Pie
          </button>
          <button 
            className={buttonClasses('bar')}
            onClick={() => setChartType('bar')}
          >
            Historical
          </button>
        </div>
      </div>

      <div className="h-64">
        {chartType === 'pie' ? (
          <Chart 
            type="pie"
            data={chartData}
            xKey="name"
            yKeys={[{ key: 'value', name: 'Amount', color: '#1565C0' }]}
            pieColors={partnerColors}
            height={250}
          />
        ) : (
          <Chart 
            type="bar"
            data={historicalData}
            xKey="month"
            yKeys={partners.map((partner, index) => ({
              key: partner.name,
              name: partner.name,
              color: partnerColors[index % partnerColors.length]
            }))}
            height={250}
          />
        )}
      </div>

      <div className="mt-2 text-xs text-neutral-500 text-center">
        Total distributed: {formatCurrency(chartData.reduce((sum, item) => sum + item.value, 0))}
      </div>
    </div>
  );
};

export default ProfitSharingChart;
