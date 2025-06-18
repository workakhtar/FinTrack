import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export function useExpense() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Create a new expense
  const createExpense = useMutation({
    mutationFn: async (data: any) => {
      // Format data consistently for expense creation
      const formattedData = {
        ...data,
        amount: String(data.amount),
        year: Number(data.year)
      };
      
      console.log("Creating expense with formatted data:", formattedData);
      
      // Manual fetch to debug the exact request
      try {
        const response = await fetch('/api/expenses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formattedData),
          credentials: 'include'
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Error creating expense: ${response.status} ${errorText}`);
          throw new Error(`${response.status}: ${errorText || response.statusText}`);
        }
        
        const result = await response.json();
        console.log("Created expense result:", result);
        return result;
      } catch (error) {
        console.error("Error in createExpense:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['/api/expenses'],
      });
      queryClient.invalidateQueries({
        queryKey: ['/api/dashboard'],
      });
      toast({
        title: "Expense Added",
        description: "The expense has been added successfully.",
      });
    },
    onError: (error: any) => {
      console.error("Create expense error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add expense. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update an existing expense
  const updateExpense = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      // Ensure amount is properly formatted as a string
      const formattedData = {
        ...data,
        amount: String(data.amount),
        year: Number(data.year)
      };
      
      console.log("Updating expense with formatted data:", formattedData);
      return apiRequest('PATCH', `/api/expenses/${id}`, formattedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['/api/expenses'],
      });
      queryClient.invalidateQueries({
        queryKey: ['/api/dashboard'],
      });
      toast({
        title: "Expense Updated",
        description: "The expense has been updated successfully.",
      });
    },
    onError: (error: any) => {
      console.error("Update expense error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update expense. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete an expense
  const deleteExpense = useMutation({
    mutationFn: (id: number) => apiRequest('DELETE', `/api/expenses/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['/api/expenses'],
      });
      queryClient.invalidateQueries({
        queryKey: ['/api/dashboard'],
      });
      toast({
        title: "Expense Deleted",
        description: "The expense has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      console.error("Delete expense error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete expense. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    createExpense,
    updateExpense,
    deleteExpense,
  };
}