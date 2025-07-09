'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, type Html5QrcodeResult, Html5QrcodeSupportedFormats } from 'html5-qrcode';
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
  // Use a ref to hold the scanner instance to prevent re-initialization on re-renders.
  const scannerRef = useRef<Html5Qrcode | null>(null);
  
  // Use refs for callbacks to ensure the latest functions are used without re-triggering the effect.
  const onScanSuccessRef = useRef(onScanSuccess);
  onScanSuccessRef.current = onScanSuccess;

  const onScanErrorRef = useRef(onScanError);
  onScanErrorRef.current = onScanError;

  useEffect(() => {
    // This effect should only run once on component mount.
    // The empty dependency array [] ensures this.
    
    // Here is the key optimization: we specify that the scanner should ONLY look for QR_CODE.
    // This makes it significantly faster and more reliable.
  const scanner = new Html5Qrcode(QR_READER_ID, {
  formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
  verbose: false // or true if you want logs
});

    scannerRef.current = scanner;
    
    const successCallback = (decodedText: string, result: Html5QrcodeResult) => {
      // Stop the scanner immediately on success to prevent multiple callbacks.
      if (scanner.isScanning) {
        scanner.stop().then(() => {
            onScanSuccessRef.current(decodedText);
        }).catch((err) => {
            console.error("Failed to stop scanner after success", err);
            onScanSuccessRef.current(decodedText);
        });
      }
    };
    
    const errorCallback = (errorMessage: string) => {
      // This callback fires constantly when no QR code is in view. We can ignore these messages.
    };

    const config = { fps: 10, qrbox: { width: 250, height: 250 } };
    
    // Start scanning.
    scanner.start(
      { facingMode: "environment" },
      config,
      successCallback,
      errorCallback
    ).catch((err) => {
      onScanErrorRef.current(String(err));
    });

    // The cleanup function is critical to stop the camera when the component unmounts.
    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(error => {
          console.warn("QR scanner failed to stop gracefully during cleanup.", error);
        });
      }
    };
  }, []); 

  return <div id={QR_READER_ID} className="w-full aspect-square rounded-md overflow-hidden bg-secondary" />;
};


export function ScanQrDialog({ onScanSuccess }: { onScanSuccess: (decodedText: string) => void }) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleSuccess = (decodedText: string) => {
    onScanSuccess(decodedText);
    setOpen(false);
  };

  const handleError = (errorMessage: string) => {
    console.error("QR Scanner Error:", errorMessage);
    toast({
      variant: 'destructive',
      title: 'Camera Error',
      description: 'Could not access the camera. Please check permissions and try again.',
    });
    setOpen(false);
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
           {/* The QrScanner component is only mounted when the dialog is open,
               which allows its useEffect hook to handle the camera lifecycle correctly. */}
           {open && <QrScanner onScanSuccess={handleSuccess} onScanError={handleError} />}
        </div>
        <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
