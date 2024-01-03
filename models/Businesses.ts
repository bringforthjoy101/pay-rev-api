/*************************************************************************
BUSINESSES TABLE
*************************************************************************/

import { DataTypes } from 'sequelize';

export default function (sequelize: any, Sequelize: any) {
	var Businesses = sequelize.define(
		'businesses',
		{
			id: {
				type: Sequelize.UUID,
				defaultValue: Sequelize.UUIDV4,
				primaryKey: true,
			},
			name: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			address: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			state: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			country: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			email: { type: Sequelize.STRING },
			phone: { type: Sequelize.STRING },
			privateKey: { type: Sequelize.STRING },
			secretKey: { type: Sequelize.STRING },
			status: {
				type: Sequelize.ENUM('active', 'inactive'),
				defaultValue: 'inactive',
			},
		},
		{
			freezeTableName: true,
			defaultScope: {
				attributes: { exclude: ['secretKey'] },
			},
			scopes: {
				withSecretKey: {
					attributes: { include: ['secretKey'] },
				},
			},
		}
	);

	Businesses.associate = function (models: any) {
		models.businesses.hasMany(models.staffs, { onDelete: 'cascade', targetKey: 'id', foreignKey: 'businessId' });
		models.businesses.hasMany(models.mdas, { onDelete: 'cascade', targetKey: 'id', foreignKey: 'businessId' });
		models.businesses.hasMany(models.categories, { onDelete: 'cascade', targetKey: 'id', foreignKey: 'businessId' });
	};

	return Businesses;
}
