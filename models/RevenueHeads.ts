/*************************************************************************
REVENUE HEADS TABLE
*************************************************************************/

export default function (sequelize: any, Sequelize: any) {
	var RevenueHeads = sequelize.define(
		'revenueHeads',
		{
			name: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			amount: {
				type: Sequelize.DOUBLE,
				defaultValue: 0.0,
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

	RevenueHeads.associate = function (models: any) {
		models.revenueHeads.belongsTo(models.businesses, { onDelete: 'cascade', targetKey: 'id', foreignKey: 'businessId' });
		models.revenueHeads.belongsTo(models.branches, { onDelete: 'cascade', targetKey: 'id', foreignKey: 'branchId' });
	};

	return RevenueHeads;
}
