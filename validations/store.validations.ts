import { body, param, query } from 'express-validator';
import { 
  validateName, 
  validateURL, 
  validateBoolean, 
  validateText,
  validatePagination,
  validateSearch
} from './common.validations';

export const validateCreateStore = () => [
  validateName('name'),
  body('userId')
    .isUUID()
    .withMessage('User ID must be a valid UUID'),
  body('url')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('URL must be between 1 and 100 characters')
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .withMessage('URL can only contain lowercase letters, numbers, and hyphens'),
  body('skuPrefix')
    .optional()
    .trim()
    .isLength({ min: 1, max: 10 })
    .withMessage('SKU prefix must be between 1 and 10 characters')
    .matches(/^[A-Z0-9]+$/)
    .withMessage('SKU prefix can only contain uppercase letters and numbers'),
  
  body('paypalClientId')
    .optional()
    .isString()
    .isLength({ min: 0, max: 255 })
    .withMessage('PayPal Client ID must be at most 255 characters'),
  body('paypalClientSecret')
    .optional()
    .isString()
    .isLength({ min: 0, max: 255 })
    .withMessage('PayPal Client Secret must be at most 255 characters'),
  validateBoolean('paypalEnabled'),
  validateBoolean('paypalSandboxMode'),
  body('stripePublishableKey')
    .optional()
    .isString()
    .isLength({ min: 0, max: 255 })
    .withMessage('Stripe Publishable Key must be at most 255 characters'),
  body('stripeSecretKey')
    .optional()
    .isString()
    .isLength({ min: 0, max: 255 })
    .withMessage('Stripe Secret Key must be at most 255 characters'),
  validateBoolean('stripeEnabled'),
  validateBoolean('stripeTestMode'),
  validateBoolean('cashOnDeliveryEnabled'),
  body('cashOnDeliveryFee')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Cash on delivery fee must be a non-negative integer'),
  validateBoolean('bankTransferEnabled'),
  body('bankTransferDetails')
    .optional()
    .isString()
    .isLength({ min: 0, max: 1000 })
    .withMessage('Bank transfer details must be at most 1000 characters'),
  body('stripeWebhookSecret')
    .optional()
    .isString()
    .isLength({ min: 0, max: 255 })
    .withMessage('Stripe webhook secret must be at most 255 characters')
];

export const validateUpdateStore = () => [
  param('id')
    .isUUID()
    .withMessage('Store ID must be a valid UUID'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters'),
  body('url')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('URL must be between 1 and 100 characters')
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .withMessage('URL can only contain lowercase letters, numbers, and hyphens'),
  body('skuPrefix')
    .optional()
    .trim()
    .isLength({ min: 1, max: 10 })
    .withMessage('SKU prefix must be between 1 and 10 characters')
    .matches(/^[A-Z0-9]+$/)
    .withMessage('SKU prefix can only contain uppercase letters and numbers'),
  
  // Payment settings validation
  body('paypalClientId')
    .optional()
    .isString()
    .isLength({ min: 0, max: 255 })
    .withMessage('PayPal Client ID must be at most 255 characters'),
  body('paypalClientSecret')
    .optional()
    .isString()
    .isLength({ min: 0, max: 255 })
    .withMessage('PayPal Client Secret must be at most 255 characters'),
  validateBoolean('paypalEnabled'),
  validateBoolean('paypalSandboxMode'),
  body('stripePublishableKey')
    .optional()
    .isString()
    .isLength({ min: 0, max: 255 })
    .withMessage('Stripe Publishable Key must be at most 255 characters'),
  body('stripeSecretKey')
    .optional()
    .isString()
    .isLength({ min: 0, max: 255 })
    .withMessage('Stripe Secret Key must be at most 255 characters'),
  validateBoolean('stripeEnabled'),
  validateBoolean('stripeTestMode'),
  validateBoolean('cashOnDeliveryEnabled'),
  body('cashOnDeliveryFee')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Cash on delivery fee must be a non-negative integer'),
  validateBoolean('bankTransferEnabled'),
  body('bankTransferDetails')
    .optional()
    .isString()
    .isLength({ min: 0, max: 1000 })
    .withMessage('Bank transfer details must be at most 1000 characters'),
  body('stripeWebhookSecret')
    .optional()
    .isString()
    .isLength({ min: 0, max: 255 })
    .withMessage('Stripe webhook secret must be at most 255 characters')
];

export const validateGetStore = () => [
  param('id')
    .isUUID()
    .withMessage('Store ID must be a valid UUID')
];

export const validateDeleteStore = () => [
  param('id')
    .isUUID()
    .withMessage('Store ID must be a valid UUID')
];

export const validateGetStores = () => [
  ...validatePagination(),
  ...validateSearch(),
  query('userId')
    .optional()
    .isUUID()
    .withMessage('User ID must be a valid UUID')
];

export const validateStoreSettings = () => [
  param('id')
    .isUUID()
    .withMessage('Store ID must be a valid UUID'),
  body('settings')
    .isObject()
    .withMessage('Settings must be an object'),
  body('settings.paypalEnabled')
    .optional()
    .isBoolean()
    .withMessage('PayPal enabled must be a boolean'),
  body('settings.stripeEnabled')
    .optional()
    .isBoolean()
    .withMessage('Stripe enabled must be a boolean'),
  body('settings.cashOnDeliveryEnabled')
    .optional()
    .isBoolean()
    .withMessage('Cash on delivery enabled must be a boolean'),
  body('settings.bankTransferEnabled')
    .optional()
    .isBoolean()
    .withMessage('Bank transfer enabled must be a boolean')
];

export const validateStoreUrlAvailability = () => [
  body('url')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('URL must be between 1 and 100 characters')
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .withMessage('URL can only contain lowercase letters, numbers, and hyphens'),
  body('storeId')
    .optional()
    .isUUID()
    .withMessage('Store ID must be a valid UUID')
];

export const validateStoreSkuPrefix = () => [
  body('skuPrefix')
    .trim()
    .isLength({ min: 1, max: 10 })
    .withMessage('SKU prefix must be between 1 and 10 characters')
    .matches(/^[A-Z0-9]+$/)
    .withMessage('SKU prefix can only contain uppercase letters and numbers'),
  body('storeId')
    .optional()
    .isUUID()
    .withMessage('Store ID must be a valid UUID')
];
