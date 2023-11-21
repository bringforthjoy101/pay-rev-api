/*************************************************************************
BRANCHES TABLE
*************************************************************************/

import { DataTypes } from 'sequelize';

export default function (sequelize: any, Sequelize: any) {
	var Branches = sequelize.define(
		'branches',
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
		}
	);

	Branches.associate = function (models: any) {
		models.branches.hasMany(models.agents, { onDelete: 'cascade', foreignKey: 'branchId' });
		models.branches.hasMany(models.revenueHeads, { onDelete: 'cascade', foreignKey: 'branchId' });
		models.branches.belongsTo(models.businesses, { onDelete: 'cascade', targetKey: 'id', foreignKey: 'businessId' });
	};

	return Branches;
}
