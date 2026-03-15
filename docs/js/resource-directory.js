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