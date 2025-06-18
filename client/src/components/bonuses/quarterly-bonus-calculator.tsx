import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useBonus } from "@/hooks/use-bonus";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";

// Validation schema
const quarterlyBonusSchema = z.object({
  quarter: z.number().min(1).max(4),
  year: z.number().min(2000).max(2100),
  projectIds: z.array(z.number()).optional(),
  employeeIds: z.array(z.number()).optional(),
  percentages: z.record(z.string(), z.string()).optional(),
});

type QuarterlyBonusFormValues = z.infer<typeof quarterlyBonusSchema>;

interface QuarterlyBonusCalculatorProps {
  employees?: any[];
  projects?: any[];
  onSuccess: () => void;
  onCancel: () => void;
}

const QuarterlyBonusCalculator: React.FC<QuarterlyBonusCalculatorProps> = ({
  employees = [],
  projects = [],
  onSuccess,
  onCancel
}) => {
  const { calculateQuarterlyBonuses } = useBonus();
  const [selectedProjects, setSelectedProjects] = useState<number[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
  const [selectAllProjects, setSelectAllProjects] = useState(true);
  const [selectAllEmployees, setSelectAllEmployees] = useState(true);
  const [employeeProjectPercentages, setEmployeeProjectPercentages] = useState<Record<string, string>>({});

  // Get current quarter and year
  const getCurrentQuarter = () => {
    const currentMonth = new Date().getMonth();
    // January is 0, so we add 1 to get 1-12 range
    return Math.ceil((currentMonth + 1) / 3);
  };

  const form = useForm<QuarterlyBonusFormValues>({
    resolver: zodResolver(quarterlyBonusSchema),
    defaultValues: {
      quarter: getCurrentQuarter(),
      year: new Date().getFullYear(),
      projectIds: [],
      employeeIds: [],
    },
  });

  const handleProjectCheckboxChange = (projectId: number, checked: boolean) => {
    if (checked) {
      setSelectedProjects((prev) => [...prev, projectId]);
    } else {
      setSelectedProjects((prev) => prev.filter(id => id !== projectId));
    }
  };

  const handleEmployeeCheckboxChange = (employeeId: number, checked: boolean) => {
    if (checked) {
      setSelectedEmployees((prev) => [...prev, employeeId]);
    } else {
      setSelectedEmployees((prev) => prev.filter(id => id !== employeeId));
    }
  };

  const handleSelectAllProjects = (checked: boolean) => {
    setSelectAllProjects(checked);
    if (checked) {
      setSelectedProjects(projects.map(project => project.id));
    } else {
      setSelectedProjects([]);
    }
  };

  const handleSelectAllEmployees = (checked: boolean) => {
    setSelectAllEmployees(checked);
    if (checked) {
      setSelectedEmployees(employees.map(employee => employee.id));
    } else {
      setSelectedEmployees([]);
    }
  };

  const handlePercentageChange = (employeeId: number, projectId: number, value: string) => {
    // Create a key for the employee-project combo
    const key = `${employeeId}-${projectId}`;
    setEmployeeProjectPercentages({
      ...employeeProjectPercentages,
      [key]: value
    });
  };

  const onSubmit = async (data: QuarterlyBonusFormValues) => {
    try {
      const formData = {
        ...data,
        projectIds: selectAllProjects ? undefined : selectedProjects,
        employeeIds: selectAllEmployees ? undefined : selectedEmployees,
        percentages: employeeProjectPercentages
      };
      
      await calculateQuarterlyBonuses.mutateAsync(formData);
      onSuccess();
    } catch (error) {
      console.error("Error calculating quarterly bonuses:", error);
    }
  };

  const isPending = calculateQuarterlyBonuses.isPending;

  return (
    <DialogContent className="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>Calculate Quarterly Bonuses</DialogTitle>
        <DialogDescription>
          Calculate variable percentage bonuses for employees based on project billing for the selected quarter.
        </DialogDescription>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="quarter"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quarter</FormLabel>
                  <Select
                    defaultValue={field.value.toString()}
                    onValueChange={(value) => field.onChange(parseInt(value))}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select quarter" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">Q1 (Jan-Mar)</SelectItem>
                      <SelectItem value="2">Q2 (Apr-Jun)</SelectItem>
                      <SelectItem value="3">Q3 (Jul-Sep)</SelectItem>
                      <SelectItem value="4">Q4 (Oct-Dec)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="year"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Year</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="2000"
                      max="2100"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || new Date().getFullYear())}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="flex flex-col gap-4 sm:flex-row">
              {/* Projects Selection */}
              <div className="flex-1">
                <FormLabel>Projects</FormLabel>
                <div className="flex items-center space-x-2 mb-2">
                  <Checkbox 
                    id="selectAllProjects" 
                    checked={selectAllProjects}
                    onCheckedChange={(checked) => handleSelectAllProjects(Boolean(checked))}
                  />
                  <label
                    htmlFor="selectAllProjects"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Include all projects
                  </label>
                </div>
                {!selectAllProjects && (
                  <ScrollArea className="h-32 border rounded-md p-2">
                    <div className="space-y-2">
                      {projects.map((project) => (
                        <div key={project.id} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`project-${project.id}`} 
                            checked={selectedProjects.includes(project.id)}
                            onCheckedChange={(checked) => handleProjectCheckboxChange(project.id, Boolean(checked))}
                          />
                          <label
                            htmlFor={`project-${project.id}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {project.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </div>

              {/* Employees Selection */}
              <div className="flex-1">
                <FormLabel>Employees</FormLabel>
                <div className="flex items-center space-x-2 mb-2">
                  <Checkbox 
                    id="selectAllEmployees" 
                    checked={selectAllEmployees}
                    onCheckedChange={(checked) => handleSelectAllEmployees(Boolean(checked))}
                  />
                  <label
                    htmlFor="selectAllEmployees"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Include all employees
                  </label>
                </div>
                {!selectAllEmployees && (
                  <ScrollArea className="h-32 border rounded-md p-2">
                    <div className="space-y-2">
                      {employees.map((employee) => (
                        <div key={employee.id} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`employee-${employee.id}`} 
                            checked={selectedEmployees.includes(employee.id)}
                            onCheckedChange={(checked) => handleEmployeeCheckboxChange(employee.id, Boolean(checked))}
                          />
                          <label
                            htmlFor={`employee-${employee.id}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {`${employee.firstName} ${employee.lastName}`}
                          </label>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </div>
            </div>
            
            {/* Custom Percentage Assignment */}
            <div className="mt-4">
              <FormLabel>Custom Bonus Percentages</FormLabel>
              <FormDescription className="mb-2">
                Assign custom bonus percentages for each employee on specific projects
              </FormDescription>
              <Card className="p-4">
                <ScrollArea className="h-64">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Project</TableHead>
                        <TableHead className="w-[120px] text-right">Percentage</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {employees
                        .filter(e => selectAllEmployees || selectedEmployees.includes(e.id))
                        .map((employee) => (
                          projects
                            .filter(p => selectAllProjects || selectedProjects.includes(p.id))
                            .map((project) => {
                              const key = `${employee.id}-${project.id}`;
                              return (
                                <TableRow key={key}>
                                  <TableCell>{`${employee.firstName} ${employee.lastName}`}</TableCell>
                                  <TableCell>{project.name}</TableCell>
                                  <TableCell className="text-right">
                                    <Input
                                      type="number"
                                      min="0"
                                      max="100"
                                      step="0.5"
                                      className="w-20 ml-auto"
                                      value={employeeProjectPercentages[key] || ""}
                                      onChange={(e) => handlePercentageChange(employee.id, project.id, e.target.value)}
                                      placeholder="0.0"
                                    />
                                  </TableCell>
                                </TableRow>
                              );
                            })
                        ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </Card>
            </div>
          </div>
          
          <FormDescription>
            This will calculate bonuses based on the project billing totals for the selected quarter.
            Each employee will receive a bonus based on their variable percentage contribution to projects.
          </FormDescription>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </>
              ) : (
                "Calculate Quarterly Bonuses"
              )}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
};

export default QuarterlyBonusCalculator;