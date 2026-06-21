export async function parseApiError(
  response: Response,
  fallback = "Something went wrong. Please try again."
): Promise<string> {
  try {
    const data = (await response.json()) as {
      error?: string;
      details?: string;
      message?: string;
    };
    return data.error ?? data.details ?? data.message ?? fallback;
  } catch {
    return fallback;
  }
}
