import React, { useRef, useState, useCallback } from 'react';
import { createWorker } from 'tesseract.js';
import { toast } from 'sonner';
import { Upload, X, Loader2 } from 'lucide-react';
import { dbService } from '../services/db-service';

interface ImageUploadProps {
  label: string;
  onImageUpload: (file: File, text?: string) => Promise<void>;
  withOcr?: boolean;
  existingUrls: string[];
  onRemove: (url: string) => void;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  label,
  onImageUpload,
  withOcr = false,
  existingUrls,
  onRemove
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [currentUpload, setCurrentUpload] = useState<string | null>(null);

  const compressImage = useCallback(async (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }

        let { width, height } = img;
        const MAX_SIZE = 1920;
        const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

        // Skalierung bei zu großen Dimensionen
        if (width > MAX_SIZE || height > MAX_SIZE) {
          if (width > height) {
            height = (height * MAX_SIZE) / width;
            width = MAX_SIZE;
          } else {
            width = (width * MAX_SIZE) / height;
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        // Komprimierung mit verschiedenen Qualitätsstufen
        const tryCompress = (quality: number) => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                resolve(file);
                return;
              }

              if (blob.size > MAX_FILE_SIZE && quality > 0.1) {
                // Erneuter Versuch mit niedrigerer Qualität
                tryCompress(quality - 0.1);
              } else {
                resolve(new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                }));
              }
            },
            'image/jpeg',
            quality
          );
        };

        tryCompress(0.8);
      };

      img.onerror = () => resolve(file);
    });
  }, []);

  const processImage = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Ungültiges Dateiformat', {
        description: 'Bitte nur Bilder hochladen (JPG, PNG, etc.)'
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Datei zu groß', {
        description: 'Bitte ein Bild kleiner als 10MB hochladen'
      });
      return;
    }

    setIsProcessing(true);
    setCurrentUpload(file.name);
    setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));

    try {
      let recognizedText: string | undefined;

      if (withOcr) {
        try {
          const worker = await createWorker('deu');
          const { data: { text } } = await worker.recognize(file);
          await worker.terminate();
          recognizedText = text;
          setUploadProgress(prev => ({ ...prev, [file.name]: 30 }));
        } catch (error) {
          console.error('OCR-Fehler:', error);
          toast.error('Fehler bei der Texterkennung', {
            description: 'Das Bild wird trotzdem hochgeladen'
          });
        }
      }

      const compressedFile = await compressImage(file);
      
      try {
        await onImageUpload(compressedFile, recognizedText);
        toast.success('Bild erfolgreich hochgeladen');
      } catch (error) {
        if (error instanceof Error && error.message.includes('abgebrochen')) {
          toast.error('Upload abgebrochen', {
            description: 'Bitte versuchen Sie es erneut'
          });
        } else {
          toast.error('Fehler beim Upload', {
            description: 'Bitte versuchen Sie es später erneut'
          });
        }
        throw error;
      }

    } catch (error) {
      console.error('Fehler bei der Bildverarbeitung:', error);
    } finally {
      setIsProcessing(false);
      setCurrentUpload(null);
      setUploadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[file.name];
        return newProgress;
      });
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    for (const file of Array.from(files)) {
      await processImage(file);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
        {existingUrls.map((url) => (
          <div key={url} className="relative group aspect-square">
            <img
              src={url}
              alt={label}
              className="w-full h-full object-cover rounded-lg"
              loading="lazy"
              onError={(e) => {
                const img = e.target as HTMLImageElement;
                img.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="%23eee"/><text x="50%" y="50%" font-family="sans-serif" font-size="12" text-anchor="middle" dy=".3em" fill="%23999">Fehler</text></svg>';
              }}
            />
            <button
              onClick={() => onRemove(url)}
              className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center w-full">
        <label className={`w-full flex flex-col items-center px-4 py-6 bg-white rounded-lg shadow-lg tracking-wide border-2 border-emerald-500 border-dashed cursor-pointer hover:bg-emerald-50 transition-colors ${
          isProcessing ? 'opacity-50 cursor-not-allowed' : ''
        }`}>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            disabled={isProcessing}
          />
          {isProcessing ? (
            <div className="flex flex-col items-center">
              <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
              <span className="mt-2 text-base text-gray-600">
                {currentUpload ? `Verarbeite ${currentUpload}...` : 'Verarbeite...'}
              </span>
            </div>
          ) : (
            <>
              <Upload className="w-8 h-8 text-emerald-500" />
              <span className="mt-2 text-base text-gray-600">Bilder auswählen</span>
              <span className="mt-1 text-sm text-gray-500">Max. 10MB pro Bild</span>
            </>
          )}
        </label>
      </div>

      {Object.entries(uploadProgress).map(([fileName, progress]) => (
        <div key={fileName} className="relative pt-1">
          <div className="flex mb-2 items-center justify-between">
            <div>
              <span className="text-xs font-semibold inline-block text-emerald-600">
                {fileName}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold inline-block text-emerald-600">
                {Math.round(progress)}%
              </span>
            </div>
          </div>
          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-emerald-200">
            <div
              style={{ width: `${progress}%` }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-emerald-500 transition-all duration-300"
            />
          </div>
        </div>
      ))}
    </div>
  );
};