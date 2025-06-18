import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/layout/header';
import ReportCard from '@/components/reports/report-card';
import ProfitSharingChart from '@/components/reports/profit-sharing-chart';
import RevenueTrendChart from '@/components/reports/revenue-trend-chart';
import ExportReportDialog from '@/components/reports/export-report-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';

const Reports = () => {
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('financial');
  const { toast } = useToast();

  const { data: dashboard, isLoading: isDashboardLoading } = useQuery({
    queryKey: ['/api/dashboard'],
  });

  const { data: revenues, isLoading: isRevenuesLoading } = useQuery({
    queryKey: ['/api/revenues'],
  });

  const { data: partners, isLoading: isPartnersLoading } = useQuery({
    queryKey: ['/api/partners'],
  });

  const { data: profitDistributions, isLoading: isDistributionsLoading } = useQuery({
    queryKey: ['/api/profit-distributions'],
  });

  const handleExportData = () => {
    setExportDialogOpen(true);
  };

  const handleExportComplete = (reportType: string) => {
    setExportDialogOpen(false);
    toast({
      title: 'Report Exported',
      description: `${reportType} report has been generated and is ready for download.`,
    });
  };

  if (isDashboardLoading || isRevenuesLoading || isPartnersLoading || isDistributionsLoading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Calculate financial metrics
  const currentMonth = revenues?.[0] || { amount: 0, expenses: 0, profit: 0 };
  const previousMonth = revenues?.[1] || { amount: 0, expenses: 0, profit: 0 };
  
  const profitMargin = currentMonth.profit / currentMonth.amount * 100 || 0;
  const expenseRatio = currentMonth.expenses / currentMonth.amount * 100 || 0;
  
  const profitGrowth = ((currentMonth.profit - previousMonth.profit) / previousMonth.profit) * 100 || 0;
  const revenueGrowth = ((currentMonth.amount - previousMonth.amount) / previousMonth.amount) * 100 || 0;

  return (
    <main className="flex-1 relative overflow-y-auto focus:outline-none">
      <Header 
        title="Reports" 
        subtitle="Analyze and export financial reports"
        showExportButton
        onExport={handleExportData}
      />
      
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <Tabs defaultValue="financial" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="financial">Financial Overview</TabsTrigger>
            <TabsTrigger value="profit-sharing">Profit Sharing</TabsTrigger>
            <TabsTrigger value="employee-performance">Employee Performance</TabsTrigger>
          </TabsList>
          
          <TabsContent value="financial" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Revenue Trends</CardTitle>
                  <CardDescription>Monthly revenue, expenses and profit</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <RevenueTrendChart data={revenues || []} />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Financial Metrics</CardTitle>
                  <CardDescription>Key financial indicators</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <ReportCard 
                      title="Profit Margin"
                      value={`${profitMargin.toFixed(1)}%`}
                      description="Current month"
                      trend={profitMargin > 30 ? 'positive' : profitMargin < 20 ? 'negative' : 'neutral'}
                    />
                    
                    <ReportCard 
                      title="Expense Ratio"
                      value={`${expenseRatio.toFixed(1)}%`}
                      description="Current month"
                      trend={expenseRatio < 50 ? 'positive' : expenseRatio > 70 ? 'negative' : 'neutral'}
                      inverseTrend
                    />
                    
                    <ReportCard 
                      title="Profit Growth"
                      value={`${profitGrowth.toFixed(1)}%`}
                      description="vs previous month"
                      trend={profitGrowth > 0 ? 'positive' : 'negative'}
                    />
                    
                    <ReportCard 
                      title="Revenue Growth"
                      value={`${revenueGrowth.toFixed(1)}%`}
                      description="vs previous month"
                      trend={revenueGrowth > 0 ? 'positive' : 'negative'}
                    />
                  </div>
                  
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-neutral-500">Current Revenue:</span>
                      <span className="text-sm font-semibold">{formatCurrency(currentMonth.amount)}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-neutral-500">Current Expenses:</span>
                      <span className="text-sm font-semibold">{formatCurrency(currentMonth.expenses)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-neutral-500">Current Profit:</span>
                      <span className="text-sm font-semibold text-primary">{formatCurrency(currentMonth.profit)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="profit-sharing" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Profit Distribution</CardTitle>
                  <CardDescription>Partner profit sharing breakdown</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ProfitSharingChart 
                    partners={partners || []}
                    distributions={profitDistributions || []}
                  />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Partner Details</CardTitle>
                  <CardDescription>Individual contributions and payments</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {partners?.map((partner: any) => {
                      const partnerDistributions = (profitDistributions || [])
                        .filter((dist: any) => dist.partnerId === partner.id)
                        .sort((a: any, b: any) => b.year - a.year || 
                          ['January', 'February', 'March', 'April', 'May', 'June', 
                           'July', 'August', 'September', 'October', 'November', 'December']
                          .indexOf(b.month) - 
                          ['January', 'February', 'March', 'April', 'May', 'June', 
                           'July', 'August', 'September', 'October', 'November', 'December']
                          .indexOf(a.month));
                      
                      const latestDistribution = partnerDistributions[0] || { amount: 0, month: '', year: '' };
                      
                      return (
                        <div key={partner.id} className="bg-neutral-50 rounded-md p-4">
                          <div className="flex justify-between mb-2">
                            <span className="font-medium">{partner.name}</span>
                            <span className="font-medium text-primary">{partner.share}%</span>
                          </div>
                          <div className="text-sm text-neutral-600 mb-1">{partner.email}</div>
                          <div className="flex justify-between mt-2 text-sm">
                            <span className="text-neutral-500">
                              Latest Distribution ({latestDistribution.month} {latestDistribution.year}):
                            </span>
                            <span className="font-medium">{formatCurrency(latestDistribution.amount)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="employee-performance" className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Team Performance</CardTitle>
                <CardDescription>Department productivity and efficiency metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboard?.teamInsights?.map((team: any, index: number) => (
                    <div key={index} className="bg-neutral-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <div>
                          <h4 className="font-medium text-neutral-800">{team.name}</h4>
                          <p className="text-sm text-neutral-500">{team.count} employees</p>
                        </div>
                        <span className={`text-sm font-medium ${team.productivity >= 0 ? 'text-success' : 'text-error'}`}>
                          {team.productivity >= 0 ? '+' : ''}{team.productivity}% Productivity
                        </span>
                      </div>
                      
                      <div className="mt-2 w-full bg-neutral-200 rounded h-2">
                        <div 
                          className={`h-2 rounded ${
                            team.productivity >= 10 ? 'bg-primary' : 
                            team.productivity > 0 ? 'bg-secondary' : 'bg-destructive'
                          }`} 
                          style={{ width: `${team.progress}%` }}
                        ></div>
                      </div>
                      
                      <div className="mt-2 flex justify-between text-xs text-neutral-500">
                        <span>Efficiency: {team.progress}%</span>
                        <span>Target: 90%</span>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      toast({
                        title: 'Report Generated',
                        description: 'Detailed employee performance report has been generated.',
                      });
                    }}
                  >
                    Generate Detailed Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      <ExportReportDialog 
        open={exportDialogOpen} 
        onOpenChange={setExportDialogOpen} 
        onExport={handleExportComplete}
        currentTab={activeTab}
      />
    </main>
  );
};

export default Reports;
