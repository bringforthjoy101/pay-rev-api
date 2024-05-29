import { AllowNull, BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { Staffs } from './Staffs';
import { Mdas } from './Mdas';

@Table({ timestamps: true, tableName: 'staffMdas' })
export class StaffMdas extends Model {
	@ForeignKey(() => Staffs)
	@AllowNull(false)
	@Column(DataType.UUID)
	staffId!: string;

	@ForeignKey(() => Mdas)
	@AllowNull(false)
	@Column(DataType.UUID)
	mdaId!: string;

	@BelongsTo(() => Staffs, { onDelete: 'CASCADE' })
	staff!: Staffs;

	@BelongsTo(() => Mdas, { onDelete: 'CASCADE' })
	mda!: Mdas;
}
