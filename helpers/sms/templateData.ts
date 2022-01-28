// Import types
import { GetOtpTemplateDataType, typeEnum } from '../types';

export const getOtpTemplateData = ({ otp, type }: GetOtpTemplateDataType) => {
	if (type === typeEnum.VERIFICATION) {
		return {
			mailSubject: 'Email Verification',
			mailBody: `
				OTP for your email verification is :\n
				${otp}\n
				This Otp is valid for only 10 minutes\n
			`,
		};
	} else if (type === typeEnum.RESET) {
		return {
			mailSubject: 'Password Reset',
			mailBody: `
				OTP for your password reset request is :\n
				${otp}\n
				This Otp is valid for only 10 minutes\n
			`,
		};
	} else {
		return {
			mailSubject: 'Two Factor Authentication',
			mailBody: `
				OTP for your 2FA is :\n
				${otp}\n
				This Otp is valid for only 10 minutes
			`,
		};
	}
};
