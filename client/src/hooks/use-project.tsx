import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export function useProject() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const getProjects = useQuery({
    queryKey: ['/api/projects'],
    queryFn: async () => {
      const response = await apiRequest('GET', `${BASE_URL}/api/projects`);
      // console.log(response.json)
      return response.json();
    }
  });

    const createProject = useMutation({
    mutationFn: async (projectData: any) => {
      const res = await apiRequest("POST", `${BASE_URL}/api/projects`, projectData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
      toast({
        title: "Project Created",
        description: "The project has been successfully created.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error Creating Project",
        description: error.message || "There was an error creating the project.",
        variant: "destructive",
      });
    },
  });

  const updateProject = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const res = await apiRequest("PUT", `${BASE_URL}/api/projects/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
      toast({
        title: "Project Updated",
        description: "The project has been successfully updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error Updating Project",
        description: error.message || "There was an error updating the project.",
        variant: "destructive",
      });
    },
  });

  const deleteProject = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `${BASE_URL}/api/projects/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
      toast({
        title: "Project Deleted",
        description: "The project has been successfully deleted.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error Deleting Project",
        description: error.message || "There was an error deleting the project.",
        variant: "destructive",
      });
    },
  });

  const deleteProjects = useMutation({
    mutationFn: async (ids: number[]) => {
      const res = await apiRequest("POST", `${BASE_URL}/api/projects/bulk-delete`, { ids });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
      toast({
        title: "Projects Deleted",
        description: "The selected projects have been successfully deleted.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error Deleting Projects",
        description: error.message || "There was an error deleting the projects.",
        variant: "destructive",
      });
    },
  });

  return {
    getProjects,
    createProject,
    updateProject,
    deleteProject,
    deleteProjects,
  };
}
