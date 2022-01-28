// Import packages
import { Request, Response } from 'express';
import { validationResult } from 'express-validator';

// Import db
import DB from './db';

// Import function files
import { handleResponse, successResponse, errorResponse } from '../helpers/utility';
import { BusinessDataType, IdsDataType } from '../helpers/types';

// create business
const createBusiness = async (req: Request, res: Response) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return errorResponse(res, 'Validation Error', errors.array());
	}
	const { name, address, phone, email, state, country } = req.body;
	const insertData: BusinessDataType = { name, address, phone, email, state, country };

	try {
		const businessExists: any = await DB.businesses.findOne({ where: { name }, attributes: { exclude: ['createdAt', 'updatedAt'] } });

		// if business exists, stop the process and return a message
		if (businessExists) return errorResponse(res, `business with name ${name} already exists`);

		const business: any = await DB.businesses.create(insertData);

		if (business) {
			await DB.branches.create({ name: 'Main Branch', address: business.address, state: business.state, businessId: business.id });
			return successResponse(res, `Business creation successfull`);
		}
		return errorResponse(res, `An error occured`);
	} catch (error) {
		console.log(error);
		return errorResponse(res, `An error occured - ${error}`);
	}
};

// get all businesses
const getBusinesses = async (req: Request, res: Response) => {
	try {
		const where: any = {};
		if (!req.params) {
			where.status = 'active';
		}
		const businesses = await DB.businesses.findAll({ where, order: [['id', 'DESC']] });

		if (!businesses.length) return successResponse(res, `No address available!`, []);
		return successResponse(res, `${businesses.length} business${businesses.length > 1 ? 'es' : ''} retrived!`, businesses);
	} catch (error) {
		console.log(error);
		return handleResponse(res, 401, false, `An error occured - ${error}`);
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
		const business = await DB.businesses.findOne({ where: { id } });
		if (!business) return errorResponse(res, `Address with ID ${id} not found!`);
		return successResponse(res, `Address details retrived!`, business);
	} catch (error) {
		console.log(error);
		return handleResponse(res, 401, false, `An error occured - ${error}`);
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
		const business = await DB.businesses.findOne({ where: { id }, attributes: { exclude: ['createdAt', 'updatedAt'] } });
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
		return errorResponse(res, `An error occured - ${error}`);
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
		const checkBusiness = await DB.businesses.findOne({ where: { id } });
		if (!checkBusiness) return errorResponse(res, `Business with ID ${id} not found!`);
		await checkBusiness.destroy({ force: true });
		return successResponse(res, `Business with ID ${id} deleted successfully!`);
	} catch (error) {
		console.log(error);
		return handleResponse(res, 401, false, `An error occured - ${error}`);
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
			const checkBusiness = await DB.addresses.findOne({
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
		return errorResponse(res, `An error occured - ${error}`);
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
