declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV?: 'development' | 'production' | 'test';
    LINE_CHANNEL_ACCESS_TOKEN: string;
    LINE_CHANNEL_SECRET: string;
    DATABASE_URL: string;
    PORT?: string;
    
    // LIFF 相關
    LIFF_ID?: string;
    LIFF_URL?: string;
    
    // 推播與排程相關
    CRON_TOKEN?: string;
    BASE_URL?: string;
    
    // PostgreSQL
    PGDATABASE?: string;
    PGHOST?: string;
    PGPORT?: string;
    PGUSER?: string;
    PGPASSWORD?: string;
  }
}