import { API_ENDPOINTS } from "../constants";

export const fetchApplicationInfo = async (
  baseUrl: string,
  applicationId: string,
) => {
  const response = await fetch(API_ENDPOINTS.application(baseUrl, applicationId));
  if (response.ok) {
    return response.json().then((data) => data.application);
  }
  throw new Error("Failed to fetch application info");
};

export const fetchProviderInfo = async (
  baseUrl: string,
  providerId: string,
  providerVersion?: string,
) => {
  const response = await fetch(
    API_ENDPOINTS.provider(baseUrl, providerId, providerVersion),
  );
  if (response.ok) {
    return response.json().then((data) => data.providers);
  }
  throw new Error("Failed to fetch provider info");
};
