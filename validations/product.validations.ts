import { body, param, query } from 'express-validator';
import { 
  validateName, 
  validateURL, 
  validateBoolean, 
  validateText,
  validateDecimal,
  validateStringArray,
  validateJSON,
  validatePagination,
  validateSearch
} from './common.validations';


export const validateCreateProduct = () => [
  body('storeId')
    .isUUID()
    .withMessage('Store ID must be a valid UUID'),
  validateName('name'),
  body('price')
    .isDecimal()
    .withMessage('Price must be a decimal number')
    .custom((value) => {
      const num = parseFloat(value);
      if (num < 0) {
        throw new Error('Price must be non-negative');
      }
      return true;
    }),
  // body('originalPrice')
  //   .optional()
  //   .isDecimal()
  //   .withMessage('Original price must be a decimal number')
  //   .custom((value) => {
  //     const num = parseFloat(value);
  //     if (num < 0) {
  //       throw new Error('Original price must be non-negative');
  //     }
  //     return true;
  //   }),
  body('salePrice')
    .optional()
    .isDecimal()
    .withMessage('Sale price must be a decimal number')
    .custom((value) => {
      const num = parseFloat(value);
      if (num < 0) {
        throw new Error('Sale price must be non-negative');
      }
      return true;
    }),
  body('sku')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('SKU must be between 1 and 100 characters')
    .matches(/^[A-Z0-9\-_]+$/)
    .withMessage('SKU can only contain uppercase letters, numbers, hyphens, and underscores'),
  body('description')
    .optional()
    .isString()
    .isLength({ min: 1, max: 5000 })
    .withMessage('Description must be between 1 and 5000 characters'),
  body('stockStatus')
    .optional()
    .isIn(['instock', 'outofstock', 'onbackorder'])
    .withMessage('Stock status must be one of: instock, outofstock, onbackorder'),
  // body('purchaseNote')
  //   .optional()
  //   .isString()
  //   .isLength({ min: 1, max: 1000 })
  //   .withMessage('Purchase note must be between 1 and 1000 characters'),
  // validateBoolean('isFeatured'),
  // validateBoolean('isArchived'),
  // validateBoolean('isPublished'),
  // validateBoolean('isDeleted'),
  // validateBoolean('isDiscounted'),
  // validateBoolean('isVirtual'),
  // validateBoolean('isDownloadable'),
  // validateBoolean('isParentProduct'),
  // validateBoolean('noIndex'),
  body('productType')
    .optional()
    .isIn(['simple', 'variable', 'grouped'])
    .withMessage('Product type must be one of: simple, variable, grouped'),
  body('gender')
    .optional()
    .isIn(['men', 'women', 'unisex', 'kids'])
    .withMessage('Gender must be one of: men, women, unisex, kids'),
  body('brandName')
    .optional()
    .isString()
    .isLength({ min: 1, max: 100 })
    .withMessage('Brand name must be between 1 and 100 characters'),
  body('metaTitle')
    .optional()
    .isString()
    .isLength({ min: 1, max: 60 })
    .withMessage('Meta title must be between 1 and 60 characters'),
  body('metaDescription')
    .optional()
    .isString()
    .isLength({ min: 1, max: 160 })
    .withMessage('Meta description must be between 1 and 160 characters'),
  body('slug')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Slug must be between 1 and 100 characters')
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .withMessage('Slug can only contain lowercase letters, numbers, and hyphens'),
  body('keywords')
    .optional()
    .isArray()
    .withMessage('Keywords must be an array'),
  body('keywords.*')
    .optional()
    .isString()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each keyword must be between 1 and 50 characters'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('tags.*')
    .optional()
    .isString()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each tag must be between 1 and 50 characters'),
  body('relatedProducts')
    .optional()
    .isArray()
    .withMessage('Related products must be an array'),
  body('relatedProducts.*')
    .optional()
    .isUUID()
    .withMessage('Each related product ID must be a valid UUID'),
  body('parentProductId')
    .optional()
    .isUUID()
    .withMessage('Parent product ID must be a valid UUID'),
  body('categoryData')
    .optional()
    .custom((value) => {
      try {
        if (typeof value === 'string') {
          JSON.parse(value);
        }
        return true;
      } catch (error) {
        throw new Error('Category data must be valid JSON');
      }
    }),
  body('sizeDetails')
    .optional()
    .custom((value) => {
      try {
        if (typeof value === 'string') {
          JSON.parse(value);
        }
        return true;
      } catch (error) {
        throw new Error('Size details must be valid JSON');
      }
    }),
  body('colorDetails')
    .optional()
    .custom((value) => {
      try {
        if (typeof value === 'string') {
          JSON.parse(value);
        }
        return true;
      } catch (error) {
        throw new Error('Color details must be valid JSON');
      }
    }),
  body('specifications')
    .optional()
    .custom((value) => {
      try {
        if (typeof value === 'string') {
          JSON.parse(value);
        }
        return true;
      } catch (error) {
        throw new Error('Specifications must be valid JSON');
      }
    }),
  body('colorLinks')
    .optional()
    .custom((value) => {
      try {
        if (typeof value === 'string') {
          JSON.parse(value);
        }
        return true;
      } catch (error) {
        throw new Error('Color links must be valid JSON');
      }
    }),
  body('schema')
    .optional()
    .isString()
    .isLength({ min: 1, max: 10000 })
    .withMessage('Schema must be between 1 and 10000 characters'),
  // body('ratingValue')
  //   .optional()
  //   .isString()
  //   .isLength({ min: 1, max: 10 })
  //   .withMessage('Rating value must be between 1 and 10 characters'),
  // body('reviewCount')
  //   .optional()
  //   .isString()
  //   .isLength({ min: 1, max: 10 })
  //   .withMessage('Review count must be between 1 and 10 characters')
];

export const validateUpdateProduct = () => [
  param('id')
    .isUUID()
    .withMessage('Product ID must be a valid UUID'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters'),
  body('price')
    .optional()
    .isDecimal()
    .withMessage('Price must be a decimal number')
    .custom((value) => {
      const num = parseFloat(value);
      if (num < 0) {
        throw new Error('Price must be non-negative');
      }
      return true;
    }),
  // body('originalPrice')
  //   .optional()
  //   .isDecimal()
  //   .withMessage('Original price must be a decimal number')
  //   .custom((value) => {
  //     const num = parseFloat(value);
  //     if (num < 0) {
  //       throw new Error('Original price must be non-negative');
  //     }
  //     return true;
  //   }),
  body('salePrice')
    .optional()
    .isDecimal()
    .withMessage('Sale price must be a decimal number')
    .custom((value) => {
      const num = parseFloat(value);
      if (num < 0) {
        throw new Error('Sale price must be non-negative');
      }
      return true;
    }),
  body('sku')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('SKU must be between 1 and 100 characters')
    .matches(/^[A-Z0-9\-_]+$/)
    .withMessage('SKU can only contain uppercase letters, numbers, hyphens, and underscores'),
  body('description')
    .optional()
    .isString()
    .isLength({ min: 1, max: 5000 })
    .withMessage('Description must be between 1 and 5000 characters'),
  body('stockStatus')
    .optional()
    .isIn(['instock', 'outofstock', 'onbackorder'])
    .withMessage('Stock status must be one of: instock, outofstock, onbackorder'),
  // body('purchaseNote')
  //   .optional()
  //   .isString()
  //   .isLength({ min: 1, max: 1000 })
  //   .withMessage('Purchase note must be between 1 and 1000 characters'),
  // validateBoolean('isFeatured'),
  // validateBoolean('isArchived'),
  // validateBoolean('isPublished'),
  // validateBoolean('isDeleted'),
  // validateBoolean('isDiscounted'),
  // validateBoolean('isVirtual'),
  // validateBoolean('isDownloadable'),
  // validateBoolean('isParentProduct'),
  // validateBoolean('noIndex'),
  body('productType')
    .optional()
    .isIn(['simple', 'variable', 'grouped'])
    .withMessage('Product type must be one of: simple, variable, grouped'),
  body('gender')
    .optional()
    .isIn(['men', 'women', 'unisex', 'kids'])
    .withMessage('Gender must be one of: men, women, unisex, kids'),
  body('brandName')
    .optional()
    .isString()
    .isLength({ min: 1, max: 100 })
    .withMessage('Brand name must be between 1 and 100 characters'),
  body('metaTitle')
    .optional()
    .isString()
    .isLength({ min: 1, max: 60 })
    .withMessage('Meta title must be between 1 and 60 characters'),
  body('metaDescription')
    .optional()
    .isString()
    .isLength({ min: 1, max: 160 })
    .withMessage('Meta description must be between 1 and 160 characters'),
  body('slug')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Slug must be between 1 and 100 characters')
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .withMessage('Slug can only contain lowercase letters, numbers, and hyphens'),
  body('keywords')
    .optional()
    .isArray()
    .withMessage('Keywords must be an array'),
  body('keywords.*')
    .optional()
    .isString()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each keyword must be between 1 and 50 characters'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('tags.*')
    .optional()
    .isString()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each tag must be between 1 and 50 characters'),
  body('relatedProducts')
    .optional()
    .isArray()
    .withMessage('Related products must be an array'),
  body('relatedProducts.*')
    .optional()
    .isUUID()
    .withMessage('Each related product ID must be a valid UUID'),
  body('parentProductId')
    .optional()
    .isUUID()
    .withMessage('Parent product ID must be a valid UUID'),
  body('categoryData')
    .optional()
    .custom((value) => {
      try {
        if (typeof value === 'string') {
          JSON.parse(value);
        }
        return true;
      } catch (error) {
        throw new Error('Category data must be valid JSON');
      }
    }),
  body('sizeDetails')
    .optional()
    .custom((value) => {
      try {
        if (typeof value === 'string') {
          JSON.parse(value);
        }
        return true;
      } catch (error) {
        throw new Error('Size details must be valid JSON');
      }
    }),
  body('colorDetails')
    .optional()
    .custom((value) => {
      try {
        if (typeof value === 'string') {
          JSON.parse(value);
        }
        return true;
      } catch (error) {
        throw new Error('Color details must be valid JSON');
      }
    }),
  body('specifications')
    .optional()
    .custom((value) => {
      try {
        if (typeof value === 'string') {
          JSON.parse(value);
        }
        return true;
      } catch (error) {
        throw new Error('Specifications must be valid JSON');
      }
    }),
  body('colorLinks')
    .optional()
    .custom((value) => {
      try {
        if (typeof value === 'string') {
          JSON.parse(value);
        }
        return true;
      } catch (error) {
        throw new Error('Color links must be valid JSON');
      }
    }),
  body('schema')
    .optional()
    .isString()
    .isLength({ min: 1, max: 10000 })
    .withMessage('Schema must be between 1 and 10000 characters'),
  // body('ratingValue')
  //   .optional()
  //   .isString()
  //   .isLength({ min: 1, max: 10 })
  //   .withMessage('Rating value must be between 1 and 10 characters'),
  // body('reviewCount')
  //   .optional()
  //   .isString()
  //   .isLength({ min: 1, max: 10 })
  //   .withMessage('Review count must be between 1 and 10 characters')
];

export const validateGetProduct = () => [
  param('id')
    .isUUID()
    .withMessage('Product ID must be a valid UUID')
];

export const validateDeleteProduct = () => [
  param('id')
    .isUUID()
    .withMessage('Product ID must be a valid UUID')
];

export const validateGetProducts = () => [
  ...validatePagination(),
  ...validateSearch(),
  query('storeId')
    .optional()
    .isUUID()
    .withMessage('Store ID must be a valid UUID'),
  query('categoryId')
    .optional()
    .isUUID()
    .withMessage('Category ID must be a valid UUID'),
  query('isFeatured')
    .optional()
    .isBoolean()
    .withMessage('isFeatured must be a boolean'),
  query('isPublished')
    .optional()
    .isBoolean()
    .withMessage('isPublished must be a boolean'),
  query('isArchived')
    .optional()
    .isBoolean()
    .withMessage('isArchived must be a boolean'),
  query('isDeleted')
    .optional()
    .isBoolean()
    .withMessage('isDeleted must be a boolean'),
  query('gender')
    .optional()
    .isIn(['men', 'women', 'unisex', 'kids'])
    .withMessage('Gender must be one of: men, women, unisex, kids'),
  query('productType')
    .optional()
    .isIn(['simple', 'variable', 'grouped'])
    .withMessage('Product type must be one of: simple, variable, grouped'),
  query('minPrice')
    .optional()
    .isDecimal()
    .withMessage('Min price must be a decimal number'),
  query('maxPrice')
    .optional()
    .isDecimal()
    .withMessage('Max price must be a decimal number'),
  query('tags')
    .optional()
    .isString()
    .withMessage('Tags must be a string')
];

export const validateCheckSku = () => [
  body('sku')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('SKU must be between 1 and 100 characters')
    .matches(/^[A-Z0-9\-_]+$/)
    .withMessage('SKU can only contain uppercase letters, numbers, hyphens, and underscores'),
  body('storeId')
    .isUUID()
    .withMessage('Store ID must be a valid UUID'),
  body('productId')
    .optional()
    .isUUID()
    .withMessage('Product ID must be a valid UUID')
];

export const validateCheckSlug = () => [
  body('slug')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Slug must be between 1 and 100 characters')
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .withMessage('Slug can only contain lowercase letters, numbers, and hyphens'),
  body('storeId')
    .isUUID()
    .withMessage('Store ID must be a valid UUID'),
  body('productId')
    .optional()
    .isUUID()
    .withMessage('Product ID must be a valid UUID')
];

export const validateProductImage = () => [
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
  validateBoolean('isPrimary')
];

export const validateBulkProductOperation = () => [
  body('productIds')
    .isArray({ min: 1 })
    .withMessage('Product IDs must be a non-empty array'),
  body('productIds.*')
    .isUUID()
    .withMessage('Each product ID must be a valid UUID'),
  body('operation')
    .isIn(['delete', 'archive', 'unarchive', 'publish', 'unpublish', 'feature', 'unfeature'])
    .withMessage('Operation must be one of: delete, archive, unarchive, publish, unpublish, feature, unfeature')
];
