/*************************************************************************
REVENUE HEADS TABLE
*************************************************************************/

import { DataTypes } from 'sequelize';

export default function (sequelize: any, Sequelize: any) {
	var RevenueHeads = sequelize.define(
		'revenueHeads',
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
			amount: {
				type: Sequelize.DOUBLE,
				defaultValue: 0.0,
			},
			status: {
				type: Sequelize.ENUM('active', 'inactive'),
				defaultValue: 'inactive',
			},
			mdaId: {
				type: Sequelize.UUID,
				allowNull: false,
				references: {
					model: 'mdas',
					key: 'id',
				},
			},
		},
		{
			freezeTableName: true,
		}
	);

	RevenueHeads.associate = function (models: any) {
		models.revenueHeads.belongsTo(models.mdas, { onDelete: 'cascade', targetKey: 'id', foreignKey: 'mdaId' });
	};

	return RevenueHeads;
}
