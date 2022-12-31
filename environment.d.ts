declare namespace NodeJS {
    interface ProcessEnv {
        MYSQL_DB_HOST?: string;
        MYSQL_DB_PORT?: string;
        MYSQL_DB_USERNAME?: string;
        MYSQL_DB_PASSWORD?: string;
        MYSQL_DB_DATABASE?: string;
        COOKIE_SECRET: string;
    }
}
