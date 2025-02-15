function getEnvVar(key: string): string {
    const value = process.env[key]
    if (!value) {
        throw new Error(`Missing environment variable: ${key}`)
    }
    return value
}


export const SUPABASE_URL = getEnvVar('NEXT_PUBLIC_SUPABASE_URL');
export const SUPABASE_ANON_KEY = getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY');
export const SUPABASE_SERVICE_ROLE_KEY = getEnvVar('SUPABASE_SERVICE_ROLE_KEY');
export const SITE_URL = getEnvVar('NEXT_PUBLIC_SITE_URL');