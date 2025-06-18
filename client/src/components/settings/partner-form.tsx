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
} from "@/components/ui/form";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePartner } from "@/hooks/use-partner";

// Extended validation schema
const partnerFormSchema = z.object({
  name: z.string().min(2, { message: "Partner name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  share: z.string().min(1, { message: "Share percentage is required" })
    .refine((val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num >= 0 && num <= 100;
    }, { message: "Share percentage must be between 0 and 100" }),
});

type PartnerFormValues = z.infer<typeof partnerFormSchema>;

interface PartnerFormProps {
  partner?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

const PartnerForm: React.FC<PartnerFormProps> = ({
  partner,
  onSuccess,
  onCancel
}) => {
  const { createPartner, updatePartner } = usePartner();
  const isEditing = !!partner;

  const form = useForm<PartnerFormValues>({
    resolver: zodResolver(partnerFormSchema),
    defaultValues: partner
      ? {
          name: partner.name,
          email: partner.email,
          share: partner.share?.toString() || "0",
        }
      : {
          name: "",
          email: "",
          share: "25",
        },
  });

  const onSubmit = async (data: PartnerFormValues) => {
    try {
      if (isEditing) {
        await updatePartner.mutateAsync({
          id: partner.id,
          data
        });
      } else {
        await createPartner.mutateAsync(data);
      }
      onSuccess();
    } catch (error) {
      console.error("Error submitting form:", error);
      // Error is handled by the mutation and displayed via toast from the hook
    }
  };

  const isPending = createPartner.isPending || updatePartner.isPending;

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>
          {isEditing ? "Edit Partner" : "Add New Partner"}
        </DialogTitle>
        <DialogDescription>
          {isEditing
            ? "Update the partner information below."
            : "Fill in the information below to add a new partner."}
        </DialogDescription>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Partner Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input {...field} type="email" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="share"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Profit Share Percentage</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      {...field}
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-neutral-500 sm:text-sm">%</span>
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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
              ) : isEditing ? (
                "Update Partner"
              ) : (
                "Add Partner"
              )}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
};

export default PartnerForm;
