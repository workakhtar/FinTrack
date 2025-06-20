import { cn, formatCurrency } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: number | string | undefined;
  icon: React.ReactNode;
  change?: number;
  changeDirection?: "up" | "down";
  changeIsGood?: boolean;
  isCount?: boolean;
  iconColor?: "primary" | "secondary" | "accent" | "error";
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon,
  change,
  changeDirection = change && change >= 0 ? "up" : "down",
  changeIsGood = changeDirection === "up",
  isCount = false,
  iconColor = "primary",
}) => {
  const colorMap = {
    primary: "bg-primary/10 text-primary",
    secondary: "bg-secondary/10 text-secondary",
    accent: "bg-accent/10 text-accent",
    error: "bg-destructive/10 text-destructive",
  };

  const formattedValue = isCount
    ? value?.toString() || "0"
    : formatCurrency(value);

  const changeColorClass = changeIsGood ? "text-success" : "text-error";
  const changeIconName = changeDirection === "up" ? "arrow-up" : "arrow-down";

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center">
          <div className={cn("flex-shrink-0 rounded-md p-3", colorMap[iconColor])}>
            {icon}
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-neutral-500 truncate">{title}</dt>
              <dd>
                <div className="text-lg font-semibold text-neutral-900">{formattedValue}</div>
                {change !== undefined && (
                  <div className="flex items-center mt-1">
                    <span className={cn("text-sm font-medium flex items-center", changeColorClass)}>
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-4 w-4 mr-1" 
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        {changeDirection === "up" ? (
                          <polyline points="18 15 12 9 6 15" />
                        ) : (
                          <polyline points="6 9 12 15 18 9" />
                        )}
                      </svg>
                      {isCount ? `+${change}` : `${Number(change).toFixed(2)}%`}
                    </span>
                    <span className="text-sm text-neutral-500 ml-2">vs last month</span>
                  </div>
                )}
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetricCard;
