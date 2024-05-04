import { File } from 'buffer';

export {};

declare global {
	namespace Express {
		interface Request {
			staff?: any;
			admin?: any;
			query?: any;
		}
	}
	namespace NodeJS {
		interface ProcessEnv {
			NODE_ENV: string;
			PORT: string;
			SSL: string;
			JWTSECRET: string;
			JWT_EXPIRY_TIME: string;
			DBNAME: string;
			DBUSERNAME: string;
			DBPASSWORD: string;
			DBHOST: string;
			DBPORT: string;
			DBDIALECT: string;
			MAIL_FROM: string;
			MAIL_FROM_NAME: string;
			SENDGRID_API_KEY: string;
			TWILLIO_ACCOUNT_SID: string;
			TWILLIO_AUTH_TOKEN: string;
			TWILLIO_MESSAGE_SERVICE_ID: string;
			PAYMENT_AUTH: string;
			PAYMENT_BASE_URL: string;
			PUBLIC_ROUTES: string;
			AWS_SECRETKEY: string;
			AWS_ACCESSKEY: string;
			AWS_BUCKETNAME: string;
			AWS_ACL: string;
			AWS_REGION: string;
		}
	}
}
