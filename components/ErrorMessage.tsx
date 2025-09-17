
import React from 'react';
import { Icon } from './icons';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full text-center p-4 text-telegram-hint">
      <Icon name="error" className="w-12 h-12 text-red-500 mb-4" />
      <p className="text-lg mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-6 py-2 bg-telegram-button text-telegram-button-text rounded-lg font-semibold hover:opacity-90 transition-opacity"
        >
          Try Again
        </button>
      )}
    </div>
  );
};
