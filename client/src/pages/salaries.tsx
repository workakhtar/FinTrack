'use client';

import { useState } from "react";
import {
  Dialog,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import SalaryTable from "@/components/employees/salary-table";
import SalaryForm from "@/components/employees/salary-form";
import PageTitle from "@/components/layout/page-title";
import { useSalary } from "@/hooks/use-salary";
import { useEmployee } from "@/hooks/use-employee";
import { getCurrentMonthAndYear } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export default function SalariesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<string>("all");
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [selectedYear, setSelectedYear] = useState<number>(0);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedSalary, setSelectedSalary] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { getEmployees } = useEmployee();
  const { getSalaries, deleteSalary, deleteSalaries } = useSalary();
  const { toast } = useToast();

  const employees = Array.isArray(getEmployees.data) ? getEmployees.data : [];
  const salariesData = Array.isArray(getSalaries.data) ? getSalaries.data : [];

  const processedSalaries = salariesData.map((salary: any) => {
    const employee = employees.find((emp: any) => emp.id === salary.employeeId);
    return {
      ...salary,
      employeeName: employee ? `${employee.firstName} ${employee.lastName}` : `Employee #${salary.employeeId}`,
      basicSalary: Number(salary.basicSalary),
      bonus: Number(salary.bonus),
      taxDeduction: Number(salary.taxDeduction),
      loanDeduction: Number(salary.loanDeduction),
      arrears: Number(salary.arrears),
      travelAllowance: Number(salary.travelAllowance),
      netSalary: Number(salary.netSalary),
      year: Number(salary.year),
      employeeId: Number(salary.employeeId),
    };
  });

  const filteredSalaries = processedSalaries.filter((salary: any) => {
    const matchesSearch = 
      salary.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${salary.month} ${salary.year}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      salary.status.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesEmployee = selectedEmployee === "all" || salary.employeeId.toString() === selectedEmployee;
    const matchesMonth = selectedMonth === "all" || salary.month === selectedMonth;
    const matchesYear = selectedYear === 0 || salary.year === selectedYear;

    return matchesSearch && matchesEmployee && matchesMonth && matchesYear;
  });

  const handleEdit = (salary: any) => {
    setSelectedSalary(salary);
    setIsFormOpen(true);
  };

  const handleDelete = (id: number) => {
    setDeleteId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleMultiDeleteSalaries = async (ids: number[]) => {
    try {
      await deleteSalaries.mutateAsync(ids);
      toast({
        title: 'Salaries deleted',
        description: `${ids.length} salaries have been deleted successfully.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete some salaries.',
        variant: 'destructive',
      });
    }
  };

  const confirmDelete = async () => {
    if (deleteId) {
      await deleteSalary.mutateAsync(deleteId);
      setIsDeleteDialogOpen(false);
      setDeleteId(null);
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

      const salaries = rows.slice(1).map(row => {
        const values = row.split(",").map(cell => cell.trim());
        const record: any = {};
        headers.forEach((header, index) => {
          record[header] = values[index];
        });
        console.log('Row data:', record);

        // Map the simple format to the required format
        const mappedSalary = {
          employeeId: Number(record.employeeId),
          month: record.month,
          year: Number(record.year),
          basicSalary: record.amount || record.basicSalary,
          bonus: "0",
          taxDeduction: "0",
          loanDeduction: "0",
          arrears: "0",
          travelAllowance: "0",
          netSalary: record.amount || record.basicSalary,
          status: record.status || "Pending",
          paymentDate: null
        };
        console.log('Mapped salary:', mappedSalary);
        return mappedSalary;
      });

      console.log('Sending salaries to API:', salaries);
      const user = JSON.parse(localStorage.getItem("user") || "");
      const token = user?.token;

      const response = await fetch("https://inovaqofinance-be-production.up.railway.app/api/salaries/bulk-upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ salaries }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        throw new Error(errorData.error || 'Failed to upload salaries');
      }

      const result = await response.json();
      console.log('API Response:', result);

      if (result.failed > 0) {
        console.error('Failed records:', result.errors);
        alert(`Upload completed with some errors:\n${result.created} records created\n${result.failed} records failed\n\nErrors:\n${result.errors.map((e: any) => `- ${e.error}`).join('\n')}`);
      } else {
        alert(`Successfully uploaded ${result.created} salary records`);
      }

      getSalaries.refetch?.();
    } catch (error) {
      console.error("Upload failed:", error);
      alert(error instanceof Error ? error.message : 'Failed to upload salaries');
    }
  };

  const months = ["all", "January", "February", "March", "April", "May", "June", 
                  "July", "August", "September", "October", "November", "December"];
  const currentYear = new Date().getFullYear();
  const years = [0, ...Array.from({ length: 5 }, (_, i) => currentYear - 2 + i)];

  return (
    <div className="container py-6 h-full overflow-y-auto">
      <PageTitle 
        title="Salary Records" 
        description="Manage employee salaries and payment records."
        icon={
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        }
        action={
          <>
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
              <DialogTrigger asChild>
                <Button className="mr-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  Add Salary Record
                </Button>
              </DialogTrigger>
              <SalaryForm
                salary={selectedSalary}
                employees={employees}
                onSuccess={() => {
                  setIsFormOpen(false);
                  setSelectedSalary(null);
                }}
                onCancel={() => {
                  setIsFormOpen(false);
                  setSelectedSalary(null);
                }}
              />
            </Dialog>

            {/* CSV Upload Button */}
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
          </>
        }
      />

      <div className="mt-6 p-6 bg-white rounded-lg shadow overflow-x-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <div className="w-full md:w-1/3">
            <Input
              placeholder="Search salaries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex flex-col md:flex-row gap-4">
            <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by employee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Employees</SelectItem>
                {employees.map((employee: any) => (
                  <SelectItem key={employee.id} value={employee.id.toString()}>
                    {employee.firstName} {employee.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-full md:w-[140px]">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month} value={month}>
                    {month === "all" ? "All Months" : month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select 
              value={selectedYear.toString()} 
              onValueChange={(value) => setSelectedYear(parseInt(value))}
            >
              <SelectTrigger className="w-full md:w-[120px]">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year === 0 ? "All Years" : year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <SalaryTable
            salaries={filteredSalaries}
            isLoading={getSalaries.isLoading || getEmployees.isLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onMultiDelete={handleMultiDeleteSalaries}
          />
        </div>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              salary record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteSalary.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
