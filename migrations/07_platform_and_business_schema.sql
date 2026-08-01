-- Migration 07: Platform & Business Domain Schema
-- Tables: notifications, api_usage_logs, security_audit_logs, subscription_plans, user_subscriptions, payments

-- 1. Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'system',
  is_read BOOLEAN DEFAULT false,
  action_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. API Usage Logs
CREATE TABLE IF NOT EXISTS public.api_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  endpoint VARCHAR(255) NOT NULL,
  method VARCHAR(10) NOT NULL,
  status_code INT NOT NULL,
  response_time_ms INT,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. Security Audit Logs
CREATE TABLE IF NOT EXISTS public.security_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  ip_address VARCHAR(45),
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. Subscription Plans Registry
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  price_cents INT NOT NULL DEFAULT 0,
  currency VARCHAR(10) DEFAULT 'USD',
  interval_type VARCHAR(20) DEFAULT 'monthly',
  features JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Seed Subscription Plans
INSERT INTO public.subscription_plans (code, name, price_cents, currency, interval_type, features)
VALUES
  ('free', 'Free Tier', 0, 'USD', 'monthly', '["3 Documents per month", "Basic AI Chat", "Standard Flashcards"]'::jsonb),
  ('pro_monthly', 'Pro Monthly', 999, 'USD', 'monthly', '["Unlimited Documents", "Vector RAG AI Chat", "SM-2 Spaced Repetition", "Smart Exam Predictor"]'::jsonb),
  ('pro_annual', 'Pro Annual', 8999, 'USD', 'annual', '["Unlimited Documents", "Vector RAG AI Chat", "SM-2 Spaced Repetition", "Smart Exam Predictor", "Priority AI Server Queue"]'::jsonb)
ON CONFLICT (code) DO NOTHING;

-- 5. User Subscriptions
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.subscription_plans(id) ON DELETE RESTRICT,
  status VARCHAR(20) DEFAULT 'active',
  current_period_start TIMESTAMPTZ DEFAULT NOW(),
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  payment_provider VARCHAR(50),
  provider_subscription_id VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 6. Payments Audit Trail
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.user_subscriptions(id) ON DELETE SET NULL,
  amount_cents INT NOT NULL,
  currency VARCHAR(10) DEFAULT 'USD',
  status VARCHAR(20) DEFAULT 'succeeded',
  payment_provider VARCHAR(50),
  provider_transaction_id VARCHAR(255),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
