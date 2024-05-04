/*************************************************************************
ADMINS TABLE
*************************************************************************/

import { AllowNull, Column, DataType, Default, Index, Model, Table } from 'sequelize-typescript';

export enum AdminRoles {
	SUPPORT = 'support',
	CONTROL = 'control',
}
export enum AdminStatus {
	ACTIVE = 'active',
	INACTIVE = 'inactive',
	SUSPENDED = 'suspended',
}

@Table({ timestamps: true, tableName: 'admins' })
export class Admins extends Model {
	@Column({
		primaryKey: true,
		type: DataType.UUID,
		defaultValue: DataType.UUIDV4,
	})
	id!: string;

	@AllowNull(false)
	@Column(DataType.STRING)
	names!: string;

	@Index({ name: 'admin-email-index', type: 'UNIQUE', unique: true })
	@AllowNull(false)
	@Column(DataType.STRING)
	email!: string;

	@AllowNull(false)
	@Column(DataType.STRING)
	password!: string;

	@Index({ name: 'admin-phone-index', type: 'UNIQUE', unique: true })
	@AllowNull(false)
	@Column(DataType.STRING)
	phone!: string;

	@Default(AdminRoles.SUPPORT)
	@Column(DataType.ENUM(AdminRoles.SUPPORT, AdminRoles.CONTROL))
	role!: AdminRoles;

	@Default(AdminStatus.INACTIVE)
	@Column(DataType.ENUM(AdminStatus.ACTIVE, AdminStatus.INACTIVE, AdminStatus.SUSPENDED))
	status!: AdminStatus;
}
