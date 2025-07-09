
'use client';

import { useState } from 'react';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileUp } from 'lucide-react';
import { usePaymentRequests } from '@/context/payment-requests-context';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface ParsedRequest {
  to: string;
  amount: string;
  for: string;
}

export function BulkUploadDialog() {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedRequest[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { addRequest } = usePaymentRequests();
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      setParsedData([]);

      const fileType = selectedFile.type;
      const fileName = selectedFile.name.toLowerCase();

      if (fileName.endsWith('.csv') || fileType === 'text/csv') {
        parseCsv(selectedFile);
      } else if (fileName.endsWith('.json') || fileType === 'application/json') {
        parseJson(selectedFile);
      } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
        parseExcel(selectedFile);
      } else {
        setError('Unsupported file type. Please upload a CSV, JSON, or Excel file.');
      }
    }
  };
  
  const validateData = (data: any[]): { validData: ParsedRequest[], error: string | null } => {
    if (!Array.isArray(data) || data.length === 0) {
      return { validData: [], error: "The file is empty or not in the expected array format." };
    }

    const requiredKeys = ['to', 'amount', 'for'];
    const validData: ParsedRequest[] = [];

    for (const item of data) {
      const itemKeys = Object.keys(item).map(k => k.toLowerCase().trim());
      const hasAllKeys = requiredKeys.every(key => itemKeys.includes(key));
      
      if (!hasAllKeys) {
        return { validData: [], error: `Invalid data structure. Each item must contain 'to', 'amount', and 'for' keys.`};
      }
      
      const toKey = Object.keys(item).find(k => k.toLowerCase().trim() === 'to') as string;
      const amountKey = Object.keys(item).find(k => k.toLowerCase().trim() === 'amount') as string;
      const forKey = Object.keys(item).find(k => k.toLowerCase().trim() === 'for') as string;

      if (item[toKey] && item[amountKey] && item[forKey]) {
          validData.push({
            to: String(item[toKey]),
            amount: String(item[amountKey]),
            for: String(item[forKey]),
          });
      }
    }
    
    if (validData.length === 0) {
       return { validData: [], error: "No valid records found in the file." };
    }

    return { validData, error: null };
  }

  const parseCsv = (csvFile: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const rows = text.split('\n').filter(row => row.trim() !== '');
        const headerRow = rows.shift()?.trim();
        
        if (!headerRow) {
          setError("Invalid CSV: The file appears to be empty.");
          return;
        }

        const headers = headerRow.toLowerCase().split(',').map(h => h.trim());
        const requiredHeaders = ['to', 'amount', 'for'];
        if (!requiredHeaders.every(h => headers.includes(h))) {
            setError("Invalid CSV format. Header must contain 'to', 'amount', and 'for' columns.");
            return;
        }

        const data = rows.map(row => {
            const values = row.split(',');
            const entry: {[key: string]: string} = {};
            headers.forEach((header, index) => {
                entry[header] = values[index]?.trim();
            });
            return entry;
        });

        const { validData, error } = validateData(data);
        if (error) {
            setError(error);
        } else {
            setParsedData(validData);
        }
      } catch (err) {
        setError("Failed to parse CSV file.");
      }
    };
    reader.readAsText(csvFile);
  };

  const parseJson = (jsonFile: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
            const text = event.target?.result as string;
            const data = JSON.parse(text);
            const { validData, error } = validateData(data);
            if (error) {
                setError(error);
            } else {
                setParsedData(validData);
            }
        } catch (err) {
            setError("Invalid JSON file. Please check the file format.");
        }
      };
      reader.readAsText(jsonFile);
  };

  const parseExcel = (excelFile: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
            const data = event.target?.result;
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);
            
            const { validData, error } = validateData(jsonData);
            if (error) {
                setError(error);
            } else {
                setParsedData(validData);
            }
        } catch (err) {
            setError("Failed to parse Excel file.");
        }
      };
      reader.readAsArrayBuffer(excelFile);
  };

  const handleSubmit = () => {
    if (parsedData.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No data to import',
        description: 'The file is empty or could not be parsed correctly.',
      });
      return;
    }

    parsedData.forEach(req => {
      addRequest({
        to: req.to,
        amount: `${req.amount} BD`,
        for: req.for,
      });
    });

    toast({
      title: 'Bulk Import Successful',
      description: `${parsedData.length} payment requests have been created.`,
    });

    resetStateAndClose();
  };
  
  const resetStateAndClose = () => {
    setFile(null);
    setParsedData([]);
    setError(null);
    setOpen(false);
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
        resetStateAndClose();
    }
    setOpen(isOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="justify-center w-full md:w-auto">
          <FileUp className="mr-2 h-4 w-4" /> Bulk Upload Requests
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Bulk Upload Payment Requests</DialogTitle>
          <DialogDescription>
            Upload a CSV, JSON, or Excel file to create multiple requests. The file must contain columns/keys: `to`, `amount`, `for`.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="csv-file" className="text-right">
              Upload File
            </Label>
            <Input id="csv-file" type="file" accept=".csv, .json, .xls, .xlsx" onChange={handleFileChange} className="col-span-3" />
          </div>
          {error && <p className="text-sm text-destructive col-span-4 text-center">{error}</p>}
          
          {parsedData.length > 0 && (
            <div className="mt-4 max-h-60 overflow-auto border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>To</TableHead>
                            <TableHead>For</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {parsedData.map((req, index) => (
                            <TableRow key={index}>
                                <TableCell className="font-medium">{req.to}</TableCell>
                                <TableCell>{req.for}</TableCell>
                                <TableCell className="text-right">{req.amount} BD</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={parsedData.length === 0 || !!error}>
            Create {parsedData.length > 0 ? parsedData.length : ''} Requests
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
