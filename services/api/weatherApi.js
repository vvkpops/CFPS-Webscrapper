// services/api/weatherApi.js

import { BASE_API_URL, CORS_PROXY } from '../../utils/constants/apiEndpoints.js';

export const fetchIndividualAlpha = async (site, alpha) => {
  const params = new URLSearchParams();
  params.set("site", site);
  params.set("alpha", alpha);
  params.set("notam_choice", "default");
  params.set("_", Date.now());

  const url = CORS_PROXY + encodeURIComponent(BASE_API_URL + params.toString());

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return await response.json();
};

export const fetchIndividualImage = async (site, image) => {
  const params = new URLSearchParams();
  params.set("site", site);
  params.set("image", image);
  params.set("_", Date.now());

  const url = CORS_PROXY + encodeURIComponent(BASE_API_URL + params.toString());

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return await response.json();
};
