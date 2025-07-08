'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode';
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

const QR_READER_ID = "qr-reader";

export function ScanQrDialog({ onScanSuccess }: { onScanSuccess: (decodedText: string) => void }) {
  const [open, setOpen] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!open) {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(err => {
          console.error("Scanner stop failed", err);
        });
      }
      return;
    }

    if (!document.getElementById(QR_READER_ID)) {
      return;
    }

    if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(QR_READER_ID, false);
    }
    const scanner = scannerRef.current;

    const qrCodeSuccessCallback = (decodedText: string) => {
      if (scanner.isScanning) {
        scanner.stop().catch(err => console.error("Scanner stop failed on success", err));
      }
      onScanSuccess(decodedText);
      setOpen(false);
    };

    const qrCodeErrorCallback = (errorMessage: string) => {
      // This callback is called frequently, so we don't log it to avoid console spam.
    };

    const config = { fps: 10, qrbox: { width: 250, height: 250 } };

    if (scanner.getState() !== Html5QrcodeScannerState.SCANNING) {
      scanner.start(
        { facingMode: "environment" },
        config,
        qrCodeSuccessCallback,
        qrCodeErrorCallback
      ).catch((err) => {
        console.error("Unable to start scanning.", err);
        toast({
          variant: 'destructive',
          title: 'Camera Error',
          description: 'Could not access the camera. Please grant permission in your browser settings.',
        });
      });
    }

    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(err => {
          console.error("Scanner stop failed on cleanup.", err);
        });
      }
    };
  }, [open, onScanSuccess, toast]);

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
            <div id={QR_READER_ID} className="w-full rounded-md overflow-hidden bg-secondary min-h-[282px]" />
        </div>
        <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
