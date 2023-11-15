/*************************************************************************
OTP TABLE
*************************************************************************/

import { DataTypes } from "sequelize";

export default function (sequelize: any, Sequelize: any) {
	var Otp = sequelize.define(
		'otp',
		{
			id: {
				type: Sequelize.UUID,
				defaultValue: Sequelize.UUIDV4,
				primaryKey: true,
			},
			otp: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			expirationTime: {
				type: Sequelize.DATE,
				allowNull: false,
			},
			verified: {
				type: Sequelize.BOOLEAN,
				defaultValue: false,
			},
			verifiedAt: Sequelize.DATE,
		},
		{
			freezeTableName: true,
		}
	);

	return Otp;
}
