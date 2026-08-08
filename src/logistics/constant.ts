/**
 * iThink Logistics API URLs & Constants
 */
export const ITHINK_URLS = {
  STAGING: {
    ADD_ORDER: "https://pre-alpha.ithinklogistics.com/api_v3/order/add.json",
    GET_DETAILS:
      "https://pre-alpha.ithinklogistics.com/api_v3/order/get_details.json",
    TRACK: "https://pre-alpha.ithinklogistics.com/api_v3/order/track.json",
  },
  PRODUCTION: {
    ADD_ORDER: "https://my.ithinklogistics.com/api_v3/order/add.json",
    GET_DETAILS: "https://my.ithinklogistics.com/api_v3/order/get_details.json",
    TRACK: "https://my.ithinklogistics.com/api_v3/order/track.json",
  },
};

/**
 * Helper to get the correct API URL based on environment override or NODE_ENV
 */
export const getIthinkApiUrl = (
  envVarOverride?: string,
  endpointType: "ADD_ORDER" | "GET_DETAILS" | "TRACK" = "ADD_ORDER",
): string => {
  if (envVarOverride) return envVarOverride;
  const isProduction = process.env.NODE_ENV === "production";
  const envKey = isProduction ? "PRODUCTION" : "STAGING";
  return ITHINK_URLS[envKey][endpointType];
};
