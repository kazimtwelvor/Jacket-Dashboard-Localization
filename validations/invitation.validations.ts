import { body, param, query } from 'express-validator';
import { 
  validateEmail, 
  validateBoolean,
  validatePagination,
  validateSearch
} from './common.validations';

export const validateCreateInvitation = () => [
  body('storeId')
    .isUUID()
    .withMessage('Store ID must be a valid UUID'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('role')
    .optional()
    .isIn(['OWNER', 'ADMIN', 'MANAGER', 'EDITOR', 'SUPPORT', 'VIEWER'])
    .withMessage('Role must be one of: OWNER, ADMIN, MANAGER, EDITOR, SUPPORT, VIEWER'),
  body('permissions')
    .optional()
    .isArray()
    .withMessage('Permissions must be an array'),
  body('permissions.*')
    .optional()
    .isIn(['MANAGE_STORE', 'MANAGE_PRODUCTS', 'MANAGE_ORDERS', 'MANAGE_CUSTOMERS', 'MANAGE_STAFF', 'MANAGE_SETTINGS', 'MANAGE_MARKETING', 'VIEW_ANALYTICS', 'PROCESS_REFUNDS', 'MANAGE_REVIEWS'])
    .withMessage('Each permission must be one of the valid permission types'),
  body('expires')
    .optional()
    .isISO8601()
    .withMessage('Expires must be a valid date')
];

// Update Invitation validation
export const validateUpdateInvitation = () => [
  param('id')
    .isUUID()
    .withMessage('Invitation ID must be a valid UUID'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('role')
    .optional()
    .isIn(['OWNER', 'ADMIN', 'MANAGER', 'EDITOR', 'SUPPORT', 'VIEWER'])
    .withMessage('Role must be one of: OWNER, ADMIN, MANAGER, EDITOR, SUPPORT, VIEWER'),
  body('permissions')
    .optional()
    .isArray()
    .withMessage('Permissions must be an array'),
  body('permissions.*')
    .optional()
    .isIn(['MANAGE_STORE', 'MANAGE_PRODUCTS', 'MANAGE_ORDERS', 'MANAGE_CUSTOMERS', 'MANAGE_STAFF', 'MANAGE_SETTINGS', 'MANAGE_MARKETING', 'VIEW_ANALYTICS', 'PROCESS_REFUNDS', 'MANAGE_REVIEWS'])
    .withMessage('Each permission must be one of the valid permission types'),
  body('status')
    .optional()
    .isIn(['PENDING', 'ACCEPTED', 'EXPIRED', 'CANCELLED'])
    .withMessage('Status must be one of: PENDING, ACCEPTED, EXPIRED, CANCELLED'),
  body('expires')
    .optional()
    .isISO8601()
    .withMessage('Expires must be a valid date')
];

// Get Invitation by ID validation
export const validateGetInvitation = () => [
  param('id')
    .isUUID()
    .withMessage('Invitation ID must be a valid UUID')
];

// Delete Invitation validation
export const validateDeleteInvitation = () => [
  param('id')
    .isUUID()
    .withMessage('Invitation ID must be a valid UUID')
];

// Get Invitations validation (with pagination and search)
export const validateGetInvitations = () => [
  ...validatePagination(),
  ...validateSearch(),
  query('storeId')
    .optional()
    .isUUID()
    .withMessage('Store ID must be a valid UUID'),
  query('email')
    .optional()
    .isEmail()
    .withMessage('Email must be a valid email address'),
  query('role')
    .optional()
    .isIn(['OWNER', 'ADMIN', 'MANAGER', 'EDITOR', 'SUPPORT', 'VIEWER'])
    .withMessage('Role must be one of: OWNER, ADMIN, MANAGER, EDITOR, SUPPORT, VIEWER'),
  query('status')
    .optional()
    .isIn(['PENDING', 'ACCEPTED', 'EXPIRED', 'CANCELLED'])
    .withMessage('Status must be one of: PENDING, ACCEPTED, EXPIRED, CANCELLED')
];

// Accept Invitation validation
export const validateAcceptInvitation = () => [
  body('token')
    .notEmpty()
    .withMessage('Token is required'),
  body('userId')
    .optional()
    .isUUID()
    .withMessage('User ID must be a valid UUID'),
  body('name')
    .optional()
    .isString()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address')
];

// Verify Invitation validation
export const validateVerifyInvitation = () => [
  body('token')
    .notEmpty()
    .withMessage('Token is required')
];

// Resend Invitation validation
export const validateResendInvitation = () => [
  param('id')
    .isUUID()
    .withMessage('Invitation ID must be a valid UUID')
];

// Cancel Invitation validation
export const validateCancelInvitation = () => [
  param('id')
    .isUUID()
    .withMessage('Invitation ID must be a valid UUID'),
  body('reason')
    .optional()
    .isString()
    .isLength({ min: 1, max: 500 })
    .withMessage('Reason must be between 1 and 500 characters')
];

// Bulk Invitation operations validation
export const validateBulkInvitationOperation = () => [
  body('invitationIds')
    .isArray({ min: 1 })
    .withMessage('Invitation IDs must be a non-empty array'),
  body('invitationIds.*')
    .isUUID()
    .withMessage('Each invitation ID must be a valid UUID'),
  body('operation')
    .isIn(['cancel', 'resend', 'expire'])
    .withMessage('Operation must be one of: cancel, resend, expire')
];
