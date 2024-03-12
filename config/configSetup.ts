import * as dotenv from 'dotenv';
dotenv.config();

type Config = {
	NODE_ENV: string;
	PORT: number;
	SSL: boolean;
	JWTSECRET: string;
	JWT_EXPIRY_TIME: string;
	DBNAME: string;
	DBUSERNAME: string;
	DBPASSWORD: string;
	DBHOST: string;
	DBPORT: number;
	DBDIALECT: string;
	MAIL_FROM: string;
	MAIL_FROM_NAME: string;
	SENDGRID_API_KEY: string;
	TWILLIO_ACCOUNT_SID: string;
	TWILLIO_AUTH_TOKEN: string;
	TWILLIO_MESSAGE_SERVICE_ID: string;
	PAYMENT_BASE_URL: string;
	PAYMENT_AUTH: string;
	PUBLIC_ROUTES: string[] | [];
};

const getConfig = (): Config => {
	return {
		NODE_ENV: process.env.NODE_ENV,
		PORT: Number(process.env.PORT),
		SSL: true,
		JWTSECRET: process.env.JWTSECRET,
		JWT_EXPIRY_TIME: process.env.JWT_EXPIRY_TIME,
		DBNAME: process.env.DBNAME,
		DBUSERNAME: process.env.DBUSERNAME,
		DBPASSWORD: process.env.DBPASSWORD,
		DBHOST: process.env.DBHOST,
		DBPORT: Number(process.env.DBPORT),
		DBDIALECT: process.env.DBDIALECT,
		MAIL_FROM: process.env.MAIL_FROM,
		MAIL_FROM_NAME: process.env.MAIL_FROM_NAME,
		SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
		TWILLIO_ACCOUNT_SID: process.env.TWILLIO_ACCOUNT_SID,
		TWILLIO_AUTH_TOKEN: process.env.TWILLIO_AUTH_TOKEN,
		TWILLIO_MESSAGE_SERVICE_ID: process.env.TWILLIO_MESSAGE_SERVICE_ID,
		PAYMENT_BASE_URL: process.env.PAYMENT_BASE_URL,
		PAYMENT_AUTH: process.env.PAYMENT_AUTH,
		PUBLIC_ROUTES: [
			'/',
			'/login',
			'/register',
			'/send-otp',
			'/verify-otp',
			'/change-password',
			'/reset-password',
			'/admin/login',
			'/admin/change-password',
			'/admin/reset-password',
			'/role/create',
			'/role',
			'/role/update/',
		],
	};
};

const getSanitzedConfig = (config: Config) => {
	for (const [key, value] of Object.entries(config)) {
		if (value === undefined) {
			throw new Error(`Missing key ${key} in .env`);
		}
	}
	return config as Config;
};

const config = getConfig();
const sanitizedConfig = getSanitzedConfig(config);

export default sanitizedConfig;
