interface Config {
  server: {
    port: number;
    host: string;
  };
  database: {
    uri: string;
  };
  auth: {
    jwtSecret: string;
    jwtExpiration: string;
  };
  logging: {
    level: string;
  };
}

const config: Config = {
  server: {
    port: 3001,
    host: 'localhost'
  },
  database: {
    uri: 'mongodb://localhost:27017/decur'
  },
  auth: {
    jwtSecret: 'default_secret_key_change_in_production',
    jwtExpiration: '24h'
  },
  logging: {
    level: 'info'
  }
};

export default config;