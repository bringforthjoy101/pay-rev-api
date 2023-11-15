/*************************************************************************
BRANCHES TABLE
*************************************************************************/

import { DataTypes } from "sequelize";

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
			state: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			lga: {
				type: Sequelize.STRING,
			},
			email: { type: Sequelize.STRING },
			phone: { type: Sequelize.STRING },
			status: {
				type: Sequelize.ENUM('active', 'inactive'),
				defaultValue: 'inactive',
			},
		},
		{
			freezeTableName: true,
		}
	);

	Branches.associate = function (models: any) {
		models.branches.hasMany(models.agents, { onDelete: 'cascade', targetKey: 'id', foreignKey: 'branchId' });
		models.branches.hasMany(models.revenueHeads, { onDelete: 'cascade', targetKey: 'id', foreignKey: 'branchId' });
		models.branches.belongsTo(models.businesses, { onDelete: 'cascade', targetKey: 'id', foreignKey: 'businessId' });
	};

	return Branches;
}
