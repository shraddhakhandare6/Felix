'use client';

import { useEffect, useState, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { QrCode } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const QR_READER_ID = "qr-reader-view";

const QrScanner = ({ 
  onScanSuccess, 
  onScanError 
}: { 
  onScanSuccess: (decodedText: string) => void;
  onScanError: (errorMessage: string) => void;
}) => {
  // Use refs to hold the latest callbacks without causing the effect to re-run
  const onScanSuccessRef = useRef(onScanSuccess);
  onScanSuccessRef.current = onScanSuccess;

  const onScanErrorRef = useRef(onScanError);
  onScanErrorRef.current = onScanError;

  useEffect(() => {
    const html5QrCode = new Html5Qrcode(QR_READER_ID, false);
    
    const qrCodeSuccessCallback = (decodedText: string) => {
      onScanSuccessRef.current(decodedText);
    };
    
    // We don't need to do anything with minor errors, but the library requires a callback.
    const qrCodeErrorCallback = (errorMessage: string) => { };

    const config = { fps: 10, qrbox: { width: 250, height: 250 } };

    // Start scanning
    html5QrCode.start(
      { facingMode: "environment" },
      config,
      qrCodeSuccessCallback,
      qrCodeErrorCallback
    ).catch((err) => {
      onScanErrorRef.current(String(err));
    });

    // Cleanup function to stop scanning when the component unmounts.
    return () => {
      // Check if the scanner is still active before trying to stop it.
      if (html5QrCode.isScanning) {
        html5QrCode.stop().catch(err => {
          console.error("Failed to stop the QR scanner.", err);
        });
      }
    };
  }, []); // Empty dependency array ensures this effect runs only once on mount

  return <div id={QR_READER_ID} className="w-full rounded-md overflow-hidden bg-secondary min-h-[282px]" />;
};


export function ScanQrDialog({ onScanSuccess }: { onScanSuccess: (decodedText: string) => void }) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleSuccess = (decodedText: string) => {
    onScanSuccess(decodedText);
    setOpen(false); // Close the dialog on successful scan
  };

  const handleError = (errorMessage: string) => {
    console.error("QR Scanner Error:", errorMessage);
    toast({
      variant: 'destructive',
      title: 'Camera Error',
      description: 'Could not access the camera. Please check permissions and try again.',
    });
    setOpen(false); // Close the dialog on error
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="justify-center w-full sm:w-auto">
          <QrCode className="mr-2 h-4 w-4" /> Add via QR
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Scan QR Code</DialogTitle>
          <DialogDescription>
            Position the contact's QR code within the frame to scan their public key.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
           {/* The QrScanner component is only mounted when the dialog is open */}
           {open && <QrScanner onScanSuccess={handleSuccess} onScanError={handleError} />}
        </div>
        <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
