// Fix: Replaced the non-resolving Vite client type reference with explicit definitions for import.meta.env.
// This resolves "Cannot find type definition file for 'vite/client'" by removing the faulty reference,
// and it fixes "Property 'env' does not exist on type 'ImportMeta'" by providing the necessary types for environment variables.
interface ImportMetaEnv {
    readonly VITE_API_BASE_URL: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
