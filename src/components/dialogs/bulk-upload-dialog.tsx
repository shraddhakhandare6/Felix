
'use client';

import { useState } from 'react';
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
      if (selectedFile.type !== 'text/csv') {
        setError('Invalid file type. Please upload a CSV file.');
        setFile(null);
        setParsedData([]);
        return;
      }
      setFile(selectedFile);
      setError(null);
      parseCsv(selectedFile);
    }
  };

  const parseCsv = (csvFile: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const rows = text.split('\n').filter(row => row.trim() !== '');
      const headerRow = rows.shift()?.trim();
      
      if (!headerRow) {
        setError("Invalid CSV format. The file appears to be empty.");
        setParsedData([]);
        return;
      }

      const headers = headerRow.toLowerCase().split(',').map(h => h.trim());
      
      if (!headers.includes('to') || !headers.includes('amount') || !headers.includes('for')) {
        setError("Invalid CSV format. Header must contain 'to', 'amount', and 'for' columns.");
        setParsedData([]);
        return;
      }

      const toIndex = headers.indexOf('to');
      const amountIndex = headers.indexOf('amount');
      const forIndex = headers.indexOf('for');

      const data = rows.map(row => {
        const values = row.split(',');
        return {
          to: values[toIndex]?.trim(),
          amount: values[amountIndex]?.trim(),
          for: values[forIndex]?.trim(),
        };
      }).filter(d => d.to && d.amount && d.for);

      setParsedData(data);
    };
    reader.onerror = () => {
        setError("Failed to read the file.");
        setParsedData([]);
    };
    reader.readAsText(csvFile);
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
            Upload a CSV file to create multiple payment requests at once. The file must have columns: `to`, `amount`, `for`.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="csv-file" className="text-right">
              CSV File
            </Label>
            <Input id="csv-file" type="file" accept=".csv" onChange={handleFileChange} className="col-span-3" />
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
