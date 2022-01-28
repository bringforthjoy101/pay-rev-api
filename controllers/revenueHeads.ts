// Import packages
import { Request, Response } from 'express';
import { validationResult } from 'express-validator';

// Import db
import DB from './db';

// Import function files
import { handleResponse, successResponse, errorResponse } from '../helpers/utility';
import { RevenueHeadDataType, IdsDataType } from '../helpers/types';

// create revenueHead
const createRevenueHead = async (req: Request, res: Response) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return errorResponse(res, 'Validation Error', errors.array());
	}

	const { name, amount, branchId, businessId } = req.body;

	const insertData: RevenueHeadDataType = { name, amount, branchId, businessId };

	try {
		const revenueHeadExists: any = await DB.revenueHeads.findOne({
			where: { name, amount, businessId },
			attributes: { exclude: ['createdAt', 'updatedAt'] },
		});

		// if revenueHead exists, stop the process and return a message
		if (revenueHeadExists) return errorResponse(res, `RevenueHead with name ${name} already exists`);

		const revenueHead: any = await DB.revenueHeads.create(insertData);

		if (revenueHead) return successResponse(res, `RevenueHead creation successfull`);
		return errorResponse(res, `An error occured`);
	} catch (error) {
		console.log(error);
		return errorResponse(res, `An error occured - ${error}`);
	}
};

// get all revenueHeads
const getRevenueHeads = async (req: Request, res: Response) => {
	try {
		const where: any = {};
		if (!req.params) {
			where.status = 'active';
		}
		const revenueHeads = await DB.revenueHeads.findAll({ where, order: [['id', 'DESC']] });

		if (!revenueHeads.length) return successResponse(res, `No address available!`, []);
		return successResponse(res, `${revenueHeads.length} revenueHead${revenueHeads.length > 1 ? 'es' : ''} retrived!`, revenueHeads);
	} catch (error) {
		console.log(error);
		return handleResponse(res, 401, false, `An error occured - ${error}`);
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
		const revenueHead = await DB.revenueHeads.findOne({ where: { id } });
		if (!revenueHead) return errorResponse(res, `Address with ID ${id} not found!`);
		return successResponse(res, `Address details retrived!`, revenueHead);
	} catch (error) {
		console.log(error);
		return handleResponse(res, 401, false, `An error occured - ${error}`);
	}
};

// update revenueHead
const updateRevenueHead = async (req: Request, res: Response) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return errorResponse(res, 'Validation Error', errors.array());
	}
	const { id } = req.params;
	const { name, amount, branchId, businessId, status } = req.body;
	try {
		const revenueHead = await DB.revenueHeads.findOne({ where: { id }, attributes: { exclude: ['createdAt', 'updatedAt'] } });
		if (!revenueHead) return errorResponse(res, `revenueHead not found!`);
		const updateData: RevenueHeadDataType = {
			name: name || revenueHead.name,
			amount: amount || revenueHead.amount,
			branchId: branchId || revenueHead.branchId,
			businessId: businessId || revenueHead.businessId,
			status: status || revenueHead.status,
		};
		const updatedRevenueHead: any = await revenueHead.update(updateData);
		if (!updatedRevenueHead) return errorResponse(res, `Unable to update revenueHead!`);
		return successResponse(res, `RevenueHead updated successfully`);
	} catch (error) {
		console.log(error);
		return errorResponse(res, `An error occured - ${error}`);
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
		const checkRevenueHead = await DB.revenueHeads.findOne({ where: { id } });
		if (!checkRevenueHead) return errorResponse(res, `RevenueHead with ID ${id} not found!`);
		await checkRevenueHead.destroy({ force: true });
		return successResponse(res, `RevenueHead with ID ${id} deleted successfully!`);
	} catch (error) {
		console.log(error);
		return handleResponse(res, 401, false, `An error occured - ${error}`);
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
			const checkRevenueHead = await DB.revenueHeads.findOne({
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
		return errorResponse(res, `An error occured - ${error}`);
	}
};

export default {
	createRevenueHead,
	getRevenueHeads,
	getRevenueHeadDetails,
	updateRevenueHead,
	deleteRevenueHead,
	deleteMultipleRevenueHeads,
};
