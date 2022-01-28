import moment from 'moment';
// Import types
import { GetOtpTemplateDataType, PaymentNotifTemplateDataType, typeEnum, payEnum } from '../types';
import { formatCurrency } from '../utility';

export const getOtpTemplateData = ({ otp, type }: GetOtpTemplateDataType) => {
	if (type === typeEnum.VERIFICATION) {
		return {
			mailSubject: 'Email Verification',
			mailBody: `
				<p>OTP for your email verification is :</p>
				<p>${otp}</p>
				<p>This Otp is valid for only 10 minutes</p>
			`,
		};
	} else if (type === typeEnum.RESET) {
		return {
			mailSubject: 'Password Reset',
			mailBody: `
				<p>OTP for your password reset request is :</p>
				<p>${otp}</p>
				<p>This Otp is valid for only 10 minutes</p>
			`,
		};
	} else {
		return {
			mailSubject: 'Two Factor Authentication',
			mailBody: `
				<p>OTP for your 2FA is :</p>
				<p>${otp}</p>
				<p>This Otp is valid for only 10 minutes</p>
			`,
		};
	}
};

export const paymentNotifTemplateData = ({ party, paymentData }: PaymentNotifTemplateDataType) => {
	const { phone, amount, date, business } = paymentData;
	if (party === payEnum.PAYEE) {
		return {
			mailSubject: 'Payment Notification',
			mailBody: `
				<p>Your payment has been succesfully processed, below are the details</p>
				<table>
					<tr>
						<td><b>Amount:- </b></td>
						<td>${formatCurrency.format(amount)}</td>
					</tr>
					<tr>
						<td><b>Phone:- </b></td>
						<td>${phone}</td>
					</tr>
					<tr>
						<td><b>Details:- </b></td>
						<td>${business.name} | ${business.branch} | ${business.revenue}</td>
					</tr>
					<tr>
						<td><b>Date:- </b></td>
						<td>${moment(date).format('LLLL')}</td>
					</tr>
				</table>
			`,
		};
	} else {
		return {
			_mailSubject: 'Payment Notification',
			_mailBody: `
				<p>A payment was received, below are the details</p>
				<table>
					<tr>
						<td><b>Amount:- </b></td>
						<td>${formatCurrency.format(amount)}</td>
					</tr>
					<tr>
						<td><b>Phone:- </b></td>
						<td>${phone}</td>
					</tr>
					<tr>
						<td><b>Details:- </b></td>
						<td>${business.name} | ${business.branch} | ${business.revenue}</td>
					</tr>
					<tr>
						<td><b>Date:- </b></td>
						<td>${moment(date).format('LLLL')}</td>
					</tr>
				</table>
			`,
		};
	}
};
