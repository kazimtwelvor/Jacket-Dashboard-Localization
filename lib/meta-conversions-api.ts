// Meta (Facebook) Conversions API - Server-Side Event Tracking
// Official Documentation: https://developers.facebook.com/docs/marketing-api/conversions-api
import crypto from 'crypto';

const bizSdk = require('facebook-nodejs-business-sdk');

const access_token = process.env.META_CAPI_ACCESS_TOKEN || '';
const pixel_id = process.env.META_PIXEL_ID || '';
const API_VERSION = 'v21.0'; 

const ServerEvent = bizSdk.ServerEvent;
const EventRequest = bizSdk.EventRequest;
const UserData = bizSdk.UserData;
const CustomData = bizSdk.CustomData;
const Content = bizSdk.Content;
const ActionSource = bizSdk.ActionSource;

function hashData(data: string): string {
  if (!data) return '';
  return crypto.createHash('sha256').update(data.toLowerCase().trim()).digest('hex');
}

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
  event_name: string;           
  event_time: number;           
  action_source: string;        
  event_source_url: string;     
  event_id?: string;            
  
  email?: string;
  phone?: string;
  first_name?: string;          
  last_name?: string;           
  gender?: string;              
  date_of_birth?: string;       
  city?: string;                
  state?: string;               
  zip?: string;                 
  country?: string;             
  external_id?: string;         
  client_ip_address?: string;   
  client_user_agent?: string;   
  fbc?: string;                 
  fbp?: string;                 
  subscription_id?: string;     
  
  value?: number;               
  currency?: string;            
  content_ids?: string[];       
  content_name?: string;        
  content_category?: string;    
  content_type?: string;        
  num_items?: number;           
  contents?: Array<{            
    id: string;
    quantity: number;
    item_price?: number;
    title?: string;
    brand?: string;
    category?: string;
  }>;
  search_string?: string;       
  predicted_ltv?: number;       
  
  opt_out?: boolean;            
  data_processing_options?: string[];
  data_processing_options_country?: number;
  data_processing_options_state?: number;
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

    const userData = new UserData()
      .setClientIpAddress(eventData.client_ip_address || getClientIp(req))  
      .setClientUserAgent(eventData.client_user_agent || getUserAgent(req)) 
      .setFbp(eventData.fbp || '') 
      .setFbc(eventData.fbc || ''); 

    if (eventData.email) userData.setEmail(eventData.email);                    
    if (eventData.phone) userData.setPhone(eventData.phone);                    
    if (eventData.first_name) userData.setFirstName(eventData.first_name);      
    if (eventData.last_name) userData.setLastName(eventData.last_name);         
    if (eventData.gender) userData.setGender(eventData.gender);                 
    if (eventData.date_of_birth) userData.setDateOfBirth(eventData.date_of_birth); 
    if (eventData.city) userData.setCity(eventData.city);                       
    if (eventData.state) userData.setState(eventData.state);                    
    if (eventData.zip) userData.setZipCode(eventData.zip);                      
    if (eventData.country) userData.setCountryCode(eventData.country);          
    if (eventData.external_id) userData.setExternalId(eventData.external_id);   
    if (eventData.subscription_id) userData.setSubscriptionId(eventData.subscription_id); 

    const customData = new CustomData()
      .setCurrency(eventData.currency || 'USD');

    if (eventData.value !== undefined) customData.setValue(eventData.value);
    if (eventData.content_name) customData.setContentName(eventData.content_name);
    if (eventData.content_category) customData.setContentCategory(eventData.content_category);
    if (eventData.content_type) customData.setContentType(eventData.content_type);
    if (eventData.content_ids) customData.setContentIds(eventData.content_ids);
    if (eventData.num_items) customData.setNumItems(eventData.num_items);
    if (eventData.search_string) customData.setSearchString(eventData.search_string);
    if (eventData.predicted_ltv) customData.setPredictedLtv(eventData.predicted_ltv);

    if (eventData.contents && eventData.contents.length > 0) {
      const contents = eventData.contents.map((item: any) => {
        const content = new Content()
          .setId(item.id)
          .setQuantity(item.quantity);
        
        if (item.item_price !== undefined) content.setItemPrice(item.item_price);
        if (item.title) content.setTitle(item.title);
        if (item.brand) content.setBrand(item.brand);
        if (item.category) content.setCategory(item.category);
        
        return content;
      });
      customData.setContents(contents);
    }

    const serverEvent = new ServerEvent()
      .setEventName(eventData.event_name)                          
      .setEventTime(eventData.event_time || Math.floor(Date.now() / 1000)) 
      .setUserData(userData)                                         
      .setCustomData(customData)                                     
      .setEventSourceUrl(eventData.event_source_url)                
      .setActionSource(eventData.action_source || 'website');       

    if (eventData.event_id) {
      serverEvent.setEventId(eventData.event_id);
    }

    if (eventData.data_processing_options) {
      serverEvent.setDataProcessingOptions(eventData.data_processing_options);
      if (eventData.data_processing_options_country !== undefined) {
        serverEvent.setDataProcessingOptionsCountry(eventData.data_processing_options_country);
      }
      if (eventData.data_processing_options_state !== undefined) {
        serverEvent.setDataProcessingOptionsState(eventData.data_processing_options_state);
      }
    }

    if (eventData.opt_out) {
      serverEvent.setOptOut(eventData.opt_out);
    }

    const api = bizSdk.FacebookAdsApi.init(access_token);
    bizSdk.FacebookAdsApi.setDefaultVersion(API_VERSION);
    
    const eventsData = [serverEvent];
    const eventRequest = new EventRequest(access_token, pixel_id)
      .setEvents(eventsData)
      .setTestEventCode(process.env.META_TEST_EVENT_CODE || ''); 

    const response = await eventRequest.execute();

    console.log('✅ Meta CAPI Event Sent:', {
      event: eventData.event_name,
      event_id: eventData.event_id,
      pixel_id: pixel_id,
      events_received: response?.events_received || 0,
      messages: response?.messages || []
    });

    return { success: true, response, events_received: response?.events_received };

  } catch (error: any) {
    console.error('❌ Meta CAPI Error:', {
      error: error.message,
      event: eventData.event_name,
      pixel_id: pixel_id
    });
    return { success: false, error: error.message };
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
    event_name: 'ViewContent',
    event_time: Math.floor(Date.now() / 1000),
    action_source: 'website',
    event_source_url: userData.source_url || req.headers.referer || '',
    content_ids: [productId],
    content_name: productName,
    content_category: category,
    content_type: 'product',
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
    event_name: 'AddToCart',
    event_time: Math.floor(Date.now() / 1000),
    action_source: 'website',
    event_source_url: userData.source_url || req.headers.referer || '',
    content_ids: [productId],
    content_name: productName,
    content_type: 'product',
    value: price * quantity,
    currency: 'USD',
    num_items: quantity,
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
  const content_ids = cartItems.map(item => item.id);
  const contents = cartItems.map(item => ({
    id: item.id,
    quantity: item.quantity,
    item_price: item.price
  }));

  return await sendMetaConversionEvent(req, {
    event_name: 'InitiateCheckout',
    event_time: Math.floor(Date.now() / 1000),
    action_source: 'website',
    event_source_url: userData.source_url || req.headers.referer || '',
    content_ids,
    content_type: 'product',
    value: totalValue,
    currency: 'USD',
    num_items: cartItems.reduce((sum, item) => sum + item.quantity, 0),
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
    event_name: 'Lead',
    event_time: Math.floor(Date.now() / 1000),
    action_source: 'website',
    event_source_url: userData.source_url || req.headers.referer || '',
    ...userData
  });
}

export async function trackSearchServer(
  req: any,
  searchQuery: string,
  userData: any = {}
) {
  return await sendMetaConversionEvent(req, {
    event_name: 'Search',
    event_time: Math.floor(Date.now() / 1000),
    action_source: 'website',
    event_source_url: userData.source_url || req.headers.referer || '',
    search_string: searchQuery,
    ...userData
  });
}

export async function trackAddPaymentInfoServer(
  req: any,
  totalValue: number,
  userData: any = {}
) {
  return await sendMetaConversionEvent(req, {
    event_name: 'AddPaymentInfo',
    event_time: Math.floor(Date.now() / 1000),
    action_source: 'website',
    event_source_url: userData.source_url || req.headers.referer || '',
    value: totalValue,
    currency: 'USD',
    ...userData
  });
}

export async function trackAddToWishlistServer(
  req: any,
  productId: string,
  productName: string,
  price: number,
  userData: any = {}
) {
  return await sendMetaConversionEvent(req, {
    event_name: 'AddToWishlist',
    event_time: Math.floor(Date.now() / 1000),
    action_source: 'website',
    event_source_url: userData.source_url || req.headers.referer || '',
    content_ids: [productId],
    content_name: productName,
    content_type: 'product',
    value: price,
    currency: 'USD',
    ...userData
  });
}
