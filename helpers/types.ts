import { AdminRoles } from '../models/Admins';
import { Roles } from '../models/Role';

export type RegisterDataType = {
	names: string;
	phone: string;
	email: string;
	password: string;
	businessId?: string;
	branchId?: string;
	role?: string;
};

export type StaffRegisterDataType = {
	names: string;
	phone: string;
	email: string;
	password: string;
	businessId?: string;
	branchId?: string;
	roleId?: string;
	mdas?: any;
};

export type AuthPayloadDataType = {
	id: string;
	names: string;
	phone: string;
	email: string;
	status: string;
	role?: Roles | AdminRoles;
	type: string;
	businessId?: string;
};

export type TokenDataType = {
	type: 'token' | '2fa';
	token: string;
	staff?: AuthPayloadDataType;
	admin?: AuthPayloadDataType;
};

export type SendMailDataType = {
	mailRecipients: string[] | string;
	mailSubject: string;
	mailBody: string;
	mailAttachments?: string;
};

export type PrepareMailDataType = {
	mailRecipients: string[] | string;
	mailSubject: string;
	mailBody: string;
};

export type ContactUsTemplateDataType = {
	name: string;
	email: string;
	phone: string;
	subject: string;
	message: string;
};

export type SubscribeTemplateDataType = {
	firstName: string;
	email: string;
};

export type OtpDetailsDataType = {
	timestamp: Date;
	email: string;
	password?: string;
	success: boolean;
	message: string;
	otpId: number | string;
};
export enum typeEnum {
	VERIFICATION = 'verification',
	RESET = 'reset',
	ADD_ACCOUNT = 'account',
	TWOFA = '2fa',
	VALIDATE = 'validate',
}

export type SendOtpDataType = {
	email: string;
	type: typeEnum;
	password?: string;
};

export type SendOtpVerifyDataType = {
	email: string;
	type: typeEnum;
};

export type OtpMailTemplateDataType = {
	subject: string;
	body: string;
};

export type GetOtpTemplateDataType = {
	otp: number;
	type: typeEnum;
};

export type PaymentNotifTemplateDataType = {
	party: payEnum;
	paymentData: any;
};

export type VerifyOtpDataType = {
	token: string;
	otp: string;
	email: string;
	type: typeEnum;
};

export type LoginDataType = {
	email: string;
	password: string;
};

export type FnResponseDataType = {
	status: boolean;
	message: string;
	data?: any;
};

export type ChangePasswordDataType = {
	token: string;
	password: string;
};

export type SendSmsDataType = {
	phone: string[];
	text: string;
};

export type PrepareSmsDataType = {
	recipents: string;
};

export enum StaffRoles {
	FIELD = 'field',
	ADMIN = 'admin',
}

export enum ModelStatus {
	ACTIVE = 'active',
	INACTIVE = 'inactive',
}

export enum payEnum {
	PAYEE = 'payee',
	PAYER = 'payer',
}

export type BusinessDataType = {
	name: string;
	address: string;
	phone: string;
	email: string;
	state: string;
	country: string;
	status?: ModelStatus;
};

export type IdsDataType = {
	ids: string[];
};

export type MdaDataType = {
	name: string;
	address: string;
	businessId: number;
	secretKey: string;
	publicKey: string;
	status?: ModelStatus;
};

export type CategoryDataType = {
	name: string;
	businessId: number;
	status?: ModelStatus;
};

export type RevenueHeadDataType = {
	name: string;
	amount: number;
	mdaId?: number;
	status?: ModelStatus;
	amountEditable?: boolean;
};

export type PaymentLogDataType = {
	payeeName: string;
	payeePhone?: string;
	payeeEmail?: string;
	amount: number;
	transRef: string;
	businessId: number;
	mdaId: number;
	revenueHeadId: number;
};
