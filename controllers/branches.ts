// Import packages
import { Request, Response } from 'express';
import { validationResult } from 'express-validator';

// Import db
import DB from './db';

// Import function files
import { handleResponse, successResponse, errorResponse } from '../helpers/utility';
import { BranchDataType, IdsDataType } from '../helpers/types';

// create branch
const createBranch = async (req: Request, res: Response) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return errorResponse(res, 'Validation Error', errors.array());
	}

	const { name, businessId } = req.body;

	const insertData: BranchDataType = { name, businessId };

	try {
		const branchExists: any = await DB.branches.findOne({ where: { name }, attributes: { exclude: ['createdAt', 'updatedAt'] } });

		// if branch exists, stop the process and return a message
		if (branchExists) return errorResponse(res, `branch with name ${name} already exists`);

		const branch: any = await DB.branches.create(insertData);

		if (branch) return successResponse(res, `Branch creation successfull`);
		return errorResponse(res, `An error occured`);
	} catch (error) {
		console.log(error);
		return errorResponse(res, `An error occured - ${error}`);
	}
};

// get all branches
const getBranches = async (req: Request, res: Response) => {
	try {
		const where: any = {};
		if (!req.params) {
			where.status = 'active';
		}
		const branches = await DB.branches.findAll({ where, order: [['id', 'DESC']] });

		if (!branches.length) return successResponse(res, `No address available!`, []);
		return successResponse(res, `${branches.length} branch${branches.length > 1 ? 'es' : ''} retrived!`, branches);
	} catch (error) {
		console.log(error);
		return handleResponse(res, 401, false, `An error occured - ${error}`);
	}
};

// get branch details
const getBranchDetails = async (req: Request, res: Response) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return errorResponse(res, 'Validation Error', errors.array());
	}
	const { id } = req.params;
	try {
		const branch = await DB.branches.findOne({ where: { id } });
		if (!branch) return errorResponse(res, `Address with ID ${id} not found!`);
		return successResponse(res, `Address details retrived!`, branch);
	} catch (error) {
		console.log(error);
		return handleResponse(res, 401, false, `An error occured - ${error}`);
	}
};

// update branch
const updateBranch = async (req: Request, res: Response) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return errorResponse(res, 'Validation Error', errors.array());
	}
	const { id } = req.params;
	const { name, status } = req.body;
	try {
		const branch = await DB.branches.findOne({ where: { id }, attributes: { exclude: ['createdAt', 'updatedAt'] } });
		if (!branch) return errorResponse(res, `branch not found!`);
		const updateData = {
			name: name || branch.name,
			status: status || branch.status,
		};
		const updatedBranch: any = await branch.update(updateData);
		if (!updatedBranch) return errorResponse(res, `Unable to update branch!`);
		return successResponse(res, `Branch updated successfully`);
	} catch (error) {
		console.log(error);
		return errorResponse(res, `An error occured - ${error}`);
	}
};

// delete branch
const deleteBranch = async (req: Request, res: Response) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return errorResponse(res, 'Validation Error', errors.array());
	}
	const { id } = req.params;
	try {
		const checkBranch = await DB.branches.findOne({ where: { id } });
		if (!checkBranch) return errorResponse(res, `Branch with ID ${id} not found!`);
		await checkBranch.destroy({ force: true });
		return successResponse(res, `Branch with ID ${id} deleted successfully!`);
	} catch (error) {
		console.log(error);
		return handleResponse(res, 401, false, `An error occured - ${error}`);
	}
};

// delete multiple branch
const deleteMultipleBranches = async (req: Request, res: Response) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return errorResponse(res, 'Validation Error', errors.array());
	}
	const { ids }: IdsDataType = req.body;
	try {
		let errorArr = [];
		let successArr = [];
		for (let i = 0; i < ids.length; i++) {
			const checkBranch = await DB.addresses.findOne({
				where: { id: ids[i] },
			});
			if (checkBranch) {
				await checkBranch.destroy();
				successArr.push({
					successMsg: `Branch with ID ${ids[i]} deleted successfully!`,
				});
			} else {
				errorArr.push({ errorMsg: `Branch with ID ${ids[i]} not found!` });
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
	createBranch,
	getBranches,
	getBranchDetails,
	updateBranch,
	deleteBranch,
	deleteMultipleBranches,
};
