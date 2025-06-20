import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const BASE_URL = "https://inovaqofinance-be-production.up.railway.app";

export function useExpense() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const getExpenses = useQuery({
    queryKey: ['/api/expenses'],
    queryFn: async () => {
      const response = await apiRequest('GET', `${BASE_URL}/api/expenses`);
      return response.json();
    }
  });

  const createExpense = useMutation({
    mutationFn: async (expenseData: any) => {
      const res = await apiRequest("POST", `${BASE_URL}/api/expenses`, expenseData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/expenses'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
      toast({
        title: "Expense Created",
        description: "The expense has been successfully created.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error Creating Expense",
        description: error.message || "There was an error creating the expense.",
        variant: "destructive",
      });
    },
  });

  const updateExpense = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const res = await apiRequest("PATCH", `${BASE_URL}/api/expenses/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/expenses'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
      toast({
        title: "Expense Updated",
        description: "The expense has been successfully updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error Updating Expense",
        description: error.message || "There was an error updating the expense.",
        variant: "destructive",
      });
    },
  });

  const deleteExpense = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `${BASE_URL}/api/expenses/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/expenses'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
      toast({
        title: "Expense Deleted",
        description: "The expense has been successfully deleted.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error Deleting Expense",
        description: error.message || "There was an error deleting the expense.",
        variant: "destructive",
      });
    },
  });

  return {
    getExpenses,
    createExpense,
    updateExpense,
    deleteExpense,
  };
}