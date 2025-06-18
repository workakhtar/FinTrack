import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";

interface Partner {
  id: number;
  name: string;
  email: string;
  share: number;
}

interface PartnerTableProps {
  partners: Partner[];
  isLoading: boolean;
  onEdit: (partner: Partner) => void;
  onDelete: (id: number) => void;
}

const PartnerTable: React.FC<PartnerTableProps> = ({
  partners,
  isLoading,
  onEdit,
  onDelete
}) => {
  const columns = [
    {
      header: "Name",
      accessorKey: "name",
      cell: (partner: Partner) => (
        <div className="font-medium text-neutral-900">{partner.name}</div>
      )
    },
    {
      header: "Email",
      accessorKey: "email",
      cell: (partner: Partner) => (
        <div className="text-neutral-700">{partner.email}</div>
      )
    },
    {
      header: "Profit Share",
      accessorKey: "share",
      cell: (partner: Partner) => (
        <div className="font-medium text-primary">{partner.share}%</div>
      )
    }
  ];

  const getTotalShare = () => {
    return partners.reduce((sum, partner) => {
      const shareValue = typeof partner.share === 'string' 
        ? parseFloat(partner.share) 
        : typeof partner.share === 'number' 
          ? partner.share 
          : 0;
      return sum + (isNaN(shareValue) ? 0 : shareValue);
    }, 0);
  };

  const totalShare = getTotalShare();
  const isShareInvalid = Math.abs(totalShare - 100) > 0.1;
  console.log(isShareInvalid);

  return (
    <div className="space-y-4">
      <DataTable
        columns={columns}
        data={partners}
        isLoading={isLoading}
        actions={(partner) => (
          <div className="flex items-center justify-end space-x-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(partner)}
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
              onClick={() => onDelete(partner.id)}
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
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-neutral-900">No partners found</h3>
            <p className="mt-1 text-sm text-neutral-500">
              Get started by adding a new partner.
            </p>
          </div>
        }
      />

      {partners.length > 0 && (
        <div className={`p-4 rounded-md ${isShareInvalid ? 'bg-destructive/10' : 'bg-success/10'}`}>
          <div className="flex justify-between items-center">
            <div className="font-medium">Total Share:</div>
            <div className={`font-medium ${isShareInvalid ? 'text-destructive' : 'text-success'}`}>
              {totalShare ? Number(totalShare).toFixed(2) : '0.00'}%
            </div>
          </div>
          {isShareInvalid && (
            <div className="mt-1 text-sm text-destructive">
              Warning: Total share should equal 100%
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PartnerTable;
