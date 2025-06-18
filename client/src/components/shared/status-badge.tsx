import { Badge } from "@/components/ui/badge";

type StatusVariant = 
  | "default"
  | "success"
  | "warning"
  | "info"
  | "error"
  | "outline";

interface StatusBadgeProps {
  status: string;
  size?: "sm" | "default" | "lg";
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  size = "default" 
}) => {
  // Debug the status value
  console.log("StatusBadge received status:", status, typeof status);
  
  const getStatusVariant = (status: string): StatusVariant => {
    // Add null check before trying to convert to lowercase
    if (!status || status === 'Unknown') return 'default';
    
    const statusLower = (typeof status === 'string') ? status.toLowerCase() : '';
    console.log("StatusLower:", statusLower);
    
    if (statusLower === 'active' || statusLower === 'paid' || statusLower === 'approved' || statusLower === 'completed') {
      return 'success';
    }
    
    if (statusLower === 'in progress' || statusLower === 'pending' || statusLower === 'on leave') {
      return 'warning';
    }
    
    if (statusLower === 'planning' || statusLower === 'draft') {
      return 'info';
    }
    
    if (statusLower === 'overdue' || statusLower === 'rejected' || statusLower === 'inactive') {
      return 'error';
    }
    
    return 'default';
  };

  const sizeClasses = {
    sm: "px-2 py-0 text-xs",
    default: "px-2.5 py-0.5 text-xs",
    lg: "px-3 py-1 text-sm"
  };

  // Force status to be properly displayed
  const displayStatus = status === null || status === undefined ? 'Unknown' : status;
  
  // Extra logging to debug
  console.log(`Status badge rendering: "${displayStatus}" with variant: ${getStatusVariant(displayStatus)}`);
  
  return (
    <Badge
      variant={getStatusVariant(displayStatus)}
      className={sizeClasses[size]}
    >
      {displayStatus}
    </Badge>
  );
};

export default StatusBadge;
