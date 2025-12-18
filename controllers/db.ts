// Import packages
import { Dialect } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';

// Import configs
import config from '../config/configSetup';
import { Admins } from '../models/Admins';
import { Businesses } from '../models/Businesses';
import { Categories } from '../models/Categories';
import { Invoices } from '../models/Invoice';
import { Mdas } from '../models/Mdas';
import { Otp } from '../models/Otp';
import { PaymentReports } from '../models/PaymentReports';
import { RevenueHeads } from '../models/RevenueHeads';
import { Roles } from '../models/Role';
import { Staffs } from '../models/Staffs';
import { StaffSettings } from '../models/StaffSettings';
import { StaffMdas } from '../models/StaffMdas';

const sequelize = new Sequelize(config.DBNAME, config.DBUSERNAME, config.DBPASSWORD, {
	host: config.DBHOST,
	port: config.DBPORT,
	dialect: 'mysql',
	logging: false,
	dialectOptions: {
		ssl: { require: true, rejectUnauthorized: false },
	},
	models: [Admins, Businesses, Categories, Invoices, Mdas, Otp, PaymentReports, RevenueHeads, Roles, Staffs, StaffSettings, StaffMdas],
});

const initDB = async () => {
	await sequelize.authenticate();
	await sequelize
		// .sync({})
		.sync({ alter: true })
		.then(async () => {
			console.log('Database connected!');
		})
		.catch(function (err: any) {
			console.log(err, 'Something went wrong with the Database Update!');
		});
};
export { sequelize, initDB };
