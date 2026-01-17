/**
 * Layout Component - Main app layout wrapper
 */

import React, { useState, useEffect } from 'react';
import Header from './Header';
import Navigation, { BottomTabBar } from './Navigation';

const Layout = ({
  children,
  activeTab,
  onTabChange,
  darkMode,
  onToggleDarkMode,
  onLogout,
  showBottomNav = false,
  className = ''
}) => {
  // Apply dark mode class to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div
      className={`
        min-h-screen
        bg-gradient-to-b from-gradient-start via-gradient-mid to-gradient-end
        dark:from-gray-900 dark:via-gray-900 dark:to-gray-950
        transition-colors duration-300
        ${className}
      `}
    >
      {/* Header */}
      <Header
        darkMode={darkMode}
        onToggleDarkMode={onToggleDarkMode}
        onLogout={onLogout}
      />

      {/* Navigation */}
      <Navigation
        activeTab={activeTab}
        onTabChange={onTabChange}
      />

      {/* Main Content */}
      <main
        className={`
          max-w-7xl mx-auto px-4 py-6
          ${showBottomNav ? 'pb-24 md:pb-6' : ''}
        `}
      >
        {children}
      </main>

      {/* Bottom Tab Bar (Mobile) */}
      {showBottomNav && (
        <BottomTabBar
          activeTab={activeTab}
          onTabChange={onTabChange}
        />
      )}
    </div>
  );
};

// Page Title Component
export const PageTitle = ({
  title,
  subtitle,
  action,
  className = ''
}) => (
  <div className={`flex items-center justify-between mb-6 ${className}`}>
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
        {title}
      </h2>
      {subtitle && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {subtitle}
        </p>
      )}
    </div>
    {action && (
      <div className="flex-shrink-0">
        {action}
      </div>
    )}
  </div>
);

// Section Component
export const Section = ({
  title,
  subtitle,
  icon: Icon,
  action,
  children,
  className = ''
}) => (
  <section className={`space-y-4 ${className}`}>
    {(title || action) && (
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center">
              <Icon size={20} className="text-accent" />
            </div>
          )}
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {title}
            </h3>
            {subtitle && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {action}
      </div>
    )}
    {children}
  </section>
);

// Grid Layout Component
export const Grid = ({
  cols = 1,
  gap = 6,
  children,
  className = ''
}) => {
  const colsClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  };

  const gapClasses = {
    2: 'gap-2',
    3: 'gap-3',
    4: 'gap-4',
    6: 'gap-6',
    8: 'gap-8',
  };

  return (
    <div className={`grid ${colsClasses[cols]} ${gapClasses[gap]} ${className}`}>
      {children}
    </div>
  );
};

export default Layout;
