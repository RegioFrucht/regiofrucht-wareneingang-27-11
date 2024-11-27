import React from 'react';
import { Navigation } from './components/Navigation';
import { WareneingangForm } from './components/WareneingangForm';
import { LieferantForm } from './components/LieferantForm';
import { LieferantenListe } from './components/LieferantenListe';
import { ArchivTable } from './components/ArchivTable';
import { SearchForm } from './components/SearchForm';
import { LoginForm } from './components/LoginForm';
import { Package } from 'lucide-react';
import { toast } from 'sonner';
import { dbService } from './services/db-service';
import { useAuth } from './contexts/AuthContext';
import type { Lieferant, Wareneingang } from './types/types';

export default function App() {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = React.useState('wareneingang');
  const [editingLieferant, setEditingLieferant] = React.useState<Lieferant | null>(null);
  const [lieferanten, setLieferanten] = React.useState<Lieferant[]>([]);
  const [wareneingaenge, setWareneingaenge] = React.useState<Wareneingang[]>([]);
  const [filteredWareneingaenge, setFilteredWareneingaenge] = React.useState<Wareneingang[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [retryCount, setRetryCount] = React.useState(0);
  const [lastLoadAttempt, setLastLoadAttempt] = React.useState(0);

  const loadData = async () => {
    const now = Date.now();
    if (now - lastLoadAttempt < 1000) {
      return;
    }
    setLastLoadAttempt(now);

    try {
      setIsLoading(true);
      setError(null);

      const [loadedLieferanten, loadedWareneingaenge] = await Promise.all([
        dbService.getLieferanten(),
        dbService.getWareneingaenge()
      ]);

      if (!loadedLieferanten || !loadedWareneingaenge) {
        throw new Error('Keine Daten verfügbar');
      }

      setLieferanten(loadedLieferanten);
      setWareneingaenge(loadedWareneingaenge);
      setFilteredWareneingaenge(loadedWareneingaenge);
      setRetryCount(0);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler beim Laden der Daten';
      console.error('Fehler beim Laden der Daten:', error);
      setError(errorMessage);
      
      if (retryCount === 0) {
        toast.error('Fehler beim Laden der Daten', {
          description: errorMessage
        });
      }

      if (retryCount < 3) {
        const timeout = Math.pow(2, retryCount) * 1000;
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          loadData();
        }, timeout);
      }
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  if (!user) {
    return <LoginForm />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <div className="flex items-center justify-center mb-4">
            <AlertCircle className="h-12 w-12 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-center mb-4">Verbindungsfehler</h2>
          <p className="text-gray-600 text-center mb-6">{error}</p>
          <button
            onClick={() => {
              setRetryCount(0);
              loadData();
            }}
            className="w-full bg-emerald-600 text-white py-2 px-4 rounded-md hover:bg-emerald-700 transition-colors"
          >
            Erneut versuchen
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Package className="h-12 w-12 text-emerald-600 mx-auto animate-bounce" />
          <h2 className="mt-4 text-lg font-medium text-gray-900">Lade Daten...</h2>
        </div>
      </div>
    );
  }

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Erfolgreich abgemeldet');
    } catch (error) {
      toast.error('Fehler beim Abmelden');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Package className="h-8 w-8 text-emerald-600" />
              <h1 className="text-2xl font-bold text-gray-900">
                Wareneingang Obst & Gemüse
              </h1>
            </div>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              Abmelden
            </button>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
          {activeTab === 'wareneingang' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Neuer Wareneingang</h2>
              <WareneingangForm 
                lieferanten={lieferanten} 
                onSubmit={async (data) => {
                  try {
                    const newWareneingang = await dbService.addWareneingang(data);
                    setWareneingaenge(prev => [newWareneingang, ...prev]);
                    setFilteredWareneingaenge(prev => [newWareneingang, ...prev]);
                    toast.success('Wareneingang erfolgreich erfasst');
                  } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler';
                    toast.error('Fehler beim Erfassen des Wareneingangs', {
                      description: errorMessage
                    });
                  }
                }}
              />
            </div>
          )}
          
          {activeTab === 'lieferanten' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">
                {editingLieferant ? 'Lieferant bearbeiten' : 'Neuer Lieferant'}
              </h2>
              <LieferantForm 
                onSubmit={async (data) => {
                  try {
                    if (editingLieferant) {
                      await dbService.updateLieferant(editingLieferant.id, data);
                      setLieferanten(prev => prev.map(l => 
                        l.id === editingLieferant.id ? { ...data, id: editingLieferant.id } : l
                      ));
                      setEditingLieferant(null);
                      toast.success('Lieferant erfolgreich aktualisiert');
                    } else {
                      const newLieferant = await dbService.addLieferant(data);
                      setLieferanten(prev => [...prev, newLieferant]);
                      toast.success('Lieferant erfolgreich angelegt');
                    }
                  } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler';
                    toast.error(editingLieferant ? 'Fehler beim Aktualisieren' : 'Fehler beim Anlegen', {
                      description: errorMessage
                    });
                  }
                }}
                initialData={editingLieferant || undefined}
                onCancel={editingLieferant ? () => setEditingLieferant(null) : undefined}
                isEditing={!!editingLieferant}
              />
              
              <LieferantenListe 
                lieferanten={lieferanten}
                onEdit={setEditingLieferant}
                onDelete={async (lieferant) => {
                  try {
                    await dbService.deleteLieferant(lieferant.id);
                    setLieferanten(prev => prev.filter(l => l.id !== lieferant.id));
                    toast.success('Lieferant erfolgreich gelöscht');
                  } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler';
                    toast.error('Fehler beim Löschen', {
                      description: errorMessage
                    });
                  }
                }}
              />
            </div>
          )}
          
          {activeTab === 'archiv' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Archiv</h2>
              <ArchivTable 
                wareneingaenge={wareneingaenge}
                lieferanten={lieferanten}
              />
            </div>
          )}
          
          {activeTab === 'suche' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Suche</h2>
              <SearchForm 
                wareneingaenge={wareneingaenge}
                lieferanten={lieferanten}
                onSearch={setFilteredWareneingaenge}
              />
              <div className="mt-6">
                <ArchivTable 
                  wareneingaenge={filteredWareneingaenge}
                  lieferanten={lieferanten}
                />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}