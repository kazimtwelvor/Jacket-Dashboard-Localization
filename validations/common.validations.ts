import { body, param, query } from 'express-validator';
export const validateUUID = (field: string) => 
  param(field)
    .isUUID()
    .withMessage(`${field} must be a valid UUID`);

export const validateEmail = (field: string = 'email') =>
  body(field)
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address');

export const validatePassword = (field: string = 'password') =>
  body(field)
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character');

export const validateName = (field: string = 'name') =>
  body(field)
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage(`${field} must be between 1 and 100 characters`)
    .matches(/^[a-zA-Z\s\-'\.]+$/)
    .withMessage(`${field} can only contain letters, spaces, hyphens, apostrophes, and periods`);

export const validatePhone = (field: string = 'phone') =>
  body(field)
    .optional()
    .isMobilePhone('any')
    .withMessage('Please provide a valid phone number');

export const validateURL = (field: string) =>
  body(field)
    .optional()
    .isURL()
    .withMessage(`${field} must be a valid URL`);

export const validateSlug = (field: string = 'slug') =>
  body(field)
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage(`${field} must be between 1 and 100 characters`)
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .withMessage(`${field} can only contain lowercase letters, numbers, and hyphens`);

export const validateText = (field: string, minLength: number = 1, maxLength: number = 1000) =>
  body(field)
    .optional()
    .trim()
    .isLength({ min: minLength, max: maxLength })
    .withMessage(`${field} must be between ${minLength} and ${maxLength} characters`);

export const validateBoolean = (field: string) =>
  body(field)
    .optional()
    .isBoolean()
    .withMessage(`${field} must be a boolean value`);

export const validateNumber = (field: string, min?: number, max?: number) =>
  body(field)
    .optional()
    .isNumeric()
    .withMessage(`${field} must be a number`)
    .custom((value) => {
      const num = parseFloat(value);
      if (min !== undefined && num < min) {
        throw new Error(`${field} must be at least ${min}`);
      }
      if (max !== undefined && num > max) {
        throw new Error(`${field} must be at most ${max}`);
      }
      return true;
    });

export const validateDecimal = (field: string, min?: number, max?: number) =>
  body(field)
    .optional()
    .isDecimal()
    .withMessage(`${field} must be a decimal number`)
    .custom((value) => {
      const num = parseFloat(value);
      if (min !== undefined && num < min) {
        throw new Error(`${field} must be at least ${min}`);
      }
      if (max !== undefined && num > max) {
        throw new Error(`${field} must be at most ${max}`);
      }
      return true;
    });

export const validateDate = (field: string) =>
  body(field)
    .optional()
    .isISO8601()
    .withMessage(`${field} must be a valid date`);

export const validateArray = (field: string, minLength?: number, maxLength?: number) =>
  body(field)
    .optional()
    .isArray()
    .withMessage(`${field} must be an array`)
    .custom((value) => {
      if (minLength !== undefined && value.length < minLength) {
        throw new Error(`${field} must have at least ${minLength} items`);
      }
      if (maxLength !== undefined && value.length > maxLength) {
        throw new Error(`${field} must have at most ${maxLength} items`);
      }
      return true;
    });

export const validateStringArray = (field: string, minLength?: number, maxLength?: number) =>
  body(field)
    .optional()
    .isArray()
    .withMessage(`${field} must be an array`)
    .custom((value) => {
      if (!value.every((item: any) => typeof item === 'string')) {
        throw new Error(`${field} must be an array of strings`);
      }
      if (minLength !== undefined && value.length < minLength) {
        throw new Error(`${field} must have at least ${minLength} items`);
      }
      if (maxLength !== undefined && value.length > maxLength) {
        throw new Error(`${field} must have at most ${maxLength} items`);
      }
      return true;
    });

export const validateJSON = (field: string) =>
  body(field)
    .optional()
    .custom((value) => {
      try {
        if (typeof value === 'string') {
          JSON.parse(value);
        }
        return true;
      } catch (error) {
        throw new Error(`${field} must be valid JSON`);
      }
    });

export const validatePagination = () => [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('sortBy')
    .optional()
    .isString()
    .withMessage('SortBy must be a string'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('SortOrder must be either "asc" or "desc"')
];

export const validateSearch = () => [
  query('search')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search term must be between 1 and 100 characters')
];
