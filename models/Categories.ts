/*************************************************************************
CATEGORIES TABLE
*************************************************************************/

import { DataTypes } from 'sequelize';
import { AllowNull, BelongsTo, Column, DataType, Default, ForeignKey, Model, Table } from 'sequelize-typescript';
import { Businesses } from './Businesses';

export enum CategoryStatus {
	ACTIVE = 'active',
	INACTIVE = 'inactive',
}
@Table({ timestamps: true, tableName: 'categories' })
export class Categories extends Model {
	@Column({
		primaryKey: true,
		type: DataType.UUID,
		defaultValue: DataType.UUIDV4,
	})
	id!: string;

	@AllowNull(false)
	@Column(DataType.STRING)
	name!: string;

	@Default(CategoryStatus.INACTIVE)
	@Column(DataType.ENUM(CategoryStatus.ACTIVE, CategoryStatus.INACTIVE))
	status!: CategoryStatus;

	@ForeignKey(() => Businesses)
	@AllowNull(false)
	@Column(DataType.UUID)
	businessId!: number;

	@BelongsTo(() => Businesses, { onDelete: 'CASCADE' })
	business!: Businesses;
}
