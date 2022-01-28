// Import packages
import sgMail from '@sendgrid/mail';

// Import configs
import config from '../../config/configSetup';

// Import function files
import { SendMailDataType, PrepareMailDataType } from '../types';

export const sendMail = async ({ mailRecipients, mailSubject, mailBody, mailAttachments }: SendMailDataType) => {
	try {
		sgMail.setApiKey(config.SENDGRID_API_KEY);

		const msg = {
			to: mailRecipients,
			from: `${config.MAIL_FROM_NAME} <${config.MAIL_FROM}>`,
			subject: mailSubject,
			html: mailBody,
		};

		sgMail.send(msg).then(
			() => {
				console.log(`Email sent to ${mailRecipients}`);
			},
			(error) => {
				console.error('hello', error);
				return {
					status: false,
					message: `Email not sent ${error}`,
				};
			}
		);
		return {
			status: true,
			message: `Email sent successfully to ${mailRecipients}`,
		};
	} catch (error) {
		console.log(error);
		return {
			status: false,
			message: `Email not sent ${error}`,
			email: mailRecipients,
		};
	}
};

export const prepareMail = async ({ mailRecipients, mailSubject, mailBody }: PrepareMailDataType) => {
	const _sendMail: any = await sendMail({
		mailRecipients,
		mailSubject,
		mailBody,
	});
	return { status: _sendMail.status, message: _sendMail.message };
};
