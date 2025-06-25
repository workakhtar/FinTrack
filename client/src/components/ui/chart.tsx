import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { formatNumberShort } from '@/lib/utils';

type DataPoint = {
  [key: string]: any;
};

type ChartProps = {
  data: DataPoint[];
  type: 'area' | 'bar' | 'pie' | 'line';
  xKey: string;
  yKeys: { key: string; name: string; color: string }[];
  height?: number;
  width?: string | number;
  showGrid?: boolean;
  showLegend?: boolean;
  pieColors?: string[];
  showPieLabels?: boolean;
};

const Chart = ({
  data,
  type,
  xKey,
  yKeys,
  height = 300,
  width = '100%',
  showGrid = true,
  showLegend = true,
  pieColors = ['#1565C0', '#388E3C', '#F57C00', '#D32F2F', '#5C6BC0', '#7B1FA2', '#00796B', '#FFA000'],
  showPieLabels = true,
}: ChartProps) => {
  const renderChart = useMemo(() => {
    switch (type) {
      case 'area':
        return (
          <AreaChart
            data={data}
            margin={{
              top: 10,
              right: 30,
              left: 0,
              bottom: 0,
            }}
          >
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey={xKey} />
            <YAxis tickFormatter={formatNumberShort} />
            <Tooltip formatter={(value: number) => formatNumberShort(value)} />
            {showLegend && <Legend />}
            {yKeys.map((item, index) => (
              <Area
                key={index}
                type="monotone"
                dataKey={item.key}
                name={item.name}
                stroke={item.color}
                fill={item.color}
                fillOpacity={0.2}
              />
            ))}
          </AreaChart>
        );
      case 'bar':
        return (
          <BarChart
            data={data}
            margin={{
              top: 10,
              right: 30,
              left: 0,
              bottom: 0,
            }}
          >
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey={xKey} />
            <YAxis tickFormatter={formatNumberShort} />
            <Tooltip formatter={(value: number) => formatNumberShort(value)} />
            {showLegend && <Legend />}
            {yKeys.map((item, index) => (
              <Bar
                key={index}
                dataKey={item.key}
                name={item.name}
                fill={item.color}
              />
            ))}
          </BarChart>
        );
      case 'pie':
        return (
          <PieChart>
            <Tooltip 
              formatter={(value: number) => [`Rs. ${formatNumberShort(value)}`, 'Amount']}
            />
            {showLegend && <Legend />}
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey={yKeys[0].key}
              nameKey={xKey}
              {...(showPieLabels ? {
                label: ({ name, value, percent }: any) => `${name} (${(percent * 100).toFixed(0)}%)`
              } : {})}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
              ))}
            </Pie>
          </PieChart>
        );
      case 'line':
        return (
          <LineChart
            data={data}
            margin={{
              top: 10,
              right: 30,
              left: 0,
              bottom: 0,
            }}
          >
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey={xKey} />
            <YAxis tickFormatter={formatNumberShort} />
            <Tooltip formatter={(value: number) => formatNumberShort(value)} />
            {showLegend && <Legend />}
            {yKeys.map((item, index) => (
              <Line
                key={index}
                type="monotone"
                dataKey={item.key}
                name={item.name}
                stroke={item.color}
                activeDot={{ r: 8 }}
              />
            ))}
          </LineChart>
        );
      default:
        return <div>Unsupported chart type</div>;
    }
  }, [data, type, xKey, yKeys, showGrid, showLegend, pieColors, showPieLabels]);

  return (
    <div style={{ width: width, height: height }}>
      <ResponsiveContainer width="100%" height="100%">
        {renderChart}
      </ResponsiveContainer>
    </div>
  );
};

export default Chart;
