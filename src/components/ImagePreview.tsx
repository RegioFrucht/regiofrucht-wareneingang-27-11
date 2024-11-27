import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';

interface ImagePreviewProps {
  url: string;
  type: string;
  onClose: () => void;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({ url, type, onClose }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    setError(false);
    
    const img = new Image();
    img.onload = () => setIsLoading(false);
    img.onerror = () => {
      setIsLoading(false);
      setError(true);
    };
    img.src = url;
  }, [url]);

  return (
    <div 
      className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="relative bg-black rounded-lg overflow-hidden max-w-4xl w-full max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        <div className="absolute top-0 left-0 right-0 flex justify-between items-center p-4 bg-gradient-to-b from-black/50 to-transparent z-10">
          <h3 className="text-white font-medium">{type}</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="w-full h-[80vh] flex items-center justify-center p-4">
          {isLoading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
              <span className="text-white">Lade Bild...</span>
            </div>
          ) : error ? (
            <div className="text-white text-center">
              <p>Fehler beim Laden des Bildes</p>
              <p className="text-sm text-gray-400 mt-2">Bitte versuchen Sie es später erneut</p>
            </div>
          ) : (
            <img
              src={url}
              alt={`${type} Vorschau`}
              className="max-w-full max-h-full object-contain"
              onError={() => setError(true)}
            />
          )}
        </div>
      </div>
    </div>
  );
};