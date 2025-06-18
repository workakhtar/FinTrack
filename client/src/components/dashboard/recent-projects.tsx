import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/utils";

interface Project {
  id: number;
  name: string;
  client: string;
  status: string;
  progress: number;
  deadline: string;
  value: number;
  managerName?: string;
}

interface RecentProjectsProps {
  projects: Project[];
}

const getStatusBadgeVariant = (status: string) => {
  switch (status.toLowerCase()) {
    case 'active':
      return 'success';
    case 'in progress':
      return 'warning';
    case 'planning':
      return 'info';
    case 'completed':
      return 'success';
    default:
      return 'secondary';
  }
};

const RecentProjects: React.FC<RecentProjectsProps> = ({ projects }) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-neutral-700">Recent Projects</h2>
        <Link href="/projects">
          <a className="text-sm font-medium text-primary hover:text-primary-dark">View all</a>
        </Link>
      </div>
      
      {projects.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-neutral-500">No projects available</p>
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map((project) => (
            <div key={project.id} className="border-b pb-4 last:border-b-0 last:pb-0">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-medium text-neutral-800">{project.name}</h3>
                  <p className="text-xs text-neutral-500">Client: {project.client}</p>
                </div>
                <Badge variant={getStatusBadgeVariant(project.status)}>
                  {project.status}
                </Badge>
              </div>
              
              <div className="mt-2 w-full bg-neutral-200 rounded h-1.5">
                <Progress value={project.progress} className="h-1.5" />
              </div>
              
              <div className="mt-2 flex justify-between">
                <span className="text-xs text-neutral-500">
                  Deadline: <span>{project.deadline}</span>
                </span>
                <span className="text-xs font-medium text-neutral-700">
                 value: {formatCurrency(project.value)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentProjects;
