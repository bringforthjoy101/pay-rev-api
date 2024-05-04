// Import packages
import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Import db & configs
import config from '../config/configSetup';

// Import function files
import { handleResponse, successResponse, errorResponse } from '../helpers/utility';
import { RegisterDataType, AuthPayloadDataType, TokenDataType, typeEnum, FnResponseDataType, ChangePasswordDataType } from '../helpers/types';
import { sendOtp } from '../helpers/auth';
import { Admins } from '../models/Admins';

// register or create admin
const register = async (req: Request, res: Response) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return errorResponse(res, 'Validation Error', errors.array());
	}

	const { names, phone, email, password, role } = req.body;

	//Hash password
	const salt: string = await bcrypt.genSalt(15);
	const hashPassword: string = await bcrypt.hash(password, salt);

	let insertData: RegisterDataType = { names, phone, email, role, password: hashPassword };

	try {
		const adminExists: any = await Admins.findOne({ where: { email }, attributes: { exclude: ['createdAt', 'updatedAt'] } });

		// if admin exists, stop the process and return a message
		if (adminExists) return errorResponse(res, `admin with email ${email} already exists`);

		const admin: any = await Admins.create(insertData);

		if (admin) return successResponse(res, `Registration successful`);
		return errorResponse(res, `An error occurred`);
	} catch (error) {
		console.log(error);
		return errorResponse(res, `An error occurred - ${error}`);
	}
};

// admin login
const login = async (req: Request, res: Response) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return errorResponse(res, 'Validation Error', errors.array());
	}

	const { email, password } = req.body;

	try {
		const admin = await Admins.findOne({
			where: { email },
			attributes: { exclude: ['createdAt', 'updatedAt'] },
		});

		if (admin) {
			const validPass: boolean = await bcrypt.compareSync(password, admin.password);
			if (!validPass) return errorResponse(res, 'Email or Password is incorrect!');

			if (admin.status === 'suspended') return errorResponse(res, 'Account Suspended!, Please contact control admin!');

			// Create and assign token
			let payload: AuthPayloadDataType = {
				id: admin.id,
				email,
				names: admin.names,
				phone: admin.phone,
				role: admin.role,
				status: admin.status,
				type: 'admin',
			};
			const token: string = jwt.sign(payload, config.JWTSECRET);
			const data: TokenDataType = { type: 'token', token, admin: payload };
			return successResponse(res, 'Login successful', data);
		} else {
			return handleResponse(res, 401, false, `Incorrect Email`);
		}
	} catch (error) {
		console.log(error);
		return handleResponse(res, 401, false, `An error occurred - ${error}`);
	}
};

// admin update password
const updatePassword = async (req: Request, res: Response) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return errorResponse(res, 'Validation Error', errors.array());
	}

	const { email, oldPassword, newPassword } = req.body;
	try {
		const admin = await Admins.findOne({ where: { email }, attributes: { exclude: ['createdAt', 'updatedAt'] } });
		if (!admin) return errorResponse(res, `admin not found!`);
		const validPassword: boolean = await bcrypt.compareSync(oldPassword, admin.password);
		if (!validPassword) return errorResponse(res, `Incorrect old password!`);
		const salt: string = await bcrypt.genSalt(15);
		const hashPassword: string = await bcrypt.hash(newPassword, salt);
		const updatedPassword: any = await admin.update({ password: hashPassword, status: 'active' });
		if (!updatedPassword) return errorResponse(res, `Unable update password!`);
		return successResponse(res, `Password updated successfully`);
	} catch (error) {
		console.log(error);
		return errorResponse(res, `An error occurred - ${error}`);
	}
};

// admin reset password
const resetPassword = async (req: Request, res: Response) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return errorResponse(res, 'Validation Error', errors.array());
	}
	const { email } = req.body;
	try {
		const admin = await Admins.findOne({
			where: { email },
			attributes: { exclude: ['createdAt', 'updatedAt'] },
		});
		if (admin) {
			const sendOtpResponse: FnResponseDataType = await sendOtp({ email, type: typeEnum.RESET });
			if (!sendOtpResponse.status) return errorResponse(res, sendOtpResponse.message);
			return successResponse(res, sendOtpResponse.message, sendOtpResponse.data);
		} else {
			return handleResponse(res, 401, false, `Incorrect Email`);
		}
	} catch (error) {
		console.log(error);
		return handleResponse(res, 401, false, `An error occurred - ${error}`);
	}
};

// admin change password after reset
const changePassword = async (req: Request, res: Response) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return errorResponse(res, 'Validation Error', errors.array());
	}
	const { token, password }: ChangePasswordDataType = req.body;

	try {
		const decoded: any = jwt.verify(token, config.JWTSECRET);
		if (!decoded) return errorResponse(res, `Invalid verification`);

		const admin = await Admins.findOne({ where: { email: decoded.email, status: 'active' }, attributes: { exclude: ['createdAt', 'updatedAt'] } });
		if (!admin) return errorResponse(res, `Account Suspended!, Please contact support!`);
		const salt: string = await bcrypt.genSalt(15);
		const hashPassword: string = await bcrypt.hash(password, salt);
		const updatedPassword: any = await admin.update({ password: hashPassword });
		if (!updatedPassword) return errorResponse(res, `Unable update password!`);
		return successResponse(res, `Password changed successfully`);
	} catch (error) {
		console.log(error);
		return errorResponse(res, `An error occurred - ${error}`);
	}
};

export default {
	register,
	login,
	updatePassword,
	resetPassword,
	changePassword,
};
