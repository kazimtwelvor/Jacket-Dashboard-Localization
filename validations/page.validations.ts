import { body, param, query } from 'express-validator';
import { 
  validateName, 
  validateURL, 
  validateBoolean, 
  validateText,
  validateJSON,
  validatePagination,
  validateSearch
} from './common.validations';

export const validateCreatePage = () => [
  body('storeId')
    .isUUID()
    .withMessage('Store ID must be a valid UUID'),
  validateName('title'),
  body('slug')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Slug must be between 1 and 100 characters')
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .withMessage('Slug can only contain lowercase letters, numbers, and hyphens'),
  body('description')
    .optional()
    .isString()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Description must be between 1 and 1000 characters'),
  body('content')
    .optional()
    .isString()
    .isLength({ min: 1, max: 50000 })
    .withMessage('Content must be between 1 and 50000 characters'),
  body('thumbnail')
    .optional()
    .isURL()
    .withMessage('Thumbnail must be a valid URL'),
  body('pageType')
    .optional()
    .isIn(['BLOG', 'LANDING', 'ABOUT', 'CONTACT', 'CUSTOM', 'PRODUCT_LISTING'])
    .withMessage('Page type must be one of: BLOG, LANDING, ABOUT, CONTACT, CUSTOM, PRODUCT_LISTING'),
  body('status')
    .optional()
    .isIn(['DRAFT', 'PUBLISHED', 'SCHEDULED', 'ARCHIVED'])
    .withMessage('Status must be one of: DRAFT, PUBLISHED, SCHEDULED, ARCHIVED'),
  validateBoolean('isHomepage'),
  validateBoolean('isPublished'),
  body('seo')
    .optional()
    .custom((value) => {
      try {
        if (typeof value === 'string') {
          JSON.parse(value);
        }
        return true;
      } catch (error) {
        throw new Error('SEO must be valid JSON');
      }
    }),
  body('authorId')
    .optional()
    .isUUID()
    .withMessage('Author ID must be a valid UUID'),
  body('templateId')
    .optional()
    .isUUID()
    .withMessage('Template ID must be a valid UUID'),
  body('templateName')
    .optional()
    .isString()
    .isLength({ min: 1, max: 100 })
    .withMessage('Template name must be between 1 and 100 characters'),
  body('publishedAt')
    .optional()
    .isISO8601()
    .withMessage('Published at must be a valid date')
];

export const validateUpdatePage = () => [
  param('id')
    .isUUID()
    .withMessage('Page ID must be a valid UUID'),
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),
  body('slug')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Slug must be between 1 and 100 characters')
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .withMessage('Slug can only contain lowercase letters, numbers, and hyphens'),
  body('description')
    .optional()
    .isString()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Description must be between 1 and 1000 characters'),
  body('content')
    .optional()
    .isString()
    .isLength({ min: 1, max: 50000 })
    .withMessage('Content must be between 1 and 50000 characters'),
  body('thumbnail')
    .optional()
    .isURL()
    .withMessage('Thumbnail must be a valid URL'),
  body('pageType')
    .optional()
    .isIn(['BLOG', 'LANDING', 'ABOUT', 'CONTACT', 'CUSTOM', 'PRODUCT_LISTING'])
    .withMessage('Page type must be one of: BLOG, LANDING, ABOUT, CONTACT, CUSTOM, PRODUCT_LISTING'),
  body('status')
    .optional()
    .isIn(['DRAFT', 'PUBLISHED', 'SCHEDULED', 'ARCHIVED'])
    .withMessage('Status must be one of: DRAFT, PUBLISHED, SCHEDULED, ARCHIVED'),
  validateBoolean('isHomepage'),
  validateBoolean('isPublished'),
  body('seo')
    .optional()
    .custom((value) => {
      try {
        if (typeof value === 'string') {
          JSON.parse(value);
        }
        return true;
      } catch (error) {
        throw new Error('SEO must be valid JSON');
      }
    }),
  body('authorId')
    .optional()
    .isUUID()
    .withMessage('Author ID must be a valid UUID'),
  body('templateId')
    .optional()
    .isUUID()
    .withMessage('Template ID must be a valid UUID'),
  body('templateName')
    .optional()
    .isString()
    .isLength({ min: 1, max: 100 })
    .withMessage('Template name must be between 1 and 100 characters'),
  body('publishedAt')
    .optional()
    .isISO8601()
    .withMessage('Published at must be a valid date')
];

export const validateGetPage = () => [
  param('id')
    .isUUID()
    .withMessage('Page ID must be a valid UUID')
];

export const validateDeletePage = () => [
  param('id')
    .isUUID()
    .withMessage('Page ID must be a valid UUID')
];

export const validateGetPages = () => [
  ...validatePagination(),
  ...validateSearch(),
  query('storeId')
    .optional()
    .isUUID()
    .withMessage('Store ID must be a valid UUID'),
  query('pageType')
    .optional()
    .isIn(['BLOG', 'LANDING', 'ABOUT', 'CONTACT', 'CUSTOM', 'PRODUCT_LISTING'])
    .withMessage('Page type must be one of: BLOG, LANDING, ABOUT, CONTACT, CUSTOM, PRODUCT_LISTING'),
  query('status')
    .optional()
    .isIn(['DRAFT', 'PUBLISHED', 'SCHEDULED', 'ARCHIVED'])
    .withMessage('Status must be one of: DRAFT, PUBLISHED, SCHEDULED, ARCHIVED'),
  query('isHomepage')
    .optional()
    .isBoolean()
    .withMessage('isHomepage must be a boolean'),
  query('isPublished')
    .optional()
    .isBoolean()
    .withMessage('isPublished must be a boolean'),
  query('authorId')
    .optional()
    .isUUID()
    .withMessage('Author ID must be a valid UUID'),
  query('templateId')
    .optional()
    .isUUID()
    .withMessage('Template ID must be a valid UUID')
];

export const validateCheckPageSlug = () => [
  body('slug')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Slug must be between 1 and 100 characters')
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .withMessage('Slug can only contain lowercase letters, numbers, and hyphens'),
  body('storeId')
    .isUUID()
    .withMessage('Store ID must be a valid UUID'),
  body('pageId')
    .optional()
    .isUUID()
    .withMessage('Page ID must be a valid UUID')
];

export const validateCreatePageCategory = () => [
  body('storeId')
    .isUUID()
    .withMessage('Store ID must be a valid UUID'),
  validateName('name'),
  body('slug')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Slug must be between 1 and 100 characters')
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .withMessage('Slug can only contain lowercase letters, numbers, and hyphens')
];

export const validateUpdatePageCategory = () => [
  param('id')
    .isUUID()
    .withMessage('Page Category ID must be a valid UUID'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters'),
  body('slug')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Slug must be between 1 and 100 characters')
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .withMessage('Slug can only contain lowercase letters, numbers, and hyphens')
];
export const validateGetPageCategory = () => [
  param('id')
    .isUUID()
    .withMessage('Page Category ID must be a valid UUID')
];

export const validateDeletePageCategory = () => [
  param('id')
    .isUUID()
    .withMessage('Page Category ID must be a valid UUID')
];

export const validateGetPageCategories = () => [
  ...validatePagination(),
  ...validateSearch(),
  query('storeId')
    .optional()
    .isUUID()
    .withMessage('Store ID must be a valid UUID')
];

export const validateCreatePageTemplate = () => [
  body('storeId')
    .isUUID()
    .withMessage('Store ID must be a valid UUID'),
  validateName('name'),
  body('description')
    .optional()
    .isString()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Description must be between 1 and 1000 characters'),
  body('thumbnail')
    .optional()
    .isURL()
    .withMessage('Thumbnail must be a valid URL'),
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
    }),
  body('category')
    .optional()
    .isString()
    .isLength({ min: 1, max: 100 })
    .withMessage('Category must be between 1 and 100 characters')
];

export const validateUpdatePageTemplate = () => [
  param('id')
    .isUUID()
    .withMessage('Page Template ID must be a valid UUID'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters'),
  body('description')
    .optional()
    .isString()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Description must be between 1 and 1000 characters'),
  body('thumbnail')
    .optional()
    .isURL()
    .withMessage('Thumbnail must be a valid URL'),
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
    }),
  body('category')
    .optional()
    .isString()
    .isLength({ min: 1, max: 100 })
    .withMessage('Category must be between 1 and 100 characters')
];

export const validateGetPageTemplate = () => [
  param('id')
    .isUUID()
    .withMessage('Page Template ID must be a valid UUID')
];

export const validateDeletePageTemplate = () => [
  param('id')
    .isUUID()
    .withMessage('Page Template ID must be a valid UUID')
];

export const validateGetPageTemplates = () => [
  ...validatePagination(),
  ...validateSearch(),
  query('storeId')
    .optional()
    .isUUID()
    .withMessage('Store ID must be a valid UUID'),
  query('category')
    .optional()
    .isString()
    .isLength({ min: 1, max: 100 })
    .withMessage('Category must be between 1 and 100 characters')
];

export const validateCreateTemplate = () => [
  body('storeId')
    .isUUID()
    .withMessage('Store ID must be a valid UUID'),
  validateName('name'),
  body('description')
    .optional()
    .isString()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Description must be between 1 and 1000 characters'),
  body('thumbnail')
    .optional()
    .isURL()
    .withMessage('Thumbnail must be a valid URL'),
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
    }),
  body('category')
    .optional()
    .isString()
    .isLength({ min: 1, max: 100 })
    .withMessage('Category must be between 1 and 100 characters'),
  validateBoolean('isDefault'),
  validateBoolean('isSystem')
];

export const validateUpdateTemplate = () => [
  param('id')
    .isUUID()
    .withMessage('Template ID must be a valid UUID'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters'),
  body('description')
    .optional()
    .isString()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Description must be between 1 and 1000 characters'),
  body('thumbnail')
    .optional()
    .isURL()
    .withMessage('Thumbnail must be a valid URL'),
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
    }),
  body('category')
    .optional()
    .isString()
    .isLength({ min: 1, max: 100 })
    .withMessage('Category must be between 1 and 100 characters'),
  validateBoolean('isDefault'),
  validateBoolean('isSystem')
];

export const validateGetTemplate = () => [
  param('id')
    .isUUID()
    .withMessage('Template ID must be a valid UUID')
];

export const validateDeleteTemplate = () => [
  param('id')
    .isUUID()
    .withMessage('Template ID must be a valid UUID')
];

export const validateGetTemplates = () => [
  ...validatePagination(),
  ...validateSearch(),
  query('storeId')
    .optional()
    .isUUID()
    .withMessage('Store ID must be a valid UUID'),
  query('category')
    .optional()
    .isString()
    .isLength({ min: 1, max: 100 })
    .withMessage('Category must be between 1 and 100 characters'),
  query('isDefault')
    .optional()
    .isBoolean()
    .withMessage('isDefault must be a boolean'),
  query('isSystem')
    .optional()
    .isBoolean()
    .withMessage('isSystem must be a boolean')
];

export const validateCreatePageRevision = () => [
  body('pageId')
    .isUUID()
    .withMessage('Page ID must be a valid UUID'),
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
    }),
  body('createdBy')
    .optional()
    .isUUID()
    .withMessage('Created by must be a valid UUID'),
  body('comment')
    .optional()
    .isString()
    .isLength({ min: 1, max: 500 })
    .withMessage('Comment must be between 1 and 500 characters')
];

export const validateGetPageRevision = () => [
  param('id')
    .isUUID()
    .withMessage('Page Revision ID must be a valid UUID')
];
export const validateDeletePageRevision = () => [
  param('id')
    .isUUID()
    .withMessage('Page Revision ID must be a valid UUID')
];

export const validateGetPageRevisions = () => [
  ...validatePagination(),
  query('pageId')
    .isUUID()
    .withMessage('Page ID must be a valid UUID'),
  query('createdBy')
    .optional()
    .isUUID()
    .withMessage('Created by must be a valid UUID')
];

export const validateBulkPageOperation = () => [
  body('pageIds')
    .isArray({ min: 1 })
    .withMessage('Page IDs must be a non-empty array'),
  body('pageIds.*')
    .isUUID()
    .withMessage('Each page ID must be a valid UUID'),
  body('operation')
    .isIn(['delete', 'publish', 'unpublish', 'archive', 'draft'])
    .withMessage('Operation must be one of: delete, publish, unpublish, archive, draft')
];
