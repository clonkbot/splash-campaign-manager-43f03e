import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,
  splashEvents: defineTable({
    // Basic Information
    name: v.string(),
    description: v.optional(v.string()),
    feature: v.string(),

    // Status
    status: v.union(
      v.literal("active"),
      v.literal("scheduled"),
      v.literal("draft"),
      v.literal("expired"),
      v.literal("paused")
    ),

    // Content
    imageUrl: v.optional(v.string()),
    headline: v.optional(v.string()),
    subtext: v.optional(v.string()),

    // CTA
    primaryCtaLabel: v.optional(v.string()),
    primaryCtaAction: v.optional(v.string()),
    primaryCtaLink: v.optional(v.string()),
    secondaryCtaEnabled: v.boolean(),
    secondaryCtaLabel: v.optional(v.string()),
    secondaryCtaAction: v.optional(v.string()),
    secondaryCtaLink: v.optional(v.string()),
    remindMeLater: v.boolean(),
    noThanks: v.boolean(),

    // Audience
    includeAudience: v.array(v.string()),
    excludeAudience: v.array(v.string()),
    includePidSso: v.boolean(),
    estimatedAudience: v.number(),

    // Scheduling
    startDate: v.string(),
    endDate: v.string(),
    timezone: v.string(),

    // Display Rules
    frequency: v.string(),
    dismissDays: v.number(),

    // Priority
    priority: v.number(),

    // Metadata
    userId: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"])
    .index("by_user_and_status", ["userId", "status"]),
});
