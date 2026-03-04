variable "vercel_api_token" {
  description = "Vercel API token for deploying the project"
  type        = string
  sensitive   = true
}

variable "vercel_team_id" {
  description = "Vercel team ID (optional; leave empty for personal accounts)"
  type        = string
  default     = ""
}

variable "supabase_url" {
  description = "Supabase project URL (NEXT_PUBLIC_SUPABASE_URL)"
  type        = string
}

variable "supabase_anon_key" {
  description = "Supabase anonymous/public key (NEXT_PUBLIC_SUPABASE_ANON_KEY)"
  type        = string
  sensitive   = true
}

variable "supabase_service_role_key" {
  description = "Supabase service-role key for server-side operations"
  type        = string
  sensitive   = true
}

variable "resend_api_key" {
  description = "Resend API key for transactional email"
  type        = string
  sensitive   = true
}
