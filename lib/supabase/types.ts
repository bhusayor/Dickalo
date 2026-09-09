/**
 * Database types.
 *
 * Every row shape is a `type`, never an `interface`. supabase-js constrains
 * tables to `Record<string, unknown>`, and an interface has no implicit index
 * signature — using one silently degrades every query result to `never`.
 *
 * Hand-written to match `schema.sql`. Regenerate with:
 *   npx supabase gen types typescript --project-id <id> > lib/supabase/types.ts
 * once the schema stops moving.
 */

export type EnquiryStatus = 'new' | 'contacted' | 'qualified' | 'won' | 'lost' | 'spam';
export type ProjectTypeEnum =
  | 'residential'
  | 'commercial'
  | 'interior'
  | 'renovation'
  | 'consultancy'
  | 'other';
export type BudgetBandEnum = 'under-25m' | '25m-100m' | '100m-500m' | 'over-500m' | 'not-sure';
export type SubscriberStatus = 'active' | 'unsubscribed' | 'bounced';

export type ContactSubmissionRow = {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  project_type: ProjectTypeEnum;
  budget: BudgetBandEnum | null;
  location: string | null;
  message: string;
  status: EnquiryStatus;
  notes: string | null;
  source: string | null;
  referrer: string | null;
  user_agent: string | null;
  ip_hash: string | null;
  consent: boolean;
  email_sent: boolean;
}

export type ContactSubmissionInsert = Omit<
  ContactSubmissionRow,
  'id' | 'created_at' | 'updated_at' | 'status' | 'notes' | 'email_sent'
> &
  Partial<Pick<ContactSubmissionRow, 'status' | 'notes' | 'email_sent'>>;

export type ProjectInquiryRow = {
  id: string;
  created_at: string;
  project_slug: string;
  project_title: string | null;
  submission_id: string | null;
  name: string;
  email: string;
  message: string;
  status: EnquiryStatus;
}

export type ProjectInquiryInsert = Omit<ProjectInquiryRow, 'id' | 'created_at' | 'status'> &
  Partial<Pick<ProjectInquiryRow, 'status'>>;

export type NewsletterSubscriberRow = {
  id: string;
  created_at: string;
  updated_at: string;
  email: string;
  name: string | null;
  status: SubscriberStatus;
  source: string | null;
  unsubscribe_token: string;
  confirmed_at: string | null;
  unsubscribed_at: string | null;
}

export type NewsletterSubscriberInsert = Pick<NewsletterSubscriberRow, 'email'> &
  Partial<Pick<NewsletterSubscriberRow, 'name' | 'source' | 'status'>>;

/**
 * The shape supabase-js expects. Every key below is required by its generated
 * type contract — omitting `Relationships` or `CompositeTypes` makes the client
 * fall back to `never` for every table, and every insert becomes a type error.
 */
export type Database = {
  public: {
    Tables: {
      contact_submissions: {
        Row: ContactSubmissionRow;
        Insert: ContactSubmissionInsert;
        Update: Partial<ContactSubmissionRow>;
        Relationships: [];
      };
      project_inquiries: {
        Row: ProjectInquiryRow;
        Insert: ProjectInquiryInsert;
        Update: Partial<ProjectInquiryRow>;
        Relationships: [
          {
            foreignKeyName: 'project_inquiries_submission_id_fkey';
            columns: ['submission_id'];
            isOneToOne: false;
            referencedRelation: 'contact_submissions';
            referencedColumns: ['id'];
          },
        ];
      };
      newsletter_subscribers: {
        Row: NewsletterSubscriberRow;
        Insert: NewsletterSubscriberInsert;
        Update: Partial<NewsletterSubscriberRow>;
        Relationships: [];
      };
    };
    Views: {
      enquiry_summary: {
        Row: {
          month: string;
          project_type: ProjectTypeEnum;
          status: EnquiryStatus;
          total: number;
        };
        Relationships: [];
      };
    };
    Functions: Record<string, never>;
    Enums: {
      enquiry_status: EnquiryStatus;
      project_type: ProjectTypeEnum;
      budget_band: BudgetBandEnum;
      subscriber_status: SubscriberStatus;
    };
    CompositeTypes: Record<string, never>;
  };
}
