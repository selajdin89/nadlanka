const mongoose = require("mongoose");
require("dotenv").config();

// Import models
const User = require("./models/User");
const Blog = require("./models/Blog");

// Sample blog posts
const sampleBlogPosts = [
	{
		title: "How to Sell Safely on NaDlanka: A Complete Guide",
		excerpt:
			"Learn the essential safety tips and best practices for selling items on our marketplace. Protect yourself from scams and ensure successful transactions.",
		content: `# How to Sell Safely on NaDlanka: A Complete Guide

Selling items online can be both exciting and nerve-wracking. At NaDlanka, we prioritize your safety and success. Here's a comprehensive guide to help you sell safely and effectively.

## 1. Create a Trustworthy Profile

Your profile is your first impression. Make sure to:
- Use a clear, professional profile picture
- Write a detailed bio about yourself
- Add your location (city level is sufficient)
- Verify your phone number and email

## 2. Take High-Quality Photos

Good photos are crucial for attracting buyers:
- Use natural lighting when possible
- Take photos from multiple angles
- Include close-ups of any imperfections
- Show the item in context (e.g., furniture in a room)

## 3. Write Detailed Descriptions

Be honest and thorough:
- Include all relevant details (size, color, condition, age)
- Mention any flaws or wear
- List what's included (accessories, original packaging)
- Specify the reason for selling

## 4. Set a Fair Price

Research similar items:
- Check recent sales of comparable items
- Consider the item's condition and age
- Factor in the original purchase price
- Leave room for negotiation

## 5. Meet Safely

When meeting buyers:
- Choose public, well-lit locations
- Bring a friend if possible
- Meet during daylight hours
- Trust your instincts - if something feels off, cancel

## 6. Handle Payments

For your protection:
- Prefer cash for in-person transactions
- Use secure payment methods for shipping
- Never accept checks or money orders
- Count money carefully

## 7. Shipping Guidelines

If shipping items:
- Use tracked shipping services
- Insure valuable items
- Pack items securely
- Take photos of packaging before shipping

## 8. After the Sale

Maintain good relationships:
- Follow up to ensure satisfaction
- Leave honest feedback
- Keep records of the transaction
- Report any issues to our support team

Remember, successful selling is about building trust and providing excellent service. Take your time, be patient, and always prioritize safety over a quick sale.

Happy selling on NaDlanka!`,
		category: "Tips & Guides",
		tags: ["selling", "safety", "tips", "guide"],
		isFeatured: true,
		status: "published",
	},
	{
		title: "5 Essential Tips for Buyers on NaDlanka",
		excerpt:
			"Discover how to find great deals, avoid scams, and make smart purchases on our marketplace. Essential reading for all buyers.",
		content: `# 5 Essential Tips for Buyers on NaDlanka

Shopping on NaDlanka can save you money and help you find unique items. Here are five essential tips to make the most of your buying experience.

## 1. Do Your Research

Before making any purchase:
- Compare prices with other listings
- Research the item's market value
- Read the seller's profile and reviews
- Check how long they've been active

## 2. Ask the Right Questions

Don't be afraid to ask questions:
- Why are you selling this item?
- How long have you owned it?
- Has it ever been repaired?
- Can you provide more photos?
- Is the price negotiable?

## 3. Inspect Before You Buy

When meeting in person:
- Examine the item thoroughly
- Test electronics and mechanical items
- Check for any hidden damage
- Verify all accessories are included
- Don't feel pressured to buy immediately

## 4. Negotiate Respectfully

Negotiation is common, but do it properly:
- Start with a reasonable offer
- Be respectful and polite
- Explain your reasoning if needed
- Be prepared to walk away
- Don't lowball excessively

## 5. Complete the Transaction Safely

Protect yourself during the exchange:
- Meet in public places
- Bring exact change if paying cash
- Get a receipt or written confirmation
- Verify the item works before leaving
- Trust your instincts

## Bonus Tips

- Save searches for items you're looking for
- Set up alerts for new listings
- Follow sellers you trust
- Leave honest feedback after purchases
- Report any suspicious activity

Remember, good communication and mutual respect lead to successful transactions. Happy shopping on NaDlanka!`,
		category: "Tips & Guides",
		tags: ["buying", "tips", "safety", "negotiation"],
		isFeatured: true,
		status: "published",
	},
	{
		title: "Success Story: How Maria Sold Her Car in 3 Days",
		excerpt:
			"Read how Maria successfully sold her car on NaDlanka in just 3 days using our proven strategies and tips.",
		content: `# Success Story: How Maria Sold Her Car in 3 Days

Meet Maria, a 28-year-old teacher from Skopje who needed to sell her 2015 Toyota Corolla quickly. Here's how she did it using NaDlanka.

## The Challenge

Maria needed to sell her car within a week because:
- She was moving to a new city
- Her new job required a different vehicle
- She needed the money for her relocation

## Her Strategy

### 1. Perfect Photos (Day 1)
Maria spent an entire afternoon taking photos:
- Cleaned the car thoroughly inside and out
- Took photos in natural lighting
- Captured all angles: front, back, sides, interior
- Included close-ups of the engine and any minor scratches
- Took photos of the car in different locations

### 2. Detailed Description (Day 1)
She wrote a comprehensive listing:
- Listed all specifications and features
- Mentioned recent maintenance (oil change, new tires)
- Included service history
- Described the car's condition honestly
- Explained why she was selling

### 3. Competitive Pricing (Day 1)
Maria researched thoroughly:
- Checked similar cars on NaDlanka and other sites
- Visited local dealerships for trade-in values
- Set her price slightly below market average
- Left room for negotiation

### 4. Quick Response (Days 2-3)
Maria was highly responsive:
- Checked her messages every few hours
- Responded to inquiries within 30 minutes
- Provided additional photos when requested
- Answered all questions thoroughly

## The Results

- **Day 1**: Listed the car in the evening
- **Day 2**: Received 8 inquiries by noon
- **Day 3**: Met with 3 interested buyers, sold to the first one

## Key Success Factors

1. **Quality Photos**: Professional-looking images attracted serious buyers
2. **Honest Description**: Transparency built trust
3. **Fair Pricing**: Competitive price generated immediate interest
4. **Quick Communication**: Fast responses kept buyers engaged
5. **Flexible Schedule**: Made herself available for viewings

## What She Learned

"I was surprised how quickly it sold! The key was being honest about everything and responding quickly to messages. The buyer said he chose my listing because the photos were clear and I answered all his questions immediately."

## Tips from Maria

- "Take more photos than you think you need"
- "Be completely honest about any issues"
- "Respond to messages as quickly as possible"
- "Don't be afraid to negotiate, but know your bottom line"
- "Trust your instincts about buyers"

Maria's success shows that with the right approach, you can sell items quickly on NaDlanka. Her car sold for 95% of her asking price, and both she and the buyer were happy with the transaction.

Ready to sell your item? Follow Maria's example and you'll be on your way to a successful sale!`,
		category: "Success Stories",
		tags: ["success story", "car", "selling", "tips"],
		isFeatured: false,
		status: "published",
	},
	{
		title: "Market Update: Electronics Prices Trending Down",
		excerpt:
			"Latest market analysis shows electronics prices are decreasing, making it a great time to buy or sell tech items.",
		content: `# Market Update: Electronics Prices Trending Down

Our latest analysis of the electronics market on NaDlanka shows interesting trends that both buyers and sellers should know about.

## Current Market Trends

### Smartphones
- **iPhone prices**: Down 15% compared to last quarter
- **Samsung Galaxy**: Steady prices, good deals on older models
- **Budget phones**: Increased demand, prices holding steady

### Laptops
- **Gaming laptops**: Significant price drops (up to 20%)
- **Business laptops**: Moderate decreases (5-10%)
- **MacBooks**: Premium models maintaining value better

### Audio Equipment
- **Wireless headphones**: Prices down 10-15%
- **Speakers**: Steady market, good for buyers
- **Professional audio**: Premium items holding value

## What This Means for You

### For Buyers
- **Great time to buy**: Lower prices across most categories
- **Negotiation power**: Sellers more willing to negotiate
- **Quality deals**: Premium items available at better prices

### For Sellers
- **Competitive pricing**: Research current market values
- **Highlight value**: Emphasize features and condition
- **Be patient**: May take longer to sell at desired prices

## Seasonal Factors

### End of Year Effect
- People upgrading before holidays
- Companies clearing inventory
- Student sales ending

### New Model Releases
- Older models becoming more affordable
- Trade-in values decreasing
- More options in the market

## Regional Differences

### Kosovo
- Strong demand for mid-range smartphones
- Laptop prices competitive
- Audio equipment popular

### North Macedonia
- Premium electronics holding value
- Gaming equipment in high demand
- Business laptops popular

## Tips for Smart Shopping

1. **Compare prices** across multiple listings
2. **Check condition** carefully before buying
3. **Negotiate respectfully** - sellers expect it
4. **Consider warranty** and return policies
5. **Meet in person** when possible

## Predictions for Next Quarter

- Prices likely to stabilize
- New model releases may affect older items
- Holiday season could increase demand
- Supply chain improvements expected

Stay tuned for more market updates and remember to always buy and sell safely on NaDlanka!`,
		category: "Market News",
		tags: ["market update", "electronics", "prices", "trends"],
		isFeatured: false,
		status: "published",
	},
	{
		title: "Safety First: How to Avoid Scams on Online Marketplaces",
		excerpt:
			"Learn how to protect yourself from common scams and fraudulent activities when buying or selling online.",
		content: `# Safety First: How to Avoid Scams on Online Marketplaces

Online marketplaces like NaDlanka are generally safe, but it's important to be aware of potential scams and how to protect yourself.

## Common Scam Types

### 1. Fake Payment Scams
**How it works**: Scammer claims to have sent payment but hasn't
**Red flags**:
- Requests immediate shipping before payment clears
- Offers to overpay and asks for refund
- Uses fake payment confirmation emails

**Protection**:
- Always verify payment in your account
- Never ship before payment is confirmed
- Use secure payment methods

### 2. Identity Theft Attempts
**How it works**: Scammer tries to get personal information
**Red flags**:
- Asks for unnecessary personal details
- Requests copies of ID or documents
- Wants your bank account information

**Protection**:
- Only share necessary information
- Never send copies of personal documents
- Use secure communication channels

### 3. Fake Item Listings
**How it works**: Scammer posts items they don't own
**Red flags**:
- Prices too good to be true
- Stock photos only
- Seller can't provide additional photos
- Unwilling to meet in person

**Protection**:
- Research item values
- Ask for additional photos
- Meet in person when possible
- Verify seller's identity

## Red Flags to Watch For

### Communication Red Flags
- Poor grammar and spelling
- Pushing for quick decisions
- Avoiding direct questions
- Refusing to provide contact information

### Payment Red Flags
- Requests for wire transfers
- Offers to overpay
- Asking for gift cards as payment
- Pressure to use specific payment methods

### Meeting Red Flags
- Insisting on remote locations
- Changing meeting times repeatedly
- Bringing unexpected people
- Refusing to show the item properly

## How to Protect Yourself

### For Buyers
1. **Meet in person** when possible
2. **Inspect items thoroughly** before paying
3. **Use secure payment methods**
4. **Trust your instincts**
5. **Report suspicious behavior**

### For Sellers
1. **Verify buyer identity**
2. **Meet in public places**
3. **Confirm payment before handing over items**
4. **Keep records of transactions**
5. **Don't accept overpayment**

## Safe Meeting Practices

### Location
- Choose public, well-lit areas
- Popular spots: shopping centers, cafes, police stations
- Avoid isolated locations
- Bring a friend if possible

### Timing
- Meet during daylight hours
- Avoid late evening meetings
- Choose busy times of day
- Have an escape plan

### Verification
- Ask for ID if needed
- Take photos of the transaction
- Get contact information
- Keep receipts or records

## What to Do If You're Scammed

1. **Stop all communication** with the scammer
2. **Document everything** - messages, photos, transactions
3. **Report to NaDlanka** immediately
4. **Contact local authorities** if significant loss
5. **Warn others** about the scammer

## NaDlanka's Safety Features

- **User verification** system
- **Report and block** functionality
- **Secure messaging** platform
- **24/7 support** team
- **Community guidelines** enforcement

Remember: If something feels wrong, it probably is. Trust your instincts and prioritize safety over convenience. NaDlanka is committed to maintaining a safe marketplace for everyone.

Stay safe and happy trading!`,
		category: "Safety & Security",
		tags: ["safety", "scams", "security", "tips"],
		isFeatured: true,
		status: "published",
	},
	{
		title: "Local Business Spotlight: TechRepair Skopje",
		excerpt:
			"Meet the local repair shop that's helping NaDlanka users fix their electronics and extend device lifespans.",
		content: `# Local Business Spotlight: TechRepair Skopje

This month we're highlighting TechRepair Skopje, a local business that's become a trusted partner for many NaDlanka users.

## About TechRepair Skopje

Founded in 2018 by Marko and Ana, TechRepair Skopje specializes in:
- Smartphone and tablet repairs
- Laptop and computer services
- Gaming console repairs
- Audio equipment restoration

## Why NaDlanka Users Love Them

### Quality Service
"We've repaired over 500 devices for NaDlanka users," says Marko. "Our success rate is 95%, and we provide warranty on all repairs."

### Fair Pricing
- Transparent pricing with no hidden fees
- Free diagnostics for NaDlanka users
- 10% discount on repairs over €50

### Quick Turnaround
- Most repairs completed within 24-48 hours
- Emergency services available
- Pickup and delivery options

## Success Stories

### Sarah's iPhone Rescue
"I dropped my iPhone and thought it was done for," says Sarah, a NaDlanka seller. "TechRepair fixed it in one day for half the price of buying new. Now I can continue selling my other items!"

### Gaming Setup Revival
"I bought a PS4 on NaDlanka that wasn't working," shares Alex. "TechRepair diagnosed and fixed it for €30. Best purchase I ever made!"

## Services Offered

### Smartphone Repairs
- Screen replacements
- Battery replacements
- Water damage repair
- Software issues
- Camera repairs

### Laptop Services
- Screen repairs
- Keyboard replacements
- Hard drive upgrades
- Software installation
- Performance optimization

### Gaming Consoles
- Disc drive repairs
- Controller fixes
- HDMI port repairs
- Overheating issues
- Software problems

## Special Offers for NaDlanka Users

1. **Free diagnostic** for all NaDlanka users
2. **10% discount** on repairs over €50
3. **Free pickup** for items over €100
4. **Extended warranty** on all repairs
5. **Trade-in program** for old devices

## How to Contact

- **Location**: Skopje City Center
- **Phone**: +389 2 123 456
- **Email**: info@techrepairsk.mk
- **Hours**: Mon-Fri 9AM-6PM, Sat 10AM-4PM

## Tips from the Experts

Marko and Ana share their advice for NaDlanka users:

### For Buyers
- "Always ask about repair history before buying electronics"
- "Test devices thoroughly during meetups"
- "Consider repair costs when negotiating prices"

### For Sellers
- "Be honest about any issues or previous repairs"
- "Include repair receipts in your listings"
- "Consider getting items repaired before selling"

## Community Impact

TechRepair Skopje has:
- Helped over 500 NaDlanka users
- Saved users over €50,000 in repair costs
- Prevented hundreds of devices from going to waste
- Created jobs for 3 local technicians

## Looking Forward

"We're planning to expand our services to include smart home device repairs," says Ana. "We want to be the go-to repair shop for all tech needs in Skopje."

## Get in Touch

Visit TechRepair Skopje for your repair needs and mention you're a NaDlanka user for special discounts!

*This spotlight is part of our ongoing series highlighting local businesses that support the NaDlanka community.*`,
		category: "Local News",
		tags: ["local business", "tech repair", "skopje", "services"],
		isFeatured: false,
		status: "published",
	},
];

async function seedBlogData() {
	try {
		// Connect to MongoDB
		await mongoose.connect(process.env.MONGODB_URI);
		console.log("Connected to MongoDB for blog seeding");

		// Clear existing blog data
		await Blog.deleteMany({});
		console.log("Cleared existing blog data");

		// Get a user to be the author (use the first user from seedData)
		const author = await User.findOne();
		if (!author) {
			console.error("No users found. Please run seedData.js first.");
			return;
		}

		// Create blog posts
		const createdPosts = [];
		for (const postData of sampleBlogPosts) {
			const post = new Blog({
				...postData,
				author: author._id,
			});
			await post.save();
			createdPosts.push(post);
			console.log(`Created blog post: ${post.title}`);
		}

		console.log("\n✅ Blog seeded successfully!");
		console.log(`📝 Created ${createdPosts.length} blog posts`);
		console.log("\nCategories included:");

		const categories = [...new Set(createdPosts.map((p) => p.category))];
		categories.forEach((cat) => {
			const count = createdPosts.filter((p) => p.category === cat).length;
			console.log(`  - ${cat}: ${count} posts`);
		});
	} catch (error) {
		console.error("Error seeding blog data:", error);
	} finally {
		await mongoose.disconnect();
		console.log("\n🔌 Disconnected from MongoDB");
	}
}

// Run the seeding function
if (require.main === module) {
	seedBlogData();
}

module.exports = { seedBlogData };
