import { body, param, query } from 'express-validator';
import { 
  validatePagination,
  validateSearch
} from './common.validations';

export const validateCreateOrder = () => [
  body('storeId')
    .isUUID()
    .withMessage('Store ID must be a valid UUID'),
  body('userId')
    .optional()
    .isUUID()
    .withMessage('User ID must be a valid UUID'),
  body('orderItems')
    .isArray({ min: 1 })
    .withMessage('Order must have at least one item'),
  body('orderItems.*.productId')
    .isUUID()
    .withMessage('Each product ID must be a valid UUID'),
  body('orderItems.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Each item quantity must be at least 1'),
  body('orderItems.*.price')
    .isDecimal()
    .withMessage('Each item price must be a decimal number')
    .custom((value) => {
      const num = parseFloat(value);
      if (num < 0) {
        throw new Error('Item price must be non-negative');
      }
      return true;
    }),
  body('orderItems.*.customerName')
    .optional()
    .isString()
    .isLength({ min: 1, max: 100 })
    .withMessage('Customer name must be between 1 and 100 characters'),
  body('orderItems.*.sizeIds')
    .optional()
    .isArray()
    .withMessage('Size IDs must be an array'),
  body('orderItems.*.sizeIds.*')
    .optional()
    .isUUID()
    .withMessage('Each size ID must be a valid UUID'),
  body('orderItems.*.colorIds')
    .optional()
    .isArray()
    .withMessage('Color IDs must be an array'),
  body('orderItems.*.colorIds.*')
    .optional()
    .isUUID()
    .withMessage('Each color ID must be a valid UUID'),
  body('orderItems.*.selectedOptions')
    .optional()
    .custom((value) => {
      try {
        if (typeof value === 'string') {
          JSON.parse(value);
        }
        return true;
      } catch (error) {
        throw new Error('Selected options must be valid JSON');
      }
    }),
  body('paymentMethod')
    .optional()
    .isIn(['credit_card', 'paypal', 'stripe', 'cash_on_delivery', 'bank_transfer'])
    .withMessage('Payment method must be one of: credit_card, paypal, stripe, cash_on_delivery, bank_transfer'),
  body('shippingMethod')
    .optional()
    .isString()
    .isLength({ min: 1, max: 100 })
    .withMessage('Shipping method must be between 1 and 100 characters'),
  body('shippingCost')
    .optional()
    .isDecimal()
    .withMessage('Shipping cost must be a decimal number')
    .custom((value) => {
      const num = parseFloat(value);
      if (num < 0) {
        throw new Error('Shipping cost must be non-negative');
      }
      return true;
    }),
  body('tax')
    .optional()
    .isDecimal()
    .withMessage('Tax must be a decimal number')
    .custom((value) => {
      const num = parseFloat(value);
      if (num < 0) {
        throw new Error('Tax must be non-negative');
      }
      return true;
    }),
  body('discount')
    .optional()
    .isDecimal()
    .withMessage('Discount must be a decimal number')
    .custom((value) => {
      const num = parseFloat(value);
      if (num < 0) {
        throw new Error('Discount must be non-negative');
      }
      return true;
    }),
  body('total')
    .optional()
    .isDecimal()
    .withMessage('Total must be a decimal number')
    .custom((value) => {
      const num = parseFloat(value);
      if (num < 0) {
        throw new Error('Total must be non-negative');
      }
      return true;
    }),
  body('notes')
    .optional()
    .isString()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Notes must be between 1 and 1000 characters'),
  body('trackingNumber')
    .optional()
    .isString()
    .isLength({ min: 1, max: 100 })
    .withMessage('Tracking number must be between 1 and 100 characters'),
  
  body('customerName')
    .optional()
    .isString()
    .isLength({ min: 1, max: 100 })
    .withMessage('Customer name must be between 1 and 100 characters'),
  body('customerEmail')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('phone')
    .optional()
    .isMobilePhone('any')
    .withMessage('Please provide a valid phone number'),
  body('address')
    .optional()
    .isString()
    .isLength({ min: 1, max: 500 })
    .withMessage('Address must be between 1 and 500 characters'),
  body('billingAddress')
    .optional()
    .isString()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Billing address must be between 1 and 1000 characters'),
  body('shippingAddress')
    .optional()
    .isString()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Shipping address must be between 1 and 1000 characters'),
  body('city')
    .optional()
    .isString()
    .isLength({ min: 1, max: 100 })
    .withMessage('City must be between 1 and 100 characters'),
  body('state')
    .optional()
    .isString()
    .isLength({ min: 1, max: 100 })
    .withMessage('State must be between 1 and 100 characters'),
  body('zipCode')
    .optional()
    .isString()
    .isLength({ min: 1, max: 20 })
    .withMessage('Zip code must be between 1 and 20 characters'),
  body('country')
    .optional()
    .isString()
    .isLength({ min: 1, max: 100 })
    .withMessage('Country must be between 1 and 100 characters'),
  
  body('fulfillmentStatus')
    .optional()
    .isIn(['pending', 'processing', 'shipped', 'delivered'])
    .withMessage('Fulfillment status must be one of: pending, processing, shipped, delivered'),
  body('estimatedDelivery')
    .optional()
    .isISO8601()
    .withMessage('Estimated delivery must be a valid date'),
  body('actualDelivery')
    .optional()
    .isISO8601()
    .withMessage('Actual delivery must be a valid date'),
  
  body('transactionId')
    .optional()
    .isString()
    .isLength({ min: 1, max: 255 })
    .withMessage('Transaction ID must be between 1 and 255 characters'),
  body('paymentStatus')
    .optional()
    .isIn(['pending', 'completed', 'failed', 'refunded'])
    .withMessage('Payment status must be one of: pending, completed, failed, refunded'),
  
  body('cardNumber')
    .optional()
    .isString()
    .isLength({ min: 13, max: 19 })
    .withMessage('Card number must be between 13 and 19 characters'),
  body('expirationDate')
    .optional()
    .matches(/^(0[1-9]|1[0-2])\/\d{2}$/)
    .withMessage('Expiration date must be in MM/YY format'),
  body('securityCode')
    .optional()
    .isString()
    .isLength({ min: 3, max: 4 })
    .withMessage('Security code must be between 3 and 4 characters'),
  body('cardCountry')
    .optional()
    .isString()
    .isLength({ min: 1, max: 100 })
    .withMessage('Card country must be between 1 and 100 characters')
];

export const validateUpdateOrder = () => [
  param('id')
    .isUUID()
    .withMessage('Order ID must be a valid UUID'),
  body('status')
    .optional()
    .isIn(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'])
    .withMessage('Status must be one of: PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED, REFUNDED'),
  body('paymentMethod')
    .optional()
    .isIn(['credit_card', 'paypal', 'stripe', 'cash_on_delivery', 'bank_transfer'])
    .withMessage('Payment method must be one of: credit_card, paypal, stripe, cash_on_delivery, bank_transfer'),
  body('shippingMethod')
    .optional()
    .isString()
    .isLength({ min: 1, max: 100 })
    .withMessage('Shipping method must be between 1 and 100 characters'),
  body('shippingCost')
    .optional()
    .isDecimal()
    .withMessage('Shipping cost must be a decimal number')
    .custom((value) => {
      const num = parseFloat(value);
      if (num < 0) {
        throw new Error('Shipping cost must be non-negative');
      }
      return true;
    }),
  body('tax')
    .optional()
    .isDecimal()
    .withMessage('Tax must be a decimal number')
    .custom((value) => {
      const num = parseFloat(value);
      if (num < 0) {
        throw new Error('Tax must be non-negative');
      }
      return true;
    }),
  body('discount')
    .optional()
    .isDecimal()
    .withMessage('Discount must be a decimal number')
    .custom((value) => {
      const num = parseFloat(value);
      if (num < 0) {
        throw new Error('Discount must be non-negative');
      }
      return true;
    }),
  body('total')
    .optional()
    .isDecimal()
    .withMessage('Total must be a decimal number')
    .custom((value) => {
      const num = parseFloat(value);
      if (num < 0) {
        throw new Error('Total must be non-negative');
      }
      return true;
    }),
  body('notes')
    .optional()
    .isString()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Notes must be between 1 and 1000 characters'),
  body('trackingNumber')
    .optional()
    .isString()
    .isLength({ min: 1, max: 100 })
    .withMessage('Tracking number must be between 1 and 100 characters'),
  body('fulfillmentStatus')
    .optional()
    .isIn(['pending', 'processing', 'shipped', 'delivered'])
    .withMessage('Fulfillment status must be one of: pending, processing, shipped, delivered'),
  body('estimatedDelivery')
    .optional()
    .isISO8601()
    .withMessage('Estimated delivery must be a valid date'),
  body('actualDelivery')
    .optional()
    .isISO8601()
    .withMessage('Actual delivery must be a valid date'),
  body('transactionId')
    .optional()
    .isString()
    .isLength({ min: 1, max: 255 })
    .withMessage('Transaction ID must be between 1 and 255 characters'),
  body('paymentStatus')
    .optional()
    .isIn(['pending', 'completed', 'failed', 'refunded'])
    .withMessage('Payment status must be one of: pending, completed, failed, refunded')
];

export const validateGetOrder = () => [
  param('id')
    .isUUID()
    .withMessage('Order ID must be a valid UUID')
];

export const validateDeleteOrder = () => [
  param('id')
    .isUUID()
    .withMessage('Order ID must be a valid UUID')
];

export const validateGetOrders = () => [
  ...validatePagination(),
  ...validateSearch(),
  query('storeId')
    .optional()
    .isUUID()
    .withMessage('Store ID must be a valid UUID'),
  query('userId')
    .optional()
    .isUUID()
    .withMessage('User ID must be a valid UUID'),
  query('status')
    .optional()
    .isIn(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'])
    .withMessage('Status must be one of: PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED, REFUNDED'),
  query('paymentMethod')
    .optional()
    .isIn(['credit_card', 'paypal', 'stripe', 'cash_on_delivery', 'bank_transfer'])
    .withMessage('Payment method must be one of: credit_card, paypal, stripe, cash_on_delivery, bank_transfer'),
  query('paymentStatus')
    .optional()
    .isIn(['pending', 'completed', 'failed', 'refunded'])
    .withMessage('Payment status must be one of: pending, completed, failed, refunded'),
  query('fulfillmentStatus')
    .optional()
    .isIn(['pending', 'processing', 'shipped', 'delivered'])
    .withMessage('Fulfillment status must be one of: pending, processing, shipped, delivered'),
  query('isPaid')
    .optional()
    .isBoolean()
    .withMessage('isPaid must be a boolean'),
  query('dateFrom')
    .optional()
    .isISO8601()
    .withMessage('Date from must be a valid date'),
  query('dateTo')
    .optional()
    .isISO8601()
    .withMessage('Date to must be a valid date'),
  query('minTotal')
    .optional()
    .isDecimal()
    .withMessage('Min total must be a decimal number'),
  query('maxTotal')
    .optional()
    .isDecimal()
    .withMessage('Max total must be a decimal number')
];

export const validateCreateOrderItem = () => [
  body('orderId')
    .isUUID()
    .withMessage('Order ID must be a valid UUID'),
  body('productId')
    .isUUID()
    .withMessage('Product ID must be a valid UUID'),
  body('quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
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
  body('originalPrice')
    .optional()
    .isDecimal()
    .withMessage('Original price must be a decimal number')
    .custom((value) => {
      const num = parseFloat(value);
      if (num < 0) {
        throw new Error('Original price must be non-negative');
      }
      return true;
    }),
  body('discountAmount')
    .optional()
    .isDecimal()
    .withMessage('Discount amount must be a decimal number')
    .custom((value) => {
      const num = parseFloat(value);
      if (num < 0) {
        throw new Error('Discount amount must be non-negative');
      }
      return true;
    }),
  body('total')
    .optional()
    .isDecimal()
    .withMessage('Total must be a decimal number')
    .custom((value) => {
      const num = parseFloat(value);
      if (num < 0) {
        throw new Error('Total must be non-negative');
      }
      return true;
    }),
  body('customerName')
    .optional()
    .isString()
    .isLength({ min: 1, max: 100 })
    .withMessage('Customer name must be between 1 and 100 characters'),
  body('sizeIds')
    .optional()
    .isArray()
    .withMessage('Size IDs must be an array'),
  body('sizeIds.*')
    .optional()
    .isUUID()
    .withMessage('Each size ID must be a valid UUID'),
  body('colorIds')
    .optional()
    .isArray()
    .withMessage('Color IDs must be an array'),
  body('colorIds.*')
    .optional()
    .isUUID()
    .withMessage('Each color ID must be a valid UUID'),
  body('selectedOptions')
    .optional()
    .custom((value) => {
      try {
        if (typeof value === 'string') {
          JSON.parse(value);
        }
        return true;
      } catch (error) {
        throw new Error('Selected options must be valid JSON');
      }
    }),
  body('productSku')
    .optional()
    .isString()
    .isLength({ min: 1, max: 100 })
    .withMessage('Product SKU must be between 1 and 100 characters'),
  body('productName')
    .optional()
    .isString()
    .isLength({ min: 1, max: 200 })
    .withMessage('Product name must be between 1 and 200 characters'),
  body('hasBeenReviewed')
    .optional()
    .isBoolean()
    .withMessage('hasBeenReviewed must be a boolean')
];

export const validateUpdateOrderItem = () => [
  param('id')
    .isUUID()
    .withMessage('Order Item ID must be a valid UUID'),
  body('quantity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
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
  body('originalPrice')
    .optional()
    .isDecimal()
    .withMessage('Original price must be a decimal number')
    .custom((value) => {
      const num = parseFloat(value);
      if (num < 0) {
        throw new Error('Original price must be non-negative');
      }
      return true;
    }),
  body('discountAmount')
    .optional()
    .isDecimal()
    .withMessage('Discount amount must be a decimal number')
    .custom((value) => {
      const num = parseFloat(value);
      if (num < 0) {
        throw new Error('Discount amount must be non-negative');
      }
      return true;
    }),
  body('total')
    .optional()
    .isDecimal()
    .withMessage('Total must be a decimal number')
    .custom((value) => {
      const num = parseFloat(value);
      if (num < 0) {
        throw new Error('Total must be non-negative');
      }
      return true;
    }),
  body('customerName')
    .optional()
    .isString()
    .isLength({ min: 1, max: 100 })
    .withMessage('Customer name must be between 1 and 100 characters'),
  body('sizeIds')
    .optional()
    .isArray()
    .withMessage('Size IDs must be an array'),
  body('sizeIds.*')
    .optional()
    .isUUID()
    .withMessage('Each size ID must be a valid UUID'),
  body('colorIds')
    .optional()
    .isArray()
    .withMessage('Color IDs must be an array'),
  body('colorIds.*')
    .optional()
    .isUUID()
    .withMessage('Each color ID must be a valid UUID'),
  body('selectedOptions')
    .optional()
    .custom((value) => {
      try {
        if (typeof value === 'string') {
          JSON.parse(value);
        }
        return true;
      } catch (error) {
        throw new Error('Selected options must be valid JSON');
      }
    }),
  body('productSku')
    .optional()
    .isString()
    .isLength({ min: 1, max: 100 })
    .withMessage('Product SKU must be between 1 and 100 characters'),
  body('productName')
    .optional()
    .isString()
    .isLength({ min: 1, max: 200 })
    .withMessage('Product name must be between 1 and 200 characters'),
  body('hasBeenReviewed')
    .optional()
    .isBoolean()
    .withMessage('hasBeenReviewed must be a boolean')
];

export const validateBulkOrderOperation = () => [
  body('orderIds')
    .isArray({ min: 1 })
    .withMessage('Order IDs must be a non-empty array'),
  body('orderIds.*')
    .isUUID()
    .withMessage('Each order ID must be a valid UUID'),
  body('operation')
    .isIn(['cancel', 'refund', 'ship', 'deliver', 'update_status'])
    .withMessage('Operation must be one of: cancel, refund, ship, deliver, update_status'),
  body('status')
    .optional()
    .isIn(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'])
    .withMessage('Status must be one of: PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED, REFUNDED')
];
