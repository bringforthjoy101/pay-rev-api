/*************************************************************************
BRANCHES TABLE
*************************************************************************/

import { DataTypes } from 'sequelize';

export default function (sequelize: any, Sequelize: any) {
	var Mdas = sequelize.define(
		'mdas',
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
			status: {
				type: Sequelize.ENUM('active', 'inactive'),
				defaultValue: 'inactive',
			},
			publicKey: { type: Sequelize.STRING },
			secretKey: { type: Sequelize.STRING },
			businessId: {
				type: Sequelize.UUID,
				allowNull: false,
				references: {
					model: 'businesses',
					key: 'id',
				},
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

	Mdas.associate = function (models: any) {
		models.mdas.hasMany(models.revenueHeads, { onDelete: 'cascade', foreignKey: 'mdaId' });
		models.mdas.belongsTo(models.businesses, { onDelete: 'cascade', targetKey: 'id', foreignKey: 'businessId' });
	};

	return Mdas;
}
