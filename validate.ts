import { body, param, CustomSanitizer } from 'express-validator';

const validate = (method: string): any => {
	switch (method) {
		case '/register': {
			return [
				body('names').not().isEmpty().isString().withMessage('names is required!'),
				body('email').not().isEmpty().isString().withMessage('Email is required!'),
				body('password').not().isEmpty().isString().withMessage('Password is required!'),
				body('phone').not().isEmpty().isString().withMessage('Phone is required!'),
				body('roleId').optional().isString().withMessage('role is required'),
			];
		}
		case '/staff/add-account': {
			return [
				body('names').not().isEmpty().isString().withMessage('names is required!'),
				body('email').not().isEmpty().isString().withMessage('Email is required!'),
				body('phone').not().isEmpty().isString().withMessage('Phone is required!'),
				body('roleId').optional().isString().withMessage('role is required'),
				body('businessId').optional().isString().withMessage('role is required'),
			];
		}
		case '/update-profile-settings': {
			return [
				body('names').optional().isString().withMessage('names is required!'),
				body('email').optional().isString().withMessage('Email is required!'),
				body('phone').optional().isString().withMessage('Phone is required!'),
				body('mdas').optional().isObject().withMessage('Phone is required!'),
			];
		}
		case '/change-role': {
			return [
				body('names').optional().isString().withMessage('names is required!'),
				body('email').optional().isString().withMessage('Email is required!'),
				body('roleId').optional().isString().withMessage('Role ID is required!'),
			];
		}
		case '/login': {
			return [
				body('email').not().isEmpty().isString().withMessage('Email is required!'),
				body('password').not().isEmpty().isString().withMessage('Password is required!'),
			];
		}
		case '/update-user-settings': {
			return [body('twoFa').not().isEmpty().isBoolean().withMessage('2fa is required and must be boolean!')];
		}
		case '/update-password': {
			return [
				body('email').not().isEmpty().isString().withMessage('Email is required!'),
				body('oldPassword').not().isEmpty().isString().withMessage('Old password is required!'),
				body('newPassword').not().isEmpty().isString().withMessage('New password is required!'),
			];
		}
		case '/reset-password': {
			return [body('email').not().isEmpty().isString().withMessage('Email is required!')];
		}
		case '/change-password': {
			return [
				body('token').not().isEmpty().isString().withMessage('token is required!'),
				body('password').not().isEmpty().isString().withMessage('password is required!'),
			];
		}
		case '/verify-otp': {
			const validType = ['verification', 'reset', '2fa', 'validate'];
			return [
				body('token').not().isEmpty().isString().withMessage('token is required!'),
				body('email').not().isEmpty().isString().withMessage('email is required!'),
				body('type')
					.not()
					.isEmpty()
					.custom((value) => {
						return validType.includes(value);
					})
					.withMessage(`type can only include ${validType}`),
				body('otp')
					.not()
					.isEmpty()
					.custom((value) => {
						return Number(value);
					})
					.withMessage('otp is required!'),
			];
		}
		case 'id': {
			return [param('id').isUUID(4).withMessage('ID must be a valid UUID!')];
		}
		case 'mda': {
			return [
				body('name').not().isEmpty().isString().withMessage('name is required!'),
				body('address').not().isEmpty().isString().withMessage('address is required!'),
				body('publicKey').optional().isString().withMessage('publicKey is required'),
				body('secretKey').optional().isString().withMessage('secretKey is required'),
			];
		}
		case 'staff-register': {
			return [
				body('names').not().isEmpty().isString().withMessage('name is required!'),
				body('email').not().isEmpty().isString().withMessage('Email is required!'),
				body('password').not().isEmpty().isString().withMessage('Password is required!'),
				body('phone').not().isEmpty().isString().withMessage('Phone is required!'),
				body('businessId').not().isEmpty().isString().withMessage('businessId is required!'),
				body('roleId').notEmpty().isString().withMessage('role is required'),
			];
		}
		case 'create-revenue-heads': {
			return [
				body('name').not().isEmpty().isString().withMessage('name is required!'),
				body('amount').not().isEmpty().isCurrency().withMessage('amount is required!'),
				body('mdaId').not().isEmpty().isString().withMessage('mdaId is required!'),
				body('amountEditable').optional().isBoolean(),
			];
		}
		case 'log-payment': {
			return [
				body('payeeName').not().isEmpty().isString().withMessage('payeeName is required!'),
				body('payeePhone').not().isEmpty().isString().withMessage('payeePhone is required!'),
				body('payeeEmail').not().isEmpty().isString().withMessage('payeeEmail is required!'),
				body('tnxRef').not().isEmpty().isString().withMessage('tnxRef is required!'),
				body('amount').not().isEmpty().isCurrency().withMessage('amount is required!'),
				body('revenueHeadId').not().isEmpty().isUUID().withMessage('revenueHeadId is required!'),
			];
		}
		case 'complete-payment': {
			return [param('tnxRef').not().isEmpty().isString().withMessage('tnxRef is required!')];
		}
		case 'create-invoice': {
			return [
				body('amount').not().isEmpty().isCurrency().withMessage('amount is required!'),
				body('revenueHeadId').not().isEmpty().isUUID().withMessage('revenueHeadId is required!'),
			];
		}
		case '/update-picture': {
			const validDir = ['profile', 'doc', 'business'];
			return [
				param('dir')
					.custom((value) => !validDir.includes(value))
					.withMessage(`Dir must contain ${validDir}`),
			];
		}
	}
};

export default validate;
