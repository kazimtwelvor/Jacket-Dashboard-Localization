import { body, param, query } from 'express-validator';
import { 
  validateName, 
  validateURL, 
  validatePagination,
  validateSearch
} from './common.validations';

export const validateCreateBillboard = () => [
  body('storeId')
    .isUUID()
    .withMessage('Store ID must be a valid UUID'),
  validateName('label'),
  body('imageUrl')
    .isURL()
    .withMessage('Image URL must be a valid URL'),
  body('categories')
    .optional()
    .isArray()
    .withMessage('Categories must be an array'),
  body('categories.*')
    .optional()
    .isUUID()
    .withMessage('Each category ID must be a valid UUID')
];

export const validateUpdateBillboard = () => [
  param('id')
    .isUUID()
    .withMessage('Billboard ID must be a valid UUID'),
  body('label')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Label must be between 1 and 100 characters'),
  body('imageUrl')
    .optional()
    .isURL()
    .withMessage('Image URL must be a valid URL'),
  body('categories')
    .optional()
    .isArray()
    .withMessage('Categories must be an array'),
  body('categories.*')
    .optional()
    .isUUID()
    .withMessage('Each category ID must be a valid UUID')
];

export const validateGetBillboard = () => [
  param('id')
    .isUUID()
    .withMessage('Billboard ID must be a valid UUID')
];

export const validateDeleteBillboard = () => [
  param('id')
    .isUUID()
    .withMessage('Billboard ID must be a valid UUID')
];

export const validateGetBillboards = () => [
  ...validatePagination(),
  ...validateSearch(),
  query('storeId')
    .optional()
    .isUUID()
    .withMessage('Store ID must be a valid UUID')
];

export const validateCreateSize = () => [
  body('storeId')
    .isUUID()
    .withMessage('Store ID must be a valid UUID'),
  validateName('name'),
  body('value')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Value must be between 1 and 50 characters')
];

export const validateUpdateSize = () => [
  param('id')
    .isUUID()
    .withMessage('Size ID must be a valid UUID'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters'),
  body('value')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Value must be between 1 and 50 characters')
];

export const validateGetSize = () => [
  param('id')
    .isUUID()
    .withMessage('Size ID must be a valid UUID')
];

export const validateDeleteSize = () => [
  param('id')
    .isUUID()
    .withMessage('Size ID must be a valid UUID')
];

export const validateGetSizes = () => [
  ...validatePagination(),
  ...validateSearch(),
  query('storeId')
    .optional()
    .isUUID()
    .withMessage('Store ID must be a valid UUID')
];

export const validateCreateColor = () => [
  body('storeId')
    .isUUID()
    .withMessage('Store ID must be a valid UUID'),
  validateName('name'),
  body('value')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Value must be between 1 and 50 characters'),
  body('value2')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Value2 must be between 1 and 50 characters')
];

export const validateUpdateColor = () => [
  param('id')
    .isUUID()
    .withMessage('Color ID must be a valid UUID'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters'),
  body('value')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Value must be between 1 and 50 characters'),
  body('value2')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Value2 must be between 1 and 50 characters')
];

export const validateGetColor = () => [
  param('id')
    .isUUID()
    .withMessage('Color ID must be a valid UUID')
];

export const validateDeleteColor = () => [
  param('id')
    .isUUID()
    .withMessage('Color ID must be a valid UUID')
];

export const validateGetColors = () => [
  ...validatePagination(),
  ...validateSearch(),
  query('storeId')
    .optional()
    .isUUID()
    .withMessage('Store ID must be a valid UUID')
];

export const validateCreateImage = () => [
  body('url')
    .isURL()
    .withMessage('URL must be a valid URL'),
  body('altText')
    .optional()
    .isString()
    .isLength({ min: 1, max: 255 })
    .withMessage('Alt text must be between 1 and 255 characters'),
  body('title')
    .optional()
    .isString()
    .isLength({ min: 1, max: 255 })
    .withMessage('Title must be between 1 and 255 characters'),
  body('caption')
    .optional()
    .isString()
    .isLength({ min: 1, max: 255 })
    .withMessage('Caption must be between 1 and 255 characters'),
  body('description')
    .optional()
    .isString()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Description must be between 1 and 1000 characters'),
  body('excludeFromSitemap')
    .optional()
    .isBoolean()
    .withMessage('excludeFromSitemap must be a boolean')
];

export const validateUpdateImage = () => [
  param('id')
    .isUUID()
    .withMessage('Image ID must be a valid UUID'),
  body('url')
    .optional()
    .isURL()
    .withMessage('URL must be a valid URL'),
  body('altText')
    .optional()
    .isString()
    .isLength({ min: 1, max: 255 })
    .withMessage('Alt text must be between 1 and 255 characters'),
  body('title')
    .optional()
    .isString()
    .isLength({ min: 1, max: 255 })
    .withMessage('Title must be between 1 and 255 characters'),
  body('caption')
    .optional()
    .isString()
    .isLength({ min: 1, max: 255 })
    .withMessage('Caption must be between 1 and 255 characters'),
  body('description')
    .optional()
    .isString()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Description must be between 1 and 1000 characters'),
  body('excludeFromSitemap')
    .optional()
    .isBoolean()
    .withMessage('excludeFromSitemap must be a boolean')
];

export const validateGetImage = () => [
  param('id')
    .isUUID()
    .withMessage('Image ID must be a valid UUID')
];

export const validateDeleteImage = () => [
  param('id')
    .isUUID()
    .withMessage('Image ID must be a valid UUID')
];

export const validateGetImages = () => [
  ...validatePagination(),
  ...validateSearch()
];

export const validateCreateProductImage = () => [
  body('productId')
    .isUUID()
    .withMessage('Product ID must be a valid UUID'),
  body('imageId')
    .isUUID()
    .withMessage('Image ID must be a valid UUID'),
  body('order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Order must be a non-negative integer'),
  body('isPrimary')
    .optional()
    .isBoolean()
    .withMessage('isPrimary must be a boolean')
];

export const validateUpdateProductImage = () => [
  param('id')
    .isUUID()
    .withMessage('Product Image ID must be a valid UUID'),
  body('order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Order must be a non-negative integer'),
  body('isPrimary')
    .optional()
    .isBoolean()
    .withMessage('isPrimary must be a boolean')
];

export const validateGetProductImage = () => [
  param('id')
    .isUUID()
    .withMessage('Product Image ID must be a valid UUID')
];

export const validateDeleteProductImage = () => [
  param('id')
    .isUUID()
    .withMessage('Product Image ID must be a valid UUID')
];

export const validateGetProductImages = () => [
  ...validatePagination(),
  query('productId')
    .optional()
    .isUUID()
    .withMessage('Product ID must be a valid UUID'),
  query('imageId')
    .optional()
    .isUUID()
    .withMessage('Image ID must be a valid UUID'),
  query('isPrimary')
    .optional()
    .isBoolean()
    .withMessage('isPrimary must be a boolean')
];
