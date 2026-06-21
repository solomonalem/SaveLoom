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
    const primary = data.error ?? data.message ?? fallback;
    if (data.details && data.details !== primary) {
      return `${primary}: ${data.details}`;
    }
    return primary;
  } catch {
    return fallback;
  }
}
