import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/layout/header';
import BillingTable from '@/components/billing/billing-table';
import BillingForm from '@/components/billing/billing-form';
import { Dialog } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useBilling } from '@/hooks/use-billing';
import { apiRequest } from '@/lib/queryClient';

const Billing = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedBilling, setSelectedBilling] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { toast } = useToast();
  const { getBillings, createBilling, updateBilling, deleteBilling } = useBilling();

  const { data: billings, isLoading: isBillingsLoading, isError: isBillingsError, refetch: refetchBillings } = getBillings;

  const { data: projects, isLoading: isProjectsLoading } = useQuery({
    queryKey: ['/api/projects'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/projects');
      return response.json();
    }
  });

  // Enhance billings with project names
  const enhancedBillings = billings && projects
    ? billings.map((billing: any) => {
        const project = projects.find((p: any) => p.id === billing.projectId);
        return {
          ...billing,
          projectName: project ? project.name : 'Unknown Project'
        };
      })
    : [];

  // Filter billings based on search term and status
  const filteredBillings = enhancedBillings
    ? enhancedBillings.filter((billing: any) => {
        const projectNameMatch = billing.projectName.toLowerCase().includes(searchTerm.toLowerCase());
        const periodMatch = `${billing.month} ${billing.year}`.toLowerCase().includes(searchTerm.toLowerCase());
        const statusMatch = statusFilter === 'all' || billing.status === statusFilter;
        return (projectNameMatch || periodMatch) && statusMatch;
      })
    : [];

  const handleAddBilling = () => {
    setSelectedBilling(null);
    setIsFormOpen(true);
  };

  const handleEditBilling = (billing: any) => {
    setSelectedBilling(billing);
    setIsFormOpen(true);
  };

  const handleDeleteBilling = async (id: number) => {
    try {
      await deleteBilling.mutateAsync(id);
      refetchBillings();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete billing record.',
        variant: 'destructive',
      });
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedBilling(null);
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setSelectedBilling(null);
    refetchBillings();
    toast({
      title: selectedBilling ? 'Billing Updated' : 'Billing Added',
      description: `The billing record has been ${selectedBilling ? 'updated' : 'added'} successfully.`,
    });
  };

  if (isBillingsError) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-medium text-gray-900">Error Loading Billing Data</h3>
          <p className="mt-1 text-gray-500">There was an error loading the billing data. Please try again later.</p>
          <button
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            onClick={() => refetchBillings()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1 relative overflow-y-auto focus:outline-none">
      <Header 
        title="Billing" 
        subtitle="Manage your project billing and invoices"
        actionButton={{
          label: 'Add Billing',
          onClick: handleAddBilling
        }}
      />
      
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <BillingTable 
          billings={filteredBillings}
          isLoading={isBillingsLoading || isProjectsLoading}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          onEdit={handleEditBilling}
          onDelete={handleDeleteBilling}
        />
      </div>

      <Dialog open={isFormOpen} onOpenChange={handleFormClose}>
        <BillingForm 
          billing={selectedBilling}
          projects={projects}
          onSuccess={handleFormSuccess}
          onCancel={handleFormClose}
        />
      </Dialog>
    </main>
  );
};

export default Billing;
