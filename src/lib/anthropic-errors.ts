const ANTHROPIC_KEY_PREFIX = "sk-ant-";

export function isAnthropicKeyConfigured(key: string | undefined): boolean {
  if (!key) return false;

  const trimmed = key.trim();
  if (!trimmed.startsWith(ANTHROPIC_KEY_PREFIX)) return false;
  if (trimmed.length < 30) return false;

  // Obvious placeholders from docs/templates
  if (/your[-_]?api[-_]?key|replace[-_]?me|xxx/i.test(trimmed)) return false;

  return true;
}

export function normalizeAnthropicError(error: unknown): Error {
  const message = error instanceof Error ? error.message : String(error);
  const lower = message.toLowerCase();

  if (
    lower.includes("invalid x-api-key") ||
    lower.includes("authentication_error") ||
    lower.includes("invalid api key") ||
    lower.includes("invalid anthropic api key") ||
    (lower.includes("401") && lower.includes("x-api-key"))
  ) {
    return new Error(
      "Invalid Anthropic API key. Add a valid key from console.anthropic.com to ANTHROPIC_API_KEY in .env.local (starts with sk-ant-), then restart the dev server.",
    );
  }

  if (lower.includes("rate limit") || lower.includes("rate_limit")) {
    return new Error("Claude API rate limit reached. Please try again later.");
  }

  if (lower.includes("not_found_error") || lower.includes("model:")) {
    return new Error(
      "Claude model not available. Set ANTHROPIC_MODEL in .env.local (recommended: claude-sonnet-4-6).",
    );
  }

  return error instanceof Error ? error : new Error(message);
}
