/*************************************************************************
PAYMENT REPORTS TABLE
*************************************************************************/

import { DataTypes } from 'sequelize';
import { AllowNull, BelongsTo, Column, DataType, Default, ForeignKey, HasMany, Model, Table } from 'sequelize-typescript';
import { Mdas } from './Mdas';
import { RevenueHeads } from './RevenueHeads';
import { Businesses } from './Businesses';

export enum PaymentReportStatus {
	INIT = 'init',
	PENDING = 'pending',
	COMPLETED = 'completed',
	FAILED = 'failed',
}

@Table({ timestamps: true, tableName: 'paymentReports' })
export class PaymentReports extends Model {
	@Column({
		primaryKey: true,
		type: DataType.UUID,
		defaultValue: DataType.UUIDV4,
	})
	id!: string;

	@AllowNull(false)
	@Column(DataType.STRING)
	payeeName!: string;

	@Column(DataType.STRING)
	payeePhone!: string;

	@Column(DataType.STRING)
	payeeEmail!: string;

	@Column(DataType.STRING)
	transRef!: string;

	@Column(DataType.STRING)
	respCode!: string;

	@Column(DataType.STRING)
	respDescription!: string;

	@Column(DataType.DOUBLE)
	amount!: number;

	@Column(DataType.STRING)
	transDate!: string;

	@Column(DataType.STRING)
	transPaylog!: string;

	@Column(DataType.STRING)
	terminal!: string;

	@Column(DataType.STRING)
	ternimalId!: string;

	@Column(DataType.STRING)
	channelName!: string;

	@Column(DataType.STRING)
	instituitionId!: string;

	@Column(DataType.STRING)
	intistitutionName!: string;

	@Column(DataType.STRING)
	branchName!: string;

	@Column(DataType.STRING)
	bankName!: string;

	@Column(DataType.STRING)
	bankCode!: string;

	@Column(DataType.STRING)
	receiptNumber!: string;

	@Column(DataType.STRING)
	collectionAccount!: string;

	@Column(DataType.STRING)
	customerPhone!: string;

	@Column(DataType.STRING)
	depositNumber!: string;

	@Column(DataType.STRING)
	itemName!: string;

	@Column(DataType.STRING)
	itemCode!: string;

	@Column(DataType.STRING)
	isReversal!: string;

	@Default(PaymentReportStatus.INIT)
	@Column(DataType.ENUM(PaymentReportStatus.INIT, PaymentReportStatus.PENDING, PaymentReportStatus.FAILED, PaymentReportStatus.COMPLETED))
	status!: PaymentReportStatus;

	@ForeignKey(() => Businesses)
	@AllowNull(false)
	@Column(DataType.UUID)
	businessId!: string;

	@ForeignKey(() => Mdas)
	@AllowNull(false)
	@Column(DataType.UUID)
	mdaId!: string;

	@ForeignKey(() => RevenueHeads)
	@AllowNull(false)
	@Column(DataType.UUID)
	revenueHeadId!: string;

	// Model Associations
	@BelongsTo(() => Businesses, { onDelete: 'CASCADE' })
	business!: Businesses;

	@BelongsTo(() => Mdas, { onDelete: 'CASCADE' })
	mda!: Mdas;

	@BelongsTo(() => RevenueHeads, { onDelete: 'CASCADE' })
	revenueHead!: RevenueHeads;
}
