import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function useCompanySettings() {
  const { toast } = useToast();

  // Get company settings
  const getCompanySettings = useQuery({
    queryKey: ['/api/company-settings'],
    queryFn: async () => {
      const res = await fetch('/api/company-settings');
      if (!res.ok) {
        throw new Error('Failed to fetch company settings');
      }
      return res.json();
    },
  });

  // Create company settings
  const createCompanySettings = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/company-settings", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Company settings created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/company-settings'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to create company settings",
        variant: "destructive",
      });
      console.error(error);
    },
  });

  // Update company settings
  const updateCompanySettings = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const res = await apiRequest("PUT", `/api/company-settings/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Company settings updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/company-settings'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to update company settings",
        variant: "destructive",
      });
      console.error(error);
    },
  });

  // Delete company settings
  const deleteCompanySettings = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/company-settings/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/company-settings'] });
      toast({
        title: "Settings Deleted",
        description: "The company settings have been successfully deleted.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error Deleting Settings",
        description: error.message || "There was an error deleting the settings.",
        variant: "destructive",
      });
    },
  });

  return {
    getCompanySettings,
    createCompanySettings,
    updateCompanySettings,
    deleteCompanySettings,
  };
} 