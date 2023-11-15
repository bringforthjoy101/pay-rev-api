/*************************************************************************
AGENT SETTINGS TABLE
*************************************************************************/

import { DataTypes } from 'sequelize';

export default function (sequelize: any, Sequelize: any) {
	var AgentSettings = sequelize.define(
		'agentSettings',
		{
			id: {
				type: Sequelize.UUID,
				defaultValue: Sequelize.UUIDV4,
				primaryKey: true,
			},
			twoFa: {
				type: Sequelize.BOOLEAN,
				defaultValue: false,
				allowNull: false,
			},
		},
		{
			freezeTableName: true,
		}
	);

	AgentSettings.associate = function (models: any) {
		models.agentSettings.belongsTo(models.agents, { onDelete: 'cascade', targetKey: 'id', foreignKey: 'agentId' });
	};

	return AgentSettings;
}
