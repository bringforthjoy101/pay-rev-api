// Import packages
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Import db & configs
import config from '../config/configSetup';

// Import function files
import { errorResponse, fnResponse, handleResponse } from '../helpers/utility';
import { Businesses } from '../models/Businesses';
import { Mdas } from '../models/Mdas';
import { RevenueHeads } from '../models/RevenueHeads';

export const isAuthorized = async (req: Request, res: Response, next: NextFunction) => {
	//this is the url without query params
	const route: any = req.originalUrl.split('?').shift();
	const publicRoutes: string[] = config.PUBLIC_ROUTES;

	if (publicRoutes.includes(route)) return next();

	let token: any = req.headers.authorization;
	if (!token) return handleResponse(res, 401, false, `Access Denied / Unauthorized request`);

	try {
		token = token.split(' ')[1]; // Remove Bearer from string
		if (token === 'null' || !token) return handleResponse(res, 401, false, `Unauthorized request`);
		let verified: any = jwt.verify(token, config.JWTSECRET);

		if (!verified) return handleResponse(res, 401, false, `Unauthorized request`);
		// console.log('🚀 ~ file: middlewares.ts:53 ~ isAuthorized ~ verified', verified);
		if (verified.type === 'admin') {
			req.admin = verified;
		} else {
			req.staff = verified;
		}
		next();
	} catch (error) {
		handleResponse(res, 400, false, `Token Expired`);
	}
};

export const isAdmin = (roles: string[]) => {
	return (req: Request, res: Response, next: NextFunction) => {
		if (!req.admin) return handleResponse(res, 401, false, `Unauthorized access`);
		if (!roles.includes(req.admin.role)) return handleResponse(res, 401, false, `Permission denied`);
		next();
	};
};

export const isStaff = (roles: string[]) => {
	return (req: Request, res: Response, next: NextFunction) => {
		if (!req.staff) return handleResponse(res, 401, false, `Unauthorized access`);
		if (!roles.includes(req.staff.role)) return handleResponse(res, 401, false, `Permission denied`);
		next();
	};
};

export const isAdminOrStaff = (adminRoles: string[], staffRoles: string[]) => {
	return (req: Request, res: Response, next: NextFunction) => {
		if (!req.admin && !req.staff) return handleResponse(res, 401, false, `Unauthorized access`);
		if ((req.admin && adminRoles.includes(req.admin.role)) || (req.staff && staffRoles.includes(req.staff.role))) next();
		else return handleResponse(res, 401, false, `Permission denied`);
	};
};

export const checkBusiness = async (id: number) => {
	try {
		const business = await Businesses.findByPk(id);
		if (!business) return fnResponse({ status: false, message: 'Business not found', data: null });
		return fnResponse({ status: true, message: 'Business Found', data: business });
	} catch (error) {
		console.log(error);
		return { status: false, message: 'An error occurred', data: error };
	}
};

export const checkMda = async (id: string) => {
	try {
		const mda = await Mdas.findByPk(id);
		console.log('🚀 ~ file: middlewares.ts:77 ~ checkMda ~ mda:', mda);
		if (!mda) return fnResponse({ status: false, message: 'mda not found', data: null });
		return fnResponse({ status: true, message: 'mda Found', data: mda });
	} catch (error) {
		console.log(error);
		return { status: false, message: 'An error occurred', data: error };
	}
};

export const checkRevenueHead = async (id: string) => {
	try {
		const revenue = await RevenueHeads.findByPk(id, {
			include: [
				{
					model: Mdas,
					include: [
						{
							model: Businesses,
						},
					],
				},
			],
		});

		if (!revenue) return fnResponse({ status: false, message: 'Revenue Head not found', data: null });
		return fnResponse({ status: true, message: 'Revenue Head Found', data: revenue });
	} catch (error) {
		console.log(error);
		return { status: false, message: 'An error occurred', data: error };
	}
};
