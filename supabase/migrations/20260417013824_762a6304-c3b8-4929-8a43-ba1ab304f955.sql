
-- ============ ENUMS ============
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
CREATE TYPE public.dossier_type AS ENUM ('terrain', 'heritage', 'volonte', 'conflit', 'savoir');
CREATE TYPE public.dossier_status AS ENUM ('secure', 'incomplete', 'risk');
CREATE TYPE public.dossier_visibility AS ENUM ('private', 'family', 'public');
CREATE TYPE public.proof_type AS ENUM ('image', 'document', 'video', 'audio');
CREATE TYPE public.participant_role AS ENUM ('owner', 'heir', 'witness', 'expert', 'viewer');
CREATE TYPE public.alert_type AS ENUM ('urgent', 'info', 'suggestion');
CREATE TYPE public.alert_severity AS ENUM ('low', 'medium', 'high');

-- ============ updated_at function ============
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- ============ TABLES (created first, no FK function refs) ============
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  language TEXT NOT NULL DEFAULT 'fr',
  theme TEXT NOT NULL DEFAULT 'light',
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  onboarding_answers JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

CREATE TABLE public.dossiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type dossier_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status dossier_status NOT NULL DEFAULT 'incomplete',
  visibility dossier_visibility NOT NULL DEFAULT 'private',
  completion_score INTEGER NOT NULL DEFAULT 0,
  location_name TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_dossiers_user_id ON public.dossiers(user_id);
CREATE INDEX idx_dossiers_type ON public.dossiers(type);
CREATE INDEX idx_dossiers_status ON public.dossiers(status);

CREATE TABLE public.participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dossier_id UUID NOT NULL REFERENCES public.dossiers(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_name TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  role participant_role NOT NULL DEFAULT 'viewer',
  share_percentage NUMERIC(5,2),
  invited_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_participants_dossier ON public.participants(dossier_id);
CREATE INDEX idx_participants_user ON public.participants(user_id);

CREATE TABLE public.proofs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dossier_id UUID NOT NULL REFERENCES public.dossiers(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id),
  type proof_type NOT NULL,
  title TEXT,
  storage_path TEXT NOT NULL,
  mime_type TEXT,
  size_bytes BIGINT,
  verified BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_proofs_dossier ON public.proofs(dossier_id);

CREATE TABLE public.alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type alert_type NOT NULL,
  severity alert_severity NOT NULL DEFAULT 'medium',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  related_dossier_id UUID REFERENCES public.dossiers(id) ON DELETE CASCADE,
  action_label TEXT,
  action_route TEXT,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_alerts_user ON public.alerts(user_id, read);

CREATE TABLE public.ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  context_type TEXT,
  context_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.ai_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_ai_messages_conv ON public.ai_messages(conversation_id, created_at);

-- ============ SECURITY DEFINER HELPERS (after tables exist) ============
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.is_dossier_participant(_dossier_id UUID, _user_id UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.participants WHERE dossier_id = _dossier_id AND user_id = _user_id)
$$;

CREATE OR REPLACE FUNCTION public.owns_dossier(_dossier_id UUID, _user_id UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.dossiers WHERE id = _dossier_id AND user_id = _user_id)
$$;

-- ============ ENABLE RLS ============
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dossiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proofs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;

-- ============ POLICIES: profiles ============
CREATE POLICY "view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- ============ POLICIES: user_roles ============
CREATE POLICY "view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "admins view all roles" ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- ============ POLICIES: dossiers ============
CREATE POLICY "owners view dossiers" ON public.dossiers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "participants view dossiers" ON public.dossiers FOR SELECT USING (public.is_dossier_participant(id, auth.uid()));
CREATE POLICY "owners insert dossiers" ON public.dossiers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "owners update dossiers" ON public.dossiers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "owners delete dossiers" ON public.dossiers FOR DELETE USING (auth.uid() = user_id);

-- ============ POLICIES: participants ============
CREATE POLICY "owners view participants" ON public.participants FOR SELECT USING (public.owns_dossier(dossier_id, auth.uid()));
CREATE POLICY "self view as participant" ON public.participants FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "owners manage participants" ON public.participants FOR ALL USING (public.owns_dossier(dossier_id, auth.uid()));

-- ============ POLICIES: proofs ============
CREATE POLICY "owners view proofs" ON public.proofs FOR SELECT USING (public.owns_dossier(dossier_id, auth.uid()));
CREATE POLICY "participants view proofs" ON public.proofs FOR SELECT USING (public.is_dossier_participant(dossier_id, auth.uid()));
CREATE POLICY "owners insert proofs" ON public.proofs FOR INSERT WITH CHECK (public.owns_dossier(dossier_id, auth.uid()) AND uploaded_by = auth.uid());
CREATE POLICY "owners delete proofs" ON public.proofs FOR DELETE USING (public.owns_dossier(dossier_id, auth.uid()));

-- ============ POLICIES: alerts ============
CREATE POLICY "view own alerts" ON public.alerts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "update own alerts" ON public.alerts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "delete own alerts" ON public.alerts FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "insert own alerts" ON public.alerts FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============ POLICIES: ai_conversations ============
CREATE POLICY "view own conversations" ON public.ai_conversations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "manage own conversations" ON public.ai_conversations FOR ALL USING (auth.uid() = user_id);

-- ============ POLICIES: ai_messages ============
CREATE POLICY "view own messages" ON public.ai_messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.ai_conversations c WHERE c.id = conversation_id AND c.user_id = auth.uid())
);
CREATE POLICY "insert own messages" ON public.ai_messages FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.ai_conversations c WHERE c.id = conversation_id AND c.user_id = auth.uid())
);

-- ============ TRIGGERS ============
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_dossiers_updated_at BEFORE UPDATE ON public.dossiers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_ai_conv_updated_at BEFORE UPDATE ON public.ai_conversations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile + role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, language)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    NEW.phone,
    COALESCE(NEW.raw_user_meta_data->>'language', 'fr')
  );
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ STORAGE ============
INSERT INTO storage.buckets (id, name, public)
VALUES ('dossier-proofs', 'dossier-proofs', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "users upload to own folder" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'dossier-proofs' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "users read own files" ON storage.objects FOR SELECT
  USING (bucket_id = 'dossier-proofs' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "users delete own files" ON storage.objects FOR DELETE
  USING (bucket_id = 'dossier-proofs' AND auth.uid()::text = (storage.foldername(name))[1]);
