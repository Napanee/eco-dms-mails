declare global {
	namespace NodeJS {
		interface ProcessEnv {
			EMAIL_PASSWORD: string;
			EMAIL_URL: string;
			EMAIL_USER: string;
			NODE_ENV: 'development' | 'test' | 'production';
			EMAIL_PORT?: string;
		}
	}
}

export {};
