import fetch from "node-fetch";

const geoCache = new Map();

/**
 * Resolves geolocation details for a given IP address
 * @param {string} ipAddress - Client IP address
 * @returns {Promise<Object>} - Geolocation object containing city, region, postal, country, ip, and org
 */
export async function resolveGeo(ipAddress) {
  const fallback = {
    city: "Unknown City",
    region: "Unknown State",
    postal: "",
    country: "Unknown Country",
    ip: ipAddress || "",
    org: ""
  };

  if (!ipAddress) return fallback;

  let ip = ipAddress.trim();
  if (ip.includes(",")) {
    ip = ip.split(",")[0].trim();
  }
  if (ip.startsWith("::ffff:")) {
    ip = ip.substring(7);
  }

  // Handle private/local network IPs & loopback
  const isLocalOrPrivate = 
    ip === "127.0.0.1" || 
    ip === "::1" || 
    ip === "localhost" ||
    ip.startsWith("192.168.") || 
    ip.startsWith("10.") || 
    ip.startsWith("172.16.") || 
    ip.startsWith("172.17.") || 
    ip.startsWith("172.18.") || 
    ip.startsWith("172.19.") || 
    ip.startsWith("172.2") || 
    ip.startsWith("172.3");

  if (isLocalOrPrivate) {
    return {
      city: "Bengaluru",
      region: "Karnataka",
      postal: "560001",
      country: "India",
      ip,
      org: "Local Development Network"
    };
  }

  if (geoCache.has(ip)) {
    return geoCache.get(ip);
  }

  try {
    const response = await fetch(`http://ip-api.com/json/${ip}`);
    if (response.ok) {
      const data = await response.json();
      if (data.status === "success") {
        const geo = {
          city: data.city || "Unknown City",
          region: data.regionName || "Unknown State",
          postal: data.zip || "",
          country: data.country || "Unknown Country",
          ip,
          org: data.org || data.isp || ""
        };
        geoCache.set(ip, geo);
        return geo;
      }
    }
  } catch (err) {
    console.error(`[GeoLookup] Failed resolving IP ${ip}:`, err.message);
  }

  return fallback;
}
