import { Platform } from 'react-native';
import { APP_ENV, BASE_URL } from '@env';

type Environment = 'development' | 'staging' | 'production';

// Use environment variable from build time, fallback to development for safety
const ENV: Environment = (APP_ENV as Environment) || 'development';

const devBaseUrlFallback = Platform.OS === 'android' ? 'http://10.0.2.2:3007' : 'http://localhost:3007';

const CONFIG = {
    development: {
        baseUrl: BASE_URL || devBaseUrlFallback,
    },
    staging: {
        baseUrl: BASE_URL || 'https://api-staging.anchorage.cynotkenya.com',
    },
    production: {
        baseUrl: BASE_URL || 'https://api.anchorage.cynotkenya.com',
    },
};

export const config = CONFIG[ENV];
export const currentEnv = ENV;
export const isDev = ENV === 'development';
