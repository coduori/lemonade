type Environment = 'development' | 'staging' | 'production';

const ENV: Environment = 'development'; // Change this to switch environments

const CONFIG = {
    development: {
        baseUrl: 'http://localhost:3007',
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
