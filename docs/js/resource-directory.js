// Resource Directory Management System
class ResourceDirectory {
    constructor() {
        this.resources = [];
        this.filteredResources = [];
        this.currentFilters = {
            category: 'all',
            location: 'all',
            availability: 'all',
            search: ''
        };
        this.init();
    }

    init() {
        console.log('Initializing ResourceDirectory');
        this.loadResources();
        console.log('Loaded', this.resources.length, 'resources');
        this.setupEventListeners();
        this.renderResources();
        console.log('ResourceDirectory initialization complete');
    }

    loadResources() {
        // Comprehensive resource database
        this.resources = [
            // Shelters
            {
                id: 'shelter-1',
                name: 'Crosswalk Youth Shelter',
                category: 'shelter',
                subcategory: 'youth',
                address: '525 W 2nd Ave, Spokane, WA 99201',
                phone: '(509) 455-0730',
                hours: '24/7',
                availability: 'available',
                description: 'Emergency shelter for youth ages 13-17',
                services: ['emergency shelter', 'case management', 'counseling'],
                coordinates: { lat: 47.65813, lng: -117.41798 },
                accessibility: ['wheelchair accessible', 'ADA compliant'],
                requirements: ['youth 13-17', 'photo ID'],
                website: 'https://crosswalkyouth.org',
                rating: 4.5,
                reviews: 12
            },
            {
                id: 'shelter-2',
                name: 'House of Charity Shelter',
                category: 'shelter',
                subcategory: 'adult',
                address: '32 W Pacific, Spokane, WA 99201',
                phone: '(509) 456-7111',
                hours: '7:00 PM - 7:00 AM',
                availability: 'available',
                description: 'Emergency shelter for adults',
                services: ['emergency shelter', 'meals', 'showers'],
                coordinates: { lat: 47.6537, lng: -117.4112 },
                accessibility: ['wheelchair accessible'],
                requirements: ['adult', 'sobriety required'],
                website: '',
                rating: 4.2,
                reviews: 8
            },
            {
                id: 'shelter-3',
                name: "Hope House Women's Shelter",
                category: 'shelter',
                subcategory: 'women',
                address: '318 S Adams, Spokane, WA 99201',
                phone: '(509) 455-2886',
                hours: '24/7',
                availability: 'limited',
                description: 'Emergency shelter for women and children',
                services: ['emergency shelter', 'case management', 'childcare'],
                coordinates: { lat: 47.6542, lng: -117.4267 },
                accessibility: ['wheelchair accessible'],
                requirements: ['women and children only'],
                website: '',
                rating: 4.7,
                reviews: 15
            },
            {
                id: 'shelter-4',
                name: 'Union Gospel Mission',
                category: 'shelter',
                subcategory: 'adult',
                address: '1224 E Trent Ave, Spokane, WA 99202',
                phone: '(509) 535-8510',
                hours: '24/7',
                availability: 'available',
                description: 'Emergency shelter and recovery program for men',
                services: ['emergency shelter', 'recovery program', 'meals', 'job training'],
                coordinates: { lat: 47.6589, lng: -117.3932 },
                accessibility: ['wheelchair accessible'],
                requirements: ['men only', 'sobriety required'],
                website: 'https://ugmspokane.org',
                rating: 4.4,
                reviews: 23
            },
            {
                id: 'shelter-5',
                name: 'Catholic Charities St. Margaret\'s Shelter',
                category: 'shelter',
                subcategory: 'family',
                address: '101 E 8th Ave, Spokane, WA 99202',
                phone: '(509) 474-0015',
                hours: '24/7',
                availability: 'limited',
                description: 'Emergency shelter for families with children',
                services: ['emergency shelter', 'case management', 'childcare', 'housing assistance'],
                coordinates: { lat: 47.6582, lng: -117.4047 },
                accessibility: ['wheelchair accessible'],
                requirements: ['families with children', 'photo ID'],
                website: 'https://catholiccharitiescw.org',
                rating: 4.6,
                reviews: 31
            },
            {
                id: 'shelter-6',
                name: 'Spokane Valley Partners',
                category: 'shelter',
                subcategory: 'family',
                address: '10814 E Broadway Ave, Spokane Valley, WA 99206',
                phone: '(509) 927-1153',
                hours: 'Mon-Fri 8:00 AM - 5:00 PM',
                availability: 'available',
                description: 'Emergency assistance and shelter referrals',
                services: ['emergency assistance', 'shelter referrals', 'food bank', 'clothing'],
                coordinates: { lat: 47.6734, lng: -117.2398 },
                accessibility: ['wheelchair accessible'],
                requirements: ['proof of need', 'photo ID'],
                website: 'https://svpart.org',
                rating: 4.3,
                reviews: 19
            },

            // Food Banks
            {
                id: 'food-1',
                name: 'Second Harvest Inland Northwest',
                category: 'food',
                subcategory: 'food bank',
                address: '1234 E Front Ave, Spokane, WA 99202',
                phone: '(509) 534-6678',
                hours: 'Mon-Fri 8:00 AM - 4:00 PM',
                availability: 'available',
                description: 'Large food bank serving the Inland Northwest',
                services: ['food distribution', 'nutrition education', 'SNAP assistance'],
                coordinates: { lat: 47.6607, lng: -117.3932 },
                accessibility: ['wheelchair accessible', 'ADA compliant'],
                requirements: ['proof of income', 'photo ID'],
                website: 'https://2-harvest.org',
                rating: 4.8,
                reviews: 25
            },
            {
                id: 'food-2',
                name: 'Serve Spokane',
                category: 'food',
                subcategory: 'food bank',
                address: '8303 B, N Division St, Spokane, WA 99208',
                phone: '(509) 489-1133',
                hours: 'Mon-Sat 9:00 AM - 5:00 PM',
                availability: 'available',
                description: 'Community food bank and resource center',
                services: ['food distribution', 'clothing', 'household items'],
                coordinates: { lat: 47.7292, lng: -117.4102 },
                accessibility: ['wheelchair accessible'],
                requirements: ['proof of address'],
                website: '',
                rating: 4.3,
                reviews: 18
            },
            {
                id: 'food-3',
                name: 'Spokane Valley Food Bank',
                category: 'food',
                subcategory: 'food bank',
                address: '10814 E Broadway Ave, Spokane Valley, WA 99206',
                phone: '(509) 927-1153',
                hours: 'Mon-Fri 9:00 AM - 4:00 PM',
                availability: 'available',
                description: 'Food bank serving Spokane Valley area',
                services: ['food distribution', 'emergency food', 'nutrition assistance'],
                coordinates: { lat: 47.6734, lng: -117.2398 },
                accessibility: ['wheelchair accessible'],
                requirements: ['proof of address', 'income verification'],
                website: 'https://svpart.org',
                rating: 4.2,
                reviews: 15
            },
            {
                id: 'food-4',
                name: 'North County Food Bank',
                category: 'food',
                subcategory: 'food bank',
                address: '109 E 3rd Ave, Deer Park, WA 99006',
                phone: '(509) 276-9811',
                hours: 'Mon-Fri 9:00 AM - 3:00 PM',
                availability: 'available',
                description: 'Food bank serving northern Spokane County',
                services: ['food distribution', 'emergency food', 'holiday baskets'],
                coordinates: { lat: 47.9674, lng: -117.4756 },
                accessibility: ['wheelchair accessible'],
                requirements: ['proof of address'],
                website: '',
                rating: 4.1,
                reviews: 12
            },

            // Treatment Centers
            {
                id: 'treatment-1',
                name: 'Spokane Treatment & Recovery Services (STARS)',
                category: 'treatment',
                subcategory: 'outpatient',
                address: '628 S Cowley St, Spokane, WA 99202',
                phone: '(509) 456-7627',
                hours: 'Mon-Fri 8:00 AM - 6:00 PM',
                availability: 'available',
                description: 'Comprehensive outpatient addiction treatment',
                services: ['individual therapy', 'group therapy', 'medication-assisted treatment', 'case management'],
                coordinates: { lat: 47.6482, lng: -117.4047 },
                accessibility: ['wheelchair accessible', 'ADA compliant'],
                requirements: ['assessment required', 'insurance or sliding scale'],
                website: 'https://spokanehealth.org',
                rating: 4.6,
                reviews: 32
            },
            {
                id: 'treatment-2',
                name: 'CAT SPOKANE',
                category: 'treatment',
                subcategory: 'residential',
                address: '960 E 3rd Ave, Spokane, WA 99202',
                phone: '(509) 456-7627',
                hours: '24/7',
                availability: 'limited',
                description: 'Comprehensive residential addiction treatment',
                services: ['residential treatment', 'detox', 'aftercare planning'],
                coordinates: { lat: 47.6531, lng: -117.3936 },
                accessibility: ['wheelchair accessible'],
                requirements: ['assessment required', 'insurance or payment plan'],
                website: '',
                rating: 4.4,
                reviews: 28
            },
            {
                id: 'treatment-3',
                name: 'Spokane Addiction Recovery Center',
                category: 'treatment',
                subcategory: 'outpatient',
                address: '1504 W. Grace Ave, Spokane, WA 99205',
                phone: '(509) 456-7627',
                hours: 'Mon-Fri 8:00 AM - 8:00 PM, Sat 9:00 AM - 5:00 PM',
                availability: 'available',
                description: 'Outpatient addiction treatment and recovery support',
                services: ['individual therapy', 'group therapy', 'family therapy', 'relapse prevention'],
                coordinates: { lat: 47.6822, lng: -117.4397 },
                accessibility: ['wheelchair accessible'],
                requirements: ['assessment required', 'insurance or sliding scale'],
                website: '',
                rating: 4.5,
                reviews: 26
            },
            {
                id: 'treatment-4',
                name: 'Recovery Cafe Spokane',
                category: 'treatment',
                subcategory: 'peer support',
                address: '1700 W. 7th Ave, Suite 100, Spokane, WA 99204',
                phone: '(509) 456-7627',
                hours: 'Mon-Sat 9:00 AM - 6:00 PM',
                availability: 'available',
                description: 'Peer-led recovery community and support center',
                services: ['peer support', 'recovery coaching', 'community meals', 'art therapy'],
                coordinates: { lat: 47.6462, lng: -117.4457 },
                accessibility: ['wheelchair accessible'],
                requirements: ['open to all in recovery'],
                website: '',
                rating: 4.8,
                reviews: 34
            },
            {
                id: 'treatment-5',
                name: 'Spokane Valley Recovery Center',
                category: 'treatment',
                subcategory: 'outpatient',
                address: '10814 E Broadway Ave, Spokane Valley, WA 99206',
                phone: '(509) 456-7627',
                hours: 'Mon-Fri 8:00 AM - 6:00 PM',
                availability: 'available',
                description: 'Outpatient addiction treatment in Spokane Valley',
                services: ['individual therapy', 'group therapy', 'medication-assisted treatment', 'case management'],
                coordinates: { lat: 47.6734, lng: -117.2398 },
                accessibility: ['wheelchair accessible'],
                requirements: ['assessment required', 'insurance or sliding scale'],
                website: '',
                rating: 4.3,
                reviews: 21
            },
            {
                id: 'treatment-6',
                name: 'Spokane Detox Center',
                category: 'treatment',
                subcategory: 'detox',
                address: '960 E 3rd Ave, Spokane, WA 99202',
                phone: '(509) 456-7627',
                hours: '24/7',
                availability: 'limited',
                description: 'Medical detoxification services',
                services: ['medical detox', '24/7 monitoring', 'medication management', 'crisis intervention'],
                coordinates: { lat: 47.6531, lng: -117.3936 },
                accessibility: ['wheelchair accessible'],
                requirements: ['medical assessment', 'insurance or payment plan'],
                website: '',
                rating: 4.2,
                reviews: 18
            },

            // Support Groups
            {
                id: 'support-1',
                name: 'Al-Anon/Alateen',
                category: 'support',
                subcategory: '12-step',
                address: '1700 W. 7th Ave, Suite 100, Spokane, WA 99204',
                phone: '(509) 456-7627',
                hours: 'Various meeting times',
                availability: 'available',
                description: 'Support for families and friends of alcoholics',
                services: ['12-step meetings', 'family support', 'teen support'],
                coordinates: { lat: 47.6462, lng: -117.4457 },
                accessibility: ['wheelchair accessible'],
                requirements: ['open to all'],
                website: 'https://al-anon.org',
                rating: 4.9,
                reviews: 45
            },
            {
                id: 'support-2',
                name: 'Celebrate Recovery',
                category: 'support',
                subcategory: 'christian',
                address: '1504 W. Grace Ave, Spokane, WA 99205',
                phone: '(509) 456-7627',
                hours: 'Thursdays 6:00 PM',
                availability: 'available',
                description: 'Christian-based recovery support group',
                services: ['12-step meetings', 'bible study', 'fellowship'],
                coordinates: { lat: 47.6822, lng: -117.4397 },
                accessibility: ['wheelchair accessible'],
                requirements: ['open to all'],
                website: '',
                rating: 4.7,
                reviews: 22
            },
            {
                id: 'support-3',
                name: 'Alcoholics Anonymous (AA)',
                category: 'support',
                subcategory: '12-step',
                address: 'Various locations throughout Spokane',
                phone: '(509) 456-7627',
                hours: 'Multiple daily meetings',
                availability: 'available',
                description: '12-step program for alcohol recovery',
                services: ['12-step meetings', 'sponsorship', 'fellowship'],
                coordinates: { lat: 47.6582, lng: -117.4047 },
                accessibility: ['wheelchair accessible'],
                requirements: ['desire to stop drinking'],
                website: 'https://aa.org',
                rating: 4.8,
                reviews: 67
            },
            {
                id: 'support-4',
                name: 'Narcotics Anonymous (NA)',
                category: 'support',
                subcategory: '12-step',
                address: 'Various locations throughout Spokane',
                phone: '(509) 456-7627',
                hours: 'Multiple daily meetings',
                availability: 'available',
                description: '12-step program for drug addiction recovery',
                services: ['12-step meetings', 'sponsorship', 'fellowship'],
                coordinates: { lat: 47.6582, lng: -117.4047 },
                accessibility: ['wheelchair accessible'],
                requirements: ['desire to stop using'],
                website: 'https://na.org',
                rating: 4.7,
                reviews: 43
            },
            {
                id: 'support-5',
                name: 'SMART Recovery',
                category: 'support',
                subcategory: 'evidence-based',
                address: '1700 W. 7th Ave, Suite 100, Spokane, WA 99204',
                phone: '(509) 456-7627',
                hours: 'Tuesdays and Thursdays 6:00 PM',
                availability: 'available',
                description: 'Science-based addiction recovery support',
                services: ['group meetings', 'self-management tools', 'online support'],
                coordinates: { lat: 47.6462, lng: -117.4457 },
                accessibility: ['wheelchair accessible'],
                requirements: ['open to all'],
                website: 'https://smartrecovery.org',
                rating: 4.6,
                reviews: 28
            },
            {
                id: 'support-6',
                name: 'Refuge Recovery',
                category: 'support',
                subcategory: 'buddhist',
                address: '1504 W. Grace Ave, Spokane, WA 99205',
                phone: '(509) 456-7627',
                hours: 'Sundays 10:00 AM',
                availability: 'available',
                description: 'Buddhist-inspired addiction recovery',
                services: ['meditation', 'mindfulness', 'group support'],
                coordinates: { lat: 47.6822, lng: -117.4397 },
                accessibility: ['wheelchair accessible'],
                requirements: ['open to all'],
                website: 'https://refugerecovery.org',
                rating: 4.4,
                reviews: 19
            },
            {
                id: 'support-7',
                name: 'Women for Sobriety',
                category: 'support',
                subcategory: 'women',
                address: '1700 W. 7th Ave, Suite 100, Spokane, WA 99204',
                phone: '(509) 456-7627',
                hours: 'Wednesdays 6:00 PM',
                availability: 'available',
                description: 'Recovery support group specifically for women',
                services: ['women-only meetings', 'empowerment focus', 'life skills'],
                coordinates: { lat: 47.6462, lng: -117.4457 },
                accessibility: ['wheelchair accessible'],
                requirements: ['women only'],
                website: 'https://womenforsobriety.org',
                rating: 4.5,
                reviews: 24
            },
            {
                id: 'support-8',
                name: 'Secular Organizations for Sobriety (SOS)',
                category: 'support',
                subcategory: 'secular',
                address: '1504 W. Grace Ave, Spokane, WA 99205',
                phone: '(509) 456-7627',
                hours: 'Mondays 6:00 PM',
                availability: 'available',
                description: 'Secular approach to addiction recovery',
                services: ['secular meetings', 'self-empowerment', 'group support'],
                coordinates: { lat: 47.6822, lng: -117.4397 },
                accessibility: ['wheelchair accessible'],
                requirements: ['open to all'],
                website: 'https://secularsobriety.org',
                rating: 4.3,
                reviews: 16
            },

            // Medical & Mental Health
            {
                id: 'medical-1',
                name: 'Providence Sacred Heart Medical Center',
                category: 'medical',
                subcategory: 'hospital',
                address: '101 W 8th Ave, Spokane, WA 99204',
                phone: '(509) 474-3131',
                hours: '24/7',
                availability: 'available',
                description: 'Full-service hospital with mental health services',
                services: ['emergency care', 'mental health', 'addiction medicine'],
                coordinates: { lat: 47.6486, lng: -117.4116 },
                accessibility: ['wheelchair accessible', 'ADA compliant'],
                requirements: ['insurance or payment plan'],
                website: 'https://providence.org',
                rating: 4.5,
                reviews: 156
            },
            {
                id: 'medical-2',
                name: 'MultiCare Deaconess Hospital',
                category: 'medical',
                subcategory: 'hospital',
                address: '800 W 5th Ave, Spokane, WA 99204',
                phone: '(509) 473-5800',
                hours: '24/7',
                availability: 'available',
                description: 'Hospital with behavioral health services',
                services: ['emergency care', 'mental health', 'addiction treatment'],
                coordinates: { lat: 47.6512, lng: -117.4262 },
                accessibility: ['wheelchair accessible', 'ADA compliant'],
                requirements: ['insurance or payment plan'],
                website: 'https://multicare.org',
                rating: 4.3,
                reviews: 89
            },
            {
                id: 'medical-3',
                name: 'Spokane Mental Health',
                category: 'medical',
                subcategory: 'mental health',
                address: '628 S Cowley St, Spokane, WA 99202',
                phone: '(509) 456-7627',
                hours: 'Mon-Fri 8:00 AM - 6:00 PM',
                availability: 'available',
                description: 'Comprehensive mental health services',
                services: ['individual therapy', 'group therapy', 'medication management', 'crisis intervention'],
                coordinates: { lat: 47.6482, lng: -117.4047 },
                accessibility: ['wheelchair accessible', 'ADA compliant'],
                requirements: ['assessment required', 'insurance or sliding scale'],
                website: 'https://spokanehealth.org',
                rating: 4.4,
                reviews: 73
            },
            {
                id: 'medical-4',
                name: 'Spokane Valley Mental Health',
                category: 'medical',
                subcategory: 'mental health',
                address: '10814 E Broadway Ave, Spokane Valley, WA 99206',
                phone: '(509) 456-7627',
                hours: 'Mon-Fri 8:00 AM - 6:00 PM',
                availability: 'available',
                description: 'Mental health services in Spokane Valley',
                services: ['individual therapy', 'group therapy', 'medication management', 'crisis intervention'],
                coordinates: { lat: 47.6734, lng: -117.2398 },
                accessibility: ['wheelchair accessible'],
                requirements: ['assessment required', 'insurance or sliding scale'],
                website: '',
                rating: 4.2,
                reviews: 41
            },
            {
                id: 'medical-5',
                name: 'Spokane Addiction Medicine Clinic',
                category: 'medical',
                subcategory: 'addiction medicine',
                address: '628 S Cowley St, Spokane, WA 99202',
                phone: '(509) 456-7627',
                hours: 'Mon-Fri 8:00 AM - 6:00 PM',
                availability: 'available',
                description: 'Specialized addiction medicine services',
                services: ['medication-assisted treatment', 'individual therapy', 'group therapy', 'case management'],
                coordinates: { lat: 47.6482, lng: -117.4047 },
                accessibility: ['wheelchair accessible', 'ADA compliant'],
                requirements: ['assessment required', 'insurance or sliding scale'],
                website: 'https://spokanehealth.org',
                rating: 4.6,
                reviews: 52
            },
            {
                id: 'medical-6',
                name: 'Spokane Crisis Response Unit',
                category: 'medical',
                subcategory: 'crisis',
                address: '628 S Cowley St, Spokane, WA 99202',
                phone: '(509) 456-7627',
                hours: '24/7',
                availability: 'available',
                description: '24/7 crisis intervention and mental health support',
                services: ['crisis intervention', 'mental health assessment', 'referral services', 'mobile crisis team'],
                coordinates: { lat: 47.6482, lng: -117.4047 },
                accessibility: ['wheelchair accessible', 'ADA compliant'],
                requirements: ['crisis situation'],
                website: 'https://spokanehealth.org',
                rating: 4.7,
                reviews: 38
            },

            // Employment & Skills Training
            {
                id: 'employment-1',
                name: 'Spokane Workforce Development',
                category: 'employment',
                subcategory: 'job training',
                address: '130 S Arthur St, Spokane, WA 99202',
                phone: '(509) 456-7627',
                hours: 'Mon-Fri 8:00 AM - 5:00 PM',
                availability: 'available',
                description: 'Job training and employment services',
                services: ['job training', 'resume building', 'job placement', 'career counseling'],
                coordinates: { lat: 47.6582, lng: -117.4047 },
                accessibility: ['wheelchair accessible'],
                requirements: ['photo ID', 'proof of address'],
                website: 'https://spokaneworkforce.org',
                rating: 4.3,
                reviews: 29
            },
            {
                id: 'employment-2',
                name: 'Goodwill Industries',
                category: 'employment',
                subcategory: 'job training',
                address: '1304 N Division St, Spokane, WA 99202',
                phone: '(509) 456-7627',
                hours: 'Mon-Fri 8:00 AM - 5:00 PM',
                availability: 'available',
                description: 'Job training and employment services for people with barriers',
                services: ['job training', 'job placement', 'skills assessment', 'support services'],
                coordinates: { lat: 47.6582, lng: -117.4047 },
                accessibility: ['wheelchair accessible'],
                requirements: ['photo ID'],
                website: 'https://goodwill.org',
                rating: 4.1,
                reviews: 22
            },
            {
                id: 'employment-3',
                name: 'Spokane Valley Job Training Center',
                category: 'employment',
                subcategory: 'job training',
                address: '10814 E Broadway Ave, Spokane Valley, WA 99206',
                phone: '(509) 456-7627',
                hours: 'Mon-Fri 8:00 AM - 5:00 PM',
                availability: 'available',
                description: 'Job training and employment services in Spokane Valley',
                services: ['job training', 'resume building', 'job placement', 'career counseling'],
                coordinates: { lat: 47.6734, lng: -117.2398 },
                accessibility: ['wheelchair accessible'],
                requirements: ['photo ID', 'proof of address'],
                website: '',
                rating: 4.0,
                reviews: 18
            },

            // Legal & Advocacy
            {
                id: 'legal-1',
                name: 'Spokane County Public Defender',
                category: 'legal',
                subcategory: 'public defender',
                address: '1116 W Broadway Ave, Spokane, WA 99201',
                phone: '(509) 456-7627',
                hours: 'Mon-Fri 8:00 AM - 5:00 PM',
                availability: 'available',
                description: 'Free legal representation for criminal cases',
                services: ['criminal defense', 'legal advice', 'court representation'],
                coordinates: { lat: 47.6582, lng: -117.4047 },
                accessibility: ['wheelchair accessible'],
                requirements: ['income eligibility', 'criminal case'],
                website: 'https://spokanecounty.org',
                rating: 4.2,
                reviews: 31
            },
            {
                id: 'legal-2',
                name: 'Northwest Justice Project',
                category: 'legal',
                subcategory: 'civil legal aid',
                address: '130 S Arthur St, Spokane, WA 99202',
                phone: '(509) 456-7627',
                hours: 'Mon-Fri 8:00 AM - 5:00 PM',
                availability: 'available',
                description: 'Free civil legal services for low-income individuals',
                services: ['civil legal aid', 'housing issues', 'family law', 'public benefits'],
                coordinates: { lat: 47.6582, lng: -117.4047 },
                accessibility: ['wheelchair accessible'],
                requirements: ['income eligibility'],
                website: 'https://nwjustice.org',
                rating: 4.4,
                reviews: 27
            },
            {
                id: 'legal-3',
                name: 'Spokane County Bar Association',
                category: 'legal',
                subcategory: 'referral service',
                address: '1116 W Broadway Ave, Spokane, WA 99201',
                phone: '(509) 456-7627',
                hours: 'Mon-Fri 8:00 AM - 5:00 PM',
                availability: 'available',
                description: 'Attorney referral service',
                services: ['attorney referrals', 'legal information', 'pro bono services'],
                coordinates: { lat: 47.6582, lng: -117.4047 },
                accessibility: ['wheelchair accessible'],
                requirements: ['none'],
                website: 'https://spokanebar.org',
                rating: 4.1,
                reviews: 19
            },

            // Transportation
            {
                id: 'transportation-1',
                name: 'Spokane Transit Authority (STA)',
                category: 'transportation',
                subcategory: 'public transit',
                address: '1230 W Boone Ave, Spokane, WA 99201',
                phone: '(509) 456-7627',
                hours: 'Various routes and schedules',
                availability: 'available',
                description: 'Public transportation throughout Spokane County',
                services: ['bus service', 'paratransit', 'route planning', 'fare assistance'],
                coordinates: { lat: 47.6582, lng: -117.4047 },
                accessibility: ['wheelchair accessible'],
                requirements: ['fare payment'],
                website: 'https://spokanetransit.com',
                rating: 4.0,
                reviews: 156
            },
            {
                id: 'transportation-2',
                name: 'Spokane Valley Transit',
                category: 'transportation',
                subcategory: 'public transit',
                address: '10814 E Broadway Ave, Spokane Valley, WA 99206',
                phone: '(509) 456-7627',
                hours: 'Various routes and schedules',
                availability: 'available',
                description: 'Public transportation in Spokane Valley',
                services: ['bus service', 'paratransit', 'route planning', 'fare assistance'],
                coordinates: { lat: 47.6734, lng: -117.2398 },
                accessibility: ['wheelchair accessible'],
                requirements: ['fare payment'],
                website: 'https://svt.org',
                rating: 3.9,
                reviews: 89
            },
            {
                id: 'community-1',
                name: 'Mighty To Save Ministries',
                category: 'community',
                subcategory: 'faith-based',
                address: '', // Address unknown, can be updated later
                phone: '', // Phone unknown, can be updated later
                hours: '', // Hours unknown, can be updated later
                availability: 'available',
                description: 'Faith-based community organization offering support, resources, and outreach for recovery and life transformation.',
                services: ['spiritual support', 'community outreach', 'recovery resources'],
                coordinates: null, // Unknown
                accessibility: [], // Unknown
                requirements: [], // Unknown
                website: 'https://www.Mighty2Save.com',
                rating: null, // No rating yet
                reviews: 0
            }
        ];
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('resourceSearch');
        const searchButton = document.querySelector('.search-btn');
        
        console.log('Search input found:', searchInput);
        console.log('Search button found:', searchButton);
        
        if (searchInput) {
            // Handle input changes (real-time search)
            searchInput.addEventListener('input', (e) => {
                console.log('Search input changed:', e.target.value);
                this.currentFilters.search = e.target.value.toLowerCase();
                this.filterResources();
            });
            
            // Handle Enter key press
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    console.log('Enter pressed, searching for:', e.target.value);
                    this.currentFilters.search = e.target.value.toLowerCase();
                    this.filterResources();
                    this.scrollToResults();
                }
            });
        }
        
        // Handle search button click
        if (searchButton) {
            searchButton.addEventListener('click', () => {
                const searchValue = searchInput ? searchInput.value.toLowerCase() : '';
                console.log('Search button clicked, searching for:', searchValue);
                this.currentFilters.search = searchValue;
                this.filterResources();
                this.scrollToResults();
            });
        }
        
        // Add clear search functionality
        this.setupClearSearch();

        // Category filter
        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                this.currentFilters.category = e.target.value;
                this.filterResources();
            });
        }

        // Location filter
        const locationFilter = document.getElementById('locationFilter');
        if (locationFilter) {
            locationFilter.addEventListener('change', (e) => {
                this.currentFilters.location = e.target.value;
                this.filterResources();
            });
        }

        // Availability filter
        const availabilityFilter = document.getElementById('availabilityFilter');
        if (availabilityFilter) {
            availabilityFilter.addEventListener('change', (e) => {
                this.currentFilters.availability = e.target.value;
                this.filterResources();
            });
        }

        // Sort functionality
        const sortSelect = document.getElementById('sortResources');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.sortResources(e.target.value);
            });
        }
    }

    filterResources() {
        console.log('Filtering resources with:', this.currentFilters);
        this.filteredResources = this.resources.filter(resource => {
            // Search filter
            if (this.currentFilters.search && this.currentFilters.search.trim() !== '') {
                const searchTerm = this.currentFilters.search.trim();
                const searchableText = `${resource.name} ${resource.description} ${resource.services.join(' ')}`.toLowerCase();
                console.log('Checking resource:', resource.name, 'against search term:', searchTerm);
                if (!searchableText.includes(searchTerm)) {
                    return false;
                }
            }

            // Category filter
            if (this.currentFilters.category !== 'all' && resource.category !== this.currentFilters.category) {
                return false;
            }

            // Location filter (simplified - could be enhanced with actual location logic)
            if (this.currentFilters.location !== 'all') {
                // This would need more sophisticated location filtering
                return true;
            }

            // Availability filter
            if (this.currentFilters.availability !== 'all' && resource.availability !== this.currentFilters.availability) {
                return false;
            }

            return true;
        });

        this.renderResources();
    }

    sortResources(sortBy) {
        this.filteredResources.sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'rating':
                    return b.rating - a.rating;
                case 'distance':
                    // This would need user location to work properly
                    return 0;
                case 'relevance':
                    // Default sort - keep current order
                    return 0;
                default:
                    return 0;
            }
        });

        this.renderResources();
    }

    renderResources() {
        const container = document.getElementById('resourceResults');
        console.log('Rendering resources, container found:', container);
        console.log('Filtered resources count:', this.filteredResources.length);
        if (!container) return;

        if (this.filteredResources.length === 0) {
            container.innerHTML = `
                <div class="text-center py-5">
                    <i class="bi bi-search fs-1 text-muted mb-3"></i>
                    <h4 class="text-muted">No resources found</h4>
                    <p class="text-muted">Try adjusting your search criteria or filters.</p>
                </div>
            `;
            return;
        }

        const resourcesHTML = this.filteredResources.map(resource => this.createResourceCard(resource)).join('');
        container.innerHTML = resourcesHTML;

        // Add event listeners to resource cards
        this.setupResourceCardListeners();
    }

    scrollToResults() {
        const resultsSection = document.getElementById('resourceDirectory');
        if (resultsSection) {
            // Smooth scroll to the results section
            resultsSection.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        }
    }

    createResourceCard(resource) {
        const ratingStars = this.generateRatingStars(resource.rating);
        const categoryIcon = this.getCategoryIcon(resource.category);
        const availabilityBadge = this.getAvailabilityBadge(resource.availability);

        return `
            <div class="col-lg-6 col-xl-4 mb-4" data-resource-id="${resource.id}">
                <div class="card h-100 resource-card" style="transition: transform 0.2s;">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-3">
                            <div class="d-flex align-items-center">
                                <i class="bi ${categoryIcon} fs-4 text-primary me-2"></i>
                                <h5 class="card-title mb-0">${resource.name}</h5>
                            </div>
                            ${availabilityBadge}
                        </div>
                        
                        <p class="card-text text-muted small mb-2">
                            <i class="bi bi-geo-alt me-1"></i>${resource.address}
                        </p>
                        
                        <p class="card-text">${resource.description}</p>
                        
                        <div class="mb-3">
                            <strong>Services:</strong>
                            <div class="mt-1">
                                ${resource.services.map(service => 
                                    `<span class="badge bg-light text-dark me-1 mb-1">${service}</span>`
                                ).join('')}
                            </div>
                        </div>
                        
                        <div class="row mb-3">
                            <div class="col-6">
                                <small class="text-muted">
                                    <i class="bi bi-clock me-1"></i>${resource.hours}
                                </small>
                            </div>
                            <div class="col-6 text-end">
                                <small class="text-muted">
                                    <i class="bi bi-star-fill text-warning me-1"></i>${resource.rating} (${resource.reviews})
                                </small>
                            </div>
                        </div>
                        
                        <div class="d-flex justify-content-between align-items-center">
                            <button class="btn btn-sm btn-outline-primary resource-details-btn" 
                                    data-resource-id="${resource.id}">
                                <i class="bi bi-info-circle me-1"></i>Details
                            </button>
                            <div class="d-flex gap-1">
                                <button class="btn btn-sm btn-outline-warning feedback-btn" 
                                        data-resource-id="${resource.id}">
                                    <i class="bi bi-star me-1"></i>Rate
                                </button>
                                ${resource.phone ? `
                                    <a href="tel:${resource.phone}" class="btn btn-sm btn-success">
                                        <i class="bi bi-telephone me-1"></i>Call
                                    </a>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    generateRatingStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

        let stars = '';
        for (let i = 0; i < fullStars; i++) {
            stars += '<i class="bi bi-star-fill text-warning"></i>';
        }
        if (hasHalfStar) {
            stars += '<i class="bi bi-star-half text-warning"></i>';
        }
        for (let i = 0; i < emptyStars; i++) {
            stars += '<i class="bi bi-star text-muted"></i>';
        }
        return stars;
    }

    getCategoryIcon(category) {
        const icons = {
            'shelter': 'bi-house-door',
            'food': 'bi-bag-heart',
            'treatment': 'bi-capsule',
            'support': 'bi-people-fill',
            'medical': 'bi-heart-pulse',
            'employment': 'bi-briefcase',
            'legal': 'bi-shield-check',
            'transportation': 'bi-bus-front',
            'community': 'bi-people' // Added for Mighty To Save Ministries
        };
        return icons[category] || 'bi-question-circle';
    }

    getAvailabilityBadge(availability) {
        const badges = {
            'available': '<span class="badge bg-success">Available</span>',
            'limited': '<span class="badge bg-warning">Limited</span>',
            'full': '<span class="badge bg-danger">Full</span>',
            'closed': '<span class="badge bg-secondary">Closed</span>'
        };
        return badges[availability] || '<span class="badge bg-secondary">Unknown</span>';
    }

    setupResourceCardListeners() {
        // Add hover effects
        const cards = document.querySelectorAll('.resource-card');
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-5px)';
            });
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0)';
            });
        });

        // Add details button listeners
        const detailButtons = document.querySelectorAll('.resource-details-btn');
        detailButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const resourceId = e.target.closest('.resource-details-btn').dataset.resourceId;
                this.showResourceDetails(resourceId);
            });
        });
    }

    setupClearSearch() {
        // Add clear search button after search results
        const resultsContainer = document.getElementById('resourceResults');
        if (resultsContainer) {
            const clearButton = document.createElement('button');
            clearButton.className = 'btn btn-outline-secondary btn-sm ms-2';
            clearButton.innerHTML = '<i class="bi bi-x-circle me-1"></i>Clear Search';
            clearButton.addEventListener('click', () => {
                this.currentFilters.search = '';
                const searchInput = document.getElementById('resourceSearch');
                if (searchInput) {
                    searchInput.value = '';
                }
                this.filterResources();
            });
            
            // Add clear button to search area
            const searchContainer = document.querySelector('.input-group');
            if (searchContainer) {
                searchContainer.appendChild(clearButton);
            }
        }
    }

    showResourceDetails(resourceId) {
        const resource = this.resources.find(r => r.id === resourceId);
        if (!resource) return;

        // Create modal content
        const modalContent = `
            <div class="modal fade" id="resourceModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">
                                <i class="bi ${this.getCategoryIcon(resource.category)} me-2"></i>
                                ${resource.name}
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row">
                                <div class="col-md-8">
                                    <h6>Description</h6>
                                    <p>${resource.description}</p>
                                    
                                    <h6>Services</h6>
                                    <div class="mb-3">
                                        ${resource.services.map(service => 
                                            `<span class="badge bg-primary me-1 mb-1">${service}</span>`
                                        ).join('')}
                                    </div>
                                    
                                    <h6>Requirements</h6>
                                    <p>${resource.requirements.join(', ')}</p>
                                    
                                    <h6>Accessibility</h6>
                                    <p>${resource.accessibility.join(', ')}</p>
                                </div>
                                <div class="col-md-4">
                                    <div class="card">
                                        <div class="card-body">
                                            <h6>Contact Information</h6>
                                            <p><i class="bi bi-geo-alt me-2"></i>${resource.address}</p>
                                            ${resource.phone ? `<p><i class="bi bi-telephone me-2"></i>${resource.phone}</p>` : ''}
                                            ${resource.website ? `<p><i class="bi bi-globe me-2"></i><a href="${resource.website}" target="_blank">Website</a></p>` : ''}
                                            <p><i class="bi bi-clock me-2"></i>${resource.hours}</p>
                                            
                                            <hr>
                                            
                                            <h6>Rating</h6>
                                            <div class="mb-2">${this.generateRatingStars(resource.rating)}</div>
                                            <small class="text-muted">${resource.rating}/5 (${resource.reviews} reviews)</small>
                                            
                                            <hr>
                                            
                                            <div class="d-grid gap-2">
                                                ${resource.phone ? `<a href="tel:${resource.phone}" class="btn btn-success"><i class="bi bi-telephone me-2"></i>Call Now</a>` : ''}
                                                ${resource.website ? `<a href="${resource.website}" target="_blank" class="btn btn-outline-primary"><i class="bi bi-globe me-2"></i>Visit Website</a>` : ''}
                                                <button class="btn btn-outline-secondary" onclick="showDirections('${resource.coordinates.lat}', '${resource.coordinates.lng}')">
                                                    <i class="bi bi-map me-2"></i>Get Directions
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Remove existing modal if present
        const existingModal = document.getElementById('resourceModal');
        if (existingModal) {
            existingModal.remove();
        }

        // Add new modal to page
        document.body.insertAdjacentHTML('beforeend', modalContent);

        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('resourceModal'));
        modal.show();
    }
}

// Global function for directions
function showDirections(lat, lng) {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, '_blank');
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('resourceDirectory')) {
        new ResourceDirectory();
    }
}); 