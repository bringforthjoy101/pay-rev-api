/*************************************************************************
BUSINESSES TABLE
*************************************************************************/

import { DataTypes } from 'sequelize';
import { AllowNull, Column, DataType, Default, HasMany, Model, Scopes, Table } from 'sequelize-typescript';
import { Staffs } from './Staffs';
import { Mdas } from './Mdas';
import { Categories } from './Categories';

export enum BusinessStatus {
	ACTIVE = 'active',
	INACTIVE = 'inactive',
}
@Scopes(() => ({
	withSecretKey: {
		include: ['secretKey'],
	},
}))
@Table({ timestamps: true, tableName: 'businesses' })
export class Businesses extends Model {
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

	@AllowNull(false)
	@Column(DataType.STRING)
	state!: string;

	@AllowNull(false)
	@Column(DataType.STRING)
	country!: string;

	@Column(DataType.STRING)
	email!: string;

	@Column(DataType.STRING)
	phone!: string;

	@Column(DataType.STRING)
	publicKey!: string;

	@Column(DataType.STRING)
	secretKey!: string;

	@Default(BusinessStatus.INACTIVE)
	@Column(DataType.ENUM(BusinessStatus.ACTIVE, BusinessStatus.INACTIVE))
	status!: BusinessStatus;

	// Model Associations
	@HasMany(() => Staffs, { onDelete: 'CASCADE' })
	staffs!: Staffs[];

	@HasMany(() => Mdas, { onDelete: 'CASCADE' })
	mdas!: Mdas[];

	@HasMany(() => Categories, { onDelete: 'CASCADE' })
	categories!: Categories[];
}
