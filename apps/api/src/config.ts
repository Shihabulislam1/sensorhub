const numberFrom = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return value === undefined || Number.isNaN(parsed) ? fallback : parsed;
};

export const config = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: numberFrom(process.env.API_PORT, 4000),
  database: {
    host: process.env.DB_HOST ?? 'localhost',
    port: numberFrom(process.env.DB_PORT, 5432),
    username: process.env.DB_USER ?? 'sensorhub',
    password: process.env.DB_PASSWORD ?? 'sensorhub',
    database: process.env.DB_NAME ?? 'sensorhub',
  },
} as const;
