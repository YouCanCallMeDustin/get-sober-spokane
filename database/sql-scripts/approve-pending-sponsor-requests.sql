-- Approve pending sponsor requests and create sponsor profiles
-- This script converts approved sponsor requests into available sponsor profiles

-- First, let's see what pending sponsor requests exist
select 'Pending sponsor requests:' as info;
select 
    id,
    requester_id,
    request_type,
    request_status,
    recovery_program,
    sponsor_experience,
    support_offer,
    created_at
from sponsor_requests 
where request_type = 'become_sponsor' 
and request_status = 'pending'
order by created_at desc;

-- Create sponsor profiles for approved requests
do $$
declare
    request_record record;
    years_sober integer;
    sobriety_date date;
begin
    -- Loop through all pending "become_sponsor" requests
    for request_record in 
        select * from sponsor_requests 
        where request_type = 'become_sponsor' 
        and request_status = 'pending'
    loop
        -- Calculate years sober if sobriety_date is provided
        years_sober := null;
        if request_record.sobriety_date is not null then
            years_sober := extract(year from age(current_date, request_record.sobriety_date));
        end if;
        
        -- Check if sponsor profile already exists
        if not exists (select 1 from sponsor_profiles where user_id = request_record.requester_id) then
            -- Create sponsor profile
            insert into sponsor_profiles (
                user_id,
                is_available_sponsor,
                is_verified_sponsor,
                max_sponsees,
                years_sober,
                recovery_program,
                preferred_contact_method,
                availability_notes,
                timezone,
                sponsor_experience_years,
                has_completed_sponsor_training,
                specializations,
                meeting_preferences,
                max_distance_miles,
                sponsor_bio,
                recovery_approach,
                what_you_offer,
                what_you_expect,
                background_check_date,
                references_provided
            ) values (
                request_record.requester_id,
                true,  -- Make them available
                true,  -- Auto-verify for now
                3,     -- Default max sponsees
                years_sober,
                request_record.recovery_program,
                coalesce(request_record.preferred_contact_method, 'message'),
                request_record.availability_notes,
                coalesce(request_record.timezone, 'America/Los_Angeles'),
                0,     -- New to sponsoring
                false, -- No training completed yet
                array['early_recovery'], -- Default specialization
                array['online', 'phone'], -- Default meeting preferences
                25,    -- Default max distance
                coalesce(request_record.sponsor_experience, 'New sponsor willing to help others in recovery.'),
                coalesce(request_record.support_offer, 'Supportive mentorship approach.'),
                request_record.support_offer,
                'Commitment to recovery and willingness to work the program.',
                null,  -- No background check yet
                false  -- No references provided yet
            );
            
            raise notice 'Created sponsor profile for user: %', request_record.requester_id;
        else
            -- Update existing profile to make them available
            update sponsor_profiles 
            set 
                is_available_sponsor = true,
                is_verified_sponsor = true,
                recovery_program = coalesce(request_record.recovery_program, recovery_program),
                availability_notes = coalesce(request_record.availability_notes, availability_notes),
                sponsor_bio = coalesce(request_record.sponsor_experience, sponsor_bio),
                what_you_offer = coalesce(request_record.support_offer, what_you_offer),
                updated_at = now()
            where user_id = request_record.requester_id;
            
            raise notice 'Updated sponsor profile for user: %', request_record.requester_id;
        end if;
        
        -- Update the request status to approved
        update sponsor_requests 
        set 
            request_status = 'approved',
            response_notes = 'Auto-approved and made available as sponsor',
            responded_at = now(),
            updated_at = now()
        where id = request_record.id;
        
        raise notice 'Approved sponsor request: %', request_record.id;
    end loop;
    
    raise notice 'Completed processing sponsor requests.';
end $$;

-- Verify the results
select 'Created/Updated sponsor profiles:' as info;
select 
    user_id,
    is_available_sponsor,
    is_verified_sponsor,
    recovery_program,
    years_sober,
    sponsor_bio
from sponsor_profiles 
where is_available_sponsor = true
order by created_at desc;

-- Show approved requests
select 'Approved sponsor requests:' as info;
select 
    id,
    requester_id,
    request_status,
    response_notes,
    responded_at
from sponsor_requests 
where request_type = 'become_sponsor' 
and request_status = 'approved'
order by responded_at desc;

