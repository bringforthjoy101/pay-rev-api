// Import packages
import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Import db & configs
import config from '../config/configSetup';
import DB from './db';

// Import function files
import { handleResponse, successResponse, errorResponse, otpValidity } from '../helpers/utility';
import { RegisterDataType, TokenDataType, typeEnum, VerifyOtpDataType, FnResponseDataType, ChangePasswordDataType, StaffRegisterDataType } from '../helpers/types';
import { activateAccount, login, sendOtp } from '../helpers/auth';
import { checkBusiness } from '../helpers/middlewares';
import { getAccountTemplateData, getOtpTemplateData } from '../helpers/mailer/templateData';
import { prepareMail } from '../helpers/mailer/mailer';
import { otpMailTemplate } from '../helpers/mailer/template';

export const register = async (req: Request, res: Response) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return errorResponse(res, 'Validation Error', errors.array());
	}

	const { names, phone, email, password, businessId } = req.body;

	const business = await checkBusiness(businessId);
	if (!business.status) return errorResponse(res, 'Business Not found');

	//Hash password
	const salt: string = await bcrypt.genSalt(15);
	const hashPassword: string = await bcrypt.hash(password, salt);

	let insertData: RegisterDataType = { names, phone, email, password: hashPassword, businessId };

	try {
		const staffExists: any = await DB.staffs.findOne({ where: { email }, attributes: { exclude: ['createdAt', 'updatedAt'] } });

		// if staff exists, stop the process and return a message
		if (staffExists) return handleResponse(res, 400, false, `staff with email ${email} already exists`);

		const staff: any = await DB.staffs.create(insertData);

		if (staff) {
			await DB.staffSettings.create({ staffId: staff.dataValues.id });
			// let payload: AuthPayloadDataType = {
			// 	id: staff.id,
			// 	names,
			// 	phone,
			// 	email,
			// };
			// const token: string = jwt.sign(payload, config.JWTSECRET);
			// const data: TokenDataType = { type: 'token', token, staff: payload };
			// await sendOtp({ email, type: typeEnum.VERIFICATION });
			return handleResponse(res, 200, true, `Registration successful`);
		} else {
			return handleResponse(res, 401, false, `An error occurred`);
		}
	} catch (error) {
		console.log(error);
		return handleResponse(res, 401, false, `An error occurred - ${error}`);
	}
};

export const addAccount = async (req: Request, res: Response) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return errorResponse(res, 'Validation Error', errors.array());
	}

	const { names, phone, email, businessId, roleId } = req.body;

	const business = await checkBusiness(businessId);
	if (!business.status) return errorResponse(res, 'Business Not found');

	//Hash password
	const password = 'welcome2024';
	const salt: string = await bcrypt.genSalt(15);
	const hashPassword: string = await bcrypt.hash(password, salt);

	let insertData: StaffRegisterDataType = { names, phone, email, password: hashPassword, businessId, roleId, };

	try {
		const staffExists: any = await DB.staffs.findOne({ where: { email }, attributes: { exclude: ['createdAt', 'updatedAt'] } });

		// if staff exists, stop the process and return a message
		if (staffExists) return handleResponse(res, 400, false, `staff with email ${email} already exists`);

		const staff: any = await DB.staffs.create(insertData);

		if (staff) {
			await DB.staffSettings.create({ staffId: staff.dataValues.id });

			const emailBody = `
			Dear ${names},
		
			Your new account has been created successfully! Here are your login details:
		
			Email: ${email}
			Password: ${password}
		
			Please make sure to change your password after your first login for security purposes.
		
		  `;
			const { mailSubject, mailBody } = getAccountTemplateData(emailBody);

		// prepare and send mail
		const sendEmail = await prepareMail({
			mailRecipients: email,
			mailSubject,
			mailBody: otpMailTemplate({ subject: mailSubject, body: mailBody }),
		});
		console.log('mail sent', sendEmail);
			return handleResponse(res, 200, true, `Registration successful`);
		} else {
			return handleResponse(res, 401, false, `An error occurred`);
		}
	} catch (error) {
		console.log(error);
		return handleResponse(res, 401, false, `An error occured - ${error}`);
	}
};

export const preLogin = async (req: Request, res: Response) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return errorResponse(res, 'Validation Error', errors.array());
	}

	const { email, password } = req.body;

	try {
		const staff = await DB.staffs.findOne({
			where: { email },
			attributes: { exclude: ['createdAt', 'updatedAt'] },
			include: { model: DB.staffSettings, attributes: { exclude: ['createdAt', 'updatedAt'] } },
		});

		if (staff) {
			const TwoFaSettings = staff.staffSetting.dataValues.twoFa;
			if (TwoFaSettings) {
				const sendOtpResponse: FnResponseDataType = await sendOtp({ email, password, type: typeEnum.TWOFA });
				if (!sendOtpResponse.status) return errorResponse(res, sendOtpResponse.message);
				const data: TokenDataType = { type: '2fa', token: sendOtpResponse.data };
				return successResponse(res, sendOtpResponse.message, data);
			} else {
				const loginResponse: FnResponseDataType = await login({ email, password });
				if (!loginResponse.status) return errorResponse(res, loginResponse.message);
				return successResponse(res, loginResponse.message, loginResponse.data);
			}
		} else {
			return handleResponse(res, 401, false, `Incorrect Email`);
		}
	} catch (error) {
		console.log(error);
		return handleResponse(res, 401, false, `An error occured - ${error}`);
	}
};

export const updatePassword = async (req: Request, res: Response) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return errorResponse(res, 'Validation Error', errors.array());
	}

	const { email, oldPassword, newPassword } = req.body;
	try {
		const staff = await DB.staffs.findOne({ where: { email, status: 'active' }, attributes: { exclude: ['createdAt', 'updatedAt'] } });
		if (!staff) return errorResponse(res, `staff not found!`);
		const validPassword: boolean = await bcrypt.compareSync(oldPassword, staff.password);
		if (!validPassword) return errorResponse(res, `Incorrect  old password!`);
		const salt: string = await bcrypt.genSalt(15);
		const hashPassword: string = await bcrypt.hash(newPassword, salt);
		const updatedPassword: any = await staff.update({ password: hashPassword });
		if (!updatedPassword) return errorResponse(res, `Unable update password!`);
		return successResponse(res, `Password updated successfully`);
	} catch (error) {
		console.log(error);
		return errorResponse(res, `An error occured - ${error}`);
	}
};

export const resetPassword = async (req: Request, res: Response) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return errorResponse(res, 'Validation Error', errors.array());
	}

	const { email } = req.body;

	try {
		const staff = await DB.staffs.findOne({
			where: { email },
			attributes: { exclude: ['createdAt', 'updatedAt'] },
		});

		if (staff) {
			const sendOtpResponse: FnResponseDataType = await sendOtp({ email, type: typeEnum.RESET });
			if (!sendOtpResponse.status) return errorResponse(res, sendOtpResponse.message);
			return successResponse(res, sendOtpResponse.message, sendOtpResponse.data);
		} else {
			return handleResponse(res, 401, false, `Incorrect Email`);
		}
	} catch (error) {
		console.log(error);
		return handleResponse(res, 401, false, `An error occured - ${error}`);
	}
};

export const changePassword = async (req: Request, res: Response) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return errorResponse(res, 'Validation Error', errors.array());
	}
	const { token, password }: ChangePasswordDataType = req.body;

	try {
		const decoded: any = jwt.verify(token, config.JWTSECRET);
		if (!decoded) return errorResponse(res, `Invalid verification`);

		const staff = await DB.staffs.findOne({ where: { email: decoded.email, status: 'active' }, attributes: { exclude: ['createdAt', 'updatedAt'] } });
		if (!staff) return errorResponse(res, `Account Suspended!, Please contact support!`);
		const salt: string = await bcrypt.genSalt(15);
		const hashPassword: string = await bcrypt.hash(password, salt);
		const updatedPassword: any = await staff.update({ password: hashPassword });
		if (!updatedPassword) return errorResponse(res, `Unable update password!`);
		return successResponse(res, `Password changed successfully`);
	} catch (error) {
		console.log(error);
		return errorResponse(res, `An error occured - ${error}`);
	}
};

export const verifyOtp = async (req: Request, res: Response) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return errorResponse(res, 'Validation Error', errors.array());
	}
	try {
		var currentdate = new Date();
		const { token, otp, email, type }: VerifyOtpDataType = req.body;
		const decoded: any = jwt.verify(token, config.JWTSECRET);
		if (!decoded) return errorResponse(res, `Invalid verification`);

		if (decoded.email != email) return errorResponse(res, `OTP was not sent to this particular email`);

		const otpInstance = await DB.otp.findOne({ where: { id: decoded.otpId } });

		if (!otpInstance) return errorResponse(res, `OTP does not exists`);
		if (otpInstance.verified) return errorResponse(res, `OTP Already Used`);
		if (!otpValidity(otpInstance.expirationTime, currentdate)) return errorResponse(res, 'OTP Expired');
		if (otp != otpInstance.otp) return errorResponse(res, 'OTP NOT Matched');

		const updateData = { verified: true, verifiedAt: currentdate };
		await otpInstance.update(updateData);

		if (type === typeEnum.TWOFA) {
			const loginResponse: FnResponseDataType = await login({ email, password: decoded.password });
			if (!loginResponse.status) return errorResponse(res, loginResponse.message);
			return successResponse(res, 'Login Successful', loginResponse.data);
		} else if (type === typeEnum.RESET) {
			if (decoded.password) return errorResponse(res, 'Suspicious attempt discovered! Pls reset password again');
			return successResponse(res, 'OTP Matched', token);
		} else {
			const accountActivated = await activateAccount(email);
			if (!accountActivated.status) return errorResponse(res, accountActivated.message);
			return successResponse(res, 'Email verified', email);
		}
	} catch (error) {
		console.log(error);
		return errorResponse(res, `An error occured - ${error}`);
	}
};

export const updateUserSettings = async (req: Request, res: Response) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return errorResponse(res, 'Validation Error', errors.array());
	}
	const { twoFa } = req.body;
	const { id } = req.staff;

	try {
		const staff = await DB.staffs.findOne({ where: { id } });
		const updatedSettings: any = await staff.update({ twoFa });
		if (!updatedSettings) return errorResponse(res, `Unable update settings!`);
		return successResponse(res, `Settings updated successfully`);
	} catch (error) {
		console.log(error);
		return errorResponse(res, `An error occured - ${error}`);
	}
};

export const updateProfileSettings = async (req: Request, res: Response) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return errorResponse(res, 'Validation Error', errors.array());
	}
	const { names, email, phone, } = req.body;
	const { id } = req.staff;

	try {

		const profilePixUrl = "";
		
		const data = {
			names,
			email,
			phone,
			profilePixUrl,
		}
		const staff = await DB.staffs.findOne({ where: { id } });
		const updatedSettings: any = await staff.update(data);
		if (!updatedSettings) return errorResponse(res, `Unable update profile settings!`);
		return successResponse(res, `Profile settings updated successfully`);
	} catch (error) {
		console.log(error);
		return errorResponse(res, `An error occured - ${error}`);
	}
};
