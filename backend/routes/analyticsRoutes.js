import express from "express";
import AnalyticsLog from "../models/AnalyticsLog.js";
import { verifyToken } from "../middleware/authMiddleware.js";

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
          action: "page_view",
          time_spent: time_spent || 0,
          scroll_depth: scroll_depth || 0
        });
        const saved = await fallbackLog.save();
        return res.status(201).json(saved);
      }
    }

    // Otherwise, create a new event log
    const newLog = new AnalyticsLog({
      visitor_id,
      session_id,
      city: city || "Unknown City",
      country: country || "Unknown Country",
      region: region || "Unknown State",
      source: source || "Direct Visit",
      page_visited,
      plan_clicked: plan_clicked || "",
      enquiry_submitted: !!enquiry_submitted,
      device: device || "Desktop",
      browser: browser || "Unknown Browser",
      os: os || "Unknown OS",
      action: action || "page_view",
      time_spent: time_spent || 0,
      scroll_depth: scroll_depth || 0
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
      { $match: { createdAt: { $gte: startDate } } },
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
      { $match: { createdAt: { $gte: startDate }, action: { $in: ["explore_plan", "click_plan", "choose_plan"] } } },
      {
        $group: {
          _id: { plan: "$plan_clicked", action: "$action" },
          count: { $sum: 1 }
        }
      }
    ]);

    // Format Plan performance
    const plansMapping = {
      foundation: { name: "Foundation", views: 0, clicks: 0, selections: 0 },
      advance: { name: "Advance Growth", views: 0, clicks: 0, selections: 0 },
      elite: { name: "Elite Mentor", views: 0, clicks: 0, selections: 0 }
    };

    planStatsRaw.forEach(p => {
      const planKey = String(p._id.plan || "").toLowerCase();
      const action = p._id.action;
      
      let matchedKey = null;
      if (planKey.includes("foundation")) matchedKey = "foundation";
      else if (planKey.includes("advance")) matchedKey = "advance";
      else if (planKey.includes("elite")) matchedKey = "elite";

      if (matchedKey) {
        if (action === "explore_plan") plansMapping[matchedKey].views += p.count;
        if (action === "click_plan") plansMapping[matchedKey].clicks += p.count;
        if (action === "choose_plan") plansMapping[matchedKey].selections += p.count;
      }
    });

    const formattedPlanStats = Object.values(plansMapping).map(p => {
      // Conversion Rate: Selections / Views
      const conversionRate = p.views > 0 ? Math.round((p.selections / p.views) * 100) : 0;
      return {
        ...p,
        conversionRate
      };
    });

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

    // Compute average bounce rate and scroll depth for overall overview
    const totalViews = enrichedPageStats.reduce((sum, p) => sum + p.views, 0);
    const avgBounceRate = totalViews > 0 
      ? Math.round(enrichedPageStats.reduce((sum, p) => sum + (p.bounceRate * p.views), 0) / totalViews)
      : 0;
    const avgScrollDepth = totalViews > 0 
      ? Math.round(enrichedPageStats.reduce((sum, p) => sum + (p.avgScrollDepth * p.views), 0) / totalViews)
      : 0;

    res.json({
      summary: {
        totalVisitors: totalUniqueCount,
        activeUsers: activeUsersCount,
        newVisitors: newCount,
        returningVisitors: returningCount,
        avgBounceRate,
        avgScrollDepth
      },
      dailyVisitors,
      trafficSources,
      locationStats,
      devices: deviceStats,
      browsers: browserStats,
      operatingSystems: osStats,
      pages: enrichedPageStats,
      plans: formattedPlanStats,
      actions: actionStatsRaw,
      recentActivity
    });
  } catch (error) {
    console.error("Error generating stats:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

export default router;
