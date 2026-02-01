-- Fix sponsor profile data linking
-- This script ensures sponsor profiles have proper user profile data

-- First, check what tables exist
select 'Available profile tables:' as info;
select 
    table_name, 
    table_type
from information_schema.tables 
where table_name like '%profile%' or table_name like '%user%'
order by table_name;

-- Check if profiles_consolidated exists and has data
select 'profiles_consolidated table structure:' as info;
select 
    column_name, 
    data_type, 
    is_nullable
from information_schema.columns
where table_name = 'profiles_consolidated'
order by ordinal_position;

-- Check current sponsor profiles and their user data
select 'Current sponsor profiles:' as info;
select 
    sp.user_id,
    sp.is_available_sponsor,
    sp.is_verified_sponsor,
    sp.recovery_program,
    sp.years_sober,
    sp.sponsor_bio,
    pc.display_name,
    pc.bio,
    pc.sobriety_date,
    pc.avatar_url
from sponsor_profiles sp
left join profiles_consolidated pc on sp.user_id = pc.user_id
where sp.is_available_sponsor = true
order by sp.created_at desc;

-- Check if user has a profile in profiles_consolidated
select 'User profiles in profiles_consolidated:' as info;
select 
    user_id,
    display_name,
    bio,
    sobriety_date,
    avatar_url,
    created_at
from profiles_consolidated
order by created_at desc
limit 10;

-- If profiles_consolidated doesn't exist, create it
do $$
begin
    if not exists (select 1 from information_schema.tables where table_name = 'profiles_consolidated') then
        raise notice 'profiles_consolidated table does not exist. Creating it...';
        
        create table profiles_consolidated (
            id uuid primary key default gen_random_uuid(),
            user_id uuid references auth.users(id) on delete cascade unique not null,
            display_name text,
            bio text,
            avatar_url text,
            location text default 'Spokane, WA',
            sobriety_date date,
            recovery_program text,
            created_at timestamp with time zone default now(),
            updated_at timestamp with time zone default now()
        );
        
        -- Enable RLS
        alter table profiles_consolidated enable row level security;
        
        -- Create policies
        create policy "Users can view all profiles" on profiles_consolidated
            for select using (true);
        
        create policy "Users can update their own profile" on profiles_consolidated
            for all using (auth.uid() = user_id);
        
        -- Grant permissions
        grant all on profiles_consolidated to anon, authenticated;
        
        raise notice 'profiles_consolidated table created successfully.';
    else
        raise notice 'profiles_consolidated table already exists.';
    end if;
end $$;

-- Create or update profile for sponsor users
do $$
declare
    sponsor_record record;
    years_sober integer;
begin
    -- Loop through all available sponsors
    for sponsor_record in 
        select * from sponsor_profiles 
        where is_available_sponsor = true
    loop
        -- Calculate years sober if sobriety_date is provided
        years_sober := null;
        if sponsor_record.years_sober is not null then
            years_sober := sponsor_record.years_sober;
        end if;
        
        -- Check if profile exists in profiles_consolidated
        if not exists (select 1 from profiles_consolidated where user_id = sponsor_record.user_id) then
            -- Create profile from sponsor data
            insert into profiles_consolidated (
                user_id,
                display_name,
                bio,
                avatar_url,
                location,
                sobriety_date,
                recovery_program
            ) values (
                sponsor_record.user_id,
                'Sponsor User', -- Default name
                coalesce(sponsor_record.sponsor_bio, 'Committed to helping others in recovery'),
                null, -- No avatar yet
                'Spokane, WA',
                case 
                    when sponsor_record.years_sober is not null 
                    then current_date - (sponsor_record.years_sober || ' years')::interval
                    else null 
                end,
                sponsor_record.recovery_program
            );
            
            raise notice 'Created profile for sponsor user: %', sponsor_record.user_id;
        else
            -- Update existing profile with sponsor data
            update profiles_consolidated 
            set 
                bio = coalesce(sponsor_record.sponsor_bio, bio),
                recovery_program = coalesce(sponsor_record.recovery_program, recovery_program),
                sobriety_date = case 
                    when sponsor_record.years_sober is not null and sobriety_date is null
                    then current_date - (sponsor_record.years_sober || ' years')::interval
                    else sobriety_date 
                end,
                updated_at = now()
            where user_id = sponsor_record.user_id;
            
            raise notice 'Updated profile for sponsor user: %', sponsor_record.user_id;
        end if;
    end loop;
    
    raise notice 'Completed syncing sponsor profiles with user profiles.';
end $$;

-- Final verification
select 'Final sponsor profiles with linked data:' as info;
select 
    sp.user_id,
    sp.is_available_sponsor,
    sp.is_verified_sponsor,
    sp.recovery_program,
    sp.years_sober,
    sp.sponsor_bio,
    pc.display_name,
    pc.bio,
    pc.sobriety_date,
    pc.avatar_url
from sponsor_profiles sp
left join profiles_consolidated pc on sp.user_id = pc.user_id
where sp.is_available_sponsor = true
order by sp.created_at desc;

