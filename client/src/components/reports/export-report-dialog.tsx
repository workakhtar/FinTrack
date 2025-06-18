import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getCurrentMonthAndYear } from "@/lib/utils";

interface ExportReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExport: (reportType: string) => void;
  currentTab: string;
}

const ExportReportDialog: React.FC<ExportReportDialogProps> = ({
  open,
  onOpenChange,
  onExport,
  currentTab
}) => {
  const [reportFormat, setReportFormat] = useState("pdf");
  const [includeCharts, setIncludeCharts] = useState(true);
  const [period, setPeriod] = useState("current");
  const { month, year } = getCurrentMonthAndYear();
  
  const handleExport = () => {
    let reportType = "Financial";
    
    if (currentTab === "profit-sharing") {
      reportType = "Profit Sharing";
    } else if (currentTab === "employee-performance") {
      reportType = "Employee Performance";
    }
    
    onExport(`${reportType} (${reportFormat.toUpperCase()})`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export Report</DialogTitle>
          <DialogDescription>
            Select export options for your report
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Report Type</Label>
            <RadioGroup defaultValue={currentTab === "profit-sharing" ? "profit" : (currentTab === "employee-performance" ? "performance" : "financial")}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="financial" id="financial" />
                <Label htmlFor="financial">Financial Overview</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="profit" id="profit" />
                <Label htmlFor="profit">Profit Sharing</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="performance" id="performance" />
                <Label htmlFor="performance">Employee Performance</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="space-y-2">
            <Label>Format</Label>
            <RadioGroup value={reportFormat} onValueChange={setReportFormat}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pdf" id="pdf" />
                <Label htmlFor="pdf">PDF Document</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="excel" id="excel" />
                <Label htmlFor="excel">Excel Spreadsheet</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="csv" id="csv" />
                <Label htmlFor="csv">CSV File</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="space-y-2">
            <Label>Period</Label>
            <Select defaultValue={period} onValueChange={setPeriod}>
              <SelectTrigger>
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current">{month} {year}</SelectItem>
                <SelectItem value="quarter">Current Quarter</SelectItem>
                <SelectItem value="year">Year to Date</SelectItem>
                <SelectItem value="custom">Custom...</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="include-charts" 
              checked={includeCharts}
              onCheckedChange={(checked) => {
                if (typeof checked === 'boolean') {
                  setIncludeCharts(checked);
                }
              }}
            />
            <Label htmlFor="include-charts">Include charts and visualizations</Label>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport}>
            Export Report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExportReportDialog;
