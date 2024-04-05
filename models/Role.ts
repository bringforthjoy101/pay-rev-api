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
			description: {
				type: Sequelize.STRING,
				allowNull: true,
			},
			permissions: {
				type: Sequelize.JSON,
				allowNull: false,
			},
		},{
			freezeTableName: true,
		});

	Role.associate = function (models: any) {
		models.roles.hasMany(models.staffs, { onDelete: 'cascade', targetKey: 'id', foreignKey: 'roleId' });
	};

	return Role;
}
