import { body, param, query } from 'express-validator';
import { 
  validateBoolean, 
  validateJSON,
  validatePagination,
  validateSearch
} from './common.validations';

export const validateCreateBlog = () => [
  body('storeId')
    .isUUID()
    .withMessage('Store ID must be a valid UUID'),
  body('slug')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Slug must be between 1 and 100 characters')
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .withMessage('Slug can only contain lowercase letters, numbers, and hyphens'),
  body('title')
    .optional()
    .isString()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('countryId')
    .optional()
    .isUUID()
    .withMessage('Country ID must be a valid UUID'),
  validateBoolean('isPublished'),
  body('content')
    .custom((value) => {
      try {
        if (typeof value === 'string') {
          JSON.parse(value);
        }
        return true;
      } catch (error) {
        throw new Error('Content must be valid JSON');
      }
    })
];

export const validateUpdateBlog = () => [
  param('id')
    .isUUID()
    .withMessage('Blog ID must be a valid UUID'),
  body('slug')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Slug must be between 1 and 100 characters')
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .withMessage('Slug can only contain lowercase letters, numbers, and hyphens'),
  body('title')
    .optional()
    .isString()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('countryId')
    .optional()
    .isUUID()
    .withMessage('Country ID must be a valid UUID'),
  validateBoolean('isPublished'),
  body('content')
    .optional()
    .custom((value) => {
      try {
        if (typeof value === 'string') {
          JSON.parse(value);
        }
        return true;
      } catch (error) {
        throw new Error('Content must be valid JSON');
      }
    })
];

export const validateGetBlog = () => [
  param('id')
    .isUUID()
    .withMessage('Blog ID must be a valid UUID')
];

export const validateDeleteBlog = () => [
  param('id')
    .isUUID()
    .withMessage('Blog ID must be a valid UUID')
];

export const validateGetBlogs = () => [
  ...validatePagination(),
  ...validateSearch(),
  query('storeId')
    .optional()
    .isUUID()
    .withMessage('Store ID must be a valid UUID'),
  query('isPublished')
    .optional()
    .isBoolean()
    .withMessage('isPublished must be a boolean')
];

export const validateCheckBlogSlug = () => [
  body('slug')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Slug must be between 1 and 100 characters')
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .withMessage('Slug can only contain lowercase letters, numbers, and hyphens'),
  body('storeId')
    .isUUID()
    .withMessage('Store ID must be a valid UUID'),
  body('blogId')
    .optional()
    .isUUID()
    .withMessage('Blog ID must be a valid UUID')
];
