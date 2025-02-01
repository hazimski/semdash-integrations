/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DATAFORSEO_USERNAME: string
  readonly VITE_DATAFORSEO_PASSWORD: string
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
