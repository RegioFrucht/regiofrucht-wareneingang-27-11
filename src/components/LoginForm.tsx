import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { LogIn, UserPlus } from 'lucide-react';

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isRegistering) {
        if (password !== passwordConfirm) {
          toast.error('Passwörter stimmen nicht überein');
          return;
        }
        await signUp(email, password);
        toast.success('Registrierung erfolgreich');
      } else {
        await signIn(email, password);
        toast.success('Erfolgreich angemeldet');
      }
    } catch (error) {
      console.error('Auth Fehler:', error);
      toast.error(isRegistering ? 'Registrierung fehlgeschlagen' : 'Anmeldung fehlgeschlagen', {
        description: 'Bitte überprüfen Sie Ihre Eingaben'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setEmail('');
    setPassword('');
    setPasswordConfirm('');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-lg">
        <div>
          <div className="flex justify-center">
            {isRegistering ? (
              <UserPlus className="h-12 w-12 text-emerald-600" />
            ) : (
              <LogIn className="h-12 w-12 text-emerald-600" />
            )}
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Wareneingang System
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {isRegistering ? 'Neuen Account erstellen' : 'Bitte melden Sie sich an'}
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">E-Mail Adresse</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm"
                placeholder="E-Mail Adresse"
                disabled={isLoading}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Passwort</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={isRegistering ? 'new-password' : 'current-password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 ${
                  isRegistering ? '' : 'rounded-b-md'
                } focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm`}
                placeholder="Passwort"
                disabled={isLoading}
              />
            </div>
            {isRegistering && (
              <div>
                <label htmlFor="passwordConfirm" className="sr-only">
                  Passwort bestätigen
                </label>
                <input
                  id="passwordConfirm"
                  name="passwordConfirm"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm"
                  placeholder="Passwort bestätigen"
                  disabled={isLoading}
                />
              </div>
            )}
          </div>

          <div className="flex flex-col space-y-4">
            <button
              type="submit"
              disabled={isLoading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading 
                ? (isRegistering ? 'Registriere...' : 'Wird angemeldet...') 
                : (isRegistering ? 'Registrieren' : 'Anmelden')}
            </button>

            <button
              type="button"
              onClick={toggleMode}
              className="text-sm text-emerald-600 hover:text-emerald-500 focus:outline-none"
            >
              {isRegistering 
                ? 'Bereits registriert? Hier anmelden' 
                : 'Noch kein Account? Hier registrieren'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};