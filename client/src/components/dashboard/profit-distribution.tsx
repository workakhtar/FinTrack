import { useState } from 'react';
import Chart from '@/components/ui/chart';
import { formatCurrency } from '@/lib/utils';

interface Partner {
  id: number;
  name: string;
  share: number;
  amount: number;
}

interface ProfitDistributionProps {
  partners: Partner[];
}

const colorMap = ['#1565C0', '#388E3C', '#F57C00', '#D32F2F', '#5C6BC0'];

const ProfitDistribution: React.FC<ProfitDistributionProps> = ({ partners }) => {
  console.log(partners , "partners")
  const chartData = partners.map(partner => ({
    name: partner.name,
    value: partner.amount,
    share: partner.share
  }));

  return (
    <div className="bg-white shadow rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-neutral-700">Profit Distribution</h2>
        <button className="text-sm font-medium text-primary hover:text-primary-dark">
          Full Report
        </button>
      </div>
      
      {partners.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-neutral-500">No profit distribution data available</p>
        </div>
      ) : (
        <>
          <div className="h-40 mb-4">
            <Chart 
              type="pie"
              data={chartData}
              xKey="name"
              yKeys={[{ key: 'value', name: 'Amount', color: '#1565C0' }]}
              pieColors={colorMap}
            />
          </div>
          
          <div className="space-y-2 mt-2">
            {partners.map((partner, index) => (
              <div key={partner.id} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: colorMap[index % colorMap.length] }}
                  ></div>
                  <span className="text-sm text-neutral-700">
                    {partner.name} ({partner.share}%)
                  </span>
                </div>
                <span className="text-sm font-medium text-neutral-700">
                  {formatCurrency(partner.amount)}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ProfitDistribution;
