import { body, param, query } from 'express-validator';
import { 
  validateName, 
  validateEmail, 
  validateURL, 
  validateBoolean,
  validatePagination,
  validateSearch
} from './common.validations';

 
export const validateCreateReview = () => [
  body('storeId')
    .isUUID()
    .withMessage('Store ID must be a valid UUID'),
  body('productId')
    .isUUID()
    .withMessage('Product ID must be a valid UUID'),
  body('userId')
    .isUUID()
    .withMessage('User ID must be a valid UUID'),
  validateName('userName'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('title')
    .optional()
    .isString()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('comment')
    .isString()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Comment must be between 10 and 2000 characters'),
  body('photoUrl')
    .optional()
    .isURL()
    .withMessage('Photo URL must be a valid URL'),
  validateBoolean('isApproved')
];

export const validateUpdateReview = () => [
  param('id')
    .isUUID()
    .withMessage('Review ID must be a valid UUID'),
  body('userName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('User name must be between 1 and 100 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('title')
    .optional()
    .isString()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('comment')
    .optional()
    .isString()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Comment must be between 10 and 2000 characters'),
  body('photoUrl')
    .optional()
    .isURL()
    .withMessage('Photo URL must be a valid URL'),
  validateBoolean('isApproved')
];

export const validateGetReview = () => [
  param('id')
    .isUUID()
    .withMessage('Review ID must be a valid UUID')
];

export const validateDeleteReview = () => [
  param('id')
    .isUUID()
    .withMessage('Review ID must be a valid UUID')
];

export const validateGetReviews = () => [
  ...validatePagination(),
  ...validateSearch(),
  query('storeId')
    .optional()
    .isUUID()
    .withMessage('Store ID must be a valid UUID'),
  query('productId')
    .optional()
    .isUUID()
    .withMessage('Product ID must be a valid UUID'),
  query('userId')
    .optional()
    .isUUID()
    .withMessage('User ID must be a valid UUID'),
  query('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  query('isApproved')
    .optional()
    .isBoolean()
    .withMessage('isApproved must be a boolean'),
  query('dateFrom')
    .optional()
    .isISO8601()
    .withMessage('Date from must be a valid date'),
  query('dateTo')
    .optional()
    .isISO8601()
    .withMessage('Date to must be a valid date')
];

export const validateApproveReview = () => [
  param('id')
    .isUUID()
    .withMessage('Review ID must be a valid UUID'),
  body('isApproved')
    .isBoolean()
    .withMessage('isApproved must be a boolean'),
  body('reason')
    .optional()
    .isString()
    .isLength({ min: 1, max: 500 })
    .withMessage('Reason must be between 1 and 500 characters')
];

export const validateBulkReviewOperation = () => [
  body('reviewIds')
    .isArray({ min: 1 })
    .withMessage('Review IDs must be a non-empty array'),
  body('reviewIds.*')
    .isUUID()
    .withMessage('Each review ID must be a valid UUID'),
  body('operation')
    .isIn(['approve', 'disapprove', 'delete'])
    .withMessage('Operation must be one of: approve, disapprove, delete'),
  body('reason')
    .optional()
    .isString()
    .isLength({ min: 1, max: 500 })
    .withMessage('Reason must be between 1 and 500 characters')
];

export const validateReviewStatistics = () => [
  query('storeId')
    .optional()
    .isUUID()
    .withMessage('Store ID must be a valid UUID'),
  query('productId')
    .optional()
    .isUUID()
    .withMessage('Product ID must be a valid UUID'),
  query('dateFrom')
    .optional()
    .isISO8601()
    .withMessage('Date from must be a valid date'),
  query('dateTo')
    .optional()
    .isISO8601()
    .withMessage('Date to must be a valid date'),
  query('groupBy')
    .optional()
    .isIn(['day', 'week', 'month', 'year'])
    .withMessage('Group by must be one of: day, week, month, year')
];

export const validateReportReview = () => [
  param('id')
    .isUUID()
    .withMessage('Review ID must be a valid UUID'),
  body('reason')
    .isString()
    .isLength({ min: 1, max: 500 })
    .withMessage('Report reason must be between 1 and 500 characters'),
  body('reporterEmail')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('reporterName')
    .optional()
    .isString()
    .isLength({ min: 1, max: 100 })
    .withMessage('Reporter name must be between 1 and 100 characters')
];

export const validateReviewResponse = () => [
  param('id')
    .isUUID()
    .withMessage('Review ID must be a valid UUID'),
  body('response')
    .isString()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Response must be between 1 and 1000 characters'),
  body('responderName')
    .optional()
    .isString()
    .isLength({ min: 1, max: 100 })
    .withMessage('Responder name must be between 1 and 100 characters'),
  body('responderEmail')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address')
];

export const validateUpdateReviewResponse = () => [
  param('id')
    .isUUID()
    .withMessage('Review ID must be a valid UUID'),
  body('response')
    .isString()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Response must be between 1 and 1000 characters')
];

export const validateDeleteReviewResponse = () => [
  param('id')
    .isUUID()
    .withMessage('Review ID must be a valid UUID')
];

export const validateReviewHelpfulness = () => [
  param('id')
    .isUUID()
    .withMessage('Review ID must be a valid UUID'),
  body('isHelpful')
    .isBoolean()
    .withMessage('isHelpful must be a boolean'),
  body('voterEmail')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('voterName')
    .optional()
    .isString()
    .isLength({ min: 1, max: 100 })
    .withMessage('Voter name must be between 1 and 100 characters')
];

export const validateReviewFilter = () => [
  query('storeId')
    .optional()
    .isUUID()
    .withMessage('Store ID must be a valid UUID'),
  query('productId')
    .optional()
    .isUUID()
    .withMessage('Product ID must be a valid UUID'),
  query('rating')
    .optional()
    .isIn(['1', '2', '3', '4', '5'])
    .withMessage('Rating must be 1, 2, 3, 4, or 5'),
  query('hasPhoto')
    .optional()
    .isBoolean()
    .withMessage('hasPhoto must be a boolean'),
  query('hasResponse')
    .optional()
    .isBoolean()
    .withMessage('hasResponse must be a boolean'),
  query('sortBy')
    .optional()
    .isIn(['newest', 'oldest', 'highest_rating', 'lowest_rating', 'most_helpful'])
    .withMessage('Sort by must be one of: newest, oldest, highest_rating, lowest_rating, most_helpful')
];

export const validateReviewAnalytics = () => [
  query('storeId')
    .optional()
    .isUUID()
    .withMessage('Store ID must be a valid UUID'),
  query('productId')
    .optional()
    .isUUID()
    .withMessage('Product ID must be a valid UUID'),
  query('dateFrom')
    .optional()
    .isISO8601()
    .withMessage('Date from must be a valid date'),
  query('dateTo')
    .optional()
    .isISO8601()
    .withMessage('Date to must be a valid date'),
  query('groupBy')
    .optional()
    .isIn(['day', 'week', 'month', 'year', 'product', 'rating'])
    .withMessage('Group by must be one of: day, week, month, year, product, rating')
];
