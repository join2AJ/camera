/**
 * Camera proxy — fetches a (usually HTTP) camera image server-side and returns
 * it over HTTPS, so an HTTPS-hosted app can display an HTTP-only camera without
 * tripping the browser's mixed-content block.
 *
 * Best suited to single-JPEG snapshot endpoints (e.g. AXIS /axis-cgi/jpg/image.cgi),
 * polled a few times per second by the client. Multipart MJPEG streams do not
 * work through a request/response function — use `snapshot` mode for those.
 *
 * Security: only hosts on the allowlist are proxied, to avoid an open relay.
 * Configure with the CAM_PROXY_ALLOW env var (comma-separated hosts, or `*` to
 * allow any — not recommended). The camera from initial setup is allowed by
 * default; edit DEFAULT_ALLOW below for your own devices.
 */

const DEFAULT_ALLOW = ['80.32.125.254'];

function allowedHosts() {
  const env = (process.env.CAM_PROXY_ALLOW || '').split(',').map((s) => s.trim()).filter(Boolean);
  return { list: [...DEFAULT_ALLOW, ...env], any: env.includes('*') };
}

export async function handler(event) {
  const target = event.queryStringParameters?.url;
  if (!target) return { statusCode: 400, body: 'Missing ?url' };

  let parsed;
  try {
    parsed = new URL(target);
  } catch {
    return { statusCode: 400, body: 'Invalid url' };
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { statusCode: 400, body: 'Only http(s) targets are allowed' };
  }

  const { list, any } = allowedHosts();
  if (!any && !list.includes(parsed.hostname)) {
    return { statusCode: 403, body: `Host not allowed: ${parsed.hostname}. Add it to CAM_PROXY_ALLOW.` };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const upstream = await fetch(parsed.toString(), {
      signal: controller.signal,
      headers: { 'User-Agent': 'ApertureVMS-proxy' },
    });
    const contentType = upstream.headers.get('content-type') || 'application/octet-stream';

    if (contentType.includes('multipart')) {
      return { statusCode: 415, body: 'Multipart MJPEG is not supported through the proxy — use snapshot mode.' };
    }

    const buf = Buffer.from(await upstream.arrayBuffer());
    return {
      statusCode: upstream.status,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'no-store',
        'Access-Control-Allow-Origin': '*',
      },
      body: buf.toString('base64'),
      isBase64Encoded: true,
    };
  } catch (err) {
    const aborted = err && err.name === 'AbortError';
    return { statusCode: aborted ? 504 : 502, body: aborted ? 'Camera timed out' : 'Camera unreachable' };
  } finally {
    clearTimeout(timeout);
  }
}
