// src/types/global.d.ts
declare global {
  interface Window {
    gtag: (
      command: 'config' | 'consent' | 'event',
      targetId: string,
      config?: Record<string, any>
    ) => void;
    dataLayer: any[];
  }
}

export {};