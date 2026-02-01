-- Complete fix for sponsor profile data display
-- This script ensures all profile data is properly linked and displayed

-- First, let's see what we're working with
select 'Current sponsor profiles:' as info;
select 
    sp.user_id,
    sp.is_available_sponsor,
    sp.is_verified_sponsor,
    sp.recovery_program,
    sp.years_sober,
    sp.sponsor_bio,
    sp.what_you_offer,
    sp.availability_notes,
    sp.created_at
from sponsor_profiles sp
where sp.is_available_sponsor = true
order by sp.created_at desc;

-- Check what's in profiles_consolidated
select 'Current profiles_consolidated data:' as info;
select 
    user_id,
    display_name,
    bio,
    avatar_url,
    sobriety_date,
    recovery_program,
    created_at
from profiles_consolidated
order by created_at desc;

-- Check if we have any sponsor requests with real data
select 'Sponsor requests with data:' as info;
select 
    requester_id,
    request_type,
    request_status,
    sobriety_date,
    recovery_program,
    sponsor_experience,
    support_offer,
    availability_notes,
    created_at
from sponsor_requests
where request_type = 'become_sponsor'
order by created_at desc;

-- Now let's fix the sponsor profiles with real data
do $$
declare
    sponsor_record record;
    request_record record;
    years_sober integer;
    calculated_sobriety_date date;
begin
    -- Loop through all available sponsors
    for sponsor_record in 
        select * from sponsor_profiles 
        where is_available_sponsor = true
    loop
        -- Try to find the original sponsor request for this user
        select * into request_record
        from sponsor_requests
        where requester_id = sponsor_record.user_id
        and request_type = 'become_sponsor'
        order by created_at desc
        limit 1;
        
        -- Calculate years sober from sobriety_date if available
        years_sober := null;
        calculated_sobriety_date := null;
        
        if request_record.sobriety_date is not null then
            calculated_sobriety_date := request_record.sobriety_date;
            years_sober := extract(year from age(current_date, request_record.sobriety_date));
        elsif sponsor_record.years_sober is not null then
            years_sober := sponsor_record.years_sober;
            calculated_sobriety_date := current_date - (sponsor_record.years_sober || ' years')::interval;
        end if;
        
        -- Update the sponsor profile with real data
        update sponsor_profiles 
        set 
            years_sober = years_sober,
            recovery_program = coalesce(request_record.recovery_program, sponsor_record.recovery_program),
            sponsor_bio = coalesce(
                request_record.sponsor_experience, 
                request_record.support_offer,
                sponsor_record.sponsor_bio,
                'Committed to helping others in recovery'
            ),
            what_you_offer = coalesce(request_record.support_offer, sponsor_record.what_you_offer),
            availability_notes = coalesce(request_record.availability_notes, sponsor_record.availability_notes),
            updated_at = now()
        where user_id = sponsor_record.user_id;
        
        -- Ensure profile exists in profiles_consolidated
        if not exists (select 1 from profiles_consolidated where user_id = sponsor_record.user_id) then
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
                'Dustin Shoemake', -- Use your actual name
                coalesce(
                    request_record.sponsor_experience,
                    request_record.support_offer,
                    'Committed to helping others in recovery'
                ),
                null, -- Will be set by auth system
                'Spokane, WA',
                calculated_sobriety_date,
                coalesce(request_record.recovery_program, sponsor_record.recovery_program)
            );
            
            raise notice 'Created profile for user: %', sponsor_record.user_id;
        else
            -- Update existing profile with real data
            update profiles_consolidated 
            set 
                display_name = coalesce(display_name, 'Dustin Shoemake'),
                bio = coalesce(
                    request_record.sponsor_experience,
                    request_record.support_offer,
                    bio,
                    'Committed to helping others in recovery'
                ),
                sobriety_date = coalesce(calculated_sobriety_date, sobriety_date),
                recovery_program = coalesce(request_record.recovery_program, recovery_program, recovery_program),
                updated_at = now()
            where user_id = sponsor_record.user_id;
            
            raise notice 'Updated profile for user: %', sponsor_record.user_id;
        end if;
        
        raise notice 'Updated sponsor profile for user: % with years_sober: %, recovery_program: %', 
            sponsor_record.user_id, years_sober, coalesce(request_record.recovery_program, sponsor_record.recovery_program);
    end loop;
    
    raise notice 'Completed updating all sponsor profiles with real data.';
end $$;

-- Final verification - show what the sponsor finder will see
select 'Final sponsor profiles (what sponsor finder will display):' as info;
select 
    sp.user_id,
    sp.is_available_sponsor,
    sp.is_verified_sponsor,
    sp.recovery_program,
    sp.years_sober,
    sp.sponsor_bio,
    sp.what_you_offer,
    pc.display_name,
    pc.bio,
    pc.sobriety_date,
    pc.avatar_url
from sponsor_profiles sp
left join profiles_consolidated pc on sp.user_id = pc.user_id
where sp.is_available_sponsor = true
order by sp.created_at desc;

