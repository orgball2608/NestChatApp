declare namespace NodeJS {
    interface ProcessEnv {
        MYSQL_DB_HOST?: string;
        MYSQL_DB_PORT?: string;
        MYSQL_DB_USERNAME?: string;
        MYSQL_DB_PASSWORD?: string;
        MYSQL_DB_DATABASE?: string;
        COOKIE_SECRET: string;
        AWS_ACCESS_KEY_ID: string;
        AWS_SECRET_ACCESS_KEY: string;
        AWS_PUBLIC_BUCKET_KEY: string;
        AWS_REGION: string;
    }
}
