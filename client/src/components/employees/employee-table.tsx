import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import StatusBadge from "@/components/shared/status-badge";
import { DataTable } from "@/components/ui/data-table";
import { formatCurrency } from "@/lib/utils";

interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  status: string;
  projectId: number | null;
  salary: number | string;
  role: string;
  avatar: string;
}

interface EmployeeTableProps {
  employees: Employee[];
  isLoading: boolean;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  sortOption: string;
  onSortChange: (value: string) => void;
  onEdit: (employee: Employee) => void;
  onDelete: (id: number) => void;
  onMultiDelete?: (ids: number[]) => void;
}

const EmployeeTable: React.FC<EmployeeTableProps> = ({
  employees,
  isLoading,
  searchTerm,
  onSearchChange,
  sortOption,
  onSortChange,
  onEdit,
  onDelete,
  onMultiDelete
}) => {
  const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  
  const handleToggleSelectAll = () => {
    if (selectAll) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(employees.map(emp => emp.id));
    }
    setSelectAll(!selectAll);
  };
  
  const handleToggleSelect = (id: number) => {
    if (selectedEmployees.includes(id)) {
      setSelectedEmployees(selectedEmployees.filter(empId => empId !== id));
      setSelectAll(false);
    } else {
      setSelectedEmployees([...selectedEmployees, id]);
      if (selectedEmployees.length + 1 === employees.length) {
        setSelectAll(true);
      }
    }
  };
  
  const handleMultiDelete = () => {
    if (onMultiDelete && selectedEmployees.length > 0) {
      onMultiDelete(selectedEmployees);
      setSelectedEmployees([]);
      setSelectAll(false);
    }
  };
  
  // Remove extra debugging code to keep the console clean
  // Now that we understand what's happening with the data
  
  const columns = [
    {
      header: "",
      accessorKey: "select",
      cell: (item: Employee) => (
        <Checkbox
          checked={selectedEmployees.includes(item.id)}
          onCheckedChange={() => handleToggleSelect(item.id)}
        />
      )
    },
    {
      header: "Name",
      accessorKey: "name",
      cell: (item: Employee) => (
        <div className="flex items-center">
          <Avatar className="h-10 w-10 mr-4">
            <AvatarImage src={item.avatar || ''} alt={`${item.firstName} ${item.lastName}`} />
            <AvatarFallback>{item.firstName[0]}{item.lastName[0]}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium text-neutral-900">{`${item.firstName} ${item.lastName}`}</div>
            <div className="text-neutral-500">{item.email}</div>
          </div>
        </div>
      )
    },
    {
      header: "Department",
      accessorKey: "department"
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (item: Employee) => {
        return <StatusBadge status={item.status} />;
      }
    },
    {
      header: "Role",
      accessorKey: "role"
    },
    {
      header: "Salary",
      accessorKey: "salary",
      cell: (item: Employee) => {
        return formatCurrency(item.salary);
      }
    }
  ];

  const actions = (employee: Employee) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
            />
          </svg>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onEdit(employee)}>
          Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-red-600"
          onClick={() => onDelete(employee.id)}
        >
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-neutral-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-md leading-5 bg-white placeholder-neutral-500 focus:outline-none focus:placeholder-neutral-400 focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-neutral-500">Sort by:</span>
          <select
            className="form-select rounded-md border-neutral-300 shadow-sm focus:border-primary focus:ring focus:ring-primary/20 focus:ring-opacity-50 text-sm"
            value={sortOption}
            onChange={(e) => onSortChange(e.target.value)}
          >
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
            <option value="department-asc">Department (A-Z)</option>
            <option value="department-desc">Department (Z-A)</option>
          </select>
        </div>
      </div>
      
      {employees.length > 0 && (
        <div className="flex items-center gap-2 mb-2">
          <Checkbox 
            checked={selectAll} 
            onCheckedChange={handleToggleSelectAll} 
            id="select-all-employees" 
          />
          <label htmlFor="select-all-employees" className="text-sm font-medium cursor-pointer">
            Select All
          </label>
          
          {selectedEmployees.length > 0 && (
            <Button 
              variant="destructive"
              size="sm"
              className="ml-4"
              onClick={handleMultiDelete}
            >
              Delete Selected ({selectedEmployees.length})
            </Button>
          )}
        </div>
      )}

      <DataTable
        columns={columns}
        data={employees}
        isLoading={isLoading}
        actions={actions}
      />
    </div>
  );
};

export default EmployeeTable;
