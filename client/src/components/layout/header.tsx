import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getCurrentMonthAndYear, getPreviousMonths } from "@/lib/utils";

interface HeaderProps {
  title: string;
  subtitle?: string;
  showPeriodSelector?: boolean;
  showExportButton?: boolean;
  onPeriodChange?: (period: string) => void;
  onExport?: () => void;
  actionButton?: {
    label: string;
    onClick: () => void;
  };
  additionalActions?: React.ReactNode;
  period?: string; // Add current period to props
}

const Header = ({
  title,
  subtitle,
  showPeriodSelector = false,
  showExportButton = false,
  onPeriodChange,
  onExport,
  actionButton,
  additionalActions,
  period
}: HeaderProps) => {
  // Get current period and previous periods
  const currentPeriod = getCurrentMonthAndYear();
  const previousPeriods = getPreviousMonths(12);
  
  // Combine all periods, convert to strings, and remove duplicates
  const allPeriods = [
    currentPeriod, 
    ...previousPeriods, 
  ];
  
  const uniquePeriods = Array.from(new Set(
    allPeriods.map(p => `${p.month} ${p.year}`)
  ));

  // Add the "All" option at the end
  uniquePeriods.push('All Months');

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 bg-white border-b">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-700">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-neutral-500">{subtitle}</p>}
        </div>
        <div className="flex space-x-3">
          {showPeriodSelector && (
            <div className="relative">
              <div className="flex items-center">
                <span className="text-sm text-neutral-500 mr-2">Period:</span>
                <select 
                  className="w-[180px] h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  value={period}
                  onChange={(e) => onPeriodChange && onPeriodChange(e.target.value)}
                >
                  {uniquePeriods.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
          
          {showExportButton && (
            <Button 
              onClick={onExport}
              variant="default"
              className="inline-flex items-center"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-4 w-4 mr-2" 
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Export Data
            </Button>
          )}
          
          {additionalActions}
          
          {actionButton && (
            <Button onClick={actionButton.onClick}>
              {actionButton.label}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
