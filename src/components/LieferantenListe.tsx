import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import type { Lieferant } from '../types/types';

interface LieferantenListeProps {
  lieferanten: Lieferant[];
  onEdit: (lieferant: Lieferant) => void;
  onDelete: (lieferant: Lieferant) => void;
}

export const LieferantenListe = ({ lieferanten, onEdit, onDelete }: LieferantenListeProps) => {
  const handleDelete = (lieferant: Lieferant) => {
    if (window.confirm(`Möchten Sie den Lieferanten "${lieferant.name}" wirklich löschen?`)) {
      onDelete(lieferant);
    }
  };

  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold mb-4">Lieferantenliste</h3>
      <div className="grid gap-4">
        {lieferanten.map(lieferant => (
          <div key={lieferant.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium text-gray-900">{lieferant.name}</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Ansprechpartner: {lieferant.ansprechpartner}<br />
                  Nummer: {lieferant.nummer}<br />
                  Email: {lieferant.email}
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => onEdit(lieferant)}
                  className="p-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors"
                  title="Bearbeiten"
                >
                  <Pencil className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(lieferant)}
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                  title="Löschen"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {lieferanten.length === 0 && (
          <p className="text-gray-500 text-center py-4">
            Noch keine Lieferanten vorhanden.
          </p>
        )}
      </div>
    </div>
  );
};