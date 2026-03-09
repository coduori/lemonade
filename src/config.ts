import { Platform } from 'react-native';

type Environment = 'development' | 'staging' | 'production';

const ENV: Environment = 'development'; // Change this to switch environments

const devBaseUrl = Platform.OS === 'android' ? 'http://10.0.2.2:3007' : 'http://localhost:3007';

const CONFIG = {
    development: {
        baseUrl: devBaseUrl,
    },
    staging: {
        baseUrl: 'https://api-staging.anchorage.cynotkenya.com', // Placeholder staging
    },
    production: {
        baseUrl: 'https://api.anchorage.cynotkenya.com',
    },
};

export const config = CONFIG[ENV];
export const currentEnv = ENV;
