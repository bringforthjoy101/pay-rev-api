// Import packages
import { Request, Response } from 'express';
import { validationResult } from 'express-validator';

// Import function files
import { handleResponse, successResponse, errorResponse } from '../helpers/utility';
import { RevenueHeadDataType, IdsDataType } from '../helpers/types';
import { Op } from 'sequelize';
import { RevenueHeads, RevenueStatus } from '../models/RevenueHeads';
import { Mdas } from '../models/Mdas';

// create revenueHead
const createRevenueHead = async (req: Request, res: Response) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return errorResponse(res, 'Validation Error', errors.array());
	}

	const { name, amount, mdaId, amountEditable } = req.body;

	const insertData: RevenueHeadDataType = { name, amount, mdaId, amountEditable };

	try {
		const revenueHeadExists: any = await RevenueHeads.findOne({
			where: { name, amount },
			attributes: { exclude: ['createdAt', 'updatedAt'] },
		});

		// if revenueHead exists, stop the process and return a message
		if (revenueHeadExists) return errorResponse(res, `RevenueHead with name ${name} already exists`);

		const revenueHead: any = await RevenueHeads.create(insertData);

		if (revenueHead) return successResponse(res, `RevenueHead creation successful`);
		return errorResponse(res, `An error occurred`);
	} catch (error) {
		console.log(error);
		return errorResponse(res, `An error occurred - ${error}`);
	}
};

// get all revenueHeads
const getRevenueHeads = async (req: Request, res: Response) => {
	try {
		const where: { name?: any; amount?: string; status?: RevenueStatus; mdaId?: string; createdAt?: any } = {};
		const { page = 1, pageSize = '10', name, amount, status, mda, startdate, enddate } = req.query;

		if (name) where.name = { [Op.like]: `%${name}%` };
		if (amount) where.amount = amount as string;
		if (status) where.status = status as RevenueStatus;
		if (mda) where.mdaId = mda as string;
		if (startdate && enddate) where.createdAt = { [Op.between]: [startdate, enddate] };

		const offset = (parseInt(page as string, 10) - 1) * parseInt(pageSize as string, 10);

		const { count, rows: revenueHeads } = await RevenueHeads.findAndCountAll({
			where,
			order: [['id', 'DESC']],
			limit: parseInt(pageSize as string, 10),
			offset: offset,
		});

		if (!revenueHeads.length) return successResponse(res, `No address available!`, []);
		if (revenueHeads) {
			const totalPages = Math.ceil(count / parseInt(pageSize as string, 10));

			return successResponse(res, `${revenueHeads.length} revenueHead${revenueHeads.length > 1 ? 'es' : ''} retrieved!`, {
				totalPages,
				currentPage: parseInt(page as string, 10),
				data: revenueHeads,
			});
		}
	} catch (error) {
		console.log(error);
		return handleResponse(res, 401, false, `An error occurred - ${error}`);
	}
};

const getRevenueHeadByMda = async (req: Request, res: Response) => {
	try {
		const where: any = {};
		if (!req.params) {
			where.status = 'active';
		}
		const { id } = req.params;

		const { page = 1, pageSize = '10' } = req.query;
		const offset = (parseInt(page as string, 10) - 1) * parseInt(pageSize as string, 10);

		const mda = await Mdas.findOne({ where: { id }, attributes: ['name', 'address'] });

		const { count, rows: revenueHeads } = await RevenueHeads.findAndCountAll({
			where: {
				...where,
				mdaId: id,
			},
			order: [['id', 'DESC']],
			limit: parseInt(pageSize as string, 10),
			offset: offset,
		});

		if (!revenueHeads.length) return successResponse(res, `No revenue head available!`, mda);
		if (revenueHeads) {
			const totalPages = Math.ceil(count / parseInt(pageSize as string, 10));

			return successResponse(res, `${revenueHeads.length} revenueHead${revenueHeads.length > 1 ? 'es' : ''} retrieved!`, {
				totalPages,
				count,
				currentPage: parseInt(page as string, 10),
				mda: mda,
				data: revenueHeads,
			});
		}
	} catch (error) {
		console.log(error);
		return handleResponse(res, 401, false, `An error occurred - ${error}`);
	}
};

// get revenueHead details
const getRevenueHeadDetails = async (req: Request, res: Response) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return errorResponse(res, 'Validation Error', errors.array());
	}
	const { id } = req.params;
	try {
		const revenueHead = await RevenueHeads.findOne({ where: { id } });
		if (!revenueHead) return errorResponse(res, `Address with ID ${id} not found!`);
		return successResponse(res, `Address details retrieved!`, revenueHead);
	} catch (error) {
		console.log(error);
		return handleResponse(res, 401, false, `An error occurred - ${error}`);
	}
};

// update revenueHead
const updateRevenueHead = async (req: Request, res: Response) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return errorResponse(res, 'Validation Error', errors.array());
	}
	const { id } = req.params;
	const { name, amount, status } = req.body;
	try {
		const revenueHead = await RevenueHeads.findOne({ where: { id }, attributes: { exclude: ['createdAt', 'updatedAt'] } });
		if (!revenueHead) return errorResponse(res, `revenueHead not found!`);
		const updateData: RevenueHeadDataType = {
			name: name || revenueHead.name,
			amount: amount || revenueHead.amount,
			status: status || revenueHead.status,
		};
		const updatedRevenueHead: any = await revenueHead.update(updateData);
		if (!updatedRevenueHead) return errorResponse(res, `Unable to update revenueHead!`);
		return successResponse(res, `RevenueHead updated successfully`);
	} catch (error) {
		console.log(error);
		return errorResponse(res, `An error occurred - ${error}`);
	}
};

// delete revenueHead
const deleteRevenueHead = async (req: Request, res: Response) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return errorResponse(res, 'Validation Error', errors.array());
	}
	const { id } = req.params;
	try {
		const checkRevenueHead = await RevenueHeads.findOne({ where: { id } });
		if (!checkRevenueHead) return errorResponse(res, `RevenueHead with ID ${id} not found!`);
		await checkRevenueHead.destroy({ force: true });
		return successResponse(res, `RevenueHead with ID ${id} deleted successfully!`);
	} catch (error) {
		console.log(error);
		return handleResponse(res, 401, false, `An error occurred - ${error}`);
	}
};

// delete multiple revenueHead
const deleteMultipleRevenueHeads = async (req: Request, res: Response) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return errorResponse(res, 'Validation Error', errors.array());
	}
	const { ids }: IdsDataType = req.body;
	try {
		let errorArr = [];
		let successArr = [];
		for (let i = 0; i < ids.length; i++) {
			const checkRevenueHead = await RevenueHeads.findOne({
				where: { id: ids[i] },
			});
			if (checkRevenueHead) {
				await checkRevenueHead.destroy();
				successArr.push({
					successMsg: `RevenueHead with ID ${ids[i]} deleted successfully!`,
				});
			} else {
				errorArr.push({ errorMsg: `RevenueHead with ID ${ids[i]} not found!` });
			}
		}
		return successResponse(res, `Operation successful!`, {
			success: successArr.length,
			successData: successArr,
			failure: errorArr.length,
			failureData: errorArr,
		});
	} catch (error) {
		console.log(error);
		return errorResponse(res, `An error occurred - ${error}`);
	}
};

export default {
	createRevenueHead,
	getRevenueHeads,
	getRevenueHeadDetails,
	updateRevenueHead,
	deleteRevenueHead,
	deleteMultipleRevenueHeads,
	getRevenueHeadByMda,
};
