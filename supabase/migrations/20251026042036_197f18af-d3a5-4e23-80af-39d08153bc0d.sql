-- Add streak tracking to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS streak_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_streak_check DATE DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS longest_streak INTEGER DEFAULT 0;