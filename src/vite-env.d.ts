/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DATAFORSEO_USERNAME: string
  readonly VITE_DATAFORSEO_PASSWORD: string
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_GOOGLE_CLIENT_SECRET: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}