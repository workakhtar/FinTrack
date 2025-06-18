import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function useEmployee() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createEmployee = useMutation({
    mutationFn: async (employeeData: any) => {
      const res = await apiRequest("POST", "/api/employees", employeeData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/employees'] });
      toast({
        title: "Employee Created",
        description: "The employee has been successfully created.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error Creating Employee",
        description: error.message || "There was an error creating the employee.",
        variant: "destructive",
      });
    },
  });

  const updateEmployee = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const res = await apiRequest("PUT", `/api/employees/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/employees'] });
      toast({
        title: "Employee Updated",
        description: "The employee has been successfully updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error Updating Employee",
        description: error.message || "There was an error updating the employee.",
        variant: "destructive",
      });
    },
  });

  const deleteEmployee = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/employees/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/employees'] });
      toast({
        title: "Employee Deleted",
        description: "The employee has been successfully deleted.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error Deleting Employee",
        description: error.message || "There was an error deleting the employee.",
        variant: "destructive",
      });
    },
  });

  const deleteEmployees = useMutation({
    mutationFn: async (ids: number[]) => {
      const res = await apiRequest("POST", "/api/employees/bulk-delete", { ids });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/employees'] });
      toast({
        title: "Employees Deleted",
        description: "The selected employees have been successfully deleted.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error Deleting Employees",
        description: error.message || "There was an error deleting the employees.",
        variant: "destructive",
      });
    },
  });

  const getEmployees = useQuery({
    queryKey: ['/api/employees'],
    onError: (error: any) => {
      toast({
        title: "Error Loading Employees",
        description: error.message || "There was an error loading employees.",
        variant: "destructive",
      });
    }
  });

  const getEmployee = (id: number) => {
    return useQuery({
      queryKey: ['/api/employees', id],
      onError: (error: any) => {
        toast({
          title: "Error Loading Employee",
          description: error.message || "There was an error loading the employee.",
          variant: "destructive",
        });
      }
    });
  };

  return {
    getEmployees,
    getEmployee,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    deleteEmployees,
  };
}
