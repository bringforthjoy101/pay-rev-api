/*************************************************************************
AGENT SETTINGS TABLE
*************************************************************************/

export default function (sequelize: any, Sequelize: any) {
	var AgentSettings = sequelize.define(
		'agentSettings',
		{
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
