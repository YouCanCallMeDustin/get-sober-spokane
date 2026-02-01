-- Fix avatar and complete profile data for sponsors
-- This script ensures all profile data including avatars are properly set

-- First, let's check what auth.users data we have
select 'Auth users data:' as info;
select 
    id,
    email,
    raw_user_meta_data,
    raw_app_meta_data,
    created_at
from auth.users
order by created_at desc
limit 5;

-- Check current sponsor profiles
select 'Current sponsor profiles:' as info;
select 
    sp.user_id,
    sp.is_available_sponsor,
    sp.is_verified_sponsor,
    sp.recovery_program,
    sp.years_sober,
    sp.sponsor_bio,
    sp.what_you_offer,
    sp.availability_notes
from sponsor_profiles sp
where sp.is_available_sponsor = true
order by sp.created_at desc;

-- Check current profiles_consolidated
select 'Current profiles_consolidated:' as info;
select 
    user_id,
    display_name,
    bio,
    avatar_url,
    sobriety_date,
    recovery_program
from profiles_consolidated
order by created_at desc;

-- Now let's fix everything
do $$
declare
    sponsor_record record;
    request_record record;
    user_record record;
    years_sober integer;
    calculated_sobriety_date date;
    avatar_url text;
    display_name text;
    bio_text text;
begin
    -- Loop through all available sponsors
    for sponsor_record in 
        select * from sponsor_profiles 
        where is_available_sponsor = true
    loop
        -- Get the user data from auth.users
        select * into user_record
        from auth.users
        where id = sponsor_record.user_id;
        
        -- Get the original sponsor request
        select * into request_record
        from sponsor_requests
        where requester_id = sponsor_record.user_id
        and request_type = 'become_sponsor'
        order by created_at desc
        limit 1;
        
        -- Extract avatar URL from user metadata
        avatar_url := null;
        if user_record.raw_user_meta_data is not null then
            avatar_url := user_record.raw_user_meta_data->>'avatar_url';
            if avatar_url is null or avatar_url = '' then
                avatar_url := user_record.raw_user_meta_data->>'picture';
            end if;
        end if;
        
        -- Set display name
        display_name := 'Dustin Shoemake';
        if user_record.raw_user_meta_data is not null then
            if user_record.raw_user_meta_data->>'full_name' is not null then
                display_name := user_record.raw_user_meta_data->>'full_name';
            elsif user_record.raw_user_meta_data->>'name' is not null then
                display_name := user_record.raw_user_meta_data->>'name';
            end if;
        end if;
        
        -- Calculate years sober
        years_sober := null;
        calculated_sobriety_date := null;
        
        if request_record.sobriety_date is not null then
            calculated_sobriety_date := request_record.sobriety_date;
            years_sober := extract(year from age(current_date, request_record.sobriety_date));
        elsif sponsor_record.years_sober is not null then
            years_sober := sponsor_record.years_sober;
            calculated_sobriety_date := current_date - (sponsor_record.years_sober || ' years')::interval;
        end if;
        
        -- Set bio text
        bio_text := coalesce(
            request_record.sponsor_experience,
            request_record.support_offer,
            sponsor_record.sponsor_bio,
            'Committed to helping others in recovery'
        );
        
        -- Update sponsor profile with real data
        update sponsor_profiles 
        set 
            years_sober = years_sober,
            recovery_program = coalesce(request_record.recovery_program, sponsor_record.recovery_program),
            sponsor_bio = bio_text,
            what_you_offer = coalesce(request_record.support_offer, sponsor_record.what_you_offer),
            availability_notes = coalesce(request_record.availability_notes, sponsor_record.availability_notes),
            updated_at = now()
        where user_id = sponsor_record.user_id;
        
        -- Update or create profile in profiles_consolidated
        if exists (select 1 from profiles_consolidated where user_id = sponsor_record.user_id) then
            update profiles_consolidated 
            set 
                display_name = display_name,
                bio = bio_text,
                avatar_url = avatar_url,
                sobriety_date = coalesce(calculated_sobriety_date, sobriety_date),
                recovery_program = coalesce(request_record.recovery_program, recovery_program, recovery_program),
                updated_at = now()
            where user_id = sponsor_record.user_id;
        else
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
                display_name,
                bio_text,
                avatar_url,
                'Spokane, WA',
                calculated_sobriety_date,
                coalesce(request_record.recovery_program, sponsor_record.recovery_program)
            );
        end if;
        
        raise notice 'Updated profile for user: % - Name: %, Years Sober: %, Avatar: %', 
            sponsor_record.user_id, display_name, years_sober, 
            case when avatar_url is not null then 'Yes' else 'No' end;
    end loop;
    
    raise notice 'Completed updating all sponsor profiles with complete data.';
end $$;

-- Final verification
select 'Final sponsor profiles with complete data:' as info;
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
    pc.avatar_url,
    case 
        when pc.avatar_url is not null then 'Has Avatar'
        else 'No Avatar'
    end as avatar_status
from sponsor_profiles sp
left join profiles_consolidated pc on sp.user_id = pc.user_id
where sp.is_available_sponsor = true
order by sp.created_at desc;

