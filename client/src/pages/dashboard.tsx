import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient'; // Import the apiRequest function
import Header from '@/components/layout/header';
import MetricCard from '@/components/dashboard/metric-card';
import RevenueChart from '@/components/dashboard/revenue-chart';
import RecentProjects from '@/components/dashboard/recent-projects';
import ProfitDistribution from '@/components/dashboard/profit-distribution';
import BonusCalculation from '@/components/dashboard/bonus-calculation';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarImage } from '@radix-ui/react-avatar';
import { AvatarFallback } from '@/components/ui/avatar';
import { useUI } from '@/App';
import { Button } from '@/components/ui/button';

// Define types for the dashboard data
interface DashboardData {
  metrics: {
    totalRevenue: number;
    totalExpenses: number;
    profit: number;
    expenseRatio: string | number;
    employeeCount: number;
    projectCount: number;
    activeProjectCount: number;
    previousMonthEmployeeCount: number;
    previousMonthActiveProjectCount: number;
  };
  recentEmployees?: any[];
  recentProjects: any[];
  revenueChartData: any[];
  partnerDistributions: any[];
  projectBonuses: any[];
  totalBonusPool: number;
}

const Dashboard = () => {
  // Default to current month/year initially
  const currentDate = new Date();
  const currentMonthYear = `${currentDate.toLocaleString('default', { month: 'long' })} ${currentDate.getFullYear()}`;
  
  const [period, setPeriod] = useState(currentMonthYear);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
  const { toast } = useToast();
  const { isSidebarCollapsed, toggleSidebar } = useUI();
  
  // Extract month and year from period string for querying
  const periodParts = period.split(' ');
  const month = periodParts[0];
  const year = periodParts[1];
  
  // Add some debug logging
  console.log(`Dashboard requesting data for period: ${month} ${year}, timeframe: ${selectedTimeframe}`);
  
  const { data, isLoading, error, refetch } = useQuery<DashboardData>({
    queryKey: ['/api/dashboard', month, year, selectedTimeframe],
queryFn: async () => {
  const timestamp = new Date().getTime();
      let url = `/api/dashboard?periodType=${selectedTimeframe}&year=${year}&_t=${timestamp}`;
      if (selectedTimeframe === 'monthly') {
        url += `&month=${month}`;
      }
      // For quarterly, you may want to add a quarter param if your backend supports it
  console.log(`Making dashboard API request to: ${url}`);
      const response = await apiRequest('GET', url);
  const serverData = await response.json();
  return serverData;
},
    retry: 2,
    staleTime: 0,
    refetchOnWindowFocus: false,
  });

  // Calculate month-over-month changes
  const calculateChange = (current: number, previous: number) => {
    if (!previous) return 0;
    return ((current - previous) / previous) * 100;
  };

  // Get current and previous month data
  const currentMonth = data?.revenueChartData?.[0] || { revenue: 0, expenses: 0 };
  const previousMonth = data?.revenueChartData?.[1] || { revenue: 0, expenses: 0 };

  // Calculate changes
  const revenueChange = calculateChange(currentMonth.revenue, previousMonth.revenue);
  const expensesChange = calculateChange(currentMonth.expenses, previousMonth.expenses);
  const profitChange = calculateChange(
    currentMonth.revenue - currentMonth.expenses,
    previousMonth.revenue - previousMonth.expenses
  );

  // Calculate employee and project changes
  const currentEmployeeCount = data?.metrics.employeeCount || 0;
  const previousEmployeeCount = data?.metrics.previousMonthEmployeeCount || 0;
  const employeeChange = calculateChange(currentEmployeeCount, previousEmployeeCount);

  const currentActiveProjects = data?.metrics.activeProjectCount || 0;
  const previousActiveProjects = data?.metrics.previousMonthActiveProjectCount || 0;
  const activeProjectChange = calculateChange(currentActiveProjects, previousActiveProjects);

  const handlePeriodChange = (newPeriod: string) => {
    setPeriod(newPeriod);
    if (newPeriod === 'All Months') {
      setSelectedTimeframe('yearly');
    } else {
      setSelectedTimeframe('monthly');
    }
  };

  const handleExportData = () => {
    // In a real app, this would trigger an API call to export the data
    toast({
      title: 'Export started',
      description: 'Your data is being exported. It will be ready for download shortly.',
    });
  };

  if (isLoading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex justify-center items-center">
        <div className="text-center">
          <p className="text-xl text-red-500">Error loading dashboard data</p>
          <p className="text-gray-500">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1 relative overflow-y-auto focus:outline-none">
      <Header 
        title="Dashboard" 
        showPeriodSelector 
        showExportButton
        period={period}
        onPeriodChange={handlePeriodChange}
        onExport={handleExportData}
      />
      
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <MetricCard
            title="Total Revenue"
            value={data?.metrics.totalRevenue}
            icon={<span className="text-xl font-medium">₨</span>}
            change={selectedTimeframe === 'monthly' ? revenueChange : undefined}
            iconColor="primary"
          />
          
          <MetricCard
            title="Active Projects"
            value={data?.metrics.activeProjectCount || 0}
            isCount
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            }
            change={selectedTimeframe === 'monthly' ? activeProjectChange : undefined}
            iconColor="secondary"
          />
          
          <MetricCard
            title="Total Employees"
            value={data?.metrics.employeeCount || 0}
            isCount
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
            change={selectedTimeframe === 'monthly' ? employeeChange : undefined}
            iconColor="accent"
          />
          
          <MetricCard
            title="Total Expenses"
            value={data?.metrics.totalExpenses}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            }
            change={selectedTimeframe === 'monthly' ? expensesChange : undefined}
            iconColor="error"
            // changeDirection="up"
            // changeIsGood={false}
          />
        </div>
        
        {/* Charts and Recent Projects */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <div className="lg:col-span-2 bg-white shadow rounded-lg p-4">
            <RevenueChart 
              data={data?.revenueChartData || []}
              selectedTimeframe={selectedTimeframe}
              onTimeframeChange={setSelectedTimeframe}
            />
          </div>
          
          <div className="bg-white shadow rounded-lg p-4">
            <RecentProjects projects={data?.recentProjects || []} />
          </div>
        </div>
        
        {/* Tabs Section - Only showing Employee Overview */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="border-b border-neutral-200">
            <nav className="flex -mb-px">
              <button className="px-6 py-4 text-sm font-medium text-primary border-b-2 border-primary">
                Employee Overview
              </button>
            </nav>
          </div>
          
          <div className="px-4 py-5 sm:p-6">
            <div className="sm:flex sm:items-center mb-6">
              <div className="sm:flex-auto">
                <h3 className="text-lg font-medium text-neutral-700">Employees</h3>
                <p className="mt-1 text-sm text-neutral-500">A preview of employees in the organization. Go to the Employees section for full management.</p>
              </div>
            </div>
            
            {/* Add fallback for when no employees data */}
            {!data?.recentEmployees || data.recentEmployees.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-neutral-500">No employee data available</p>
              </div>
            ) : (
              <div className="mt-2 flex flex-col">
                <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                  <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                      <table className="min-w-full divide-y divide-neutral-200">
                        <thead className="bg-neutral-50">
                          <tr>
                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                              Name
                            </th>
                            <th scope="col" className="px-3 py-3.5 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                              Department
                            </th>
                            <th scope="col" className="px-3 py-3.5 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th scope="col" className="px-3 py-3.5 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                              Project ID
                            </th>
                            <th scope="col" className="px-3 py-3.5 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                              Salary
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-neutral-200">
                          {(data?.recentEmployees || []).slice(0, 4).map((employee) => (
                            <tr key={employee.id}>
                              <td className="py-4 pl-4 pr-3 text-sm whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="h-10 w-10 flex-shrink-0">
                                  <Avatar className="h-10 w-10 mr-4">
            <AvatarImage src={employee.avatar || ''} alt={`${employee.firstName} ${employee.lastName}`} />
            <AvatarFallback>{employee.firstName[0]}{employee.lastName[0]}</AvatarFallback>
          </Avatar>
                                  </div>
                                  <div className="ml-4">
                                    <div className="font-medium text-neutral-900">{`${employee.firstName} ${employee.lastName}`}</div>
                                    <div className="text-neutral-500">{employee.email}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-3 py-4 text-sm text-neutral-500 whitespace-nowrap">
                                {employee.department}
                              </td>
                              <td className="px-3 py-4 text-sm whitespace-nowrap">
                                <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                                  employee.status === 'Active' ? 'bg-green-100 text-green-800' : 
                                  employee.status === 'On Leave' ? 'bg-yellow-100 text-yellow-800' : 
                                  'bg-neutral-100 text-neutral-800'
                                }`}>
                                  {employee.status}
                                </span>
                              </td>
                              <td className="px-3 py-4 text-sm text-neutral-500 whitespace-nowrap">
                                #{employee.projectId || 'Unassigned'}
                              </td>
                              <td className="px-3 py-4 text-sm text-neutral-500 whitespace-nowrap">
                                Rs {parseInt(employee.salary || 0).toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Reports And Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <ProfitDistribution
            className="lg:col-span-2"
            partners={data?.partnerDistributions || []}
          />
          <BonusCalculation 
            className="lg:col-span-1"
            projectBonuses={data?.projectBonuses || []} 
            totalBonusPool={data?.totalBonusPool || 0}
          />
        </div>
      </div>
    </main>
  );
};

export default Dashboard;