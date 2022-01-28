import axios from 'axios';
import config from '../config/configSetup';

const reqConfig = (url: string, method: 'POST' | 'GET', data: any = null) => {
	console.log(method);
	return {
		method,
		url: `${config.PAYMENT_BASE_URL}${url}`,
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${config.PAYMENT_AUTH}`,
		},
		data,
	};
};

export const postPayment = async (data: any) => {
	const res = await axios(reqConfig('/api/ph-backend/process-payment/bookonhold', 'POST', data));
	console.log(res.data);
	return res.data;
};
