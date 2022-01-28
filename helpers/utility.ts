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
