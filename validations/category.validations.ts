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


export const validateCreateCategory = () => [
  body('storeId')
    .isUUID()
    .withMessage('Store ID must be a valid UUID'),
  validateName('name'),
  body('slug')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Slug must be between 1 and 100 characters')
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .withMessage('Slug can only contain lowercase letters, numbers, and hyphens'),
  body('billboardId')
    .optional()
    .isUUID()
    .withMessage('Billboard ID must be a valid UUID'),
  body('imageUrl')
    .optional()
    .isURL()
    .withMessage('Image URL must be a valid URL'),
  body('type')
    .optional()
    .isIn(['material', 'style', 'gender', 'category'])
    .withMessage('Type must be one of: material, style, gender, category'),
  validateBoolean('isBest'),
  body('categoryContent')
    .optional()
    .custom((value) => {
      try {
        if (typeof value === 'string') {
          JSON.parse(value);
        }
        return true;
      } catch (error) {
        throw new Error('Category content must be valid JSON');
      }
    })
];

export const validateUpdateCategory = () => [
  param('id')
    .isUUID()
    .withMessage('Category ID must be a valid UUID'),
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
    .withMessage('Slug can only contain lowercase letters, numbers, and hyphens'),
  body('billboardId')
    .optional()
    .isUUID()
    .withMessage('Billboard ID must be a valid UUID'),
  body('imageUrl')
    .optional()
    .isURL()
    .withMessage('Image URL must be a valid URL'),
  body('type')
    .optional()
    .isIn(['material', 'style', 'gender', 'category'])
    .withMessage('Type must be one of: material, style, gender, category'),
  validateBoolean('isBest'),
  body('categoryContent')
    .optional()
    .custom((value) => {
      try {
        if (typeof value === 'string') {
          JSON.parse(value);
        }
        return true;
      } catch (error) {
        throw new Error('Category content must be valid JSON');
      }
    })
];

export const validateGetCategory = () => [
  param('id')
    .isUUID()
    .withMessage('Category ID must be a valid UUID')
];

export const validateDeleteCategory = () => [
  param('id')
    .isUUID()
    .withMessage('Category ID must be a valid UUID')
];

export const validateGetCategories = () => [
  ...validatePagination(),
  ...validateSearch(),
  query('storeId')
    .optional()
    .isUUID()
    .withMessage('Store ID must be a valid UUID'),
  query('billboardId')
    .optional()
    .isUUID()
    .withMessage('Billboard ID must be a valid UUID'),
  query('type')
    .optional()
    .isIn(['material', 'style', 'gender', 'category'])
    .withMessage('Type must be one of: material, style, gender, category'),
  query('isBest')
    .optional()
    .isBoolean()
    .withMessage('isBest must be a boolean')
];

export const validateCheckCategorySlug = () => [
  body('slug')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Slug must be between 1 and 100 characters')
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .withMessage('Slug can only contain lowercase letters, numbers, and hyphens'),
  body('storeId')
    .isUUID()
    .withMessage('Store ID must be a valid UUID'),
  body('categoryId')
    .optional()
    .isUUID()
    .withMessage('Category ID must be a valid UUID')
];

export const validateCreateCategoryPage = () => [
  body('storeId')
    .isUUID()
    .withMessage('Store ID must be a valid UUID'),
  validateName('name'),
  body('slug')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Slug must be between 1 and 100 characters')
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .withMessage('Slug can only contain lowercase letters, numbers, and hyphens'),
  body('apiSlug')
    .optional()
    .isString()
    .isLength({ min: 1, max: 200 })
    .withMessage('API slug must be between 1 and 200 characters'),
  body('description')
    .optional()
    .isString()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Description must be between 1 and 1000 characters'),
  body('imageUrl')
    .optional()
    .isURL()
    .withMessage('Image URL must be a valid URL'),
  body('bannerImageUrl')
    .optional()
    .isURL()
    .withMessage('Banner image URL must be a valid URL'),
  body('materials')
    .optional()
    .isArray()
    .withMessage('Materials must be an array'),
  body('materials.*')
    .optional()
    .isString()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each material must be between 1 and 50 characters'),
  body('styles')
    .optional()
    .isArray()
    .withMessage('Styles must be an array'),
  body('styles.*')
    .optional()
    .isString()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each style must be between 1 and 50 characters'),
  body('colors')
    .optional()
    .isArray()
    .withMessage('Colors must be an array'),
  body('colors.*')
    .optional()
    .isString()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each color must be between 1 and 50 characters'),
  body('genders')
    .optional()
    .isArray()
    .withMessage('Genders must be an array'),
  body('genders.*')
    .optional()
    .isIn(['men', 'women', 'unisex', 'kids'])
    .withMessage('Each gender must be one of: men, women, unisex, kids'),
  body('collars')
    .optional()
    .isArray()
    .withMessage('Collars must be an array'),
  body('collars.*')
    .optional()
    .isString()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each collar must be between 1 and 50 characters'),
  body('cuffs')
    .optional()
    .isArray()
    .withMessage('Cuffs must be an array'),
  body('cuffs.*')
    .optional()
    .isString()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each cuff must be between 1 and 50 characters'),
  body('closures')
    .optional()
    .isArray()
    .withMessage('Closures must be an array'),
  body('closures.*')
    .optional()
    .isString()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each closure must be between 1 and 50 characters'),
  body('pockets')
    .optional()
    .isArray()
    .withMessage('Pockets must be an array'),
  body('pockets.*')
    .optional()
    .isString()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each pocket must be between 1 and 50 characters'),
  validateBoolean('isBest'),
  body('seoTitle')
    .optional()
    .isString()
    .isLength({ min: 1, max: 60 })
    .withMessage('SEO title must be between 1 and 60 characters'),
  body('seoDescription')
    .optional()
    .isString()
    .isLength({ min: 1, max: 160 })
    .withMessage('SEO description must be between 1 and 160 characters'),
  body('focusKeyword')
    .optional()
    .isString()
    .isLength({ min: 1, max: 100 })
    .withMessage('Focus keyword must be between 1 and 100 characters'),
  body('supportingKeywords')
    .optional()
    .isArray()
    .withMessage('Supporting keywords must be an array'),
  body('supportingKeywords.*')
    .optional()
    .isString()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each supporting keyword must be between 1 and 50 characters'),
  body('categoryContent')
    .optional()
    .custom((value) => {
      try {
        if (typeof value === 'string') {
          JSON.parse(value);
        }
        return true;
      } catch (error) {
        throw new Error('Category content must be valid JSON');
      }
    }),
  body('ogTitle')
    .optional()
    .isString()
    .isLength({ min: 1, max: 60 })
    .withMessage('OG title must be between 1 and 60 characters'),
  body('ogDescription')
    .optional()
    .isString()
    .isLength({ min: 1, max: 160 })
    .withMessage('OG description must be between 1 and 160 characters'),
  body('twitterTitle')
    .optional()
    .isString()
    .isLength({ min: 1, max: 60 })
    .withMessage('Twitter title must be between 1 and 60 characters'),
  body('twitterDescription')
    .optional()
    .isString()
    .isLength({ min: 1, max: 160 })
    .withMessage('Twitter description must be between 1 and 160 characters'),
  body('canonicalUrl')
    .optional()
    .isURL()
    .withMessage('Canonical URL must be a valid URL'),
  validateBoolean('indexPage'),
  validateBoolean('followLinks'),
  validateBoolean('enableSchema'),
  body('schemaType')
    .optional()
    .isString()
    .isLength({ min: 1, max: 50 })
    .withMessage('Schema type must be between 1 and 50 characters'),
  body('customSchema')
    .optional()
    .isString()
    .isLength({ min: 1, max: 5000 })
    .withMessage('Custom schema must be between 1 and 5000 characters'),
  body('status')
    .optional()
    .isIn(['DRAFT', 'PUBLISHED'])
    .withMessage('Status must be one of: DRAFT, PUBLISHED'),
  validateBoolean('isPublished')
];

export const validateUpdateCategoryPage = () => [
  param('id')
    .isUUID()
    .withMessage('Category Page ID must be a valid UUID'),
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
    .withMessage('Slug can only contain lowercase letters, numbers, and hyphens'),
  body('apiSlug')
    .optional()
    .isString()
    .isLength({ min: 1, max: 200 })
    .withMessage('API slug must be between 1 and 200 characters'),
  body('description')
    .optional()
    .isString()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Description must be between 1 and 1000 characters'),
  body('imageUrl')
    .optional()
    .isURL()
    .withMessage('Image URL must be a valid URL'),
  body('bannerImageUrl')
    .optional()
    .isURL()
    .withMessage('Banner image URL must be a valid URL'),
  body('materials')
    .optional()
    .isArray()
    .withMessage('Materials must be an array'),
  body('materials.*')
    .optional()
    .isString()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each material must be between 1 and 50 characters'),
  body('styles')
    .optional()
    .isArray()
    .withMessage('Styles must be an array'),
  body('styles.*')
    .optional()
    .isString()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each style must be between 1 and 50 characters'),
  body('colors')
    .optional()
    .isArray()
    .withMessage('Colors must be an array'),
  body('colors.*')
    .optional()
    .isString()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each color must be between 1 and 50 characters'),
  body('genders')
    .optional()
    .isArray()
    .withMessage('Genders must be an array'),
  body('genders.*')
    .optional()
    .isIn(['men', 'women', 'unisex', 'kids'])
    .withMessage('Each gender must be one of: men, women, unisex, kids'),
  body('collars')
    .optional()
    .isArray()
    .withMessage('Collars must be an array'),
  body('collars.*')
    .optional()
    .isString()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each collar must be between 1 and 50 characters'),
  body('cuffs')
    .optional()
    .isArray()
    .withMessage('Cuffs must be an array'),
  body('cuffs.*')
    .optional()
    .isString()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each cuff must be between 1 and 50 characters'),
  body('closures')
    .optional()
    .isArray()
    .withMessage('Closures must be an array'),
  body('closures.*')
    .optional()
    .isString()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each closure must be between 1 and 50 characters'),
  body('pockets')
    .optional()
    .isArray()
    .withMessage('Pockets must be an array'),
  body('pockets.*')
    .optional()
    .isString()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each pocket must be between 1 and 50 characters'),
  validateBoolean('isBest'),
  body('seoTitle')
    .optional()
    .isString()
    .isLength({ min: 1, max: 60 })
    .withMessage('SEO title must be between 1 and 60 characters'),
  body('seoDescription')
    .optional()
    .isString()
    .isLength({ min: 1, max: 160 })
    .withMessage('SEO description must be between 1 and 160 characters'),
  body('focusKeyword')
    .optional()
    .isString()
    .isLength({ min: 1, max: 100 })
    .withMessage('Focus keyword must be between 1 and 100 characters'),
  body('supportingKeywords')
    .optional()
    .isArray()
    .withMessage('Supporting keywords must be an array'),
  body('supportingKeywords.*')
    .optional()
    .isString()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each supporting keyword must be between 1 and 50 characters'),
  body('categoryContent')
    .optional()
    .custom((value) => {
      try {
        if (typeof value === 'string') {
          JSON.parse(value);
        }
        return true;
      } catch (error) {
        throw new Error('Category content must be valid JSON');
      }
    }),
  body('ogTitle')
    .optional()
    .isString()
    .isLength({ min: 1, max: 60 })
    .withMessage('OG title must be between 1 and 60 characters'),
  body('ogDescription')
    .optional()
    .isString()
    .isLength({ min: 1, max: 160 })
    .withMessage('OG description must be between 1 and 160 characters'),
  body('twitterTitle')
    .optional()
    .isString()
    .isLength({ min: 1, max: 60 })
    .withMessage('Twitter title must be between 1 and 60 characters'),
  body('twitterDescription')
    .optional()
    .isString()
    .isLength({ min: 1, max: 160 })
    .withMessage('Twitter description must be between 1 and 160 characters'),
  body('canonicalUrl')
    .optional()
    .isURL()
    .withMessage('Canonical URL must be a valid URL'),
  validateBoolean('indexPage'),
  validateBoolean('followLinks'),
  validateBoolean('enableSchema'),
  body('schemaType')
    .optional()
    .isString()
    .isLength({ min: 1, max: 50 })
    .withMessage('Schema type must be between 1 and 50 characters'),
  body('customSchema')
    .optional()
    .isString()
    .isLength({ min: 1, max: 5000 })
    .withMessage('Custom schema must be between 1 and 5000 characters'),
  body('status')
    .optional()
    .isIn(['DRAFT', 'PUBLISHED'])
    .withMessage('Status must be one of: DRAFT, PUBLISHED'),
  validateBoolean('isPublished')
];

export const validateGetCategoryPage = () => [
  param('id')
    .isUUID()
    .withMessage('Category Page ID must be a valid UUID')
];

export const validateDeleteCategoryPage = () => [
  param('id')
    .isUUID()
    .withMessage('Category Page ID must be a valid UUID')
];

export const validateGetCategoryPages = () => [
  ...validatePagination(),
  ...validateSearch(),
  query('storeId')
    .optional()
    .isUUID()
    .withMessage('Store ID must be a valid UUID'),
  query('status')
    .optional()
    .isIn(['DRAFT', 'PUBLISHED'])
    .withMessage('Status must be one of: DRAFT, PUBLISHED'),
  query('isPublished')
    .optional()
    .isBoolean()
    .withMessage('isPublished must be a boolean'),
  query('isBest')
    .optional()
    .isBoolean()
    .withMessage('isBest must be a boolean')
];

export const validateCheckCategoryPageSlug = () => [
  body('slug')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Slug must be between 1 and 100 characters')
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .withMessage('Slug can only contain lowercase letters, numbers, and hyphens'),
  body('storeId')
    .isUUID()
    .withMessage('Store ID must be a valid UUID'),
  body('categoryPageId')
    .optional()
    .isUUID()
    .withMessage('Category Page ID must be a valid UUID')
];
