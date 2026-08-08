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
  return_address_id: string | number;
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
 * Creates and submits an order to the iThink Logistics API (/api_v3/order/add.json)
 * @param order - Order object containing items, shipping info, and payment mode
 * @param email - Optional user email fallback
 */
export const createIthinkOrder = async (order: any, email?: string) => {
  try {
    const apiUrl = getIthinkApiUrl(process.env.ITHINK_API_URL, "ADD_ORDER");

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

    const accessToken =
      process.env.Access_Token ||
      process.env.ITHINK_ACCESS_TOKEN ||
      "8ujik47cea32ed386b1f65c85fd9aaaf";

    const secretKey =
      process.env.Secret_key ||
      process.env.Secret_Key ||
      process.env.ITHINK_SECRET_KEY ||
      "65tghjmads9dbcd892ad4987jmn602a7";

    const pickupAddressId = process.env.ITHINK_PICKUP_ADDRESS_ID || "24";
    const returnAddressId = process.env.ITHINK_RETURN_ADDRESS_ID || "24";
    const logistics = process.env.ITHINK_LOGISTICS || "delhivery";
    const sType = process.env.ITHINK_S_TYPE || "surface";
    const orderType = process.env.ITHINK_ORDER_TYPE || "forward";

    const isCod = String(order.paymentMethod).toUpperCase() === "COD";
    const totalAmt = String(order.totalAmount || "0");
    const codAmt = isCod ? totalAmt : "0";
    const paymentMode = isCod ? "cod" : "Prepaid";

    const products: IthinkProduct[] = (order.items || []).map((item: any) => ({
      product_name: String(item.productName || item.name || "Product"),
      product_sku: String(item.variantId || item.productId || item.sku || "SKU-1"),
      product_quantity: String(item.quantity || 1),
      product_price: String(item.unitPrice || item.price || item.totalPrice || 0),
      product_tax_rate: "0",
      product_hsn_code: String(item.hsnCode || ""),
      product_discount: "0",
      product_img_url: String(item.productImage || item.image || ""),
    }));

    const shipment: IthinkShipment = {
      waybill: order.waybill || "",
      order: String(order.orderNumber || `ORD-${order.id}`),
      sub_order: order.subOrder || "",
      order_date: formatDateToDDMMYYYY(order.createdAt || order.placedAt),
      total_amount: totalAmt,
      name: String(order.shippingName || "Customer"),
      company_name: order.companyName || "",
      add: String(order.shippingAddress || ""),
      add2: order.shippingAddress2 || "",
      add3: order.shippingAddress3 || "",
      pin: String(order.shippingPincode || ""),
      city: String(order.shippingCity || ""),
      state: String(order.shippingState || ""),
      country: order.shippingCountry || "India",
      phone: String(order.shippingPhone || ""),
      alt_phone: order.shippingAltPhone || "",
      email: userEmail,
      is_billing_same_as_shipping: order.isBillingSameAsShipping || "yes",
      billing_name: String(order.billingName || order.shippingName || "Customer"),
      billing_company_name: order.billingCompanyName || "",
      billing_add: String(order.billingAddress || order.shippingAddress || ""),
      billing_add2: order.billingAddress2 || "",
      billing_add3: order.billingAddress3 || "",
      billing_pin: String(order.billingPincode || order.shippingPincode || ""),
      billing_city: String(order.billingCity || order.shippingCity || ""),
      billing_state: String(order.billingState || order.shippingState || ""),
      billing_country: order.billingCountry || "India",
      billing_phone: String(order.billingPhone || order.shippingPhone || ""),
      billing_alt_phone: order.billingAltPhone || "",
      billing_email: order.billingEmail || userEmail,
      products: products,
      shipment_length: String(order.shipmentLength || "10"),
      shipment_width: String(order.shipmentWidth || "10"),
      shipment_height: String(order.shipmentHeight || "5"),
      weight: String(order.weight || "500.00"),
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
      return_address_id: returnAddressId,
    };

    const payload: IthinkOrderPayload = {
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

    console.log(
      `Sending order (${shipment.order}) to iThink Logistics API [${apiUrl}]:`,
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

    const responseData = await response.json();
    console.log("iThink Logistics API Response:", responseData);

    return responseData;
  } catch (error) {
    console.error("Error creating iThink Logistics order:", error);
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
 * Fetches order details / tracking status from iThink Logistics API (/order/get_details.json)
 */
export const getIthinkOrderDetails = async (params: IthinkOrderDetailsParams) => {
  try {
    const apiUrl = getIthinkApiUrl(process.env.ITHINK_GET_DETAILS_URL, "GET_DETAILS");

    const accessToken =
      process.env.Access_Token ||
      process.env.ITHINK_ACCESS_TOKEN ||
      "8ujik47cea32ed386b1f65c85fd9aaaf";

    const secretKey =
      process.env.Secret_key ||
      process.env.Secret_Key ||
      process.env.ITHINK_SECRET_KEY ||
      "65tghjmads9dbcd892ad4987jmn602a7";

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

    console.log(
      "Fetching order details from iThink Logistics API:",
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

    const responseData = await response.json();
    console.log("iThink Logistics Order Details Response:", responseData);

    return responseData;
  } catch (error) {
    console.error("Error fetching iThink Logistics order details:", error);
    return { success: false, error: String(error) };
  }
};

export interface IthinkTrackParams {
  awbNumberList?: string;
  orderNo?: string;
}

/**
 * Tracks shipment status from iThink Logistics API (/order/track.json)
 */
export const trackIthinkOrder = async (params: IthinkTrackParams | string) => {
  try {
    const apiUrl = getIthinkApiUrl(process.env.ITHINK_TRACK_URL, "TRACK");

    const accessToken =
      process.env.Access_Token ||
      process.env.ITHINK_ACCESS_TOKEN ||
      "8ujik47cea32ed386b1f65c85fd9aaaf";

    const secretKey =
      process.env.Secret_key ||
      process.env.Secret_Key ||
      process.env.ITHINK_SECRET_KEY ||
      "65tghjmads9dbcd892ad4987jmn602a7";

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

    console.log(
      "Tracking order with iThink Logistics API (/order/track.json):",
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

    const responseData = await response.json();
    console.log("iThink Logistics Tracking Response:", responseData);

    return responseData;
  } catch (error) {
    console.error("Error tracking iThink Logistics order:", error);
    return { success: false, error: String(error) };
  }
};
