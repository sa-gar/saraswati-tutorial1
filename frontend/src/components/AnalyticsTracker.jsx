import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { initAnalytics, trackPageChange, updatePageView, trackEvent } from "../utils/analytics";

export default function AnalyticsTracker() {
  const location = useLocation();
  const currentPathRef = useRef(location.pathname);
  const maxScrollDepthRef = useRef(0);
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    // 1. Initialize analytics IDs and geo lookup
    initAnalytics();

    // 2. Dynamically load Microsoft Clarity
    const clarityId = import.meta.env.VITE_CLARITY_PROJECT_ID || "xbj2we9di2";
    if (clarityId && !window.clarity) {
      (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
      })(window,document,"clarity","script",clarityId);
    }

    // 3. Dynamically load Google Tag Manager
    const gtmId = import.meta.env.VITE_GTM_ID || "GTM-WCKPX3JJ";
    if (gtmId && !window.dataLayer) {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
      const f = document.getElementsByTagName("script")[0];
      const j = document.createElement("script");
      j.async = true;
      j.src = "https://www.googletagmanager.com/gtm.js?id=" + gtmId;
      f.parentNode.insertBefore(j, f);
    }

    // 3b. Dynamically load Google Analytics 4 and Google Ads Config
    const ga4Id = import.meta.env.VITE_GA4_MEASUREMENT_ID || "G-JV6G65QVLJ";
    const adsId = import.meta.env.VITE_GOOGLE_ADS_ID || "AW-17166473673";

    if (window.gtag) {
      if (adsId) {
        window.gtag("config", adsId);
      }
      if (ga4Id && ga4Id !== "G-JV6G65QVLJ") {
        window.gtag("config", ga4Id);
      }
    } else if (ga4Id || adsId) {
      const tagId = ga4Id || adsId;
      window.dataLayer = window.dataLayer || [];
      window.gtag = function() { window.dataLayer.push(arguments); };
      window.gtag("js", new Date());
      window.gtag("config", tagId);
      if (adsId && ga4Id) {
        window.gtag("config", adsId);
      }
      const f = document.getElementsByTagName("script")[0];
      const j = document.createElement("script");
      j.async = true;
      j.src = "https://www.googletagmanager.com/gtag/js?id=" + tagId;
      f.parentNode.insertBefore(j, f);
    }

    // 4. Scroll depth listener
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight > 0) {
        const depth = Math.round((scrollTop / scrollHeight) * 100);
        if (depth > maxScrollDepthRef.current) {
          maxScrollDepthRef.current = Math.min(depth, 100);
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    // 4b. Global click listener for key CTA tracking (WhatsApp, Call, Become Tutor)
    const handleGlobalClick = (e) => {
      const target = e.target.closest("a");
      if (!target) return;
      
      const href = target.getAttribute("href") || "";
      
      if (href.includes("wa.me") || href.includes("whatsapp.com")) {
        trackEvent("whatsapp_click", href);
      }
      
      if (href.startsWith("tel:")) {
        trackEvent("call_click", href);
      }

      if (href.includes("tutor-register") || href.includes("become-tutor")) {
        trackEvent("become_tutor", href);
      }
    };

    window.addEventListener("click", handleGlobalClick);

    // 5. Visibility and beforeunload listener to update time spent on final page
    const handleUnloadOrVisibility = () => {
      const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
      if (timeSpent > 0 || maxScrollDepthRef.current > 0) {
        updatePageView(currentPathRef.current, timeSpent, maxScrollDepthRef.current);
      }
    };

    window.addEventListener("beforeunload", handleUnloadOrVisibility);
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        handleUnloadOrVisibility();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("click", handleGlobalClick);
      window.removeEventListener("beforeunload", handleUnloadOrVisibility);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Track location/pathname changes
  useEffect(() => {
    // Report stats for the previous page
    if (currentPathRef.current) {
      const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
      updatePageView(currentPathRef.current, timeSpent, maxScrollDepthRef.current);
    }

    // Reset stats for the new page
    currentPathRef.current = location.pathname;
    startTimeRef.current = Date.now();
    maxScrollDepthRef.current = 0;

    // Log new page view
    trackPageChange(location.pathname);

    // Funnel entries
    if (location.pathname === "/") {
      trackEvent("homepage_visit");
      trackEvent("plans_viewed");
    } else if (location.pathname === "/parent-enquiry") {
      trackEvent("enquiry_started");
    } else if (location.pathname === "/thank-you") {
      trackEvent("thank_you_viewed");
    }
  }, [location.pathname]);

  return null;
}
