declare namespace NodeJS {
  interface ProcessEnv {
    SESSION_NAME: string;
    SESSION_SECRET: string;
    ACCESS_TOKEN_EXPIRES_IN: string;
    REFRESH_TOKEN_EXPIRES_IN: string;
  }
}
