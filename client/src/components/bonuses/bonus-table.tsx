import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import StatusBadge from "@/components/shared/status-badge";
import { DataTable } from "@/components/ui/data-table";

interface Bonus {
  id: number;
  projectId: number;
  employeeId: number;
  month: string;
  year: number;
  amount: number;
  percentage: number;
  status: string;
  employeeName?: string;
  projectName?: string;
}

interface BonusTableProps {
  bonuses: Bonus[];
  isLoading: boolean;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  onEdit: (bonus: Bonus) => void;
  onDelete: (id: number) => void;
}

const BonusTable: React.FC<BonusTableProps> = ({
  bonuses,
  isLoading,
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onEdit,
  onDelete
}) => {
  const columns = [
    {
      header: "Employee",
      accessorKey: "employeeName",
      cell: (bonus: Bonus) => (
        <div className="font-medium text-neutral-900">{bonus.employeeName}</div>
      )
    },
    {
      header: "Project",
      accessorKey: "projectName",
      cell: (bonus: Bonus) => (
        <div className="text-neutral-700">{bonus.projectName}</div>
      )
    },
    {
      header: "Period",
      accessorKey: "period",
      cell: (bonus: Bonus) => (
        <div>
          {bonus.month} {bonus.year}
        </div>
      )
    },
    {
      header: "Amount",
      accessorKey: "amount",
      cell: (bonus: Bonus) => formatCurrency(bonus.amount)
    },
    {
      header: "Percentage",
      accessorKey: "percentage",
      cell: (bonus: Bonus) => `${bonus.percentage}%`
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (bonus: Bonus) => (
        <StatusBadge status={bonus.status} />
      )
    }
  ];

  const filteredBonuses = bonuses.filter(bonus => {
    const matchesSearch = bonus.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bonus.projectName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || bonus.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
              placeholder="Search bonuses..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-neutral-500">Status:</span>
          <select
            className="form-select rounded-md border-neutral-300 shadow-sm focus:border-primary focus:ring focus:ring-primary/20 focus:ring-opacity-50 text-sm"
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
          >
            <option value="all">All</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Paid">Paid</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredBonuses}
        isLoading={isLoading}
        actions={(bonus) => (
          <div className="flex items-center justify-end space-x-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(bonus)}
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
              onClick={() => onDelete(bonus.id)}
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
            <h3 className="mt-2 text-sm font-medium text-neutral-900">No bonuses found</h3>
            <p className="mt-1 text-sm text-neutral-500">
              Get started by adding a new bonus.
            </p>
          </div>
        }
      />
    </div>
  );
};

export default BonusTable;
