export interface Lieferant {
  id: string;
  name: string;
  ansprechpartner: string;
  nummer: string;
  email: string;
}

export interface Wareneingang {
  id: string;
  lieferantId: string;
  eingangsdatum: Date;
  erfassungsdatum: Date;
  chargennummer?: string;
  notizen?: string;
  lieferscheinUrls?: string[];
  warenUrls?: string[];
  ocrText?: string;
  status?: 'erfasst' | 'geprüft' | 'abgeschlossen' | 'storniert';
}

export interface SearchParams {
  startDate?: Date;
  endDate?: Date;
  lieferantId?: string;
  chargennummer?: string;
  searchText?: string;
}

export interface ArchiveStats {
  total: number;
  thisMonth: number;
  thisYear: number;
}

export interface ApiError {
  message: string;
  statusCode: number;
}