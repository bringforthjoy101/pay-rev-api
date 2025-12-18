/*************************************************************************
REVENUE HEADS TABLE
*************************************************************************/

import { AllowNull, BelongsTo, Column, DataType, Default, ForeignKey, HasMany, Model, Table } from 'sequelize-typescript';
import { Invoices } from './Invoice';
import { Mdas } from './Mdas';

export enum RevenueStatus {
	ACTIVE = 'active',
	INACTIVE = 'inactive',
}
@Table({ timestamps: true, tableName: 'revenueHeads' })
export class RevenueHeads extends Model {
	@Column({
		primaryKey: true,
		type: DataType.UUID,
		defaultValue: DataType.UUIDV4,
	})
	id!: string;

	@AllowNull(false)
	@Column(DataType.STRING)
	name!: string;

	@Default(0.0)
	@Column(DataType.DOUBLE)
	amount!: number;

	@Default(false)
	@Column(DataType.BOOLEAN)
	amountEditable!: boolean;

	@Default(RevenueStatus.INACTIVE)
	@Column(DataType.ENUM(RevenueStatus.INACTIVE, RevenueStatus.ACTIVE))
	status!: RevenueStatus;

	@ForeignKey(() => Mdas)
	@AllowNull(false)
	@Column(DataType.UUID)
	mdaId!: string;

	@BelongsTo(() => Mdas, { onDelete: 'CASCADE' })
	mda!: Mdas;

	@HasMany(() => Invoices, { onDelete: 'CASCADE' })
	invoices!: Invoices[];
}
