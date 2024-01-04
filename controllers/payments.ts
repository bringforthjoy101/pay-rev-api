// Import packages
import { Request, Response } from 'express';
import { validationResult } from 'express-validator';

// Import function files
import { handleResponse, successResponse, errorResponse, randId } from '../helpers/utility';
import { PaymentLogDataType, payEnum } from '../helpers/types';
import { checkRevenueHead } from '../helpers/middlewares';
import { prepareMail } from '../helpers/mailer/mailer';
import { paymentNotifTemplateData } from '../helpers/mailer/templateData';
import { paymentNotifTemplate } from '../helpers/mailer/template';
import DB from './db';

// log payment
const logPayment = async (req: Request, res: Response) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return errorResponse(res, 'Validation Error', errors.array());
	}

	const { payeeName, payeePhone, payeeEmail, tnxRef, amount, revenueHeadId } = req.body;

	const revenueHead = await checkRevenueHead(revenueHeadId);
	if (!revenueHead.status) return errorResponse(res, 'Revenue Head Not found');

	const { mda } = revenueHead.data.dataValues;
	const { business } = mda.dataValues;

	const insertData: PaymentLogDataType = {
		payeeName,
		payeePhone,
		payeeEmail,
		transRef: tnxRef,
		amount: revenueHead.data.amount ? revenueHead.data.amount : amount,
		businessId: business.dataValues.id,
		mdaId: mda.dataValues.id,
		revenueHeadId,
	};
	try {
		const logPayment: any = await DB.paymentReports.create(insertData);
		console.log('🚀 ~ file: payments.ts:44 ~ logPayment ~ logPayment:', logPayment);
		if (logPayment) {
			// const postData = {
			// 	ReferenceNumber: insertData.transRef,
			// 	ServiceNumber: insertData.payeePhone,
			// 	Description: '',
			// 	Amount: insertData.amount,
			// 	FirstName: insertData.payeeName.split(' ')[0],
			// 	LastName: insertData.payeeName.split(' ')[1],
			// 	Email: insertData.payeeEmail,
			// 	ItemCode: 1,
			// };

			// await postPayment(postData);

			const { mailSubject, mailBody }: any = paymentNotifTemplateData({
				party: payEnum.PAYEE,
				paymentData: {
					phone: payeePhone,
					amount: insertData.amount,
					date: logPayment.createdAt,
					business: { name: business.dataValues.name, mda: mda.dataValues.name, revenue: revenueHead.data.name },
				},
			});

			// prepare and send mail
			const sendEmail = await prepareMail({
				mailRecipients: payeeEmail,
				mailSubject,
				mailBody: paymentNotifTemplate({ subject: mailSubject, body: mailBody }),
			});

			// sending email to business email
			const { _mailSubject, _mailBody }: any = paymentNotifTemplateData({
				party: payEnum.PAYER,
				paymentData: {
					phone: payeePhone,
					amount: insertData.amount,
					date: logPayment.createdAt,
					business: { name: business.dataValues.name, mda: mda.dataValues.name, revenue: revenueHead.data.name },
				},
			});

			// prepare and send mail for business
			const _sendEmail = await prepareMail({
				mailRecipients: business.dataValues.email,
				mailSubject,
				mailBody: paymentNotifTemplate({ subject: _mailSubject, body: _mailBody }),
			});

			console.log(sendEmail);
			return successResponse(res, `Payment successfully logged`, logPayment);
		}
		return errorResponse(res, `An error occured`);
	} catch (error) {
		console.log(error);
		return errorResponse(res, `An error occured - ${error}`);
	}
};

// get all branches
const getPaymentLogs = async (req: Request, res: Response) => {
	try {
		const where: any = {};
		if (req.staff) {
			where.businessId = req.staff.businessId;
		}
		const paymentLogs = await DB.paymentReports.findAll({
			where,
			include: [
				{ model: DB.businesses, attributes: { exclude: ['createdAt', 'updatedAt'] } },
				{ model: DB.mdas, attributes: { exclude: ['createdAt', 'updatedAt'] } },
				{ model: DB.revenueHeads, attributes: { exclude: ['createdAt', 'updatedAt'] } },
				{ model: DB.staffs, as: 'staff', attributes: { exclude: ['createdAt', 'updatedAt', 'password'] } },
			],
			order: [['id', 'DESC']],
		});
		console.log('🚀 ~ file: payments.ts:121 ~ getPaymentLogs ~ paymentLogs:', paymentLogs);
		if (!paymentLogs.length) return successResponse(res, `No payment report available!`, []);
		return successResponse(
			res,
			`${paymentLogs.length} Payment report${paymentLogs.length > 1 ? 's' : ''} retrived!`,
			paymentLogs.map((log: any) => {
				const { id, createdAt, payeeName, transRef, mdas, revenueHead, amount, respDescription, staff } = log;
				return {
					id,
					payeeName,
					transRef,
					description: respDescription,
					agencyName: mdas,
					revenueHead: revenueHead,
					staff: staff,
					amount,
					status: 'pending',
					createdAt,
				};
			})
		);
	} catch (error) {
		console.log(error);
		return handleResponse(res, 401, false, `An error occured - ${error}`);
	}
};

// get branch details
const getPaymentLogDetails = async (req: Request, res: Response) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return errorResponse(res, 'Validation Error', errors.array());
	}
	const { transRef } = req.params;
	try {
		const paymentLog = await DB.paymentReports.findOne({
			where: { transRef },
			include: [
				{ model: DB.businesses, attributes: { exclude: ['createdAt', 'updatedAt'] } },
				{ model: DB.branches, attributes: { exclude: ['createdAt', 'updatedAt'] } },
				{ model: DB.revenueHeads, attributes: { exclude: ['createdAt', 'updatedAt'] } },
				{ model: DB.agents, as: 'agent', attributes: { exclude: ['createdAt', 'updatedAt', 'password'] } },
			],
		});
		if (!paymentLog) return errorResponse(res, `Payment log with transRef ${transRef} not found!`);
		return successResponse(res, `Address details retrived!`, paymentLog);
	} catch (error) {
		console.log(error);
		return handleResponse(res, 401, false, `An error occured - ${error}`);
	}
};

const paymentWebhook = async (req: Request, res: Response) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return errorResponse(res, 'Validation Error', errors.array());
	}
	const {
		transRef,
		respCode,
		respDescription,
		transDate,
		transPaylog,
		terminal,
		terminalId,
		channelName,
		instituitionId,
		intistitutionName,
		branchName,
		bankName,
		bankCode,
		receiptNumber,
		collectionAccount,
		customerPhone,
		depositNumber,
		itemName,
		itemCode,
		isReversal,
	} = req.body;
	try {
		const paymentLog = await DB.paymentReports.findOne({
			where: { transRef },
			include: [{ model: DB.businesses }, { model: DB.branch }, { model: DB.revenueHeads }, { model: DB.agents, as: 'agent' }],
		});
		if (!paymentLog) return errorResponse(res, `Payment log with transRef ${transRef} not found!`);
		if (paymentLog.respCode) return errorResponse(res, `Payment log with transRef ${transRef} already updated!`);
		const updateData = {
			respCode,
			respDescription,
			transDate,
			transPaylog,
			terminal,
			terminalId,
			channelName,
			instituitionId,
			intistitutionName,
			branchName,
			bankName,
			bankCode,
			receiptNumber,
			collectionAccount,
			customerPhone,
			depositNumber,
			itemName,
			itemCode,
			isReversal,
		};
		await paymentLog.update(updateData);
		return successResponse(res, `Payment report updated!`);
	} catch (error) {
		console.log(error);
		return handleResponse(res, 401, false, `An error occured - ${error}`);
	}
};

export default {
	logPayment,
	getPaymentLogs,
	getPaymentLogDetails,
	paymentWebhook,
};
