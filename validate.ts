import { body, param } from 'express-validator';

const validate = (method: string): any => {
	switch (method) {
		case '/register': {
			return [
				body('names').not().isEmpty().isString().withMessage('names is required!'),
				body('email').not().isEmpty().isString().withMessage('Email is required!'),
				body('password').not().isEmpty().isString().withMessage('Password is required!'),
				body('phone').not().isEmpty().isString().withMessage('Phone is required!'),
				body('role').optional().isString().withMessage('role is required'),
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
			const validType = ['verification', 'reset', '2fa'];
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
			return [param('id').isInt().withMessage('ID must be a number!')];
		}
	}
};

export default validate;
