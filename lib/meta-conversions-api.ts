// Meta (Facebook) Conversions API - Server-Side Event Tracking
import crypto from 'crypto';

const bizSdk = require('facebook-nodejs-business-sdk');

// Meta CAPI Configuration
const access_token = process.env.META_CAPI_ACCESS_TOKEN || '';
const pixel_id = process.env.META_PIXEL_ID || '';

const ServerEvent = bizSdk.ServerEvent;
const EventRequest = bizSdk.EventRequest;
const UserData = bizSdk.UserData;
const CustomData = bizSdk.CustomData;
const Content = bizSdk.Content;

// Helper function to hash data for privacy
function hashData(data: string): string {
  if (!data) return '';
  return crypto.createHash('sha256').update(data.toLowerCase().trim()).digest('hex');
}

// Helper to get client IP from request
function getClientIp(req: any): string {
  return req.headers['x-forwarded-for']?.split(',')[0] || 
         req.headers['x-real-ip'] || 
         req.connection.remoteAddress || 
         '';
}

// Helper to get user agent
function getUserAgent(req: any): string {
  return req.headers['user-agent'] || '';
}

interface MetaEventData {
  eventName: string;
  eventSourceUrl: string;
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  externalId?: string;  // Your user ID
  fbp?: string;         // Facebook browser ID (_fbp cookie)
  fbc?: string;         // Facebook click ID (_fbc cookie)
  eventId?: string;     // Deduplication ID (must match pixel eventID)
  value?: number;
  currency?: string;
  contentIds?: string[];
  contentName?: string;
  contentCategory?: string;
  contentType?: string;
  numItems?: number;
  contents?: Array<{id: string; quantity: number; item_price: number}>;
  searchQuery?: string;
  customData?: any;
}

export async function sendMetaConversionEvent(
  req: any,
  eventData: MetaEventData
) {
  try {
    if (!access_token || !pixel_id) {
      console.error('Meta CAPI: Missing access token or pixel ID');
      return { success: false, error: 'Missing credentials' };
    }

    // Build UserData (automatically hashes PII)
    const userData = new UserData()
      .setClientIpAddress(getClientIp(req))
      .setClientUserAgent(getUserAgent(req))
      .setFbp(eventData.fbp || '')
      .setFbc(eventData.fbc || '');

    // Add PII if provided (will be hashed automatically)
    if (eventData.email) userData.setEmail(eventData.email);
    if (eventData.phone) userData.setPhone(eventData.phone);
    if (eventData.firstName) userData.setFirstName(eventData.firstName);
    if (eventData.lastName) userData.setLastName(eventData.lastName);
    if (eventData.city) userData.setCity(eventData.city);
    if (eventData.state) userData.setState(eventData.state);
    if (eventData.zip) userData.setZipCode(eventData.zip);
    if (eventData.country) userData.setCountryCode(eventData.country);
    if (eventData.externalId) userData.setExternalId(eventData.externalId);

    // Build CustomData
    const customData = new CustomData()
      .setCurrency(eventData.currency || 'USD');

    if (eventData.value) customData.setValue(eventData.value);
    if (eventData.contentName) customData.setContentName(eventData.contentName);
    if (eventData.contentCategory) customData.setContentCategory(eventData.contentCategory);
    if (eventData.contentType) customData.setContentType(eventData.contentType);
    if (eventData.contentIds) customData.setContentIds(eventData.contentIds);
    if (eventData.numItems) customData.setNumItems(eventData.numItems);
    if (eventData.searchQuery) customData.setSearchString(eventData.searchQuery);

    // Add contents array if provided
    if (eventData.contents && eventData.contents.length > 0) {
      const contents = eventData.contents.map((item: any) => 
        new Content()
          .setId(item.id)
          .setQuantity(item.quantity)
          .setItemPrice(item.item_price)
      );
      customData.setContents(contents);
    }

    // Create ServerEvent
    const serverEvent = new ServerEvent()
      .setEventName(eventData.eventName)
      .setEventTime(Math.floor(Date.now() / 1000))
      .setUserData(userData)
      .setCustomData(customData)
      .setEventSourceUrl(eventData.eventSourceUrl)
      .setActionSource('website');

    // Add event_id for deduplication with pixel
    if (eventData.eventId) {
      serverEvent.setEventId(eventData.eventId);
    }

    // Send Event to Meta
    const api = bizSdk.FacebookAdsApi.init(access_token);
    const eventsData = [serverEvent];
    const eventRequest = new EventRequest(access_token, pixel_id)
      .setEvents(eventsData);

    const response = await eventRequest.execute();

    console.log('✅ Meta CAPI Event Sent:', {
      event: eventData.eventName,
      eventId: eventData.eventId,
      response: response
    });

    return { success: true, response };

  } catch (error) {
    console.error('❌ Meta CAPI Error:', error);
    return { success: false, error };
  }
}


export async function trackViewContentServer(
  req: any,
  productId: string,
  productName: string,
  price: number,
  category: string,
  userData: any = {}
) {
  return await sendMetaConversionEvent(req, {
    eventName: 'ViewContent',
    eventSourceUrl: userData.sourceUrl || req.headers.referer || '',
    contentIds: [productId],
    contentName: productName,
    contentCategory: category,
    contentType: 'product',
    value: price,
    currency: 'USD',
    ...userData
  });
}

export async function trackAddToCartServer(
  req: any,
  productId: string,
  productName: string,
  price: number,
  quantity: number,
  userData: any = {}
) {
  return await sendMetaConversionEvent(req, {
    eventName: 'AddToCart',
    eventSourceUrl: userData.sourceUrl || req.headers.referer || '',
    contentIds: [productId],
    contentName: productName,
    contentType: 'product',
    value: price * quantity,
    currency: 'USD',
    numItems: quantity,
    contents: [{
      id: productId,
      quantity: quantity,
      item_price: price
    }],
    ...userData
  });
}

export async function trackInitiateCheckoutServer(
  req: any,
  cartItems: any[],
  totalValue: number,
  userData: any = {}
) {
  const contentIds = cartItems.map(item => item.id);
  const contents = cartItems.map(item => ({
    id: item.id,
    quantity: item.quantity,
    item_price: item.price
  }));

  return await sendMetaConversionEvent(req, {
    eventName: 'InitiateCheckout',
    eventSourceUrl: userData.sourceUrl || req.headers.referer || '',
    contentIds,
    contentType: 'product',
    value: totalValue,
    currency: 'USD',
    numItems: cartItems.reduce((sum, item) => sum + item.quantity, 0),
    contents,
    ...userData
  });
}

export async function trackPurchaseServer(
  req: any,
  orderId: string,
  orderItems: any[],
  totalValue: number,
  userData: any = {}
) {
  const contentIds = orderItems.map(item => item.id);
  const contents = orderItems.map(item => ({
    id: item.id,
    quantity: item.quantity || 1,
    item_price: parseFloat(item.price || '0')
  }));

  return await sendMetaConversionEvent(req, {
    eventName: 'Purchase',
    eventSourceUrl: userData.sourceUrl || req.headers.referer || '',
    contentIds,
    contentType: 'product',
    value: totalValue,
    currency: 'USD',
    numItems: orderItems.reduce((sum, item) => sum + (item.quantity || 1), 0),
    contents,
    eventId: `purchase_${orderId}`, 
    ...userData
  });
}

export async function trackLeadServer(
  req: any,
  userData: any = {}
) {
  return await sendMetaConversionEvent(req, {
    eventName: 'Lead',
    eventSourceUrl: userData.sourceUrl || req.headers.referer || '',
    ...userData
  });
}

export async function trackSearchServer(
  req: any,
  searchQuery: string,
  userData: any = {}
) {
  return await sendMetaConversionEvent(req, {
    eventName: 'Search',
    eventSourceUrl: userData.sourceUrl || req.headers.referer || '',
    searchQuery,
    ...userData
  });
}
