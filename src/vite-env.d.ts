/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_COMMENTS_API?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
