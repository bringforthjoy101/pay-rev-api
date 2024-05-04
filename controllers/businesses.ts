// Import packages
import { Request, Response } from 'express';
import { validationResult } from 'express-validator';

// Import function files
import { handleResponse, successResponse, errorResponse } from '../helpers/utility';
import { BusinessDataType, IdsDataType } from '../helpers/types';
import { Op } from 'sequelize';
import { Businesses } from '../models/Businesses';

// create business
const createBusiness = async (req: Request, res: Response) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return errorResponse(res, 'Validation Error', errors.array());
	}
	const { name, address, phone, email, state, country } = req.body;
	const insertData: BusinessDataType = { name, address, phone, email, state, country };

	try {
		const businessExists: any = await Businesses.findOne({ where: { name }, attributes: { exclude: ['createdAt', 'updatedAt'] } });

		// if business exists, stop the process and return a message
		if (businessExists) return errorResponse(res, `business with name ${name} already exists`);

		const business: any = await Businesses.create(insertData);

		if (business) {
			// await DB.Mdas.create({ name: 'Main Branch', address: business.address, state: business.state, businessId: business.id });
			return successResponse(res, `Business creation successful`);
		}
		return errorResponse(res, `An error occurred`);
	} catch (error) {
		console.log(error);
		return errorResponse(res, `An error occurred - ${error}`);
	}
};

// get all businesses
const getBusinesses = async (req: Request, res: Response) => {
	try {
		const { page = 1, pageSize = '10', searchByName } = req.query;

		const where: any = {};
		if (!req.params) {
			where.status = 'active';
		}

		if (searchByName)
			where.name = {
				[Op.like]: `%${searchByName}%`,
			};

		const offset = (parseInt(page as string, 10) - 1) * parseInt(pageSize as string, 10);

		const { count, rows: businesses } = await Businesses.findAndCountAll({
			where,
			order: [['id', 'DESC']],
			limit: parseInt(pageSize as string, 10),
			offset: offset,
		});

		if (!businesses.length) return successResponse(res, `No business available!`, []);
		if (businesses) {
			const totalPages = Math.ceil(count / parseInt(pageSize as string, 10));

			return successResponse(res, `${businesses.length} business${businesses.length > 1 ? 'es' : ''} retrieved!`, {
				totalPages,
				currentPage: parseInt(page as string, 10),
				data: businesses,
			});
		}
	} catch (error) {
		console.log(error);
		return handleResponse(res, 401, false, `An error occurred - ${error}`);
	}
};

// get business details
const getBusinessDetails = async (req: Request, res: Response) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return errorResponse(res, 'Validation Error', errors.array());
	}
	const { id } = req.params;
	try {
		const business = await Businesses.findOne({ where: { id } });
		if (!business) return errorResponse(res, `Address with ID ${id} not found!`);
		return successResponse(res, `Address details retrieved!`, business);
	} catch (error) {
		console.log(error);
		return handleResponse(res, 401, false, `An error occurred - ${error}`);
	}
};

// update business
const updateBusiness = async (req: Request, res: Response) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return errorResponse(res, 'Validation Error', errors.array());
	}
	const { id } = req.params;
	const { name, address, phone, email, state, country, status } = req.body;
	try {
		const business = await Businesses.findOne({ where: { id }, attributes: { exclude: ['createdAt', 'updatedAt'] } });
		if (!business) return errorResponse(res, `business not found!`);
		const updateData = {
			name: name || business.name,
			address: address || business.address,
			phone: phone || business.phone,
			email: email || business.email,
			state: state || business.state,
			country: country || business.country,
			status: status || business.status,
		};
		const updatedBusiness: any = await business.update(updateData);
		if (!updatedBusiness) return errorResponse(res, `Unable to update business!`);
		return successResponse(res, `Business updated successfully`);
	} catch (error) {
		console.log(error);
		return errorResponse(res, `An error occurred - ${error}`);
	}
};

// delete business
const deleteBusiness = async (req: Request, res: Response) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return errorResponse(res, 'Validation Error', errors.array());
	}
	const { id } = req.params;
	try {
		const checkBusiness = await Businesses.findOne({ where: { id } });
		if (!checkBusiness) return errorResponse(res, `Business with ID ${id} not found!`);
		await checkBusiness.destroy({ force: true });
		return successResponse(res, `Business with ID ${id} deleted successfully!`);
	} catch (error) {
		console.log(error);
		return handleResponse(res, 401, false, `An error occurred - ${error}`);
	}
};

// delete multiple business
const deleteMultipleBusinesses = async (req: Request, res: Response) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return errorResponse(res, 'Validation Error', errors.array());
	}
	const { ids }: IdsDataType = req.body;
	try {
		let errorArr = [];
		let successArr = [];
		for (let i = 0; i < ids.length; i++) {
			const checkBusiness = await Businesses.findOne({
				where: { id: ids[i] },
			});
			if (checkBusiness) {
				await checkBusiness.destroy();
				successArr.push({
					successMsg: `Business with ID ${ids[i]} deleted successfully!`,
				});
			} else {
				errorArr.push({ errorMsg: `Business with ID ${ids[i]} not found!` });
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
	createBusiness,
	getBusinesses,
	getBusinessDetails,
	updateBusiness,
	deleteBusiness,
	deleteMultipleBusinesses,
};
