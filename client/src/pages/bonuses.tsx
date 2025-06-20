import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/layout/header';
import BonusTable from '@/components/bonuses/bonus-table';
import BonusForm from '@/components/bonuses/bonus-form';
import QuarterlyBonusCalculator from '@/components/bonuses/quarterly-bonus-calculator';
import { Dialog } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useBonus } from '@/hooks/use-bonus';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { getCurrentMonthAndYear } from '@/lib/utils';

const Bonuses = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isQuarterlyBonusFormOpen, setIsQuarterlyBonusFormOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [selectedBonus, setSelectedBonus] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { toast } = useToast();
  const { deleteBonus, finalizeAllBonuses, calculateQuarterlyBonuses } = useBonus();
  const currentPeriod = getCurrentMonthAndYear();

  const { data: bonuses, isLoading: isBonusesLoading, isError: isBonusesError, refetch: refetchBonuses } = useQuery({
    queryKey: ['/api/bonuses'],
  });

  const { data: employees } = useQuery({
    queryKey: ['/api/employees'],
  });

  const { data: projects } = useQuery({
    queryKey: ['/api/projects'],
  });

  // Enhance bonuses with employee and project names
  const enhancedBonuses = bonuses && employees && projects
    ? bonuses.map((bonus: any) => {
        const employee = employees.find((e: any) => e.id === bonus.employeeId);
        const project = projects.find((p: any) => p.id === bonus.projectId);
        return {
          ...bonus,
          employeeName: employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown Employee',
          projectName: project ? project.name : 'Unknown Project'
        };
      })
    : [];

  // Filter bonuses based on search term and status
  const filteredBonuses = enhancedBonuses
    ? enhancedBonuses.filter((bonus: any) => {
        const employeeNameMatch = bonus.employeeName.toLowerCase().includes(searchTerm.toLowerCase());
        const projectNameMatch = bonus.projectName.toLowerCase().includes(searchTerm.toLowerCase());
        const statusMatch = statusFilter === 'all' || bonus.status === statusFilter;
        return (employeeNameMatch || projectNameMatch) && statusMatch;
      })
    : [];

  const handleAddBonus = () => {
    setSelectedBonus(null);
    setIsFormOpen(true);
  };

  const handleEditBonus = (bonus: any) => {
    setSelectedBonus(bonus);
    setIsFormOpen(true);
  };

  const handleDeleteBonus = async (id: number) => {
    try {
      await deleteBonus.mutateAsync(id);
      refetchBonuses();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete bonus.',
        variant: 'destructive',
      });
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedBonus(null);
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setSelectedBonus(null);
    refetchBonuses();
    toast({
      title: selectedBonus ? 'Bonus Updated' : 'Bonus Added',
      description: `The bonus has been ${selectedBonus ? 'updated' : 'added'} successfully.`,
    });
  };

  const handleFinalizeAllBonuses = async () => {
    try {
      await finalizeAllBonuses.mutateAsync({
        month: currentPeriod.month,
        year: currentPeriod.year
      });
      refetchBonuses();
      setIsConfirmDialogOpen(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to finalize bonuses.',
        variant: 'destructive',
      });
    }
  };

  if (isBonusesError) {
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
          <h3 className="text-xl font-medium text-gray-900">Error Loading Bonus Data</h3>
          <p className="mt-1 text-gray-500">There was an error loading the bonus data. Please try again later.</p>
          <button
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            onClick={() => refetchBonuses()}
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
        title="Bonuses" 
        subtitle="Manage employee performance bonuses"
        actionButton={{
          label: 'Add Bonus',
          onClick: handleAddBonus
        }}
      />
      
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-end mb-4 space-x-3">
          <Button 
            variant="outline"
            onClick={() => setIsQuarterlyBonusFormOpen(true)}
            className="inline-flex items-center"
            disabled={calculateQuarterlyBonuses?.isPending}
          >
            {calculateQuarterlyBonuses.isPending ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing...
              </>
            ) : (
              <>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-4 w-4 mr-2" 
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Calculate Quarterly Bonuses
              </>
            )}
          </Button>
          
          {/* <Button 
            variant="secondary"
            onClick={() => setIsConfirmDialogOpen(true)}
            className="inline-flex items-center"
            disabled={finalizeAllBonuses.isPending}
          >
            {finalizeAllBonuses.isPending ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing...
              </>
            ) : (
              <>
                <svg 
                  onClick={() => alert('Bonus finalization would happen here')}
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-4 w-4 mr-2" 
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
                Finalize All Bonuses
              </>
            )}
          </Button> */}
          <div className="flex justify-end mb-4">
            <Button
              className="justify-center"
              onClick={() => alert('Bonus finalization would happen here')}
            >
              Finalize all Bonuses
            </Button>
          </div>
        </div>
        
        <BonusTable 
          bonuses={filteredBonuses}
          isLoading={isBonusesLoading}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          onEdit={handleEditBonus}
          onDelete={handleDeleteBonus}
        />
      </div>

      <Dialog open={isFormOpen} onOpenChange={handleFormClose}>
        <BonusForm 
          bonus={selectedBonus}
          employees={employees}
          projects={projects}
          onSuccess={handleFormSuccess}
          onCancel={handleFormClose}
        />
      </Dialog>
      
      <Dialog open={isQuarterlyBonusFormOpen} onOpenChange={setIsQuarterlyBonusFormOpen}>
        <QuarterlyBonusCalculator 
          employees={employees}
          projects={projects}
          onSuccess={() => {
            setIsQuarterlyBonusFormOpen(false);
            refetchBonuses();
            toast({
              title: "Quarterly Bonuses Calculated",
              description: "Quarterly bonuses have been calculated and added successfully.",
            });
          }}
          onCancel={() => setIsQuarterlyBonusFormOpen(false)}
        />
      </Dialog>

      <AlertDialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Finalize All Bonuses</AlertDialogTitle>
            <AlertDialogDescription>
              This will change the status of all pending bonuses to "Approved" for {currentPeriod.month} {currentPeriod.year}.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleFinalizeAllBonuses}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
};

export default Bonuses;
