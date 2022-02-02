// Import packages
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Import db & configs
import config from '../config/configSetup';
import DB from '../controllers/db';

// Import function files
import { errorResponse, fnResponse, handleResponse } from '../helpers/utility';

export const isAuthorized = async (req: Request, res: Response, next: NextFunction) => {
	//this is the url without query params
	const route: any = req.originalUrl.split('?').shift();
	const publicRoutes: string[] = config.PUBLIC_ROUTES;

	if (publicRoutes.includes(route)) return next();
	console.log(route);

	let token: any = req.headers.authorization;
	if (!token) return handleResponse(res, 401, false, `Access Denied / Unauthorized request`);

	try {
		token = token.split(' ')[1]; // Remove Bearer from string
		if (token === 'null' || !token) return handleResponse(res, 401, false, `Unauthorized request`);
		let verified: any = jwt.verify(token, config.JWTSECRET);
		if (!verified) return handleResponse(res, 401, false, `Unauthorized request`);
		if (verified.type === 'admin') {
			req.admin = verified;
		} else {
			req.agent = verified;
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

export const checkBusiness = async (id: number) => {
	try {
		const business = await DB.businesses.findByPk(id);
		if (!business) return fnResponse({ status: false, message: 'Businesss not found', data: null });
		return fnResponse({ status: true, message: 'Business Found', data: business });
	} catch (error) {
		console.log(error);
		return { status: false, message: 'An error occured', data: error };
	}
};

export const checkBranch = async (id: number) => {
	try {
		const branch = await DB.branches.findByPk(id);
		if (!branch) return fnResponse({ status: false, message: 'Branch not found', data: null });
		return fnResponse({ status: true, message: 'Branch Found', data: branch });
	} catch (error) {
		console.log(error);
		return { status: false, message: 'An error occured', data: error };
	}
};

export const checkRevenueHead = async (id: number) => {
	try {
		const revenue = await DB.revenueHeads.findByPk(id);
		if (!revenue) return fnResponse({ status: false, message: 'Revenue Head not found', data: null });
		return fnResponse({ status: true, message: 'Revenue Head Found', data: revenue });
	} catch (error) {
		console.log(error);
		return { status: false, message: 'An error occured', data: error };
	}
};
