import React, { useState } from 'react';
import { ArrowUpDown, Image as ImageIcon } from 'lucide-react';
import { ImagePreview } from './ImagePreview';
import type { Wareneingang, Lieferant } from '../types/types';

interface ArchivTableProps {
  wareneingaenge: Wareneingang[];
  lieferanten: Lieferant[];
}

type SortField = 'eingangsdatum' | 'lieferant' | 'chargennummer';
type SortDirection = 'asc' | 'desc';

export const ArchivTable: React.FC<ArchivTableProps> = ({ wareneingaenge, lieferanten }) => {
  const [sortField, setSortField] = useState<SortField>('eingangsdatum');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<string>('');

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const openPreview = (url: string, type: string) => {
    setPreviewUrl(url);
    setPreviewType(type);
  };

  const closePreview = () => {
    setPreviewUrl(null);
    setPreviewType('');
  };

  const sortedWareneingaenge = [...wareneingaenge].sort((a, b) => {
    let comparison = 0;
    
    switch (sortField) {
      case 'eingangsdatum':
        comparison = new Date(a.eingangsdatum).getTime() - new Date(b.eingangsdatum).getTime();
        break;
      case 'lieferant':
        const lieferantA = lieferanten.find(l => l.id === a.lieferantId)?.name || '';
        const lieferantB = lieferanten.find(l => l.id === b.lieferantId)?.name || '';
        comparison = lieferantA.localeCompare(lieferantB);
        break;
      case 'chargennummer':
        comparison = (a.chargennummer || '').localeCompare(b.chargennummer || '');
        break;
    }

    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center space-x-1 hover:text-emerald-600"
    >
      <span>{children}</span>
      <ArrowUpDown className={`w-4 h-4 ${sortField === field ? 'text-emerald-600' : 'text-gray-400'}`} />
    </button>
  );

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <SortButton field="eingangsdatum">Datum</SortButton>
            </th>
            <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <SortButton field="lieferant">Lieferant</SortButton>
            </th>
            <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <SortButton field="chargennummer">Chargennummer</SortButton>
            </th>
            <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Notizen
            </th>
            <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Bilder
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedWareneingaenge.map((wareneingang) => {
            const lieferant = lieferanten.find(l => l.id === wareneingang.lieferantId);
            const allImages = [
              ...(wareneingang.lieferscheinUrls || []).map(url => ({ url, type: 'Lieferschein' })),
              ...(wareneingang.warenUrls || []).map(url => ({ url, type: 'Ware' }))
            ];

            return (
              <tr key={wareneingang.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(wareneingang.eingangsdatum).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {lieferant?.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {wareneingang.chargennummer || '-'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  <div className="max-w-xs overflow-hidden text-ellipsis">
                    {wareneingang.notizen || '-'}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  <div className="flex flex-wrap gap-2">
                    {allImages.map((img, index) => (
                      <button
                        key={index}
                        onClick={() => openPreview(img.url, img.type)}
                        className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 hover:bg-emerald-100 text-gray-700 hover:text-emerald-700 transition-colors"
                      >
                        <ImageIcon className="w-4 h-4 mr-1" />
                        <span>{img.type} {index + 1}</span>
                      </button>
                    ))}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {previewUrl && (
        <ImagePreview
          url={previewUrl}
          type={previewType}
          onClose={closePreview}
        />
      )}

      {sortedWareneingaenge.length === 0 && (
        <p className="text-center py-4 text-gray-500">
          Keine Wareneingänge vorhanden.
        </p>
      )}
    </div>
  );
};