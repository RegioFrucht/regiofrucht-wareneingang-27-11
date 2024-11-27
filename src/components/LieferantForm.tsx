import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import type { Lieferant } from '../types/types';

interface LieferantFormProps {
  onSubmit: (lieferant: Omit<Lieferant, 'id'>) => Promise<void>;
  initialData?: Lieferant;
  onCancel?: () => void;
  isEditing?: boolean;
}

export const LieferantForm = ({ onSubmit, initialData, onCancel, isEditing = false }: LieferantFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    ansprechpartner: '',
    nummer: '',
    email: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        ansprechpartner: initialData.ansprechpartner,
        nummer: initialData.nummer,
        email: initialData.email,
      });
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      
      await onSubmit(formData);
      
      if (!isEditing) {
        setFormData({ name: '', ansprechpartner: '', nummer: '', email: '' });
      }
      
      toast.success(isEditing ? 'Lieferant erfolgreich aktualisiert' : 'Lieferant erfolgreich angelegt');
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
      toast.error('Fehler beim Speichern', {
        description: error instanceof Error ? error.message : 'Unbekannter Fehler'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Name
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
          required
          disabled={isSubmitting}
        />
      </div>
      
      <div>
        <label htmlFor="ansprechpartner" className="block text-sm font-medium text-gray-700">
          Ansprechpartner
        </label>
        <input
          type="text"
          id="ansprechpartner"
          value={formData.ansprechpartner}
          onChange={(e) => setFormData({ ...formData, ansprechpartner: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
          required
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label htmlFor="nummer" className="block text-sm font-medium text-gray-700">
          Nummer
        </label>
        <input
          type="text"
          id="nummer"
          value={formData.nummer}
          onChange={(e) => setFormData({ ...formData, nummer: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
          required
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          E-Mail
        </label>
        <input
          type="email"
          id="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
          required
          disabled={isSubmitting}
        />
      </div>

      <div className="flex space-x-4 pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className={`flex-1 bg-emerald-600 text-white py-2 px-4 rounded-md transition-colors ${
            isSubmitting 
              ? 'opacity-50 cursor-not-allowed' 
              : 'hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2'
          }`}
        >
          {isSubmitting 
            ? 'Wird gespeichert...' 
            : isEditing 
              ? 'Änderungen speichern' 
              : 'Lieferant anlegen'
          }
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Abbrechen
          </button>
        )}
      </div>
    </form>
  );
};