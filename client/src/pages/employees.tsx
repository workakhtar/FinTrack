import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/layout/header';
import EmployeeTable from '@/components/employees/employee-table';
import EmployeeForm from '@/components/employees/employee-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useEmployee } from '@/hooks/use-employee';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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

  const handleFormSubmit = async (data: any) => {
    try {
      if (selectedEmployee) {
        await updateEmployee.mutateAsync({ id: selectedEmployee.id, data });
        toast({
          title: 'Employee Updated',
          description: 'The employee has been updated successfully.',
        });
      } else {
        await createEmployee.mutateAsync(data);
        toast({
          title: 'Employee Added',
          description: 'The employee has been added successfully.',
        });
      }
      handleFormClose();
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const text = await file.text();
      const rows = text.split("\n").filter(row => row.trim() !== "");
      const headers = rows[0].split(",").map(h => h.trim());
      console.log('Headers:', headers);

      const employees = rows.slice(1).map(row => {
        const values = row.split(",").map(cell => cell.trim());
        const record: any = {};
        headers.forEach((header, index) => {
          record[header] = values[index];
        });
        console.log('Row data:', record);

        // Map the CSV data to the required format
        const mappedEmployee = {
          firstName: record.firstName,
          lastName: record.lastName,
          email: record.email,
          department: record.department,
          salary: record.salary,
          status: record.status || "Active",
          role: record.role || "",
          projectId: record.projectId ? Number(record.projectId) : null,
          avatar: record.avatar || ""
        };
        console.log('Mapped employee:', mappedEmployee);
        return mappedEmployee;
      });

      console.log('Sending employees to API:', employees);

      const response = await fetch("/api/employees/bulk-upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ employees }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        throw new Error(errorData.error || 'Failed to upload employees');
      }

      const result = await response.json();
      console.log('API Response:', result);

      if (result.failed > 0) {
        toast({
          title: 'Upload Completed with Errors',
          description: `${result.created} records created\n${result.failed} records failed\n\nErrors:\n${result.errors.map((e: any) => `- ${e.error}`).join('\n')}`,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Upload Successful',
          description: `Successfully uploaded ${result.created} employee records`,
        });
      }

      getEmployees.refetch?.();
    } catch (error) {
      console.error("Upload failed:", error);
      toast({
        title: 'Upload Failed',
        description: error instanceof Error ? error.message : 'Failed to upload employees',
        variant: 'destructive',
      });
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
        additionalActions={
          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => document.getElementById('csvUpload')?.click()}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                />
              </svg>
              Upload CSV
            </Button>
            <Input
              id="csvUpload"
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleCSVUpload}
            />
          </div>
        }
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
            onSubmit={handleFormSubmit}
            onCancel={handleFormClose}
          />
        </DialogContent>
      </Dialog>
    </main>
  );
};

export default Employees;
