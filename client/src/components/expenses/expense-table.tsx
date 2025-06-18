import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { formatCurrency } from "@/lib/utils";
import { DataTable } from "@/components/ui/data-table";
import { PencilIcon, TrashIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Expense {
  id: number;
  category: string;
  description: string;
  amount: number;
  month: string;
  year: number;
  date: string;
  paymentMethod: string | null;
  receiptUrl: string | null;
  notes: string | null;
}

interface ExpenseTableProps {
  expenses: Expense[];
  isLoading: boolean;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  categoryFilter: string;
  onCategoryFilterChange: (category: string) => void;
  onEdit: (expense: Expense) => void;
  onDelete: (id: number) => void;
  onMultiDelete?: (ids: number[]) => void;
}

const ExpenseTable = ({
  expenses,
  isLoading,
  searchTerm,
  onSearchChange,
  categoryFilter,
  onCategoryFilterChange,
  onEdit,
  onDelete,
  onMultiDelete
}: ExpenseTableProps) => {
  const [selectedExpenses, setSelectedExpenses] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  
  const handleToggleSelectAll = () => {
    if (selectAll) {
      setSelectedExpenses([]);
    } else {
      setSelectedExpenses(expenses.map(exp => exp.id));
    }
    setSelectAll(!selectAll);
  };
  
  const handleToggleSelect = (id: number) => {
    if (selectedExpenses.includes(id)) {
      setSelectedExpenses(selectedExpenses.filter(expId => expId !== id));
      setSelectAll(false);
    } else {
      setSelectedExpenses([...selectedExpenses, id]);
      if (selectedExpenses.length + 1 === expenses.length) {
        setSelectAll(true);
      }
    }
  };
  
  const handleMultiDelete = () => {
    if (onMultiDelete && selectedExpenses.length > 0) {
      onMultiDelete(selectedExpenses);
      setSelectedExpenses([]);
      setSelectAll(false);
    }
  };
  
  const columns = [
    {
      header: "",
      accessorKey: "select",
      cell: ({ row }: any) => {
        try {
          const id = row.original?.id;
          return (
            <Checkbox
              checked={selectedExpenses.includes(id)}
              onCheckedChange={() => handleToggleSelect(id)}
            />
          );
        } catch (error) {
          console.error('Error in select checkbox:', error);
          return null;
        }
      }
    },
    {
      header: 'Category',
      accessorKey: 'category',
      cell: ({ row }: any) => {
        try {
          // Row debugging
          console.log("Row data for category:", row);
          
          // First try direct row.original access (most reliable)
          if (row.original && row.original.category) {
            return <div className="font-medium">{row.original.category}</div>;
          }
          
          // Try getValue as backup
          if (typeof row.getValue === 'function') {
            const category = row.getValue('category');
            if (category) {
              return <div className="font-medium">{category}</div>;
            }
          }
          
          // If we get here, we couldn't get a category
          console.warn("Failed to get category from row:", row);
          return <div className="font-medium">Unknown</div>;
        } catch (e) {
          console.error('Error accessing category:', e);
          return <div className="font-medium">Error</div>;
        }
      }
    },
    {
      header: 'Description',
      accessorKey: 'description',
    },
    {
      header: 'Amount',
      accessorKey: 'amount',
      cell: ({ row }: any) => {
        try {
          // Debug row data for amount
          console.log("Row data for amount:", row.original ? row.original.amount : "No original data");
          
          // First check direct original access for most reliability  
          if (row.original && row.original.amount) {
            return formatCurrency(row.original.amount);
          }
          
          // Fallback to getValue if needed
          if (typeof row.getValue === 'function') {
            const amount = row.getValue('amount');
            if (amount !== undefined && amount !== null) {
              return formatCurrency(amount);
            }
          }
          
          // If we get here, we couldn't get an amount
          console.warn("Failed to get amount from row:", row);
          return formatCurrency(0);
        } catch (error) {
          console.error('Error getting amount:', error);
          return formatCurrency(0);
        }
      }
    },
    {
      header: 'Date',
      accessorKey: 'date',
    },
    {
      header: 'Month/Year',
      accessorKey: 'month',
      cell: ({ row }: any) => {
        try {
          let month, year;
          
          // Get month using the safer approach
          if (typeof row.getValue === 'function') {
            month = row.getValue('month');
          } else if (row.original) {
            month = row.original.month;
          }
          
          // Get year (might be in a different column)
          if (typeof row.getValue === 'function') {
            year = row.getValue('year');
          } else if (row.original) {
            year = row.original.year;
          }
          
          return `${month || ''} ${year || ''}`;
        } catch (error) {
          console.log('Error getting month/year:', error);
          return '';
        }
      }
    },
    {
      header: 'Payment Method',
      accessorKey: 'paymentMethod',
      cell: ({ row }: any) => {
        try {
          let method;
          // Consistent pattern for accessing data
          if (typeof row.getValue === 'function') {
            method = row.getValue('paymentMethod');
          } else if (row.original) {
            method = row.original.paymentMethod;
          }
          return method || '-';
        } catch (error) {
          console.log('Error getting payment method:', error);
          return '-';
        }
      }
    },
    {
      header: 'Actions',
      id: 'actions',
      accessorKey: 'id', // Add accessorKey to fix TypeScript error
      cell: ({ row }: any) => {
        try {
          // Make sure row.original exists before trying to access properties
          if (!row?.original) return null;
          
          return (
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(row.original)}
              >
                <PencilIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(row.original.id)}
              >
                <TrashIcon className="h-4 w-4" />
              </Button>
            </div>
          );
        } catch (error) {
          console.log('Error rendering actions:', error);
          return null;
        }
      }
    }
  ];

  const categories = [
    'All',
    'Tax', 
    'Rent', 
    'Grocery', 
    'Utilities', 
    'Internet', 
    'Office Supplies', 
    'Travel', 
    'Maintenance', 
    'Software', 
    'Other'
  ];

  // Add debugging to see what expense data is actually coming in
  console.log("Rendering expense table with data:", expenses);
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2 md:items-center justify-between">
        <div className="relative w-full md:w-64">
          <Input
            type="text"
            placeholder="Search expenses..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full"
          />
        </div>
        
        <div className="flex space-x-2">
          <Select
            value={categoryFilter}
            onValueChange={onCategoryFilterChange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category.toLowerCase()}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {expenses.length > 0 && (
        <div className="flex items-center gap-2 mb-2">
          <Checkbox 
            checked={selectAll} 
            onCheckedChange={handleToggleSelectAll} 
            id="select-all-expenses" 
          />
          <label htmlFor="select-all-expenses" className="text-sm font-medium cursor-pointer">
            Select All
          </label>
          
          {selectedExpenses.length > 0 && (
            <Button 
              variant="destructive"
              size="sm"
              className="ml-4"
              onClick={handleMultiDelete}
            >
              Delete Selected ({selectedExpenses.length})
            </Button>
          )}
        </div>
      )}

      <DataTable
        columns={columns}
        data={expenses || []}
        isLoading={isLoading}
        emptyState={
          <div className="text-center py-10">
            <h3 className="mt-2 text-sm font-medium text-neutral-900">No expenses found</h3>
            <p className="mt-1 text-sm text-neutral-500">
              Add an expense to get started.
            </p>
          </div>
        }
      />
    </div>
  );
};

export default ExpenseTable;