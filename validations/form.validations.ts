import { body, param, query } from 'express-validator';
import { 
  validateName, 
  validateEmail, 
  validateText,
  validateBoolean,
  validatePagination,
  validateSearch
} from './common.validations';


export const validateCreateContactForm = () => [
  body('storeId')
    .isUUID()
    .withMessage('Store ID must be a valid UUID'),
  body('firstName')
    .isString()
    .isLength({ min: 1, max: 100 })
    .withMessage('First name must be between 1 and 100 characters'),
  body('lastName')
    .isString()
    .isLength({ min: 1, max: 100 })
    .withMessage('Last name must be between 1 and 100 characters'),
  validateEmail('email'),
  body('subject')
    .isString()
    .isLength({ min: 1, max: 200 })
    .withMessage('Subject must be between 1 and 200 characters'),
  body('message')
    .isString()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Message must be between 10 and 2000 characters'),
  validateBoolean('agreeToPrivacyPolicy'),
  body('status')
    .optional()
    .isIn(['PENDING', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'])
    .withMessage('Status must be one of: PENDING, IN_PROGRESS, RESOLVED, CLOSED')
];

export const validateUpdateContactForm = () => [
  param('id')
    .isUUID()
    .withMessage('Contact Form ID must be a valid UUID'),
  body('firstName')
    .optional()
    .isString()
    .isLength({ min: 1, max: 100 })
    .withMessage('First name must be between 1 and 100 characters'),
  body('lastName')
    .optional()
    .isString()
    .isLength({ min: 1, max: 100 })
    .withMessage('Last name must be between 1 and 100 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('subject')
    .optional()
    .isString()
    .isLength({ min: 1, max: 200 })
    .withMessage('Subject must be between 1 and 200 characters'),
  body('message')
    .optional()
    .isString()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Message must be between 10 and 2000 characters'),
  body('status')
    .optional()
    .isIn(['PENDING', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'])
    .withMessage('Status must be one of: PENDING, IN_PROGRESS, RESOLVED, CLOSED')
];

export const validateGetContactForm = () => [
  param('id')
    .isUUID()
    .withMessage('Contact Form ID must be a valid UUID')
];

export const validateDeleteContactForm = () => [
  param('id')
    .isUUID()
    .withMessage('Contact Form ID must be a valid UUID')
];

export const validateGetContactForms = () => [
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
  query('status')
    .optional()
    .isIn(['PENDING', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'])
    .withMessage('Status must be one of: PENDING, IN_PROGRESS, RESOLVED, CLOSED'),
  query('dateFrom')
    .optional()
    .isISO8601()
    .withMessage('Date from must be a valid date'),
  query('dateTo')
    .optional()
    .isISO8601()
    .withMessage('Date to must be a valid date')
];

export const validateCreateNewsletterForm = () => [
  body('storeId')
    .isUUID()
    .withMessage('Store ID must be a valid UUID'),
  validateEmail('email'),
  body('status')
    .optional()
    .isIn(['ACTIVE', 'INACTIVE', 'UNSUBSCRIBED'])
    .withMessage('Status must be one of: ACTIVE, INACTIVE, UNSUBSCRIBED')
];

export const validateUpdateNewsletterForm = () => [
  param('id')
    .isUUID()
    .withMessage('Newsletter Form ID must be a valid UUID'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('status')
    .optional()
    .isIn(['ACTIVE', 'INACTIVE', 'UNSUBSCRIBED'])
    .withMessage('Status must be one of: ACTIVE, INACTIVE, UNSUBSCRIBED')
];

export const validateGetNewsletterForm = () => [
  param('id')
    .isUUID()
    .withMessage('Newsletter Form ID must be a valid UUID')
];

export const validateDeleteNewsletterForm = () => [
  param('id')
    .isUUID()
    .withMessage('Newsletter Form ID must be a valid UUID')
];

export const validateGetNewsletterForms = () => [
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
  query('status')
    .optional()
    .isIn(['ACTIVE', 'INACTIVE', 'UNSUBSCRIBED'])
    .withMessage('Status must be one of: ACTIVE, INACTIVE, UNSUBSCRIBED'),
  query('dateFrom')
    .optional()
    .isISO8601()
    .withMessage('Date from must be a valid date'),
  query('dateTo')
    .optional()
    .isISO8601()
    .withMessage('Date to must be a valid date')
];

export const validateSubscribeNewsletter = () => [
  body('storeId')
    .isUUID()
    .withMessage('Store ID must be a valid UUID'),
  validateEmail('email'),
  body('agreeToPrivacyPolicy')
    .isBoolean()
    .withMessage('Agree to privacy policy must be a boolean')
];

export const validateUnsubscribeNewsletter = () => [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('storeId')
    .optional()
    .isUUID()
    .withMessage('Store ID must be a valid UUID')
];

export const validateBulkFormOperation = () => [
  body('formIds')
    .isArray({ min: 1 })
    .withMessage('Form IDs must be a non-empty array'),
  body('formIds.*')
    .isUUID()
    .withMessage('Each form ID must be a valid UUID'),
  body('operation')
    .isIn(['delete', 'update_status', 'mark_resolved'])
    .withMessage('Operation must be one of: delete, update_status, mark_resolved'),
  body('status')
    .optional()
    .isIn(['PENDING', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'ACTIVE', 'INACTIVE', 'UNSUBSCRIBED'])
    .withMessage('Status must be one of the valid status values')
];
