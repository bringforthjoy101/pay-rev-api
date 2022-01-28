import { Twilio } from 'twilio';
import config from '../../config/configSetup';
import { SendSmsDataType } from '../types';

export const sendSms = async ({ phone, text }: SendSmsDataType) => {
	const client: any = new Twilio(config.TWILLIO_ACCOUNT_SID, config.TWILLIO_AUTH_TOKEN);
	client.messages
		.create({
			body: text,
			to: phone,
			messagingServiceSid: config.TWILLIO_MESSAGE_SERVICE_ID,
			// from: '+12345678901', // From a valid Twilio number
		})
		.then((message: any) => {
			console.log(message.sid);
			return {
				status: true,
				message: `Email sent`,
			};
		});
};

export const prepareSms = async ({ phone, text }: SendSmsDataType) => {
	const _sendSms: any = await sendSms({
		phone,
		text,
	});
	return { status: _sendSms.status, message: _sendSms.message };
};
