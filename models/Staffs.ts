/*************************************************************************
USERS TABLE
*************************************************************************/

import { AllowNull, BelongsTo, Column, DataType, Default, ForeignKey, HasMany, HasOne, Model, Table } from 'sequelize-typescript';
import { Roles } from './Role';
import { Businesses } from './Businesses';
import { StaffSettings } from './StaffSettings';
import { StaffMdas } from './StaffMdas';

export enum StaffStatus {
	ACTIVE = 'active',
	INACTIVE = 'inactive',
}

@Table({ timestamps: true, tableName: 'staffs' })
export class Staffs extends Model {
	@Column({
		primaryKey: true,
		type: DataType.UUID,
		defaultValue: DataType.UUIDV4,
	})
	id!: string;

	@AllowNull(false)
	@Column(DataType.STRING)
	names!: string;

	@AllowNull(false)
	@Column(DataType.STRING)
	email!: string;

	@AllowNull(false)
	@Column(DataType.STRING)
	password!: string;

	@AllowNull(false)
	@Column(DataType.STRING)
	phone!: string;

	@Column(DataType.STRING)
	imageUrl!: string;

	@Column(DataType.JSON)
	mdas: any;

	@Default(StaffStatus.INACTIVE)
	@Column(DataType.ENUM(StaffStatus.INACTIVE, StaffStatus.ACTIVE))
	status!: StaffStatus;

	@Column(DataType.DATE)
	verifiedAt?: Date;

	@ForeignKey(() => Businesses)
	@AllowNull(false)
	@Column(DataType.UUID)
	businessId!: string;

	@ForeignKey(() => Roles)
	@AllowNull(false)
	@Column(DataType.UUID)
	roleId!: string;

	@BelongsTo(() => Businesses, { onDelete: 'CASCADE' })
	business!: Businesses;

	@BelongsTo(() => Roles, { onDelete: 'CASCADE' })
	role!: Roles;

	@HasOne(() => StaffSettings, { onDelete: 'CASCADE' })
	staffSetting!: Roles;

	@HasMany(() => StaffMdas, { onDelete: 'CASCADE' })
	staffMdas!: StaffMdas[];
}
