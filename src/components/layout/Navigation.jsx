/**
 * Navigation Component - Tab-based navigation with icons
 */

import React from 'react';
import * as Icons from 'lucide-react';
import { TABS } from '../../utils/constants';

const Navigation = ({
  activeTab,
  onTabChange,
  className = ''
}) => {
  return (
    <nav
      className={`
        glass-card sticky top-[73px] z-30
        border-b border-gray-200/50 dark:border-gray-800/50
        ${className}
      `}
    >
      <div className="max-w-7xl mx-auto">
        {/* Desktop Navigation */}
        <div className="hidden md:flex px-4 overflow-x-auto scrollbar-hide">
          {TABS.map((tab) => {
            const IconComponent = Icons[tab.iconName];
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`
                  flex items-center gap-2 px-5 py-4
                  font-medium text-sm whitespace-nowrap
                  border-b-2 transition-all duration-200
                  ${isActive
                    ? 'text-accent border-accent'
                    : 'text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-gray-300'
                  }
                `}
              >
                {IconComponent && (
                  <IconComponent
                    size={18}
                    className={isActive ? 'text-accent' : ''}
                  />
                )}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Mobile Navigation - Scrollable */}
        <div className="md:hidden overflow-x-auto scrollbar-hide">
          <div className="flex px-2 py-2 gap-1 min-w-max">
            {TABS.map((tab) => {
              const IconComponent = Icons[tab.iconName];
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`
                    flex items-center gap-2 px-4 py-2.5
                    font-medium text-sm whitespace-nowrap
                    rounded-xl transition-all duration-200
                    ${isActive
                      ? 'bg-accent/10 text-accent'
                      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }
                  `}
                >
                  {IconComponent && (
                    <IconComponent size={18} />
                  )}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

// Bottom Tab Bar for Mobile (alternative navigation)
export const BottomTabBar = ({
  activeTab,
  onTabChange,
  className = ''
}) => {
  // Show only main tabs on mobile bottom bar
  const mainTabs = TABS.slice(0, 5);

  return (
    <nav
      className={`
        fixed bottom-0 left-0 right-0
        glass-card border-t border-gray-200/50 dark:border-gray-800/50
        safe-area-inset-bottom
        md:hidden z-40
        ${className}
      `}
    >
      <div className="flex items-center justify-around px-2 py-2">
        {mainTabs.map((tab) => {
          const IconComponent = Icons[tab.iconName];
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                flex flex-col items-center gap-1 px-3 py-2
                min-w-[60px] rounded-xl
                transition-all duration-200
                ${isActive
                  ? 'text-accent'
                  : 'text-gray-400 dark:text-gray-500'
                }
              `}
            >
              {IconComponent && (
                <IconComponent
                  size={22}
                  className={isActive ? 'text-accent' : ''}
                />
              )}
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default Navigation;
