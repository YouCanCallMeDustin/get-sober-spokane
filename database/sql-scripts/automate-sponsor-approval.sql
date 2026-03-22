-- SQL Script to Automate Sponsor Approval (Option A) - UPDATED
-- This script corrects the column names used in the trigger.

-- 1. Create the function that handles the conversion
CREATE OR REPLACE FUNCTION handle_sponsor_approval()
RETURNS TRIGGER AS $$
BEGIN
    -- Only run when status changes to 'approved' and it's a 'become_sponsor' request
    IF (NEW.request_status = 'approved' AND (OLD.request_status IS NULL OR OLD.request_status = 'pending') AND NEW.request_type = 'become_sponsor') THEN
        
        -- Insert or Update the sponsor profile
        INSERT INTO public.sponsor_profiles (
            user_id, 
            is_available_sponsor, 
            is_verified_sponsor,
            years_sober,
            recovery_program,
            sponsor_bio,
            what_you_offer,
            created_at,
            updated_at
        ) 
        VALUES (
            NEW.requester_id,
            true, -- Make them available
            true, -- Mark as verified
            -- Calculate years sober (approximate)
            CASE 
                WHEN NEW.sobriety_date IS NOT NULL THEN 
                    EXTRACT(YEAR FROM age(CURRENT_DATE, NEW.sobriety_date))::INTEGER
                ELSE 0
            END,
            NEW.recovery_program,
            NEW.sponsor_experience, -- Use their experience as bio
            NEW.support_offer,    -- Use their support offer as what_you_offer
            NOW(),
            NOW()
        )
        ON CONFLICT (user_id) DO UPDATE SET
            is_available_sponsor = true,
            is_verified_sponsor = true,
            years_sober = EXCLUDED.years_sober,
            recovery_program = EXCLUDED.recovery_program,
            sponsor_bio = EXCLUDED.sponsor_bio,
            what_you_offer = EXCLUDED.what_you_offer,
            updated_at = NOW();

        RAISE NOTICE 'Sponsor profile created for user %', NEW.requester_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Create the trigger on the public.sponsor_requests table
DROP TRIGGER IF EXISTS on_sponsor_request_approved ON public.sponsor_requests;
CREATE TRIGGER on_sponsor_request_approved
    AFTER UPDATE ON public.sponsor_requests
    FOR EACH ROW
    EXECUTE FUNCTION handle_sponsor_approval();
