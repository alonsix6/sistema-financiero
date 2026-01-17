/**
 * Modal Component - Apple-style modal with glassmorphism
 */

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children, size = 'md', icon: IconComponent }) => {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-[95vw] max-h-[95vh]'
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto animate-fade-in">
      {/* Backdrop */}
      <div className="flex items-center justify-center min-h-screen px-4 py-6">
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />

        {/* Modal Content */}
        <div
          className={`
            ${sizeClasses[size]}
            w-full
            relative
            z-10
            glass-card
            rounded-3xl
            shadow-2xl
            overflow-hidden
            animate-slide-up
          `}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center gap-3">
              {IconComponent && (
                <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center">
                  <IconComponent size={20} className="text-accent" />
                </div>
              )}
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {title}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 max-h-[70vh] overflow-y-auto">
            {children}
          </div>
        </div>
      </div>

      {/* Animation styles */}
      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-slide-up {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Modal;
