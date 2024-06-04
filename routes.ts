// Import packages
import { Router } from 'express';

// Import function files
import {
	preLogin,
	register,
	updatePassword,
	resetPassword,
	changePassword,
	verifyOtp,
	updateUserSettings,
	updateProfileSettings,
	addAccount,
	sendUserOtp,
	uploadProfile,
	updateUserStatus,
	updateUser,
} from './controllers/authentication';
import admin from './controllers/admins';
import business from './controllers/businesses';
import mda from './controllers/mdas';
import role from './controllers/role';
import category from './controllers/categories';
import revenueHead from './controllers/revenueHeads';
import invoice from './controllers/invoices';
import validate from './validate';
import { isAdmin, isAuthorized } from './helpers/middlewares';
import payments from './controllers/payments';
import { uploadFile } from './helpers/upload';
import { AdminRoles } from './models/Admins';

const router = Router();

/*************************************************************************
API CALL START
*************************************************************************/

// INDEX ROUTE TO SHOW API IS WORKING FINE
router.get('/', (req, res) => {
	return res.status(200).send('API Working');
});

router.post('/staff/register', validate('staff-register'), register);
router.post('/staff/add-account', isAuthorized, validate('/staff/add-account'), addAccount);
router.post('/login', validate('/login'), preLogin);
router.post('/update-password', validate('/update-password'), updatePassword);
router.post('/reset-password', validate('/reset-password'), resetPassword);
router.post('/change-password', validate('/change-password'), changePassword);
router.post('/verify-otp', validate('/verify-otp'), verifyOtp);
router.get('/otp/send', isAuthorized, sendUserOtp);
router.post('/update-user-settings', validate('/update-user-settings'), updateUserSettings);
router.post('/update-profile-settings', isAuthorized, validate('/update-profile-settings'), updateProfileSettings);
router.post('/update-user', isAuthorized, validate('/update-user'), updateUser);
router.post('/update-user-status', validate('/update-user-status'), updateUserStatus);
router.post('/update-picture/:dir?', isAuthorized, validate('/update-picture'), uploadFile.single('file'), uploadProfile);

router.post('/admin/register', validate('/register'), admin.register);
router.post('/admin/login', validate('/login'), admin.login);
router.post('/admin/update-password', validate('/update-password'), admin.updatePassword);
router.post('/admin/reset-password', validate('/reset-password'), admin.resetPassword);
router.post('/admin/change-password', validate('/change-password'), admin.changePassword);

router.get('/business/:status?', business.getBusinesses);
router.get('/business/get-details/:id', validate('id'), business.getBusinessDetails);
router.get('/business/delete/:id', isAdmin([AdminRoles.CONTROL]), validate('id'), business.getBusinessDetails);
router.post('/business/create', isAdmin([AdminRoles.CONTROL]), business.createBusiness);
router.post('/business/update/:id', isAdmin([AdminRoles.CONTROL]), business.updateBusiness);

router.get('/mda', mda.getMdas);
router.get('/mda/business/:id', mda.getMdaByBusiness);
router.get('/mda/get-details/:id', validate('id'), mda.getMdaDetails);
router.delete('/mda/:id', validate('id'), mda.deleteMda);
router.post('/mda', isAuthorized, validate('mda'), mda.createMda);
router.put('/mda/:id', isAuthorized, mda.updateMda);

router.get('/category/:status?', category.getCategories);
router.get('/category/get-details/:id', validate('id'), category.getCategoryDetails);
router.get('/category/delete/:id', validate('id'), category.getCategoryDetails);
router.post('/category/create', category.createCategory);
router.post('/category/update/:id', category.updateCategory);

router.get('/revenue-head', revenueHead.getRevenueHeads);
router.get('/revenue-head/get-details/:id', validate('id'), revenueHead.getRevenueHeadDetails);
router.get('/revenue-head/:id', validate('id'), revenueHead.getRevenueHeadDetails);
router.get('/revenue-head/mda/:id', validate('id'), revenueHead.getRevenueHeadByMda);
router.post('/revenue-head', isAuthorized, validate('create-revenue-heads'), revenueHead.createRevenueHead);
router.put('/revenue-head/:id', isAuthorized, revenueHead.updateRevenueHead);

router.post('/payment/log', validate('log-payment'), payments.logPayment);
router.post('/payment/complete/:tnxRef', validate('complete-payment'), payments.completePayment);
router.get('/payments', isAuthorized, payments.getPaymentLogs);
router.get('/payment-logs/:businessId', isAuthorized, payments.getPaymentLogsByBusiness);
router.get('/recent-payment-logs/:businessId', isAuthorized, payments.getRecentPaymentLogs);
router.post('/transaction-analytics/:businessId', isAuthorized, payments.getTransactionAnalytics);
router.post('/revenue-overview/:businessId', isAuthorized, payments.getRevenueOverview);
router.get('/payments/:id', isAuthorized, payments.getPaymentLogsById);
router.get('/payments/revalidate/:id', isAuthorized, payments.revalidatePayment);
router.get('/payments/email/:email', isAuthorized, payments.getPaymentLogsByEmail);
router.post('/payment/webhook', payments.paymentWebhook);

router.post('/invoice', isAuthorized, validate('create-invoice'), invoice.createInvoice);
router.get('/invoice', isAuthorized, invoice.getInvoices);
router.get('/invoice/:id', isAuthorized, invoice.getInvoicesById);
router.get('/invoice/email/:email', isAuthorized, invoice.getInvoicesByEmail);
router.post('/invoice/update/:id', isAuthorized, invoice.updateInvoice);

router.get('/role', role.getRoles);
router.get('/role/get-details/:id', validate('id'), role.getRole);
router.delete('/role/delete/:id', validate('id'), role.deleteRole);
router.post('/role/create', role.createRole);
router.post('/role/update/:id', role.updateRole);

export default router;
