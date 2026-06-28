import { API_BASE } from "../config";

// Generates a random alphanumeric ID
function generateId() {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

// Detect device type based on window width
export function getDeviceType() {
  const width = window.innerWidth;
  if (width < 768) return "Mobile";
  if (width < 1024) return "Tablet";
  return "Desktop";
}

// Detect browser and OS
export function getBrowserAndOS() {
  const ua = navigator.userAgent;
  let browser = "Unknown Browser";
  let os = "Unknown OS";

  // Browser detection
  if (ua.includes("Firefox")) browser = "Firefox";
  else if (ua.includes("SamsungBrowser")) browser = "Samsung Browser";
  else if (ua.includes("Opera") || ua.includes("OPR")) browser = "Opera";
  else if (ua.includes("Trident")) browser = "Internet Explorer";
  else if (ua.includes("Edge") || ua.includes("Edg")) browser = "Edge";
  else if (ua.includes("Chrome")) browser = "Chrome";
  else if (ua.includes("Safari")) browser = "Safari";

  // OS detection
  if (ua.includes("Windows")) os = "Windows";
  else if (ua.includes("Macintosh") || ua.includes("Mac OS")) os = "macOS";
  else if (ua.includes("Android")) os = "Android";
  else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";
  else if (ua.includes("Linux")) os = "Linux";

  return { browser, os };
}

// Parse traffic source based on UTM params, ref, or document.referrer
export function getTrafficSource() {
  const cachedSource = sessionStorage.getItem("utm_source");
  if (cachedSource) return cachedSource;

  const urlParams = new URLSearchParams(window.location.search);
  const utmSource =
    urlParams.get("utm_source") || urlParams.get("source") || urlParams.get("ref");

  if (utmSource) {
    const src = utmSource.toLowerCase();
    if (src.includes("whatsapp") || src === "wa") return "WhatsApp";
    if (src.includes("google")) return "Google Search";
    if (src.includes("instagram") || src === "ig") return "Instagram";
    if (src.includes("facebook") || src === "fb") return "Facebook";
    if (src.includes("youtube") || src === "yt") return "YouTube";
    if (src.includes("direct")) return "Direct Visit";
    return "Other Referral Websites";
  }

  const referrer = document.referrer ? document.referrer.toLowerCase() : "";
  if (!referrer) {
    return "Direct Visit";
  }
  if (referrer.includes("google.com")) {
    return "Google Search";
  }
  if (referrer.includes("whatsapp.com") || referrer.includes("wa.me")) {
    return "WhatsApp";
  }
  if (referrer.includes("instagram.com")) {
    return "Instagram";
  }
  if (referrer.includes("facebook.com") || referrer.includes("messenger.com")) {
    return "Facebook";
  }
  if (referrer.includes("youtube.com") || referrer.includes("youtu.be")) {
    return "YouTube";
  }
  return "Other Referral Websites";
}

// Parse and store UTM params in sessionStorage with referrers fallback
export function captureUtmParams() {
  const urlParams = new URLSearchParams(window.location.search);
  const utms = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
  
  let hasUtms = false;
  utms.forEach((key) => {
    const val = urlParams.get(key);
    if (val) {
      sessionStorage.setItem(key, val);
      hasUtms = true;
    }
  });

  // Fallback for utm_source if not set
  if (!sessionStorage.getItem("utm_source")) {
    const referrer = document.referrer ? document.referrer.toLowerCase() : "";
    let detectedSource = "Direct";
    let detectedMedium = "none";
    
    if (referrer) {
      if (referrer.includes("google.com")) {
        detectedSource = "Google";
        detectedMedium = "organic";
      } else if (referrer.includes("whatsapp.com") || referrer.includes("wa.me")) {
        detectedSource = "WhatsApp";
        detectedMedium = "social";
      } else if (referrer.includes("instagram.com")) {
        detectedSource = "Instagram";
        detectedMedium = "social";
      } else if (referrer.includes("facebook.com") || referrer.includes("messenger.com")) {
        detectedSource = "Facebook";
        detectedMedium = "social";
      } else if (referrer.includes("youtube.com") || referrer.includes("youtu.be")) {
        detectedSource = "YouTube";
        detectedMedium = "social";
      } else {
        detectedSource = "Referral";
        detectedMedium = "referral";
      }
    }
    sessionStorage.setItem("utm_source", detectedSource);
    sessionStorage.setItem("utm_medium", detectedMedium);
    sessionStorage.setItem("utm_campaign", "none");
    sessionStorage.setItem("utm_content", "none");
    sessionStorage.setItem("utm_term", "none");
  }
}

// Fetch geolocation and cache in localStorage
export async function getGeoInfo() {
  const cached = localStorage.getItem("visitor_geo");
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (parsed.city && parsed.city !== "Unknown City") {
        return parsed;
      }
    } catch (e) {
      // Ignore parse error and refetch
    }
  }

  try {
    const res = await fetch("https://ipapi.co/json/");
    const data = await res.json();
    const geo = {
      city: data.city || "Unknown City",
      region: data.region || "Unknown State",
      country: data.country_name || "Unknown Country",
      ip: data.ip || ""
    };
    if (geo.city && geo.city !== "Unknown City") {
      localStorage.setItem("visitor_geo", JSON.stringify(geo));
    }
    return geo;
  } catch (err) {
    console.error("Geo lookup error:", err);
    return {
      city: "Unknown City",
      region: "Unknown State",
      country: "Unknown Country",
      ip: ""
    };
  }
}

// Initialize visitor tracking variables
export function initAnalytics() {
  if (!localStorage.getItem("visitor_id")) {
    localStorage.setItem("visitor_id", "v_" + generateId());
  }
  if (!sessionStorage.getItem("session_id")) {
    sessionStorage.setItem("session_id", "s_" + generateId());
  }
  // Capture UTM parameters immediately
  captureUtmParams();
  // Trigger geo lookup silently in the background
  getGeoInfo();
}

// Send page view transition
export async function trackPageChange(path) {
  const visitorId = localStorage.getItem("visitor_id");
  const sessionId = sessionStorage.getItem("session_id");
  if (!visitorId || !sessionId) return;

  const geo = JSON.parse(localStorage.getItem("visitor_geo") || "{}");
  const device = getDeviceType();
  const { browser, os } = getBrowserAndOS();
  const source = getTrafficSource();

  const payload = {
    visitor_id: visitorId,
    session_id: sessionId,
    city: geo.city || "Unknown City",
    country: geo.country || "Unknown Country",
    region: geo.region || "Unknown State",
    source,
    page_visited: path,
    device,
    browser,
    os,
    action: "page_view"
  };

  // Google Analytics GA4 event
  if (window.gtag) {
    window.gtag("event", "page_view", {
      page_path: path,
      page_title: document.title,
      device_category: device
    });
  }

  // GTM event
  if (window.dataLayer) {
    window.dataLayer.push({
      event: "page_view",
      page_path: path,
      page_title: document.title,
      device_category: device
    });
  }

  try {
    await fetch(`${API_BASE}/analytics/log`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
  } catch (err) {
    console.error("Failed to log page view:", err);
  }
}

// Update time_spent and scroll depth of latest page view
export async function updatePageView(path, timeSpent, scrollDepth) {
  const visitorId = localStorage.getItem("visitor_id");
  const sessionId = sessionStorage.getItem("session_id");
  if (!visitorId || !sessionId) return;

  const payload = {
    visitor_id: visitorId,
    session_id: sessionId,
    page_visited: path,
    action: "update_page_view",
    time_spent: timeSpent,
    scroll_depth: scrollDepth
  };

  try {
    await fetch(`${API_BASE}/analytics/log`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true
    });
  } catch (err) {
    console.error("Failed to update page view:", err);
  }
}

// Track custom user interactions
export async function trackEvent(action, planClicked = "", enquirySubmitted = false) {
  const visitorId = localStorage.getItem("visitor_id");
  const sessionId = sessionStorage.getItem("session_id");
  if (!visitorId || !sessionId) return;

  const geo = JSON.parse(localStorage.getItem("visitor_geo") || "{}");
  const device = getDeviceType();
  const { browser, os } = getBrowserAndOS();
  const source = getTrafficSource();

  const payload = {
    visitor_id: visitorId,
    session_id: sessionId,
    city: geo.city || "Unknown City",
    country: geo.country || "Unknown Country",
    region: geo.region || "Unknown State",
    source,
    page_visited: window.location.pathname,
    plan_clicked: planClicked,
    enquiry_submitted: enquirySubmitted,
    device,
    browser,
    os,
    action
  };

  // Google Analytics GA4 event
  if (window.gtag) {
    window.gtag("event", action, {
      plan_clicked: planClicked,
      enquiry_submitted: enquirySubmitted,
      page_path: window.location.pathname
    });
  }

  // GTM event
  if (window.dataLayer) {
    window.dataLayer.push({
      event: action,
      plan_clicked: planClicked,
      enquiry_submitted: enquirySubmitted,
      page_path: window.location.pathname
    });
  }

  // Microsoft Clarity event
  if (window.clarity) {
    window.clarity("event", action);
  }

  try {
    await fetch(`${API_BASE}/analytics/log`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true
    });
  } catch (err) {
    console.error(`Failed to track event ${action}:`, err);
  }
}

// Trigger Google Ads Conversion & Google Analytics generate_lead verified events
export async function trackLeadConversion() {
  if (sessionStorage.getItem("conversion_fired")) {
    console.log("Conversion already fired in this session.");
    return;
  }
  sessionStorage.setItem("conversion_fired", "true");

  const adsId = import.meta.env.VITE_GOOGLE_ADS_ID || "AW-17166473673";
  const conversionLabel = import.meta.env.VITE_GOOGLE_ADS_CONVERSION_LABEL || "1bJTCL7i4cYcEMmzzvk_";

  // Google Ads Conversion Event
  if (window.gtag && adsId && conversionLabel) {
    window.gtag("event", "conversion", {
      send_to: `${adsId}/${conversionLabel}`,
    });
  }

  // Google Analytics generate_lead Event
  if (window.gtag) {
    window.gtag("event", "generate_lead", {
      event_category: "engagement",
      event_label: "Enquiry Form Submitted",
    });
  }

  // GTM Event
  if (window.dataLayer) {
    window.dataLayer.push({
      event: "generate_lead",
      ads_id: adsId,
      conversion_label: conversionLabel
    });
    window.dataLayer.push({
      event: "demo_booking_completed"
    });
  }

  // Database logs to trigger the funnel steps:
  // - google_ads_conversion
  // - ga_generate_lead
  // - lead_recorded
  await trackEvent("google_ads_conversion", "", true);
  await trackEvent("ga_generate_lead", "", true);
  await trackEvent("lead_recorded", "", true);
}
