// Import packages
import { Request, Response } from 'express';
import { validationResult } from 'express-validator';

// Import db
import DB from './db';

// Import function files
import { handleResponse, successResponse, errorResponse } from '../helpers/utility';
import { MdaDataType, IdsDataType } from '../helpers/types';
import { Op } from 'sequelize';

// create mda
const createMda = async (req: Request, res: Response) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return errorResponse(res, 'Validation Error', errors.array());
	}
	const { businessId } = req.staff;
	const { name, address, secretKey, publicKey } = req.body;

	try {
		const business = await DB.businesses.findOne({ where: { id: businessId } });

		if (!business) return errorResponse(res, `no business`);

		const insertData: MdaDataType = {
			name,
			businessId,
			address,
			secretKey: secretKey || business.secretKey,
			publicKey: publicKey || business.publicKey,
		};

		const branchExists: any = await DB.mdas.findOne({ where: { name }, attributes: { exclude: ['createdAt', 'updatedAt'] } });

		if (branchExists) return errorResponse(res, `mda with name ${name} already exists`);

		const mda: any = await DB.mdas.create(insertData);

		if (mda) return successResponse(res, `mda creation successfull`);
		return errorResponse(res, `An error occured`);
	} catch (error) {
		console.log(error);
		return errorResponse(res, `An error occured - ${error}`);
	}
};

// get all mdas
const getMdas = async (req: Request, res: Response) => {
	try {
		const { 
			page = 1, 
			pageSize = '10',
			searchByName,
			address,
			status, 
			startdate,
			enddate,
	} = req.query;

		const where: any = {};
		// if (!req.params) {
		// 	where.status = 'active';
		// }

		if (searchByName)
			where.name = {
				[Op.like]: `%${searchByName}%`,
			};

		if (address)
			where.address = {
				[Op.like]: `%${address}%`,
			};

		if (status)
			where.status = status;

		if (startdate && enddate) {
			where.createdAt = {
				[Op.between]: [startdate, enddate],
			};
		}

		const offset = (parseInt(page as string, 10) - 1) * parseInt(pageSize as string, 10);

		const { count, rows: mdas } = await DB.mdas.findAndCountAll({
			where,
			order: [['id', 'DESC']],
			limit: parseInt(pageSize as string, 10),
			offset: offset,
		});

		if (!mdas.length) return successResponse(res, `No address available!`, []);
		if (mdas) {
			const totalPages = Math.ceil(count / parseInt(pageSize as string, 10));

			return successResponse(res, `${mdas.length} mda${mdas.length > 1 ? 'es' : ''} retrived!`, {
				totalPages,
				currentPage: parseInt(page as string, 10),
				data: mdas,
			});
		}
	} catch (error) {
		console.log(error);
		return handleResponse(res, 401, false, `An error occured - ${error}`);
	}
};

// get mda details
const getMdaDetails = async (req: Request, res: Response) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return errorResponse(res, 'Validation Error', errors.array());
	}
	const { id } = req.params;
	try {
		const mda = await DB.mdas.findOne({ where: { id } });
		if (!mda) return errorResponse(res, `Address with ID ${id} not found!`);
		return successResponse(res, `Address details retrived!`, mda);
	} catch (error) {
		console.log(error);
		return handleResponse(res, 401, false, `An error occured - ${error}`);
	}
};

// update mda
const updateMda = async (req: Request, res: Response) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return errorResponse(res, 'Validation Error', errors.array());
	}
	const { id } = req.params;
	const { name, status, address } = req.body;
	try {
		const mda = await DB.mdas.findOne({ where: { id }, attributes: { exclude: ['createdAt', 'updatedAt'] } });
		if (!mda) return errorResponse(res, `mda not found!`);
		const updateData = {
			name: name || mda.name,
			status: status || mda.status,
			address: address || mda.address,
		};
		const updatedMda: any = await mda.update(updateData);
		if (!updatedMda) return errorResponse(res, `Unable to update mda!`);
		return successResponse(res, `Mda updated successfully`);
	} catch (error) {
		console.log(error);
		return errorResponse(res, `An error occured - ${error}`);
	}
};

// delete mda
const deleteMda = async (req: Request, res: Response) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return errorResponse(res, 'Validation Error', errors.array());
	}
	const { id } = req.params;
	try {
		const checkMda = await DB.mdas.findOne({ where: { id } });
		if (!checkMda) return errorResponse(res, `mda with ID ${id} not found!`);
		await checkMda.destroy({ force: true });
		return successResponse(res, `mda with ID ${id} deleted successfully!`);
	} catch (error) {
		console.log(error);
		return handleResponse(res, 401, false, `An error occured - ${error}`);
	}
};

// delete multiple mda
const deleteMultipleMdas = async (req: Request, res: Response) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return errorResponse(res, 'Validation Error', errors.array());
	}
	const { ids }: IdsDataType = req.body;
	try {
		let errorArr = [];
		let successArr = [];
		for (let i = 0; i < ids.length; i++) {
			const checkMda = await DB.addresses.findOne({
				where: { id: ids[i] },
			});
			if (checkMda) {
				await checkMda.destroy();
				successArr.push({
					successMsg: `mda with ID ${ids[i]} deleted successfully!`,
				});
			} else {
				errorArr.push({ errorMsg: `mda with ID ${ids[i]} not found!` });
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

const getMdaByBusiness = async (req: Request, res: Response) => {
	try {
		const where: any = {};
		if (!req.params) {
			where.status = 'active';
		}
		const { id } = req.params;

		const { page = 1, pageSize } = req.query;
		const offset = (parseInt(page as string, 10) - 1) * parseInt(pageSize as string, 10);

		let cond;

		if (pageSize && page)
			cond = {
				limit: parseInt(pageSize as string, 10),
				offset: offset,
			};
		const business = await DB.businesses.findOne({ where: { id } });
		if (!business) throw new Error('Business not found!');

		const { count, rows: mdas } = await DB.mdas.findAndCountAll({
			where: {
				...where,
				businessId: id,
			},
			order: [['id', 'DESC']],
			...cond,
		});

		if (!mdas.length) return successResponse(res, `No mda in this business available!`, []);
		if (mdas) {
			const totalPages = Math.ceil(count / parseInt(pageSize as string, 10));

			let resp;

			if (pageSize)
				resp = {
					totalPages,
					currentPage: parseInt(page as string, 10),
				};
			return successResponse(res, `${mdas.length} mda${mdas.length > 1 ? 's' : ''} retrieved!`, {
				...resp,
				count,
				data: [
					// ...business.dataValues,
					...mdas,
				],
			});
		}
	} catch (error) {
		console.log(error);
		return handleResponse(res, 401, false, `An error occurred - ${error}`);
	}
};

export default {
	createMda,
	getMdas,
	getMdaDetails,
	updateMda,
	deleteMda,
	deleteMultipleMdas,
	getMdaByBusiness,
};
