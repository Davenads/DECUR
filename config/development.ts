import defaultConfig from './default';
import { merge } from 'lodash';

const config = merge({}, defaultConfig, {
  logging: {
    level: 'debug'
  },
  server: {
    port: 3001
  }
});

export default config;