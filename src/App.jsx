/**
 * Componente principal de la aplicación
 * Maneja autenticación y estado global
 */

import React, { useState } from 'react';
import AuthScreen from './components/AuthScreen.jsx';
import Dashboard from './components/Dashboard.jsx';
import Storage from './utils/storage.js';
import { MASTER_PIN } from './utils/constants.js';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState(null);

  const handleAuth = (data) => {
    setUserData(data);
    setIsAuthenticated(true);
  };

  const handleUpdateData = (newData) => {
    setUserData(newData);
    Storage.saveData(newData, MASTER_PIN);
  };

  if (!isAuthenticated) {
    return <AuthScreen onAuth={handleAuth} />;
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return <Dashboard userData={userData} onUpdateData={handleUpdateData} />;
};

export default App;
