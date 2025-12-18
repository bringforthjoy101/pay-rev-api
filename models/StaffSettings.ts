/*************************************************************************
AGENT SETTINGS TABLE
*************************************************************************/

import { DataTypes } from 'sequelize';
import { AllowNull, BelongsTo, Column, DataType, Default, ForeignKey, Model, Table } from 'sequelize-typescript';
import { Staffs } from './Staffs';

@Table({ timestamps: true, tableName: 'staffSettings' })
export class StaffSettings extends Model {
	@Column({
		primaryKey: true,
		type: DataType.UUID,
		defaultValue: DataType.UUIDV4,
	})
	id!: string;

	@Default(false)
	@Column(DataType.BOOLEAN)
	twoFa!: boolean;

	@ForeignKey(() => Staffs)
	@AllowNull(false)
	@Column(DataType.UUID)
	staffId!: string;

	@BelongsTo(() => Staffs, { onDelete: 'CASCADE' })
	staff!: Staffs;
}
