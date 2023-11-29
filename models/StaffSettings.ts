/*************************************************************************
AGENT SETTINGS TABLE
*************************************************************************/

import { DataTypes } from 'sequelize';

export default function (sequelize: any, Sequelize: any) {
	var StaffSettings = sequelize.define(
		'staffSettings',
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

	StaffSettings.associate = function (models: any) {
		models.staffSettings.belongsTo(models.staffs, { onDelete: 'cascade', targetKey: 'id', foreignKey: 'staffId' });
	};

	return StaffSettings;
}
