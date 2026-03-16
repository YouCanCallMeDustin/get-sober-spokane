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
        console.log('ResourceDirectory: Starting initialization...');
        this.loadResources();
        
        // Populate filteredResources initially with all resources
        this.filteredResources = [...this.resources];
        console.log(`ResourceDirectory: ${this.resources.length} resources loaded.`);
        
        this.setupEventListeners();

        // Check for specific resource ID in the URL (used by global search)
        const urlParams = new URLSearchParams(window.location.search);
        const resourceId = urlParams.get('id');
        
        if (resourceId) {
            console.log('ResourceDirectory: Targeting specific ID:', resourceId);
            // Case-insensitive ID search
            const found = this.resources.filter(resource => 
                resource.id && resource.id.toLowerCase() === resourceId.toLowerCase()
            );
            
            console.log('ResourceDirectory: Matching resources found:', found.length);
            
            if (found.length > 0) {
                // We've found the specific resource the user clicked on
                this.filteredResources = found;
                
                // If there's a search input, update it with the resource name to contextually show what we found
                const searchInput = document.getElementById('resourceSearch');
                if (searchInput) {
                    searchInput.value = found[0].name;
                    this.currentFilters.search = found[0].name.toLowerCase();
                }
                
                // Show modal details after a delay to ensure DOM is ready
                setTimeout(() => {
                    console.log('ResourceDirectory: Auto-showing details for:', found[0].id);
                    this.showResourceDetails(found[0].id);
                }, 800);
            } else {
                console.warn('ResourceDirectory: No resource found with ID:', resourceId);
            }
        }

        this.renderResources();
        console.log('ResourceDirectory: Initialization complete.');
    }

    loadResources() {
        // Comprehensive resource database
        this.resources = [
            // Shelters
            {
                id: 'shelter-1',
                name: 'Crosswalk Youth Shelter (Volunteers of America)',
                category: 'shelter',
                subcategory: 'youth',
                address: '525 W 2nd Ave, Spokane, WA 99201',
                phone: '(509) 688-1112',
                hours: '24/7',
                availability: 'available',
                description: 'Licensed emergency shelter for runaway and homeless youth. Provides a safe environment, meals, clothing, and on-site education support. Focuses on crisis stabilization and family reunification when possible.',
                services: ['emergency shelter (ages 13-18)', 'case management', 'on-site school', 'medical clinic access', 'meals'],
                coordinates: { lat: 47.6581, lng: -117.4180 },
                accessibility: ['wheelchair accessible', 'ADA compliant'],
                requirements: ['youth ages 13-18', 'runaway or homeless status'],
                website: 'https://voaspokane.org/crosswalk',
                rating: 4.6,
                reviews: 18
            },
            {
                id: 'shelter-2',
                name: 'House of Charity (Catholic Charities)',
                category: 'shelter',
                subcategory: 'adult',
                address: '32 W Pacific Ave, Spokane, WA 99201',
                phone: '(509) 624-7821',
                hours: '24/7',
                availability: 'available',
                description: 'Emergency shelter for men experiencing homelessness. Offers low-barrier sleeping arrangements, meals, showers, and laundry. Connects clients with wrap-around social services and housing stability programs.',
                services: ['emergency shelter (men 18+)', 'meals', 'showers', 'laundry', 'behavioral health'],
                coordinates: { lat: 47.6537, lng: -117.4112 },
                accessibility: ['wheelchair accessible'],
                requirements: ['men 18+', 'low-barrier'],
                website: 'https://catholiccharitiescw.org',
                rating: 4.2,
                reviews: 14
            },
            {
                id: 'shelter-3',
                name: "Hope House Women's Shelter (Volunteers of America)",
                category: 'shelter',
                subcategory: 'women',
                address: '318 S Adams St, Spokane, WA 99201',
                phone: '(509) 455-2886',
                hours: '24/7',
                availability: 'available',
                description: 'Safe haven for women experiencing homelessness. Provides emergency shelter beds and permanent supportive housing. Focuses on providing a secure environment with dignity and respect.',
                services: ['emergency shelter (women 18+)', 'permanent supportive housing', 'case management', 'hygiene items'],
                coordinates: { lat: 47.6542, lng: -117.4267 },
                accessibility: ['wheelchair accessible', 'secure entry'],
                requirements: ['women 18+', 'photo ID (if available)'],
                website: 'https://voaspokane.org/hope-house',
                rating: 4.7,
                reviews: 22
            },
            {
                id: 'shelter-4',
                name: 'Union Gospel Mission – Men\'s Crisis Shelter',
                category: 'shelter',
                subcategory: 'adult',
                address: '1224 E Trent Ave, Spokane, WA 99202',
                phone: '(509) 535-8510',
                hours: '24/7 (Check-in by 6:00 PM)',
                availability: 'available',
                description: 'Providing rescue and recovery for men in need. Includes clean beds, hot meals, showers, and clothing. Offers a gateway to long-term addiction recovery and life transformation programs.',
                services: ['emergency shelter (men)', 'hot meals', 'recovery program entry', 'job training', 'spiritual support'],
                coordinates: { lat: 47.6589, lng: -117.3932 },
                accessibility: ['wheelchair accessible'],
                requirements: ['men only', 'sobriety on-site'],
                website: 'https://uniongospelmission.org',
                rating: 4.4,
                reviews: 31
            },
            {
                id: 'ministry-1',
                name: 'Mighty to Save Ministries',
                category: 'ministry',
                subcategory: 'christian',
                address: '901 E Best Ave, Coeur d\'Alene, ID 83814',
                phone: '+1 (208) 929-2054',
                hours: 'By appointment',
                availability: 'available',
                description: 'Christian ministry focused on reaching the lost and brokenhearted, and those growing in addiction. We desire to be a front-line ministry reaching the lost and brokenhearted, and those growing in addiction. We will hold firm to the faith, knowing that our God is mighty to save!',
                services: ['spiritual counseling', 'addiction support', 'street ministry', 'evangelical outreach', 'recovery support'],
                coordinates: { lat: 47.6777, lng: -116.7805 },
                accessibility: ['wheelchair accessible'],
                requirements: ['open to all'],
                website: 'https://mighty2save.com',
                email: 'mightytosaveministries01@gmail.com',
                rating: 4.8,
                reviews: 5,
                mission: 'To be United together with Christ, to bring the good news, that God is mighty to save.',
                focus: 'We desire to go where the Lord appoints us and be willing to stand at that ordained time and place to be a light to the people on the streets of our communities.',
                scripture: 'Isaiah 61:1, Matthew 5:14'
            },
            {
                id: 'ministry-2',
                name: 'Soul Patrol Ministry – Spokane',
                category: 'ministry',
                subcategory: 'christian',
                address: '3117 E Olympic Ave, Spokane, WA 99208',
                phone: 'Contact via website',
                hours: 'Sun 11:00 AM | Tue 6:30 PM | Fri 6:00 PM',
                availability: 'available',
                description: 'Comprised of people with shared experiences of substance abuse, rebellious living, and incarceration who now seek to share the Gospel and offer freedom from bondage. Hosts Celebrate Recovery and House of Recovery Church services.',
                services: ['celebrate recovery', 'Bible study', 'church services', 'fellowship', 'spiritual support'],
                coordinates: { lat: 47.6619, lng: -117.3678 },
                accessibility: ['wheelchair accessible'],
                requirements: ['open to all'],
                website: 'https://soulpatrolministry.com',
                rating: 4.7,
                reviews: 9
            },
            {
                id: 'ministry-3',
                name: 'JITA City Church – Substance Abuse Recovery',
                category: 'ministry',
                subcategory: 'christian',
                address: '1803 E Desmet Ave, Spokane, WA 99202',
                phone: '(509) 474-1424',
                hours: 'By appointment',
                availability: 'available',
                description: 'Faith-based substance abuse recovery program led by a licensed Substance Use Disorder Professional with lived experience. Emphasizes a "direction vs. perfection" approach and creates a safe space for transparency and spiritual healing.',
                services: ['substance abuse counseling', 'faith-based recovery', '12-step instruction', 'spiritual guidance'],
                coordinates: { lat: 47.6689, lng: -117.3927 },
                accessibility: ['wheelchair accessible'],
                requirements: ['open to all'],
                website: 'https://jitacitychurch.us',
                rating: 4.8,
                reviews: 11
            },
            {
                id: 'ministry-4',
                name: 'True Hope Church – Pure Desire Recovery Groups',
                category: 'ministry',
                subcategory: 'christian',
                address: '1316 N Lincoln St, Spokane, WA 99201',
                phone: '(509) 703-7420',
                hours: 'Mon–Thu 9:30 AM – 3:30 PM (office)',
                availability: 'available',
                description: 'Hosts Pure Desire recovery groups for men and women seeking healing from unwanted sexual behaviors and betrayal trauma. Weekly two-hour sessions over 8–10 months in small groups of 4–8 participants.',
                services: ['men\'s recovery groups', 'women\'s recovery groups', 'betrayal trauma healing', 'spiritual support', 'small group counseling'],
                coordinates: { lat: 47.6657, lng: -117.4197 },
                accessibility: ['wheelchair accessible'],
                requirements: ['registration required'],
                website: 'https://truehopechurch.org',
                rating: 4.7,
                reviews: 14
            },
            {
                id: 'ministry-5',
                name: 'Family of Faith Community Church – Celebrate Recovery',
                category: 'ministry',
                subcategory: 'christian',
                address: '1504 W Grace Ave, Spokane, WA 99205',
                phone: '(509) 325-0343',
                hours: 'Fridays 7:00 PM | Dinner at 5:30 PM',
                availability: 'available',
                description: 'Celebrate Recovery is a Christ-centered 12-step program for people recovering from various addictions, hurts, habits, and hang-ups. Weekly Friday meetings include dinner, large group worship, testimony sharing, and small group breakouts.',
                services: ['celebrate recovery', '12-step program', 'dinner', 'worship', 'small groups', 'mentorship'],
                coordinates: { lat: 47.6822, lng: -117.4397 },
                accessibility: ['wheelchair accessible'],
                requirements: ['open to all'],
                website: 'https://ffcc.us',
                rating: 4.8,
                reviews: 27
            },
            {
                id: 'ministry-6',
                name: 'Union Gospel Mission – LIFE Recovery Program',
                category: 'ministry',
                subcategory: 'christian',
                address: '1224 E Trent Ave, Spokane, WA 99202',
                phone: '(509) 535-8510',
                hours: '24/7',
                availability: 'available',
                description: 'The LIFE Recovery Program is an 18–24 month holistic, faith-based residential recovery program available free of charge. Addresses underlying thoughts, feelings, and beliefs driving destructive behaviors. Includes meals, medical care, counseling, Bible study, life skills, work therapy, and job training.',
                services: ['residential recovery', 'meals', 'medical care', 'case management', 'Bible study', 'job training', 'mentorship'],
                coordinates: { lat: 47.6589, lng: -117.3932 },
                accessibility: ['wheelchair accessible'],
                requirements: ['assessment required', 'men\'s and women\'s programs available', 'free of charge'],
                website: 'https://uniongospelmission.org',
                rating: 4.6,
                reviews: 38
            },
            {
                id: 'ministry-7',
                name: 'Teen Challenge Pacific Northwest – Spokane Men\'s Campus',
                category: 'ministry',
                subcategory: 'christian',
                address: '2400 N Craig Rd, Spokane, WA 99224',
                phone: '(509) 244-5610',
                hours: '24/7 residential program',
                availability: 'available',
                description: '12–15 month faith-based residential recovery program for men ages 18 and over. Provides Christ-centered treatment for life-controlling substance use disorders with counseling, education, and spiritual development.',
                services: ['residential treatment', 'faith-based counseling', 'life skills', 'education', 'spiritual development', 'aftercare'],
                coordinates: { lat: 47.6982, lng: -117.5019 },
                accessibility: ['wheelchair accessible'],
                requirements: ['men 18+', 'assessment required'],
                website: 'https://atcpacwest.com',
                rating: 4.5,
                reviews: 21
            },
            {
                id: 'ministry-8',
                name: 'Salvation Army Spokane – Celebrate Recovery',
                category: 'ministry',
                subcategory: 'christian',
                address: '222 E Indiana Ave, Spokane, WA 99207',
                phone: '(509) 325-6810',
                hours: 'Weekly meetings – call for schedule',
                availability: 'available',
                description: 'The Salvation Army Spokane hosts Celebrate Recovery meetings providing Christ-centered addiction recovery support. Also offers emergency assistance, spiritual care, and community programs for those in need.',
                services: ['celebrate recovery', 'emergency assistance', 'spiritual care', 'community programs', 'prayer support'],
                coordinates: { lat: 47.6785, lng: -117.4033 },
                accessibility: ['wheelchair accessible', 'ADA compliant'],
                requirements: ['open to all'],
                website: 'https://salvationarmynorthwest.org',
                rating: 4.4,
                reviews: 18
            },
            {
                id: 'ministry-9',
                name: 'Bethel Church of the Nazarene – Celebrate Recovery',
                category: 'ministry',
                subcategory: 'christian',
                address: '1111 S Thor St, Spokane, WA 99202',
                phone: '(509) 534-7751',
                hours: 'Call for current meeting schedule',
                availability: 'available',
                description: 'Bethel Church of the Nazarene hosts Celebrate Recovery, a Christ-centered 12-step program helping individuals overcome hurts, habits, and hang-ups through the power of Jesus Christ.',
                services: ['celebrate recovery', '12-step program', 'spiritual support', 'small groups', 'fellowship'],
                coordinates: { lat: 47.6435, lng: -117.4033 },
                accessibility: ['wheelchair accessible'],
                requirements: ['open to all'],
                website: 'https://bethelspokane.com',
                rating: 4.5,
                reviews: 12
            },
            {
                id: 'ministry-10',
                name: 'Healing Rooms Ministries – Spokane',
                category: 'ministry',
                subcategory: 'christian',
                address: '115 E Pacific Ave, Spokane, WA 99202',
                phone: '(509) 456-0517',
                hours: 'Thu & Sat 10:00 AM – 1:00 PM',
                availability: 'available',
                description: 'International healing ministry founded in Spokane offering prayer-based healing sessions for physical, emotional, and spiritual recovery. Open to anyone seeking healing through prayer and spiritual restoration.',
                services: ['healing prayer', 'spiritual counseling', 'emotional healing', 'community prayer', 'outreach'],
                coordinates: { lat: 47.6553, lng: -117.4042 },
                accessibility: ['wheelchair accessible'],
                requirements: ['open to all – no appointment needed during open hours'],
                website: 'https://healingrooms.com',
                rating: 4.6,
                reviews: 33
            },
            {
                id: 'ministry-11',
                name: 'Spokane LDS Addiction Recovery Program',
                category: 'ministry',
                subcategory: 'lds',
                address: '1620 E 29th Ave, Spokane, WA 99203',
                phone: 'Contact local ward',
                hours: 'Tuesdays 7:00 PM',
                availability: 'available',
                description: 'The Church of Jesus Christ of Latter-day Saints hosts weekly Addiction Recovery Program meetings at the Spokane Stake Center. A 12-step program grounded in gospel principles designed to help individuals and families overcome addiction.',
                services: ['12-step meetings', 'spiritual support', 'family support', 'recovery coaching', 'LDS gospel principles'],
                coordinates: { lat: 47.6382, lng: -117.3978 },
                accessibility: ['wheelchair accessible'],
                requirements: ['open to all'],
                website: 'https://addictionrecovery.churchofjesuschrist.org',
                rating: 4.5,
                reviews: 8
            },
            {
                id: 'ministry-12',
                name: 'River City Church – Celebrate Recovery',
                category: 'ministry',
                subcategory: 'christian',
                address: '708 W Nora Ave, Spokane, WA 99205',
                phone: '(509) 280-3149',
                hours: 'Wednesdays 6:30 PM',
                availability: 'available',
                description: 'River City Church hosts weekly Celebrate Recovery meetings, a Christian alternative to AA/NA that helps people dealing with addiction, codependency, and other life-controlling issues through Christ-centered community.',
                services: ['celebrate recovery', 'worship', 'small groups', 'testimony sharing', 'step study'],
                coordinates: { lat: 47.6897, lng: -117.4468 },
                accessibility: ['wheelchair accessible'],
                requirements: ['open to all'],
                website: 'https://rivercitychurch.com',
                rating: 4.6,
                reviews: 15
            },
            {
                id: 'ministry-13',
                name: 'Catholic Charities Spokane – Behavioral Health Services',
                category: 'ministry',
                subcategory: 'catholic',
                address: '1960 N Holy Names Court, 3rd Floor, Spokane, WA 99204',
                phone: '(509) 358-4256',
                hours: 'Mon–Fri 8:00 AM – 5:00 PM',
                availability: 'available',
                description: 'Catholic Charities provides substance use disorder treatment and behavioral health services rooted in Catholic social teaching. Serves individuals and families regardless of faith background.',
                services: ['substance use treatment', 'behavioral health', 'counseling', 'case management', 'spiritual support'],
                coordinates: { lat: 47.6697, lng: -117.4302 },
                accessibility: ['wheelchair accessible', 'ADA compliant'],
                requirements: ['open to all', 'insurance or sliding scale'],
                website: 'https://catholiccharitiescw.org',
                rating: 4.4,
                reviews: 22
            },
            {
                id: 'ministry-14',
                name: 'Spokane Lighthouse Church – Recovery Support',
                category: 'ministry',
                subcategory: 'christian',
                address: '127 E Mission Ave, Spokane, WA 99202',
                phone: '(509) 866-1291',
                hours: 'Call for service times',
                availability: 'available',
                description: 'Spokane Lighthouse Church offers faith-based community support, prayer, and mentorship for individuals in recovery. Committed to connecting those struggling with addiction to spiritual community and practical help.',
                services: ['prayer support', 'spiritual mentorship', 'community outreach', 'fellowship', 'recovery support'],
                coordinates: { lat: 47.6702, lng: -117.3951 },
                accessibility: ['wheelchair accessible'],
                requirements: ['open to all'],
                website: 'https://spokanelighthousechurch.com',
                rating: 4.5,
                reviews: 10
            },
            {
                id: 'ministry-15',
                name: 'City Covenant Church – Community Recovery Ministry',
                category: 'ministry',
                subcategory: 'christian',
                address: '512 S Bernard St, Spokane, WA 99204',
                phone: '(509) 309-0239',
                hours: 'Call for service and group times',
                availability: 'available',
                description: 'City Covenant Church is a gospel-centered community in downtown Spokane offering outreach and support for those struggling with addiction and life challenges. Committed to holistic care for the whole person.',
                services: ['community outreach', 'prayer', 'support groups', 'spiritual care', 'fellowship'],
                coordinates: { lat: 47.6453, lng: -117.4152 },
                accessibility: ['wheelchair accessible'],
                requirements: ['open to all'],
                website: 'https://citycovenant.org',
                rating: 4.4,
                reviews: 9
            },
            {
                id: 'ministry-16',
                name: 'New Horizons / Isabella House – Women\'s Recovery Ministry',
                category: 'ministry',
                subcategory: 'christian',
                address: '2308 W 3rd Ave, Spokane, WA 99201',
                phone: '(509) 624-1244',
                hours: '24/7 residential program',
                availability: 'limited',
                description: '180-day long-term residential substance abuse treatment program for women ages 18+ who are pregnant or parenting a child under six. Therapeutic childcare provided on-site. Faith-informed holistic recovery approach.',
                services: ['residential treatment', 'therapeutic childcare', 'counseling', 'case management', 'spiritual support', 'parenting skills'],
                coordinates: { lat: 47.6535, lng: -117.4439 },
                accessibility: ['wheelchair accessible'],
                requirements: ['women 18+', 'pregnant or parenting child under 6', 'assessment required'],
                website: '',
                rating: 4.6,
                reviews: 13
            },
            {
                id: 'ministry-17',
                name: 'Mosaic Church Spokane – Addiction & Community Ministry',
                category: 'ministry',
                subcategory: 'christian',
                address: '121 S Wall St, Spokane, WA 99201',
                phone: '(509) 624-9120',
                hours: 'Sun services – call for recovery group times',
                availability: 'available',
                description: 'Downtown Spokane church actively helping people address issues like addiction and homelessness through community-centered ministries. Partners with faith and social service organizations to provide a holistic recovery environment.',
                services: ['community outreach', 'recovery support', 'prayer', 'homelessness ministry', 'counseling referrals'],
                coordinates: { lat: 47.6574, lng: -117.4222 },
                accessibility: ['wheelchair accessible'],
                requirements: ['open to all'],
                website: 'https://mosaicspokane.com',
                rating: 4.5,
                reviews: 16
            },
            {
                id: 'ministry-18',
                name: 'Spokane Rescue Mission – Discipleship Recovery',
                category: 'ministry',
                subcategory: 'christian',
                address: '147 S Jefferson St, Spokane, WA 99201',
                phone: '(509) 838-1522',
                hours: '24/7',
                availability: 'available',
                description: 'Spokane Rescue Mission provides emergency shelter combined with a Christ-centered discipleship program for men and women working through addiction and homelessness. Offered free of charge with long-term life transformation focus.',
                services: ['discipleship program', 'emergency shelter', 'meals', 'addiction recovery', 'job skills', 'spiritual mentoring'],
                coordinates: { lat: 47.6568, lng: -117.4242 },
                accessibility: ['wheelchair accessible'],
                requirements: ['open to all in need'],
                website: 'https://spokanerescuemission.org',
                rating: 4.7,
                reviews: 44
            },
            {
                id: 'ministry-19',
                name: 'Open Arms Perinatal Services – Faith-Informed Support',
                category: 'ministry',
                subcategory: 'christian',
                address: '1200 N Ash St, Spokane, WA 99201',
                phone: '(509) 747-1217',
                hours: 'Mon–Fri 9:00 AM – 5:00 PM',
                availability: 'available',
                description: 'Provides culturally sensitive doula services, childbirth education, and recovery support for pregnant women and new mothers struggling with substance use. Partners with faith communities to offer holistic, compassionate care.',
                services: ['doula services', 'childbirth education', 'recovery support', 'home visits', 'parenting classes', 'spiritual care'],
                coordinates: { lat: 47.6642, lng: -117.4262 },
                accessibility: ['wheelchair accessible'],
                requirements: ['pregnant or postpartum women in recovery'],
                website: 'https://openarmswa.org',
                rating: 4.8,
                reviews: 19
            },
            {
                id: 'ministry-20',
                name: 'Volunteers of America – Turning Point Recovery Ministry',
                category: 'ministry',
                subcategory: 'christian',
                address: '525 W 2nd Ave, Spokane, WA 99201',
                phone: '(509) 624-2378',
                hours: '24/7 residential | Office Mon–Fri 8 AM–5 PM',
                availability: 'available',
                description: 'Faith-informed residential recovery ministry for adults struggling with substance use disorders. Combines evidence-based treatment with spiritual development. Offers transitional housing and re-entry services for formerly incarcerated individuals.',
                services: ['residential recovery', 'transitional housing', 're-entry services', 'spiritual development', 'life skills', 'counseling'],
                coordinates: { lat: 47.6583, lng: -117.4195 },
                accessibility: ['wheelchair accessible', 'ADA compliant'],
                requirements: ['adult 18+', 'assessment required'],
                website: 'https://voaspokane.org',
                rating: 4.3,
                reviews: 26
            },
            {
                id: 'shelter-5',
                name: 'Catholic Charities St. Margaret\'s Shelter',
                category: 'shelter',
                subcategory: 'family',
                address: '101 E Hartson Ave, Spokane, WA 99202',
                phone: '(509) 624-9788',
                hours: '24/7',
                availability: 'limited',
                description: 'Emergency and transitional housing for mothers and children. Provides intensive case management to help families transition into permanent housing. Focuses on stability and child welfare.',
                services: ['family shelter', 'transitional housing (up to 2 years)', 'case management', 'childcare support'],
                coordinates: { lat: 47.6582, lng: -117.4047 },
                accessibility: ['wheelchair accessible'],
                requirements: ['mothers with children', 'no boys over 12', 'referral via Coordinated Entry'],
                website: 'https://catholiccharitiescw.org',
                rating: 4.6,
                reviews: 31
            },
            {
                id: 'shelter-6',
                name: 'Spokane Valley Partners – Housing Assistance',
                category: 'shelter',
                subcategory: 'family',
                address: '10814 E Broadway Ave, Spokane Valley, WA 99206',
                phone: '(509) 927-1153',
                hours: 'Mon-Fri 8:00 AM - 5:00 PM',
                availability: 'available',
                description: 'Assistance for Valley residents facing housing instability. Provides referrals to emergency shelters and transitional housing programs, along with immediate survival resources.',
                services: ['shelter referrals', 'emergency assistance', 'eviction prevention info', 'survival resources'],
                coordinates: { lat: 47.6734, lng: -117.2398 },
                accessibility: ['wheelchair accessible'],
                requirements: ['Spokane Valley residents preferred'],
                website: 'https://svpart.org',
                rating: 4.3,
                reviews: 19
            },
            {
                id: 'shelter-7',
                name: 'Family Promise of Spokane – Open Doors',
                category: 'shelter',
                subcategory: 'family',
                address: '2002 E Mission Ave, Spokane, WA 99202',
                phone: '(509) 723-4663',
                hours: '24/7',
                availability: 'available',
                description: '24/7 emergency shelter for families with children. Provides a stable environment, warm meals, and intensive case management focused on rapid re-housing and family unity.',
                services: ['emergency family shelter', 'day center services', 'housing search assistance', 'meals'],
                coordinates: { lat: 47.6735, lng: -117.3822 },
                accessibility: ['wheelchair accessible'],
                requirements: ['families with children'],
                website: 'https://familypromiseofspokane.org',
                rating: 4.8,
                reviews: 26
            },
            {
                id: 'shelter-8',
                name: 'Jewels Helping Hands – Housing Navigation',
                category: 'shelter',
                subcategory: 'adult',
                address: '527 S Cannon St, Spokane, WA 99201',
                phone: '(509) 507-4624',
                hours: '24/7',
                availability: 'available',
                description: 'Low-barrier housing navigation and emergency shelter coordinator. Provides hygiene services, medical connection, and shelter referrals for individuals experiencing homelessness.',
                services: ['shelter referrals', 'hygiene services', 'medical connection', 'housing navigation'],
                coordinates: { lat: 47.6515, lng: -117.4355 },
                accessibility: ['wheelchair accessible'],
                requirements: ['low-barrier'],
                website: 'https://facebook.com/jewelshelpinghands',
                rating: 4.5,
                reviews: 38
            },
            {
                id: 'shelter-9',
                name: 'Salvation Army – Family Emergency Shelter',
                category: 'shelter',
                subcategory: 'family',
                address: '55 W Mission Ave, Spokane, WA 99201',
                phone: '(509) 866-5476',
                hours: '24/7',
                availability: 'available',
                description: 'Emergency housing for families in crisis. Provides private rooms, meals, and support services to help families stay together while seeking permanent solutions.',
                services: ['emergency family shelter', 'meals', 'case management', 'spiritual care'],
                coordinates: { lat: 47.6735, lng: -117.4122 },
                accessibility: ['wheelchair accessible'],
                requirements: ['families (adults must have children)'],
                website: 'https://spokane.salvationarmy.org',
                rating: 4.4,
                reviews: 15
            },
            {
                id: 'shelter-10',
                name: 'UGM Crisis Shelter – Women & Children',
                category: 'shelter',
                subcategory: 'women',
                address: '1515 E Illinois Ave, Spokane, WA 99207',
                phone: '(509) 535-0486',
                hours: '24/7',
                availability: 'available',
                description: 'A place of safety and hope for women and children. Provides clean rooms, nutritious meals, and a supportive community for women overcoming trauma, addiction, or poverty.',
                services: ['crisis shelter (women)', 'children\'s programs', 'meals', 'recovery entry'],
                coordinates: { lat: 47.6765, lng: -117.3912 },
                accessibility: ['wheelchair accessible', 'secure perimeter'],
                requirements: ['women or mothers with children'],
                website: 'https://uniongospelmission.org',
                rating: 4.7,
                reviews: 29
            },
            {
                id: 'shelter-11',
                name: 'VOA Young Adult Shelter',
                category: 'shelter',
                subcategory: 'youth',
                address: '3104 E Augusta Ave, Spokane, WA 99207',
                phone: '(509) 990-0579',
                hours: '24/7',
                availability: 'available',
                description: 'Dedicated emergency shelter for young adults navigating homelessness. Offers a peer-support environment with case management and housing goals.',
                services: ['emergency shelter (ages 18-24)', 'case management', 'peer support', 'life skills training'],
                coordinates: { lat: 47.6765, lng: -117.3685 },
                accessibility: ['wheelchair accessible'],
                requirements: ['young adults ages 18-24'],
                website: 'https://voaspokane.org',
                rating: 4.6,
                reviews: 12
            },
            {
                id: 'shelter-12',
                name: 'YWCA – Alternatives to Domestic Violence',
                category: 'shelter',
                subcategory: 'women',
                address: 'Confidential Location',
                phone: '(509) 326-2255',
                hours: '24/7 Crisis Line',
                availability: 'available',
                description: 'Immediate crisis support and confidential shelter for survivors of domestic violence. Provides safety, legal advocacy, and trauma-informed care.',
                services: ['emergency DV shelter', '24-hour crisis line', 'legal advocacy', 'safety planning'],
                coordinates: null,
                accessibility: ['private and secure location'],
                requirements: ['survivors of domestic violence and their children'],
                website: 'https://ywcaspokane.org',
                rating: 4.9,
                reviews: 45
            },
            {
                id: 'shelter-13',
                name: 'Revive Reentry Services – Transitional Housing',
                category: 'shelter',
                subcategory: 're-entry',
                address: 'Multiple Locations',
                phone: '(509) 319-1068',
                hours: 'Intake: Mon-Fri 9:00 AM - 5:00 PM',
                availability: 'available',
                description: 'Supportive housing for individuals transitioning from incarceration. Provides a structured environment with accountability and resource connection for successful reintegration.',
                services: ['transitional housing', 're-entry support', 'justice-impacted advocacy', 'housing navigation'],
                coordinates: null,
                accessibility: ['shared housing model'],
                requirements: ['individuals with criminal records seeking housing'],
                website: 'https://revivespokane.com',
                rating: 4.5,
                reviews: 18
            },
            {
                id: 'shelter-14',
                name: 'Transitions – Transitional Living Center',
                category: 'shelter',
                subcategory: 'women',
                address: '3128 N Hemlock St, Spokane, WA 99205',
                phone: '(509) 325-5005',
                hours: 'Office hours listed for intake',
                availability: 'limited',
                description: 'Transitional housing for women and children in apartments for up to 24 months. Focuses on women fleeing domestic violence or exiting substance abuse/psychiatric treatment.',
                services: ['transitional housing', 'apartments for families', 'supportive services', 'community building'],
                coordinates: { lat: 47.6885, lng: -117.4355 },
                accessibility: ['wheelchair accessible apartments'],
                requirements: ['women with children', 'homeless status'],
                website: 'https://help4women.org',
                rating: 4.7,
                reviews: 21
            },
            {
                id: 'shelter-15',
                name: 'VOA Alexandria\'s House',
                category: 'shelter',
                subcategory: 'women',
                address: '2236 W Pacific Ave, Spokane, WA 99201',
                phone: '(509) 688-1112',
                hours: '24/7',
                availability: 'limited',
                description: 'Maternity group home for pregnant or parenting teens who are experiencing homelessness. Provides a nurturing environment and parenting education.',
                services: ['transitional housing', 'maternity support', 'parenting classes', 'educational support'],
                coordinates: { lat: 47.6535, lng: -117.4435 },
                accessibility: ['private residence style'],
                requirements: ['pregnant or parenting teens ages 16-18'],
                website: 'https://voaspokane.org',
                rating: 4.8,
                reviews: 9
            },
            {
                id: 'shelter-16',
                name: 'Donna Hansen Haven (Catholic Charities)',
                category: 'shelter',
                subcategory: 'permanent supportive',
                address: '811 E 2nd Ave, Spokane, WA 99202',
                phone: '(509) 456-2279',
                hours: 'Residential',
                availability: 'referral only',
                description: 'Permanent supportive housing for chronically homeless single adults. Provides stability and on-site support to help individuals maintain their housing.',
                services: ['permanent supportive housing', 'on-site case management', 'stable housing'],
                coordinates: { lat: 47.6555, lng: -117.4012 },
                accessibility: ['wheelchair accessible'],
                requirements: ['chronically homeless status', 'referral via Coordinated Entry'],
                website: 'https://catholiccharitiescw.org',
                rating: 4.4,
                reviews: 14
            },
            {
                id: 'shelter-17',
                name: 'SNAP Coordinated Entry – Single Adults',
                category: 'shelter',
                subcategory: 'discovery',
                address: '212 W 2nd Ave, Spokane, WA 99201',
                phone: '(509) 456-7627',
                hours: 'Mon-Fri 8:00 AM - 4:30 PM',
                availability: 'available',
                description: 'The primary entry point for single adults experiencing homelessness to access the shelter and housing system in Spokane County.',
                services: ['housing assessment', 'shelter referral', 'resource navigation', 'homeless services'],
                coordinates: { lat: 47.6552, lng: -117.4155 },
                accessibility: ['wheelchair accessible'],
                requirements: ['experiencing homelessness', 'single adult'],
                website: 'https://snapwa.org',
                rating: 4.3,
                reviews: 35
            },
            {
                id: 'shelter-18',
                name: 'Shelter Me Spokane – Resource Portal',
                category: 'shelter',
                subcategory: 'discovery',
                address: 'Online Resource',
                phone: 'N/A',
                hours: '24/7 Online',
                availability: 'available',
                description: 'Real-time portal showing bed availability at various emergency shelters across Spokane. A vital digital tool for those seeking immediate shelter.',
                services: ['real-time bed availability', 'shelter directory', 'crisis info'],
                coordinates: null,
                accessibility: ['mobile friendly website'],
                requirements: ['internet access'],
                website: 'https://sheltermespokane.org',
                rating: 4.9,
                reviews: 112
            },
            {
                id: 'shelter-19',
                name: 'My Sister\'s Cottage (Transitions)',
                category: 'shelter',
                subcategory: 'women',
                address: 'Confidential Location',
                phone: '(509) 328-6702',
                hours: 'Residential',
                availability: 'limited',
                description: 'A community of small homes for women who have experienced trauma, providing a healing environment with intensive support and shared community.',
                services: ['supportive housing', 'trauma-informed care', 'peer community', 'case management'],
                coordinates: null,
                accessibility: ['private and secure location'],
                requirements: ['women experiencing homelessness and trauma'],
                website: 'https://help4women.org',
                rating: 4.8,
                reviews: 16
            },
            {
                id: 'shelter-20',
                name: 'The Way Out Shelter (Salvation Army)',
                category: 'shelter',
                subcategory: 'adult',
                address: '55 W Mission Ave, Spokane, WA 99201',
                phone: '(509) 866-5476',
                hours: '24/7',
                availability: 'available',
                description: 'A referral-based emergency shelter focusing on connecting individuals with long-term housing solutions while providing a safe, clean place to stay.',
                services: ['emergency shelter', 'housing navigation', 'meals', 'resource connection'],
                coordinates: { lat: 47.6735, lng: -117.4125 },
                accessibility: ['wheelchair accessible'],
                requirements: ['referral typically required', 'men and women (separate areas)'],
                website: 'https://spokane.salvationarmy.org',
                rating: 4.6,
                reviews: 23
            },

            // Food Banks
            {
                id: 'food-1',
                name: 'Second Harvest Food Bank of the Inland Northwest',
                category: 'food',
                subcategory: 'food bank',
                address: '1234 E Front Ave, Spokane, WA 99202',
                phone: '(509) 534-6678',
                hours: 'Mon-Fri 8:00 AM - 4:00 PM',
                availability: 'available',
                description: 'The primary food distribution hub for the Inland Northwest. Supplies over 250 local food banks and meal sites. Offers mobile markets, nutrition education, and SNAP application assistance.',
                services: ['food distribution', 'nutrition education', 'SNAP assistance', 'mobile markets', 'Bite2Go'],
                coordinates: { lat: 47.6607, lng: -117.3932 },
                accessibility: ['wheelchair accessible', 'ADA compliant'],
                requirements: ['proof of income', 'photo ID'],
                website: 'https://2-harvest.org',
                rating: 4.8,
                reviews: 54
            },
            {
                id: 'food-2',
                name: 'Serve Spokane Food Pantry',
                category: 'food',
                subcategory: 'food bank',
                address: '8303 B, N Division St, Spokane, WA 99208',
                phone: '(509) 489-1133',
                hours: 'Thu 3:00 PM - 6:00 PM | 2nd & 4th Sat 9:00 AM - 12:00 PM',
                availability: 'available',
                description: 'A community-focused food bank providing grocery assistance, clothing, and household items to those in need in North Spokane.',
                services: ['food distribution', 'clothing bank', 'household items', 'resource referrals'],
                coordinates: { lat: 47.7292, lng: -117.4102 },
                accessibility: ['wheelchair accessible'],
                requirements: ['proof of address'],
                website: 'https://servespokane.org',
                rating: 4.5,
                reviews: 28
            },
            {
                id: 'food-3',
                name: 'Spokane Valley Partners – Food Bank',
                category: 'food',
                subcategory: 'food bank',
                address: '10814 E Broadway Ave, Spokane Valley, WA 99206',
                phone: '(509) 927-1153',
                hours: 'Mon-Fri 9:00 AM - 3:00 PM',
                availability: 'available',
                description: 'Dedicated food bank serving the Spokane Valley community. Part of a larger community center offering extensive social services and emergency support.',
                services: ['food distribution', 'mobile food bank', 'nutrition assistance', 'emergency social services'],
                coordinates: { lat: 47.6734, lng: -117.2398 },
                accessibility: ['wheelchair accessible', 'large parking lot'],
                requirements: ['proof of address', 'income verification'],
                website: 'https://svpart.org',
                rating: 4.4,
                reviews: 32
            },
            {
                id: 'food-4',
                name: 'North County Food Bank – Deer Park',
                category: 'food',
                subcategory: 'food bank',
                address: '109 E 3rd Ave, Deer Park, WA 99006',
                phone: '(509) 276-9811',
                hours: 'Mon-Fri 9:00 AM - 3:00 PM',
                availability: 'available',
                description: 'Serves the rural communities of northern Spokane County. Provides essential groceries, emergency food supplies, and holiday gift baskets.',
                services: ['food distribution', 'emergency food', 'holiday baskets', 'local referrals'],
                coordinates: { lat: 47.9674, lng: -117.4756 },
                accessibility: ['wheelchair accessible'],
                requirements: ['proof of address in North County'],
                website: '',
                rating: 4.1,
                reviews: 18
            },
            {
                id: 'food-5',
                name: 'The City Gate – Food & Clothing Bank',
                category: 'food',
                subcategory: 'food bank & meals',
                address: '170 S Madison St, Spokane, WA 99201',
                phone: '(509) 455-9670',
                hours: 'Tue-Fri 10:00 AM - 3:00 PM (Food Bank by appt)',
                availability: 'available',
                description: 'Downtown mission providing essential support. Offers a food bank, clothing bank, and hot meals. Serves zip codes 99201, 99204, and 99224.',
                services: ['food bank', 'clothing bank', 'hot meals (Wed/Fri/Sat 7PM)', 'spiritual support'],
                coordinates: { lat: 47.6565, lng: -117.4255 },
                accessibility: ['wheelchair accessible'],
                requirements: ['appointment needed for food/clothing', 'zip code restriction'],
                website: 'https://thecitygatespokane.org',
                rating: 4.7,
                reviews: 41
            },
            {
                id: 'food-6',
                name: 'Shalom Ministries – Dining with Dignity',
                category: 'food',
                subcategory: 'hot meals',
                address: '518 W 3rd Ave, Spokane, WA 99201',
                phone: '(509) 455-9019',
                hours: 'Breakfast Mon-Thu 7:30-8:30 | Lunch Mon-Thu 11:00-12:00',
                availability: 'available',
                description: 'Providing free, nutritious meals in a dignified environment downtown. No judgment, just good food and community connection.',
                services: ['free breakfast', 'free lunch', 'community dinner (Mon 4 & 5PM)', 'hospitality'],
                coordinates: { lat: 47.6535, lng: -117.4202 },
                accessibility: ['wheelchair accessible'],
                requirements: ['open to anyone hungry', 'no weapons/drugs/alcohol'],
                website: 'https://shalomministries.org',
                rating: 4.9,
                reviews: 35
            },
            {
                id: 'food-7',
                name: 'Better Living Center – Seventh-day Adventist',
                category: 'food',
                subcategory: 'food bank',
                address: '25 E North Foothills Dr, Spokane, WA 99207',
                phone: '(509) 325-1258',
                hours: 'Tue 9:00 AM - 4:00 PM | Thu 9:00 AM - 1:00 PM',
                availability: 'available',
                description: 'Community pantry serving North Foothills area. Focuses on providing healthy options and nutritional support to local families.',
                services: ['food distribution', 'dietary education', 'personal care items'],
                coordinates: { lat: 47.6835, lng: -117.4102 },
                accessibility: ['wheelchair accessible'],
                requirements: ['zip codes 99205, 99207, 99208'],
                website: '',
                rating: 4.6,
                reviews: 24
            },
            {
                id: 'food-8',
                name: 'American Indian Community Center Food Bank',
                category: 'food',
                subcategory: 'food bank',
                address: '610 E North Foothills Dr, Spokane, WA 99207',
                phone: '(509) 535-0886',
                hours: 'Wed-Fri 8:30-12:00 & 1:30-4:30 | Tue 1:30-4:30',
                availability: 'available',
                description: 'Culturally responsive food bank serving American Indian individuals and families, as well as general residents of zip code 99202.',
                services: ['food distribution', 'cultural support', 'social services', 'Native resources'],
                coordinates: { lat: 47.6835, lng: -117.4012 },
                accessibility: ['wheelchair accessible'],
                requirements: ['Native documentation OR zip code 99202'],
                website: 'https://aiccspokane.org',
                rating: 4.5,
                reviews: 22
            },
            {
                id: 'food-9',
                name: 'Our Place Community Outreach',
                category: 'food',
                subcategory: 'food bank',
                address: '1509 W College Ave, Spokane, WA 99201',
                phone: '(509) 326-7267',
                hours: 'Wed 3:30 PM - 6:00 PM | Thu 10:00 AM - 12:30 PM',
                availability: 'available',
                description: 'Providing essential food, clothing, and hygiene products to the West Central neighborhood. Offers a "shopping" experience for dignity.',
                services: ['food bank', 'hygiene products', 'bus passes (limited)', 'utility assistance'],
                coordinates: { lat: 47.6655, lng: -117.4352 },
                accessibility: ['wheelchair accessible'],
                requirements: ['West Central residents', 'photo ID'],
                website: 'https://ourplacespokane.org',
                rating: 4.8,
                reviews: 31
            },
            {
                id: 'food-10',
                name: 'MLK Community Center (East Central) Food Bank',
                category: 'food',
                subcategory: 'food bank',
                address: '500 S Stone St, Spokane, WA 99202',
                phone: '(509) 868-0856',
                hours: 'Mon, Wed, Thu, Fri 10:00-12:00 & 1:00-4:15',
                availability: 'available',
                description: 'A vital resource in the East Central neighborhood, providing food assistance and youth programs in a historic community center.',
                services: ['food pantry', 'youth services', 'educational programs', 'senior support'],
                coordinates: { lat: 47.6515, lng: -117.3885 },
                accessibility: ['wheelchair accessible'],
                requirements: ['zip code 99202 or 99212'],
                website: 'https://mlkspokane.org',
                rating: 4.4,
                reviews: 26
            },
            {
                id: 'food-11',
                name: 'Northeast Food Pantry (Northwest Connect)',
                category: 'food',
                subcategory: 'food bank',
                address: '4520 N Crestline St, Spokane, WA 99207',
                phone: '(509) 290-5691',
                hours: 'Tue 11:00 AM - 1:00 PM | Thu 9:00 AM - 11:00 AM',
                availability: 'available',
                description: 'Serving the Hillyard and Northeast Spokane community with fresh produce and shelf-stable goods.',
                services: ['food distribution', 'community connection', 'resource guides'],
                coordinates: { lat: 47.7015, lng: -117.3855 },
                accessibility: ['wheelchair accessible'],
                requirements: ['Northeast Spokane residents'],
                website: 'https://nwconnect.org',
                rating: 4.3,
                reviews: 15
            },
            {
                id: 'food-12',
                name: 'Mead Food Bank',
                category: 'food',
                subcategory: 'food bank',
                address: '12509 N Market St, Mead, WA 99021',
                phone: '(509) 466-7068',
                hours: 'Wed 4:00 PM - 6:45 PM | Sun 4:00 PM - 5:00 PM',
                availability: 'available',
                description: 'Rural food bank serving the Mead school district boundaries and surrounding areas.',
                services: ['grocery assistance', 'emergency food bags', 'holiday support'],
                coordinates: { lat: 47.7712, lng: -117.3622 },
                accessibility: ['wheelchair accessible'],
                requirements: ['Mead district residency'],
                website: '',
                rating: 4.7,
                reviews: 14
            },
            {
                id: 'food-13',
                name: 'Medical Lake Food Bank',
                category: 'food',
                subcategory: 'food bank',
                address: '207 S Washington St, Medical Lake, WA 99022',
                phone: '(509) 299-3819',
                hours: 'Fri 10:00 AM - 12:00 PM | 1st Thu 5:30 PM - 6:30 PM',
                availability: 'available',
                description: 'Providing essential food security to Medical Lake and surrounding rural communities.',
                services: ['pantry distribution', 'senior boxes', 'emergency food'],
                coordinates: { lat: 47.5715, lng: -117.6855 },
                accessibility: ['wheelchair accessible'],
                requirements: ['Medical Lake area residency'],
                website: '',
                rating: 4.6,
                reviews: 19
            },
            {
                id: 'food-14',
                name: 'The Salvation Army Spokane – Food Bank',
                category: 'food',
                subcategory: 'food bank',
                address: '204 E Indiana Ave, Spokane, WA 99207',
                phone: '(509) 325-6810',
                hours: 'Mon-Fri 9:00 AM - 11:45 AM & 1:00 PM - 3:00 PM',
                availability: 'available',
                description: 'Part of the comprehensive Salvation Army social services campus. Provides emergency food boxes and seasonal assistance.',
                services: ['emergency food boxes', 'case management', 'seasonal support', 'family services'],
                coordinates: { lat: 47.6765, lng: -117.4102 },
                accessibility: ['wheelchair accessible'],
                requirements: ['photo ID', 'proof of address'],
                website: 'https://spokane.salvationarmy.org',
                rating: 4.5,
                reviews: 48
            },
            {
                id: 'food-15',
                name: 'Audubon Park UMC Food Bank',
                category: 'food',
                subcategory: 'food bank',
                address: '3908 N Driscoll Blvd, Spokane, WA 99205',
                phone: '(509) 325-4541',
                hours: '2nd & 4th Tue 8:30 AM - 11:30 AM',
                availability: 'available',
                description: '"Bare Necessities" ministry providing food security to the Audubon/Downriver neighborhood.',
                services: ['food distribution', 'neighborly support'],
                coordinates: { lat: 47.6955, lng: -117.4485 },
                accessibility: ['wheelchair accessible'],
                requirements: ['local neighborhood residency'],
                website: 'https://audubonparkumc.org',
                rating: 4.4,
                reviews: 11
            },
            {
                id: 'food-16',
                name: 'New Hope Ranch Food Ministry',
                category: 'food',
                subcategory: 'food & meals',
                address: '2524 E Queen Ave, Spokane, WA 99217',
                phone: '(509) 954-5145',
                hours: 'Mon & Wed Noon - 2:00 PM | Fri 5:00 PM - 6:00 PM',
                availability: 'available',
                description: 'A community outreach focus providing regular food distribution and warm meals to Hillyard residents.',
                services: ['pantry items', 'warm meals', 'community fellowship'],
                coordinates: { lat: 47.7112, lng: -117.3755 },
                accessibility: ['wheelchair accessible'],
                requirements: ['open to all'],
                website: '',
                rating: 4.7,
                reviews: 13
            },
            {
                id: 'food-17',
                name: 'Spokane Humane Society Pet Food Pantry',
                category: 'food',
                subcategory: 'pet food bank',
                address: '6607 N Havana St, Spokane, WA 99217',
                phone: '(509) 467-5235',
                hours: 'Tue-Sat 10:30 AM - 6:00 PM',
                availability: 'available',
                description: 'Helping keep pets with their families by providing free dog and cat food to owners in temporary financial need.',
                services: ['pet food assistance', 'animal welfare resources'],
                coordinates: { lat: 47.7212, lng: -117.3455 },
                accessibility: ['wheelchair accessible'],
                requirements: ['proof of financial need', 'Spokane County resident'],
                website: 'https://spokanehumanesociety.org',
                rating: 4.9,
                reviews: 124
            },
            {
                id: 'food-18',
                name: 'Meals on Wheels Greater Spokane County',
                category: 'food',
                subcategory: 'meal delivery',
                address: '1222 W 2nd Ave, Spokane, WA 99201',
                phone: '(509) 456-6597',
                hours: 'Deliveries Mon-Fri Mid-day',
                availability: 'available',
                description: 'Home-delivered hot meals for seniors (60+) and homebound adults. Provides social contact and wellness checks alongside nutrition.',
                services: ['hot meal delivery', 'wellness checks', 'senior nutrition', 'frozen meal plans'],
                coordinates: { lat: 47.6535, lng: -117.4295 },
                accessibility: ['delivery service', 'phone intake'],
                requirements: ['age 60+ or homebound with doctor note'],
                website: 'https://mowgsc.org',
                rating: 4.8,
                reviews: 87
            },
            {
                id: 'food-19',
                name: 'Otis Orchards Food Bank',
                category: 'food',
                subcategory: 'food bank',
                address: '4308 N Harvard Rd, Otis Orchards, WA 99027',
                phone: '(509) 720-8606',
                hours: 'Tue 10:00 AM - 2:00 PM',
                availability: 'available',
                description: 'Serving the Otis Orchards and Newman Lake communities with essential food support.',
                services: ['grocery distribution', 'emergency food', 'community help'],
                coordinates: { lat: 47.7032, lng: -117.1555 },
                accessibility: ['wheelchair accessible'],
                requirements: ['local residency'],
                website: '',
                rating: 4.4,
                reviews: 9
            },
            {
                id: 'food-20',
                name: 'Westminster Presbyterian Food Bank',
                category: 'food',
                subcategory: 'food bank',
                address: '2705 W Boone Ave, Spokane, WA 99201',
                phone: '(509) 328-5002',
                hours: 'Mon & Fri 11:00 AM - 1:45 PM',
                availability: 'available',
                description: 'Neighborhood food pantry serving those north of the river in zip code 99201.',
                services: ['pantry items', 'emergency food', 'pastoral care (optional)'],
                coordinates: { lat: 47.6695, lng: -117.4525 },
                accessibility: ['wheelchair accessible'],
                requirements: ['zip code 99201 (North of River)', 'photo ID'],
                website: 'https://westminster-spokane.org',
                rating: 4.5,
                reviews: 14
            },

            // Treatment Centers
            {
                id: 'treatment-1',
                name: 'Spokane Treatment & Recovery Services (STARS) – Cowley St',
                category: 'treatment',
                subcategory: 'detox/residential',
                address: '628 S Cowley St, Spokane, WA 99202',
                phone: '(509) 570-7250',
                hours: '24/7 (Detox) | Mon-Fri 8:00 AM - 4:30 PM (Office)',
                availability: 'available',
                description: 'A non-profit organization offering medical detoxification, residential treatment, and outpatient care. STARS provides a low-barrier path to recovery for the Spokane community.',
                services: ['medical detox', 'residential treatment', 'outpatient programs', 'crisis stabilization'],
                coordinates: { lat: 47.6495, lng: -117.4098 },
                accessibility: ['wheelchair accessible', 'ADA compliant'],
                requirements: ['assessment required', 'varies by program'],
                website: 'https://spokanerecovery.org',
                rating: 4.4,
                reviews: 45
            },
            {
                id: 'treatment-2',
                name: 'Compassionate Addiction Treatment (CAT)',
                category: 'treatment',
                subcategory: 'outpatient/peer support',
                address: '112 E 2nd Ave, Spokane, WA 99202',
                phone: '(509) 290-5026',
                hours: 'Mon-Fri 9:00 AM - 5:00 PM',
                availability: 'available',
                description: 'A low-barrier, trauma-informed treatment center focused on the most vulnerable populations. Offers outpatient treatment, peer support, and housing assistance.',
                services: ['outpatient treatment', 'peer support', 'harm reduction', 'housing advocacy'],
                coordinates: { lat: 47.6552, lng: -117.4102 },
                accessibility: ['wheelchair accessible'],
                requirements: ['open to all', 'specializes in indigent populations'],
                website: 'https://catspokane.org',
                rating: 4.9,
                reviews: 63
            },
            {
                id: 'treatment-3',
                name: 'Spokane Addiction Recovery Centers (SPARC) – Main',
                category: 'treatment',
                subcategory: 'inpatient/outpatient',
                address: '1504 W Grace Ave, Spokane, WA 99205',
                phone: '(509) 327-3741',
                hours: 'Mon-Fri 8:00 AM - 5:00 PM',
                availability: 'available',
                description: 'Founded in 1980, SPARC provides intensive inpatient, recovery house, and outpatient services for low-income and indigent adults struggling with substance use.',
                services: ['intensive inpatient', 'outpatient treatment', 'recovery housing', 'DUI assessments'],
                coordinates: { lat: 47.6822, lng: -117.4397 },
                accessibility: ['wheelchair accessible'],
                requirements: ['assessment required', 'low-income focus'],
                website: 'https://sparcop.org',
                rating: 4.5,
                reviews: 38
            },
            {
                id: 'treatment-4',
                name: 'Recovery Cafe Spokane – Downtown',
                category: 'treatment',
                subcategory: 'peer support',
                address: '715 W Sprague Ave, Spokane, WA 99201',
                phone: '(509) 624-1442',
                hours: 'Tue-Sat 9:00 AM - 5:30 PM',
                availability: 'available',
                description: 'A recovery community center providing peer-led support, recovery circles, and social connection for those dedicated to staying sober.',
                services: ['recovery circles', 'peer coaching', 'community meals', 'social events'],
                coordinates: { lat: 47.6582, lng: -117.4225 },
                accessibility: ['wheelchair accessible'],
                requirements: ['sober for 24 hours', 'commitment to recovery circle'],
                website: 'https://recoverycafespokane.org',
                rating: 4.8,
                reviews: 42
            },
            {
                id: 'treatment-5',
                name: 'Royal Life Centers at Spokane Heights',
                category: 'treatment',
                subcategory: 'detox/residential',
                address: '524 E Francis Ave, Spokane, WA 99208',
                phone: '(509) 368-9735',
                hours: '24/7',
                availability: 'available',
                description: 'Provides a high standard of care for medical detox and residential treatment. Offers a holistic approach including PHP and IOP levels of care.',
                services: ['medical detox', 'residential treatment', 'PHP', 'IOP', 'individualized care'],
                coordinates: { lat: 47.7145, lng: -117.4042 },
                accessibility: ['wheelchair accessible', 'premium amenities'],
                requirements: ['assessment required', 'private insurance or payment'],
                website: 'https://www.spokaneheightsdetox.com',
                rating: 4.7,
                reviews: 51
            },
            {
                id: 'treatment-6',
                name: 'Spokane Falls Recovery Center',
                category: 'treatment',
                subcategory: 'holistic treatment',
                address: '101 E Magnesium Rd #101, Spokane, WA 99208',
                phone: '(844) 962-2775',
                hours: 'Mon-Sun 8:00 AM - 8:00 PM',
                availability: 'available',
                description: 'Specializes in comprehensive addiction recovery with a focus on holistic healing. Offers detox, PHP, and outpatient programs tailored to individual needs.',
                services: ['detox programs', 'residential treatment', 'intensive outpatient', 'standard outpatient'],
                coordinates: { lat: 47.7412, lng: -117.4122 },
                accessibility: ['wheelchair accessible'],
                requirements: ['assessment required', 'most insurance accepted'],
                website: 'https://spokanefallsrecoverycenter.com',
                rating: 4.6,
                reviews: 31
            },
            {
                id: 'treatment-7',
                name: 'Rebuilt Treatment & Recovery',
                category: 'treatment',
                subcategory: 'outpatient/PHP',
                address: '1220 N Howard St, Spokane, WA 99201',
                phone: '(509) 385-4600',
                hours: 'Mon-Fri 9:00 AM - 6:00 PM',
                availability: 'available',
                description: 'A modern outpatient facility offering Partial Hospitalization and Intensive Outpatient programs. Emphasizes clinical excellence and relapse prevention.',
                services: ['PHP', 'IOP', 'family therapy', 'long-term recovery planning'],
                coordinates: { lat: 47.6685, lng: -117.4195 },
                accessibility: ['wheelchair accessible'],
                requirements: ['assessment required', 'private insurance/medicaid'],
                website: 'https://rebuilttreatment.com',
                rating: 4.8,
                reviews: 19
            },
            {
                id: 'treatment-8',
                name: 'Riverside Recovery Center – Monroe',
                category: 'treatment',
                subcategory: 'outpatient',
                address: '3710 N Monroe St, Spokane, WA 99205',
                phone: '(509) 328-5234',
                hours: 'Mon-Fri 8:30 AM - 8:00 PM',
                availability: 'available',
                description: 'Providing outpatient treatment and intensive outpatient programs since 1994. Known for a supportive environment and experienced counseling staff.',
                services: ['IOP', 'outpatient counseling', 'DUI programs', 'relapse prevention education'],
                coordinates: { lat: 47.6935, lng: -117.4255 },
                accessibility: ['wheelchair accessible'],
                requirements: ['assessment required'],
                website: 'https://riversidespokane.com',
                rating: 4.4,
                reviews: 29
            },
            {
                id: 'treatment-9',
                name: 'Ideal Option – Downtown Spokane',
                category: 'treatment',
                subcategory: 'MAT clinic',
                address: '224 E 5th Ave, Spokane, WA 99202',
                phone: '(877) 522-1275',
                hours: 'Mon-Fri 8:00 AM - 5:00 PM',
                availability: 'available',
                description: 'Specializes in outpatient Medication-Assisted Treatment (MAT) for opioid and alcohol use disorders. Offers low-barrier, same-day starts for new patients.',
                services: ['Suboxone treatment', 'Vivitrol injections', 'counseling referrals', 'relapse prevention'],
                coordinates: { lat: 47.6525, lng: -117.4095 },
                accessibility: ['wheelchair accessible'],
                requirements: ['direct walk-ins or referrals'],
                website: 'https://www.idealoption.com',
                rating: 4.5,
                reviews: 74
            },
            {
                id: 'treatment-10',
                name: 'Spokane Comprehensive Treatment Center (CTC)',
                category: 'treatment',
                subcategory: 'opioid treatment',
                address: '4305 E Trent Ave, Spokane, WA 99212',
                phone: '(509) 424-5277',
                hours: 'Mon-Fri 5:30 AM - 2:00 PM, Sat-Sun 6:00 AM - 9:00 AM',
                availability: 'available',
                description: 'A leading outpatient provider of medication-assisted treatment (MAT) for adults struggling with opioid addiction. Focuses on stabilization and counseling.',
                services: ['methadone treatment', 'buprenorphine treatment', 'group counseling', 'individual therapy'],
                coordinates: { lat: 47.6745, lng: -117.3485 },
                accessibility: ['wheelchair accessible'],
                requirements: ['age 18+', 'assessment required'],
                website: 'https://www.ctcprograms.com',
                rating: 4.2,
                reviews: 56
            },
            {
                id: 'treatment-11',
                name: 'Pioneer Human Services – Pioneer Pathways',
                category: 'treatment',
                subcategory: 'residential/detox',
                address: '3400 W Garland Ave, Spokane, WA 99205',
                phone: '(509) 325-2358',
                hours: '24/7 (Residential) | Office: 8:00 AM - 5:00 PM',
                availability: 'available',
                description: 'Offers residential treatment and withdrawal management services for adults. Integrates behavioral health with community-based support.',
                services: ['residential treatment', 'detoxification', 'case management', 'community re-entry'],
                coordinates: { lat: 47.7052, lng: -117.4585 },
                accessibility: ['wheelchair accessible'],
                requirements: ['assessment required', 'open to formerly incarcerated'],
                website: 'https://pioneerhumanservices.org',
                rating: 4.3,
                reviews: 21
            },
            {
                id: 'treatment-12',
                name: 'Karens House (STARS) – Women\'s Residential',
                category: 'treatment',
                subcategory: 'women only',
                address: '4324 N Jefferson St, Spokane, WA 99205',
                phone: '(509) 570-7250',
                hours: '24/7',
                availability: 'limited',
                description: 'A gender-specific residential treatment center for women, including specialty care for pregnant and postpartum mothers. Trauma-informed and supportive environment.',
                services: ['residential treatment', 'moms & kids programs', 'parenting support', 'trauma therapy'],
                coordinates: { lat: 47.6985, lng: -117.4285 },
                accessibility: ['wheelchair accessible'],
                requirements: ['women only', 'assessment through STARS'],
                website: 'https://spokanerecovery.org',
                rating: 4.7,
                reviews: 18
            },
            {
                id: 'treatment-13',
                name: 'Excelsior Wellness Center – Youth & Family',
                category: 'treatment',
                subcategory: 'youth focus',
                address: '3754 W Indian Trail Rd, Spokane, WA 99208',
                phone: '(509) 328-7041',
                hours: '24/7 (Residential) | 8:00 AM - 8:00 PM (Outpatient)',
                availability: 'available',
                description: 'Comprehensive wellness and treatment center specifically for youth and their families. Offers residential care, outpatient services, and educational support.',
                services: ['youth residential', 'outpatient SUD treatment', 'family counseling', 'educational support'],
                coordinates: { lat: 47.7285, lng: -117.4925 },
                accessibility: ['wheelchair accessible', 'large campus'],
                requirements: ['youth/family focus', 'assessment required'],
                website: 'https://excelsiorwellness.org',
                rating: 4.6,
                reviews: 44
            },
            {
                id: 'treatment-14',
                name: 'Daybreak Youth Services – Spokane Center',
                category: 'treatment',
                subcategory: 'youth focus',
                address: '11707 E Sprague Ave #100, Spokane Valley, WA 99206',
                phone: '(425) 355-6615',
                hours: 'Mon-Sun 8:00 AM - 10:00 PM',
                availability: 'available',
                description: 'Specializes in addiction treatment and mental health services for children and adolescents. Offers residential, outpatient, and educational programs.',
                services: ['youth residential', 'outpatient counseling', 'mental health screening', 'school support'],
                coordinates: { lat: 47.6582, lng: -117.2465 },
                accessibility: ['wheelchair accessible'],
                requirements: ['youth/adolescent focus'],
                website: 'https://daybreakyouthservices.org',
                rating: 4.1,
                reviews: 35
            },
            {
                id: 'treatment-15',
                name: 'Pacific Sky Recovery Center – coming soon',
                category: 'treatment',
                subcategory: 'detox/residential',
                address: 'North Spokane Area, Spokane, WA 99208',
                phone: '(509) 286-2995',
                hours: 'Call for current status',
                availability: 'planned',
                description: 'A new high-quality residential treatment facility coming to Spokane. Focused on evidence-based care for substance use disorders.',
                services: ['medical detox', 'residential treatment', 'relapse prevention'],
                coordinates: { lat: 47.7455, lng: -117.4122 },
                accessibility: ['wheelchair accessible'],
                requirements: ['private insurance'],
                website: 'https://pacificskyrecovery.com',
                rating: 5.0,
                reviews: 5
            },

            // Support Groups
            {
                id: 'support-1',
                name: 'Al-Anon Family Groups – Spokane Central Office',
                category: 'support',
                subcategory: '12-step',
                address: '1700 W 7th Ave, Suite 100, Spokane, WA 99204',
                phone: '(509) 624-1442',
                hours: '24/7 Hotline | Office: Mon-Fri 10 AM-2 PM',
                availability: 'available',
                description: 'Support for families and friends of alcoholics. The Spokane Central Office provides meeting directories, literature, and 24-hour phone support for those impacted by someone else\'s drinking.',
                services: ['12-step meetings', 'family support', 'crisis hotline', 'recovery literature'],
                coordinates: { lat: 47.6495, lng: -117.4395 },
                accessibility: ['wheelchair accessible'],
                requirements: ['open to anyone impacted by another\'s drinking'],
                website: 'https://al-anon.org',
                rating: 4.8,
                reviews: 52
            },
            {
                id: 'support-2',
                name: 'Celebrate Recovery – Family of Faith',
                category: 'support',
                subcategory: 'christian',
                address: '1504 W Grace Ave, Spokane, WA 99205',
                phone: '(509) 328-3601',
                hours: 'Thursdays 6:00 PM',
                availability: 'available',
                description: 'A Christ-centered, 12-step recovery program for anyone struggling with hurt, pain, or addiction of any kind. Includes large group worship, open share groups, and fellowship.',
                services: ['12-step meetings', 'bible study', 'fellowship', 'childcare often provided'],
                coordinates: { lat: 47.6822, lng: -117.4397 },
                accessibility: ['wheelchair accessible'],
                requirements: ['open to all'],
                website: 'https://www.celebraterecovery.com',
                rating: 4.7,
                reviews: 28
            },
            {
                id: 'support-3',
                name: 'Alcoholics Anonymous (AA) – Spokane Central Office',
                category: 'support',
                subcategory: '12-step',
                address: '1700 W 7th Ave, Suite 100, Spokane, WA 99204',
                phone: '(509) 624-1442',
                hours: '24/7 Hotline | Multiple daily meetings',
                availability: 'available',
                description: 'The central resource for AA in Spokane. Provides meeting schedules for hundreds of weekly meetings, 12-step support, and sponsorship connections for anyone with a desire to stop drinking.',
                services: ['12-step meetings', 'sponsorship', 'fellowship', '24-hour support line'],
                coordinates: { lat: 47.6495, lng: -117.4395 },
                accessibility: ['wheelchair accessible'],
                requirements: ['desire to stop drinking'],
                website: 'https://aaspokane.org',
                rating: 4.9,
                reviews: 142
            },
            {
                id: 'support-4',
                name: 'Narcotics Anonymous (NA) – Spokane Area',
                category: 'support',
                subcategory: '12-step',
                address: '103 E Indiana Ave, Spokane, WA 99207',
                phone: '(509) 325-5045',
                hours: 'Office hours vary | Meetings daily',
                availability: 'available',
                description: 'Central hub for NA in the Spokane area. Provides support for individuals seeking recovery from drug addiction through 12-step fellowship and peer mentorship.',
                services: ['12-step meetings', 'sponsorship', 'fellowship', 'hotline support'],
                coordinates: { lat: 47.6765, lng: -117.4095 },
                accessibility: ['wheelchair accessible'],
                requirements: ['desire to stop using'],
                website: 'https://na.org',
                rating: 4.7,
                reviews: 86
            },
            {
                id: 'support-5',
                name: 'SMART Recovery – Spokane Alano Club',
                category: 'support',
                subcategory: 'evidence-based',
                address: '1700 W 7th Ave, Suite 100, Spokane, WA 99204',
                phone: '(509) 624-1442',
                hours: 'Tuesdays and Thursdays 6:00 PM',
                availability: 'available',
                description: 'A secular, science-based approach to addiction recovery. Focuses on self-empowerment and cognitive-behavioral tools to manage urges and build a balanced life.',
                services: ['group meetings', 'self-management tools', 'online support', 'secular recovery'],
                coordinates: { lat: 47.6495, lng: -117.4395 },
                accessibility: ['wheelchair accessible'],
                requirements: ['open to all'],
                website: 'https://smartrecovery.org',
                rating: 4.6,
                reviews: 34
            },
            {
                id: 'support-6',
                name: 'Refuge Recovery – Souls Center',
                category: 'support',
                subcategory: 'buddhist',
                address: '707 N Cedar St, Suite 2, Spokane, WA 99201',
                phone: '(509) 325-5045',
                hours: 'Wednesdays 1:00 PM (In-person & Zoom)',
                availability: 'available',
                description: 'Buddhist-inspired path to recovery from all forms of addiction. Utilizes meditation, mindfulness, and community to foster healing and liberation.',
                services: ['meditation', 'mindfulness coaching', 'group support', 'Zoom options'],
                coordinates: { lat: 47.6635, lng: -117.4322 },
                accessibility: ['wheelchair accessible'],
                requirements: ['open to all'],
                website: 'https://refugerecovery.org',
                rating: 4.8,
                reviews: 21
            },
            {
                id: 'support-7',
                name: 'Women for Sobriety – Spokane Groups',
                category: 'support',
                subcategory: 'women',
                address: '1700 W 7th Ave, Spokane, WA 99204',
                phone: '(509) 624-1442',
                hours: 'Wednesdays 6:00 PM',
                availability: 'available',
                description: 'Recovery support group specifically for women. Emphasizes self-empowerment, positive thinking, and life-affirming habits to overcome addiction.',
                services: ['women-only meetings', 'empowerment focus', 'life skills', 'emotional support'],
                coordinates: { lat: 47.6495, lng: -117.4395 },
                accessibility: ['wheelchair accessible'],
                requirements: ['women only'],
                website: 'https://womenforsobriety.org',
                rating: 4.5,
                reviews: 36
            },
            {
                id: 'support-8',
                name: 'Atheist & Agnostic AA Meeting (Alano Club)',
                category: 'support',
                subcategory: 'secular',
                address: '1700 W 7th Ave, Spokane, WA 99204',
                phone: '(509) 624-1442',
                hours: 'Sundays 9:00 AM',
                availability: 'available',
                description: 'A non-religious approach to the 12-step framework of Alcoholics Anonymous. Open to individuals of all beliefs or no belief who want to recover from alcoholism.',
                services: ['secular 12-step meetings', 'peer support', 'fellowship'],
                coordinates: { lat: 47.6495, lng: -117.4395 },
                accessibility: ['wheelchair accessible'],
                requirements: ['desire to stop drinking'],
                website: 'https://aaspokane.org',
                rating: 4.4,
                reviews: 19
            },
            {
                id: 'support-9',
                name: 'Celebrate Recovery – Spokane First Nazarene',
                category: 'support',
                subcategory: 'christian',
                address: '9004 N Country Homes Blvd, Spokane, WA 99218',
                phone: '(509) 467-8986',
                hours: 'Thursdays 6:00 PM',
                availability: 'available',
                description: 'Large Celebrate Recovery chapter in North Spokane. Offers a safe place to find freedom from life\'s hurts, hang-ups, and habits through a Christ-centered 12-step process.',
                services: ['large group worship', 'share groups', 'step studies', 'dinner available'],
                coordinates: { lat: 47.7412, lng: -117.4122 },
                accessibility: ['wheelchair accessible'],
                requirements: ['open to all'],
                website: 'https://sfnaz.org',
                rating: 4.8,
                reviews: 41
            },
            {
                id: 'support-10',
                name: 'Celebrate Recovery – Mt. Spokane Church',
                category: 'support',
                subcategory: 'christian',
                address: '6311 E Mt Spokane Park Dr, Mead, WA 99021',
                phone: '(509) 238-6610',
                hours: 'Fridays 6:00 PM (Dinner & Meeting)',
                availability: 'available',
                description: 'Serves the Mead and North Spokane communities. Includes dinner, worship, and small group sessions for anyone seeking recovery in a Christian environment.',
                services: ['dinner', 'worship', 'small groups', 'childcare provided'],
                coordinates: { lat: 47.7785, lng: -117.3255 },
                accessibility: ['wheelchair accessible'],
                requirements: ['open to all'],
                website: 'https://mtspokane.church',
                rating: 4.7,
                reviews: 15
            },
            {
                id: 'support-11',
                name: 'Celebrate Recovery – Union Gospel Mission',
                category: 'support',
                subcategory: 'christian',
                address: '1224 E Trent Ave, Spokane, WA 99202',
                phone: '(509) 535-8510',
                hours: 'Thursdays 6:00 PM',
                availability: 'available',
                description: 'Integrated within the UGM recovery environment. Open to the public, providing a structured biblical approach to overcoming addiction and trauma.',
                services: ['12-step biblical groups', 'dinner', 'testimonies', 'peer support'],
                coordinates: { lat: 47.6589, lng: -117.3932 },
                accessibility: ['wheelchair accessible'],
                requirements: ['open to all'],
                website: 'https://uniongospelmission.org',
                rating: 4.6,
                reviews: 24
            },
            {
                id: 'support-12',
                name: 'Narcotics Anonymous – Northside Group',
                category: 'support',
                subcategory: '12-step',
                address: '122 W Indiana Ave, Spokane, WA 99205',
                phone: '(509) 325-5045',
                hours: 'Wednesdays and Sundays 6:30 PM',
                availability: 'available',
                description: 'A welcoming NA meeting on the north side of Spokane. Part of the Spokane Area NA fellowship.',
                services: ['NA meetings', 'fellowship', 'sponsorship'],
                coordinates: { lat: 47.6765, lng: -117.4132 },
                accessibility: ['wheelchair accessible'],
                requirements: ['desire to stop using'],
                website: 'https://na.org',
                rating: 4.5,
                reviews: 31
            },
            {
                id: 'support-13',
                name: 'Alcoholics Anonymous – Alano Club Downtown',
                category: 'support',
                subcategory: '12-step',
                address: '1700 W 7th Ave, Spokane, WA 99204',
                phone: '(509) 624-1442',
                hours: '7:00 AM - 10:00 PM Daily',
                availability: 'available',
                description: 'The historic Alano Club of Spokane hosts dozens of AA, NA, Al-Anon, and other recovery meetings every week. A central gathering place for the recovery community.',
                services: ['meeting hall', 'social events', 'recovery coffee shop', 'multiple fellowships'],
                coordinates: { lat: 47.6495, lng: -117.4395 },
                accessibility: ['wheelchair accessible'],
                requirements: ['varies by meeting'],
                website: 'https://spokanealanoclub.org',
                rating: 4.8,
                reviews: 156
            },
            {
                id: 'support-14',
                name: 'SMART Recovery – Online Support Northwest',
                category: 'support',
                subcategory: 'evidence-based',
                address: 'Online / Virtual Resource',
                phone: '(440) 951-5357',
                hours: 'Daily virtual meetings available',
                availability: 'available',
                description: 'Access to the global network of SMART Recovery virtual meetings. Ideal for those who prefer online support or cannot make it to the Alano Club meetings.',
                services: ['online toolkits', 'virtual meetings', 'mobile app', '24/7 forum access'],
                coordinates: { lat: 47.6588, lng: -117.4260 },
                accessibility: ['screen reader compatible', 'multilingual options'],
                requirements: ['internet access'],
                website: 'https://smartrecovery.org',
                rating: 4.7,
                reviews: 312
            },
            {
                id: 'support-15',
                name: 'Al-Anon – Spokane Valley Groups',
                category: 'support',
                subcategory: '12-step',
                address: 'Various Spokane Valley Locations',
                phone: '(509) 624-1442',
                hours: 'Varies by meeting',
                availability: 'available',
                description: 'Dedicated Al-Anon meetings held in the Spokane Valley area for friends and families of alcoholics.',
                services: ['12-step meetings', 'peer support', 'recovery literature'],
                coordinates: { lat: 47.6734, lng: -117.2398 },
                accessibility: ['wheelchair accessible'],
                requirements: ['open to those impacted by another\'s drinking'],
                website: 'https://al-anon.org',
                rating: 4.6,
                reviews: 18
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
                name: 'Frontier Behavioral Health – Access to Care',
                category: 'medical',
                subcategory: 'mental health',
                address: '131 S Division St, Spokane, WA 99202',
                phone: '(509) 838-4651',
                hours: 'Mon-Fri 8:00 AM - 5:00 PM (Entry point)',
                availability: 'available',
                description: 'The primary entry point for public mental health services in Spokane. Provides comprehensive outpatient services, medication management, and specialized programs for all ages.',
                services: ['mental health assessment', 'individual therapy', 'group therapy', 'medication management', 'elder services', 'youth & family services'],
                coordinates: { lat: 47.6558, lng: -117.4103 },
                accessibility: ['wheelchair accessible', 'ADA compliant'],
                requirements: ['assessment required', 'accepts Medicaid/Apple Health & most insurance'],
                website: 'https://fbhwa.org',
                rating: 4.2,
                reviews: 112
            },
            {
                id: 'medical-4',
                name: 'CHAS Behavioral Health Center',
                category: 'medical',
                subcategory: 'mental health',
                address: '5901 N Lidgerwood St, Suite 223, Spokane, WA 99208',
                phone: '(509) 444-8200',
                hours: 'Mon-Fri 8:00 AM - 6:00 PM',
                availability: 'available',
                description: 'Integrated behavioral health services within the CHAS community clinic system. Offers counseling and psychiatric services alongside primary medical care.',
                services: ['behavioral health counseling', 'psychiatric services', 'addiction recovery support', 'integrated primary care'],
                coordinates: { lat: 47.7121, lng: -117.4042 },
                accessibility: ['wheelchair accessible', 'ADA compliant'],
                requirements: ['open to everyone', 'sliding fee scale available'],
                website: 'https://chas.org',
                rating: 4.4,
                reviews: 58
            },
            {
                id: 'medical-5',
                name: 'Spokane Falls Recovery Center',
                category: 'medical',
                subcategory: 'addiction treatment',
                address: '511 S Pine St, Spokane, WA 99202',
                phone: '(509) 962-2772',
                hours: '24/7 (Residential) | Mon-Fri 8:00 AM - 6:00 PM (Outpatient)',
                availability: 'available',
                description: 'State-licensed addiction treatment center offering a full continuum of care from medical detox and residential treatment to intensive outpatient programs.',
                services: ['medical detox', 'residential treatment', 'intensive outpatient (IOP)', 'SUD assessments', 'individual and group therapy'],
                coordinates: { lat: 47.6515, lng: -117.4082 },
                accessibility: ['wheelchair accessible', 'ADA compliant'],
                requirements: ['assessment required', 'insurance verification'],
                website: 'https://spokanefallsrecoverycenter.com',
                rating: 4.7,
                reviews: 83
            },
            {
                id: 'medical-6',
                name: 'Spokane Regional Crisis Line (SCRBH)',
                category: 'medical',
                subcategory: 'crisis',
                address: 'Phone/Mobile Service Only',
                phone: '1-877-266-1818',
                hours: '24/7',
                availability: 'available',
                description: 'The 24/7 regional crisis line for Spokane County. Provides immediate emotional support, crisis intervention, and dispatch for mobile crisis teams.',
                services: ['crisis intervention', 'suicide prevention', 'mobile crisis team dispatch', 'referral services'],
                coordinates: { lat: 47.6588, lng: -117.4260 },
                accessibility: ['TTY: (509) 458-7446', 'interpreter services available'],
                requirements: ['none – open to everyone'],
                website: 'https://spokanecounty.gov/1141/SCRBH',
                rating: 4.8,
                reviews: 142
            },
            {
                id: 'medical-7',
                name: 'Inland Northwest Behavioral Health',
                category: 'medical',
                subcategory: 'mental health',
                address: '104 W 5th Ave, Spokane, WA 99204',
                phone: '(509) 992-1888',
                hours: '24/7 (Inpatient) | Mon-Fri 8:00 AM - 5:00 PM (Outpatient)',
                availability: 'available',
                description: 'A 100-bed psychiatric hospital providing inpatient and outpatient behavioral health treatment. Specializes in psychosis, severe depression, anxiety, and other mood disorders.',
                services: ['adult inpatient treatment', 'medical detoxification', 'intensive outpatient (IOP)', 'partial hospitalization (PHP)'],
                coordinates: { lat: 47.6515, lng: -117.4111 },
                accessibility: ['wheelchair accessible', 'ADA compliant'],
                requirements: ['insurance verification', 'assessment required'],
                website: 'https://inlandnorthwestbh.com',
                rating: 4.1,
                reviews: 95
            },
            {
                id: 'medical-8',
                name: 'Royal Life Centers at Spokane Heights',
                category: 'medical',
                subcategory: 'addiction treatment',
                address: '524 E Francis Ave, Spokane, WA 99208',
                phone: '(888) 907-0898',
                hours: '24/7 Admissions',
                availability: 'available',
                description: 'Provides a complete continuum of addiction treatment with a focus on medical detox and long-term residential programs. Offers holistic and evidence-based therapies.',
                services: ['medical detox', 'residential treatment', 'partial hospitalization', 'SUD assessments', 'individual & group therapy'],
                coordinates: { lat: 47.7142, lng: -117.4033 },
                accessibility: ['wheelchair accessible', 'ADA compliant'],
                requirements: ['insurance or private pay', 'intake assessment'],
                website: 'https://spokaneheightsdetox.com',
                rating: 4.6,
                reviews: 52
            },
            {
                id: 'medical-9',
                name: 'Beyond Behavioral Health',
                category: 'medical',
                subcategory: 'mental health',
                address: '104 S Freya St, Suite 212, Spokane, WA 99202',
                phone: '(509) 368-9863',
                hours: 'Mon-Fri 9:00 AM - 6:00 PM',
                availability: 'available',
                description: 'Specializes in mental health counseling and addiction treatment for individuals and families. Known for a personalized, strengths-based approach.',
                services: ['mental health counseling', 'SUD assessments', 'individual and group therapy', 'family support'],
                coordinates: { lat: 47.6534, lng: -117.3654 },
                accessibility: ['wheelchair accessible'],
                requirements: ['insurance or private pay'],
                website: 'https://beyondbehavioralhealth.com',
                rating: 4.5,
                reviews: 21
            },
            {
                id: 'medical-10',
                name: '988 Suicide & Crisis Lifeline',
                category: 'medical',
                subcategory: 'crisis',
                address: 'National Hotline (Local Spokane Support)',
                phone: '988',
                hours: '24/7',
                availability: 'available',
                description: 'National network of local crisis centers that provides free and confidential emotional support to people in suicidal crisis or emotional distress. Connects directly to Spokane-area responders.',
                services: ['suicide prevention', 'crisis text & chat', 'emotional support', 'referrals'],
                coordinates: { lat: 47.6588, lng: -117.4260 },
                accessibility: ['multilingual', 'TTY available'],
                requirements: ['none'],
                website: 'https://988lifeline.org',
                rating: 4.9,
                reviews: 500
            },
            {
                id: 'medical-11',
                name: 'Catholic Charities Counseling Services',
                category: 'medical',
                subcategory: 'mental health',
                address: '101 E Hartson Ave, Spokane, WA 99202',
                phone: '(509) 242-2308',
                hours: 'Mon-Fri 8:00 AM - 5:00 PM',
                availability: 'available',
                description: 'Provides affordable counseling and community behavioral health services rooted in compassion. Services open to all people regardless of religious affiliation.',
                services: ['individual therapy', 'peer support', 'case management', 'family counseling', 'community support'],
                coordinates: { lat: 47.6482, lng: -117.4116 },
                accessibility: ['wheelchair accessible', 'ADA compliant'],
                requirements: ['sliding fee scale available', 'accepts Medicaid'],
                website: 'https://cceasternwa.org',
                rating: 4.3,
                reviews: 44
            },
            {
                id: 'medical-12',
                name: 'Providence BEST Program (Behavioral & Emotional Skills Training)',
                category: 'medical',
                subcategory: 'mental health',
                address: '235 E Rowan Ave, Suite 220, Spokane, WA 99207',
                phone: '(509) 474-2223',
                hours: 'Mon-Fri 8:00 AM - 4:30 PM',
                availability: 'available',
                description: 'Specialized intensive outpatient program for children and adolescents experiencing complex emotional and behavioral challenges.',
                services: ['pediatric mental health', 'therapeutic skills training', 'family education', 'intensive outpatient'],
                coordinates: { lat: 47.7082, lng: -117.4047 },
                accessibility: ['wheelchair accessible'],
                requirements: ['referral required', 'pediatric/adolescent focus'],
                website: 'https://providence.org',
                rating: 4.5,
                reviews: 31
            },
            {
                id: 'medical-13',
                name: 'Providence RISE Program (Recovery-Focused Intensive Services)',
                category: 'medical',
                subcategory: 'mental health',
                address: '235 E Rowan Ave, Suite 107, Spokane, WA 99207',
                phone: '(509) 252-6446',
                hours: 'Mon-Fri 8:00 AM - 4:30 PM',
                availability: 'available',
                description: 'Intensive psychiatric outpatient program (PHP/IOP) for adults and adolescents. Provides high-level support for those transitioning from inpatient care or needing more than standard outpatient therapy.',
                services: ['partial hospitalization (PHP)', 'intensive outpatient (IOP)', 'psychiatric stabilization', 'group psychotherapy'],
                coordinates: { lat: 47.7082, lng: -117.4047 },
                accessibility: ['wheelchair accessible'],
                requirements: ['intake assessment', 'insurance verification'],
                website: 'https://providence.org',
                rating: 4.6,
                reviews: 29
            },
            {
                id: 'medical-14',
                name: 'The NATIVE Project',
                category: 'medical',
                subcategory: 'community health',
                address: '1803 W Maxwell Ave, Spokane, WA 99201',
                phone: '(509) 325-5502',
                hours: 'Mon-Fri 8:00 AM - 5:00 PM',
                availability: 'available',
                description: 'Providing holistic primary and behavioral healthcare. Focused on Native Health but open to all people. Integrates medical, dental, and behavioral health with cultural sensitivity.',
                services: ['primary care', 'behavioral health', 'SUD treatment', 'youth counseling', 'dental care', 'preventative health'],
                coordinates: { lat: 47.6745, lng: -117.4392 },
                accessibility: ['wheelchair accessible', 'ADA compliant'],
                requirements: ['accepts most insurance', 'sliding fee scale available'],
                website: 'https://nativeproject.org',
                rating: 4.8,
                reviews: 92
            },
            {
                id: 'medical-15',
                name: 'Peer Spokane',
                category: 'medical',
                subcategory: 'peer support',
                address: '1222 N Post St, Spokane, WA 99201',
                phone: '(509) 867-3778',
                hours: 'Mon-Fri 9:00 AM - 4:00 PM',
                availability: 'available',
                description: 'Peer-led recovery support services for addiction and mental health challenges. All services are provided at no cost to participants.',
                services: ['peer coaching', 'recovery support groups', 'resource navigation', 'employment support'],
                coordinates: { lat: 47.6695, lng: -117.4242 },
                accessibility: ['wheelchair accessible'],
                requirements: ['none – open to adults 18+'],
                website: 'https://peerspokane.org',
                rating: 4.9,
                reviews: 57
            },
            {
                id: 'medical-16',
                name: 'Passages Family Support',
                category: 'medical',
                subcategory: 'mental health',
                address: '1700 S Assembly Rd, Suite 300, Spokane, WA 99224',
                phone: '(509) 892-9241',
                hours: 'Mon-Fri 8:00 AM - 5:00 PM | 24/7 Peer Respite',
                availability: 'available',
                description: 'Licensed community behavioral health clinic for individuals and families enrolled in Medicaid. Known for intensive care coordination and peer respite services.',
                services: ['individual & group therapy', 'peer support', 'WISe services', 'peer respite (24/7)', 'medication management'],
                coordinates: { lat: 47.6415, lng: -117.4762 },
                accessibility: ['wheelchair accessible'],
                requirements: ['accepts Apple Health (Medicaid)'],
                website: 'https://passages-spokane.org',
                rating: 4.7,
                reviews: 42
            },
            {
                id: 'medical-17',
                name: 'Excelsior Wellness Center',
                category: 'medical',
                subcategory: 'holistic health',
                address: '3754 W Indian Trail Rd, Spokane, WA 99208',
                phone: '(509) 559-3100',
                hours: 'Mon-Fri 8:00 AM - 5:00 PM',
                availability: 'available',
                description: 'Specializes in comprehensive wraparound services for children, adolescents, and families. Integrates education, mental health, and social services.',
                services: ['youth behavioral health', 'wraparound care services', 'individual & group counseling', 'care coordination', 'medication management'],
                coordinates: { lat: 47.7425, lng: -117.3654 },
                accessibility: ['wheelchair accessible', 'ADA compliant'],
                requirements: ['sliding fee scale available', 'focus on youth & families'],
                website: 'https://excelsiorwellness.org',
                rating: 4.6,
                reviews: 65
            },
            {
                id: 'medical-18',
                name: 'Compassionate Addiction Treatment (CAT)',
                category: 'medical',
                subcategory: 'addiction treatment',
                address: '960 E 3rd Ave, Spokane, WA 99202',
                phone: '(509) 919-3362',
                hours: 'Mon-Fri 9:00 AM - 5:00 PM',
                availability: 'available',
                description: 'Non-profit organization specialized in compassionate, holistic recovery services, particularly for people experiencing homelessness.',
                services: ['SUD assessments', 'individual & group counseling', 'peer support', 'harm reduction services', 'navigation to care'],
                coordinates: { lat: 47.6535, lng: -117.3972 },
                accessibility: ['wheelchair accessible'],
                requirements: ['open to everyone', 'zero-barrier focus'],
                website: 'https://catspokane.org',
                rating: 4.8,
                reviews: 48
            },
            {
                id: 'medical-19',
                name: 'SPARC (Spokane Addiction Recovery Centers)',
                category: 'medical',
                subcategory: 'addiction treatment',
                address: '1508 W 6th Ave, Spokane, WA 99204',
                phone: '(509) 624-3226',
                hours: '24/7 (Residential) | Mon-Fri 8 AM - 5 PM (Outpatient)',
                availability: 'available',
                description: 'Provides a range of addiction recovery services including intensive inpatient, recovery housing, and outpatient support for adults.',
                services: ['intensive inpatient', 'recovery housing', 'outpatient support', 'DUI assessments', 'co-occurring services'],
                coordinates: { lat: 47.6515, lng: -117.4352 },
                accessibility: ['wheelchair accessible'],
                requirements: ['assessment required', 'adults 18+'],
                website: 'https://sparc.org',
                rating: 4.2,
                reviews: 37
            },
            {
                id: 'medical-20',
                name: 'NAMI Spokane',
                category: 'medical',
                subcategory: 'mental health advocacy',
                address: 'Phone/Support Groups only (Downtown Spokane Access)',
                phone: '(509) 838-5599',
                hours: 'Varies by support group',
                availability: 'available',
                description: 'National Alliance on Mental Illness local affiliate. Provides education, advocacy, and peer-led support groups for individuals and families impacted by mental illness.',
                services: ['support groups', 'mental health education classes', 'advocacy', 'resource connection'],
                coordinates: { lat: 47.6588, lng: -117.4260 },
                accessibility: ['multilingual support available online'],
                requirements: ['none'],
                website: 'https://namispokane.org',
                rating: 4.9,
                reviews: 215
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
            {
                id: 'employment-4',
                name: 'WorkSource Spokane – Career & Job Services',
                category: 'employment',
                subcategory: 'workforce development',
                address: '130 S Arthur St, Spokane, WA 99202',
                phone: '(509) 532-3120',
                hours: 'Mon–Fri 8:00 AM – 5:00 PM',
                availability: 'available',
                description: 'Spokane\'s primary one-stop career center. Provides free job search assistance, résumé help, career training scholarships, labor market information, and connections to employers hiring locally. Also helps with unemployment benefits and re-employment support for individuals in recovery.',
                services: ['job search assistance', 'résumé building', 'career training', 'scholarship funds', 'employer connections', 'workshops', 'unemployment support'],
                coordinates: { lat: 47.6582, lng: -117.4047 },
                accessibility: ['wheelchair accessible', 'ADA compliant'],
                requirements: ['open to all job seekers', 'bring photo ID and work history'],
                website: 'https://worksourcespokane.com',
                rating: 4.4,
                reviews: 63
            },
            {
                id: 'employment-5',
                name: 'Division of Vocational Rehabilitation (DVR) – Spokane',
                category: 'employment',
                subcategory: 'vocational rehabilitation',
                address: '1313 N Atlantic St, Suite 1000, Spokane, WA 99201',
                phone: '(509) 363-4700',
                hours: 'Mon–Fri 8:00 AM – 5:00 PM',
                availability: 'available',
                description: 'State agency helping individuals with physical, mental, or substance use-related disabilities prepare for, find, and keep employment. Provides vocational counseling, job training funding, assistive technology, and supported employment. Recovery from addiction qualifies as a disability under DVR.',
                services: ['vocational counseling', 'job training funding', 'assistive technology', 'supported employment', 'disability accommodations', 'résumé and job placement'],
                coordinates: { lat: 47.6681, lng: -117.4268 },
                accessibility: ['wheelchair accessible', 'ADA compliant', 'TTY available'],
                requirements: ['documented disability or substance use disorder', 'Washington State resident'],
                website: 'https://dshs.wa.gov/dvr',
                rating: 4.3,
                reviews: 47
            },
            {
                id: 'employment-6',
                name: 'Next Generation Zone – Youth Career Center',
                category: 'employment',
                subcategory: 'youth employment',
                address: '130 S Arthur St, Spokane, WA 99202',
                phone: '(509) 532-3120',
                hours: 'Mon–Fri 8:00 AM – 5:00 PM',
                availability: 'available',
                description: 'Career center specifically designed for young adults ages 16–24 in the Spokane area. Offers education, career skills training, job placement, and wrap-around support. Especially helpful for young people in recovery who need a fresh start with employment and education.',
                services: ['career exploration', 'GED support', 'job placement', 'life skills', 'mentorship', 'education pathways', 'youth recovery support'],
                coordinates: { lat: 47.6582, lng: -117.4047 },
                accessibility: ['wheelchair accessible'],
                requirements: ['ages 16–24', 'Spokane area resident'],
                website: 'https://nextgenzone.org',
                rating: 4.6,
                reviews: 38
            },
            {
                id: 'employment-7',
                name: 'Revive Counseling – Supported Employment (IPS)',
                category: 'employment',
                subcategory: 'supported employment',
                address: '901 N Monroe St, Suite 200, Spokane, WA 99201',
                phone: '(509) 413-2950',
                hours: 'Mon–Fri 9:00 AM – 5:00 PM',
                availability: 'available',
                description: 'Uses the Individual Placement and Support (IPS) model to help Medicaid-eligible individuals with mental health challenges and/or addiction build competitive careers. Employment specialists work alongside clients at job sites and provide ongoing job coaching tailored to each person\'s recovery goals.',
                services: ['IPS supported employment', 'job coaching', 'career development', 'employer outreach', 'benefits counseling', 'addiction & mental health support'],
                coordinates: { lat: 47.6681, lng: -117.4268 },
                accessibility: ['wheelchair accessible'],
                requirements: ['Medicaid-eligible', 'mental health or substance use diagnosis'],
                website: 'https://revivespokane.com',
                rating: 4.7,
                reviews: 21
            },
            {
                id: 'employment-8',
                name: 'Spokane Community College – Workforce & Continuing Education',
                category: 'employment',
                subcategory: 'job training',
                address: '1810 N Greene St, Spokane, WA 99217',
                phone: '(509) 533-7000',
                hours: 'Mon–Fri 8:00 AM – 5:00 PM | Evening classes available',
                availability: 'available',
                description: 'Offers short-term, affordable workforce training in healthcare, trades, IT, business, and professional development. Many programs are stackable toward certificates or degrees. Financial aid and scholarships available. A strong option for individuals in recovery building new career pathways.',
                services: ['certificate programs', 'professional development', 'healthcare training', 'trades training', 'IT & tech courses', 'financial aid', 'career counseling'],
                coordinates: { lat: 47.7225, lng: -117.4075 },
                accessibility: ['wheelchair accessible', 'ADA compliant'],
                requirements: ['high school diploma or GED preferred', 'financial aid available'],
                website: 'https://scc.spokane.edu',
                rating: 4.4,
                reviews: 52
            },
            {
                id: 'employment-9',
                name: 'LDS Employment Resource Center – Spokane',
                category: 'employment',
                subcategory: 'job placement',
                address: '1620 E 29th Ave, Spokane, WA 99203',
                phone: '(509) 534-1041',
                hours: 'Mon–Fri 9:00 AM – 5:00 PM | By appointment',
                availability: 'available',
                description: 'Free employment services open to all individuals regardless of religious affiliation. Provides one-on-one résumé coaching, interview practice, job leads, and career networking. Helpful for anyone in recovery who needs structured job-search support at no cost.',
                services: ['résumé writing', 'interview preparation', 'job leads', 'career networking', 'personalized coaching', 'free of charge'],
                coordinates: { lat: 47.6382, lng: -117.3978 },
                accessibility: ['wheelchair accessible'],
                requirements: ['open to all – no membership required', 'appointment preferred'],
                website: 'https://www.churchofjesuschrist.org/life/employment',
                rating: 4.6,
                reviews: 19
            },
            {
                id: 'employment-10',
                name: 'City of Spokane – Supported Employment Program',
                category: 'employment',
                subcategory: 'supported employment',
                address: '808 W Spokane Falls Blvd, 4th Floor, Spokane, WA 99201',
                phone: '(509) 625-6160',
                hours: 'Mon–Fri 8:00 AM – 5:00 PM',
                availability: 'available',
                description: 'Assists individuals with significant disabilities in obtaining and maintaining competitive City employment. Offers job coaching, on-the-job training, and reasonable accommodations for full-time, part-time, and seasonal City positions. Especially valuable for those with addiction recovery as a disability.',
                services: ['job coaching', 'on-the-job training', 'accommodations', 'City job placement', 'career development support'],
                coordinates: { lat: 47.6588, lng: -117.4260 },
                accessibility: ['wheelchair accessible', 'ADA compliant'],
                requirements: ['documented significant disability', 'apply through Civil Service Commission'],
                website: 'https://my.spokanecity.org/jobs',
                rating: 4.3,
                reviews: 15
            },
            {
                id: 'employment-11',
                name: 'Spherion Staffing – Spokane',
                category: 'employment',
                subcategory: 'staffing & temp work',
                address: '818 W Riverside Ave, Suite 350, Spokane, WA 99201',
                phone: '(509) 456-4944',
                hours: 'Mon–Fri 8:00 AM – 5:00 PM',
                availability: 'available',
                description: 'Local staffing agency connecting job seekers with temporary, temp-to-hire, and direct hire positions across Spokane. A practical first step for individuals in recovery rebuilding work history. No cost to job seekers — staffing fees are paid by the employer.',
                services: ['temporary work', 'temp-to-hire', 'direct hire', 'skills assessment', 'job matching', 'free to job seekers'],
                coordinates: { lat: 47.6588, lng: -117.4262 },
                accessibility: ['wheelchair accessible'],
                requirements: ['valid photo ID', 'work authorization', 'background check may be required'],
                website: 'https://spherion.com/spokane',
                rating: 4.2,
                reviews: 34
            },
            {
                id: 'employment-12',
                name: 'Union Gospel Mission – Job Skills & Work Therapy',
                category: 'employment',
                subcategory: 'job training',
                address: '1224 E Trent Ave, Spokane, WA 99202',
                phone: '(509) 535-8510',
                hours: '24/7 residential access | Office Mon–Fri 8 AM–5 PM',
                availability: 'available',
                description: 'As part of its recovery program, UGM provides structured work therapy, job skills classes, business practicum experiences, and job training to prepare participants for employment. Graduates receive ongoing job placement support and mentoring from staff with lived experience.',
                services: ['work therapy', 'job skills classes', 'business practicum', 'job placement support', 'mentoring', 'employer connections'],
                coordinates: { lat: 47.6589, lng: -117.3932 },
                accessibility: ['wheelchair accessible'],
                requirements: ['enrolled in UGM recovery program', 'men\'s and women\'s programs available'],
                website: 'https://uniongospelmission.org',
                rating: 4.5,
                reviews: 29
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
            {
                id: 'legal-4',
                name: 'Center for Justice – Conviction Clearing & Expungement',
                category: 'legal',
                subcategory: 'expungement',
                address: '35 W Main Ave, Suite 300, Spokane, WA 99201',
                phone: '(509) 835-5211',
                hours: 'Mon–Fri 9:00 AM – 5:00 PM',
                availability: 'available',
                description: 'Offers affordable legal assistance for vacating adult convictions within the Spokane County court system. Charges $200 for Vacate and Expungement Assistance. Also provides broader civil rights legal services and community advocacy for low-income individuals.',
                services: ['conviction vacating', 'expungement assistance', 'civil rights advocacy', 'legal consultations', 'community education'],
                coordinates: { lat: 47.6574, lng: -117.4222 },
                accessibility: ['wheelchair accessible'],
                requirements: ['Spokane County convictions', '$200 fee for vacate/expungement', 'call for intake: ask for "Conviction Clearing Intake"'],
                website: 'https://centerforjustice.org',
                rating: 4.7,
                reviews: 41
            },
            {
                id: 'legal-5',
                name: 'Revive Center for Returning Citizens',
                category: 'legal',
                subcategory: 're-entry services',
                address: '901 N Monroe St, Suite 200, Spokane, WA 99201',
                phone: '(509) 319-1068',
                hours: 'Mon–Fri 9:00 AM – 5:00 PM',
                availability: 'available',
                description: 'Comprehensive re-entry support for individuals impacted by the criminal justice system. Staff have lived experience with incarceration. Provides legal aid clinics, help with Legal Financial Obligations (LFOs), re-licensing, voter restoration, and links to housing and addiction recovery services.',
                services: ['re-entry navigation', 'peer support', 'LFO assistance', 're-licensing', 'voter restoration', 'housing referrals', 'addiction treatment referrals', 'legal aid clinics'],
                coordinates: { lat: 47.6681, lng: -117.4268 },
                accessibility: ['wheelchair accessible'],
                requirements: ['individuals impacted by the criminal justice system'],
                website: 'https://rc4rc.org',
                rating: 4.8,
                reviews: 33
            },
            {
                id: 'legal-6',
                name: 'YWCA Spokane – Legal Advocacy for DV Survivors',
                category: 'legal',
                subcategory: 'domestic violence legal aid',
                address: '930 N Monroe St, Spokane, WA 99201',
                phone: '(509) 477-3656',
                hours: 'Mon–Fri 8:00 AM – 5:00 PM | First Step Fridays legal clinic on-site',
                availability: 'available',
                description: 'Provides free legal advocacy services to survivors of intimate partner domestic violence. Helps with civil protection orders, divorce, custody, and child support. Hosts "First Step Fridays" legal clinics. Advocates accompany survivors through legal proceedings.',
                services: ['protection order assistance', 'divorce & custody', 'child support', 'legal advocacy', 'court accompaniment', 'safety planning'],
                coordinates: { lat: 47.6681, lng: -117.4268 },
                accessibility: ['wheelchair accessible', 'ADA compliant'],
                requirements: ['domestic violence survivors', 'call option #1 for legal advocacy'],
                website: 'https://ywcaspokane.org',
                rating: 4.8,
                reviews: 56
            },
            {
                id: 'legal-7',
                name: 'Housing Justice Project – Eviction Defense',
                category: 'legal',
                subcategory: 'housing legal aid',
                address: '35 W Main Ave, 3rd Floor, Spokane, WA 99201',
                phone: '(509) 878-6488',
                hours: 'Clinics: 1st & 3rd Fri 1:30–3:30 PM (Library) | Thu 1–3 PM (main office)',
                availability: 'available',
                description: 'Free legal advice and representation for tenants facing eviction in Spokane County. Runs pre-eviction legal clinics at the Spokane Public Library (906 W Main Ave, 2nd Floor) on the 1st and 3rd Fridays, and post-writ clinics at their main office every Thursday.',
                services: ['eviction defense', 'tenant advice', 'legal representation', 'pre-eviction clinics', 'housing rights information'],
                coordinates: { lat: 47.6574, lng: -117.4222 },
                accessibility: ['wheelchair accessible'],
                requirements: ['Spokane County tenants', 'low-income individuals', 'no appointment needed for clinics'],
                website: 'https://kcba.org/for-the-public/housing-justice-project',
                rating: 4.6,
                reviews: 38
            },
            {
                id: 'legal-8',
                name: 'Northwest Fair Housing Alliance',
                category: 'legal',
                subcategory: 'fair housing',
                address: 'Spokane, WA (call or visit website)',
                phone: '(509) 325-2665',
                hours: 'Mon–Fri 8:30 AM – 4:30 PM',
                availability: 'available',
                description: 'Advocates for fair housing rights in the Inland Northwest. Investigates housing discrimination based on race, disability, familial status, religion, and other protected classes. Provides fair housing counseling, education, and legal referrals to protect tenants and homebuyers.',
                services: ['fair housing investigations', 'discrimination complaints', 'tenant counseling', 'fair housing education', 'legal referrals'],
                coordinates: { lat: 47.6588, lng: -117.4260 },
                accessibility: ['TTY available'],
                requirements: ['open to all — discrimination complaints welcome'],
                website: 'https://nwfairhousing.org',
                rating: 4.5,
                reviews: 24
            },
            {
                id: 'legal-9',
                name: 'Spokane Volunteer Lawyers Program',
                category: 'legal',
                subcategory: 'pro bono legal aid',
                address: 'Spokane, WA – contact for office location',
                phone: '(509) 456-7LPR',
                hours: 'Mon–Fri 9:00 AM – 5:00 PM',
                availability: 'available',
                description: 'Connects low-income individuals with volunteer attorneys for free civil legal assistance. Covers areas including family law, housing, benefits, and consumer issues. Part of the broader network of Washington State\'s civil legal aid providers.',
                services: ['pro bono legal consultations', 'family law', 'housing issues', 'benefits appeals', 'civil legal aid'],
                coordinates: { lat: 47.6582, lng: -117.4047 },
                accessibility: ['wheelchair accessible'],
                requirements: ['income eligibility required', 'civil legal matters only'],
                website: 'https://nwjustice.org/get-help',
                rating: 4.4,
                reviews: 29
            },
            {
                id: 'legal-10',
                name: 'CLEAR Hotline – Statewide Civil Legal Aid',
                category: 'legal',
                subcategory: 'legal hotline',
                address: 'Phone/statewide service (outside King County)',
                phone: '1-888-201-1014',
                hours: 'Mon–Fri 9:15 AM – 12:15 PM',
                availability: 'available',
                description: 'Statewide civil legal aid hotline from Northwest Justice Project. Callers outside King County can speak with an intake specialist about non-criminal legal problems including housing, family law, benefits, immigration, and consumer issues. Free for income-eligible individuals.',
                services: ['legal intake', 'referrals to legal aid', 'housing issues', 'family law', 'public benefits', 'immigration'],
                coordinates: { lat: 47.6588, lng: -117.4260 },
                accessibility: ['TTY: 1-888-201-1013', 'multilingual support'],
                requirements: ['income eligibility', 'civil legal matters only', 'Washington State residents'],
                website: 'https://nwjustice.org/get-help',
                rating: 4.6,
                reviews: 44
            },
            {
                id: 'legal-11',
                name: 'Washington Law Help – Self-Help Legal Resource',
                category: 'legal',
                subcategory: 'self-help legal',
                address: 'Online resource – statewide',
                phone: 'N/A – online resource',
                hours: '24/7 – available online',
                availability: 'available',
                description: 'Free online self-help legal information for Washington State residents. Covers topics including: housing and eviction, criminal records and expungement, family law, immigration, public benefits, and consumer issues. Provides forms, instructions, and referrals to local legal aid.',
                services: ['legal self-help guides', 'free legal forms', 'expungement instructions', 'eviction resources', 'benefits help', 'legal aid referrals'],
                coordinates: { lat: 47.6588, lng: -117.4260 },
                accessibility: ['screen reader compatible', 'multilingual'],
                requirements: ['Washington State residents', 'free – no income limit for online resources'],
                website: 'https://washingtonlawhelp.org',
                rating: 4.7,
                reviews: 61
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
                id: 'transportation-1',
                name: 'Spokane Transit Authority (STA)',
                category: 'transportation',
                subcategory: 'public transit',
                address: '701 W Riverside Ave, Spokane, WA 99201',
                phone: '(509) 328-1552',
                hours: 'Various routes & schedules – visit website for details',
                availability: 'available',
                description: 'Spokane\'s primary public bus system connecting the entire metro area. Offers over 30 routes across Spokane, Spokane Valley, Cheney, and surrounding communities. Reduced-fare program available for low-income riders.',
                services: ['bus service', 'paratransit', 'reduced fare program', 'route planning', 'trip planner app'],
                coordinates: { lat: 47.6582, lng: -117.4262 },
                accessibility: ['wheelchair accessible', 'ADA compliant', 'audio announcements'],
                requirements: ['fare payment', 'reduced fare available for low-income'],
                website: 'https://spokanetransit.com',
                rating: 4.0,
                reviews: 156
            },
            {
                id: 'transportation-2',
                name: 'STA Paratransit – Door-to-Door Rides',
                category: 'transportation',
                subcategory: 'paratransit',
                address: '701 W Riverside Ave, Spokane, WA 99201',
                phone: '(509) 328-1552',
                hours: 'Reservations: Daily 8:00 AM – 5:00 PM',
                availability: 'available',
                description: 'Shared-ride, door-to-door transportation service for individuals whose disability prevents them from using regular fixed-route buses. Covers most of Spokane County including Cheney, Medical Lake, Airway Heights, Liberty Lake, and Spokane Valley. Fare is $2.00 each way.',
                services: ['door-to-door rides', 'wheelchair-accessible vans', 'personal care attendant rides', 'medical appointment transport'],
                coordinates: { lat: 47.6582, lng: -117.4262 },
                accessibility: ['fully wheelchair accessible', 'lifts and ramps', 'ADA compliant'],
                requirements: ['disability eligibility required', 'must complete ADA eligibility process', '$2.00 fare each way'],
                website: 'https://spokanetransit.com/paratransit',
                rating: 4.2,
                reviews: 67
            },
            {
                id: 'transportation-3',
                name: 'Special Mobility Services (SMS) – Medicaid Transportation',
                category: 'transportation',
                subcategory: 'medical transport',
                address: '12615 E Mission Ave, Suite 312, Spokane Valley, WA 99216',
                phone: '(509) 534-9760',
                hours: 'Mon–Fri 8:00 AM – 5:00 PM | Book 2+ business days in advance',
                availability: 'available',
                description: 'Non-emergency Medicaid transportation for eligible medical appointments. Serves Spokane County residents with Washington Medicaid (Provider One card). Also offers general public transit in Deer Park and intercity shuttles to Spokane.',
                services: ['Medicaid transport', 'intercity shuttles', 'medical appointment rides', 'Deer Park local transit', 'wheelchair-accessible vehicles'],
                coordinates: { lat: 47.6734, lng: -117.2398 },
                accessibility: ['wheelchair accessible'],
                requirements: ['Washington Medicaid Provider One card required for NEMT', '2 full business days notice required'],
                website: 'https://specialmobilityservices.org',
                rating: 4.1,
                reviews: 44
            },
            {
                id: 'transportation-4',
                name: 'MedTran – Non-Emergency Medical Transportation',
                category: 'transportation',
                subcategory: 'medical transport',
                address: '9606 Gabriel St, Spokane, WA 99208',
                phone: '(800) 550-3782',
                hours: '24/7 – call to schedule',
                availability: 'available',
                description: 'Provides non-emergency medical transportation for clients needing assistance due to injury, illness, or disability. Offers both wheelchair-accessible vans and standard vehicles. Serves the greater Spokane area for medical appointments, treatment centers, and recovery programs.',
                services: ['wheelchair van transport', 'standard medical transport', 'recovery program rides', 'hospital discharge transport'],
                coordinates: { lat: 47.7142, lng: -117.4068 },
                accessibility: ['wheelchair accessible vans', 'stretcher transport available'],
                requirements: ['call to verify coverage and schedule'],
                website: 'https://medtranspokane.com',
                rating: 4.3,
                reviews: 31
            },
            {
                id: 'transportation-5',
                name: 'SNAP Resource Rides (Neighbors on the Go)',
                category: 'transportation',
                subcategory: 'senior & disability transport',
                address: '124 E Pacific Ave, Spokane, WA 99202',
                phone: '(509) 319-3050',
                hours: 'Mon–Fri – schedule at least 48 hours in advance',
                availability: 'available',
                description: 'Free or low-cost transportation for Spokane County seniors (65+) and individuals with disabilities who cannot use public transit. Primarily serves medical appointments, prescription pickups, grocery stores, and food banks. Leave a voicemail with name, phone, pickup location, and appointment time.',
                services: ['medical appointment rides', 'grocery store transport', 'prescription pickup rides', 'voluntary driver network'],
                coordinates: { lat: 47.6553, lng: -117.4042 },
                accessibility: ['wheelchair accessible vehicles available'],
                requirements: ['65+ years old OR documented disability', 'Spokane County resident', 'cannot use public transit or Medicaid transport', '48-hour advance booking required'],
                website: 'https://snapwa.org',
                rating: 4.6,
                reviews: 28
            },
            {
                id: 'transportation-6',
                name: 'Packs Transport – Medical & Recovery Rides',
                category: 'transportation',
                subcategory: 'medical transport',
                address: 'Spokane, WA (service area – call for details)',
                phone: '(509) 202-4974',
                hours: '24/7 – call to schedule',
                availability: 'available',
                description: 'Dedicated non-emergency medical transportation serving the Spokane community. Ideal for addiction treatment appointments, outpatient visits, and recovery program transportation. Professional, reliable service for individuals without access to personal vehicles.',
                services: ['medical transport', 'treatment center rides', 'outpatient appointment transport', 'recovery program transport'],
                coordinates: { lat: 47.6588, lng: -117.4260 },
                accessibility: ['wheelchair accessible options'],
                requirements: ['call to schedule and verify availability'],
                website: 'https://packstransport.com',
                rating: 4.4,
                reviews: 19
            },
            {
                id: 'transportation-7',
                name: 'Freedom Northwest Transport Services',
                category: 'transportation',
                subcategory: 'medical transport',
                address: 'Spokane, WA & North Idaho (call for service area)',
                phone: '(208) 660-0960',
                hours: 'Mon–Fri 7:00 AM – 6:00 PM | Weekends by arrangement',
                availability: 'available',
                description: 'Medical and non-medical wheelchair-accessible transportation for individuals and health facilities across Northeast Washington and Northwest Idaho. Serves Spokane-area recovery programs, clinics, and hospitals with professional medical transport.',
                services: ['wheelchair transport', 'medical facility transfers', 'hospital discharge rides', 'recovery clinic transport', 'stretcher transport'],
                coordinates: { lat: 47.6588, lng: -117.4260 },
                accessibility: ['fully wheelchair accessible', 'lift-equipped vehicles'],
                requirements: ['call to verify service area and schedule'],
                website: 'https://freedomnwts.com',
                rating: 4.5,
                reviews: 22
            },
            {
                id: 'transportation-8',
                name: 'CHAS Health – Patient Transportation Assistance',
                category: 'transportation',
                subcategory: 'medical transport assistance',
                address: '611 W 2nd Ave, Spokane, WA 99201',
                phone: '(509) 444-8200',
                hours: 'Mon–Fri 8:00 AM – 5:00 PM',
                availability: 'available',
                description: 'CHAS Health provides bus passes and Paratransit passes at their front desks for patients in need. Their Patient Resources Coordinator helps Medicaid clients arrange rides to covered health appointments and can refer to Special Mobility Services (SMS) for non-emergency medical transportation.',
                services: ['bus pass assistance', 'paratransit pass assistance', 'Medicaid ride coordination', 'referrals to SMS', 'patient resource coordination'],
                coordinates: { lat: 47.6582, lng: -117.4195 },
                accessibility: ['wheelchair accessible', 'ADA compliant'],
                requirements: ['CHAS patient preferred', 'Medicaid assistance requires Provider One card'],
                website: 'https://chas.org',
                rating: 4.5,
                reviews: 36
            },
            {
                id: 'transportation-9',
                name: 'Spokane Valley Partners – Transportation Referrals',
                category: 'transportation',
                subcategory: 'transportation assistance',
                address: '10814 E Broadway Ave, Spokane Valley, WA 99206',
                phone: '(509) 927-1153',
                hours: 'Mon–Fri 8:00 AM – 5:00 PM',
                availability: 'available',
                description: 'Spokane Valley Partners connects residents with local transportation resources including bus passes, referrals to Paratransit and SMS, and volunteer driver networks. Especially helpful for those in early recovery navigating transportation barriers to treatment and appointments.',
                services: ['bus pass assistance', 'transportation referrals', 'volunteer driver coordination', 'emergency transport help'],
                coordinates: { lat: 47.6734, lng: -117.2398 },
                accessibility: ['wheelchair accessible'],
                requirements: ['Spokane Valley area residents preferred', 'proof of need'],
                website: 'https://svpart.org',
                rating: 4.3,
                reviews: 24
            },
            {
                id: 'transportation-10',
                name: '211 Spokane – Transportation Resource Hotline',
                category: 'transportation',
                subcategory: 'transportation assistance',
                address: 'Phone/online service – Spokane County',
                phone: '211',
                hours: '24/7',
                availability: 'available',
                description: 'Dial 2-1-1 to reach a live specialist who can connect you with transportation resources throughout Spokane County. Helpful for finding free or low-cost rides to medical appointments, recovery programs, court dates, and other critical destinations.',
                services: ['transportation referrals', 'resource navigation', '24/7 hotline', 'multilingual support', 'web search at wa211.org'],
                coordinates: { lat: 47.6588, lng: -117.4260 },
                accessibility: ['TTY available', 'multilingual'],
                requirements: ['open to all Spokane County residents'],
                website: 'https://wa211.org',
                rating: 4.7,
                reviews: 52
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
        console.log('ResourceDirectory: Filtering resources...');
        console.log('ResourceDirectory: Filters:', JSON.stringify(this.currentFilters));
        console.log('ResourceDirectory: Source resources count:', this.resources.length);
        
        try {
            this.filteredResources = this.resources.filter(resource => {
                // Search filter
                if (this.currentFilters.search && this.currentFilters.search.trim() !== '') {
                    const searchTerm = this.currentFilters.search.trim().toLowerCase();
                    const name = (resource.name || '').toLowerCase();
                    const desc = (resource.description || '').toLowerCase();
                    const services = Array.isArray(resource.services) ? resource.services.join(' ').toLowerCase() : '';
                    
                    const searchableText = `${name} ${desc} ${services}`;
                    if (!searchableText.includes(searchTerm)) {
                        return false;
                    }
                }
                
                // Category filter
                if (this.currentFilters.category !== 'all' && resource.category !== this.currentFilters.category) {
                    return false;
                }
                
                // Location filter (subcategory)
                if (this.currentFilters.location !== 'all' && resource.subcategory !== this.currentFilters.location) {
                    return false;
                }
                
                // Availability filter
                if (this.currentFilters.availability !== 'all' && resource.availability !== this.currentFilters.availability) {
                    return false;
                }
                
                return true;
            });
            console.log('ResourceDirectory: Filtering complete. Match count:', this.filteredResources.length);
        } catch (error) {
            console.error('ResourceDirectory: Filtering error:', error);
            this.filteredResources = [...this.resources];
        }
        
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
        if (!container) {
            console.warn('ResourceDirectory: Results container (#resourceResults) not found in DOM.');
            return;
        }
        
        console.log('ResourceDirectory: Rendering results to container.');

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
        if (!resource) return '';
        
        const ratingStars = this.generateRatingStars(resource.rating || 0);
        const categoryIcon = this.getCategoryIcon(resource.category || 'default');
        const availabilityBadge = this.getAvailabilityBadge(resource.availability || 'unknown');
        const address = resource.address || 'Address not available';
        const name = resource.name || 'Unnamed Resource';

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
            'ministry': 'bi-pray'
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