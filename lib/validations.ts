import { z } from "zod";
import { isReservedSlug } from "./blocklist";

export const SLUG_REGEX = /^[a-z0-9][a-z0-9-]{1,38}[a-z0-9]$/;

export const slugSchema = z
  .string()
  .min(3, "Slug must be at least 3 characters")
  .max(40, "Slug must be at most 40 characters")
  .regex(SLUG_REGEX, "Slug must be lowercase alphanumeric with hyphens, no leading/trailing hyphens")
  .refine((s) => !isReservedSlug(s), "This slug is reserved");

export const teamNameSchema = z
  .string()
  .min(1, "Team name is required")
  .max(80, "Team name must be at most 80 characters");

export const memberNameSchema = z
  .string()
  .min(1, "Member name is required")
  .max(50, "Member name must be at most 50 characters");

export const taglineSchema = z
  .string()
  .max(60, "Tagline must be at most 60 characters")
  .optional()
  .or(z.literal(""));

export const createTeamSchema = z.object({
  name: teamNameSchema,
  slug: slugSchema,
});

export const addMemberSchema = z.object({
  name: memberNameSchema,
  tagline: taglineSchema,
  team_id: z.string().uuid(),
});

export const updateMemberSchema = z.object({
  name: memberNameSchema.optional(),
  tagline: taglineSchema,
  is_active: z.boolean().optional(),
  ooo_date: z.string().nullable().optional(),
});

export const spinSchema = z.object({
  team_id: z.string().uuid(),
  winner_id: z.string().uuid(),
});
