-- Sync Google Auth profile data to sponsor profiles
-- This script ensures sponsor cards pull data from Google Auth

-- First, let's see what Google Auth data we have
select 'Google Auth user data:' as info;
select 
    id,
    email,
    raw_user_meta_data,
    created_at
from auth.users
order by created_at desc
limit 3;

-- Check current sponsor profiles
select 'Current sponsor profiles:' as info;
select 
    sp.user_id,
    sp.is_available_sponsor,
    sp.recovery_program,
    sp.years_sober,
    sp.sponsor_bio,
    pc.display_name,
    pc.avatar_url,
    pc.bio
from sponsor_profiles sp
left join profiles_consolidated pc on sp.user_id = pc.user_id
where sp.is_available_sponsor = true
order by sp.created_at desc;

-- Now sync Google Auth data to profiles_consolidated and sponsor_profiles
do $$
declare
    sponsor_record record;
    user_record record;
    request_record record;
    google_name text;
    google_avatar text;
    google_email text;
    years_sober integer;
    calculated_sobriety_date date;
    bio_text text;
begin
    -- Loop through all available sponsors
    for sponsor_record in 
        select * from sponsor_profiles 
        where is_available_sponsor = true
    loop
        -- Get Google Auth data for this user
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
        
        -- Extract Google Auth data
        google_name := null;
        google_avatar := null;
        google_email := user_record.email;
        
        if user_record.raw_user_meta_data is not null then
            google_name := coalesce(
                user_record.raw_user_meta_data->>'full_name',
                user_record.raw_user_meta_data->>'name',
                user_record.raw_user_meta_data->>'display_name'
            );
            google_avatar := coalesce(
                user_record.raw_user_meta_data->>'avatar_url',
                user_record.raw_user_meta_data->>'picture'
            );
        end if;
        
        -- Use email prefix if no name is available
        if google_name is null or google_name = '' then
            google_name := split_part(google_email, '@', 1);
        end if;
        
        -- Calculate years sober from sponsor request
        years_sober := null;
        calculated_sobriety_date := null;
        
        if request_record.sobriety_date is not null then
            calculated_sobriety_date := request_record.sobriety_date;
            years_sober := extract(year from age(current_date, request_record.sobriety_date));
        end if;
        
        -- Create meaningful bio from sponsor request data
        bio_text := coalesce(
            request_record.sponsor_experience,
            request_record.support_offer,
            'Committed to helping others in recovery'
        );
        
        -- Update or create profile in profiles_consolidated with Google Auth data
        if exists (select 1 from profiles_consolidated where user_id = sponsor_record.user_id) then
            update profiles_consolidated 
            set 
                display_name = google_name,
                bio = bio_text,
                avatar_url = google_avatar,
                sobriety_date = calculated_sobriety_date,
                recovery_program = coalesce(request_record.recovery_program, recovery_program),
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
                google_name,
                bio_text,
                google_avatar,
                'Spokane, WA',
                calculated_sobriety_date,
                request_record.recovery_program
            );
        end if;
        
        -- Update sponsor profile with calculated years sober
        update sponsor_profiles 
        set 
            years_sober = years_sober,
            recovery_program = coalesce(request_record.recovery_program, recovery_program),
            sponsor_bio = bio_text,
            what_you_offer = coalesce(request_record.support_offer, what_you_offer),
            availability_notes = coalesce(request_record.availability_notes, availability_notes),
            updated_at = now()
        where user_id = sponsor_record.user_id;
        
        raise notice 'Synced Google Auth data for user: % - Name: %, Avatar: %, Years Sober: %', 
            sponsor_record.user_id, google_name, 
            case when google_avatar is not null then 'Yes' else 'No' end,
            years_sober;
    end loop;
    
    raise notice 'Completed syncing all sponsor profiles with Google Auth data.';
end $$;

-- Final verification - this is what the sponsor finder will display
select 'Final sponsor profiles with Google Auth data:' as info;
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
    au.email as google_email,
    case 
        when pc.avatar_url is not null then 'Has Google Avatar'
        else 'No Avatar'
    end as avatar_status
from sponsor_profiles sp
left join profiles_consolidated pc on sp.user_id = pc.user_id
left join auth.users au on sp.user_id = au.id
where sp.is_available_sponsor = true
order by sp.created_at desc;

