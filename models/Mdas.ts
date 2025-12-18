/*************************************************************************
BRANCHES TABLE
*************************************************************************/

import { DataTypes } from 'sequelize';
import { AllowNull, BelongsTo, Column, DataType, Default, ForeignKey, HasMany, Model, Scopes, Table } from 'sequelize-typescript';
import { Businesses } from './Businesses';
import { RevenueHeads } from './RevenueHeads';
import { StaffMdas } from './StaffMdas';

export enum MdaStatus {
	ACTIVE = 'active',
	INACTIVE = 'inactive',
}

// @Scopes(() => ({
// 	withSecretKey: {
// 		include: ['secretKey'],
// 	},
// }))
@Table({ timestamps: true, tableName: 'mdas' })
export class Mdas extends Model {
	@Column({
		primaryKey: true,
		type: DataType.UUID,
		defaultValue: DataType.UUIDV4,
	})
	id!: string;

	@AllowNull(false)
	@Column(DataType.STRING)
	name!: string;

	@AllowNull(false)
	@Column(DataType.STRING)
	address!: string;

	@Column(DataType.STRING)
	publicKey!: string;

	@Column(DataType.STRING)
	secretKey!: string;

	@Default(MdaStatus.INACTIVE)
	@Column(DataType.ENUM(MdaStatus.INACTIVE, MdaStatus.ACTIVE))
	status!: MdaStatus;

	@ForeignKey(() => Businesses)
	@AllowNull(false)
	@Column(DataType.UUID)
	businessId!: string;

	@BelongsTo(() => Businesses, { onDelete: 'CASCADE' })
	business!: Businesses;

	@HasMany(() => RevenueHeads, { onDelete: 'CASCADE' })
	revenueHeads!: RevenueHeads[];

	@HasMany(() => StaffMdas, { onDelete: 'CASCADE' })
	staffMdas!: StaffMdas[];
}
