export function errorResponse(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

export function parseQueryParam(
  params: URLSearchParams,
  key: string,
  defaultValue: number
): number {
  const val = params.get(key);
  if (!val) return defaultValue;
  const num = parseInt(val, 10);
  return isNaN(num) ? defaultValue : num;
}
