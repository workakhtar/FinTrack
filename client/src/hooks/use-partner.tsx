import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function usePartner() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createPartner = useMutation({
    mutationFn: async (partnerData: any) => {
      const res = await apiRequest("POST", "/api/partners", partnerData);
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
      const res = await apiRequest("PUT", `/api/partners/${id}`, data);
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
      await apiRequest("DELETE", `/api/partners/${id}`);
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
    createPartner,
    updatePartner,
    deletePartner,
  };
}
