import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";
import { useToast } from "./use-toast";

export function useBonus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createBonus = useMutation({
    mutationFn: async (bonusData: any) => {
      const res = await apiRequest("POST", "/api/bonuses", bonusData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bonuses'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
      toast({
        title: "Bonus Created",
        description: "The bonus has been successfully created.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error Creating Bonus",
        description: error.message || "There was an error creating the bonus.",
        variant: "destructive",
      });
    },
  });

  const updateBonus = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const res = await apiRequest("PUT", `/api/bonuses/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bonuses'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
      toast({
        title: "Bonus Updated",
        description: "The bonus has been successfully updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error Updating Bonus",
        description: error.message || "There was an error updating the bonus.",
        variant: "destructive",
      });
    },
  });

  const deleteBonus = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/bonuses/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bonuses'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
      toast({
        title: "Bonus Deleted",
        description: "The bonus has been successfully deleted.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error Deleting Bonus",
        description: error.message || "There was an error deleting the bonus.",
        variant: "destructive",
      });
    },
  });

  const finalizeAllBonuses = useMutation({
    mutationFn: async (data: { month: string; year: number }) => {
      const res = await apiRequest("POST", "/api/bonuses/finalize", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bonuses'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
      toast({
        title: "Bonuses Finalized",
        description: "All bonuses have been successfully finalized.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error Finalizing Bonuses",
        description: error.message || "There was an error finalizing the bonuses.",
        variant: "destructive",
      });
    },
  });

  const calculateQuarterlyBonuses = useMutation({
    mutationFn: async (data: { quarter: number; year: number; projectIds?: number[]; employeeIds?: number[]; percentages?: Record<string, string> }) => {
      const res = await apiRequest("POST", "/api/bonuses/calculate-quarterly", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bonuses'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
      toast({
        title: "Quarterly Bonuses Calculated",
        description: "Quarterly bonuses have been successfully calculated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error Calculating Quarterly Bonuses",
        description: error.message || "There was an error calculating quarterly bonuses.",
        variant: "destructive",
      });
    },
  });

  return {
    createBonus,
    updateBonus,
    deleteBonus,
    finalizeAllBonuses,
    calculateQuarterlyBonuses
  };
}
