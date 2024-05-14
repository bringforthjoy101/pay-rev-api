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
// import DB from './db';
import { fpAxios } from '../helpers/axios';
import { Op, QueryTypes, Sequelize } from 'sequelize';
import sequelize from 'sequelize';
import { PaymentReportStatus, PaymentReports } from '../models/PaymentReports';
import { Businesses } from '../models/Businesses';
import { Mdas } from '../models/Mdas';
import { RevenueHeads } from '../models/RevenueHeads';

// log payment
const logPayment = async (req: Request, res: Response) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) return errorResponse(res, 'Validation Error', errors.array());

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
		const logPayment: any = await PaymentReports.create(insertData);
		console.log('logPayment:', logPayment);
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

			// sendng email to business email
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

			console.log({ sendEmail, _sendEmail });
			return successResponse(res, `Payment successfully logged`, logPayment);
		}
		return errorResponse(res, `An error occurred`);
	} catch (error) {
		console.log(error);
		return errorResponse(res, `An error occurred - ${error}`);
	}
};

// get all branches
const getPaymentLogs = async (req: Request, res: Response) => {
	try {
		const {
			page = 1,
			pageSize = '',
			status,
			payeePhone,
			payeeEmail,
			transRef,
			amount,
			mda,
			revenueHead,
			startdate,
			enddate,
			customerPhone,
		} = req.query;

		const where: {
			businessId?: string;
			status?: PaymentReportStatus;
			payeePhone?: string;
			payeeEmail?: any;
			transRef?: string;
			amount?: string;
			mdaId?: string;
			revenueHeadId?: string;
			createdAt?: any;
			customerPhone?: string;
		} = {};

		if (req.staff) where.businessId = req.staff.businessId;
		if (status) where.status = status as PaymentReportStatus;
		if (payeePhone) where.payeePhone = payeePhone as string;
		if (payeeEmail) where.payeeEmail = { [Op.like]: `%${payeeEmail}%` };
		if (transRef) where.transRef = transRef as string;
		if (amount) where.amount = amount as string;
		if (mda) where.mdaId = mda as string;
		if (revenueHead) where.revenueHeadId = revenueHead as string;
		if (startdate && enddate) where.createdAt = { [Op.between]: [startdate, enddate] };
		if (customerPhone) where.customerPhone = customerPhone as string;

		if (!pageSize) {
			const paymentLogs = await PaymentReports.findAll({
				where,
				order: [['createdAt', 'DESC']],
				include: [
					{ model: Businesses, attributes: { exclude: ['createdAt', 'updatedAt', 'publicKey', 'secretKey'] } },
					{ model: Mdas, attributes: { exclude: ['createdAt', 'updatedAt', 'publicKey', 'secretKey'] } },
					{ model: RevenueHeads, attributes: { exclude: ['createdAt', 'updatedAt'] } },
				],
			});
			if (!paymentLogs.length) return successResponse(res, `No payment report available!`, []);

			return successResponse(
				res,
				`${paymentLogs.length} Payment report${paymentLogs.length > 1 ? 's' : ''} retrieved!`,
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
		}

		const offset = (parseInt(page as string, 10) - 1) * parseInt(pageSize as string, 10);

		const { count, rows: paymentLogs } = await PaymentReports.findAndCountAll({
			where,
			order: [['createdAt', 'DESC']],
			limit: parseInt(pageSize as string, 10),
			offset: offset,
			include: [
				{ model: Businesses, attributes: { exclude: ['createdAt', 'updatedAt', 'publicKey', 'secretKey'] } },
				{ model: Mdas, attributes: { exclude: ['createdAt', 'updatedAt', 'publicKey', 'secretKey'] } },
				{ model: RevenueHeads, attributes: { exclude: ['createdAt', 'updatedAt'] } },
			],
		});
		if (!paymentLogs.length) return successResponse(res, `No payment report available!`, []);
		const totalPages = Math.ceil(count / parseInt(pageSize as string, 10));

		return successResponse(res, `${paymentLogs.length} Payment report${paymentLogs.length > 1 ? 's' : ''} retrieved!`, {
			totalPages,
			currentPage: parseInt(page as string, 10),
			data: paymentLogs.map((log: any) => {
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
			}),
		});
	} catch (error) {
		console.log(error);
		return errorResponse(res, `An error occurred - ${error}`);
	}
};

// get all branches
const getPaymentLogsByEmail = async (req: Request, res: Response) => {
	try {
		const { page = 1, pageSize = '' } = req.query;

		const { email } = req.params;

		const where: any = {};

		if (email) {
			where.payeeEmail = {
				[Op.like]: `%${email}%`,
			};
		}

		if (req.staff) {
			where.businessId = req.staff.businessId;
		}

		if (!pageSize) {
			const paymentLogs = await PaymentReports.findAll({
				where,
				order: [['createdAt', 'DESC']],
				include: [
					{ model: Businesses, attributes: { exclude: ['createdAt', 'updatedAt'] } },
					{ model: Mdas, attributes: { exclude: ['createdAt', 'updatedAt'] } },
					{ model: RevenueHeads, attributes: { exclude: ['createdAt', 'updatedAt'] } },
				],
			});
			// console.log('🚀 ~ file: payments.ts:121 ~ getPaymentLogs ~ paymentLogs:', paymentLogs);
			if (!paymentLogs.length) return successResponse(res, `No payment report available!`, []);

			return successResponse(
				res,
				`${paymentLogs.length} Payment report${paymentLogs.length > 1 ? 's' : ''} retrieved!`,
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
		}

		const offset = (parseInt(page as string, 10) - 1) * parseInt(pageSize as string, 10);

		const { count, rows: paymentLogs } = await PaymentReports.findAndCountAll({
			where,
			order: [['createdAt', 'DESC']],
			limit: parseInt(pageSize as string, 10),
			offset: offset,
			include: [
				{ model: Businesses, attributes: { exclude: ['createdAt', 'updatedAt'] } },
				{ model: Mdas, attributes: { exclude: ['createdAt', 'updatedAt'] } },
				{ model: RevenueHeads, attributes: { exclude: ['createdAt', 'updatedAt'] } },
			],
		});
		if (!paymentLogs.length) return successResponse(res, `No payment report available!`, []);
		const totalPages = Math.ceil(count / parseInt(pageSize as string, 10));

		return successResponse(res, `${paymentLogs.length} Payment report${paymentLogs.length > 1 ? 's' : ''} retrieved!`, {
			totalPages,
			currentPage: parseInt(page as string, 10),
			data: paymentLogs.map((log: any) => {
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
			}),
		});
	} catch (error) {
		console.log(error);
		return errorResponse(res, `An error occurred - ${error}`);
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
		const paymentLog = await PaymentReports.findOne({
			where: { transRef },
			include: [
				{ model: Businesses, attributes: { exclude: ['createdAt', 'updatedAt'] } },
				// { model: Branches, attributes: { exclude: ['createdAt', 'updatedAt'] } },
				{ model: RevenueHeads, attributes: { exclude: ['createdAt', 'updatedAt'] } },
				// { model: DB.agents, as: 'agent', attributes: { exclude: ['createdAt', 'updatedAt', 'password'] } },
			],
		});
		if (!paymentLog) return errorResponse(res, `Payment log with transRef ${transRef} not found!`);
		return successResponse(res, `Address details retrieved!`, paymentLog);
	} catch (error) {
		console.log(error);
		return handleResponse(res, 401, false, `An error occurred - ${error}`);
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
		const paymentLog = await PaymentReports.findOne({
			where: { transRef },
			include: [{ model: Businesses }, { model: RevenueHeads }],
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
		return handleResponse(res, 401, false, `An error occurred - ${error}`);
	}
};

const completePayment = async (req: Request, res: Response) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return errorResponse(res, 'Validation Error', errors.array());
	}
	try {
		const { tnxRef } = req.params;

		const payment: any = await PaymentReports.findOne({
			where: {
				transRef: tnxRef,
			},
			include: { model: Mdas.scope('withSecretKey') },
		});

		const encondedRef = Buffer.from(payment.mda.dataValues.secretKey).toString('base64');

		const fpResp = await fpAxios
			.get(`/transaction/verify/${tnxRef}`, {
				headers: {
					Authorization: `Basic ${encondedRef}`,
					'x-api-client': 'modal',
				},
			})
			.catch((error) => {
				throw new Error(error.response.data.message);
			});

		return successResponse(res, `Payment successfully logged`, payment);
	} catch (error) {
		return errorResponse(res, `An error occurred - ${error}`);
	}
};

const revalidatePayment = async (req: Request, res: Response) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return errorResponse(res, 'Validation Error', errors.array());
	}
	try {
		const { id } = req.params;

		const payment: any = await PaymentReports.findOne({
			where: {
				transRef: id,
			},
			include: { model: Mdas.scope('withSecretKey') },
		});

		if (!payment) return errorResponse(res, `Payment log with transRef ${id} not found!`);
		const encondedRef = Buffer.from(payment.mda.dataValues.secretKey).toString('base64');
		// console.log('revalidation response ', payment.mda.dataValues)
		const fpResp = await fpAxios.get(`/checkout/revalidate-payment/${id}`, {
			headers: {
				Authorization: `Basic ${encondedRef}`,
				'x-api-client': 'modal',
			},
		});

		console.log('revalidation response ', fpResp);

		if (!fpResp.status) {
			throw new Error(fpResp.data.message);
		}

		await payment.update({
			status: fpResp?.data?.status?.lowerCase() === 'successful' ? 'completed' : payment?.status,
		});

		const updatedPayment: any = await PaymentReports.findOne({
			where: {
				transRef: id,
			},
		});

		return successResponse(res, `Payment successfully logged`, updatedPayment);
	} catch (error) {
		// console.log('err ', error)
		return errorResponse(res, `An error occurred - ${error}`);
	}
};

const getPaymentLogsById = async (req: Request, res: Response) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return errorResponse(res, 'Validation Error', errors.array());
	}
	const { id } = req.params;
	try {
		const paymentLog = await PaymentReports.findOne({
			where: { id },
			include: [
				{ model: Businesses, attributes: { exclude: ['createdAt', 'updatedAt'] } },
				{ model: Mdas, attributes: { exclude: ['createdAt', 'updatedAt'] } },
				{ model: RevenueHeads, attributes: { exclude: ['createdAt', 'updatedAt'] } },
			],
		});
		if (!paymentLog) return errorResponse(res, `Payment log with id ${id} not found!`);
		return successResponse(res, `Payment log retrieved!`, paymentLog);
	} catch (error) {
		console.log(error);
		return handleResponse(res, 401, false, `An error occurred - ${error}`);
	}
};

const getPaymentLogsByBusiness = async (req: Request, res: Response) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return errorResponse(res, 'Validation Error', errors.array());
	}
	const { businessId } = req.params;
	try {
		const paymentLog = await PaymentReports.findAll({
			where: { businessId },
			order: [['createdAt', 'DESC']],
			include: [
				{ model: Businesses, attributes: { exclude: ['createdAt', 'updatedAt'] } },
				{ model: Mdas, attributes: { exclude: ['createdAt', 'updatedAt'] } },
				{ model: RevenueHeads, attributes: { exclude: ['createdAt', 'updatedAt'] } },
			],
		});
		if (!paymentLog.length) return errorResponse(res, `Payment log not found!`);
		return successResponse(res, `Payment log retrieved!`, paymentLog);
	} catch (error) {
		console.log(error);
		return handleResponse(res, 401, false, `An error occurred - ${error}`);
	}
};

const getRecentPaymentLogs = async (req: Request, res: Response) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return errorResponse(res, 'Validation Error', errors.array());
	}
	const { businessId } = req.params;
	try {
		const paymentLog = await PaymentReports.findAll({
			where: { businessId },
			order: [['createdAt', 'DESC']],
			limit: 5,
			include: [
				{ model: Businesses, attributes: { exclude: ['createdAt', 'updatedAt'] } },
				{ model: Mdas, attributes: { exclude: ['createdAt', 'updatedAt'] } },
				{ model: RevenueHeads, attributes: { exclude: ['createdAt', 'updatedAt'] } },
			],
		});
		if (!paymentLog.length) return errorResponse(res, `Payment log not found!`);
		return successResponse(res, `Payment log retrieved!`, paymentLog);
	} catch (error) {
		console.log(error);
		return handleResponse(res, 401, false, `An error occurred - ${error}`);
	}
};
const getTransactionAnalytics = async (req: Request, res: Response) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return errorResponse(res, 'Validation Error', errors.array());
	}
	const { businessId } = req.params;

	const { filterBy } = req.body; // Assuming selection contains 'week', 'month', or 'year'

	let startDate, endDate;

	try {
		let transactions: any[] = [];
		let completedPayments: any[] = [];
		let failedPayments: any[] = [];
		let labels: any[] = [];

		if (filterBy === 'week') {
			const startDate = new Date();
			startDate.setDate(startDate.getDate() - 7);
			const endDate = new Date();

			// Fetch transactions from the last 7 days
			transactions = await PaymentReports.findAll({
				where: {
					createdAt: {
						[Op.between]: [startDate, endDate],
					},
				},
				attributes: [
					[sequelize.literal('DAYNAME(createdAt)'), 'dayName'], // Extract day name from transaction date
					[sequelize.fn('sum', sequelize.literal("CASE WHEN status = 'completed' THEN amount ELSE 0 END")), 'completedTransaction'], // Sum of completed transaction amounts
					[sequelize.fn('sum', sequelize.literal("CASE WHEN status = 'failed' THEN amount ELSE 0 END")), 'failedTransaction'], // Sum of failed transaction amounts
					[sequelize.fn('sum', sequelize.col('amount')), 'totalTransaction'], // Sum of total transaction amounts
				],
				group: ['dayName'], // Group by day name
				order: sequelize.literal('FIELD(dayName, "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday")'), // Order by day of the week
			});

			//  Prepare data for line chart
			labels = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']; // All days of the week
			const data = transactions.reduce((acc: any, cur: any) => {
				console.log(cur);
				acc[cur.dataValues.dayName] = {
					completedPayments: cur.dataValues.completedTransaction,
					failedPayments: cur.dataValues.failedTransaction,
					totalTransactions: cur.dataValues.totalTransaction,
				};
				return acc;
			}, {});

			completedPayments = labels.map((label) => data[label]?.completedPayments || 0); // Fill in completed payment amounts for each day, or zero if no completed payments
			failedPayments = labels.map((label) => data[label]?.failedPayments || 0); // Fill in failed payment amounts for each day, or zero if no failed payments
			// const totalTransactions = labels.map(label => data[label]?.totalTransactions || 0); // Fill in total transaction amounts for each day, or zero if no transactions
		}
		// // Construct the data object for the line chart
		// const chartData = {
		//   labels,
		//   datasets: [
		// 	{
		// 	  label: 'Total Transactions',
		// 	  data: completedPayments,
		// 	  borderColor: 'blue',
		// 	  fill: false,
		// 	},
		// 	{
		// 	  label: 'Failed Transactions',
		// 	  data: failedPayments,
		// 	  borderColor: 'red',
		// 	  fill: false,
		// 	},
		//   ],
		// };

		if (filterBy === 'year') {
			// Calculate start date (first day of the current year) and end date (last day of the current year)
			const startDate = new Date(new Date().getFullYear(), 0, 1, 0, 0, 0); // First day of the current year
			const endDate = new Date(new Date().getFullYear() + 1, 0, 0, 23, 59, 59, 999); // Last day of the current year

			// Fetch transactions within the current year
			const result = await PaymentReports.findAll({
				attributes: [
					[sequelize.literal('DATE_FORMAT(createdAt, "%Y-%m")'), 'yearMonth'], // Format year and month as "YYYY-MM"
					[sequelize.fn('SUM', sequelize.literal("CASE WHEN status = 'completed' THEN amount ELSE 0 END")), 'completedPayments'],
					[sequelize.fn('SUM', sequelize.literal("CASE WHEN status = 'failed' THEN amount ELSE 0 END")), 'failedPayments'],
				],
				where: {
					createdAt: {
						[Op.between]: [startDate, endDate],
					},
				},
				group: ['yearMonth'],
				order: [sequelize.literal('yearMonth')], // Order by year and month
			});

			// Prepare data for line chart

			result.forEach((row: any) => {
				labels.push(row.dataValues.yearMonth); // Add year-month as label
				completedPayments.push(parseFloat(row.dataValues.completedPayments));
				failedPayments.push(parseFloat(row.dataValues.failedPayments));
			});
		}

		if (filterBy === 'month') {
			// Calculate start date (first day of the current month) and end date (last day of the current month)
			const startDate = new Date();
			startDate.setDate(1);
			startDate.setHours(0, 0, 0, 0); // Set start date to the beginning of the day
			const endDate = new Date(startDate);
			endDate.setMonth(endDate.getMonth() + 1); // Move to the next month
			endDate.setDate(0); // Set to the last day of the current month
			endDate.setHours(23, 59, 59, 999); // Set end date to the end of the day

			// Fetch transactions within the current month and aggregate by day
			const result = await PaymentReports.findAll({
				attributes: [
					[sequelize.literal('DATE(createdAt)'), 'day'], // Extract day from createdAt
					[sequelize.fn('SUM', sequelize.literal("CASE WHEN status = 'completed' THEN amount ELSE 0 END")), 'completedPayments'],
					[sequelize.fn('SUM', sequelize.literal("CASE WHEN status = 'failed' THEN amount ELSE 0 END")), 'failedPayments'],
				],
				where: {
					createdAt: {
						[Op.between]: [startDate, endDate],
					},
				},
				group: ['day'],
				order: [sequelize.literal('DATE(createdAt)')], // Order by the day of the month
			});

			// Prepare data for line chart
			result.forEach((row: any) => {
				labels.push(row.dataValues.day); // Add day as label
				completedPayments.push(parseFloat(row.dataValues.completedPayments));
				failedPayments.push(parseFloat(row.dataValues.failedPayments));
			});
		}
		// Construct the data object for the line chart
		const chartData = {
			labels,
			datasets: [
				{
					label: 'Completed Payments',
					data: completedPayments,
					borderColor: 'green',
					fill: false,
				},
				{
					label: 'Failed Payments',
					data: failedPayments,
					borderColor: 'red',
					fill: false,
				},
			],
		};

		// if (!chartData.length) return errorResponse(res, `Payment log not found!`);
		return successResponse(res, `Transactions retrieved!`, chartData);
	} catch (error) {
		console.log(error);
		return handleResponse(res, 401, false, `An error occured - ${error}`);
	}
};

// Function to get the week index for a given date
const getWeekIndex = (date: any, startDate: any) => {
	const currentDate: any = new Date(date);
	const numDays = Math.ceil((currentDate - startDate) / (1000 * 60 * 60 * 24));
	return Math.floor(numDays / 7);
};

const getRevenueOverview = async (req: Request, res: Response) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return errorResponse(res, 'Validation Error', errors.array());
	}
	const { businessId } = req.params;

	const { filterBy } = req.body; // Assuming selection contains 'week', 'month', or 'year'

	let startDate, endDate;

	try {
		// Calculate start and end dates based on the user's selection
		switch (filterBy) {
			case 'week':
				startDate = new Date();
				startDate.setDate(startDate.getDate() - 7); // Start date 7 days ago
				endDate = new Date(); // End date today
				break;
			case 'month':
				const date = new Date();
				startDate = new Date(date.getFullYear(), date.getMonth(), 1); // Start date of the current month
				endDate = new Date(); // End date today
				break;
			case 'year':
				startDate = new Date(new Date().getFullYear(), 0, 1); // Start date of the current year
				endDate = new Date(); // End date today
				break;
			default:
				return res.status(400).json({ error: 'Invalid selection' });
		}

		// Fetch transactions within the selected timeframe
		const transactions = await PaymentReports.findAll({
			where: {
				createdAt: {
					[Op.between]: [startDate, endDate],
				},
			},
			attributes: [
				[sequelize.literal(`SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END)`), 'completedPayments'], // Sum of completed payments
				[sequelize.literal(`SUM(CASE WHEN status = 'failed' THEN amount ELSE 0 END)`), 'failedPayments'], // Sum of failed payments
				[sequelize.literal(`SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END)`), 'pendingPayments'], // Sum of pending payments
			],
		});

		// Prepare data for response
		const analyticsData = {
			// revenueAccountBalance: transactions.length > 0 ? transactions[0]?.dataValues?.totalAmount : 0,
			completedPayments: transactions.length > 0 ? Number(transactions[0]?.dataValues?.completedPayments) : 0,
			pendingPayments: transactions.length > 0 ? Number(transactions[0]?.dataValues?.pendingPayments) : 0,
			failedPayments: transactions.length > 0 ? Number(transactions[0]?.dataValues?.failedPayments) : 0,
		};

		if (!analyticsData) return errorResponse(res, `Payment log not found!`);
		return successResponse(res, `Transactions retrieved!`, analyticsData);
	} catch (error) {
		console.log(error);
		return handleResponse(res, 401, false, `An error occurred - ${error}`);
	}
};

export default {
	logPayment,
	getPaymentLogs,
	getPaymentLogsById,
	getPaymentLogDetails,
	paymentWebhook,
	completePayment,
	getRecentPaymentLogs,
	getTransactionAnalytics,
	getRevenueOverview,
	getPaymentLogsByBusiness,
	getPaymentLogsByEmail,
	revalidatePayment,
};
