import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import StatusBadge from "@/components/shared/status-badge";
import { DataTable } from "@/components/ui/data-table";

interface Project {
  id: number;
  name: string;
  client: string;
  status: string;
  progress: number;
  managerId: number | null;
  description: string;
  managerName?: string;
}

interface ProjectTableProps {
  projects: Project[];
  isLoading: boolean;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  onEdit: (project: Project) => void;
  onDelete: (id: number) => void;
  onMultiDelete?: (ids: number[]) => void;
}

const ProjectTable: React.FC<ProjectTableProps> = ({
  projects,
  isLoading,
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onEdit,
  onDelete,
  onMultiDelete
}) => {
  const [selectedProjects, setSelectedProjects] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  
  const handleToggleSelectAll = () => {
    if (selectAll) {
      setSelectedProjects([]);
    } else {
      setSelectedProjects(projects.map(project => project.id));
    }
    setSelectAll(!selectAll);
  };
  
  const handleToggleSelect = (id: number) => {
    if (selectedProjects.includes(id)) {
      setSelectedProjects(selectedProjects.filter(projectId => projectId !== id));
      setSelectAll(false);
    } else {
      setSelectedProjects([...selectedProjects, id]);
      if (selectedProjects.length + 1 === projects.length) {
        setSelectAll(true);
      }
    }
  };
  
  const handleMultiDelete = () => {
    if (onMultiDelete && selectedProjects.length > 0) {
      onMultiDelete(selectedProjects);
      setSelectedProjects([]);
      setSelectAll(false);
    }
  };

  const columns = [
    {
      header: "",
      accessorKey: "select",
      cell: (item: Project) => (
        <Checkbox
          checked={selectedProjects.includes(item.id)}
          onCheckedChange={() => handleToggleSelect(item.id)}
        />
      )
    },
    {
      header: "Project",
      accessorKey: "name",
      cell: (item: Project) => (
        <div>
          <div className="font-medium text-neutral-900">{item.name}</div>
          <div className="text-sm text-neutral-500">Client: {item.client}</div>
        </div>
      )
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (item: Project) => (
        <StatusBadge status={item.status} />
      )
    },
    {
      header: "Progress",
      accessorKey: "progress",
      cell: (item: Project) => (
        <div className="w-full">
          <div className="flex justify-between mb-1">
            <span className="text-xs text-neutral-500">{item.progress}%</span>
          </div>
          <Progress value={item.progress} className="h-2" />
        </div>
      )
    },
    {
      header: "Manager",
      accessorKey: "managerName",
      cell: (item: Project) => item.managerName || "Unassigned"
    }
  ];

  const actions = (project: Project) => (
    <div className="flex items-center justify-end space-x-3">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onEdit(project)}
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
        onClick={() => onDelete(project.id)}
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
  );

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
              placeholder="Search projects..."
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
            <option value="Active">Active</option>
            <option value="In Progress">In Progress</option>
            <option value="Planning">Planning</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>
      
      {projects.length > 0 && (
        <div className="flex items-center gap-2 mb-2">
          <Checkbox 
            checked={selectAll} 
            onCheckedChange={handleToggleSelectAll} 
            id="select-all-projects" 
          />
          <label htmlFor="select-all-projects" className="text-sm font-medium cursor-pointer">
            Select All
          </label>
          
          {selectedProjects.length > 0 && (
            <Button 
              variant="destructive"
              size="sm"
              className="ml-4"
              onClick={handleMultiDelete}
            >
              Delete Selected ({selectedProjects.length})
            </Button>
          )}
        </div>
      )}

      <DataTable
        columns={columns}
        data={projects}
        isLoading={isLoading}
        actions={actions}
        // searchValue={searchTerm}
        // onSearch={onSearchChange}
        // searchPlaceholder="Search projects..."
      />
    </div>
  );
};

export default ProjectTable;
