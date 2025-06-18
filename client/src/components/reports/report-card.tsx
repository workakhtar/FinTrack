import { Card, CardContent } from "@/components/ui/card";

type TrendDirection = "positive" | "negative" | "neutral";

interface ReportCardProps {
  title: string;
  value: string | number;
  description: string;
  trend: TrendDirection;
  inverseTrend?: boolean;
}

const ReportCard: React.FC<ReportCardProps> = ({
  title,
  value,
  description,
  trend,
  inverseTrend = false
}) => {
  const getTrendIcon = () => {
    let iconColor = "text-neutral-500";
    let icon;

    if (trend === "positive") {
      iconColor = inverseTrend ? "text-destructive" : "text-success";
      icon = (
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className={`h-4 w-4 ${iconColor}`} 
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m5 12 7-7 7 7"/>
          <path d="M12 19V5"/>
        </svg>
      );
    } else if (trend === "negative") {
      iconColor = inverseTrend ? "text-success" : "text-destructive";
      icon = (
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className={`h-4 w-4 ${iconColor}`} 
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 12H5"/>
          <path d="m12 5-7 7 7 7"/>
        </svg>
      );
    } else {
      icon = (
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-4 w-4 text-neutral-500" 
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 12h14"/>
        </svg>
      );
    }

    return icon;
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex flex-col">
          <p className="text-sm font-medium text-neutral-500 mb-1">{title}</p>
          <div className="flex items-baseline">
            <p className="text-2xl font-semibold">{value}</p>
          </div>
          <div className="flex items-center mt-2">
            {getTrendIcon()}
            <span className="text-xs ml-1 text-neutral-500">{description}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportCard;
