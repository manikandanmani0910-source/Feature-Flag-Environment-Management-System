import axios from "axios";

import { setupInterceptors } from "./interceptors";

const apiClient = axios.create({
  baseURL: "http://127.0.0.1:8000/api/v1",

  timeout: 30000,

  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

setupInterceptors(apiClient);

export { apiClient };

export default apiClient;