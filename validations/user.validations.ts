import { body, param, query } from 'express-validator';
import { 
  validateName, 
  validateEmail, 
  validatePassword, 
  validatePhone,
  validateBoolean,
  validatePagination,
  validateSearch
} from './common.validations';

export const validateCreateUser = () => [
  validateName('name'),
  validateEmail('email'),
  validatePassword('password'),
  body('role')
    .optional()
    .isIn(['SUPER_ADMIN', 'ADMIN', 'USER', 'STORE_ADMIN', 'STORE_MANAGER', 'CONTENT_EDITOR', 'CUSTOMER_SERVICE', 'CUSTOMER'])
    .withMessage('Role must be one of: SUPER_ADMIN, ADMIN, USER, STORE_ADMIN, STORE_MANAGER, CONTENT_EDITOR, CUSTOMER_SERVICE, CUSTOMER'),
  validateBoolean('isActive'),
  validateBoolean('isBanned'),
  validateBoolean('twoFactorEnabled'),
  body('clerkId')
    .optional()
    .isString()
    .isLength({ min: 1, max: 255 })
    .withMessage('Clerk ID must be between 1 and 255 characters')
];

export const validateUpdateUser = () => [
  param('id')
    .isUUID()
    .withMessage('User ID must be a valid UUID'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('role')
    .optional()
    .isIn(['SUPER_ADMIN', 'ADMIN', 'USER', 'STORE_ADMIN', 'STORE_MANAGER', 'CONTENT_EDITOR', 'CUSTOMER_SERVICE', 'CUSTOMER'])
    .withMessage('Role must be one of: SUPER_ADMIN, ADMIN, USER, STORE_ADMIN, STORE_MANAGER, CONTENT_EDITOR, CUSTOMER_SERVICE, CUSTOMER'),
  validateBoolean('isActive'),
  validateBoolean('isBanned'),
  validateBoolean('twoFactorEnabled'),
  body('clerkId')
    .optional()
    .isString()
    .isLength({ min: 1, max: 255 })
    .withMessage('Clerk ID must be between 1 and 255 characters')
];

export const validateGetUser = () => [
  param('id')
    .isUUID()
    .withMessage('User ID must be a valid UUID')
];

export const validateDeleteUser = () => [
  param('id')
    .isUUID()
    .withMessage('User ID must be a valid UUID')
];

export const validateGetUsers = () => [
  ...validatePagination(),
  ...validateSearch(),
  query('role')
    .optional()
    .isIn(['SUPER_ADMIN', 'ADMIN', 'USER', 'STORE_ADMIN', 'STORE_MANAGER', 'CONTENT_EDITOR', 'CUSTOMER_SERVICE', 'CUSTOMER'])
    .withMessage('Role must be one of: SUPER_ADMIN, ADMIN, USER, STORE_ADMIN, STORE_MANAGER, CONTENT_EDITOR, CUSTOMER_SERVICE, CUSTOMER'),
  query('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  query('isBanned')
    .optional()
    .isBoolean()
    .withMessage('isBanned must be a boolean')
];

export const validateUserRegistration = () => [
  validateName('name'),
  validateEmail('email'),
  validatePassword('password'),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password confirmation does not match password');
      }
      return true;
    })
];

export const validateUserLogin = () => [
  validateEmail('email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

export const validateChangePassword = () => [
  param('id')
    .isUUID()
    .withMessage('User ID must be a valid UUID'),
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  validatePassword('newPassword'),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Password confirmation does not match new password');
      }
      return true;
    })
];

export const validateResetPassword = () => [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address')
];

export const validateConfirmResetPassword = () => [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
  validatePassword('password'),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password confirmation does not match password');
      }
      return true;
    })
];

export const validateVerifyEmail = () => [
  body('token')
    .notEmpty()
    .withMessage('Verification token is required')
];

export const validateUpdateUserRole = () => [
  param('id')
    .isUUID()
    .withMessage('User ID must be a valid UUID'),
  body('role')
    .isIn(['SUPER_ADMIN', 'ADMIN', 'USER', 'STORE_ADMIN', 'STORE_MANAGER', 'CONTENT_EDITOR', 'CUSTOMER_SERVICE', 'CUSTOMER'])
    .withMessage('Role must be one of: SUPER_ADMIN, ADMIN, USER, STORE_ADMIN, STORE_MANAGER, CONTENT_EDITOR, CUSTOMER_SERVICE, CUSTOMER')
];

export const validateBanUser = () => [
  param('id')
    .isUUID()
    .withMessage('User ID must be a valid UUID'),
  body('isBanned')
    .isBoolean()
    .withMessage('isBanned must be a boolean'),
  body('reason')
    .optional()
    .isString()
    .isLength({ min: 1, max: 500 })
    .withMessage('Ban reason must be between 1 and 500 characters')
];

export const validateCreateStoreUser = () => [
  body('storeId')
    .isUUID()
    .withMessage('Store ID must be a valid UUID'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters'),
  body('role')
    .optional()
    .isIn(['OWNER', 'ADMIN', 'MANAGER', 'EDITOR', 'SUPPORT', 'VIEWER'])
    .withMessage('Role must be one of: OWNER, ADMIN, MANAGER, EDITOR, SUPPORT, VIEWER'),
  validatePhone('phone'),
  body('address')
    .optional()
    .isString()
    .isLength({ min: 1, max: 500 })
    .withMessage('Address must be between 1 and 500 characters'),
  body('city')
    .optional()
    .isString()
    .isLength({ min: 1, max: 100 })
    .withMessage('City must be between 1 and 100 characters'),
  body('state')
    .optional()
    .isString()
    .isLength({ min: 1, max: 100 })
    .withMessage('State must be between 1 and 100 characters'),
  body('zipCode')
    .optional()
    .isString()
    .isLength({ min: 1, max: 20 })
    .withMessage('Zip code must be between 1 and 20 characters'),
  body('country')
    .optional()
    .isString()
    .isLength({ min: 1, max: 100 })
    .withMessage('Country must be between 1 and 100 characters'),
  body('permissions')
    .optional()
    .isArray()
    .withMessage('Permissions must be an array'),
  body('permissions.*')
    .optional()
    .isIn(['MANAGE_STORE', 'MANAGE_PRODUCTS', 'MANAGE_ORDERS', 'MANAGE_CUSTOMERS', 'MANAGE_STAFF', 'MANAGE_SETTINGS', 'MANAGE_MARKETING', 'VIEW_ANALYTICS', 'PROCESS_REFUNDS', 'MANAGE_REVIEWS'])
    .withMessage('Each permission must be one of the valid permission types'),
  validateBoolean('isOwner'),
  validateBoolean('isVerified')
];

export const validateUpdateStoreUser = () => [
  param('id')
    .isUUID()
    .withMessage('StoreUser ID must be a valid UUID'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters'),
  body('role')
    .optional()
    .isIn(['OWNER', 'ADMIN', 'MANAGER', 'EDITOR', 'SUPPORT', 'VIEWER'])
    .withMessage('Role must be one of: OWNER, ADMIN, MANAGER, EDITOR, SUPPORT, VIEWER'),
  validatePhone('phone'),
  body('address')
    .optional()
    .isString()
    .isLength({ min: 1, max: 500 })
    .withMessage('Address must be between 1 and 500 characters'),
  body('city')
    .optional()
    .isString()
    .isLength({ min: 1, max: 100 })
    .withMessage('City must be between 1 and 100 characters'),
  body('state')
    .optional()
    .isString()
    .isLength({ min: 1, max: 100 })
    .withMessage('State must be between 1 and 100 characters'),
  body('zipCode')
    .optional()
    .isString()
    .isLength({ min: 1, max: 20 })
    .withMessage('Zip code must be between 1 and 20 characters'),
  body('country')
    .optional()
    .isString()
    .isLength({ min: 1, max: 100 })
    .withMessage('Country must be between 1 and 100 characters'),
  body('permissions')
    .optional()
    .isArray()
    .withMessage('Permissions must be an array'),
  body('permissions.*')
    .optional()
    .isIn(['MANAGE_STORE', 'MANAGE_PRODUCTS', 'MANAGE_ORDERS', 'MANAGE_CUSTOMERS', 'MANAGE_STAFF', 'MANAGE_SETTINGS', 'MANAGE_MARKETING', 'VIEW_ANALYTICS', 'PROCESS_REFUNDS', 'MANAGE_REVIEWS'])
    .withMessage('Each permission must be one of the valid permission types'),
  validateBoolean('isOwner'),
  validateBoolean('isVerified')
];
