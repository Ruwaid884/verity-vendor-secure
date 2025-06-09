-- Fix profile creation issue during user signup
-- The trigger function needs permission to insert into profiles table

-- Add missing INSERT policy for profiles table
CREATE POLICY "Allow profile creation during signup" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Also allow service role to insert profiles (for the trigger function)
CREATE POLICY "Allow service role to insert profiles" ON public.profiles
  FOR INSERT WITH CHECK (true); 