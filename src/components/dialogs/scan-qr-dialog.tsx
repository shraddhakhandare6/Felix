'use client';

import { useEffect, useState, useRef } from 'react';
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
  // This ref pattern is essential to avoid re-running the effect
  // when the parent component re-renders and creates new function instances for the callbacks.
  const onScanSuccessRef = useRef(onScanSuccess);
  onScanSuccessRef.current = onScanSuccess;

  const onScanErrorRef = useRef(onScanError);
  onScanErrorRef.current = onScanError;

  useEffect(() => {
    // The scanner instance is created here and will be cleaned up on unmount.
    const scanner = new Html5Qrcode(
        QR_READER_ID, 
        { 
            formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE] 
        }
    );
    
    const successCallback = (decodedText: string, result: Html5QrcodeResult) => {
      // The success callback can sometimes fire multiple times in quick succession.
      // We stop the scanner immediately to prevent this, and then call the parent callback.
      if (scanner.isScanning) {
        scanner.stop().then(() => {
            onScanSuccessRef.current(decodedText);
        }).catch((err) => {
            console.error("Failed to stop scanner after success", err);
            // still call the success callback
            onScanSuccessRef.current(decodedText);
        });
      }
    };
    
    const errorCallback = (errorMessage: string) => {
      // This error callback fires constantly when no QR code is found, so we can safely ignore it.
      // The start method's catch block will handle fatal errors like camera permissions.
    };

    const config = { fps: 10, qrbox: { width: 250, height: 250 } };
    
    scanner.start(
      { facingMode: "environment" },
      config,
      successCallback,
      errorCallback
    ).catch((err) => {
      onScanErrorRef.current(String(err));
    });

    // The cleanup function is critical to stop the camera and prevent duplicates.
    return () => {
      // We need to check if the scanner is still scanning before trying to stop it.
      // This can happen if the component unmounts for other reasons.
      if (scanner && scanner.isScanning) {
        scanner.stop().catch(error => {
          console.warn("QR scanner failed to stop during cleanup.", error);
        });
      }
    };
  // The empty dependency array is crucial to ensure this effect runs only once.
  }, []); 

  return <div id={QR_READER_ID} className="w-full aspect-square rounded-md overflow-hidden bg-secondary" />;
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
