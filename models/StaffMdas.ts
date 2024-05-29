import { AllowNull, BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { Staffs } from './Staffs';
import { Mdas } from './Mdas';

@Table({ timestamps: true, tableName: 'staffMdas' })
export class StaffMdas extends Model {
	@ForeignKey(() => Staffs)
	@AllowNull(false)
	@Column(DataType.INTEGER)
	staffId!: number;

	@ForeignKey(() => Mdas)
	@AllowNull(false)
	@Column(DataType.INTEGER)
	mdaId!: number;

	@BelongsTo(() => Staffs, { onDelete: 'CASCADE' })
	staff!: Staffs;

	@BelongsTo(() => Mdas, { onDelete: 'CASCADE' })
	mda!: Mdas;
}
