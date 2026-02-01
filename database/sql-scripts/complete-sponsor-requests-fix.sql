-- Complete fix for sponsor_requests table
-- This script ensures the table exists with all required columns
-- Run this in your Supabase SQL Editor

-- First, check if the table exists
do $$
begin
    if not exists (select 1 from information_schema.tables where table_name = 'sponsor_requests') then
        raise notice 'sponsor_requests table does not exist. Creating it...';
        
        -- Create the complete sponsor_requests table
        create table sponsor_requests (
            id uuid primary key default gen_random_uuid(),
            requester_id uuid references auth.users(id) on delete cascade not null,
            requested_sponsor_id uuid references auth.users(id) on delete cascade,
            
            -- Request details
            request_type text default 'find_sponsor' check (request_type in ('find_sponsor', 'request_specific_sponsor', 'become_sponsor')),
            request_status text default 'pending' check (request_status in ('pending', 'approved', 'declined', 'expired', 'cancelled')),
            
            -- Request information
            sobriety_date date,
            recovery_program text,
            current_challenges text,
            what_you_need text,
            what_you_offer text,
            preferred_sponsor_qualities text,
            
            -- Contact and availability
            preferred_contact_method text default 'message',
            availability_notes text,
            timezone text default 'America/Los_Angeles',
            
            -- Location preferences
            meeting_preferences text[] default '{}',
            max_distance_miles integer default 25,
            
            -- Request timeline
            expires_at timestamp with time zone default (now() + interval '30 days'),
            responded_at timestamp with time zone,
            response_notes text,
            
            -- Additional fields from form
            sponsor_experience text,
            support_offer text,
            
            -- Timestamps
            created_at timestamp with time zone default now(),
            updated_at timestamp with time zone default now()
        );
        
        raise notice 'sponsor_requests table created successfully.';
    else
        raise notice 'sponsor_requests table exists. Adding missing columns...';
        
        -- Add missing columns if they don't exist
        alter table sponsor_requests 
        add column if not exists recovery_program text,
        add column if not exists sobriety_date date,
        add column if not exists current_challenges text,
        add column if not exists what_you_need text,
        add column if not exists what_you_offer text,
        add column if not exists preferred_sponsor_qualities text,
        add column if not exists preferred_contact_method text default 'message',
        add column if not exists availability_notes text,
        add column if not exists timezone text default 'America/Los_Angeles',
        add column if not exists meeting_preferences text[] default '{}',
        add column if not exists max_distance_miles integer default 25,
        add column if not exists expires_at timestamp with time zone default (now() + interval '30 days'),
        add column if not exists responded_at timestamp with time zone,
        add column if not exists response_notes text,
        add column if not exists sponsor_experience text,
        add column if not exists support_offer text,
        add column if not exists created_at timestamp with time zone default now(),
        add column if not exists updated_at timestamp with time zone default now();
        
        raise notice 'Missing columns added successfully.';
    end if;
end $$;

-- Enable RLS
alter table sponsor_requests enable row level security;

-- Create RLS policies
do $$
begin
    -- Drop existing policies if they exist
    drop policy if exists "Users can view their own requests" on sponsor_requests;
    drop policy if exists "Users can create their own requests" on sponsor_requests;
    drop policy if exists "Users can update their own requests" on sponsor_requests;
    
    -- Create new policies
    create policy "Users can view their own requests" on sponsor_requests
        for select using (auth.uid() = requester_id or auth.uid() = requested_sponsor_id);
    
    create policy "Users can create their own requests" on sponsor_requests
        for insert with check (auth.uid() = requester_id);
    
    create policy "Users can update their own requests" on sponsor_requests
        for update using (auth.uid() = requester_id or auth.uid() = requested_sponsor_id);
    
    raise notice 'RLS policies created successfully.';
end $$;

-- Grant permissions
grant all on sponsor_requests to anon, authenticated;

-- Create indexes
create index if not exists idx_sponsor_requests_requester on sponsor_requests(requester_id);
create index if not exists idx_sponsor_requests_sponsor on sponsor_requests(requested_sponsor_id);
create index if not exists idx_sponsor_requests_status on sponsor_requests(request_status);
create index if not exists idx_sponsor_requests_type on sponsor_requests(request_type);
create index if not exists idx_sponsor_requests_expires on sponsor_requests(expires_at);

-- Create trigger for updated_at
do $$
begin
    if not exists (select 1 from pg_trigger where tgname = 'update_sponsor_requests_updated_at') then
        create trigger update_sponsor_requests_updated_at 
            before update on sponsor_requests
            for each row execute function update_updated_at_column();
        raise notice 'Updated_at trigger created successfully.';
    end if;
end $$;

-- Final verification
select 'Final sponsor_requests table structure:' as info;
select 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
from information_schema.columns
where table_name = 'sponsor_requests'
order by ordinal_position;
