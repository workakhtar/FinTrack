import { Progress } from "@/components/ui/progress";

interface TeamInsight {
  name: string;
  count: number;
  productivity: number;
  progress: number;
}

interface TeamInsightsProps {
  teams: TeamInsight[];
}

const TeamInsights: React.FC<TeamInsightsProps> = ({ teams }) => {
  const getProgressColorClass = (productivity: number) => {
    if (productivity >= 10) return 'bg-primary';
    if (productivity > 0) return 'bg-secondary';
    return 'bg-destructive';
  };

  const getProductivityText = (productivity: number) => {
    if (productivity >= 0) {
      return <span className="text-sm font-medium text-success">+{productivity}% Productivity</span>;
    } else {
      return <span className="text-sm font-medium text-error">{productivity}% Productivity</span>;
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-neutral-700">Team Insights</h2>
        <div className="flex space-x-2">
          <button 
            type="button" 
            className="inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4" 
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21.5 2v6h-6M2.5 22v-6h6M2.5 8.5 21.5 8.5M2.5 15.5 21.5 15.5" />
            </svg>
          </button>
        </div>
      </div>
      
      {teams.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-neutral-500">No team insights available</p>
        </div>
      ) : (
        <div className="space-y-4">
          {teams.map((team, index) => (
            <div key={index} className="bg-neutral-50 p-3 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-neutral-700">{team.name}</h4>
                  <p className="text-xs text-neutral-500">{team.count} employees</p>
                </div>
                {getProductivityText(team.productivity)}
              </div>
              
              <div className="mt-2 w-full bg-neutral-200 rounded h-1.5">
                <Progress 
                  value={team.progress} 
                  className={`h-1.5 ${getProgressColorClass(team.productivity)}`} 
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeamInsights;
