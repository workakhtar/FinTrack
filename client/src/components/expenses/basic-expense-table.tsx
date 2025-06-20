import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PencilIcon, TrashIcon } from "lucide-react";

interface ExpenseTableProps {
  expenses: any[];
  isLoading: boolean;
  onEdit: (expense: any) => void;
  onDelete: (id: number) => void;
  onMultiDelete?: (ids: number[]) => void;
}

const BasicExpenseTable = ({
  expenses,
  isLoading,
  onEdit,
  onDelete,
  onMultiDelete
}: ExpenseTableProps) => {
  // const [selectedExpenses, setSelectedExpenses] = useState<number[]>([]);
  // const [selectAll, setSelectAll] = useState(false);
  
  // const handleToggleSelectAll = () => {
  //   if (selectAll) {
  //     setSelectedExpenses([]);
  //   } else {
  //     setSelectedExpenses(expenses.map(exp => exp.id));
  //   }
  //   setSelectAll(!selectAll);
  // };
  
  // const handleToggleSelect = (id: number) => {
  //   if (selectedExpenses.includes(id)) {
  //     setSelectedExpenses(selectedExpenses.filter(expId => expId !== id));
  //     setSelectAll(false);
  //   } else {
  //     setSelectedExpenses([...selectedExpenses, id]);
  //     if (selectedExpenses.length + 1 === expenses.length) {
  //       setSelectAll(true);
  //     }
  //   }
  // };
  
  // const handleMultiDelete = () => {
  //   if (onMultiDelete && selectedExpenses.length > 0) {
  //     onMultiDelete(selectedExpenses);
  //     setSelectedExpenses([]);
  //     setSelectAll(false);
  //   }
  // };

  // Log expenses data for debugging
  console.log("Raw expenses data:", JSON.stringify(expenses, null, 2));

  if (isLoading) {
    return (
      <div className="text-center py-10">
        <div className="flex justify-center">
          <svg
            className="animate-spin h-6 w-6 text-primary"
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
        </div>
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="text-center py-10">
        <h3 className="mt-2 text-sm font-medium text-neutral-900">No expenses found</h3>
        <p className="mt-1 text-sm text-neutral-500">
          Add an expense to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* {selectedExpenses.length > 0 && (
        <div className="flex items-center gap-2 mb-2">
          <Button 
            variant="destructive"
            size="sm"
            onClick={handleMultiDelete}
          >
            Delete Selected ({selectedExpenses.length})
          </Button>
        </div>
      )} */}

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                {/* <Checkbox 
                  checked={selectAll} 
                  onCheckedChange={handleToggleSelectAll} 
                /> */}
              </TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Month/Year</TableHead>
              <TableHead>Payment Method</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.map((expense) => (
              <TableRow key={expense.id}>
                <TableCell>
                  {/* <Checkbox 
                    checked={selectedExpenses.includes(expense.id)} 
                    onCheckedChange={() => handleToggleSelect(expense.id)} 
                  /> */}
                </TableCell>
                <TableCell>
                  <div className="font-medium">{expense.category || 'Unknown'}</div>
                </TableCell>
                <TableCell>{expense.description}</TableCell>
                <TableCell>{formatCurrency(expense.amount)}</TableCell>
                <TableCell>{expense.date}</TableCell>
                <TableCell>{`${expense.month} ${expense.year}`}</TableCell>
                <TableCell>{expense.paymentMethod || '-'}</TableCell>
                <TableCell className="text-right">
                  <div className="flex space-x-2 justify-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(expense)}
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(expense.id)}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default BasicExpenseTable;