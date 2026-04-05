import { z } from 'zod';

// ── Shared helpers ────────────────────────────────────────────────────────────

const urlList = z
  .array(z.string().url('Each source must be a valid URL'))
  .min(1, 'At least one source URL is required');

const optionalNotes = z.string().max(2000, 'Notes must be under 2,000 characters').optional();

// ── Per-type payload schemas ─────────────────────────────────────────────────

export const FigurePayloadSchema = z.object({
  name: z.string().min(2, 'Name is required').max(120),
  roles: z
    .array(z.string().min(1).max(200))
    .min(1, 'At least one role is required')
    .max(6, 'Maximum 6 roles'),
  summary: z.string().min(50, 'Summary must be at least 50 characters').max(1000),
  organizations: z.array(z.string().max(100)).max(10).optional(),
  source_urls: urlList,
  submitter_note: optionalNotes,
});

export const CasePayloadSchema = z.object({
  title: z.string().min(5, 'Title is required').max(200),
  date: z.string().min(4, 'Date is required').max(30),
  location: z.string().min(2, 'Location is required').max(200),
  summary: z.string().min(50, 'Summary must be at least 50 characters').max(1500),
  witnesses: z.array(z.string().max(100)).max(20).optional(),
  source_urls: urlList,
  submitter_note: optionalNotes,
});

export const TimelineEventPayloadSchema = z.object({
  year: z.string().regex(/^\d{4}([-/ ]\w+)?$/, 'Year must be in format YYYY or "Mon YYYY"'),
  event: z.string().min(10, 'Event description is required').max(1000),
  category: z.enum([
    'government', 'military', 'civilian', 'scientific',
    'legislative', 'media', 'ufo', 'nhi', 'other',
  ], { error: 'Select a category' }),
  source_urls: urlList,
  submitter_note: optionalNotes,
});

export const CorrectionPayloadSchema = z.object({
  target_type: z.enum(['figure', 'case', 'document', 'program', 'timeline']),
  target_id: z.string().min(1, 'Target content ID is required').max(100),
  target_name: z.string().min(1, 'Target content name is required').max(200),
  field_description: z.string().min(5, 'Describe which field needs correction').max(300),
  current_value: z.string().max(1000).optional(),
  suggested_value: z.string().min(1, 'Suggested correction is required').max(1000),
  source_urls: urlList,
  submitter_note: optionalNotes,
});

// ── Top-level submission schema (discriminated union) ─────────────────────────

export const ContributionSubmitSchema = z.discriminatedUnion('content_type', [
  z.object({
    content_type: z.literal('figure'),
    title: z.string().min(2).max(200),
    payload: FigurePayloadSchema,
  }),
  z.object({
    content_type: z.literal('case'),
    title: z.string().min(2).max(200),
    payload: CasePayloadSchema,
  }),
  z.object({
    content_type: z.literal('timeline_event'),
    title: z.string().min(2).max(200),
    payload: TimelineEventPayloadSchema,
  }),
  z.object({
    content_type: z.literal('correction'),
    title: z.string().min(2).max(200),
    payload: CorrectionPayloadSchema,
  }),
]);

export type ContributionSubmit = z.infer<typeof ContributionSubmitSchema>;
export type FigurePayload = z.infer<typeof FigurePayloadSchema>;
export type CasePayload = z.infer<typeof CasePayloadSchema>;
export type TimelineEventPayload = z.infer<typeof TimelineEventPayloadSchema>;
export type CorrectionPayload = z.infer<typeof CorrectionPayloadSchema>;

export type ContributionContentType = 'figure' | 'case' | 'timeline_event' | 'correction';
