import prisma from "../config/prisma.js";
import { getIthinkApiUrl } from "./constant.js";

export interface IthinkProduct {
  product_name: string;
  product_sku?: string;
  product_quantity: string | number;
  product_price: string | number;
  product_tax_rate?: string | number;
  product_hsn_code?: string;
  product_discount?: string | number;
  product_img_url?: string;
}

export interface IthinkShipment {
  waybill?: string | number;
  order: string;
  sub_order?: string;
  order_date: string;
  total_amount: string | number;
  name: string;
  company_name?: string;
  add: string;
  add2?: string;
  add3?: string;
  pin: string | number;
  city?: string;
  state?: string;
  country?: string;
  phone: string | number;
  alt_phone?: string | number;
  email?: string;
  is_billing_same_as_shipping?: string;
  billing_name: string;
  billing_company_name?: string;
  billing_add: string;
  billing_add2?: string;
  billing_add3?: string | number;
  billing_pin: string | number;
  billing_city?: string;
  billing_state?: string;
  billing_country?: string | number;
  billing_phone: string | number;
  billing_alt_phone?: string;
  billing_email?: string;
  products: IthinkProduct[];
  shipment_length: string | number;
  shipment_width: string | number;
  shipment_height: string | number;
  weight: string | number;
  shipping_charges?: string | number;
  giftwrap_charges?: string | number;
  transaction_charges?: string | number;
  total_discount?: string | number;
  first_attemp_discount?: string | number;
  cod_charges?: string | number;
  advance_amount?: string | number;
  cod_amount?: string | number;
  payment_mode?: string;
  reseller_name?: string;
  eway_bill_number?: string;
  gst_number?: string;
  what3words?: string;
  pickup_address_id?: string | number;
  return_address_id: string | number;
  logistics?: string;
  order_type?: string;
  s_type?: string;
}

export interface IthinkOrderPayload {
  data: {
    shipments: IthinkShipment[];
    pickup_address_id: string | number;
    access_token: string;
    secret_key: string;
    logistics?: string;
    order_type?: string;
    s_type?: string;
  };
}

/**
 * In-memory credential and token cache
 */
interface TokenCache {
  token: string | null;
  expiresAt: number;
}

const memoryTokenCache: TokenCache = {
  token: null,
  expiresAt: 0,
};

/**
 * Returns active iThink Logistics credentials from environment
 */
export const getIthinkCredentials = () => {
  const accessToken =
    process.env.ITHINK_ACCESS_TOKEN ||
    process.env.Access_Token ||
    "33465f45e4f8b64c9c8b2328ead7ebcd";

  const secretKey =
    process.env.ITHINK_SECRET_KEY ||
    process.env.Secret_key ||
    process.env.Secret_Key ||
    "a89c35c9c6edc894493ea2f8c7c45b47";

  const storeUrl =
    process.env.ITHINK_STORE_URL ||
    process.env.Store_URL ||
    "https://fuelandnutrients.com/";

  return { accessToken, secretKey, storeUrl };
};

/**
 * Authenticate & retrieve in-memory cached token (~7 days validity)
 */
export const getIthinkAuthToken = async (): Promise<string> => {
  const now = Date.now();
  if (memoryTokenCache.token && memoryTokenCache.expiresAt > now) {
    return memoryTokenCache.token;
  }

  const { accessToken } = getIthinkCredentials();
  memoryTokenCache.token = accessToken;
  // Cache for 7 days
  memoryTokenCache.expiresAt = now + 7 * 24 * 60 * 60 * 1000;
  return accessToken;
};

/**
 * Helper to clean and format phone number strictly to 10 digits
 */
export const cleanPhone10Digits = (phone?: string | number): string => {
  if (!phone) return "9999999999";
  const digits = String(phone).replace(/\D/g, "");
  if (digits.length >= 10) {
    return digits.slice(-10);
  }
  return digits.padStart(10, "0");
};

/**
 * Helper to split address into max 80 characters per line
 */
export const splitAddress80 = (address?: string) => {
  if (!address) {
    return { line1: "Address Line 1", line2: "", line3: "" };
  }
  const clean = address.trim();
  const line1 = clean.slice(0, 80);
  const line2 = clean.length > 80 ? clean.slice(80, 160) : "";
  const line3 = clean.length > 160 ? clean.slice(160, 240) : "";
  return { line1, line2, line3 };
};

/**
 * Helper to format date to DD-MM-YYYY required by iThink Logistics API
 */
export const formatDateToDDMMYYYY = (dateInput?: Date | string): string => {
  const d = dateInput ? new Date(dateInput) : new Date();
  if (isNaN(d.getTime())) {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, "0");
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const year = today.getFullYear();
    return `${day}-${month}-${year}`;
  }
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};

/**
 * Helper to split full name into first and last name
 */
export const splitName = (fullName?: string) => {
  const clean = (fullName || "Customer").trim();
  const parts = clean.split(/\s+/);
  const firstName = parts[0] || "Customer";
  const lastName = parts.slice(1).join(" ") || firstName;
  return { firstName, lastName };
};

/**
 * Payload Sanitizer & Builder (buildIthinklogisticsPayload)
 */
export const buildIthinklogisticsPayload = async (
  order: any,
  email?: string,
  options?: { isReturn?: boolean; returnReason?: string }
): Promise<IthinkOrderPayload> => {
  const { accessToken, secretKey } = getIthinkCredentials();

  // Retrieve user email if missing
  let userEmail = email || order.shippingEmail || order.email || "";
  if (!userEmail && order.userId) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: order.userId },
        select: { email: true },
      });
      userEmail = user?.email || "";
    } catch (err) {
      console.error("Error fetching user email for iThink Logistics:", err);
    }
  }
  if (!userEmail) {
    userEmail = "customer@example.com";
  }

  const pickupAddressId = process.env.ITHINK_PICKUP_ADDRESS_ID || "24";
  const returnAddressId = process.env.ITHINK_RETURN_ADDRESS_ID || "24";
  const logistics = process.env.ITHINK_LOGISTICS || "delhivery";
  const sType = process.env.ITHINK_S_TYPE || "surface";
  const isReturn = !!options?.isReturn;
  const orderType = isReturn ? "reverse" : (process.env.ITHINK_ORDER_TYPE || "forward");

  const isCod = !isReturn && String(order.paymentMethod).toUpperCase() === "COD";
  const totalAmt = String(order.totalAmount || "0");
  const codAmt = isCod ? totalAmt : "0";
  const paymentMode = isCod ? "cod" : "Prepaid";

  const { line1, line2, line3 } = splitAddress80(order.shippingAddress);
  const cleanPhone = cleanPhone10Digits(order.shippingPhone);

  // Map products
  const products: IthinkProduct[] = (order.items || []).map((item: any) => ({
    product_name: String(item.productName || item.name || "Protein Product"),
    product_sku: String(item.variantId || item.productId || item.sku || "SKU-1"),
    product_quantity: String(item.quantity || 1),
    product_price: String(item.unitPrice || item.price || item.totalPrice || 0),
    product_tax_rate: "0",
    product_hsn_code: String(item.hsnCode || ""),
    product_discount: "0",
    product_img_url: String(item.productImage || item.image || ""),
  }));

  // Calculate total weight in grams (defaulting to 500 grams if not specified)
  let totalWeightGrams = 500;
  if (Array.isArray(order.items)) {
    const computed = order.items.reduce((sum: number, it: any) => {
      const w = Number(it.weight || it.product?.weight || 500);
      return sum + (w > 0 ? w * Number(it.quantity || 1) : 500);
    }, 0);
    if (computed > 0) totalWeightGrams = computed;
  }

  // Convert weight to Kilograms (KG) required by iThink Logistics (max 150 kg limit)
  const weightInKg = totalWeightGrams > 50
    ? (totalWeightGrams / 1000).toFixed(2)
    : Math.max(0.1, totalWeightGrams).toFixed(2);

  const orderNumberStr = String(order.orderNumber || `ORD-${order.id}`);

  const shipment: IthinkShipment = {
    waybill: order.waybill || "",
    order: isReturn ? `RET-${orderNumberStr}` : orderNumberStr,
    sub_order: order.subOrder || "",
    order_date: formatDateToDDMMYYYY(order.createdAt || order.placedAt),
    total_amount: totalAmt,
    name: String(order.shippingName || "Customer"),
    company_name: order.companyName || "",
    add: line1,
    add2: line2,
    add3: line3,
    pin: String(order.shippingPincode || ""),
    city: String(order.shippingCity || ""),
    state: String(order.shippingState || ""),
    country: order.shippingCountry || "India",
    phone: cleanPhone,
    alt_phone: cleanPhone10Digits(order.shippingAltPhone),
    email: userEmail,
    is_billing_same_as_shipping: order.isBillingSameAsShipping || "yes",
    billing_name: String(order.billingName || order.shippingName || "Customer"),
    billing_company_name: order.billingCompanyName || "",
    billing_add: line1,
    billing_add2: line2,
    billing_add3: line3,
    billing_pin: String(order.billingPincode || order.shippingPincode || ""),
    billing_city: String(order.billingCity || order.shippingCity || ""),
    billing_state: String(order.billingState || order.shippingState || ""),
    billing_country: order.billingCountry || "India",
    billing_phone: cleanPhone,
    billing_alt_phone: "",
    billing_email: order.billingEmail || userEmail,
    products: products,
    shipment_length: String(order.shipmentLength || "10"),
    shipment_width: String(order.shipmentWidth || "10"),
    shipment_height: String(order.shipmentHeight || "5"),
    weight: String(weightInKg),
    shipping_charges: String(order.shippingCharge || "0"),
    giftwrap_charges: "0",
    transaction_charges: "0",
    total_discount: String(order.discount || "0"),
    first_attemp_discount: "0",
    cod_charges: "0",
    advance_amount: "0",
    cod_amount: codAmt,
    payment_mode: paymentMode,
    reseller_name: order.resellerName || "",
    eway_bill_number: order.ewayBillNumber || "",
    gst_number: order.gstNumber || "",
    what3words: order.what3words || "",
    pickup_address_id: pickupAddressId,
    return_address_id: returnAddressId,
    logistics: logistics,
    order_type: orderType,
    s_type: sType,
  };

  return {
    data: {
      shipments: [shipment],
      pickup_address_id: pickupAddressId,
      access_token: accessToken,
      secret_key: secretKey,
      logistics: logistics,
      order_type: orderType,
      s_type: sType,
    },
  };
};

/**
 * Creates and submits an order to iThink Logistics API
 * Updates database record with order_id, shipment_id, and waybill when returned.
 */
export const createIthinklogisticsOrder = async (order: any, email?: string) => {
  try {
    const apiUrl = getIthinkApiUrl(process.env.ITHINK_API_URL, "ADD_ORDER");
    const payload = await buildIthinklogisticsPayload(order, email);

    console.log(
      `[iThink Logistics] Dispatching order (${order.orderNumber}) to ${apiUrl}:`,
      JSON.stringify(payload, null, 2)
    );

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "cache-control": "no-cache",
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const responseData: any = await response.json();
    console.log("[iThink Logistics] API Response:", responseData);

    // Extract identifiers from iThink response structure
    let ithinkOrderId: string | null = null;
    let ithinkShipmentId: string | null = null;
    let waybill: string | null = null;

    if (responseData) {
      if (responseData.data) {
        const d = responseData.data;
        if (Array.isArray(d) && d[0]) {
          ithinkOrderId = d[0].order_id || d[0].order_no || d[0].order || null;
          ithinkShipmentId = d[0].shipment_id || d[0].waybill || null;
          waybill = d[0].waybill || d[0].awb || d[0].awb_number || null;
        } else if (typeof d === "object") {
          ithinkOrderId = d.order_id || d.order_no || d.order || null;
          ithinkShipmentId = d.shipment_id || d.waybill || null;
          waybill = d.waybill || d.awb || d.awb_number || null;
        }
      }

      // Check fallback root keys
      if (!waybill && responseData.waybill) waybill = String(responseData.waybill);
      if (!ithinkOrderId && responseData.order_id) ithinkOrderId = String(responseData.order_id);
    }

    // Update database Order record with captured identifiers
    if (order.id && (ithinkOrderId || ithinkShipmentId || waybill)) {
      try {
        await prisma.order.update({
          where: { id: order.id },
          data: {
            ithinklogisticsOrderId: ithinkOrderId ? String(ithinkOrderId) : undefined,
            ithinklogisticsShipmentId: ithinkShipmentId ? String(ithinkShipmentId) : undefined,
            waybill: waybill ? String(waybill) : undefined,
          },
        });
        console.log(`[iThink Logistics] Updated DB order ${order.orderNumber} with waybill: ${waybill}`);
      } catch (dbErr) {
        console.error("[iThink Logistics] Failed to update Order record in DB:", dbErr);
      }
    }

    return {
      success: responseData?.status === "success" || responseData?.status_code === 200 || !responseData?.error,
      data: responseData,
      ithinkOrderId,
      ithinkShipmentId,
      waybill,
    };
  } catch (error) {
    console.error("[iThink Logistics] Order creation failed:", error);
    return { success: false, error: String(error) };
  }
};

/**
 * Alias for backward compatibility
 */
export const createIthinkOrder = createIthinklogisticsOrder;

/**
 * Cancels an order in iThink Logistics
 */
export const cancelIthinklogisticsOrder = async (order: any) => {
  try {
    const apiUrl = getIthinkApiUrl(process.env.ITHINK_CANCEL_URL, "CANCEL");
    const { accessToken, secretKey } = getIthinkCredentials();

    const orderNo = order.orderNumber || order.order || String(order);
    const awbNo = order.waybill || "";

    const payload = {
      data: {
        access_token: accessToken,
        secret_key: secretKey,
        order_no: orderNo,
        awb_numbers: awbNo,
      },
    };

    console.log(`[iThink Logistics] Cancelling order (${orderNo}) on ${apiUrl}:`, payload);

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "cache-control": "no-cache",
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const responseData = await response.json();
    console.log("[iThink Logistics] Cancel response:", responseData);
    return responseData;
  } catch (error) {
    console.error("[iThink Logistics] Order cancellation failed:", error);
    return { success: false, error: String(error) };
  }
};

export const cancelIthinkOrder = cancelIthinklogisticsOrder;

/**
 * Sync updated address to iThink Logistics before shipment dispatch
 */
export const updateIthinklogisticsOrderAddress = async (order: any, newAddress: any) => {
  try {
    const apiUrl = getIthinkApiUrl(process.env.ITHINK_UPDATE_ADDRESS_URL, "UPDATE_ADDRESS");
    const { accessToken, secretKey } = getIthinkCredentials();

    const { line1, line2, line3 } = splitAddress80(newAddress.shippingAddress || newAddress.address);
    const cleanPhone = cleanPhone10Digits(newAddress.shippingPhone || newAddress.phone);

    const payload = {
      data: {
        access_token: accessToken,
        secret_key: secretKey,
        order_no: order.orderNumber,
        awb_number: order.waybill || "",
        shipping_name: newAddress.shippingName || order.shippingName,
        shipping_phone: cleanPhone,
        shipping_address: line1,
        shipping_address_2: line2,
        shipping_address_3: line3,
        shipping_city: newAddress.shippingCity || order.shippingCity,
        shipping_state: newAddress.shippingState || order.shippingState,
        shipping_pin: String(newAddress.shippingPincode || order.shippingPincode),
      },
    };

    console.log(`[iThink Logistics] Updating address for (${order.orderNumber}):`, payload);

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "cache-control": "no-cache",
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const responseData = await response.json();
    console.log("[iThink Logistics] Update address response:", responseData);
    return responseData;
  } catch (error) {
    console.error("[iThink Logistics] Address update failed:", error);
    return { success: false, error: String(error) };
  }
};

/**
 * Creates a reverse return pickup order in iThink Logistics
 */
export const createIthinklogisticsReturnOrder = async (
  order: any,
  email?: string,
  reason?: string
) => {
  try {
    const apiUrl = getIthinkApiUrl(process.env.ITHINK_RETURN_URL, "RETURN");
    const payload = await buildIthinklogisticsPayload(order, email, {
      isReturn: true,
      returnReason: reason,
    });

    console.log(
      `[iThink Logistics] Creating reverse return order for (${order.orderNumber}):`,
      JSON.stringify(payload, null, 2)
    );

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "cache-control": "no-cache",
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const responseData: any = await response.json();
    console.log("[iThink Logistics] Return order response:", responseData);

    return {
      success: responseData?.status === "success" || responseData?.status_code === 200 || !responseData?.error,
      data: responseData,
    };
  } catch (error) {
    console.error("[iThink Logistics] Reverse return creation failed:", error);
    return { success: false, error: String(error) };
  }
};

export interface IthinkOrderDetailsParams {
  orderNo?: string;
  awbNumber?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * Fetches order details / status from iThink Logistics API
 */
export const getIthinkOrderDetails = async (params: IthinkOrderDetailsParams) => {
  try {
    const apiUrl = getIthinkApiUrl(process.env.ITHINK_GET_DETAILS_URL, "GET_DETAILS");
    const { accessToken, secretKey } = getIthinkCredentials();

    const todayStr = new Date().toISOString().split("T")[0];
    const pastDate = new Date();
    pastDate.setMonth(pastDate.getMonth() - 12);
    const defaultStartDate = pastDate.toISOString().split("T")[0];

    const payload = {
      data: {
        awb_number_list: params.awbNumber || "",
        order_no: params.orderNo || "",
        start_date: params.startDate || defaultStartDate,
        end_date: params.endDate || todayStr,
        access_token: accessToken,
        secret_key: secretKey,
      },
    };

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "cache-control": "no-cache",
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error("[iThink Logistics] Error fetching order details:", error);
    return { success: false, error: String(error) };
  }
};

export interface IthinkTrackParams {
  awbNumberList?: string;
  orderNo?: string;
}

/**
 * Tracks shipment status from iThink Logistics API
 */
export const trackIthinkOrder = async (params: IthinkTrackParams | string) => {
  try {
    const apiUrl = getIthinkApiUrl(process.env.ITHINK_TRACK_URL, "TRACK");
    const { accessToken, secretKey } = getIthinkCredentials();

    let awbList = "";
    if (typeof params === "string") {
      awbList = params;
    } else {
      awbList = params.awbNumberList || params.orderNo || "";
    }

    const payload = {
      data: {
        awb_number_list: awbList,
        access_token: accessToken,
        secret_key: secretKey,
      },
    };

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "cache-control": "no-cache",
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error("[iThink Logistics] Error tracking order:", error);
    return { success: false, error: String(error) };
  }
};
