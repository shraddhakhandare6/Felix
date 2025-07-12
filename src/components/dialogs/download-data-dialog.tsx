
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
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { DownloadCloud } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type DataType = 'incoming' | 'outgoing';
type FileFormat = 'json' | 'csv' | 'xlsx';

interface DownloadDataDialogProps {
  incomingData: any[];
  outgoingData: any[];
}

export function DownloadDataDialog({ incomingData, outgoingData }: DownloadDataDialogProps) {
  const [open, setOpen] = useState(false);
  const [dataType, setDataType] = useState<DataType>('incoming');
  const [fileFormat, setFileFormat] = useState<FileFormat>('json');
  const { toast } = useToast();

  const handleDownload = () => {
    const dataToDownload = dataType === 'incoming' ? incomingData : outgoingData;

    if (dataToDownload.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No Data',
        description: `There is no ${dataType} data to download.`,
      });
      return;
    }

    const filename = `felix_${dataType}_requests_${new Date().toISOString().split('T')[0]}`;

    if (fileFormat === 'json') {
      downloadJson(dataToDownload, `${filename}.json`);
    } else if (fileFormat === 'csv') {
      downloadCsv(dataToDownload, `${filename}.csv`);
    } else if (fileFormat === 'xlsx') {
      downloadExcel(dataToDownload, `${filename}.xlsx`);
    }
    
    setOpen(false);
  };

  const downloadJson = (data: any[], filename: string) => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(data, null, 2)
    )}`;
    const link = document.createElement('a');
    link.href = jsonString;
    link.download = filename;
    link.click();
  };

  const downloadExcel = (data: any[], filename: string) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
    XLSX.writeFile(workbook, filename);
  };

  const downloadCsv = (data: any[], filename: string) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="justify-center w-full md:w-auto">
          <DownloadCloud className="mr-2 h-4 w-4" /> Download Data
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Download Request Data</DialogTitle>
          <DialogDescription>
            Select the data and format you want to download.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="space-y-3">
            <Label>Data to Download</Label>
            <RadioGroup
              defaultValue="incoming"
              value={dataType}
              onValueChange={(value: DataType) => setDataType(value)}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="incoming" id="dt-incoming" />
                <Label htmlFor="dt-incoming">Incoming</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="outgoing" id="dt-outgoing" />
                <Label htmlFor="dt-outgoing">Outgoing</Label>
              </div>
            </RadioGroup>
          </div>
          <div className="space-y-3">
            <Label>File Format</Label>
            <RadioGroup
              defaultValue="json"
              value={fileFormat}
              onValueChange={(value: FileFormat) => setFileFormat(value)}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="json" id="ff-json" />
                <Label htmlFor="ff-json">JSON</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="csv" id="ff-csv" />
                <Label htmlFor="ff-csv">CSV</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="xlsx" id="ff-xlsx" />
                <Label htmlFor="ff-xlsx">Excel</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleDownload}>Download</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
