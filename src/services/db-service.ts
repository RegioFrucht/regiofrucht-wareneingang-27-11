import { db } from '../lib/firebase';
import { 
  collection, 
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import type { Lieferant, Wareneingang, SearchParams } from '../types/types';

export const dbService = {
  async getLieferanten(): Promise<Lieferant[]> {
    try {
      const querySnapshot = await getDocs(collection(db, 'lieferanten'));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Lieferant));
    } catch (error) {
      console.error('Fehler beim Laden der Lieferanten:', error);
      throw new Error('Fehler beim Laden der Lieferanten');
    }
  },

  async addLieferant(data: Omit<Lieferant, 'id'>): Promise<Lieferant> {
    try {
      const docRef = await addDoc(collection(db, 'lieferanten'), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      return {
        id: docRef.id,
        ...data
      };
    } catch (error) {
      console.error('Fehler beim Anlegen des Lieferanten:', error);
      throw new Error('Fehler beim Anlegen des Lieferanten');
    }
  },

  async updateLieferant(id: string, data: Omit<Lieferant, 'id'>): Promise<void> {
    try {
      const docRef = doc(db, 'lieferanten', id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Lieferanten:', error);
      throw new Error('Fehler beim Aktualisieren des Lieferanten');
    }
  },

  async deleteLieferant(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'lieferanten', id));
    } catch (error) {
      console.error('Fehler beim Löschen des Lieferanten:', error);
      throw new Error('Fehler beim Löschen des Lieferanten');
    }
  },

  async getWareneingaenge(): Promise<Wareneingang[]> {
    try {
      const q = query(collection(db, 'wareneingaenge'), orderBy('eingangsdatum', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          eingangsdatum: data.eingangsdatum.toDate(),
          erfassungsdatum: data.erfassungsdatum.toDate()
        } as Wareneingang;
      });
    } catch (error) {
      console.error('Fehler beim Laden der Wareneingänge:', error);
      throw new Error('Fehler beim Laden der Wareneingänge');
    }
  },

  async addWareneingang(data: Omit<Wareneingang, 'id' | 'erfassungsdatum'>): Promise<Wareneingang> {
    try {
      const docRef = await addDoc(collection(db, 'wareneingaenge'), {
        ...data,
        erfassungsdatum: serverTimestamp(),
        eingangsdatum: Timestamp.fromDate(data.eingangsdatum),
        status: 'erfasst'
      });

      return {
        id: docRef.id,
        ...data,
        erfassungsdatum: new Date(),
        status: 'erfasst'
      };
    } catch (error) {
      console.error('Fehler beim Anlegen des Wareneingangs:', error);
      throw new Error('Fehler beim Anlegen des Wareneingangs');
    }
  },

  async getWareneingaengeForDate(date: Date): Promise<Wareneingang[]> {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const q = query(
        collection(db, 'wareneingaenge'),
        where('eingangsdatum', '>=', Timestamp.fromDate(startOfDay)),
        where('eingangsdatum', '<=', Timestamp.fromDate(endOfDay))
      );

      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          eingangsdatum: data.eingangsdatum.toDate(),
          erfassungsdatum: data.erfassungsdatum.toDate()
        } as Wareneingang;
      });
    } catch (error) {
      console.error('Fehler beim Laden der Wareneingänge:', error);
      throw new Error('Fehler beim Laden der Wareneingänge');
    }
  },

  async searchWareneingaenge(params: SearchParams): Promise<Wareneingang[]> {
    try {
      let q = query(collection(db, 'wareneingaenge'));
      const conditions = [];

      if (params.startDate) {
        conditions.push(where('eingangsdatum', '>=', Timestamp.fromDate(params.startDate)));
      }

      if (params.endDate) {
        conditions.push(where('eingangsdatum', '<=', Timestamp.fromDate(params.endDate)));
      }

      if (params.lieferantId) {
        conditions.push(where('lieferantId', '==', params.lieferantId));
      }

      if (params.chargennummer) {
        conditions.push(where('chargennummer', '==', params.chargennummer));
      }

      q = query(q, ...conditions, orderBy('eingangsdatum', 'desc'));
      const querySnapshot = await getDocs(q);
      
      let results = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          eingangsdatum: data.eingangsdatum.toDate(),
          erfassungsdatum: data.erfassungsdatum.toDate()
        } as Wareneingang;
      });

      if (params.searchText) {
        const searchLower = params.searchText.toLowerCase();
        results = results.filter(wareneingang => 
          wareneingang.notizen?.toLowerCase().includes(searchLower) ||
          wareneingang.ocrText?.toLowerCase().includes(searchLower)
        );
      }

      return results;
    } catch (error) {
      console.error('Fehler bei der Suche:', error);
      throw new Error('Fehler bei der Suche');
    }
  }
};