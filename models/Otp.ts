/*************************************************************************
OTP TABLE
*************************************************************************/

import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({ timestamps: true, tableName: 'otp' })
export class Otp extends Model {
	@Column({
		primaryKey: true,
		type: DataType.UUID,
		defaultValue: DataType.UUIDV4,
	})
	id!: string;

	@Column({ type: DataType.STRING, allowNull: false })
	otp!: string;

	@Column({ type: DataType.DATE, allowNull: false })
	expirationTime!: Date;

	@Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
	verified!: boolean;

	@Column(DataType.DATE)
	verifiedAt?: Date;
}
