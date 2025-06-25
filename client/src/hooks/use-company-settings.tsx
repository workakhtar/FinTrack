import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const BASE_URL = 'https://inovaqofinance-be-production.up.railway.app';

export function useCompanySettings() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const getCompanySettings = useQuery({
    queryKey: ['/api/company-settings'],
    queryFn: async () => {
      const response = await apiRequest('GET', `${BASE_URL}/api/company-settings`);
      return response.json();
    }
  });

  const createCompanySettings = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", `${BASE_URL}/api/company-settings`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/company-settings'] });
      toast({
        title: "Company Settings Created",
        description: "The company settings have been successfully created.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error Creating Company Settings",
        description: error.message || "There was an error creating the company settings.",
        variant: "destructive",
      });
    },
  });

  const updateCompanySettings = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const res = await apiRequest("PUT", `${BASE_URL}/api/company-settings/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/company-settings'] });
      toast({
        title: "Company Settings Updated",
        description: "The company settings have been successfully updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error Updating Company Settings",
        description: error.message || "There was an error updating the company settings.",
        variant: "destructive",
      });
    },
  });

  const deleteCompanySettings = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `${BASE_URL}/api/company-settings/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/company-settings'] });
      toast({
        title: "Company Settings Deleted",
        description: "The company settings have been successfully deleted.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error Deleting Company Settings",
        description: error.message || "There was an error deleting the company settings.",
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