import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/layout/header';
import EmployeeTable from '@/components/employees/employee-table';
import EmployeeForm from '@/components/employees/employee-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useEmployee } from '@/hooks/use-employee';
import { Button } from '@/components/ui/button';

const Employees = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('name-asc');
  const { toast } = useToast();
  const { getEmployees, createEmployee, updateEmployee, deleteEmployee, deleteEmployees } = useEmployee();

  const { data: employees = [], isLoading } = getEmployees;

  const handleAddEmployee = () => {
    setSelectedEmployee(null);
    setIsFormOpen(true);
  };

  const handleEditEmployee = (employee: any) => {
    setSelectedEmployee(employee);
    setIsFormOpen(true);
  };

  const handleDeleteEmployee = async (id: number) => {
    try {
      await deleteEmployee.mutateAsync(id);
      toast({
        title: 'Employee deleted',
        description: 'The employee has been deleted successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete employee.',
        variant: 'destructive',
      });
    }
  };
  
  const handleMultiDeleteEmployees = async (ids: number[]) => {
    try {
      await deleteEmployees.mutateAsync(ids);
        toast({
          title: 'Employees deleted',
          description: `${ids.length} employees have been deleted successfully.`,
        });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete some employees.',
        variant: 'destructive',
      });
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedEmployee(null);
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setSelectedEmployee(null);
    toast({
      title: selectedEmployee ? 'Employee Updated' : 'Employee Added',
      description: `The employee has been ${selectedEmployee ? 'updated' : 'added'} successfully.`,
    });
  };

  const handleCreate = async (data: any) => {
    try {
      await createEmployee.mutateAsync(data);
      handleFormSuccess();
    } catch (error) {
      console.error("Error creating employee:", error);
    }
  };

  const handleUpdate = async (data: any) => {
    try {
      await updateEmployee.mutateAsync({ id: selectedEmployee.id, data });
      handleFormSuccess();
    } catch (error) {
      console.error("Error updating employee:", error);
    }
  };

  const filteredEmployees = employees && Array.isArray(employees)
    ? employees.filter((employee: any) => {
        const fullName = `${employee.firstName} ${employee.lastName}`.toLowerCase();
        const email = employee.email.toLowerCase();
        const department = employee.department.toLowerCase();
        const searchLower = searchTerm.toLowerCase();
        
        return (
          fullName.includes(searchLower) ||
          email.includes(searchLower) ||
          department.includes(searchLower)
        );
      })
    : [];

  const sortedEmployees = [...filteredEmployees].sort((a, b) => {
    switch (sortOption) {
      case 'name-asc':
        return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
      case 'name-desc':
        return `${b.firstName} ${b.lastName}`.localeCompare(`${a.firstName} ${a.lastName}`);
      case 'department':
        return a.department.localeCompare(b.department);
      case 'salary-high':
        return parseFloat(b.salary) - parseFloat(a.salary);
      case 'salary-low':
        return parseFloat(a.salary) - parseFloat(b.salary);
      default:
        return 0;
    }
  });

  if (isLoading) {
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
          <h3 className="text-xl font-medium text-gray-900">Loading Employees</h3>
          <p className="mt-1 text-gray-500">Loading employee data. Please wait...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1 relative overflow-y-auto focus:outline-none">
      <Header 
        title="Employees" 
        subtitle="Manage your organization's employees"
        actionButton={{
          label: 'Add Employee',
          onClick: handleAddEmployee
        }}
      />
      
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <EmployeeTable 
          employees={sortedEmployees}
          isLoading={isLoading}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          sortOption={sortOption}
          onSortChange={setSortOption}
          onEdit={handleEditEmployee}
          onDelete={handleDeleteEmployee}
          onMultiDelete={handleMultiDeleteEmployees}
        />
      </div>

      <Dialog open={isFormOpen} onOpenChange={handleFormClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedEmployee ? "Edit Employee" : "Add Employee"}
            </DialogTitle>
          </DialogHeader>
        <EmployeeForm 
          employee={selectedEmployee}
            onSubmit={selectedEmployee ? handleUpdate : handleCreate}
          onCancel={handleFormClose}
        />
        </DialogContent>
      </Dialog>
    </main>
  );
};

export default Employees;
