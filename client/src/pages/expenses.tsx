import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dialog } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useExpense } from '@/hooks/use-expense';
import Header from '@/components/layout/header';
import ExpenseForm from '@/components/expenses/expense-form';
import BasicExpenseTable from '@/components/expenses/basic-expense-table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const Expenses = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const { toast } = useToast();
  const { deleteExpense } = useExpense();

  const { data: expenses = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['/api/expenses'],
  });

  // Filter expenses based on search term and category with safety checks
  const filteredExpenses = expenses && Array.isArray(expenses)
    ? expenses.filter((expense: any) => {
        try {
          const description = expense?.description || '';
          const category = expense?.category || '';
          
          const descriptionMatch = description.toLowerCase().includes(searchTerm.toLowerCase());
          const categoryMatch = category.toLowerCase().includes(searchTerm.toLowerCase());
          const categoryFilterMatch = categoryFilter === 'all' || category.toLowerCase() === categoryFilter.toLowerCase();
          
          return (descriptionMatch || categoryMatch) && categoryFilterMatch;
        } catch (error) {
          console.error('Error filtering expense:', error);
          return false;
        }
      })
    : [];

  const handleAddExpense = () => {
    setSelectedExpense(null);
    setIsFormOpen(true);
  };

  const handleEditExpense = (expense: any) => {
    setSelectedExpense(expense);
    setIsFormOpen(true);
  };

  const handleDeleteExpense = async (id: number) => {
    try {
      await deleteExpense.mutateAsync(id);
      refetch();
      toast({
        title: 'Expense deleted',
        description: 'The expense has been deleted successfully.',
      });
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete expense.',
        variant: 'destructive',
      });
    }
  };
  
  const handleMultiDeleteExpenses = async (ids: number[]) => {
    try {
      // Create a confirmation dialog
      if (window.confirm(`Are you sure you want to delete ${ids.length} expenses?`)) {
        // Delete each expense sequentially
        for (const id of ids) {
          await deleteExpense.mutateAsync(id);
        }
        
        toast({
          title: 'Expenses deleted',
          description: `${ids.length} expenses have been deleted successfully.`,
        });
        refetch();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete some expenses.',
        variant: 'destructive',
      });
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    refetch();
    toast({
      title: selectedExpense ? 'Expense Updated' : 'Expense Added',
      description: selectedExpense 
        ? 'The expense has been updated successfully.' 
        : 'The expense has been added successfully.',
    });
  };

  return (
    <main className="flex-1 relative overflow-y-auto focus:outline-none">
      <Header 
        title="Expenses" 
        subtitle="Manage office expenses, taxes, and other costs"
        actionButton={{
          label: 'Add Expense',
          onClick: handleAddExpense
        }}
      />
      
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2 md:items-center justify-between mb-4">
          <div className="relative w-full md:w-64">
            <Input
              type="text"
              placeholder="Search expenses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          
          <div className="flex space-x-2">
            <Select
              value={categoryFilter}
              onValueChange={setCategoryFilter}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="tax">Tax</SelectItem>
                <SelectItem value="rent">Rent</SelectItem>
                <SelectItem value="grocery">Grocery</SelectItem>
                <SelectItem value="utilities">Utilities</SelectItem>
                <SelectItem value="internet">Internet</SelectItem>
                <SelectItem value="office supplies">Office Supplies</SelectItem>
                <SelectItem value="travel">Travel</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="software">Software</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <BasicExpenseTable 
          expenses={filteredExpenses}
          isLoading={isLoading}
          onEdit={handleEditExpense}
          onDelete={handleDeleteExpense}
          onMultiDelete={handleMultiDeleteExpenses}
        />
      </div>

      <Dialog open={isFormOpen} onOpenChange={handleFormClose}>
        <ExpenseForm 
          expense={selectedExpense}
          onSuccess={handleFormSuccess}
          onCancel={handleFormClose}
        />
      </Dialog>
    </main>
  );
};

export default Expenses;