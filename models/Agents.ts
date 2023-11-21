/*************************************************************************
USERS TABLE
*************************************************************************/

import { DataTypes } from 'sequelize';

export default function (sequelize: any, Sequelize: any) {
	var Agents = sequelize.define(
		'agents',
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
				unique: true,
			},
			password: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			phone: {
				type: Sequelize.STRING,
				allowNull: false,
				unique: true,
			},
			role: Sequelize.ENUM('field', 'admin'),
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
			branchId: {
				type: Sequelize.UUID,
				allowNull: false,
				references: {
					model: 'branches',
					key: 'id',
				},
			},
			verifiedAt: Sequelize.DATE,
		},
		{
			freezeTableName: true,
		}
	);

	Agents.associate = function (models: any) {
		models.agents.belongsTo(models.businesses, { onDelete: 'cascade', targetKey: 'id', foreignKey: 'businessId' });
		models.agents.belongsTo(models.branches, { onDelete: 'cascade', targetKey: 'id', foreignKey: 'branchId' });
		models.agents.hasOne(models.agentSettings, { onDelete: 'cascade', targetKey: 'id', foreignKey: 'agentId' });
	};

	return Agents;
}
