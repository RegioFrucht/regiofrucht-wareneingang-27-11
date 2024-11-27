import type { Lieferant, Wareneingang } from '../types/types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:7071/api';

class ApiService {
  async getLieferanten(): Promise<Lieferant[]> {
    const response = await fetch(`${API_URL}/lieferanten`);
    if (!response.ok) {
      throw new Error('Fehler beim Laden der Lieferanten');
    }
    return response.json();
  }

  async addLieferant(data: Omit<Lieferant, 'id'>): Promise<Lieferant> {
    const response = await fetch(`${API_URL}/lieferanten`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Fehler beim Speichern des Lieferanten');
    }
    return response.json();
  }

  async getWareneingaenge(): Promise<Wareneingang[]> {
    const response = await fetch(`${API_URL}/wareneingaenge`);
    if (!response.ok) {
      throw new Error('Fehler beim Laden der Wareneingänge');
    }
    return response.json();
  }

  async addWareneingang(data: Omit<Wareneingang, 'id' | 'lieferscheinUrls' | 'warenUrls'>): Promise<Wareneingang> {
    const response = await fetch(`${API_URL}/wareneingaenge`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Fehler beim Speichern des Wareneingangs');
    }
    return response.json();
  }

  async uploadFiles(wareneingangId: string, formData: FormData): Promise<void> {
    const response = await fetch(`${API_URL}/wareneingaenge/${wareneingangId}/files`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) {
      throw new Error('Fehler beim Hochladen der Dateien');
    }
  }
}

export const apiService = new ApiService();