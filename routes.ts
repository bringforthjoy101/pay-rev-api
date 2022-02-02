// Import packages
import { NextFunction, Router } from 'express';

// Import function files
import { preLogin, register, updatePassword, resetPassword, changePassword, verifyOtp, updateUserSettings } from './controllers/authentication';
import admin from './controllers/admins';
import business from './controllers/businesses';
import branch from './controllers/branches';
import category from './controllers/categories';
import revenueHead from './controllers/revenueHeads';
import validate from './validate';
import { isAdmin } from './helpers/middlewares';
import { AdminRoles } from './helpers/types';
import payments from './controllers/payments';

const router = Router();

/*************************************************************************
API CALL START
*************************************************************************/

// INDEX ROUTE TO SHOW API IS WORKING FINE
router.get('/', (req, res) => {
	return res.status(200).send('API Working');
});

router.post('/agent/register', validate('/register'), register);
router.post('/login', validate('/login'), preLogin);
router.post('/update-password', validate('/update-password'), updatePassword);
router.post('/reset-password', validate('/reset-password'), resetPassword);
router.post('/change-password', validate('/change-password'), changePassword);
router.post('/verify-otp', validate('/verify-otp'), verifyOtp);
router.post('/update-user-settings', validate('/update-user-settings'), updateUserSettings);

router.post('/admin/register', isAdmin([AdminRoles.CONTROL]), validate('/register'), admin.register);
router.post('/admin/login', validate('/login'), admin.login);
router.post('/admin/update-password', validate('/update-password'), admin.updatePassword);
router.post('/admin/reset-password', validate('/reset-password'), admin.resetPassword);
router.post('/admin/change-password', validate('/change-password'), admin.changePassword);

router.get('/business/:status?', isAdmin([AdminRoles.CONTROL]), business.getBusinesses);
router.get('/business/get-details/:id', validate('id'), business.getBusinessDetails);
router.get('/business/delete/:id', isAdmin([AdminRoles.CONTROL]), validate('id'), business.getBusinessDetails);
router.post('/business/create', isAdmin([AdminRoles.CONTROL]), business.createBusiness);
router.post('/business/update/:id', isAdmin([AdminRoles.CONTROL]), business.updateBusiness);

router.get('/branch/:status?', branch.getBranches);
router.get('/branch/get-details/:id', validate('id'), branch.getBranchDetails);
router.get('/branch/delete/:id', validate('id'), branch.getBranchDetails);
router.post('/branch/create', branch.createBranch);
router.post('/branch/update/:id', branch.updateBranch);

router.get('/category/:status?', category.getCategories);
router.get('/category/get-details/:id', validate('id'), category.getCategoryDetails);
router.get('/category/delete/:id', validate('id'), category.getCategoryDetails);
router.post('/category/create', category.createCategory);
router.post('/category/update/:id', category.updateCategory);

router.get('/revenue/:status?', revenueHead.getRevenueHeads);
router.get('/revenue/get-details/:id', validate('id'), revenueHead.getRevenueHeadDetails);
router.get('/revenue/delete/:id', validate('id'), revenueHead.getRevenueHeadDetails);
router.post('/revenue/create', revenueHead.createRevenueHead);
router.post('/revenue/update/:id', revenueHead.updateRevenueHead);

router.post('/payment/log', payments.logPayment);
router.get('/payments', payments.getPaymentLogs);
router.post('/payment/webhook', payments.paymentWebhook);

export default router;
