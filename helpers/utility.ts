import { NextFunction } from 'express';
import { FnResponseDataType } from './types';

export const handleResponse = (res: any, statusCode: number, status: boolean, message: string, data?: any) => {
	return res.status(statusCode).json({
		status,
		message,
		data,
	});
};

export const successResponse = (res: any, message: string = 'Operation successfull', data?: any) => {
	return res.status(200).json({
		status: true,
		message,
		data,
	});
};

export const errorResponse = (res: any, message: string = 'An error occured', data?: any) => {
	return res.status(400).json({
		status: false,
		message,
		data,
	});
};

export const fnResponse = ({ status, message, data }: FnResponseDataType) => {
	return { status, message, data };
};

export const generateOtp = () => {
	return Math.floor(Math.random() * 999999 + 1);
};

export const addMinutesToDate = (date: Date, minutes: number) => {
	return new Date(date.getTime() + minutes * 60000);
};

export const otpValidity = (a: Date, b: Date) => {
	if (a.getTime() > b.getTime()) return true;
	return false;
};

export const randId = () => {
	return Math.floor(Math.random() * 10000000 + 1).toString(16);
};

export const formatCurrency = Intl.NumberFormat('en-US', {
	style: 'currency',
	currency: 'NGN',
});

export const uploads = async (req: Request, res: Response, next: NextFunction) => {
	const { query }: any = req;
	if (!['profile', 'doc', 'package', 'business', undefined].includes(query.dir)) return errorResponse(res, 'invalid dir');
	next();
};

export const generateUUID = () => {
	let dt = new Date().getTime();
	const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
		const r = (dt + Math.random() * 16) % 16 | 0;
		dt = Math.floor(dt / 16);
		return (c == 'x' ? r : (r & 0x3) | 0x8).toString(16);
	});
	return uuid;
};
