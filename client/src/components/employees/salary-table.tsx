import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useSalary } from "@/hooks/use-salary";
import { DataTable } from "@/components/ui/data-table";
import { formatCurrency } from "@/lib/utils";

interface Salary {
  id: number;
  employeeId: number;
  month: string;
  year: number;
  basicSalary: number;
  bonus: number;
  taxDeduction: number;
  loanDeduction: number;
  arrears: number;
  travelAllowance: number;
  netSalary: number;
  status: string;
  paymentDate: string | null;
  employeeName?: string; // Optional, for joined data
}

interface SalaryTableProps {
  salaries: Salary[];
  isLoading: boolean;
  onEdit: (salary: Salary) => void;
  onDelete: (id: number) => void;
  onMultiDelete: (ids: number[]) => void;
}

const SalaryTable: React.FC<SalaryTableProps> = ({
  salaries,
  isLoading,
  onEdit,
  onDelete,
  onMultiDelete
}) => {
  const [selectedSalaries, setSelectedSalaries] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedSalaries(salaries.map((salary) => salary.id));
    } else {
      setSelectedSalaries([]);
    }
  };

  const handleSelectSalary = (checked: boolean, salaryId: number) => {
    if (checked) {
      setSelectedSalaries([...selectedSalaries, salaryId]);
    } else {
      setSelectedSalaries(selectedSalaries.filter((id) => id !== salaryId));
    }
  };

  const handleMultiDelete = async () => {
    if (selectedSalaries.length === 0) return;
    await onMultiDelete(selectedSalaries);
    setSelectedSalaries([]);
    setSelectAll(false);
  };

  const getStatusColor = (status: string): string => {
    switch(status.toLowerCase()) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const columns = [
    {
      header: "Select",
      accessorKey: "id",
      cell: (salary: Salary) => (
        <Checkbox
          checked={selectedSalaries.includes(salary.id)}
          onCheckedChange={(checked) => handleSelectSalary(checked as boolean, salary.id)}
        />
      )
    },
    {
      header: "Employee",
      accessorKey: "employeeName",
      cell: (salary: Salary) => (
        <div className="font-medium text-neutral-900">{salary.employeeName || `Employee #${salary.employeeId}`}</div>
      )
    },
    {
      header: "Period",
      accessorKey: "period",
      cell: (salary: Salary) => (
        <div className="text-neutral-700">{salary.month} {salary.year}</div>
      )
    },
    {
      header: "Basic Salary",
      accessorKey: "basicSalary",
      cell: (salary: Salary) => (
        <div className="font-medium">{formatCurrency(salary.basicSalary)}</div>
      )
    },
    {
      header: "Additions",
      accessorKey: "additions",
      cell: (salary: Salary) => {
        const additions = salary.bonus + salary.arrears + salary.travelAllowance;
        return (
          <div className="font-medium text-green-600">{formatCurrency(additions)}</div>
        );
      }
    },
    {
      header: "Deductions",
      accessorKey: "deductions",
      cell: (salary: Salary) => {
        const deductions = salary.taxDeduction + salary.loanDeduction;
        return (
          <div className="font-medium text-red-600">{formatCurrency(deductions)}</div>
        );
      }
    },
    {
      header: "Net Salary",
      accessorKey: "netSalary",
      cell: (salary: Salary) => (
        <div className="font-bold text-primary">{formatCurrency(salary.netSalary)}</div>
      )
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (salary: Salary) => (
        <div className={`px-2 py-1 rounded-full text-xs inline-block ${getStatusColor(salary.status)}`}>
          {salary.status}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="select-all"
            checked={selectAll}
            onCheckedChange={handleSelectAll}
          />
          <label
            htmlFor="select-all"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Select All
          </label>
        </div>
        {selectedSalaries.length > 0 && (
          <Button
            variant="destructive"
            size="sm"
            onClick={handleMultiDelete}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete Selected ({selectedSalaries.length})
          </Button>
        )}
      </div>
    <DataTable
      columns={columns}
      data={salaries}
      isLoading={isLoading}
      actions={(salary) => (
        <div className="flex items-center justify-end space-x-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(salary)}
            className="text-primary hover:text-primary-dark"
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
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(salary.id)}
            className="text-destructive hover:text-destructive/80"
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
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </Button>
        </div>
      )}
      emptyState={
        <div className="text-center py-10">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10 mx-auto text-neutral-400"
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
          <h3 className="mt-2 text-sm font-medium text-neutral-900">No salary records found</h3>
          <p className="mt-1 text-sm text-neutral-500">
            Get started by adding a new salary record.
          </p>
        </div>
      }
    />
    </div>
  );
};

export default SalaryTable;