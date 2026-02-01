-- Fix sponsor_requests constraint issues
-- This script checks and fixes the request_type constraint

-- First, check the current constraint
select 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
from pg_constraint 
where conrelid = 'sponsor_requests'::regclass 
and contype = 'c';

-- Drop the existing constraint if it exists
alter table sponsor_requests 
drop constraint if exists sponsor_requests_request_type_check;

-- Add the correct constraint with all valid values
alter table sponsor_requests 
add constraint sponsor_requests_request_type_check 
check (request_type in ('find_sponsor', 'request_specific_sponsor', 'become_sponsor'));

-- Also check and fix the request_status constraint
alter table sponsor_requests 
drop constraint if exists sponsor_requests_request_status_check;

alter table sponsor_requests 
add constraint sponsor_requests_request_status_check 
check (request_status in ('pending', 'approved', 'declined', 'expired', 'cancelled'));

-- Verify the constraints were created
select 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
from pg_constraint 
where conrelid = 'sponsor_requests'::regclass 
and contype = 'c';
