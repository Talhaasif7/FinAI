
-- Family groups table
CREATE TABLE public.family_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_by uuid NOT NULL,
  invite_code text NOT NULL DEFAULT substr(md5(random()::text), 1, 8),
  monthly_budget numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Family members table
CREATE TABLE public.family_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES public.family_groups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'member',
  allowance numeric DEFAULT NULL,
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(group_id, user_id)
);

-- Enable RLS
ALTER TABLE public.family_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;

-- Helper function: check if user is member of a group
CREATE OR REPLACE FUNCTION public.is_family_member(_user_id uuid, _group_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.family_members
    WHERE user_id = _user_id AND group_id = _group_id
  )
$$;

-- Helper function: check if user is admin of a group
CREATE OR REPLACE FUNCTION public.is_family_admin(_user_id uuid, _group_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.family_members
    WHERE user_id = _user_id AND group_id = _group_id AND role = 'admin'
  )
$$;

-- RLS for family_groups
CREATE POLICY "Members can view their groups"
  ON public.family_groups FOR SELECT TO authenticated
  USING (public.is_family_member(auth.uid(), id));

CREATE POLICY "Authenticated users can create groups"
  ON public.family_groups FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Admins can update their groups"
  ON public.family_groups FOR UPDATE TO authenticated
  USING (public.is_family_admin(auth.uid(), id));

CREATE POLICY "Admins can delete their groups"
  ON public.family_groups FOR DELETE TO authenticated
  USING (public.is_family_admin(auth.uid(), id));

-- RLS for family_members
CREATE POLICY "Members can view group members"
  ON public.family_members FOR SELECT TO authenticated
  USING (public.is_family_member(auth.uid(), group_id));

CREATE POLICY "Admins can add members"
  ON public.family_members FOR INSERT TO authenticated
  WITH CHECK (
    public.is_family_admin(auth.uid(), group_id)
    OR NOT EXISTS (SELECT 1 FROM public.family_members fm2 WHERE fm2.group_id = family_members.group_id)
  );

CREATE POLICY "Admins can update members"
  ON public.family_members FOR UPDATE TO authenticated
  USING (public.is_family_admin(auth.uid(), group_id));

CREATE POLICY "Admins can remove members"
  ON public.family_members FOR DELETE TO authenticated
  USING (public.is_family_admin(auth.uid(), group_id));

-- Updated_at trigger for family_groups
CREATE TRIGGER update_family_groups_updated_at
  BEFORE UPDATE ON public.family_groups
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
