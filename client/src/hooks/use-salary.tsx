import { useMutation, useQuery, UseQueryOptions } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const BASE_URL = "https://inovaqofinance-be-production.up.railway.app";

export function useSalary() {
  const { toast } = useToast();

  // Get all salaries
  const getSalaries = useQuery({
    queryKey: ['/api/salaries'],
    queryFn: async () => {
      const user = JSON.parse(localStorage.getItem("user") || "");
      const token = user?.token;

      const res = await fetch(`${BASE_URL}/api/salaries`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
        }
      );
      if (!res.ok) {
        throw new Error('Failed to fetch salaries');
      }
      return res.json();
    },
  });

  // Get salaries for a specific employee
  const getSalariesByEmployee = (employeeId: number) => {
    return useQuery({
      queryKey: ['/api/salaries/employee', employeeId],
      enabled: !!employeeId,
      queryFn: async () => {
        const res = await fetch(`${BASE_URL}/api/salaries/employee/${employeeId}`);
        if (!res.ok) {
          throw new Error('Failed to fetch employee salaries');
        }
        return res.json();
      },
    });
  };

  // Get salaries for a specific month and year
  const getSalariesByMonth = (month: string, year: number) => {
    return useQuery({
      queryKey: ['/api/salaries/month', month, year],
      enabled: !!month && !!year,
      queryFn: async () => {
        const res = await fetch(`${BASE_URL}/api/salaries/month/${month}/${year}`);
        if (!res.ok) {
          throw new Error('Failed to fetch monthly salaries');
        }
        return res.json();
      },
    });
  };

  // Create a salary record
  const createSalary = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", `${BASE_URL}/api/salaries`, data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Salary record created successfully",
      });
      // Invalidate all salary related queries
      queryClient.invalidateQueries({ queryKey: ['/api/salaries'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to create salary record",
        variant: "destructive",
      });
      console.error(error);
    },
  });

  // Update a salary record
  const updateSalary = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const res = await apiRequest("PUT", `${BASE_URL}/api/salaries/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Salary record updated successfully",
      });
      // Invalidate all salary related queries
      queryClient.invalidateQueries({ queryKey: ['/api/salaries'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to update salary record",
        variant: "destructive",
      });
      console.error(error);
    },
  });

  // Delete a salary record
  const deleteSalary = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `${BASE_URL}/api/salaries/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/salaries'] });
      toast({
        title: "Salary Deleted",
        description: "The salary has been successfully deleted.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error Deleting Salary",
        description: error.message || "There was an error deleting the salary.",
        variant: "destructive",
      });
    },
  });

  const deleteSalaries = useMutation({
    mutationFn: async (ids: number[]) => {
      return await apiRequest("POST", `${BASE_URL}/api/salaries/bulk-delete`, { ids });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/salaries'] });
      toast({
        title: "Salaries Deleted",
        description: "The selected salaries have been successfully deleted.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error Deleting Salaries",
        description: error.message || "There was an error deleting the salaries.",
        variant: "destructive",
      });
    },
  });

  return {
    getSalaries,
    getSalariesByEmployee,
    getSalariesByMonth,
    createSalary,
    updateSalary,
    deleteSalary,
    deleteSalaries,
  };
}