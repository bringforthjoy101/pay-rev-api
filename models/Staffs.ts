/*************************************************************************
USERS TABLE
*************************************************************************/

import { DataTypes } from 'sequelize';

export default function (sequelize: any, Sequelize: any) {
	var Staffs = sequelize.define(
		'staffs',
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
			// profilePixUrl: {
			// 	type: Sequelize.STRING,
			// 	allowNull: false,
			// },
			role: {
				type: Sequelize.ENUM('field', 'admin'),
				defaultValue: 'admin',
			},
			status: {
				type: Sequelize.ENUM('active', 'inactive'),
				defaultValue: 'active',
			},
			businessId: {
				type: Sequelize.UUID,
				allowNull: false,
				references: {
					model: 'businesses',
					key: 'id',
				},
			},
			// branchId: {
			// 	type: Sequelize.UUID,
			// 	allowNull: false,
			// 	references: {
			// 		model: 'branches',
			// 		key: 'id',
			// 	},
			// },
			verifiedAt: Sequelize.DATE,
		},
		{
			freezeTableName: true,
			indexes: [
				{ unique: true, fields: ['email'] },
				{ unique: true, fields: ['phone'] },
			],
		}
	);

	Staffs.associate = function (models: any) {
		models.staffs.belongsTo(models.businesses, { onDelete: 'cascade', targetKey: 'id', foreignKey: 'businessId' });
		models.staffs.hasOne(models.staffSettings, { onDelete: 'cascade', targetKey: 'id', foreignKey: 'staffId' });
	};

	return Staffs;
}
