import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ProjectBonus {
  id: number;
  name: string;
  roi: number;
  manager: string;
  bonus: number;
}

interface BonusCalculationProps {
  projectBonuses: ProjectBonus[];
  totalBonusPool: number;
}

const BonusCalculation: React.FC<BonusCalculationProps> = ({ 
  projectBonuses, 
  totalBonusPool 
}) => {
  const getRoiBadgeVariant = (roi: number) => {
    if (roi >= 100) return 'success';
    if (roi >= 80) return 'warning';
    return 'default';
  };

  return (
    <div className="bg-white shadow rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-neutral-700">Bonus Calculation</h2>
        {/* <div>
          <select className="text-sm border-neutral-300 rounded-md focus:border-primary focus:ring focus:ring-primary/20 focus:ring-opacity-50">
            <option>October 2023</option>
            <option>November 2023</option>
          </select>
        </div> */}
      </div>
      
      {projectBonuses.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-neutral-500">No bonus data available</p>
        </div>
      ) : (
        <div className="space-y-3">
          {projectBonuses.map((project) => (
            <div key={project.id} className="bg-neutral-50 p-3 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-sm font-medium text-neutral-700">{project.name}</h4>
                <Badge variant={getRoiBadgeVariant(project.roi)}>
                  +{project.roi}% ROI
                </Badge>
              </div>
              
              <div className="text-xs text-neutral-500 mb-2">
                Managed by: {project.manager}
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-500">Performance Bonus:</span>
                <span className="text-sm font-medium text-neutral-700">
                  {formatCurrency(project.bonus)}
                </span>
              </div>
            </div>
          ))}
          
          <div className="pt-3 border-t border-neutral-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-neutral-600">Total Bonus Pool:</span>
              <span className="text-lg font-semibold text-primary">
                {formatCurrency(totalBonusPool)}
              </span>
            </div>
          </div>
          
          <div className="mt-4">
            <Button
              className="w-full justify-center"
              onClick={() => alert('Bonus finalization would happen here')}
            >
              Finalize Bonuses
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BonusCalculation;
