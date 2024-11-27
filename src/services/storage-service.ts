import { storage } from '../lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { FirebaseError } from 'firebase/app';
import { toast } from 'sonner';

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;
const UPLOAD_TIMEOUT = 60000;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const storageService = {
  async uploadFile(file: File, path: string, onProgress?: (progress: number) => void): Promise<string> {
    let retryCount = 0;
    let uploadTask: ReturnType<typeof uploadBytesResumable> | null = null;
    let timeoutId: NodeJS.Timeout | null = null;

    const cleanup = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      if (uploadTask) {
        try {
          uploadTask.cancel();
        } catch (e) {
          console.warn('Fehler beim Abbrechen des Uploads:', e);
        }
      }
    };

    const upload = async (): Promise<string> => {
      // Eindeutigen Dateinamen generieren
      const timestamp = Date.now();
      const safeFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const uniqueFilename = `${timestamp}-${safeFilename}`;
      const fullPath = `${path}/${uniqueFilename}`;
      
      // Storage-Referenz erstellen
      const storageRef = ref(storage, fullPath);

      // Metadaten setzen
      const metadata = {
        contentType: file.type,
        cacheControl: 'public,max-age=3600',
      };

      return new Promise((resolve, reject) => {
        // Upload starten
        uploadTask = uploadBytesResumable(storageRef, file, metadata);

        // Timeout setzen
        timeoutId = setTimeout(() => {
          cleanup();
          reject(new Error('Upload-Timeout erreicht'));
        }, UPLOAD_TIMEOUT);

        // Upload-Status überwachen
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            if (onProgress) {
              onProgress(progress);
            }
          },
          (error: FirebaseError) => {
            cleanup();
            reject(error);
          },
          async () => {
            cleanup();
            try {
              const downloadURL = await getDownloadURL(uploadTask!.snapshot.ref);
              resolve(downloadURL);
            } catch (error) {
              reject(new Error('Fehler beim Abrufen der Download-URL'));
            }
          }
        );
      });
    };

    // Upload mit Retry-Logik
    while (retryCount < MAX_RETRIES) {
      try {
        return await upload();
      } catch (error) {
        retryCount++;
        
        if (error instanceof FirebaseError) {
          switch (error.code) {
            case 'storage/unauthorized':
              throw new Error('Keine Berechtigung für den Upload');
            case 'storage/canceled':
              throw new Error('Upload wurde abgebrochen');
            case 'storage/retry-limit-exceeded':
              if (retryCount >= MAX_RETRIES) {
                throw new Error('Upload-Limit überschritten');
              }
              break;
            default:
              console.error('Firebase Storage Error:', error);
          }
        }

        if (retryCount >= MAX_RETRIES) {
          throw new Error(`Upload fehlgeschlagen nach ${MAX_RETRIES} Versuchen`);
        }

        // Exponentielles Backoff
        const delay = RETRY_DELAY * Math.pow(2, retryCount - 1);
        await sleep(delay);
        
        toast.info(`Upload wird wiederholt (Versuch ${retryCount + 1}/${MAX_RETRIES})`);
      }
    }

    throw new Error('Upload konnte nicht abgeschlossen werden');
  },

  async uploadWareneingangFiles(
    wareneingangId: string,
    lieferscheinFiles: File[],
    warenFiles: File[],
    onProgress?: (progress: number) => void
  ) {
    const lieferscheinUrls = await Promise.all(
      lieferscheinFiles.map(file => 
        this.uploadFile(file, `wareneingaenge/${wareneingangId}/lieferscheine`, onProgress)
      )
    );

    const warenUrls = await Promise.all(
      warenFiles.map(file => 
        this.uploadFile(file, `wareneingaenge/${wareneingangId}/waren`, onProgress)
      )
    );

    return {
      lieferscheinUrls,
      warenUrls
    };
  }
};