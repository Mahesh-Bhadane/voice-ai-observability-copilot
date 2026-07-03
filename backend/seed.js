require('dotenv').config();
const { randomUUID } = require('crypto');
const db = require('./db');

const AGENT1_ID = 'agent-appointment-001';
const AGENT2_ID = 'agent-leadqual-002';

const agents = [
  {
    id: AGENT1_ID,
    name: 'Appointment Booking Bot',
    script: 'You are an AI appointment booking assistant for a SaaS company. Your goal is to schedule a 30-minute product demo. Collect: full name, email, phone number, preferred time slot. Confirm the appointment clearly and set expectations about what happens next.',
    success_criteria: JSON.stringify(['confirmed_appointment', 'collected_name', 'collected_email', 'collected_phone', 'set_next_steps']),
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: AGENT2_ID,
    name: 'Lead Qualification Bot',
    script: 'You are an AI lead qualification assistant. Your goal is to qualify inbound leads by determining: budget range, timeline to purchase, who the decision maker is, and what their main pain point is. Book a follow-up call with a human sales rep if qualified.',
    success_criteria: JSON.stringify(['budget_confirmed', 'timeline_established', 'decision_maker_identified', 'pain_point_captured', 'next_step_agreed']),
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  }
];

// --- APPOINTMENT BOOKING BOT CALLS ---

const appointmentCalls = [
  // Call 1: Fully successful - enthusiastic prospect
  {
    caller: 'Sarah Mitchell',
    duration_sec: 342,
    started_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    transcript: JSON.stringify([
      { role: 'agent', text: "Hi there! Thanks for reaching out to us. I'm your appointment scheduling assistant. I'd love to get a 30-minute product demo booked for you. Can I start with your full name?", turn: 1 },
      { role: 'caller', text: "Sure! My name is Sarah Mitchell.", turn: 2 },
      { role: 'agent', text: "Great to meet you, Sarah! And what's the best email address to send your calendar invite to?", turn: 3 },
      { role: 'caller', text: "It's sarah.mitchell@techcorp.com", turn: 4 },
      { role: 'agent', text: "Perfect. And the best phone number to reach you at, in case there are any last-minute changes?", turn: 5 },
      { role: 'caller', text: "That would be 415-555-0182.", turn: 6 },
      { role: 'agent', text: "Got it, 415-555-0182. Now let's find a time that works for you. We have availability Tuesday through Thursday next week, mornings or afternoons. Do you have a preference?", turn: 7 },
      { role: 'caller', text: "Wednesday afternoon would be perfect. Maybe around 2pm?", turn: 8 },
      { role: 'agent', text: "Wednesday at 2pm works great! Let me confirm: I'm booking a 30-minute product demo for Sarah Mitchell at sarah.mitchell@techcorp.com, phone 415-555-0182, this Wednesday at 2:00 PM. Does that all look correct?", turn: 9 },
      { role: 'caller', text: "Yes, that's all correct!", turn: 10 },
      { role: 'agent', text: "Wonderful! You'll receive a calendar invite at your email within the next few minutes. One of our product specialists will walk you through the platform, answer any questions you have, and discuss how we can fit your specific needs. Is there anything particular you'd like to make sure we cover in the demo?", turn: 11 },
      { role: 'caller', text: "Actually yes — we're really interested in the analytics dashboard and the API integrations.", turn: 12 },
      { role: 'agent', text: "Perfect, I'll make a note of that so your specialist comes prepared to dive into the analytics dashboard and API integrations specifically. You're all set, Sarah! We'll see you Wednesday at 2 PM. Have a great day!", turn: 13 },
      { role: 'caller', text: "Thank you so much!", turn: 14 }
    ])
  },

  // Call 2: Fully successful - corporate buyer
  {
    caller: 'James Thornton',
    duration_sec: 418,
    started_at: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString(),
    transcript: JSON.stringify([
      { role: 'agent', text: "Hello! Thank you for your interest. I'm here to schedule your product demo. May I have your full name to get started?", turn: 1 },
      { role: 'caller', text: "James Thornton, VP of Operations at Meridian Group.", turn: 2 },
      { role: 'agent', text: "Thank you, James. What email address should I use for the calendar invite?", turn: 3 },
      { role: 'caller', text: "Use j.thornton@meridiangroup.com", turn: 4 },
      { role: 'agent', text: "Got it. And your best phone number?", turn: 5 },
      { role: 'caller', text: "312-555-0940", turn: 6 },
      { role: 'agent', text: "Thank you. We have openings Monday, Tuesday, and Wednesday next week. Mornings tend to be popular — would something like 10 AM work for you?", turn: 7 },
      { role: 'caller', text: "Tuesday at 10 AM is fine.", turn: 8 },
      { role: 'agent', text: "Excellent. To confirm: 30-minute product demo for James Thornton, j.thornton@meridiangroup.com, phone 312-555-0940, Tuesday at 10:00 AM. Correct?", turn: 9 },
      { role: 'caller', text: "That's correct.", turn: 10 },
      { role: 'agent', text: "You're all set, James. You'll receive a calendar invite shortly. The demo will be led by one of our senior product specialists who will walk you through our platform's capabilities. After the demo, if you'd like to move forward, we can discuss a pilot program tailored to Meridian Group's needs. Is there anything specific you'd like us to prepare for?", turn: 11 },
      { role: 'caller', text: "Yes, we run a distributed team across three time zones, so I'll want to see the collaboration and reporting features.", turn: 12 },
      { role: 'agent', text: "Noted — distributed team collaboration and cross-timezone reporting. Your specialist will have that ready for you. We look forward to speaking with you Tuesday, James. Have a great day!", turn: 13 },
      { role: 'caller', text: "You too, thanks.", turn: 14 }
    ])
  },

  // Call 3: Fully successful - small business owner
  {
    caller: 'Maria Gonzalez',
    duration_sec: 295,
    started_at: new Date(Date.now() - 19 * 24 * 60 * 60 * 1000).toISOString(),
    transcript: JSON.stringify([
      { role: 'agent', text: "Hi! Welcome. I'm going to help you schedule a quick 30-minute demo of our platform. What's your full name?", turn: 1 },
      { role: 'caller', text: "Maria Gonzalez.", turn: 2 },
      { role: 'agent', text: "Hi Maria! And your email address for the calendar invite?", turn: 3 },
      { role: 'caller', text: "maria@gonzalezcleaning.com", turn: 4 },
      { role: 'agent', text: "Perfect. Best phone number?", turn: 5 },
      { role: 'caller', text: "720-555-0337", turn: 6 },
      { role: 'agent', text: "Great. What day and time works best for you? We're flexible morning or afternoon, Monday through Friday.", turn: 7 },
      { role: 'caller', text: "Can we do Thursday morning? Maybe 9am?", turn: 8 },
      { role: 'agent', text: "Thursday at 9 AM works perfectly. Confirming: demo for Maria Gonzalez, maria@gonzalezcleaning.com, 720-555-0337, Thursday 9:00 AM. Does that look right?", turn: 9 },
      { role: 'caller', text: "Yes that's right.", turn: 10 },
      { role: 'agent', text: "You're booked! Check your email for the invite. Our team will show you exactly how the platform works for businesses like yours and answer all your questions. After the demo, we'll provide a custom quote. Looking forward to Thursday, Maria!", turn: 11 },
      { role: 'caller', text: "Great, thank you!", turn: 12 }
    ])
  },

  // Call 4: Fully successful - referred prospect
  {
    caller: 'David Park',
    duration_sec: 380,
    started_at: new Date(Date.now() - 17 * 24 * 60 * 60 * 1000).toISOString(),
    transcript: JSON.stringify([
      { role: 'agent', text: "Hello! I'm your demo scheduling assistant. Happy to get you set up with a 30-minute product walkthrough. Can I get your full name first?", turn: 1 },
      { role: 'caller', text: "David Park. I was referred by Lisa Chen at Orbit Digital.", turn: 2 },
      { role: 'agent', text: "Wonderful, David, and welcome! We love referrals from Orbit Digital. What email should I send the calendar invite to?", turn: 3 },
      { role: 'caller', text: "david.park@parkventures.io", turn: 4 },
      { role: 'agent', text: "Got it. And your phone number?", turn: 5 },
      { role: 'caller', text: "206-555-0773", turn: 6 },
      { role: 'agent', text: "Thanks David. We have great availability this week and next. Any day or time that works particularly well for you?", turn: 7 },
      { role: 'caller', text: "Friday afternoon works best for me. Around 3pm?", turn: 8 },
      { role: 'agent', text: "Friday at 3 PM is available. To confirm everything: product demo for David Park, david.park@parkventures.io, 206-555-0773, this Friday at 3:00 PM. All good?", turn: 9 },
      { role: 'caller', text: "Perfect, yes.", turn: 10 },
      { role: 'agent', text: "You're all set, David! Calendar invite incoming. Since Lisa referred you, your specialist will already know a bit about your context. After the demo, we'll discuss next steps including any special partner pricing. Is there anything you'd especially like to cover?", turn: 11 },
      { role: 'caller', text: "I'd like to understand the onboarding process and support model.", turn: 12 },
      { role: 'agent', text: "Excellent questions — I'll note onboarding and support model as focus areas. See you Friday at 3, David!", turn: 13 },
      { role: 'caller', text: "Sounds great.", turn: 14 }
    ])
  },

  // Call 5: Fully successful - returning visitor
  {
    caller: 'Amanda Yee',
    duration_sec: 265,
    started_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    transcript: JSON.stringify([
      { role: 'agent', text: "Hi there! I'm here to schedule your product demo. Can I get your full name?", turn: 1 },
      { role: 'caller', text: "Amanda Yee.", turn: 2 },
      { role: 'agent', text: "Hi Amanda! And your email for the invite?", turn: 3 },
      { role: 'caller', text: "amanda.yee@clearpath.co", turn: 4 },
      { role: 'agent', text: "Great. Phone number?", turn: 5 },
      { role: 'caller', text: "650-555-0129", turn: 6 },
      { role: 'agent', text: "Perfect. What time works for you? We have slots throughout the week.", turn: 7 },
      { role: 'caller', text: "Monday at 11 is good.", turn: 8 },
      { role: 'agent', text: "Monday at 11 AM confirmed! Demo for Amanda Yee, amanda.yee@clearpath.co, 650-555-0129. I'll send the invite right over. Your specialist will cover the full platform and discuss pricing options. See you Monday!", turn: 9 },
      { role: 'caller', text: "Thanks, looking forward to it.", turn: 10 }
    ])
  },

  // Call 6: Partial failure - forgot to set next steps context
  {
    caller: 'Robert Hoffman',
    duration_sec: 289,
    started_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    transcript: JSON.stringify([
      { role: 'agent', text: "Hello! I can help you schedule a product demo. What's your full name?", turn: 1 },
      { role: 'caller', text: "Robert Hoffman.", turn: 2 },
      { role: 'agent', text: "Hi Robert! Your email address?", turn: 3 },
      { role: 'caller', text: "rhoffman@bayareaconsult.com", turn: 4 },
      { role: 'agent', text: "Thanks. And your phone number?", turn: 5 },
      { role: 'caller', text: "510-555-0456", turn: 6 },
      { role: 'agent', text: "Great. When would you like to schedule the demo?", turn: 7 },
      { role: 'caller', text: "Wednesday at 1 PM if possible.", turn: 8 },
      { role: 'agent', text: "Wednesday at 1 PM works. Booking a demo for Robert Hoffman, rhoffman@bayareaconsult.com, 510-555-0456. You'll get a calendar invite. Anything else?", turn: 9 },
      { role: 'caller', text: "No, that's all.", turn: 10 },
      { role: 'agent', text: "You're all set. See you Wednesday!", turn: 11 }
    ])
  },

  // Call 7: Partial failure - caller gave wrong email format, agent didn't verify
  {
    caller: 'Kevin Walsh',
    duration_sec: 310,
    started_at: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
    transcript: JSON.stringify([
      { role: 'agent', text: "Hi! I'm here to book your product demo. What's your full name?", turn: 1 },
      { role: 'caller', text: "Kevin Walsh.", turn: 2 },
      { role: 'agent', text: "Hi Kevin! What email should I use?", turn: 3 },
      { role: 'caller', text: "kevin at walsh industries dot com", turn: 4 },
      { role: 'agent', text: "Got it. And your phone number?", turn: 5 },
      { role: 'caller', text: "954-555-0881", turn: 6 },
      { role: 'agent', text: "Thanks. What time works for you?", turn: 7 },
      { role: 'caller', text: "Thursday afternoon, maybe 4pm?", turn: 8 },
      { role: 'agent', text: "Thursday at 4 PM is booked. You'll receive a calendar invite and our team will show you everything. See you Thursday!", turn: 9 },
      { role: 'caller', text: "Okay, bye.", turn: 10 }
    ])
  },

  // Call 8: Partial failure - busy caller, rushed, no clarity on next steps
  {
    caller: 'Nina Patel',
    duration_sec: 178,
    started_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    transcript: JSON.stringify([
      { role: 'agent', text: "Hi! I'm here to help schedule your demo. Can I get your full name?", turn: 1 },
      { role: 'caller', text: "Nina Patel. Look, I'm really busy right now, can we make this quick?", turn: 2 },
      { role: 'agent', text: "Absolutely, Nina, I'll be fast. Email address?", turn: 3 },
      { role: 'caller', text: "npatel@nexushealth.com", turn: 4 },
      { role: 'agent', text: "Phone?", turn: 5 },
      { role: 'caller', text: "617-555-0202", turn: 6 },
      { role: 'agent', text: "When works for you?", turn: 7 },
      { role: 'caller', text: "Next Monday morning, earliest slot.", turn: 8 },
      { role: 'agent', text: "Monday at 9 AM. You're booked, Nina. Invite coming shortly. Bye!", turn: 9 },
      { role: 'caller', text: "Fine, bye.", turn: 10 }
    ])
  },

  // Call 9: Partial failure - caller asked questions agent couldn't answer, got off-script
  {
    caller: 'Thomas Brennan',
    duration_sec: 492,
    started_at: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    transcript: JSON.stringify([
      { role: 'agent', text: "Hello! Ready to schedule your product demo. What's your full name?", turn: 1 },
      { role: 'caller', text: "Thomas Brennan. Before we book, can you tell me how much the platform costs?", turn: 2 },
      { role: 'agent', text: "Our pricing starts at $299 per month for small teams and goes up based on usage. We also have enterprise plans.", turn: 3 },
      { role: 'caller', text: "Is that per user or per account?", turn: 4 },
      { role: 'agent', text: "It's per account with up to 5 users included, then $49 per additional user.", turn: 5 },
      { role: 'caller', text: "Okay, I guess that works. Fine, let's book it. Email is thomas@brennanlogistics.com", turn: 6 },
      { role: 'agent', text: "Great. And your phone number?", turn: 7 },
      { role: 'caller', text: "773-555-0654", turn: 8 },
      { role: 'agent', text: "When works for you for the demo?", turn: 9 },
      { role: 'caller', text: "Tuesday at 2 works.", turn: 10 },
      { role: 'agent', text: "Tuesday at 2 PM confirmed for Thomas Brennan, thomas@brennanlogistics.com. You're all set!", turn: 11 },
      { role: 'caller', text: "Okay thanks.", turn: 12 }
    ])
  },

  // Call 10: Partial failure - agent didn't confirm phone number correctly
  {
    caller: 'Lisa Yamamoto',
    duration_sec: 356,
    started_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    transcript: JSON.stringify([
      { role: 'agent', text: "Hi! Let's get your demo scheduled. Full name?", turn: 1 },
      { role: 'caller', text: "Lisa Yamamoto.", turn: 2 },
      { role: 'agent', text: "Hi Lisa! Email?", turn: 3 },
      { role: 'caller', text: "lyamamoto@fusiontech.net", turn: 4 },
      { role: 'agent', text: "And phone?", turn: 5 },
      { role: 'caller', text: "It's 808-555-0... actually hold on, is it 0144 or 0144? Let me check... it's 808-555-0144.", turn: 6 },
      { role: 'agent', text: "Got it, 808-555-0144. When's good for the demo?", turn: 7 },
      { role: 'caller', text: "How about Friday at noon?", turn: 8 },
      { role: 'agent', text: "Friday noon is booked. You'll receive the invite. After the demo, we'll work through next steps together. Talk soon!", turn: 9 },
      { role: 'caller', text: "Great, see you then.", turn: 10 }
    ])
  },

  // Call 11: Full failure - caller not interested, early exit
  {
    caller: 'Greg Sullivan',
    duration_sec: 87,
    started_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    transcript: JSON.stringify([
      { role: 'agent', text: "Hi! I'm here to schedule a product demo for you. What's your full name?", turn: 1 },
      { role: 'caller', text: "Greg Sullivan. Look, I think I was put through to the wrong line. I was looking for support, not a sales demo.", turn: 2 },
      { role: 'agent', text: "Oh I see! Well, while I have you, would you be interested in seeing our latest features? It might help with whatever support issue you have.", turn: 3 },
      { role: 'caller', text: "No thanks, I really just need support. Can you transfer me?", turn: 4 },
      { role: 'agent', text: "I understand. Unfortunately I can only help with scheduling demos. I'd encourage you to check our website for support options. But are you sure I can't interest you in a quick 30-minute demo?", turn: 5 },
      { role: 'caller', text: "I'm sure. Goodbye.", turn: 6 }
    ])
  },

  // Call 12: Full failure - no decision maker
  {
    caller: 'Carla Thompson',
    duration_sec: 203,
    started_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    transcript: JSON.stringify([
      { role: 'agent', text: "Hello! I'm your demo scheduling assistant. Can I get your full name?", turn: 1 },
      { role: 'caller', text: "Carla Thompson. I'm just an intern researching tools for my manager.", turn: 2 },
      { role: 'agent', text: "Hi Carla! No problem. Can I get an email for the invite?", turn: 3 },
      { role: 'caller', text: "I mean, I can give you my email but I'm not sure my manager will even be available.", turn: 4 },
      { role: 'agent', text: "That's fine! Email?", turn: 5 },
      { role: 'caller', text: "cthompson@innovera.com", turn: 6 },
      { role: 'agent', text: "And phone?", turn: 7 },
      { role: 'caller', text: "Uh, I'll give my direct line: 469-555-0320", turn: 8 },
      { role: 'agent', text: "When would you like the demo?", turn: 9 },
      { role: 'caller', text: "I don't know, I'd have to check with my manager. Maybe next week sometime?", turn: 10 },
      { role: 'agent', text: "Let's say Monday at 10 AM and you can reschedule if needed. You're booked!", turn: 11 },
      { role: 'caller', text: "Okay I guess. I'll have to check with her. Bye.", turn: 12 }
    ])
  },

  // Call 13: Full failure - caller completely disengaged, no info collected
  {
    caller: 'Unknown',
    duration_sec: 52,
    started_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    transcript: JSON.stringify([
      { role: 'agent', text: "Hi! I'm your demo scheduling assistant. What's your full name?", turn: 1 },
      { role: 'caller', text: "Hello? Who is this?", turn: 2 },
      { role: 'agent', text: "I'm an automated scheduling assistant. I help book product demos. Can I start with your name?", turn: 3 },
      { role: 'caller', text: "I don't know why I'm on this call. I didn't sign up for anything.", turn: 4 },
      { role: 'agent', text: "No worries! Would you like to learn more about our product? I can book a short demo—", turn: 5 },
      { role: 'caller', text: "No thank you. Please remove me from your list.", turn: 6 }
    ])
  },

  // Call 14: Edge case - early hangup mid-collection
  {
    caller: 'Daniel Krupke',
    duration_sec: 118,
    started_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    transcript: JSON.stringify([
      { role: 'agent', text: "Hello! I'm here to schedule your 30-minute product demo. Can I get your full name?", turn: 1 },
      { role: 'caller', text: "Daniel Krupke.", turn: 2 },
      { role: 'agent', text: "Hi Daniel! And your email?", turn: 3 },
      { role: 'caller', text: "dkrupke@modernstack.dev", turn: 4 },
      { role: 'agent', text: "Great. What's the best phone number to reach you?", turn: 5 },
      { role: 'caller', text: "Sorry, I have to go, something just came up at work. Can I call back?", turn: 6 },
      { role: 'agent', text: "Of course, Daniel! Just call back anytime and we can finish booking in just a couple minutes.", turn: 7 }
    ])
  },

  // Call 15: Edge case - caller goes completely off-script, wants to negotiate
  {
    caller: 'Patricia Nguyen',
    duration_sec: 621,
    started_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    transcript: JSON.stringify([
      { role: 'agent', text: "Hi! I'm here to schedule your product demo. What's your full name?", turn: 1 },
      { role: 'caller', text: "Patricia Nguyen. Before we go any further, I want to know: do you offer non-profit discounts?", turn: 2 },
      { role: 'agent', text: "That's a great question! I'm the scheduling assistant so I don't have details on non-profit pricing, but your demo specialist will be able to go through all pricing options with you. Can I get your email for the calendar invite?", turn: 3 },
      { role: 'caller', text: "We're a 501c3 and our budget is very tight. I've been burned by companies who promise demos and then pressure you. What's the refund policy if we're not satisfied?", turn: 4 },
      { role: 'agent', text: "I completely understand your concern, Patricia. Our demos are completely free and no-commitment. Our refund policy for paid plans is 30 days. Would you be comfortable sharing your email so I can get the invite sent?", turn: 5 },
      { role: 'caller', text: "Okay fine. patricia@hopefoundation.org", turn: 6 },
      { role: 'agent', text: "Thank you. And phone number?", turn: 7 },
      { role: 'caller', text: "503-555-0768", turn: 8 },
      { role: 'agent', text: "Perfect. When works for you?", turn: 9 },
      { role: 'caller', text: "Can you tell me who will be on the call? I want to make sure I'm talking to someone technical, not just a salesperson.", turn: 10 },
      { role: 'agent', text: "Our demos are led by product specialists who are technical and can answer detailed questions. They're not commission-based salespeople. Would Wednesday at 11 AM work?", turn: 11 },
      { role: 'caller', text: "Okay. Wednesday at 11 works.", turn: 12 },
      { role: 'agent', text: "Confirmed: demo for Patricia Nguyen, patricia@hopefoundation.org, 503-555-0768, Wednesday at 11 AM. You'll get a calendar invite. They'll address non-profit pricing and your technical questions in the demo. See you Wednesday!", turn: 13 },
      { role: 'caller', text: "Thank you. I appreciate you being patient.", turn: 14 }
    ])
  }
];

// --- LEAD QUALIFICATION BOT CALLS ---

const leadQualCalls = [
  // Call 1: Fully successful - ideal qualified lead
  {
    caller: 'Chris Abernathy',
    duration_sec: 487,
    started_at: new Date(Date.now() - 24 * 24 * 60 * 60 * 1000).toISOString(),
    transcript: JSON.stringify([
      { role: 'agent', text: "Hi Chris, thanks for reaching out! I'm calling to learn a bit more about what you're looking for so we can connect you with the right person on our team. Is now a good time?", turn: 1 },
      { role: 'caller', text: "Yes, perfect timing actually. We've been evaluating tools for our sales ops team.", turn: 2 },
      { role: 'agent', text: "Great. Can you tell me a bit about your main pain point right now? What problem are you trying to solve?", turn: 3 },
      { role: 'caller', text: "Our sales team has no visibility into which leads are warm. We're wasting time on dead leads and missing the hot ones.", turn: 4 },
      { role: 'agent', text: "That's a very common and costly problem. To make sure we scope this correctly — what budget range are you working with for a solution like this?", turn: 5 },
      { role: 'caller', text: "We've set aside between $2,000 and $4,000 per month for tooling in this area.", turn: 6 },
      { role: 'agent', text: "That budget puts you right in our sweet spot. How quickly are you looking to have something in place — what's your timeline?", turn: 7 },
      { role: 'caller', text: "We want something live within 60 days. Q3 planning starts soon and we need this before then.", turn: 8 },
      { role: 'agent', text: "60-day timeline — that's very doable. One last thing: are you the primary decision maker for this purchase, or are there others who would need to be involved in the sign-off?", turn: 9 },
      { role: 'caller', text: "I'm the VP of Sales Ops. I have budget authority up to $5k/month, so I'm the decision maker for this.", turn: 10 },
      { role: 'agent', text: "Perfect. Chris, based on what you've told me — clear pain point, right budget, 60-day timeline, and decision-making authority — I'd love to connect you with one of our senior account executives. They can walk you through exactly how we'd solve this for your team. Would a call Thursday or Friday this week work for you?", turn: 11 },
      { role: 'caller', text: "Thursday works. Afternoon preferably.", turn: 12 },
      { role: 'agent', text: "Thursday afternoon it is. You'll get a calendar invite confirming the time. Just to recap: we'll have an AE reach out who understands your lead visibility challenge, $2-4k budget, 60-day window. Sound good?", turn: 13 },
      { role: 'caller', text: "Sounds great, looking forward to it.", turn: 14 }
    ])
  },

  // Call 2: Fully successful - enterprise buyer
  {
    caller: 'Rachel Kim',
    duration_sec: 542,
    started_at: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
    transcript: JSON.stringify([
      { role: 'agent', text: "Hi Rachel! I'm reaching out to understand your needs better before connecting you with our team. Is this a good time?", turn: 1 },
      { role: 'caller', text: "Sure, I've got about 10 minutes.", turn: 2 },
      { role: 'agent', text: "That's plenty. What's the main challenge that brought you to us today?", turn: 3 },
      { role: 'caller', text: "We're a 200-person company and our marketing and sales teams are completely siloed. Leads fall through the cracks between handoffs and nobody knows where they are in the funnel.", turn: 4 },
      { role: 'agent', text: "Lead handoff visibility at scale — that's exactly what we solve. What kind of budget are you working with for this?", turn: 5 },
      { role: 'caller', text: "We're thinking in the range of $8,000 to $15,000 per month if the ROI story is solid.", turn: 6 },
      { role: 'agent', text: "That's enterprise tier, and we have strong case studies for teams your size. What's your timeline for getting this in place?", turn: 7 },
      { role: 'caller', text: "We'd want to have it implemented by end of Q3, so about 90 days.", turn: 8 },
      { role: 'agent', text: "90 days is achievable for an implementation of this scope. Who's involved in the buying decision on your side?", turn: 9 },
      { role: 'caller', text: "It's myself as Head of RevOps, our CRO will need to sign off on anything over $10k, and IT will need to approve the security review.", turn: 10 },
      { role: 'agent', text: "Good to know — we're used to multi-stakeholder enterprise deals. I'd suggest we get our enterprise AE and solutions engineer on a call with you and your CRO. Can we aim for next week?", turn: 11 },
      { role: 'caller', text: "Next Tuesday or Wednesday works.", turn: 12 },
      { role: 'agent', text: "Excellent. I'll have the enterprise team reach out to confirm. Summary: Rachel Kim, RevOps Head, lead handoff visibility, $8-15k/month budget, 90-day timeline, CRO sign-off required. We'll bring the right people. Talk soon!", turn: 13 },
      { role: 'caller', text: "Perfect, thanks.", turn: 14 }
    ])
  },

  // Call 3: Fully successful - mid-market
  {
    caller: 'Mike Deluca',
    duration_sec: 396,
    started_at: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
    transcript: JSON.stringify([
      { role: 'agent', text: "Hey Mike, thanks for your interest. Quick call to make sure we're the right fit before looping in our team. What's the problem you're trying to solve?", turn: 1 },
      { role: 'caller', text: "We're trying to scale our outbound sales without adding more SDRs. I want to know if AI can handle some of the prospecting work.", turn: 2 },
      { role: 'agent', text: "Automating SDR-level prospecting with AI — definitely in our wheelhouse. What budget are you thinking?", turn: 3 },
      { role: 'caller', text: "We'd be comfortable around $3,500 a month if it actually replaces an SDR.", turn: 4 },
      { role: 'agent', text: "That's within range. When do you need this working by?", turn: 5 },
      { role: 'caller', text: "We're starting a new sales push in 45 days, so ideally before that.", turn: 6 },
      { role: 'agent', text: "45 days is tight but manageable with the right setup. Are you the one making the call on this, or is there a CFO or someone else who approves?", turn: 7 },
      { role: 'caller', text: "I'm the CEO. I make all the technology decisions for now.", turn: 8 },
      { role: 'agent', text: "Perfect. Mike, you're a strong fit for our growth tier. I want to get you connected with one of our AEs who can show you exactly how we replace an SDR role. Can you do a call this week?", turn: 9 },
      { role: 'caller', text: "Wednesday morning works.", turn: 10 },
      { role: 'agent', text: "Wednesday morning confirmed. Our AE will reach out. Looking forward to helping you scale without headcount, Mike!", turn: 11 },
      { role: 'caller', text: "Sounds good, thanks.", turn: 12 }
    ])
  },

  // Call 4: Fully successful - clear pain, fast timeline
  {
    caller: 'Stephanie Brooks',
    duration_sec: 412,
    started_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    transcript: JSON.stringify([
      { role: 'agent', text: "Hi Stephanie! I'm the lead qualifier for our team. Tell me, what made you reach out today?", turn: 1 },
      { role: 'caller', text: "We just lost two big accounts because we didn't follow up fast enough. I need a system that flags at-risk accounts automatically.", turn: 2 },
      { role: 'agent', text: "Proactive account health monitoring — that's critical. What's your budget for this solution?", turn: 3 },
      { role: 'caller', text: "I can go up to $5,000 per month. We've already done the math on what losing accounts costs us.", turn: 4 },
      { role: 'agent', text: "Up to $5k monthly. And how urgently are you looking to implement this?", turn: 5 },
      { role: 'caller', text: "As soon as possible. Ideally within 30 days.", turn: 6 },
      { role: 'agent', text: "30 days — we can do that. Are you the right person to make this purchase decision?", turn: 7 },
      { role: 'caller', text: "Yes, I'm the VP of Customer Success. I own this budget completely.", turn: 8 },
      { role: 'agent', text: "Stephanie, this is a priority case for us. I'm going to flag you as urgent for our account team. Expect a call within 24 hours from an AE who specializes in account health platforms. Does that work?", turn: 9 },
      { role: 'caller', text: "Yes, please! The sooner the better.", turn: 10 },
      { role: 'agent', text: "You'll hear from us tomorrow. Summary: Stephanie Brooks, VP Customer Success, at-risk account detection, $5k budget, 30-day timeline, sole decision maker. We're on it!", turn: 11 },
      { role: 'caller', text: "Thank you!", turn: 12 }
    ])
  },

  // Call 5: Fully successful - qualified but complex
  {
    caller: 'Aiden Clarke',
    duration_sec: 531,
    started_at: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString(),
    transcript: JSON.stringify([
      { role: 'agent', text: "Hi Aiden! Quick qualification call before we connect you to the right team. What brings you to us?", turn: 1 },
      { role: 'caller', text: "We're consolidating our tech stack. Currently using 4 different tools that don't talk to each other. Looking for one platform.", turn: 2 },
      { role: 'agent', text: "Stack consolidation — I hear this a lot. What's the biggest friction point between the current tools?", turn: 3 },
      { role: 'caller', text: "Data inconsistency mostly. Sales sees different numbers than marketing sees different from what finance sees. It's causing real misalignment.", turn: 4 },
      { role: 'agent', text: "Data unification is core to what we do. Budget-wise, what are you currently spending across those 4 tools?", turn: 5 },
      { role: 'caller', text: "Combined it's about $6,500 a month. We want to ideally stay in that range or less.", turn: 6 },
      { role: 'agent', text: "Under $6,500 — we can likely beat that and give you more. What's your timeline to make a switch?", turn: 7 },
      { role: 'caller', text: "We're locked in contracts for two of the tools until end of Q3. So realistically 5-6 months.", turn: 8 },
      { role: 'agent', text: "5-6 months is a good planning timeline. Who needs to approve this on your side?", turn: 9 },
      { role: 'caller', text: "I'm the Director of Sales Technology. My SVP will approve, and legal usually takes 3-4 weeks for contracts.", turn: 10 },
      { role: 'agent', text: "Good to know. I'll route you to our enterprise integration team who handles complex stack migrations. They'll want to map out a transition plan with you. Are you free for a technical discovery call next week?", turn: 11 },
      { role: 'caller', text: "Thursday or Friday next week works.", turn: 12 },
      { role: 'agent', text: "Perfect. I'll get the right people on your calendar. Aiden Clarke, Director Sales Tech, stack consolidation, ~$6.5k budget, 5-6 month timeline, SVP approval needed. See you next week!", turn: 13 },
      { role: 'caller', text: "Thanks, looking forward to it.", turn: 14 }
    ])
  },

  // Call 6: Partial failure - budget not confirmed specifically
  {
    caller: 'Howard Gaines',
    duration_sec: 334,
    started_at: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
    transcript: JSON.stringify([
      { role: 'agent', text: "Hi Howard! Quick call to understand your needs. What's your main challenge right now?", turn: 1 },
      { role: 'caller', text: "We need better pipeline visibility for our sales team. Too much is happening in spreadsheets.", turn: 2 },
      { role: 'agent', text: "Spreadsheet-heavy processes are hard to scale. Have you looked at other solutions?", turn: 3 },
      { role: 'caller', text: "We evaluated Salesforce but it felt too heavy for us. We're a 25-person company.", turn: 4 },
      { role: 'agent', text: "We're often a better fit than Salesforce at that size. What's your timeline for getting something in place?", turn: 5 },
      { role: 'caller', text: "We'd want to be up and running by end of Q2.", turn: 6 },
      { role: 'agent', text: "End of Q2 is coming up fast. Are you the decision maker?", turn: 7 },
      { role: 'caller', text: "Yes, I'm the head of sales.", turn: 8 },
      { role: 'agent', text: "Great. I'd love to connect you with our team this week. Are you free Thursday?", turn: 9 },
      { role: 'caller', text: "Thursday works fine.", turn: 10 },
      { role: 'agent', text: "Booked! Our AE will reach out to confirm. Looking forward to helping you ditch those spreadsheets, Howard!", turn: 11 },
      { role: 'caller', text: "Thanks!", turn: 12 }
    ])
  },

  // Call 7: Partial failure - decision maker not clearly confirmed
  {
    caller: 'Sandra Wu',
    duration_sec: 398,
    started_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    transcript: JSON.stringify([
      { role: 'agent', text: "Hi Sandra! I'm here to learn about your needs before connecting you with our sales team. What problem are you solving?", turn: 1 },
      { role: 'caller', text: "We need a better way to track how leads move through our funnel. Right now it's all manual and we're missing conversion data.", turn: 2 },
      { role: 'agent', text: "Funnel visibility and conversion tracking — great use case. What budget range are you working with?", turn: 3 },
      { role: 'caller', text: "Probably between $1,500 and $3,000 a month.", turn: 4 },
      { role: 'agent', text: "That fits our growth plans well. What's your timeline?", turn: 5 },
      { role: 'caller', text: "Within the next quarter for sure.", turn: 6 },
      { role: 'agent', text: "Great. I'll connect you with one of our account executives. Can we set up a call?", turn: 7 },
      { role: 'caller', text: "Sure, but I should mention my CEO would want to be on the call too.", turn: 8 },
      { role: 'agent', text: "Absolutely, let's make sure he's included. How does next Wednesday look?", turn: 9 },
      { role: 'caller', text: "I'd have to check with him, but probably fine. Let's tentatively say Wednesday.", turn: 10 },
      { role: 'agent', text: "Perfect. Our AE will reach out. Talk soon Sandra!", turn: 11 },
      { role: 'caller', text: "Okay thanks.", turn: 12 }
    ])
  },

  // Call 8: Partial failure - pain point vague, no follow-up commitment
  {
    caller: 'Barry Foster',
    duration_sec: 276,
    started_at: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    transcript: JSON.stringify([
      { role: 'agent', text: "Hi Barry! Tell me what's driving your interest in a sales solution today.", turn: 1 },
      { role: 'caller', text: "Just exploring options. We're not actively looking right now.", turn: 2 },
      { role: 'agent', text: "Totally fine to be in research mode. What would make you move from exploring to actively looking?", turn: 3 },
      { role: 'caller', text: "Honestly not sure. Things are okay right now. We might look at this in a few months.", turn: 4 },
      { role: 'agent', text: "What's your current setup? What tools are you using?", turn: 5 },
      { role: 'caller', text: "A mix of HubSpot and spreadsheets.", turn: 6 },
      { role: 'agent', text: "What's the biggest frustration with that combo?", turn: 7 },
      { role: 'caller', text: "I guess the reporting could be better. But like I said, it's not urgent.", turn: 8 },
      { role: 'agent', text: "Got it. I'll flag you as a nurture lead and have someone from our team follow up in a few months. Is email the best way to stay in touch?", turn: 9 },
      { role: 'caller', text: "Sure, that's fine.", turn: 10 }
    ])
  },

  // Call 9: Partial failure - agent gave wrong pricing info
  {
    caller: 'Tanya Morales',
    duration_sec: 445,
    started_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    transcript: JSON.stringify([
      { role: 'agent', text: "Hi Tanya! Quick qualification call. What's the main problem you're looking to solve?", turn: 1 },
      { role: 'caller', text: "We need to improve our lead response time. Right now it takes us about 4 hours to respond to inbound leads.", turn: 2 },
      { role: 'agent', text: "4 hours is definitely leaving money on the table. Research shows leads go cold after 5 minutes. What's your budget?", turn: 3 },
      { role: 'caller', text: "We have about $2,000 per month to work with.", turn: 4 },
      { role: 'agent', text: "At $2,000 you'd get full access to our response automation suite.", turn: 5 },
      { role: 'caller', text: "Oh really? What does that include exactly?", turn: 6 },
      { role: 'agent', text: "That includes AI-powered instant response, lead routing, and full CRM sync.", turn: 7 },
      { role: 'caller', text: "That sounds good. What's the timeline to get that set up?", turn: 8 },
      { role: 'agent', text: "Typically 2-3 weeks for full setup.", turn: 9 },
      { role: 'caller', text: "Perfect. When do you need this done? I'm hoping for next month.", turn: 10 },
      { role: 'agent', text: "Next month is totally achievable. Are you the decision maker?", turn: 11 },
      { role: 'caller', text: "Yes, I'm Director of Marketing and I own this budget.", turn: 12 },
      { role: 'agent', text: "Great Tanya! I'll connect you with an AE who can confirm the details and get you onboarded. Does Thursday work?", turn: 13 },
      { role: 'caller', text: "Thursday works.", turn: 14 }
    ])
  },

  // Call 10: Partial failure - rushed, timeline not confirmed
  {
    caller: 'Jake Sinclair',
    duration_sec: 189,
    started_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    transcript: JSON.stringify([
      { role: 'agent', text: "Hi Jake! Quick call to understand your needs. What are you trying to solve?", turn: 1 },
      { role: 'caller', text: "Need a better CRM. Current one is clunky.", turn: 2 },
      { role: 'agent', text: "What's your budget?", turn: 3 },
      { role: 'caller', text: "Around $1,000 a month.", turn: 4 },
      { role: 'agent', text: "And are you the decision maker?", turn: 5 },
      { role: 'caller', text: "Yeah, it's my company.", turn: 6 },
      { role: 'agent', text: "Great. I'll connect you with our team. Can you do a call next week?", turn: 7 },
      { role: 'caller', text: "Sure, whenever.", turn: 8 },
      { role: 'agent', text: "Perfect. Our AE will reach out. Thanks Jake!", turn: 9 }
    ])
  },

  // Call 11: Full failure - no budget
  {
    caller: 'Frank Olsen',
    duration_sec: 231,
    started_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    transcript: JSON.stringify([
      { role: 'agent', text: "Hi Frank! Quick question — what are you looking to improve in your sales process?", turn: 1 },
      { role: 'caller', text: "We want to automate our follow-ups. Right now it's all manual.", turn: 2 },
      { role: 'agent', text: "Automated follow-up — great use case. What's your budget for a solution?", turn: 3 },
      { role: 'caller', text: "Honestly we're a startup and we're bootstrapping. We can't really spend anything right now. Is there a free tier?", turn: 4 },
      { role: 'agent', text: "We do have a free trial period. Our paid plans start at $500 per month after the trial.", turn: 5 },
      { role: 'caller', text: "Even $500 is tough right now. We're pre-revenue.", turn: 6 },
      { role: 'agent', text: "I understand. Let me connect you with our startup program team who might be able to help with special pricing.", turn: 7 },
      { role: 'caller', text: "Okay, but I'm not sure it'll work out. We really have no budget.", turn: 8 },
      { role: 'agent', text: "No problem. I'll flag this and have someone from our partnerships team reach out when your situation changes.", turn: 9 },
      { role: 'caller', text: "Okay, sounds good. Thanks.", turn: 10 }
    ])
  },

  // Call 12: Full failure - wrong person, not decision maker
  {
    caller: 'Helen Kowalski',
    duration_sec: 198,
    started_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    transcript: JSON.stringify([
      { role: 'agent', text: "Hi Helen! I'm calling to understand your company's needs. What's the main challenge you're facing?", turn: 1 },
      { role: 'caller', text: "I'm just a sales rep. My manager asked me to look into some tools but I don't really know the specifics of what we need.", turn: 2 },
      { role: 'agent', text: "That's okay! What tools are you using now?", turn: 3 },
      { role: 'caller', text: "Salesforce and some email tool. I'm not sure what the budget is or anything like that.", turn: 4 },
      { role: 'agent', text: "Would it be possible to get your manager on the call?", turn: 5 },
      { role: 'caller', text: "He's really busy. I don't think he'll have time this week.", turn: 6 },
      { role: 'agent', text: "No worries. Can I send you an email you could forward to him? It'll explain what we do.", turn: 7 },
      { role: 'caller', text: "Sure I guess.", turn: 8 },
      { role: 'agent', text: "What's your email?", turn: 9 },
      { role: 'caller', text: "helen.k@primesales.net", turn: 10 },
      { role: 'agent', text: "Perfect, I'll send something over. Have a great day, Helen!", turn: 11 },
      { role: 'caller', text: "Okay, thanks.", turn: 12 }
    ])
  },

  // Call 13: Full failure - competitor locked in, no opportunity
  {
    caller: 'Victor Reyes',
    duration_sec: 156,
    started_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    transcript: JSON.stringify([
      { role: 'agent', text: "Hi Victor! What's driving your interest in a new sales solution today?", turn: 1 },
      { role: 'caller', text: "We just signed a 3-year deal with Salesforce. I'm not sure why I'm even on this call.", turn: 2 },
      { role: 'agent', text: "Ah, I see! Well, we do offer integrations with Salesforce — we could complement what you have.", turn: 3 },
      { role: 'caller', text: "We're not looking to add more tools. The whole point was to consolidate.", turn: 4 },
      { role: 'agent', text: "That makes sense. Is there any aspect of the Salesforce implementation where you're already seeing gaps?", turn: 5 },
      { role: 'caller', text: "Look, we're locked in for 3 years. There's no budget or appetite for anything else. I appreciate the call but this isn't the right time.", turn: 6 },
      { role: 'agent', text: "Totally understand, Victor. I'll make a note to follow up in about 2.5 years when your contract renewal comes up. Best of luck with the Salesforce implementation!", turn: 7 },
      { role: 'caller', text: "Thanks, bye.", turn: 8 }
    ])
  },

  // Call 14: Edge case - caller is very technical, agent struggles
  {
    caller: 'Priya Sundaram',
    duration_sec: 592,
    started_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    transcript: JSON.stringify([
      { role: 'agent', text: "Hi Priya! What brings you to us today?", turn: 1 },
      { role: 'caller', text: "We need to evaluate your API capabilities. Specifically I want to know about your data pipeline architecture and whether you support bi-directional webhooks with idempotency guarantees.", turn: 2 },
      { role: 'agent', text: "Great technical questions! Those are definitely things our solutions engineers can address in detail. Can I ask what problem you're ultimately trying to solve with those capabilities?", turn: 3 },
      { role: 'caller', text: "We're building a real-time lead scoring system and need a platform that can ingest and emit events without duplication or latency spikes.", turn: 4 },
      { role: 'agent', text: "Real-time lead scoring pipeline — that's a solid architecture challenge. What's the budget for this infrastructure?", turn: 5 },
      { role: 'caller', text: "For the right solution we'd budget $10,000 to $25,000 per month. We're not price-sensitive if the architecture is sound.", turn: 6 },
      { role: 'agent', text: "That puts you firmly in our enterprise technical tier. Timeline for the build?", turn: 7 },
      { role: 'caller', text: "We're mid-build now. I need to make a vendor decision in the next 3 weeks.", turn: 8 },
      { role: 'agent', text: "3 weeks — that's urgent. Are you the technical decision maker or is there a CTO involved?", turn: 9 },
      { role: 'caller', text: "I'm the Lead Architect. My CTO approves vendor contracts but relies on my recommendation entirely.", turn: 10 },
      { role: 'agent', text: "Priya, I want to get you in front of our VP of Engineering and solutions architects ASAP given your 3-week timeline. I'm flagging this as a priority technical evaluation. Can we set up a technical deep-dive call tomorrow or the next day?", turn: 11 },
      { role: 'caller', text: "Tomorrow at 2 PM PST works.", turn: 12 },
      { role: 'agent', text: "Tomorrow at 2 PM PST confirmed. Priya Sundaram, Lead Architect, real-time lead scoring, $10-25k/month, 3-week decision timeline, CTO approves on her recommendation. Our engineering team will be ready. See you tomorrow!", turn: 13 },
      { role: 'caller', text: "Perfect. Please have someone technical on the call, not just a salesperson.", turn: 14 },
      { role: 'agent', text: "Absolutely noted — VP of Engineering and solutions architects only. See you tomorrow at 2 PM!", turn: 15 }
    ])
  },

  // Call 15: Edge case - caller wants to negotiate on the spot
  {
    caller: 'Marcus Webb',
    duration_sec: 487,
    started_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    transcript: JSON.stringify([
      { role: 'agent', text: "Hi Marcus! I'm here to learn more about what you need before connecting you with our team. What's your main pain point?", turn: 1 },
      { role: 'caller', text: "Lead conversion rate. We're getting plenty of leads but only closing about 8% of them. Industry average is 20%.", turn: 2 },
      { role: 'agent', text: "8% close rate on what should be 20% — that's significant revenue left on the table. What's driving that gap in your view?", turn: 3 },
      { role: 'caller', text: "Probably follow-up timing and personalization. Our reps are too busy to be consistent.", turn: 4 },
      { role: 'agent', text: "Consistency and timing automation — that's squarely what we address. What budget are you thinking?", turn: 5 },
      { role: 'caller', text: "I can do $2,500 a month, but I want to negotiate. What's the best you can do?", turn: 6 },
      { role: 'agent', text: "I appreciate that, Marcus. I'm not in a position to negotiate pricing here — that's something our AE can work through with you directly. But $2,500 is within our range. What's your timeline?", turn: 7 },
      { role: 'caller', text: "I need to show results within 90 days or I'll lose budget approval.", turn: 8 },
      { role: 'agent', text: "90 days to show results is completely reasonable — most of our clients see measurable improvement in 30-45 days. Are you the decision maker?", turn: 9 },
      { role: 'caller', text: "Yes, I'm VP of Sales. I approve up to $5k a month.", turn: 10 },
      { role: 'agent', text: "Perfect. Marcus, you're a great fit and I want to get you moving quickly given the 90-day window. Can I book you with an AE for this week?", turn: 11 },
      { role: 'caller', text: "Friday works. And tell them I want to talk discounts.", turn: 12 },
      { role: 'agent', text: "I'll note that for the AE. Marcus Webb, VP Sales, 8% vs 20% close rate gap, $2,500/month with room to negotiate, 90-day timeline, VP-level authority. Friday confirmed. See you then!", turn: 13 },
      { role: 'caller', text: "Great, looking forward to it.", turn: 14 }
    ])
  }
];

function seedData() {
  const existingAgents = db.prepare('SELECT COUNT(*) as count FROM agents').get();
  if (existingAgents.count > 0) {
    console.log('Data already seeded. Skipping.');
    return false;
  }

  const insertAgent = db.prepare('INSERT INTO agents (id, name, script, success_criteria, created_at) VALUES (?, ?, ?, ?, ?)');
  const insertCall = db.prepare('INSERT INTO calls (id, agent_id, transcript, duration_sec, caller, started_at) VALUES (?, ?, ?, ?, ?, ?)');

  const insertAgentsFn = db.transaction(() => {
    for (const agent of agents) {
      insertAgent.run(agent.id, agent.name, agent.script, agent.success_criteria, agent.created_at);
    }
  });

  insertAgentsFn();
  console.log('Agents seeded.');

  const insertCallsFn = db.transaction(() => {
    for (const call of appointmentCalls) {
      const id = randomUUID();
      insertCall.run(id, AGENT1_ID, call.transcript, call.duration_sec, call.caller, call.started_at);
    }
    for (const call of leadQualCalls) {
      const id = randomUUID();
      insertCall.run(id, AGENT2_ID, call.transcript, call.duration_sec, call.caller, call.started_at);
    }
  });

  insertCallsFn();
  console.log('Calls seeded (30 total).');
  return true;
}

module.exports = { seedData };

if (require.main === module) {
  const seeded = seedData();
  if (seeded) {
    console.log('Seed complete. Run analysis separately.');
  }
  process.exit(0);
}
