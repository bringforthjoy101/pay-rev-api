/*************************************************************************
CATEGORIES TABLE
*************************************************************************/

import { DataTypes } from "sequelize";

export default function (sequelize: any, Sequelize: any) {
	var Categories = sequelize.define(
		'categories',
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
			status: {
				type: Sequelize.ENUM('active', 'inactive'),
				defaultValue: 'inactive',
			},
		},
		{
			freezeTableName: true,
		}
	);

	Categories.associate = function (models: any) {
		models.categories.belongsTo(models.businesses, { onDelete: 'cascade', targetKey: 'id', foreignKey: 'businessId' });
	};

	return Categories;
}
