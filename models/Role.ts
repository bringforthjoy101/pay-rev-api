/*************************************************************************
AGENT SETTINGS TABLE
*************************************************************************/

import { DataTypes } from 'sequelize';

export default function (sequelize: any, Sequelize: any) {
	var Role = sequelize.define(
		'roles',
		{
			id: {
				type: Sequelize.UUID,
				defaultValue: Sequelize.UUIDV4,
				primaryKey: true,
			},
			roleName: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			permissions: {
				type: Sequelize.JSON,
				allowNull: false,
			},
		});

	Role.associate = function (models: any) {
		models.roles.belongsTo(models.staffs, { onDelete: 'cascade', targetKey: 'id', foreignKey: 'roleId' });
	};

	return Role;
}
