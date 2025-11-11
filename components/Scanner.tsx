
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { CameraIcon } from './icons/CameraIcon';
import { CloseIcon } from './icons/CloseIcon';

interface ScannerProps {
  onScan: (result: string) => void;
  currentView: 'search' | 'scanner' | 'details' | 'collection';
  setCurrentView: (view: 'search' | 'scanner' | 'details' | 'collection') => void;
}

// BarcodeDetector might not be available in all browsers
declare global {
  interface Window {
    BarcodeDetector: any;
  }
}

const Scanner: React.FC<ScannerProps> = ({ onScan, currentView, setCurrentView }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    if (typeof window.BarcodeDetector === 'undefined') {
      setIsSupported(false);
    }
  }, []);

  const stopScan = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setCurrentView('search');
  }, [setCurrentView]);

  const startScan = async () => {
    setError(null);
    setIsScanning(true);
    setCurrentView('scanner');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();

        const barcodeDetector = new window.BarcodeDetector({ formats: ['ean_13', 'qr_code'] });
        
        const detect = () => {
          if (!videoRef.current || videoRef.current.paused || videoRef.current.ended) {
            return;
          }
          barcodeDetector.detect(videoRef.current)
            .then((barcodes: any[]) => {
              if (barcodes.length > 0) {
                onScan(barcodes[0].rawValue);
                stopScan();
              } else {
                 requestAnimationFrame(detect);
              }
            }).catch((err: Error) => {
                console.error('Barcode detection failed:', err);
                setError('Barcode detection failed.');
            });
        };
        requestAnimationFrame(detect);
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Could not access camera. Please check permissions.');
      setCurrentView('search');
    }
  };

  useEffect(() => {
    if (currentView !== 'scanner') {
        setIsScanning(false);
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
        }
    }
  }, [currentView]);

  if (!isSupported) {
    return (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4" role="alert">
            <p className="font-bold">Browser Not Supported</p>
            <p>Barcode scanning is not supported by your browser. Please try Chrome or Edge, or use the manual ISBN search.</p>
        </div>
    );
  }


  if (currentView === 'scanner') {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center z-50 p-4">
            <div className="relative w-full max-w-lg aspect-square rounded-lg overflow-hidden shadow-2xl">
                 <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
                 <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-3/4 h-1/3 border-4 border-white border-dashed rounded-lg opacity-75"></div>
                </div>
            </div>
            {error && <p className="text-red-400 mt-4">{error}</p>}
            <p className="text-white mt-4 text-center">Point your camera at a book's barcode.</p>
            <button onClick={stopScan} className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-slate-800 bg-white hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-white">
                <CloseIcon className="-ml-1 mr-2 h-5 w-5" />
                Cancel
            </button>
        </div>
    );
  }

  return (
    <div className="text-center">
        <button
            onClick={startScan}
            className="inline-flex items-center justify-center px-6 py-3 border border-slate-300 text-base font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition"
        >
           <CameraIcon className="-ml-1 mr-3 h-5 w-5" />
           Scan Barcode with Camera
        </button>
    </div>
  );
};

export default Scanner;
