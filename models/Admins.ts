/*************************************************************************
ADMINS TABLE
*************************************************************************/

import { DataTypes } from 'sequelize';

export default (sequelize: any, Sequelize: any) => {
	var Admins = sequelize.define(
		'admins',
		{
			id: {
				type: Sequelize.UUID,
				defaultValue: Sequelize.UUIDV4,
				primaryKey: true,
			},
			names: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			email: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			password: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			phone: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			role: {
				type: Sequelize.ENUM('support', 'control'),
				defaultValue: 'support',
			},
			status: {
				type: Sequelize.ENUM('active', 'inactive', 'suspended'),
				defaultValue: 'inactive',
			},
			lastLogin: Sequelize.DATE,
		},
		{
			freezeTableName: true,
			indexes: [
				{ unique: true, fields: ['email'] },
				{ unique: true, fields: ['phone'] },
			],
		}
	);

	Admins.associate = (models: any) => {};

	return Admins;
};
