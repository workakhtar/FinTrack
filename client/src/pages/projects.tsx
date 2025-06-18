import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/layout/header';
import ProjectTable from '@/components/projects/project-table';
import ProjectForm from '@/components/projects/project-form';
import { Dialog } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useProject } from '@/hooks/use-project';

const Projects = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { toast } = useToast();
  const { deleteProject, deleteProjects } = useProject();

  const { data: projects, isLoading, isError, refetch } = useQuery({
    queryKey: ['/api/projects'],
  });

  const { data: employees } = useQuery({
    queryKey: ['/api/employees'],
  });

  const handleAddProject = () => {
    setSelectedProject(null);
    setIsFormOpen(true);
  };

  const handleEditProject = (project: any) => {
    setSelectedProject(project);
    setIsFormOpen(true);
  };

  const handleDeleteProject = async (id: number) => {
    try {
      await deleteProject.mutateAsync(id);
      toast({
        title: 'Project deleted',
        description: 'The project has been deleted successfully.',
      });
      refetch();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete project.',
        variant: 'destructive',
      });
    }
  };
  
  const handleMultiDeleteProjects = async (ids: number[]) => {
    try {
      await deleteProjects.mutateAsync(ids);
      toast({
        title: 'Projects deleted',
        description: `${ids.length} projects have been deleted successfully.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete some projects.',
        variant: 'destructive',
      });
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedProject(null);
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setSelectedProject(null);
    refetch();
    toast({
      title: selectedProject ? 'Project Updated' : 'Project Added',
      description: `The project has been ${selectedProject ? 'updated' : 'added'} successfully.`,
    });
  };

  const filteredProjects = projects && Array.isArray(projects)
    ? projects.filter((project: any) => {
        const nameMatch = project.name.toLowerCase().includes(searchTerm.toLowerCase());
        const clientMatch = project.client.toLowerCase().includes(searchTerm.toLowerCase());
        const statusMatch = statusFilter === 'all' || project.status === statusFilter;
        return (nameMatch || clientMatch) && statusMatch;
      })
    : [];

  // Enhance projects with manager information
  const enhancedProjects = filteredProjects.map((project: any) => {
    let managerName = 'Unassigned';
    
    if (employees && Array.isArray(employees)) {
      const manager = employees.find((emp: any) => emp.id === project.managerId);
      if (manager) {
        managerName = `${manager.firstName} ${manager.lastName}`;
      }
    }
    
    return {
      ...project,
      managerName
    };
  });

  if (isError) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-medium text-gray-900">Error Loading Projects</h3>
          <p className="mt-1 text-gray-500">There was an error loading the project data. Please try again later.</p>
          <button
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            onClick={() => refetch()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1 relative overflow-y-auto focus:outline-none">
      <Header 
        title="Projects" 
        subtitle="Manage your organization's projects"
        actionButton={{
          label: 'Add Project',
          onClick: handleAddProject
        }}
      />
      
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <ProjectTable 
          projects={enhancedProjects}
          isLoading={isLoading}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          onEdit={handleEditProject}
          onDelete={handleDeleteProject}
          onMultiDelete={handleMultiDeleteProjects}
        />
      </div>

      <Dialog open={isFormOpen} onOpenChange={handleFormClose}>
        <ProjectForm 
          project={selectedProject}
          managers={employees}
          onSuccess={handleFormSuccess}
          onCancel={handleFormClose}
        />
      </Dialog>
    </main>
  );
};

export default Projects;
