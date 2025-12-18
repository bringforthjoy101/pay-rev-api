/*************************************************************************
AGENT SETTINGS TABLE
*************************************************************************/

import { AllowNull, Column, DataType, HasMany, Model, Table } from 'sequelize-typescript';
import { Staffs } from './Staffs';

@Table({ timestamps: true, tableName: 'roles' })
export class Roles extends Model {
	@Column({
		primaryKey: true,
		type: DataType.UUID,
		defaultValue: DataType.UUIDV4,
	})
	id!: string;

	@AllowNull(false)
	@Column(DataType.STRING)
	roleName!: string;

	@Column(DataType.TEXT)
	description!: string;

	@AllowNull(false)
	@Column(DataType.JSON)
	permissions!: any;

	@HasMany(() => Staffs, { onDelete: 'CASCADE' })
	staffs!: Staffs[];
}
