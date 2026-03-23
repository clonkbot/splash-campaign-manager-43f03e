import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {
    status: v.optional(v.string()),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    let events = await ctx.db
      .query("splashEvents")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    if (args.status && args.status !== "all") {
      events = events.filter((e) => e.status === args.status);
    }

    if (args.search) {
      const searchLower = args.search.toLowerCase();
      events = events.filter((e) =>
        e.name.toLowerCase().includes(searchLower)
      );
    }

    return events;
  },
});

export const get = query({
  args: { id: v.id("splashEvents") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const event = await ctx.db.get(args.id);
    if (!event || event.userId !== userId) return null;

    return event;
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    feature: v.string(),
    status: v.union(
      v.literal("active"),
      v.literal("scheduled"),
      v.literal("draft"),
      v.literal("expired"),
      v.literal("paused")
    ),
    imageUrl: v.optional(v.string()),
    headline: v.optional(v.string()),
    subtext: v.optional(v.string()),
    primaryCtaLabel: v.optional(v.string()),
    primaryCtaAction: v.optional(v.string()),
    primaryCtaLink: v.optional(v.string()),
    secondaryCtaEnabled: v.boolean(),
    secondaryCtaLabel: v.optional(v.string()),
    secondaryCtaAction: v.optional(v.string()),
    secondaryCtaLink: v.optional(v.string()),
    remindMeLater: v.boolean(),
    noThanks: v.boolean(),
    includeAudience: v.array(v.string()),
    excludeAudience: v.array(v.string()),
    includePidSso: v.boolean(),
    estimatedAudience: v.number(),
    startDate: v.string(),
    endDate: v.string(),
    timezone: v.string(),
    frequency: v.string(),
    dismissDays: v.number(),
    priority: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const now = Date.now();
    return await ctx.db.insert("splashEvents", {
      ...args,
      userId,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("splashEvents"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    feature: v.optional(v.string()),
    status: v.optional(v.union(
      v.literal("active"),
      v.literal("scheduled"),
      v.literal("draft"),
      v.literal("expired"),
      v.literal("paused")
    )),
    imageUrl: v.optional(v.string()),
    headline: v.optional(v.string()),
    subtext: v.optional(v.string()),
    primaryCtaLabel: v.optional(v.string()),
    primaryCtaAction: v.optional(v.string()),
    primaryCtaLink: v.optional(v.string()),
    secondaryCtaEnabled: v.optional(v.boolean()),
    secondaryCtaLabel: v.optional(v.string()),
    secondaryCtaAction: v.optional(v.string()),
    secondaryCtaLink: v.optional(v.string()),
    remindMeLater: v.optional(v.boolean()),
    noThanks: v.optional(v.boolean()),
    includeAudience: v.optional(v.array(v.string())),
    excludeAudience: v.optional(v.array(v.string())),
    includePidSso: v.optional(v.boolean()),
    estimatedAudience: v.optional(v.number()),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    timezone: v.optional(v.string()),
    frequency: v.optional(v.string()),
    dismissDays: v.optional(v.number()),
    priority: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const { id, ...updates } = args;
    const event = await ctx.db.get(id);
    if (!event || event.userId !== userId) throw new Error("Not found");

    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );

    await ctx.db.patch(id, {
      ...filteredUpdates,
      updatedAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { id: v.id("splashEvents") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const event = await ctx.db.get(args.id);
    if (!event || event.userId !== userId) throw new Error("Not found");

    await ctx.db.delete(args.id);
  },
});

export const duplicate = mutation({
  args: { id: v.id("splashEvents") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const event = await ctx.db.get(args.id);
    if (!event || event.userId !== userId) throw new Error("Not found");

    const now = Date.now();
    const { _id, _creationTime, createdAt, updatedAt, ...eventData } = event;

    return await ctx.db.insert("splashEvents", {
      ...eventData,
      name: `${event.name} (Copy)`,
      status: "draft",
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const togglePause = mutation({
  args: { id: v.id("splashEvents") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const event = await ctx.db.get(args.id);
    if (!event || event.userId !== userId) throw new Error("Not found");

    const newStatus = event.status === "paused" ? "active" : "paused";
    await ctx.db.patch(args.id, {
      status: newStatus,
      updatedAt: Date.now(),
    });
  },
});

export const seedDemoData = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("splashEvents")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existing) return;

    const now = Date.now();
    const demoEvents = [
      {
        name: "Upgrade to Premium Analytics",
        description: "Promote our new analytics dashboard to existing users",
        feature: "Analytics Module",
        status: "active" as const,
        headline: "Unlock Premium Analytics",
        subtext: "Get deeper insights with our advanced analytics suite",
        primaryCtaLabel: "Upgrade Now",
        primaryCtaAction: "link",
        primaryCtaLink: "/upgrade",
        secondaryCtaEnabled: true,
        secondaryCtaLabel: "Learn More",
        secondaryCtaAction: "link",
        secondaryCtaLink: "/features/analytics",
        remindMeLater: true,
        noThanks: true,
        includeAudience: ["All PMS Groups", "Enterprise Clients"],
        excludeAudience: ["VIP Groups", "Trial Users"],
        includePidSso: true,
        estimatedAudience: 1240,
        startDate: "2026-03-20",
        endDate: "2026-04-10",
        timezone: "America/New_York",
        frequency: "once_per_day",
        dismissDays: 7,
        priority: 5,
      },
      {
        name: "New Feature: Document Scanning",
        description: "Announce the new document scanning feature",
        feature: "Document Management",
        status: "scheduled" as const,
        headline: "Introducing Document Scanning",
        subtext: "Scan and digitize documents directly in ClaimConnect",
        primaryCtaLabel: "Try It Now",
        primaryCtaAction: "link",
        primaryCtaLink: "/documents/scan",
        secondaryCtaEnabled: false,
        remindMeLater: true,
        noThanks: false,
        includeAudience: ["Clients with Feature", "Groups with PMS"],
        excludeAudience: [],
        includePidSso: false,
        estimatedAudience: 3500,
        startDate: "2026-04-01",
        endDate: "2026-04-30",
        timezone: "America/Chicago",
        frequency: "once",
        dismissDays: 14,
        priority: 4,
      },
      {
        name: "Q2 Training Webinar",
        description: "Invite users to our quarterly training session",
        feature: "Training",
        status: "draft" as const,
        headline: "Join Our Q2 Training Webinar",
        subtext: "Learn tips and tricks from our product experts",
        primaryCtaLabel: "Register Now",
        primaryCtaAction: "signup",
        secondaryCtaEnabled: true,
        secondaryCtaLabel: "View Agenda",
        secondaryCtaAction: "link",
        secondaryCtaLink: "/webinars/q2-agenda",
        remindMeLater: true,
        noThanks: true,
        includeAudience: ["All Users"],
        excludeAudience: ["Inactive Users"],
        includePidSso: true,
        estimatedAudience: 5200,
        startDate: "2026-04-15",
        endDate: "2026-04-20",
        timezone: "America/Los_Angeles",
        frequency: "every_login",
        dismissDays: 3,
        priority: 3,
      },
      {
        name: "Holiday Schedule Notice",
        description: "Inform users about holiday support hours",
        feature: "Support",
        status: "expired" as const,
        headline: "Holiday Support Hours",
        subtext: "Our support team will have limited availability",
        primaryCtaLabel: "View Schedule",
        primaryCtaAction: "link",
        primaryCtaLink: "/support/hours",
        secondaryCtaEnabled: false,
        remindMeLater: false,
        noThanks: true,
        includeAudience: ["All Users"],
        excludeAudience: [],
        includePidSso: true,
        estimatedAudience: 8500,
        startDate: "2025-12-20",
        endDate: "2026-01-02",
        timezone: "UTC",
        frequency: "once",
        dismissDays: 0,
        priority: 2,
      },
      {
        name: "Mobile App Launch",
        description: "Promote our new mobile application",
        feature: "Mobile",
        status: "active" as const,
        headline: "ClaimConnect Mobile is Here!",
        subtext: "Manage claims on the go with our new mobile app",
        primaryCtaLabel: "Download App",
        primaryCtaAction: "link",
        primaryCtaLink: "/mobile/download",
        secondaryCtaEnabled: true,
        secondaryCtaLabel: "Watch Demo",
        secondaryCtaAction: "link",
        secondaryCtaLink: "/mobile/demo",
        remindMeLater: true,
        noThanks: true,
        includeAudience: ["Power Users", "Managers"],
        excludeAudience: ["Desktop Only Users"],
        includePidSso: false,
        estimatedAudience: 2100,
        startDate: "2026-03-01",
        endDate: "2026-05-31",
        timezone: "America/New_York",
        frequency: "once_per_day",
        dismissDays: 7,
        priority: 5,
      },
      {
        name: "System Maintenance Notice",
        description: "Alert users about upcoming maintenance window",
        feature: "System",
        status: "scheduled" as const,
        headline: "Scheduled Maintenance",
        subtext: "ClaimConnect will be briefly unavailable on April 5th",
        primaryCtaLabel: "Learn More",
        primaryCtaAction: "link",
        primaryCtaLink: "/status/maintenance",
        secondaryCtaEnabled: false,
        remindMeLater: false,
        noThanks: false,
        includeAudience: ["All Users"],
        excludeAudience: [],
        includePidSso: true,
        estimatedAudience: 10000,
        startDate: "2026-04-03",
        endDate: "2026-04-05",
        timezone: "UTC",
        frequency: "every_login",
        dismissDays: 0,
        priority: 5,
      },
    ];

    for (const event of demoEvents) {
      await ctx.db.insert("splashEvents", {
        ...event,
        userId,
        createdAt: now - Math.random() * 7 * 24 * 60 * 60 * 1000,
        updatedAt: now - Math.random() * 2 * 24 * 60 * 60 * 1000,
      });
    }
  },
});
