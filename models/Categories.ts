/*************************************************************************
CATEGORIES TABLE
*************************************************************************/

export default function (sequelize: any, Sequelize: any) {
	var Categories = sequelize.define(
		'categories',
		{
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
