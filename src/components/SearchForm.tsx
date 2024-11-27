import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, Loader2 } from 'lucide-react';
import { dbService } from '../services/db-service';
import type { Wareneingang, Lieferant, SearchParams } from '../types/types';

interface SearchFormProps {
  wareneingaenge: Wareneingang[];
  lieferanten: Lieferant[];
  onSearch: (results: Wareneingang[]) => void;
}

export const SearchForm: React.FC<SearchFormProps> = ({ lieferanten, onSearch }) => {
  const [isSearching, setIsSearching] = useState(false);
  const [searchParams, setSearchParams] = useState<SearchParams>({
    startDate: undefined,
    endDate: undefined,
    lieferantId: '',
    chargennummer: '',
    searchText: ''
  });

  const handleSearch = async () => {
    setIsSearching(true);
    try {
      const results = await dbService.searchWareneingaenge(searchParams);
      onSearch(results);
    } catch (error) {
      console.error('Suchfehler:', error);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      handleSearch();
    }, 300);

    return () => clearTimeout(delaySearch);
  }, [searchParams]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Von</label>
          <input
            type="date"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
            onChange={(e) => setSearchParams(prev => ({
              ...prev,
              startDate: e.target.value ? new Date(e.target.value) : undefined
            }))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Bis</label>
          <input
            type="date"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
            onChange={(e) => setSearchParams(prev => ({
              ...prev,
              endDate: e.target.value ? new Date(e.target.value) : undefined
            }))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Lieferant</label>
          <select
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
            value={searchParams.lieferantId}
            onChange={(e) => setSearchParams(prev => ({
              ...prev,
              lieferantId: e.target.value || undefined
            }))}
          >
            <option value="">Alle Lieferanten</option>
            {lieferanten.map(lieferant => (
              <option key={lieferant.id} value={lieferant.id}>
                {lieferant.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Chargennummer</label>
          <input
            type="text"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
            value={searchParams.chargennummer || ''}
            onChange={(e) => setSearchParams(prev => ({
              ...prev,
              chargennummer: e.target.value || undefined
            }))}
          />
        </div>
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {isSearching ? (
            <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
          ) : (
            <SearchIcon className="h-5 w-5 text-gray-400" />
          )}
        </div>
        <input
          type="search"
          placeholder="Suche in allen Daten (Notizen, OCR-Text, etc.)"
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
          value={searchParams.searchText || ''}
          onChange={(e) => setSearchParams(prev => ({
            ...prev,
            searchText: e.target.value || undefined
          }))}
        />
      </div>
    </div>
  );
};