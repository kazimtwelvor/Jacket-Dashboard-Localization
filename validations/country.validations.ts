import { body, param, query } from 'express-validator';
import { 
  validateName, 
  validateBoolean, 
  validatePagination,
  validateSearch
} from './common.validations';

export const validateCreateCountry = () => [
  validateName('name'),
  body('countryCode')
    .trim()
    .isLength({ min: 2, max: 2 })
    .withMessage('Country code must be exactly 2 characters')
    .matches(/^[a-z]{2}$/)
    .withMessage('Country code must be 2 lowercase letters (ISO 3166-1 alpha-2)'),
  body('currency')
    .optional()
    .trim()
    .isLength({ min: 3, max: 3 })
    .withMessage('Currency code must be exactly 3 characters')
    .matches(/^[A-Z]{3}$/)
    .withMessage('Currency code must be 3 uppercase letters (ISO 4217)'),
  body('currencySymbol')
    .optional()
    .trim()
    .isLength({ min: 1, max: 5 })
    .withMessage('Currency symbol must be between 1 and 5 characters'),
  body('phoneCode')
    .optional()
    .trim()
    .isLength({ min: 1, max: 10 })
    .withMessage('Phone code must be between 1 and 10 characters')
    .matches(/^\+?[0-9]+$/)
    .withMessage('Phone code must contain only numbers and optional + prefix'),
  body('timezone')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Timezone must be between 1 and 50 characters'),
  validateBoolean('isActive'),
  body('sortOrder')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Sort order must be a non-negative integer')
];

export const validateUpdateCountry = () => [
  param('id')
    .isUUID()
    .withMessage('Country ID must be a valid UUID'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters')
    .matches(/^[a-zA-Z\s\-'\.]+$/)
    .withMessage('Name can only contain letters, spaces, hyphens, apostrophes, and periods'),
  body('countryCode')
    .optional()
    .trim()
    .isLength({ min: 2, max: 2 })
    .withMessage('Country code must be exactly 2 characters')
    .matches(/^[a-z]{2}$/)
    .withMessage('Country code must be 2 lowercase letters (ISO 3166-1 alpha-2)'),
  body('currency')
    .optional()
    .trim()
    .isLength({ min: 3, max: 3 })
    .withMessage('Currency code must be exactly 3 characters')
    .matches(/^[A-Z]{3}$/)
    .withMessage('Currency code must be 3 uppercase letters (ISO 4217)'),
  body('currencySymbol')
    .optional()
    .trim()
    .isLength({ min: 1, max: 5 })
    .withMessage('Currency symbol must be between 1 and 5 characters'),
  body('phoneCode')
    .optional()
    .trim()
    .isLength({ min: 1, max: 10 })
    .withMessage('Phone code must be between 1 and 10 characters')
    .matches(/^\+?[0-9]+$/)
    .withMessage('Phone code must contain only numbers and optional + prefix'),
  body('timezone')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Timezone must be between 1 and 50 characters'),
  validateBoolean('isActive'),
  body('sortOrder')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Sort order must be a non-negative integer')
];

export const validateGetCountry = () => [
  param('id')
    .isUUID()
    .withMessage('Country ID must be a valid UUID')
];

export const validateDeleteCountry = () => [
  param('id')
    .isUUID()
    .withMessage('Country ID must be a valid UUID')
];

export const validateGetCountries = () => [
  ...validatePagination(),
  ...validateSearch(),
  query('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean value'),
  query('sortBy')
    .optional()
    .isIn(['name', 'countryCode', 'sortOrder', 'createdAt'])
    .withMessage('sortBy must be one of: name, countryCode, sortOrder, createdAt')
];

export const validateCountryCodeAvailability = () => [
  body('countryCode')
    .trim()
    .isLength({ min: 2, max: 2 })
    .withMessage('Country code must be exactly 2 characters')
    .matches(/^[a-z]{2}$/)
    .withMessage('Country code must be 2 lowercase letters (ISO 3166-1 alpha-2)'),
  body('countryId')
    .optional()
    .isUUID()
    .withMessage('Country ID must be a valid UUID')
];
