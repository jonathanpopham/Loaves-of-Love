# Terraform — Loaves of Love Infrastructure

## Prerequisites

- [Terraform](https://developer.hashicorp.com/terraform/install) ≥ 1.6
- A Vercel account and API token
- A Supabase project (create manually at supabase.com — the free-tier Supabase Terraform provider has limited support; project creation is typically done via the dashboard)

## Quick Start

```bash
cd terraform

# Copy example vars and fill in real values
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your actual credentials

terraform init
terraform plan
terraform apply
```

## Remote State

The backend block in `main.tf` is commented out by default so `terraform plan`
works with no additional setup. To enable Terraform Cloud remote state:

1. Create a free account at https://app.terraform.io
2. Create an organization and a workspace named `loaves-of-love`
3. Uncomment the `backend "remote"` block in `main.tf`
4. Run `terraform login` then `terraform init`

Alternatively, configure an S3 backend by adding:

```hcl
backend "s3" {
  bucket = "your-state-bucket"
  key    = "loaves-of-love/terraform.tfstate"
  region = "us-east-1"
}
```

## Supabase Setup

The Supabase Terraform provider (`supabase/supabase`) requires a paid plan for
project creation. For the initial setup, create the Supabase project manually:

1. Go to https://supabase.com/dashboard and create a new project
2. Copy the project URL and API keys into `terraform.tfvars`
3. Run migrations from `supabase/migrations/` using the Supabase CLI:
   ```bash
   supabase db push
   ```

## Variables

| Variable                    | Description                             |
| --------------------------- | --------------------------------------- |
| `vercel_api_token`          | Vercel API token (Settings → Tokens)    |
| `vercel_team_id`            | Team ID; empty for personal accounts    |
| `supabase_url`              | `https://<ref>.supabase.co`             |
| `supabase_anon_key`         | Public anon key from Supabase dashboard |
| `supabase_service_role_key` | Service-role key (keep secret!)         |
| `resend_api_key`            | Resend API key for transactional email  |
