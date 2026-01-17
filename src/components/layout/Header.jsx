/**
 * Header Component - Apple-style app header
 */

import React from 'react';
import { Sun, Moon, LogOut, Wallet } from 'lucide-react';
import { IconButton } from '../ui/Button';

const Header = ({
  darkMode,
  onToggleDarkMode,
  onLogout,
  className = ''
}) => {
  return (
    <header
      className={`
        glass-card sticky top-0 z-40
        border-b border-gray-200/50 dark:border-gray-800/50
        safe-area-inset-top
        ${className}
      `}
    >
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-accent to-accent-light rounded-2xl flex items-center justify-center shadow-glow-accent">
              <Wallet size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                FinApp
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Finanzas Personales
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Dark Mode Toggle */}
            <IconButton
              icon={darkMode ? Sun : Moon}
              onClick={onToggleDarkMode}
              variant="solid"
              size="md"
              aria-label={darkMode ? 'Activar modo claro' : 'Activar modo oscuro'}
            />

            {/* Logout */}
            <IconButton
              icon={LogOut}
              onClick={onLogout}
              variant="ghost"
              size="md"
              className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              aria-label="Cerrar sesion"
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
