const ABSOLUTE_URL_PATTERN = /^(?:[a-z][a-z\d+\-.]*:)?\/\//i;
const INLINE_IMAGE_PATTERN = /^(data|blob):/i;

function stripApiPath(url) {
  return url.replace(/\/api\/?$/, "").replace(/\/$/, "");
}

function getServerBaseUrl() {
  const apiUrl = import.meta.env.VITE_API_URL;
  const socketUrl = import.meta.env.VITE_SOCKET_URL;

  if (apiUrl && ABSOLUTE_URL_PATTERN.test(apiUrl)) {
    return stripApiPath(apiUrl);
  }

  if (socketUrl && ABSOLUTE_URL_PATTERN.test(socketUrl)) {
    return socketUrl.replace(/\/$/, "");
  }

  return import.meta.env.DEV ? "http://localhost:5000" : window.location.origin;
}

export function getImageUrl(imageUrl) {
  const value = String(imageUrl || "").trim();

  if (!value) return "";
  if (ABSOLUTE_URL_PATTERN.test(value) || INLINE_IMAGE_PATTERN.test(value))
    return value;

  const imagePath = value.startsWith("/") ? value : `/${value}`;
  return `${getServerBaseUrl()}${imagePath}`;
}
