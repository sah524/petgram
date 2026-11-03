import axios, { AxiosRequestConfig } from "axios";

export async function request(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const config: AxiosRequestConfig = {
    url,
    method: options.method || "GET",
    headers: options.headers as Record<string, string> | undefined,
    data: options.body,
    validateStatus: () => true,
  };

  const result = await axios(config);
  const data = result.data;

  const headers = new Headers();

  Object.entries(result.headers).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      headers.set(key, String(value));
    }
  });

  return {
    ok: result.status >= 200 && result.status < 300,
    status: result.status,
    headers,
    json: async () => data,
    text: async () =>
      typeof data === "string"
        ? data
        : JSON.stringify(data),
  } as Response;
}