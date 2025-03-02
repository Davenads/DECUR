import developmentConfig from './development';
import defaultConfig from './default';

// Environment-specific config
const env = process.env.NODE_ENV || 'development';

// Export the appropriate config based on the environment
const config = env === 'development' ? developmentConfig : defaultConfig;

export default config;