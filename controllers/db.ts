// Import packages
import fs from 'fs';
import path from 'path';
import { Sequelize, Op, Dialect } from 'sequelize';

// Import configs
import config from '../config/configSetup';

let db = {} as any;
const sequelize: any = new Sequelize(config.DBNAME, config.DBUSERNAME, config.DBPASSWORD, {
	host: config.DBHOST,
	port: config.DBPORT,
	dialect: config.DBDIALECT as Dialect,
	logging: false,
});

db.Op = Op;

// load models
fs.readdirSync(__dirname + '/../models')
	.filter(function (file) {
		return file.indexOf('.') !== 0 && file !== 'index.js';
	})
	.forEach(async function (file) {
		var model = sequelize.import(path.join(__dirname + '/../models', file));
		db[model.name] = model;
	});

Object.keys(db).forEach(function (modelName) {
	if ('associate' in db[modelName]) {
		db[modelName].associate(db);
	}
});

//Sync Database
sequelize
	.sync()
	.then(async function () {})
	.catch(function (err: any) {
		console.log(err, 'Something went wrong with the Database Update!');
	});

// exports
db.Sequelize = Sequelize;
db.sequelize = sequelize;

export default db;
