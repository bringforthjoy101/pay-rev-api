// Import packages
import { Request, Response } from 'express';
import { validationResult } from 'express-validator';

// Import db
import DB from './db';

// Import function files
import { handleResponse, successResponse, errorResponse } from '../helpers/utility';
import { CategoryDataType, IdsDataType } from '../helpers/types';

// create category
const createCategory = async (req: Request, res: Response) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return errorResponse(res, 'Validation Error', errors.array());
	}

	const { name, businessId } = req.body;

	const insertData: CategoryDataType = { name, businessId };

	try {
		const categoryExists: any = await DB.categories.findOne({ where: { name }, attributes: { exclude: ['createdAt', 'updatedAt'] } });

		// if category exists, stop the process and return a message
		if (categoryExists) return errorResponse(res, `category with name ${name} already exists`);

		const category: any = await DB.categories.create(insertData);

		if (category) return successResponse(res, `Category creation successfull`);
		return errorResponse(res, `An error occured`);
	} catch (error) {
		console.log(error);
		return errorResponse(res, `An error occured - ${error}`);
	}
};

// get all categories
const getCategories = async (req: Request, res: Response) => {
	try {
		const where: any = {};
		if (!req.params) {
			where.status = 'active';
		}
		const categories = await DB.categories.findAll({ where, order: [['id', 'DESC']] });

		if (!categories.length) return successResponse(res, `No address available!`, []);
		return successResponse(res, `${categories.length} category${categories.length > 1 ? 'es' : ''} retrived!`, categories);
	} catch (error) {
		console.log(error);
		return handleResponse(res, 401, false, `An error occured - ${error}`);
	}
};

// get category details
const getCategoryDetails = async (req: Request, res: Response) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return errorResponse(res, 'Validation Error', errors.array());
	}
	const { id } = req.params;
	try {
		const category = await DB.categories.findOne({ where: { id } });
		if (!category) return errorResponse(res, `Address with ID ${id} not found!`);
		return successResponse(res, `Address details retrived!`, category);
	} catch (error) {
		console.log(error);
		return handleResponse(res, 401, false, `An error occured - ${error}`);
	}
};

// update category
const updateCategory = async (req: Request, res: Response) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return errorResponse(res, 'Validation Error', errors.array());
	}
	const { id } = req.params;
	const { name, status } = req.body;
	try {
		const category = await DB.categories.findOne({ where: { id }, attributes: { exclude: ['createdAt', 'updatedAt'] } });
		if (!category) return errorResponse(res, `category not found!`);
		const updateData = {
			name: name || category.name,
			status: status || category.status,
		};
		const updatedCategory: any = await category.update(updateData);
		if (!updatedCategory) return errorResponse(res, `Unable to update category!`);
		return successResponse(res, `Category updated successfully`);
	} catch (error) {
		console.log(error);
		return errorResponse(res, `An error occured - ${error}`);
	}
};

// delete category
const deleteCategory = async (req: Request, res: Response) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return errorResponse(res, 'Validation Error', errors.array());
	}
	const { id } = req.params;
	try {
		const checkCategory = await DB.categories.findOne({ where: { id } });
		if (!checkCategory) return errorResponse(res, `Category with ID ${id} not found!`);
		await checkCategory.destroy({ force: true });
		return successResponse(res, `Category with ID ${id} deleted successfully!`);
	} catch (error) {
		console.log(error);
		return handleResponse(res, 401, false, `An error occured - ${error}`);
	}
};

// delete multiple category
const deleteMultipleCategories = async (req: Request, res: Response) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return errorResponse(res, 'Validation Error', errors.array());
	}
	const { ids }: IdsDataType = req.body;
	try {
		let errorArr = [];
		let successArr = [];
		for (let i = 0; i < ids.length; i++) {
			const checkCategory = await DB.addresses.findOne({
				where: { id: ids[i] },
			});
			if (checkCategory) {
				await checkCategory.destroy();
				successArr.push({
					successMsg: `Category with ID ${ids[i]} deleted successfully!`,
				});
			} else {
				errorArr.push({ errorMsg: `Category with ID ${ids[i]} not found!` });
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
	createCategory,
	getCategories,
	getCategoryDetails,
	updateCategory,
	deleteCategory,
	deleteMultipleCategories,
};
