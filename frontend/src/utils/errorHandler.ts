import axios from "axios";

export function getErrorMessage(
  error: unknown,
): string {
  if (axios.isAxiosError(error)) {
    const detail =
      error.response?.data?.detail;

    if (typeof detail === "string") {
      return detail;
    }

    const message =
      error.response?.data?.message;

    if (typeof message === "string") {
      return message;
    }

    if (error.response?.status) {
      return `Request failed with status ${error.response.status}.`;
    }

    if (error.request) {
      return "Unable to connect to the backend server.";
    }

    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred.";
}