/*************************************************************************
BRANCHES TABLE
*************************************************************************/

import { DataTypes } from 'sequelize';
import { AllowNull, BelongsTo, Column, DataType, Default, ForeignKey, Model, Table } from 'sequelize-typescript';
import { RevenueHeads } from './RevenueHeads';

export enum InvoiceStatus {
	INIT = 'init',
	PENDING = 'pending',
	COMPLETED = 'completed',
	FAILED = 'failed',
}
@Table({ timestamps: true, tableName: 'invoices' })
export class Invoices extends Model {
	@Column({
		primaryKey: true,
		type: DataType.UUID,
		defaultValue: DataType.UUIDV4,
	})
	id!: string;

	@AllowNull(false)
	@Column(DataType.DOUBLE)
	amount!: number;

	@Column(DataType.STRING)
	invoiceId!: string;

	@Column(DataType.STRING)
	name!: string;

	@Column(DataType.STRING)
	email!: string;

	@Default(InvoiceStatus.INIT)
	@Column(DataType.ENUM(InvoiceStatus.INIT, InvoiceStatus.PENDING, InvoiceStatus.COMPLETED, InvoiceStatus.FAILED))
	status!: InvoiceStatus;

	@ForeignKey(() => RevenueHeads)
	@AllowNull(false)
	@Column(DataType.UUID)
	revenueHeadId!: string;

	@BelongsTo(() => RevenueHeads, { onDelete: 'CASCADE' })
	revenueHead!: RevenueHeads;
}
