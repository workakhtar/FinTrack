import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const BASE_URL = 'https://inovaqofinance-be-production.up.railway.app';

export function usePartner() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const getPartners = useQuery({
    queryKey: ['/api/partners'],
    queryFn: async () => {
      const response = await apiRequest('GET', `${BASE_URL}/api/partners`);
      return response.json();
    }
  });

  const createPartner = useMutation({
    mutationFn: async (partnerData: any) => {
      const res = await apiRequest("POST", `${BASE_URL}/api/partners`, partnerData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/partners'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
      toast({
        title: "Partner Created",
        description: "The partner has been successfully created.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error Creating Partner",
        description: error.message || "There was an error creating the partner.",
        variant: "destructive",
      });
    },
  });

  const updatePartner = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const res = await apiRequest("PUT", `${BASE_URL}/api/partners/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/partners'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
      toast({
        title: "Partner Updated",
        description: "The partner has been successfully updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error Updating Partner",
        description: error.message || "There was an error updating the partner.",
        variant: "destructive",
      });
    },
  });

  const deletePartner = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `${BASE_URL}/api/partners/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/partners'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
      toast({
        title: "Partner Deleted",
        description: "The partner has been successfully deleted.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error Deleting Partner",
        description: error.message || "There was an error deleting the partner.",
        variant: "destructive",
      });
    },
  });

  return {
    getPartners,
    createPartner,
    updatePartner,
    deletePartner,
  };
}
