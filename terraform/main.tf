terraform {
  required_version = ">= 1.6"

  required_providers {
    vercel = {
      source  = "vercel/vercel"
      version = "~> 2.0"
    }
  }

  # Terraform Cloud free tier for remote state.
  # To use: set TF_CLOUD_ORGANIZATION and create a workspace named "loaves-of-love".
  # Alternatively, swap for an S3 backend (see backend-s3.tf.example).
  # backend "remote" {
  #   organization = "your-org"
  #   workspaces {
  #     name = "loaves-of-love"
  #   }
  # }
}

provider "vercel" {
  api_token = var.vercel_api_token
  team      = var.vercel_team_id
}

# ---------------------------------------------------------------------------
# Vercel project
# ---------------------------------------------------------------------------
resource "vercel_project" "loaves_of_love" {
  name      = "loaves-of-love"
  framework = "nextjs"

  git_repository = {
    type              = "github"
    repo              = "jonathanpopham/Loaves-of-Love"
    production_branch = "main"
  }
}

# ---------------------------------------------------------------------------
# Environment variables (non-secret values only; secrets via Vercel dashboard
# or OIDC-based CI)
# ---------------------------------------------------------------------------
resource "vercel_project_environment_variable" "next_public_supabase_url" {
  project_id = vercel_project.loaves_of_love.id
  key        = "NEXT_PUBLIC_SUPABASE_URL"
  value      = var.supabase_url
  target     = ["production", "preview", "development"]
}

resource "vercel_project_environment_variable" "next_public_supabase_anon_key" {
  project_id = vercel_project.loaves_of_love.id
  key        = "NEXT_PUBLIC_SUPABASE_ANON_KEY"
  value      = var.supabase_anon_key
  target     = ["production", "preview", "development"]
}

resource "vercel_project_environment_variable" "supabase_service_role_key" {
  project_id = vercel_project.loaves_of_love.id
  key        = "SUPABASE_SERVICE_ROLE_KEY"
  value      = var.supabase_service_role_key
  target     = ["production"]
  sensitive  = true
}

resource "vercel_project_environment_variable" "resend_api_key" {
  project_id = vercel_project.loaves_of_love.id
  key        = "RESEND_API_KEY"
  value      = var.resend_api_key
  target     = ["production"]
  sensitive  = true
}
