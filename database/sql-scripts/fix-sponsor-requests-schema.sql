-- Fix sponsor_requests table schema for Sober Spokane
-- This script adds missing columns to resolve form submission errors
-- Run this in your Supabase SQL Editor

-- Add missing columns to sponsor_requests table
alter table sponsor_requests 
add column if not exists availability_notes text,
add column if not exists sponsor_experience text,
add column if not exists support_offer text;

-- Verify the columns were added successfully
select 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
from information_schema.columns
where table_name = 'sponsor_requests'
order by ordinal_position;
