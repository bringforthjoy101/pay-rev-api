/*************************************************************************
PAYMENT REPORTS TABLE
*************************************************************************/

import { DataTypes } from 'sequelize';

export default function (sequelize: any, Sequelize: any) {
	var PaymentReports = sequelize.define(
		'paymentReports',
		{
			id: {
				type: Sequelize.UUID,
				defaultValue: Sequelize.UUIDV4,
				primaryKey: true,
			},
			payeeName: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			status: {
				type: Sequelize.ENUM('init', 'pending', 'completed', 'failed'),
				defaultValue: 'init',
			},
			payeePhone: Sequelize.STRING,
			payeeEmail: Sequelize.STRING,
			transRef: Sequelize.STRING,
			respCode: Sequelize.STRING,
			respDescription: Sequelize.STRING,
			amount: Sequelize.STRING,
			transDate: Sequelize.STRING,
			transPaylog: Sequelize.STRING,
			terminal: Sequelize.STRING,
			ternimalId: Sequelize.STRING,
			channelName: Sequelize.STRING,
			instituitionId: Sequelize.STRING,
			intistitutionName: Sequelize.STRING,
			branchName: Sequelize.STRING,
			bankName: Sequelize.STRING,
			bankCode: Sequelize.STRING,
			receiptNumber: Sequelize.STRING,
			collectionAccount: Sequelize.STRING,
			customerPhone: Sequelize.STRING,
			depositNumber: Sequelize.STRING,
			itemName: Sequelize.STRING,
			itemCode: Sequelize.STRING,
			isReversal: Sequelize.STRING,
		},
		{
			freezeTableName: true,
		}
	);

	PaymentReports.associate = function (models: any) {
		models.paymentReports.belongsTo(models.businesses, { onDelete: 'cascade', targetKey: 'id', foreignKey: 'businessId' });
		models.paymentReports.belongsTo(models.mdas, { onDelete: 'cascade', targetKey: 'id', foreignKey: 'mdaId' });
		models.paymentReports.belongsTo(models.revenueHeads, { onDelete: 'cascade', targetKey: 'id', foreignKey: 'revenueHeadId' });
	};

	return PaymentReports;
}
