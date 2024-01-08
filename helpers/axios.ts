import axios from 'axios';

export const fpAxios = axios.create({
	baseURL: 'https://api.fountainpay.ng',
	headers: {
		Accept: 'application/json',
		'Content-Type': 'application/json',
	},
});
