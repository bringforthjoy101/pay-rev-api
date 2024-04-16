/*************************************************************************
BRANCHES TABLE
*************************************************************************/

import { DataTypes } from 'sequelize';

export default function (sequelize: any, Sequelize: any) {
	var Invoice = sequelize.define(
		'invoices',
		{
			id: {
				type: Sequelize.UUID,
				defaultValue: Sequelize.UUIDV4,
				primaryKey: true,
			},
			amount: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			revenueHeadId: {
				type: Sequelize.UUID,
				allowNull: false,
				references: {
					model: 'revenueHeads',
					key: 'id',
				},
			},
			status: {
				type: Sequelize.ENUM('init', 'pending', 'completed', 'failed'),
				defaultValue: 'init',
			},
			invoiceId: {
				type: Sequelize.STRING,
				allowNull: true,
			},
			name: {
				type: Sequelize.STRING,
				allowNull: true,
			},
			email: {
				type: Sequelize.STRING,
				allowNull: true,
			},
		},
		{
			freezeTableName: true,
		}
	);

	Invoice.associate = function (models: any) {
		models.invoices.belongsTo(models.revenueHeads, { onDelete: 'cascade', targetKey: 'id', foreignKey: 'revenueHeadId' });
	};

	return Invoice;
}
