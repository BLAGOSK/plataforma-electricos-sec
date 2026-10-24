/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_USE_MOCKS?: string;
}

/** Inyectadas por vite.config.ts: versión de apps/web/package.json y fecha de compilación (ISO). */
declare const __APP_VERSION__: string;
declare const __APP_BUILD__: string;

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
