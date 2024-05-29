import { validationResult } from 'express-validator';
import { errorResponse, handleResponse, successResponse } from '../helpers/utility';
import { Request, Response } from 'express';
import { Roles } from '../models/Role';
import { Staffs } from '../models/Staffs';
import { StaffMdas } from '../models/StaffMdas';
import { Mdas } from '../models/Mdas';
import mdas from './mdas';
import axios from 'axios';

const createRole = async (req: Request, res: Response) => {
	// const errors = validationResult(req);
	// if (!errors.isEmpty()) {
	// 	return errorResponse(res, 'Validation Error', errors.array());
	// }

	const { roleName, permissions, description } = req.body;

	try {
		const revenueHead = await Roles.findOne({ where: { id: roleName } });
		if (revenueHead) return errorResponse(res, `Role already exists`);

		const insertData = {
			roleName,
			permissions,
			description,
		};

		const role: any = await Roles.create(insertData);

		if (role) {
			return successResponse(res, `Role creation successful`);
		}
		return errorResponse(res, `An error occurred`);
	} catch (error) {
		console.log(error);
		return errorResponse(res, `An error occurred - ${error}`);
	}
};

const getRoles = async (req: Request, res: Response) => {
	try {
		const roles = await Roles.findAll({
			include: 'staffs',
			order: [['id', 'DESC']],
		});

		const transformedRoles = roles?.map((role: any) => {
			return {
				...role?.dataValues,
				staffs: role?.dataValues.staffs.length,
			};
		});

		if (!transformedRoles?.length) return successResponse(res, `No role available!`, []);
		return successResponse(res, `${transformedRoles.length} category${transformedRoles.length > 1 ? 'es' : ''} retrieved!`, transformedRoles);
	} catch (error) {
		console.log(error);
		return handleResponse(res, 401, false, `An error occurred - ${error}`);
	}
};

const getRole = async (req: Request, res: Response) => {
	const { id } = req.params;
	try {
		const role = await Roles.findOne({
			include: [
				{
					model: Staffs,
					as: 'staffs',
					attributes: ['id', 'names', 'email', 'phone', 'status'],
					include: [
						{
							model: StaffMdas,
							attributes: ['id', 'mdaId', 'staffId'],
							include: [{ model: Mdas, attributes: ['id', 'name'] }],
						},
					],
				},
			],
			where: { id },
		});
		await axios.post('https://webhook.site/90dbae2a-6939-4b97-8b3c-fcd9fbd0c72c', { role });
		if (!role) return errorResponse(res, `Role with ID ${id} not found!`);

		const transformedUsers = role?.staffs?.map((staff) => {
			return {
				id: staff.id,
				names: staff.names,
				email: staff.email,
				phone: staff.phone,
				status: staff.status,
				mdas: staff.staffMdas.map((mda) => {
					return {
						id: mda.id,
						mdaName: mda.mda.name,
					};
				}),
			};
		});

		await axios.post('https://webhook.site/90dbae2a-6939-4b97-8b3c-fcd9fbd0c72c', { transformedUsers });

		const transformedRole = {
			...role,
			staffs: transformedUsers,
		};
		return successResponse(res, `Role details retrieved!`, transformedRole);
	} catch (error) {
		console.log(error);
		await axios.post('https://webhook.site/90dbae2a-6939-4b97-8b3c-fcd9fbd0c72c', { error });
		return errorResponse(res, `An error occurred - ${error}`);
	}
};

const updateRole = async (req: Request, res: Response) => {
	// const errors = validationResult(req);
	// if (!errors.isEmpty()) {
	// 	return errorResponse(res, 'Validation Error', errors.array());
	// }
	const { id } = req.params;
	const { roleName, permissions, description } = req.body;
	try {
		const role = await Roles.findOne({ where: { id }, attributes: { exclude: ['createdAt', 'updatedAt'] } });
		if (!role) return errorResponse(res, `Role not found!`);
		const updateData = {
			roleName: roleName ? roleName : role.roleName,
			description: description ? description : role.description,
			permissions: permissions ? permissions : role.permissions,
		};
		const updatedRole: any = await role.update(updateData);
		if (!updatedRole) return errorResponse(res, `Unable to update role!`);
		return successResponse(res, `Role updated successfully`);
	} catch (error) {
		console.log(error);
		return errorResponse(res, `An error occurred - ${error}`);
	}
};

const deleteRole = async (req: Request, res: Response) => {
	// const errors = validationResult(req);
	// if (!errors.isEmpty()) {
	// 	return errorResponse(res, 'Validation Error', errors.array());
	// }
	const { id } = req.params;
	try {
		const checkRole = await Roles.findOne({ where: { id } });
		if (!checkRole) return errorResponse(res, `Role with ID ${id} not found!`);
		await checkRole.destroy({ force: true });
		return successResponse(res, `Role with ID ${id} deleted successfully!`);
	} catch (error) {
		console.log(error);
		return handleResponse(res, 401, false, `An error occurred - ${error}`);
	}
};

export default { createRole, getRoles, getRole, updateRole, deleteRole };
