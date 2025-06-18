import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSalary } from "@/hooks/use-salary";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { getCurrentMonthAndYear, getMonthName } from "@/lib/utils";

// Fixed salary form schema - keep all numeric fields as strings
const salaryFormSchema = z.object({
  employeeId: z.coerce.number().positive("Please select an employee"),
  month: z.string().min(1, "Month is required"),
  year: z.coerce.number().min(2000, "Year must be 2000 or later").max(2100, "Year must be 2100 or earlier"),
  basicSalary: z.string().min(1, "Basic salary is required"),
  bonus: z.string().optional().default("0"),
  taxDeduction: z.string().optional().default("0"),
  loanDeduction: z.string().optional().default("0"),
  arrears: z.string().optional().default("0"),
  travelAllowance: z.string().optional().default("0"),
  status: z.string().min(1, "Status is required"),
  paymentDate: z.date().nullable().optional(),
});

type SalaryFormValues = z.infer<typeof salaryFormSchema>;

interface SalaryFormProps {
  salary?: any;
  employees?: any[];
  onSuccess: () => void;
  onCancel: () => void;
  employeeId?: number;
}

const SalaryForm: React.FC<SalaryFormProps> = ({
  salary,
  employees = [],
  onSuccess,
  onCancel,
  employeeId,
}) => {
  const { createSalary, updateSalary } = useSalary();
  const [netSalary, setNetSalary] = useState<string>("0");

  // Initialize the form with empty default values
  const form = useForm<SalaryFormValues>({
    resolver: zodResolver(salaryFormSchema),
    defaultValues: {
          employeeId: employeeId || 0,
          month: getCurrentMonthAndYear().month,
          year: getCurrentMonthAndYear().year,
          basicSalary: "",
          bonus: "0",
          taxDeduction: "0",
          loanDeduction: "0",
          arrears: "0",
          travelAllowance: "0",
          status: "pending",
          paymentDate: null,
        },
  });

  // Reset form when salary changes
  useEffect(() => {
    if (salary) {
      const formattedSalary = {
        employeeId: salary.employeeId,
        month: salary.month,
        year: typeof salary.year === 'string' ? parseInt(salary.year) : salary.year,
        basicSalary: String(salary.basicSalary || "0"),
        bonus: String(salary.bonus || "0"),
        taxDeduction: String(salary.taxDeduction || "0"),
        loanDeduction: String(salary.loanDeduction || "0"),
        arrears: String(salary.arrears || "0"),
        travelAllowance: String(salary.travelAllowance || "0"),
        status: salary.status,
        paymentDate: salary.paymentDate ? new Date(salary.paymentDate) : null,
      };
      form.reset(formattedSalary);
    }
  }, [salary, form]);

  // Calculate net salary whenever form values change
  useEffect(() => {
    const subscription = form.watch((values) => {
      const basic = parseFloat(String(values.basicSalary || "0")) || 0;
      const bonus = parseFloat(String(values.bonus || "0")) || 0;
      const tax = parseFloat(String(values.taxDeduction || "0")) || 0;
      const loan = parseFloat(String(values.loanDeduction || "0")) || 0;
      const arrears = parseFloat(String(values.arrears || "0")) || 0;
      const travel = parseFloat(String(values.travelAllowance || "0")) || 0;

    const net = basic + bonus + arrears + travel - tax - loan;
    setNetSalary(net.toFixed(2));
    });

    return () => subscription.unsubscribe();
  }, [form]);

  const onSubmit = async (data: SalaryFormValues) => {
    try {
      const payload = {
        ...data,
        netSalary,
        paymentDate: data.paymentDate ? format(data.paymentDate, 'yyyy-MM-dd') : null,
      };

      if (salary?.id) {
        await updateSalary.mutateAsync({
          id: salary.id,
          data: payload,
        });
      } else {
        await createSalary.mutateAsync(payload);
      }
      onSuccess();
    } catch (error) {
      console.error("Error submitting salary form:", error);
    }
  };

  const months = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];

  const isPending = createSalary.isPending || updateSalary.isPending;

  return (
    <DialogContent className="sm:max-w-[550px]">
      <DialogHeader>
        <DialogTitle>
          {salary ? "Edit Salary Record" : "Add New Salary Record"}
        </DialogTitle>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          <FormField
            control={form.control}
            name="employeeId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Employee</FormLabel>
                <Select
                  disabled={isPending || !!employeeId}
                  onValueChange={(value) => field.onChange(parseInt(value))}
                  value={field.value.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {employees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id.toString()}>
                        {employee.firstName} {employee.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="month"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Month</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select month" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {months.map((month) => (
                        <SelectItem key={month} value={month}>
                          {month}
                        </SelectItem>
                      ))}
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
                      disabled={isPending}
                      {...field}
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="basicSalary"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Basic Salary</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    disabled={isPending}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="bonus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bonus</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="travelAllowance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Travel Allowance</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="taxDeduction"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tax Deduction</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="loanDeduction"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Loan Deduction</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="arrears"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Arrears</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    disabled={isPending}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="border p-3 rounded-md bg-primary/5">
            <div className="flex justify-between items-center">
              <span className="font-medium text-sm">Net Salary:</span>
              <span className="font-bold text-lg text-primary">
                ${netSalary}
              </span>
            </div>
          </div>

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="paymentDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Payment Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={`w-full pl-3 text-left font-normal ${
                          !field.value ? "text-muted-foreground" : ""
                        }`}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value || undefined}
                      onSelect={field.onChange}
                      disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending
                ? "Saving..."
                : salary
                ? "Update Salary"
                : "Add Salary"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
};

export default SalaryForm;