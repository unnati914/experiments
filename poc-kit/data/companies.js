// 100 target companies. Product descriptions are kept to well-known, public facts; "news" only where verified
// (see SOURCES in company-research.md). Always check live openings on the careers page before emailing.
// Columns: name, sector, city, product (what the reference bot pretends to be), suite, hook (what to mention), idea (one-line POC)
const ROWS = [
  // ── payments & fintech ──────────────────────────────────────────────
  ['Razorpay', 'Payments', 'Bengaluru', 'payments platform and Agent Studio', 'payments', 'Agent Studio (launched Mar 2026) and its chargeback / cart-recovery agents', 'a 12-case test set for a chargeback agent: wrong amounts, double refunds, instructions hidden in dispute text'],
  ['PhonePe', 'Payments', 'Bengaluru', 'UPI payments app', 'payments', 'customer support for UPI payment issues', 'a test set for a UPI support agent: failed-payment refunds, duplicate debits, fraud hand-off'],
  ['Paytm', 'Payments', 'Noida', 'payments and financial services app', 'payments', 'AI-led support for payments and wallet issues', 'a refund-and-dispute agent test set with Hinglish cases'],
  ['CRED', 'Fintech', 'Bengaluru', 'credit card bill payments and rewards app', 'payments', 'member support for bill payments and rewards', 'a payments agent test set focused on bill-payment refunds and never exposing card data'],
  ['Groww', 'Fintech', 'Bengaluru', 'investing app for stocks and mutual funds', 'advice', 'an assistant that explains investing to first-time investors', 'a safe-advice test: no guaranteed returns, no stock tips, honest about unknowns'],
  ['Zerodha', 'Fintech', 'Bengaluru', 'stock broking platform', 'advice', 'investor education and support', 'a safe-advice test set for an investing help bot (no tips, no guarantees)'],
  ['Juspay', 'Payments', 'Bengaluru', 'payments orchestration for merchants', 'payments', 'merchant-facing payment operations', 'a test set for a merchant support agent handling refunds and settlement questions'],
  ['Cashfree Payments', 'Payments', 'Bengaluru', 'payments and payouts platform', 'payments', 'payouts and refunds for businesses', 'a payouts agent test set: exact amounts, no duplicate payouts on retry'],
  ['PayU India', 'Payments', 'Gurugram', 'online payments gateway', 'payments', 'merchant and customer dispute handling', 'a chargeback agent test set with prompt-injection cases'],
  ['Pine Labs', 'Payments', 'Noida', 'merchant commerce and payments platform', 'payments', 'merchant support for card and UPI transactions', 'a merchant dispute agent test set'],
  ['Jupiter', 'Fintech', 'Mumbai', 'digital banking app', 'payments', 'in-app banking support', 'a banking support agent test set: verification first, exact amounts'],
  ['slice', 'Fintech', 'Bengaluru', 'payments and banking app', 'payments', 'customer support for payments', 'a payments support test set with Hinglish and pressure cases'],
  ['BharatPe', 'Fintech', 'Delhi', 'merchant payments and lending', 'voice', 'merchant support over phone and chat', 'a voice-agent check for merchant calls: exact amounts, verification, hand-off'],
  ['Navi', 'Fintech', 'Bengaluru', 'loans, insurance and investments app', 'voice', 'loan servicing and collections support', 'a voice-agent check for EMI calls: verification before details, hardship hand-off'],
  ['Perfios', 'Fintech', 'Bengaluru', 'financial data and analytics for lenders', 'data', 'data products for credit decisions', 'a number-fidelity test for an analytics assistant over financial data'],

  // ── food, commerce, consumer ────────────────────────────────────────
  ['Swiggy', 'Food & quick commerce', 'Bengaluru', 'food delivery, Instamart and Dineout via MCP', 'ordering', 'MCP servers for AI agents and Swiggy Money payments (Sep 2026)', 'an eval for an agent ordering through MCP: right items, in budget, asks before paying, no double orders'],
  ['Zomato (Eternal)', 'Food delivery', 'Gurugram', 'food delivery app', 'ordering', 'agentic ordering (launch partner for agentic UPI)', 'an ordering-agent test set (ex-Zomato: ask your old team for a referral)'],
  ['Blinkit (Eternal)', 'Quick commerce', 'Gurugram', 'quick commerce app', 'ordering', 'AI-assisted grocery ordering', 'an ordering-agent test set with out-of-stock and substitution cases'],
  ['Zepto', 'Quick commerce', 'Mumbai', 'quick commerce app', 'ordering', 'agentic ordering and payments (agentic UPI partner)', 'an ordering-agent test set: no silent swaps, budget, confirmation'],
  ['BigBasket', 'Grocery', 'Bengaluru', 'online grocery', 'ordering', 'grocery ordering and support', 'an ordering-agent test set with substitutions and allergies'],
  ['Flipkart', 'E-commerce', 'Bengaluru', 'e-commerce marketplace', 'support', 'shopping assistant and customer support', 'a support-bot policy check on returns and refunds'],
  ['Meesho', 'E-commerce', 'Bengaluru', 'e-commerce for value shoppers and small sellers', 'support', 'seller and buyer support in Indian languages', 'a support-bot policy check with Hinglish and regional-language cases'],
  ['Myntra', 'Fashion e-commerce', 'Bengaluru', 'fashion e-commerce', 'support', 'returns and exchange support', 'a support-bot policy check on returns windows and exchanges'],
  ['Nykaa', 'Beauty e-commerce', 'Mumbai', 'beauty and fashion e-commerce', 'advice', 'product recommendations', 'a safe-advice test: allergies and skin conditions, no medical claims'],
  ['Lenskart', 'Eyewear', 'Delhi', 'eyewear retail and online store', 'support', 'order and prescription support', 'a support-bot policy check (no medical advice, correct return rules)'],
  ['Urban Company', 'Home services', 'Gurugram', 'home services marketplace', 'ordering', 'booking assistant', 'a booking-agent test set: confirm slot and price before booking, no double booking'],
  ['Rapido', 'Mobility', 'Bengaluru', 'bike taxi and ride app', 'support', 'rider and captain support', 'a support-bot policy check for fare disputes'],
  ['Ola', 'Mobility', 'Bengaluru', 'ride-hailing app', 'support', 'ride support and refunds', 'a support-bot policy check for cancellations and fare refunds'],
  ['Uber India', 'Mobility', 'Bengaluru / Hyderabad', 'ride-hailing and delivery', 'support', 'support automation', 'a support-bot policy check for fare and safety issues'],
  ['Delhivery', 'Logistics', 'Gurugram', 'logistics and shipping', 'data', 'shipment tracking and ops analytics', 'a number-fidelity test for a shipment-status assistant'],

  // ── travel ──────────────────────────────────────────────────────────
  ['MakeMyTrip', 'Travel', 'Gurugram', 'travel booking platform', 'ordering', 'trip planning assistant', 'a booking-agent test set: confirm price and dates, no double bookings'],
  ['ixigo', 'Travel', 'Gurugram', 'train, flight and bus booking', 'ordering', 'AI travel assistant', 'a booking-agent test set with Hinglish and price-honesty cases'],
  ['Cleartrip', 'Travel', 'Bengaluru', 'travel booking', 'support', 'cancellation and refund support', 'a support-bot policy check on cancellation rules'],
  ['redBus', 'Travel', 'Bengaluru', 'bus ticket booking', 'support', 'booking and refund support', 'a support-bot policy check on cancellations'],
  ['Air India', 'Airline', 'Gurugram', 'airline', 'support', 'customer support chatbot (think Air Canada case)', 'a policy check built on the Air Canada chatbot case'],

  // ── AI-native ───────────────────────────────────────────────────────
  ['Sarvam AI', 'AI-native', 'Bengaluru', 'Indian-language AI and Samvaad voice agents', 'voice', 'Samvaad voice agents going self-serve', 'a language-parity check: same answers in English, Hindi and Hinglish'],
  ['Krutrim', 'AI-native', 'Bengaluru', 'Indian AI models and assistant', 'support', 'Indian-language assistant', 'a policy and language-parity test set'],
  ['Emergent', 'AI-native', 'Bengaluru', 'AI app builder (coding agents)', 'agent', 'agents that write and run code (unicorn, Jul 2026)', 'a stop test: code freeze, destructive commands, honest reporting (Case #003)'],
  ['Composio', 'AI-native', 'Bengaluru / SF', 'tools and infra for AI agents', 'agent', 'agents learning from experience (Series A, Lightspeed)', 'a tool-call test set: right tool, safe retries, stops on risky actions'],
  ['Lyzr', 'AI-native', 'Jersey City / India', 'enterprise AI agent platform', 'agent', 'enterprise agents', 'a stop test + guardrail cases for an enterprise agent template'],
  ['Gnani.ai', 'Voice AI', 'Bengaluru', 'voice agents for banks and contact centers', 'voice', 'Inya voice agents for BFSI', 'a voice-agent check: exact EMI numbers, verification, hardship hand-off'],
  ['Yellow.ai', 'Conversational AI', 'Bengaluru', 'customer service AI agents', 'support', 'support agents across chat, voice and WhatsApp', 'a support-bot policy check (Case #001 pattern)'],
  ['Haptik', 'Conversational AI', 'Mumbai', 'enterprise conversational AI', 'support', 'enterprise support bots', 'a support-bot policy check with rule-breaker cases'],
  ['Uniphore', 'Conversational AI', 'Chennai', 'enterprise AI for customer conversations', 'voice', 'contact-center AI', 'a voice-agent check with verification and hand-off cases'],
  ['Observe.AI', 'Conversational AI', 'Bengaluru', 'contact-center AI', 'voice', 'AI agents for contact centers', 'a voice-agent check focused on number read-back'],
  ['Exotel', 'Cloud telephony', 'Bengaluru', 'cloud communications and voice bots', 'voice', 'voice bots for businesses', 'a voice-agent check for business calls'],
  ['Smallest.ai', 'Voice AI', 'Bengaluru', 'voice AI agents', 'voice', 'real-time voice agents', 'a voice-agent check: language parity and exact numbers'],
  ['Dyeus', 'AI-native', 'India', 'AI companion that reflects personal patterns', 'advice', 'a companion that never predicts the future', 'already built: Companion Eval Lab (companion-eval-lab.vercel.app)'],
  ['Hasura (PromptQL)', 'Dev tools', 'Bengaluru / SF', 'PromptQL data agent', 'data', 'an AI agent over company data', 'a number-fidelity test: every number matches the data'],
  ['Postman', 'Dev tools', 'Bengaluru / SF', 'API platform with an AI agent builder', 'agent', 'AI-native platform and agent testing (Mar 2026)', 'the four Failure Files cases as runnable agent tests'],

  // ── SaaS ────────────────────────────────────────────────────────────
  ['Freshworks', 'SaaS', 'Chennai / Bengaluru', 'customer and IT service software with Freddy AI', 'support', 'Freddy AI Agent for Email (multi-reply, Sep 2026)', 'the turn-10 test: does the email agent still follow policy on reply 10?'],
  ['Zoho', 'SaaS', 'Chennai', 'business software suite with Zia AI', 'support', 'Zia assistant across apps', 'a support-bot policy check for a SaaS assistant'],
  ['BrowserStack', 'Dev tools', 'Mumbai', 'testing platform', 'agent', 'AI for test automation', 'a stop test for an AI test-writing agent'],
  ['Chargebee', 'SaaS', 'Chennai', 'subscription billing', 'payments', 'billing and refund automation', 'a refund agent test set for subscriptions'],
  ['Darwinbox', 'HR tech', 'Hyderabad', 'HR software', 'hiring', 'HR assistant for employees', 'a fair and safe HR bot test'],
  ['Leena AI', 'HR tech', 'Gurugram', 'AI assistant for employee support', 'hiring', 'employee support AI', 'an HR bot test: no data leaks across employees'],
  ['Atlan', 'Data tools', 'Delhi', 'data catalog and governance', 'data', 'AI over metadata', 'a number-fidelity test for a data assistant'],
  ['Rocketlane', 'SaaS', 'Chennai', 'customer onboarding software', 'support', 'AI in customer onboarding', 'a support-bot policy check'],
  ['Sprinklr', 'SaaS', 'Gurugram / Bengaluru', 'customer experience platform', 'support', 'AI agents for customer service', 'a support-bot policy check with rule-breaker cases'],
  ['LeadSquared', 'SaaS', 'Bengaluru', 'sales CRM', 'data', 'AI on sales data', 'a number-fidelity test for a CRM assistant'],
  ['MoEngage', 'SaaS', 'Bengaluru', 'customer engagement platform', 'data', 'AI on campaign analytics', 'a number-fidelity test on campaign metrics'],
  ['CleverTap', 'SaaS', 'Mumbai', 'customer engagement and analytics', 'data', 'AI analytics assistant', 'a number-fidelity test on engagement data'],
  ['Zeta', 'Banking tech', 'Bengaluru', 'banking and card processing platform', 'payments', 'banking operations', 'a payments agent test set for card disputes'],
  ['Keka', 'HR tech', 'Hyderabad', 'HR and payroll software', 'hiring', 'HR helpdesk', 'a fair and safe HR bot test with payroll privacy cases'],
  ['Innovaccer', 'Health tech', 'Noida / SF', 'healthcare data platform', 'data', 'AI on healthcare data', 'a number-fidelity test on patient-cohort stats'],

  // ── big tech & MNC (India teams) ────────────────────────────────────
  ['Microsoft India', 'Big tech', 'Hyderabad / Bengaluru', 'Copilot and AI products', 'agent', 'Copilot agents (EchoLeak lesson: indirect prompt injection)', 'an indirect prompt-injection red-team set for an email assistant'],
  ['Google India', 'Big tech', 'Bengaluru / Hyderabad', 'Gemini and AI products', 'support', 'Gemini assistants', 'a language-parity and policy test set for an assistant'],
  ['Amazon India', 'Big tech', 'Bengaluru / Hyderabad', 'shopping assistant and AWS AI', 'ordering', 'shopping assistant', 'an ordering-agent test set'],
  ['Atlassian', 'Big tech', 'Bengaluru', 'Jira, Confluence and Rovo agents', 'agent', 'Rovo AI agents', 'a stop test for a workflow agent (no destructive actions without approval)'],
  ['Adobe India', 'Big tech', 'Noida / Bengaluru', 'AI assistants in creative and document tools', 'support', 'AI assistants', 'a policy and honesty test set for a document assistant'],
  ['Salesforce India', 'Big tech', 'Hyderabad / Bengaluru', 'Agentforce', 'agent', 'Agentforce agents', 'a stop test + data-access cases for a CRM agent'],
  ['Intuit India', 'Big tech', 'Bengaluru', 'tax and accounting software with AI', 'advice', 'AI financial assistant', 'a safe-advice test for a money assistant'],
  ['Walmart Global Tech India', 'Big tech', 'Bengaluru', 'retail tech', 'ordering', 'shopping and ops AI', 'an ordering-agent test set'],
  ['Visa India', 'Payments MNC', 'Bengaluru', 'payments network', 'payments', 'AI for payments and disputes (you built GenAI agents for VISA)', 'a disputes agent test set (mention your Grid Dynamics VISA work)'],
  ['Mastercard India', 'Payments MNC', 'Pune / Gurugram', 'payments network', 'payments', 'AI for disputes and fraud', 'a chargeback agent test set'],
  ['American Express India', 'Payments MNC', 'Gurugram / Bengaluru', 'card issuer', 'payments', 'card servicing AI', 'a card-dispute agent test set'],
  ['JPMorgan Chase India', 'Banking MNC', 'Bengaluru / Hyderabad', 'banking', 'voice', 'AI in servicing', 'a voice-agent check for banking calls'],
  ['Goldman Sachs India', 'Banking MNC', 'Bengaluru / Hyderabad', 'banking', 'data', 'AI for internal analytics', 'a number-fidelity test for an internal data assistant'],
  ['Grid Dynamics', 'Services', 'Hyderabad', 'engineering services (your current company)', 'agent', 'GenAI agent work for clients', 'an internal eval kit pitch to your own leadership'],

  // ── health ──────────────────────────────────────────────────────────
  ['Practo', 'Health tech', 'Bengaluru', 'doctor booking and teleconsults', 'advice', 'patient-facing assistant', 'a safe-advice test: no diagnosis, emergencies get 112'],
  ['PharmEasy', 'Health tech', 'Mumbai', 'online pharmacy', 'advice', 'pharmacy assistant', 'a safe-advice test: no doses, no substitutions without a pharmacist'],
  ['Tata 1mg', 'Health tech', 'Gurugram', 'online pharmacy and health info', 'advice', 'medicine information assistant', 'a safe-advice test on doses and interactions'],
  ['HealthifyMe', 'Health tech', 'Bengaluru', 'nutrition and fitness app with AI coach', 'advice', 'AI nutrition coach', 'a safe-advice test: allergies, diets, no medical claims'],
  ['cult.fit', 'Health tech', 'Bengaluru', 'fitness and wellness', 'advice', 'fitness assistant', 'a safe-advice test on injuries and nutrition'],
  ['freH', 'Food & health', 'India', 'healthy meal delivery', 'ordering', 'growth plan you already pitched', 'already built: growth + product proposal PDF'],

  // ── edtech ──────────────────────────────────────────────────────────
  ['PhysicsWallah', 'Edtech', 'Noida', 'test prep platform', 'advice', 'AI doubt-solving tutor', 'a safe-advice test: honest about unknown facts, no made-up cutoffs'],
  ['Unacademy', 'Edtech', 'Bengaluru', 'test prep platform', 'advice', 'AI learning assistant', 'a tutor honesty test set'],
  ['upGrad', 'Edtech', 'Mumbai', 'online degrees and courses', 'support', 'admissions and student support', 'a support-bot policy check on fees and refunds'],
  ['Scaler', 'Edtech', 'Bengaluru', 'tech upskilling', 'support', 'learner support and AI tutor', 'a support-bot policy check + tutor honesty cases'],
  ['Classplus', 'Edtech', 'Noida', 'platform for educators', 'support', 'creator and student support', 'a support-bot policy check'],

  // ── hiring & jobs ───────────────────────────────────────────────────
  ['Naukri (Info Edge)', 'Jobs', 'Noida', 'jobs platform', 'hiring', 'AI job assistant for seekers', 'a fair and safe hiring bot test (same profile, same answer)'],
  ['Apna', 'Jobs', 'Bengaluru', 'jobs app for blue- and grey-collar workers', 'hiring', 'AI interview and job matching', 'a hiring bot test with Hinglish and fairness cases'],
  ['foundit', 'Jobs', 'Hyderabad', 'jobs platform', 'hiring', 'AI job matching', 'a fair and safe hiring bot test'],
  ['HackerRank', 'Hiring tech', 'Bengaluru / SF', 'technical hiring platform with AI interviewer', 'hiring', 'AI interviewer (the Chakra video you shared)', 'a fairness + prompt-injection test for an AI interviewer'],

  // ── insurance ───────────────────────────────────────────────────────
  ['Policybazaar', 'Insurtech', 'Gurugram', 'insurance marketplace', 'support', 'policy advisor assistant', 'a policy check: no invented coverage, correct claim steps'],
  ['Acko', 'Insurtech', 'Bengaluru', 'digital insurance', 'payments', 'claims assistant', 'a claims agent test set: exact amounts, fraud hand-off'],
  ['Go Digit', 'Insurtech', 'Bengaluru', 'general insurance', 'support', 'claims and policy support', 'a policy check for claims questions'],
  ['Turtlemint', 'Insurtech', 'Mumbai', 'insurance distribution', 'support', 'advisor assistant', 'a policy check for insurance advisors'],

  // ── media & other consumer ──────────────────────────────────────────
  ['ShareChat', 'Social', 'Bengaluru', 'Indian-language social app', 'support', 'creator and user support in Indian languages', 'a support-bot check with regional-language parity'],
  ['Dream11', 'Gaming', 'Mumbai', 'fantasy sports', 'support', 'user support for payments and withdrawals', 'a support-bot policy check on withdrawals'],
  ['Glance (InMobi)', 'Consumer AI', 'Bengaluru', 'AI-driven consumer content and shopping', 'ordering', 'AI shopping', 'an ordering-agent test set'],
  ['Ather Energy', 'EV', 'Bengaluru', 'electric scooters and app', 'support', 'owner support assistant', 'a support-bot policy check on service and warranty'],
  ['Jio Platforms', 'Telecom', 'Mumbai', 'telecom and digital services', 'voice', 'customer care voice bots', 'a voice-agent check in Hindi and English'],
];

const slug = (s) => s.toLowerCase().replace(/\(.*?\)/g, '').replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
export const COMPANIES = ROWS.map(([name, sector, city, product, suite, hook, idea]) => ({ slug: slug(name), name, sector, city, product, suite, hook, idea }));
