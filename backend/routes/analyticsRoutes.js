import express from "express";
import AnalyticsLog from "../models/AnalyticsLog.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { resolveGeo } from "../utils/geoLookup.js";
import ParentEnquiry from "../models/ParentEnquiry.js";
import ParentEnquiryDraft from "../models/ParentEnquiryDraft.js";

const router = express.Router();

/**
 * POST /api/analytics/log
 * Public endpoint to submit or update visitor log events
 */
router.post("/log", async (req, res) => {
  try {
    const {
      visitor_id,
      session_id,
      city,
      country,
      region,
      source,
      page_visited,
      plan_clicked,
      enquiry_submitted,
      device,
      browser,
      os,
      action,
      time_spent,
      scroll_depth
    } = req.body;

    if (!visitor_id || !session_id || !page_visited) {
      return res.status(400).json({ message: "visitor_id, session_id, and page_visited are required" });
    }

    // Resolve client IP
    let clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    if (clientIp) {
      if (clientIp.includes(",")) {
        clientIp = clientIp.split(",")[0].trim();
      }
      if (clientIp.startsWith("::ffff:")) {
        clientIp = clientIp.substring(7);
      }
    }

    // Fallback geolocation lookup on backend if frontend lookup was blocked/failed
    let finalCity = city || "Unknown City";
    let finalRegion = region || "Unknown State";
    let finalCountry = country || "Unknown Country";

    if (!city || city === "Unknown City" || !region || region === "Unknown State") {
      const resolved = await resolveGeo(clientIp);
      if (resolved.city !== "Unknown City") {
        finalCity = resolved.city;
        finalRegion = resolved.region;
        finalCountry = resolved.country;
      }
    }

    // If update_page_view, find the latest page_view log for this session and page, and update it
    if (action === "update_page_view") {
      const latestView = await AnalyticsLog.findOne({
        session_id,
        page_visited,
        action: "page_view"
      }).sort({ createdAt: -1 });

      if (latestView) {
        if (time_spent !== undefined) latestView.time_spent = time_spent;
        if (scroll_depth !== undefined) latestView.scroll_depth = Math.max(latestView.scroll_depth, scroll_depth);
        if (enquiry_submitted !== undefined) latestView.enquiry_submitted = enquiry_submitted;
        if (plan_clicked) latestView.plan_clicked = plan_clicked;
        
        const updated = await latestView.save();
        return res.status(200).json(updated);
      } else {
        // Fallback: if not found, create a new one
        const fallbackLog = new AnalyticsLog({
          visitor_id,
          session_id,
          city: finalCity,
          country: finalCountry,
          region: finalRegion,
          source,
          page_visited,
          plan_clicked,
          enquiry_submitted,
          device,
          browser,
          os,
          action: "page_view",
          time_spent: time_spent || 0,
          scroll_depth: scroll_depth || 0,
          ipAddress: clientIp
        });
        const saved = await fallbackLog.save();
        return res.status(201).json(saved);
      }
    }

    // Otherwise, create a new event log
    const newLog = new AnalyticsLog({
      visitor_id,
      session_id,
      city: finalCity,
      country: finalCountry,
      region: finalRegion,
      source: source || "Direct Visit",
      page_visited,
      plan_clicked: plan_clicked || "",
      enquiry_submitted: !!enquiry_submitted,
      device: device || "Desktop",
      browser: browser || "Unknown Browser",
      os: os || "Unknown OS",
      action: action || "page_view",
      time_spent: time_spent || 0,
      scroll_depth: scroll_depth || 0,
      ipAddress: clientIp
    });

    const saved = await newLog.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error("Error logging analytics:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

/**
 * GET /api/analytics/stats
 * Protected admin endpoint to fetch compiled stats for the dashboard
 */
router.get("/stats", verifyToken(["admin"]), async (req, res) => {
  try {
    const { period } = req.query; // '24h', '7d', '30d'
    let startDate = new Date();

    if (period === "24h") {
      startDate.setDate(startDate.getDate() - 1);
    } else if (period === "30d") {
      startDate.setDate(startDate.getDate() - 30);
    } else {
      // Default to 7 days
      startDate.setDate(startDate.getDate() - 7);
    }

    // 1. Total Unique Visitors (distinct visitor_ids in period)
    const totalUniqueVisitors = await AnalyticsLog.distinct("visitor_id", {
      createdAt: { $gte: startDate }
    });
    const totalUniqueCount = totalUniqueVisitors.length;

    // 2. Active Users (distinct visitor_ids in last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const activeVisitors = await AnalyticsLog.distinct("visitor_id", {
      createdAt: { $gte: fiveMinutesAgo }
    });
    const activeUsersCount = activeVisitors.length;

    // 3. New vs Returning Visitors
    // New: First event is within period. Returning: First event is before period.
    const newVsReturning = await AnalyticsLog.aggregate([
      { $group: { _id: "$visitor_id", firstEvent: { $min: "$createdAt" } } },
      {
        $project: {
          isNew: { $cond: [{ $gte: ["$firstEvent", startDate] }, 1, 0] }
        }
      },
      {
        $group: {
          _id: null,
          newCount: { $sum: "$isNew" },
          total: { $sum: 1 }
        }
      }
    ]);

    const newCount = newVsReturning[0]?.newCount || 0;
    const totalCount = newVsReturning[0]?.total || 0;
    const returningCount = totalCount - newCount;

    // 4. Daily Visitors Graph
    const dailyVisitors = await AnalyticsLog.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          visitors: { $addToSet: "$visitor_id" }
        }
      },
      {
        $project: {
          date: "$_id",
          count: { $size: "$visitors" }
        }
      },
      { $sort: { date: 1 } }
    ]);

    // 5. Traffic Sources (Group by visitor, then count by source)
    const trafficSources = await AnalyticsLog.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: "$visitor_id", source: { $first: "$source" } } },
      { $group: { _id: "$source", count: { $sum: 1 } } }
    ]);

    // 6. User Location
    const locationStats = await AnalyticsLog.aggregate([
      { 
        $match: { 
          createdAt: { $gte: startDate },
          city: { $ne: "Unknown City" }
        } 
      },
      {
        $group: {
          _id: { country: "$country", region: "$region", city: "$city" },
          visitors: { $addToSet: "$visitor_id" }
        }
      },
      {
        $project: {
          country: "$_id.country",
          region: "$_id.region",
          city: "$_id.city",
          count: { $size: "$visitors" }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);

    // 7. Devices, Browsers & OS
    const deviceStats = await AnalyticsLog.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: "$visitor_id", device: { $first: "$device" } } },
      { $group: { _id: "$device", count: { $sum: 1 } } }
    ]);

    const browserStats = await AnalyticsLog.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: "$visitor_id", browser: { $first: "$browser" } } },
      { $group: { _id: "$browser", count: { $sum: 1 } } }
    ]);

    const osStats = await AnalyticsLog.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: "$visitor_id", os: { $first: "$os" } } },
      { $group: { _id: "$os", count: { $sum: 1 } } }
    ]);

    // 8. Page Analytics
    const pageStats = await AnalyticsLog.aggregate([
      { $match: { createdAt: { $gte: startDate }, action: "page_view" } },
      {
        $group: {
          _id: "$page_visited",
          views: { $sum: 1 },
          avgTimeSpent: { $avg: "$time_spent" },
          avgScrollDepth: { $avg: "$scroll_depth" }
        }
      },
      { $sort: { views: -1 } }
    ]);

    // Bounce Rate per landing page (session views <= 1)
    const sessionPageCounts = await AnalyticsLog.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: "$session_id",
          pageViews: { $sum: { $cond: [{ $eq: ["$action", "page_view"] }, 1, 0] } },
          landingPage: { $first: "$page_visited" }
        }
      }
    ]);

    const bounceData = {};
    sessionPageCounts.forEach(s => {
      const page = s.landingPage;
      if (!page) return;
      if (!bounceData[page]) {
        bounceData[page] = { entries: 0, bounces: 0 };
      }
      bounceData[page].entries++;
      if (s.pageViews <= 1) {
        bounceData[page].bounces++;
      }
    });

    const enrichedPageStats = pageStats.map(p => {
      const b = bounceData[p._id] || { entries: 0, bounces: 0 };
      const bounceRate = b.entries > 0 ? Math.round((b.bounces / b.entries) * 100) : 0;
      return {
        page: p._id,
        views: p.views,
        avgTimeSpent: Math.round(p.avgTimeSpent || 0),
        avgScrollDepth: Math.round(p.avgScrollDepth || 0),
        bounceRate
      };
    });

    // 9. Plan Analytics
    const planStatsRaw = await AnalyticsLog.aggregate([
      { $match: { createdAt: { $gte: startDate }, action: { $in: ["explore_plan", "click_plan", "choose_plan", "book_demo"] } } },
      {
        $group: {
          _id: { plan: "$plan_clicked", action: "$action" },
          count: { $sum: 1 }
        }
      }
    ]);

    // Count ParentEnquiry submissions by plan type
    const enquiriesByPlanAgg = await ParentEnquiry.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: { $toLower: "$planType" }, count: { $sum: 1 } } }
    ]);

    const enquiriesPlanCount = { foundation: 0, advance: 0, elite: 0 };
    enquiriesByPlanAgg.forEach(item => {
      const plan = String(item._id || "").toLowerCase();
      if (plan.includes("foundation")) enquiriesPlanCount.foundation = item.count;
      else if (plan.includes("advance")) enquiriesPlanCount.advance = item.count;
      else if (plan.includes("elite")) enquiriesPlanCount.elite = item.count;
    });

    // Format Plan performance
    const plansMapping = {
      foundation: { name: "Foundation", views: 0, exploreClicks: 0, selections: 0, enquiries: 0, demos: 0 },
      advance: { name: "Advance Growth", views: 0, exploreClicks: 0, selections: 0, enquiries: 0, demos: 0 },
      elite: { name: "Elite Mentor", views: 0, exploreClicks: 0, selections: 0, enquiries: 0, demos: 0 }
    };

    planStatsRaw.forEach(p => {
      const planKey = String(p._id.plan || "").toLowerCase();
      const action = p._id.action;
      
      let matchedKey = null;
      if (planKey.includes("foundation")) matchedKey = "foundation";
      else if (planKey.includes("advance")) matchedKey = "advance";
      else if (planKey.includes("elite")) matchedKey = "elite";

      if (matchedKey) {
        if (action === "explore_plan") {
          plansMapping[matchedKey].views += p.count;
          plansMapping[matchedKey].exploreClicks += p.count;
        }
        if (action === "click_plan") {
          plansMapping[matchedKey].exploreClicks += p.count;
        }
        if (action === "choose_plan") {
          plansMapping[matchedKey].selections += p.count;
        }
        if (action === "book_demo") {
          plansMapping[matchedKey].demos += p.count;
        }
      }
    });

    Object.keys(plansMapping).forEach(key => {
      plansMapping[key].enquiries = enquiriesPlanCount[key] || 0;
      plansMapping[key].demos = Math.max(plansMapping[key].demos, plansMapping[key].enquiries);
    });

    const formattedPlanStats = Object.values(plansMapping).map(p => {
      // Conversion Rate: Selections / Views
      const conversionRate = p.views > 0 ? Math.round((p.selections / p.views) * 100) : 0;
      return {
        ...p,
        conversionRate
      };
    });

    // UTM Leads breakdown from ParentEnquiry
    const leadSourcesAgg = await ParentEnquiry.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $ifNull: ["$utm_source", ""] },
          count: { $sum: 1 }
        }
      }
    ]);

    const leadSourcesMap = {
      Google: 0,
      WhatsApp: 0,
      Instagram: 0,
      Facebook: 0,
      Direct: 0,
      YouTube: 0,
      Referral: 0
    };

    leadSourcesAgg.forEach(item => {
      let src = String(item._id || "").trim();
      if (!src) {
        leadSourcesMap.Direct += item.count;
        return;
      }
      
      const lowerSrc = src.toLowerCase();
      if (lowerSrc.includes("google")) leadSourcesMap.Google += item.count;
      else if (lowerSrc.includes("whatsapp") || lowerSrc === "wa") leadSourcesMap.WhatsApp += item.count;
      else if (lowerSrc.includes("instagram") || lowerSrc === "ig") leadSourcesMap.Instagram += item.count;
      else if (lowerSrc.includes("facebook") || lowerSrc === "fb") leadSourcesMap.Facebook += item.count;
      else if (lowerSrc.includes("youtube") || lowerSrc === "yt") leadSourcesMap.YouTube += item.count;
      else if (lowerSrc.includes("direct")) leadSourcesMap.Direct += item.count;
      else if (lowerSrc.includes("referral")) leadSourcesMap.Referral += item.count;
      else {
        leadSourcesMap.Referral += item.count;
      }
    });

    const leadSources = Object.keys(leadSourcesMap).map(name => ({
      name,
      count: leadSourcesMap[name]
    }));

    // 10. User Actions
    const actionStatsRaw = await AnalyticsLog.aggregate([
      { $match: { createdAt: { $gte: startDate }, action: { $ne: "page_view" } } },
      { $group: { _id: "$action", count: { $sum: 1 } } }
    ]);

    // 11. Recent Activity (last 50 events)
    const recentActivity = await AnalyticsLog.find({
      action: { $nin: ["update_page_view"] }
    })
      .sort({ createdAt: -1 })
      .limit(50);

    const visitorIds = recentActivity.map(act => act.visitor_id).filter(Boolean);
    
    // Find matching parent enquiries and drafts
    const [enquiries, drafts] = await Promise.all([
      ParentEnquiry.find({ visitor_id: { $in: visitorIds } }, { parentName: 1, phone: 1, email: 1, visitor_id: 1 }),
      ParentEnquiryDraft.find({ visitor_id: { $in: visitorIds } }, { emailOrPhone: 1, formData: 1, visitor_id: 1 })
    ]);

    // Create a map of visitor_id -> { name, phone, email, isDraft }
    const visitorIdentityMap = {};
    
    drafts.forEach(d => {
      if (d.visitor_id) {
        const name = d.formData?.parentName || d.formData?.name || "";
        const contact = d.formData?.phone || d.formData?.email || d.emailOrPhone || "";
        visitorIdentityMap[d.visitor_id] = {
          name,
          phone: contact.includes("@") ? "" : contact,
          email: contact.includes("@") ? contact : "",
          isDraft: true
        };
      }
    });

    enquiries.forEach(e => {
      if (e.visitor_id) {
        visitorIdentityMap[e.visitor_id] = {
          name: e.parentName || "",
          phone: e.phone || "",
          email: e.email || "",
          isDraft: false
        };
      }
    });

    // Merge identity into recentActivity items
    const enrichedActivity = recentActivity.map(act => {
      const actObj = act.toObject();
      if (visitorIdentityMap[act.visitor_id]) {
        actObj.identity = visitorIdentityMap[act.visitor_id];
      }
      return actObj;
    });

    // Compute average bounce rate and scroll depth for overall overview
    const totalViews = enrichedPageStats.reduce((sum, p) => sum + p.views, 0);
    const avgBounceRate = totalViews > 0 
      ? Math.round(enrichedPageStats.reduce((sum, p) => sum + (p.bounceRate * p.views), 0) / totalViews)
      : 0;
    const avgScrollDepth = totalViews > 0 
      ? Math.round(enrichedPageStats.reduce((sum, p) => sum + (p.avgScrollDepth * p.views), 0) / totalViews)
      : 0;

    // Calculate average session duration
    const sessionDurationAgg = await AnalyticsLog.aggregate([
      { $match: { createdAt: { $gte: startDate }, action: "page_view" } },
      { $group: { _id: "$session_id", duration: { $sum: "$time_spent" } } },
      { $group: { _id: null, avgDuration: { $avg: "$duration" } } }
    ]);
    const avgSessionDuration = Math.round(sessionDurationAgg[0]?.avgDuration || 0);

    res.json({
      summary: {
        totalVisitors: totalUniqueCount,
        activeUsers: activeUsersCount,
        newVisitors: newCount,
        returningVisitors: returningCount,
        avgBounceRate,
        avgScrollDepth,
        avgSessionDuration
      },
      leadSources,
      dailyVisitors,
      trafficSources,
      locationStats,
      devices: deviceStats,
      browsers: browserStats,
      operatingSystems: osStats,
      pages: enrichedPageStats,
      plans: formattedPlanStats,
      actions: actionStatsRaw,
      recentActivity: enrichedActivity
    });
  } catch (error) {
    console.error("Error generating stats:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

/**
 * GET /api/analytics/session/:session_id
 * Protected admin endpoint to fetch chronological events of a single session
 */
router.get("/session/:session_id", verifyToken(["admin"]), async (req, res) => {
  try {
    const logs = await AnalyticsLog.find({ session_id: req.params.session_id })
      .sort({ createdAt: 1 });
      
    let identity = null;
    if (logs.length > 0) {
      const visitorId = logs[0].visitor_id;
      const [enquiry, draft] = await Promise.all([
        ParentEnquiry.findOne({ visitor_id: visitorId }),
        ParentEnquiryDraft.findOne({ visitor_id: visitorId })
      ]);
      
      if (enquiry) {
        identity = {
          name: enquiry.parentName,
          phone: enquiry.phone,
          email: enquiry.email,
          isDraft: false
        };
      } else if (draft) {
        identity = {
          name: draft.formData?.parentName || draft.formData?.name || "",
          phone: draft.formData?.phone || draft.emailOrPhone || "",
          email: draft.formData?.email || "",
          isDraft: true
        };
      }
    }

    res.json({ logs, identity });
  } catch (error) {
    console.error("Error fetching session logs:", error);
    res.status(500).json({ message: "Error fetching session logs", error: error.message });
  }
});

export default router;
