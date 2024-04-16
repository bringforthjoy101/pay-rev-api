import { validationResult } from 'express-validator';
import { errorResponse, handleResponse, randId, successResponse } from '../helpers/utility';
import { Request, Response } from 'express';
import DB from './db';
import { Op } from 'sequelize';

const createInvoice = async (req: Request, res: Response) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return errorResponse(res, 'Validation Error', errors.array());
	}

	const { amount, revenueHeadId, status, email, name, } = req.body;

	try {
		const revenueHead = await DB.revenueHeads.findOne({ where: { id: revenueHeadId } });
		if (!revenueHead) return successResponse(res, `No revenue head available!`);

		const invoiceId = randId();

		const insertData = {
			amount,
			revenueHeadId,
			status,
			invoiceId,
			email,
			name,
		};

		const invoice: any = await DB.invoices.create(insertData);

		if (invoice) {
			return successResponse(res, `Invoice creation successful`);
		}
		return errorResponse(res, `An error occured`);
	} catch (error) {
		console.log(error);
		return errorResponse(res, `An error occured - ${error}`);
	}
};

const getInvoices = async (req: Request, res: Response) => {
	try {
		const { page = 1, pageSize = '' } = req.query;

		const where: any = {};

		if(!pageSize) {
			const invoices  = await DB.invoices.findAll({
				where,
				order: [['id', 'DESC']],
				attributes: {
					exclude: ['revenueHeadId'],
				},
				include: [
					{
						model: DB.revenueHeads,
						attributes: {
							exclude: ['createdAt', 'updatedAt', 'mdaId'],
						},
						include: [
							{
								model: DB.mdas,
								attributes: {
									exclude: ['createdAt', 'updatedAt', 'publicKey', 'secretKey'],
								},
							},
						],
					},
				],
			});
	
			if (!invoices.length) return successResponse(res, `No invoice available!`, []);
	
			return successResponse(res, `${invoices.length} invoice${invoices.length > 1 ? 's' : ''} retrived!`, invoices);
			
		}

		const offset = (parseInt(page as string, 10) - 1) * parseInt(pageSize as string, 10);

		const { count, rows: invoices } = await DB.invoices.findAndCountAll({
			where,
			order: [['id', 'DESC']],
			limit: parseInt(pageSize as string, 10),
			offset: offset,
			attributes: {
				exclude: ['revenueHeadId'],
			},
			include: [
				{
					model: DB.revenueHeads,
					attributes: {
						exclude: ['createdAt', 'updatedAt', 'mdaId'],
					},
					include: [
						{
							model: DB.mdas,
							attributes: {
								exclude: ['createdAt', 'updatedAt', 'publicKey', 'secretKey'],
							},
						},
					],
				},
			],
		});

		if (!invoices.length) return successResponse(res, `No invoice available!`, []);
		if (invoices) {
			const totalPages = Math.ceil(count / parseInt(pageSize as string, 10));

			return successResponse(res, `${invoices.length} invoice${invoices.length > 1 ? 's' : ''} retrived!`, {
				totalPages,
				currentPage: parseInt(page as string, 10),
				data: invoices,
			});
		}
	} catch (error) {
		return handleResponse(res, 401, false, `An error occured - ${error}`);
	}
};

const getInvoicesByEmail = async (req: Request, res: Response) => {
	try {
		const { page = 1, pageSize = '' } = req.query;
		const { email } = req.params;

		const where: any = {};

		if(email) {
			where.email = {
				[Op.like]: `%${email}%`,
			};
		}

		if(!pageSize) {
			const invoices  = await DB.invoices.findAll({
				where,
				order: [['id', 'DESC']],
				attributes: {
					exclude: ['revenueHeadId'],
				},
				include: [
					{
						model: DB.revenueHeads,
						attributes: {
							exclude: ['createdAt', 'updatedAt', 'mdaId'],
						},
						include: [
							{
								model: DB.mdas,
								attributes: {
									exclude: ['createdAt', 'updatedAt', 'publicKey', 'secretKey'],
								},
							},
						],
					},
				],
			});
	
			if (!invoices.length) return successResponse(res, `No invoice available!`, []);
	
			return successResponse(res, `${invoices.length} invoice${invoices.length > 1 ? 's' : ''} retrived!`, invoices);
			
		}

		const offset = (parseInt(page as string, 10) - 1) * parseInt(pageSize as string, 10);

		const { count, rows: invoices } = await DB.invoices.findAndCountAll({
			where,
			order: [['id', 'DESC']],
			limit: parseInt(pageSize as string, 10),
			offset: offset,
			attributes: {
				exclude: ['revenueHeadId'],
			},
			include: [
				{
					model: DB.revenueHeads,
					attributes: {
						exclude: ['createdAt', 'updatedAt', 'mdaId'],
					},
					include: [
						{
							model: DB.mdas,
							attributes: {
								exclude: ['createdAt', 'updatedAt', 'publicKey', 'secretKey'],
							},
						},
					],
				},
			],
		});

		if (!invoices.length) return successResponse(res, `No invoice available!`, []);
		if (invoices) {
			const totalPages = Math.ceil(count / parseInt(pageSize as string, 10));

			return successResponse(res, `${invoices.length} invoice${invoices.length > 1 ? 's' : ''} retrived!`, {
				totalPages,
				currentPage: parseInt(page as string, 10),
				data: invoices,
			});
		}
	} catch (error) {
		return handleResponse(res, 401, false, `An error occured - ${error}`);
	}
};

const getInvoicesById = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;

		const invoice = await DB.invoices.findOne({
			where: { id },
			attributes: {
				exclude: ['revenueHeadId'],
			},
			include: [
				{
					model: DB.revenueHeads,
					attributes: {
						exclude: ['createdAt', 'updatedAt', 'mdaId'],
					},
					include: [
						{
							model: DB.mdas,
							attributes: {
								exclude: ['createdAt', 'updatedAt', 'publicKey', 'secretKey'],
							},
						},
					],
				},
			],
		});

		if (!invoice) return errorResponse(res, `No invoice available!`);

		return successResponse(res, `Invoice retrieved!`, {
			...invoice.dataValues,
		});
	} catch (error) {
		console.log(error);
		return handleResponse(res, 401, false, `An error occurred - ${error}`);
	}
};


// update category
const updateInvoice = async (req: Request, res: Response) => {

	const { id } = req.params;
	const { status } = req.body;
	try {
		const invoice = await DB.invoices.findOne({ where: { id }, attributes: { exclude: ['createdAt', 'updatedAt'] } });
		if (!invoice) return errorResponse(res, `invoice not found!`);
		const updateData = {
			status: status || invoice.status,
		};
		const updatedInvoice: any = await invoice.update(updateData);
		if (!updatedInvoice) return errorResponse(res, `Unable to update invoice!`);
		return successResponse(res, `Invoice updated successfully`);
	} catch (error) {
		console.log(error);
		return errorResponse(res, `An error occurred - ${error}`);
	}
};


export default { createInvoice, getInvoices, getInvoicesById, getInvoicesByEmail, updateInvoice, };
