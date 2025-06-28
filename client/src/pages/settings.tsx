import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/layout/header';
import PartnerTable from '@/components/settings/partner-table';
import PartnerForm from '@/components/settings/partner-form';
import { Dialog } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { usePartner } from '@/hooks/use-partner';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useCompanySettings } from "@/hooks/use-company-settings";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";

const companySettingsSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  taxId: z.string().min(1, "Tax ID is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  fiscalYearStart: z.string().min(1, "Fiscal year start is required"),
});

type CompanySettingsFormValues = z.infer<typeof companySettingsSchema>;

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

interface Partner {
  id: number;
  name: string;
  email: string;
  share: number;
}

const Settings = () => {
  const [isPartnerFormOpen, setIsPartnerFormOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();
  const { deletePartner } = usePartner();
  const { getCompanySettings, createCompanySettings, updateCompanySettings, deleteCompanySettings } = useCompanySettings();

  const form = useForm<CompanySettingsFormValues>({
    resolver: zodResolver(companySettingsSchema),
    defaultValues: {
      companyName: "",
      taxId: "",
      address: "",
      city: "",
      state: "",
      postalCode: "",
      fiscalYearStart: "January",
    },
  });

  // Load company settings when available
  useEffect(() => {
    if (getCompanySettings.data) {
      form.reset({
        companyName: getCompanySettings.data.companyName,
        taxId: getCompanySettings.data.taxId,
        address: getCompanySettings.data.address,
        city: getCompanySettings.data.city,
        state: getCompanySettings.data.state,
        postalCode: getCompanySettings.data.postalCode,
        fiscalYearStart: getCompanySettings.data.fiscalYearStart,
      });
    }
  }, [getCompanySettings.data, form]);

  const handleSaveCompanySettings = async (data: CompanySettingsFormValues) => {
    try {
      if (getCompanySettings.data) {
        await updateCompanySettings.mutateAsync({
          id: getCompanySettings.data.id,
          data,
        });
      } else {
        await createCompanySettings.mutateAsync(data);
      }
    } catch (error) {
      console.error("Error saving company settings:", error);
    }
  };

  const { data: partners = [] as Partner[], isLoading, isError, refetch } = useQuery({
    queryKey: ['/api/partners'],
  });

  const handleAddPartner = () => {
    setSelectedPartner(null);
    setIsPartnerFormOpen(true);
  };

  const handleEditPartner = (partner: any) => {
    setSelectedPartner(partner);
    setIsPartnerFormOpen(true);
  };

  const handleDeletePartner = async (id: number) => {
    try {
      await deletePartner.mutateAsync(id);
      toast({
        title: 'Partner deleted',
        description: 'The partner has been deleted successfully.',
      });
      refetch();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete partner.',
        variant: 'destructive',
      });
    }
  };

  const handleFormClose = () => {
    setIsPartnerFormOpen(false);
    setSelectedPartner(null);
  };

  const handleFormSuccess = () => {
    setIsPartnerFormOpen(false);
    setSelectedPartner(null);
    refetch();
    toast({
      title: selectedPartner ? 'Partner Updated' : 'Partner Added',
      description: `The partner has been ${selectedPartner ? 'updated' : 'added'} successfully.`,
    });
  };

  const handleSaveNotificationSettings = () => {
    toast({
      title: 'Notification Settings Saved',
      description: 'Notification settings have been updated successfully.',
    });
  };

  const handleDeleteCompanySettings = async () => {
    try {
      if (getCompanySettings.data?.id) {
        await deleteCompanySettings.mutateAsync(getCompanySettings.data.id);
        // Reset form after deletion
        form.reset({
          companyName: "",
          taxId: "",
          address: "",
          city: "",
          state: "",
          postalCode: "",
          fiscalYearStart: "January",
        });
      }
    } catch (error) {
      console.error("Error deleting company settings:", error);
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  if (isError) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-medium text-gray-900">Error Loading Settings</h3>
          <p className="mt-1 text-gray-500">There was an error loading the settings. Please try again later.</p>
          <button
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            onClick={() => refetch()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1 relative overflow-y-auto focus:outline-none">
      <Header 
        title="Settings" 
        subtitle="Configure system settings and manage partners"
      />
      
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <Tabs defaultValue="partners" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="partners">Partners</TabsTrigger>
            <TabsTrigger value="company">Company Settings</TabsTrigger>
            {/* <TabsTrigger value="notifications">Notifications</TabsTrigger>  */}
          </TabsList>
          
          <TabsContent value="partners">
            <div className="mb-4 flex justify-end">
              <Button onClick={handleAddPartner}>Add Partner</Button>
            </div>
            
            <PartnerTable 
              partners={partners || []}
              isLoading={isLoading}
              onEdit={handleEditPartner}
              onDelete={handleDeletePartner}
            />
            
            <Dialog open={isPartnerFormOpen} onOpenChange={handleFormClose}>
              <PartnerForm 
                partner={selectedPartner}
                onSuccess={handleFormSuccess}
                onCancel={handleFormClose}
              />
            </Dialog>
          </TabsContent>
          
          <TabsContent value="company">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Company Information</CardTitle>
                    <CardDescription>
                      Manage your company details and settings
                    </CardDescription>
                  </div>
                  {getCompanySettings.data && (
                    <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete Settings
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Company Settings</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete the company settings? This action cannot be undone and will remove all company information including name, address, and tax details.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={handleDeleteCompanySettings}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete Settings
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleSaveCompanySettings)} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="companyName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="taxId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tax ID / Registration Number</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>State / Province</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="postalCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Postal Code</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="fiscalYearStart"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fiscal Year Start</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
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

                    <div className="flex justify-end">
                      <Button 
                        type="submit"
                        disabled={createCompanySettings.isPending || updateCompanySettings.isPending}
                      >
                        {createCompanySettings.isPending || updateCompanySettings.isPending
                          ? "Saving..."
                          : "Save Changes"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>
                  Manage your notification preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-neutral-500">Receive project and billing updates via email</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Monthly Financial Reports</p>
                    <p className="text-sm text-neutral-500">Receive monthly financial summary reports</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Bonus Approval Alerts</p>
                    <p className="text-sm text-neutral-500">Get notified when bonuses need approval</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Project Deadline Reminders</p>
                    <p className="text-sm text-neutral-500">Receive reminders for upcoming project deadlines</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Invoice Payment Notifications</p>
                    <p className="text-sm text-neutral-500">Get notified when invoices are paid or overdue</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
              <CardFooter className="justify-end">
                <Button onClick={handleSaveNotificationSettings}>Save Preferences</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
};

export default Settings;
