
import { useState, useEffect } from 'react';
import type { WebApp } from '../types';

declare global {
  interface Window {
    Telegram: {
      WebApp: WebApp;
    };
  }
}

export function useTelegram() {
  const [webApp, setWebApp] = useState<WebApp | null>(null);

  useEffect(() => {
    if (window.Telegram && window.Telegram.WebApp) {
      const app = window.Telegram.WebApp;
      app.ready();
      app.expand();
      setWebApp(app);
    }
  }, []);

  return webApp;
}
