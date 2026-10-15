export const production_url: string =
  "https://hotel-reservation-v3-server.m360ictapi.com/api/v1";
export const local_url = "http://localhost:3109/api/v1";
export const API_TIMEOUT = 15000;
export const imageHostLink =
  "https://m360-trabill.s3.ap-south-1.amazonaws.com/travistay";
export const grnImageBase = "https://images.grnconnect.com/";

export const isProduction = process.env.NODE_ENV === "production";

export const baseURL: string = (process.env.NEXT_PUBLIC_API_BASE_URL || (isProduction ? production_url : local_url)).replace(/\/+$/, "");

export const dev_agency_token = "8b2c44f0-6e94-4d38-941d-06557bb3f292";
export const prod_agency_token = "8b2c44f0-6e94-4d38-941d-06557bb3f292";

export const agency_token = isProduction ? prod_agency_token : dev_agency_token;
