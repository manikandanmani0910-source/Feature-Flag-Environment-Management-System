import type {
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";

export function setupInterceptors(
  client: AxiosInstance,
) {
  client.interceptors.request.use(
    (
      config: InternalAxiosRequestConfig,
    ) => {
      const token =
        localStorage.getItem(
          "access_token",
        );

      if (token) {
        config.headers.Authorization =
          `Bearer ${token}`;
      }

      return config;
    },
    (error) => {
      return Promise.reject(error);
    },
  );

  client.interceptors.response.use(
    (response) => response,

    async (error) => {
      if (
        error.response?.status === 401
      ) {
        localStorage.removeItem(
          "access_token",
        );

        localStorage.removeItem(
          "refresh_token",
        );
      }

      return Promise.reject(error);
    },
  );
}