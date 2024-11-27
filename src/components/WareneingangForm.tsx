import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import type { Lieferant } from '../types/types';
import { ImageUpload } from './ImageUpload';
import { dbService } from '../services/db-service';
import { storageService } from '../services/storage-service';

interface WareneingangFormProps {
  lieferanten: Lieferant[];
  onSubmit: (data: {
    lieferantId: string;
    eingangsdatum: Date;
    chargennummer?: string;
    notizen?: string;
    lieferscheinUrls: string[];
    warenUrls: string[];
    ocrText?: string;
  }) => void;
}

export function WareneingangForm({ lieferanten, onSubmit }: WareneingangFormProps) {
  const [formData, setFormData] = useState({
    lieferantId: '',
    eingangsdatum: new Date().toISOString().split('T')[0],
    chargennummer: '',
    notizen: '',
  });
  const [warenUrls, setWarenUrls] = useState<string[]>([]);
  const [lieferscheinUrls, setLieferscheinUrls] = useState<string[]>([]);
  const [erkannterText, setErkannterText] = useState<string>('');
  const [uploadInProgress, setUploadInProgress] = useState(false);

  const generateSuggestedChargennummer = async (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    
    try {
      const dailyWareneingaenge = await dbService.getWareneingaengeForDate(date);
      const counter = (dailyWareneingaenge.length + 1).toString().padStart(2, '0');
      return `${month}${day}-${counter}`;
    } catch (error) {
      console.error('Fehler beim Generieren der Chargennummer:', error);
      return `${month}${day}-01`;
    }
  };

  useEffect(() => {
    const initializeChargennummer = async () => {
      const date = new Date(formData.eingangsdatum);
      if (!isNaN(date.getTime())) {
        const suggestedNumber = await generateSuggestedChargennummer(date);
        setFormData(prev => ({
          ...prev,
          chargennummer: suggestedNumber
        }));
      }
    };

    initializeChargennummer();
  }, [formData.eingangsdatum]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (uploadInProgress) {
      toast.error('Bitte warten Sie, bis alle Bilder hochgeladen sind.');
      return;
    }

    if (window.confirm('Möchten Sie den Wareneingang wirklich speichern?')) {
      try {
        await onSubmit({
          ...formData,
          eingangsdatum: new Date(formData.eingangsdatum),
          warenUrls,
          lieferscheinUrls,
          ocrText: erkannterText,
        });
        
        const today = new Date();
        const newChargennummer = await generateSuggestedChargennummer(today);
        
        setFormData({
          lieferantId: '',
          eingangsdatum: today.toISOString().split('T')[0],
          chargennummer: newChargennummer,
          notizen: '',
        });
        setWarenUrls([]);
        setLieferscheinUrls([]);
        setErkannterText('');

        const lieferant = lieferanten.find(l => l.id === formData.lieferantId);
        toast.success('Erfolgreich gespeichert!', {
          description: `Der Wareneingang von ${lieferant?.name} wurde erfolgreich erfasst.`,
        });
      } catch (error) {
        console.error('Fehler beim Speichern:', error);
        toast.error('Fehler beim Speichern des Wareneingangs');
      }
    }
  };

  const handleLieferscheinUpload = async (file: File, text?: string) => {
    setUploadInProgress(true);
    try {
      if (text) {
        setErkannterText(prev => {
          const newText = prev ? `${prev}\n${text}` : text;
          return newText;
        });
        
        const chargenMatch = text.match(/Charge(?:n(?:nummer)?)?[:.\s-]*([A-Z0-9-]+)/i);
        if (chargenMatch && !formData.chargennummer) {
          setFormData(prev => ({ ...prev, chargennummer: chargenMatch[1] }));
          toast.info('Chargennummer automatisch erkannt');
        }
      }

      const url = await storageService.uploadFile(file, 'lieferscheine', (progress) => {
        console.log('Upload progress:', progress);
      });

      setLieferscheinUrls(prev => [...prev, url]);
      toast.success('Lieferschein erfolgreich hochgeladen');

    } catch (error) {
      console.error('Fehler beim Upload:', error);
      if (error instanceof Error) {
        toast.error('Fehler beim Upload', {
          description: error.message
        });
      } else {
        toast.error('Unbekannter Fehler beim Upload');
      }
    } finally {
      setUploadInProgress(false);
    }
  };

  const handleWarenUpload = async (file: File) => {
    setUploadInProgress(true);
    try {
      const url = await storageService.uploadFile(file, 'waren', (progress) => {
        console.log('Upload progress:', progress);
      });

      setWarenUrls(prev => [...prev, url]);
      toast.success('Warenfoto erfolgreich hochgeladen');

    } catch (error) {
      console.error('Fehler beim Upload:', error);
      if (error instanceof Error) {
        toast.error('Fehler beim Upload', {
          description: error.message
        });
      } else {
        toast.error('Unbekannter Fehler beim Upload');
      }
    } finally {
      setUploadInProgress(false);
    }
  };

  const handleRemoveLieferschein = (url: string) => {
    setLieferscheinUrls(prev => prev.filter(u => u !== url));
  };

  const handleRemoveWare = (url: string) => {
    setWarenUrls(prev => prev.filter(u => u !== url));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div>
        <label htmlFor="lieferant" className="block text-sm font-medium text-gray-700">
          Lieferant
        </label>
        <select
          id="lieferant"
          value={formData.lieferantId}
          onChange={(e) => setFormData({ ...formData, lieferantId: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
          required
        >
          <option value="">Bitte wählen...</option>
          {lieferanten.map((lieferant) => (
            <option key={lieferant.id} value={lieferant.id}>
              {lieferant.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="eingangsdatum" className="block text-sm font-medium text-gray-700">
          Eingangsdatum
        </label>
        <input
          type="date"
          id="eingangsdatum"
          value={formData.eingangsdatum}
          onChange={(e) => setFormData({ ...formData, eingangsdatum: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
          required
        />
      </div>

      <div>
        <label htmlFor="chargennummer" className="block text-sm font-medium text-gray-700">
          Chargennummer
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <input
            type="text"
            id="chargennummer"
            value={formData.chargennummer}
            onChange={(e) => setFormData({ ...formData, chargennummer: e.target.value })}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
            placeholder="z.B. 1106-01"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-sm text-gray-500">
              Fortlaufende Nummer für heute
            </span>
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="notizen" className="block text-sm font-medium text-gray-700">
          Notizen
        </label>
        <textarea
          id="notizen"
          value={formData.notizen}
          onChange={(e) => setFormData({ ...formData, notizen: e.target.value })}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
        />
      </div>

      <div className="space-y-6">
        <ImageUpload
          label="Lieferschein (optional)"
          onImageUpload={handleLieferscheinUpload}
          withOcr={true}
          existingUrls={lieferscheinUrls}
          onRemove={handleRemoveLieferschein}
        />

        <ImageUpload
          label="Warenfotos (optional)"
          onImageUpload={handleWarenUpload}
          existingUrls={warenUrls}
          onRemove={handleRemoveWare}
        />
      </div>

      {erkannterText && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Erkannter Text (OCR)
          </label>
          <pre className="p-4 bg-gray-50 rounded-md text-sm text-gray-700 whitespace-pre-wrap">
            {erkannterText}
          </pre>
        </div>
      )}

      <div className="pt-4">
        <button
          type="submit"
          disabled={uploadInProgress}
          className={`w-full bg-emerald-600 text-white py-2 px-4 rounded-md transition-colors ${
            uploadInProgress 
              ? 'opacity-50 cursor-not-allowed' 
              : 'hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2'
          }`}
        >
          {uploadInProgress ? 'Bitte warten...' : 'Wareneingang speichern'}
        </button>
      </div>
    </form>
  );
}