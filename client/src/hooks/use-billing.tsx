import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function useBilling() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const getBillings = useQuery({
    queryKey: ['/api/billings'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/billings');
      return response.json();
    }
  });

  const createBilling = useMutation({
    mutationFn: async (billingData: any) => {
      const res = await apiRequest("POST", "/api/billings", billingData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/billings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
      toast({
        title: "Billing Created",
        description: "The billing record has been successfully created.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error Creating Billing",
        description: error.message || "There was an error creating the billing record.",
        variant: "destructive",
      });
    },
  });

  const updateBilling = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const res = await apiRequest("PUT", `/api/billings/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/billings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
      toast({
        title: "Billing Updated",
        description: "The billing record has been successfully updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error Updating Billing",
        description: error.message || "There was an error updating the billing record.",
        variant: "destructive",
      });
    },
  });

  const deleteBilling = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/billings/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/billings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
      toast({
        title: "Billing Deleted",
        description: "The billing record has been successfully deleted.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error Deleting Billing",
        description: error.message || "There was an error deleting the billing record.",
        variant: "destructive",
      });
    },
  });

  return {
    getBillings,
    createBilling,
    updateBilling,
    deleteBilling,
  };
}
