import { validationResult } from 'express-validator';
import { errorResponse, handleResponse, randId, successResponse } from '../helpers/utility';
import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { RevenueHeads } from '../models/RevenueHeads';
import { InvoiceStatus, Invoices } from '../models/Invoice';
import { Mdas } from '../models/Mdas';

const createInvoice = async (req: Request, res: Response) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return errorResponse(res, 'Validation Error', errors.array());
	}

	const { amount, revenueHeadId, status, email, name } = req.body;

	try {
		const revenueHead = await RevenueHeads.findOne({ where: { id: revenueHeadId } });
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

		const invoice: any = await Invoices.create(insertData);

		if (invoice) {
			return successResponse(res, `Invoice creation successful`);
		}
		return errorResponse(res, `An error occurred`);
	} catch (error) {
		console.log(error);
		return errorResponse(res, `An error occurred - ${error}`);
	}
};

const getInvoices = async (req: Request, res: Response) => {
	try {
		const { page = 1, pageSize = '', amount, revenueHead, status, invoiceId, name, email, startdate, enddate } = req.query;

		const where: { amount?: string; revenueHeadId?: string; status?: InvoiceStatus; invoiceId?: string; name?: any; email?: any; createdAt?: any } =
			{};

		if (amount) where.amount = amount as string;
		if (revenueHead) where.revenueHeadId = revenueHead as string;
		if (status) where.status = status as InvoiceStatus;
		if (invoiceId) where.invoiceId = invoiceId as string;
		if (name) where.name = { [Op.like]: `%${name}%` };
		if (email) where.email = { [Op.like]: `%${email}%` };
		if (startdate && enddate) where.createdAt = { [Op.between]: [startdate, enddate] };

		if (!pageSize) {
			const invoices = await Invoices.findAll({
				where,
				order: [['id', 'DESC']],
				attributes: {
					exclude: ['revenueHeadId'],
				},
				include: [
					{
						model: RevenueHeads,
						attributes: {
							exclude: ['createdAt', 'updatedAt', 'mdaId'],
						},
						include: [
							{
								model: Mdas,
								attributes: {
									exclude: ['createdAt', 'updatedAt', 'publicKey', 'secretKey'],
								},
							},
						],
					},
				],
			});

			if (!invoices.length) return successResponse(res, `No invoice available!`, []);

			return successResponse(res, `${invoices.length} invoice${invoices.length > 1 ? 's' : ''} retrieved!`, invoices);
		}

		const offset = (parseInt(page as string, 10) - 1) * parseInt(pageSize as string, 10);

		const { count, rows: invoices } = await Invoices.findAndCountAll({
			where,
			order: [['id', 'DESC']],
			limit: parseInt(pageSize as string, 10),
			offset: offset,
			attributes: {
				exclude: ['revenueHeadId'],
			},
			include: [
				{
					model: RevenueHeads,
					attributes: {
						exclude: ['createdAt', 'updatedAt', 'mdaId'],
					},
					include: [
						{
							model: Mdas,
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

			return successResponse(res, `${invoices.length} invoice${invoices.length > 1 ? 's' : ''} retrieved!`, {
				totalPages,
				currentPage: parseInt(page as string, 10),
				data: invoices,
			});
		}
	} catch (error) {
		return handleResponse(res, 401, false, `An error occurred - ${error}`);
	}
};

const getInvoicesByEmail = async (req: Request, res: Response) => {
	try {
		const { page = 1, pageSize = '' } = req.query;
		const { email } = req.params;

		const where: any = {};

		if (email) {
			where.email = {
				[Op.like]: `%${email}%`,
			};
		}

		if (!pageSize) {
			const invoices = await Invoices.findAll({
				where,
				order: [['id', 'DESC']],
				attributes: {
					exclude: ['revenueHeadId'],
				},
				include: [
					{
						model: RevenueHeads,
						attributes: {
							exclude: ['createdAt', 'updatedAt', 'mdaId'],
						},
						include: [
							{
								model: Mdas,
								attributes: {
									exclude: ['createdAt', 'updatedAt', 'publicKey', 'secretKey'],
								},
							},
						],
					},
				],
			});

			if (!invoices.length) return successResponse(res, `No invoice available!`, []);

			return successResponse(res, `${invoices.length} invoice${invoices.length > 1 ? 's' : ''} retrieved!`, invoices);
		}

		const offset = (parseInt(page as string, 10) - 1) * parseInt(pageSize as string, 10);

		const { count, rows: invoices } = await Invoices.findAndCountAll({
			where,
			order: [['id', 'DESC']],
			limit: parseInt(pageSize as string, 10),
			offset: offset,
			attributes: {
				exclude: ['revenueHeadId'],
			},
			include: [
				{
					model: RevenueHeads,
					attributes: {
						exclude: ['createdAt', 'updatedAt', 'mdaId'],
					},
					include: [
						{
							model: Mdas,
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

			return successResponse(res, `${invoices.length} invoice${invoices.length > 1 ? 's' : ''} retrieved!`, {
				totalPages,
				currentPage: parseInt(page as string, 10),
				data: invoices,
			});
		}
	} catch (error) {
		return handleResponse(res, 401, false, `An error occurred - ${error}`);
	}
};

const getInvoicesById = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;

		const invoice = await Invoices.findOne({
			where: { id },
			attributes: {
				exclude: ['revenueHeadId'],
			},
			include: [
				{
					model: RevenueHeads,
					attributes: {
						exclude: ['createdAt', 'updatedAt', 'mdaId'],
					},
					include: [
						{
							model: Mdas,
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
		const invoice = await Invoices.findOne({ where: { id }, attributes: { exclude: ['createdAt', 'updatedAt'] } });
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

export default { createInvoice, getInvoices, getInvoicesById, getInvoicesByEmail, updateInvoice };
