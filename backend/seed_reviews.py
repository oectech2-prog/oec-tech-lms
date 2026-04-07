"""Seed 100+ student reviews"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path
import os
from datetime import datetime, timezone

load_dotenv(Path(__file__).parent / '.env')
client = AsyncIOMotorClient(os.environ['MONGO_URL'])
db = client[os.environ['DB_NAME']]

COURSE_IDS = ["course_comp_apps", "course_graphic", "course_smm", "course_wordpress", "course_shopify", "course_amazon_va", "course_ebay"]

# Pakistan reviews (80+)
PK_REVIEWS = [
    ("Ahmed Khan", "PK", 5, "course_smm", "This course changed my life! Now earning $500/month from social media management."),
    ("Fatima Noor", "PK", 5, "course_graphic", "Best graphic design course. I now have 5 regular clients on Fiverr!"),
    ("Muhammad Ali", "PK", 4, "course_shopify", "Made my first sale within 2 weeks. Amazing step-by-step guidance."),
    ("Ayesha Malik", "PK", 5, "course_wordpress", "Zero coding knowledge to building websites for businesses. Incredible!"),
    ("Hassan Raza", "PK", 5, "course_amazon_va", "Working as Amazon VA, earning $800/month from home. Best investment!"),
    ("Sara Ahmed", "PK", 4, "course_ebay", "Started eBay business after this course. Already made PKR 50,000 in first month."),
    ("Usman Sheikh", "PK", 5, "course_comp_apps", "Perfect for absolute beginners. Great foundation course!"),
    ("Zainab Tariq", "PK", 5, "course_smm", "The ads management module alone is worth the price. Managing 3 businesses now."),
    ("Bilal Hussain", "PK", 5, "course_graphic", "Canva and Photoshop skills I learned here got me my first freelance gig."),
    ("Hira Imran", "PK", 4, "course_smm", "Very practical approach. The weekly assignments really helped me learn."),
    ("Danish Qureshi", "PK", 5, "course_wordpress", "Built 4 websites for clients already. The Elementor section was amazing."),
    ("Nadia Bashir", "PK", 5, "course_shopify", "My Shopify store is now generating consistent sales. Thank you OEC!"),
    ("Faisal Mehmood", "PK", 4, "course_amazon_va", "Got my first VA client within a month of completing this course."),
    ("Sana Riaz", "PK", 5, "course_graphic", "The brand identity module helped me charge premium prices for my work."),
    ("Kamran Abbas", "PK", 5, "course_ebay", "Product sourcing strategies are pure gold. Already earning from eBay."),
    ("Amna Zaidi", "PK", 4, "course_comp_apps", "Very well structured. MS Office skills are essential and this course nailed it."),
    ("Rizwan Akram", "PK", 5, "course_smm", "Content creation strategies from this course doubled my engagement rates."),
    ("Maryam Siddiqui", "PK", 5, "course_wordpress", "I'm now a full-time freelance web developer thanks to this course!"),
    ("Asad Javed", "PK", 4, "course_shopify", "The Facebook ads module is incredibly detailed. Great ROI on course fee."),
    ("Rabia Khan", "PK", 5, "course_amazon_va", "PPC management skills I learned here are in huge demand. Always busy!"),
    ("Junaid Malik", "PK", 5, "course_graphic", "From zero to freelancer in 6 weeks. This course is a game changer."),
    ("Zunaira Ali", "PK", 4, "course_smm", "Really appreciate the practical assignments. Learned more than university."),
    ("Shahid Iqbal", "PK", 5, "course_ebay", "Making consistent income from eBay now. The listing optimization tips work!"),
    ("Nimra Fatima", "PK", 5, "course_wordpress", "WordPress + WooCommerce section is pure value. Built an online store!"),
    ("Waqar Ahmed", "PK", 4, "course_comp_apps", "Excel formulas and Google Sheets - I use these skills daily at work now."),
    ("Areesha Bhatti", "PK", 5, "course_graphic", "Portfolio building guidance helped me stand out on Upwork."),
    ("Tariq Mahmood", "PK", 5, "course_shopify", "Dropshipping business is running smoothly after following this course."),
    ("Madiha Rauf", "PK", 4, "course_amazon_va", "Well structured weekly modules make learning so much easier."),
    ("Owais Butt", "PK", 5, "course_smm", "Client handling and pitching module is worth the entire course price."),
    ("Saba Khalid", "PK", 5, "course_ebay", "I recommend this to everyone wanting to start online selling."),
    ("Imran Haider", "PK", 4, "course_wordpress", "SEO module helped me rank client websites on Google. Incredible value!"),
    ("Farah Nawaz", "PK", 5, "course_graphic", "Color theory and typography basics made me a much better designer."),
    ("Adeel Hassan", "PK", 5, "course_comp_apps", "Cloud tools section is very relevant for today's work environment."),
    ("Bushra Aslam", "PK", 4, "course_smm", "Understanding algorithms module helped me grow pages organically."),
    ("Naveed Anwar", "PK", 5, "course_shopify", "Product research methods taught here are actually what professionals use."),
    ("Lubna Parveen", "PK", 5, "course_amazon_va", "Inventory management skills from this course are highly valued by clients."),
    ("Kashif Raza", "PK", 4, "course_ebay", "Shipping and fulfillment module cleared all my doubts. Very practical!"),
    ("Mehreen Shah", "PK", 5, "course_graphic", "Fiverr profile setup guidance got me orders within first week!"),
    ("Nadeem Akhtar", "PK", 5, "course_wordpress", "Best WordPress course available in Pakistan. Highly recommend!"),
    ("Iqra Mahmood", "PK", 4, "course_smm", "Analytics reporting skills I learned are helping me retain clients."),
    ("Sajid Khan", "PK", 5, "course_comp_apps", "PowerPoint skills from this course helped me get a job promotion!"),
    ("Huma Qadir", "PK", 5, "course_shopify", "Scaling strategies actually work. My store revenue tripled!"),
    ("Yasir Mehmood", "PK", 4, "course_amazon_va", "Great course for anyone wanting to work remotely with US clients."),
    ("Samina Bibi", "PK", 5, "course_graphic", "Design principles taught here are timeless. Best learning investment."),
    ("Zeeshan Haider", "PK", 5, "course_ebay", "Customer service module helped me maintain top-rated seller status."),
    ("Rahat Gill", "PK", 4, "course_wordpress", "Theme customization section is incredibly detailed and practical."),
    ("Tahira Parveen", "PK", 5, "course_smm", "TikTok marketing tips from bonus content are very valuable."),
    ("Farhan Siddiqui", "PK", 5, "course_comp_apps", "File management skills seem basic but are actually very important."),
    ("Nosheen Akhtar", "PK", 4, "course_shopify", "Supplier management module saved me from many potential scams."),
    ("Waseem Abbas", "PK", 5, "course_amazon_va", "Got 3 clients on Upwork within first month. Course is gold!"),
    ("Irum Shahzadi", "PK", 5, "course_graphic", "Social media kit design skills are in huge demand. Always have work!"),
    ("Amir Hussain", "PK", 4, "course_ebay", "Very practical course. Theory is minimal, action is maximum."),
    ("Saima Arshad", "PK", 5, "course_wordpress", "E-commerce setup with WooCommerce was exactly what I needed."),
    ("Hamza Rafiq", "PK", 5, "course_smm", "Business profile setup guidance was very professional and thorough."),
    ("Rubina Bibi", "PK", 4, "course_comp_apps", "Google collaboration tools section is excellent for remote workers."),
    ("Atif Raza", "PK", 5, "course_shopify", "Order fulfillment process is now smooth thanks to this course."),
    ("Sidra Mumtaz", "PK", 5, "course_amazon_va", "Keyword research techniques taught here give real competitive advantage."),
    ("Qaiser Javed", "PK", 4, "course_graphic", "Photoshop photo editing skills opened new revenue streams for me."),
    ("Anila Yousuf", "PK", 5, "course_ebay", "eBay SEO and keywords module is what sets this course apart."),
    ("Mohsin Ali", "PK", 5, "course_wordpress", "Speed optimization tips made client websites load much faster."),
    ("Sumera Khan", "PK", 4, "course_smm", "Campaign creation targeting module is incredibly detailed."),
    ("Babar Iqbal", "PK", 5, "course_comp_apps", "Budget spreadsheet assignment was so practical. Using it daily now!"),
    ("Nasreen Bano", "PK", 5, "course_shopify", "Facebook ads for dropshipping section is expertly crafted."),
    ("Irfan Ahmed", "PK", 4, "course_amazon_va", "Customer service handling techniques are very professional."),
    ("Kiran Fatima", "PK", 5, "course_graphic", "Logo design principles changed how I approach every design project."),
    ("Shakeel Butt", "PK", 5, "course_ebay", "Wholesale sourcing tips helped me find products at best prices."),
    ("Asma Javed", "PK", 4, "course_wordpress", "Blog setup and content writing module added extra skills to my profile."),
    ("Rafiq Hussain", "PK", 5, "course_smm", "Budget and optimization strategies saved my clients thousands."),
    ("Parveen Akhtar", "PK", 5, "course_comp_apps", "Professional presentation skills from this course are invaluable."),
    ("Zahid Mahmood", "PK", 4, "course_shopify", "TikTok organic marketing strategies are working great for my store."),
    ("Tabassum Naz", "PK", 5, "course_amazon_va", "Listing optimization skills are in high demand. Always getting clients!"),
    ("Arif Raza", "PK", 5, "course_graphic", "Brand guidelines module taught me to think like a professional."),
    ("Shazia Bibi", "PK", 4, "course_ebay", "3-month growth plan assignment really helped me plan strategically."),
    ("Majid Khan", "PK", 5, "course_wordpress", "Domain and hosting setup guidance saved me from bad choices."),
    ("Fouzia Parveen", "PK", 5, "course_smm", "Copywriting for social media skills improved all my content."),
    ("Riaz Ahmad", "PK", 4, "course_comp_apps", "Document formatting skills are much more important than people think."),
    ("Nazia Begum", "PK", 5, "course_shopify", "Customer service and returns handling module is very practical."),
    ("Taimur Shah", "PK", 5, "course_amazon_va", "Daily workflow management techniques make me more efficient."),
    ("Rukhsana Bibi", "PK", 4, "course_graphic", "Canva interface mastery section was surprisingly thorough."),
    ("Zulfiqar Ali", "PK", 5, "course_ebay", "Product research methods revealed products I never would have found."),
]

# International reviews (20+)
INTL_REVIEWS = [
    ("Omar Hassan", "AE", 5, "course_smm", "Outstanding social media course. Now managing accounts for Dubai businesses."),
    ("Aisha Al-Rashid", "AE", 5, "course_graphic", "Best online design course I've found. Quality matches expensive UAE academies."),
    ("Mohammed Al-Maktoum", "AE", 4, "course_shopify", "Dropshipping from UAE is very profitable with these strategies."),
    ("Sarah Thompson", "GB", 5, "course_wordpress", "Brilliant WordPress course. Better than courses 10x the price in London."),
    ("James Wilson", "GB", 5, "course_smm", "Social media management skills from this course landed me a UK agency job."),
    ("Emily Davis", "GB", 4, "course_graphic", "Design fundamentals are taught brilliantly. Very practical approach."),
    ("Michael Brown", "US", 5, "course_amazon_va", "Amazon VA skills are in huge demand in the US market. Excellent course!"),
    ("Jennifer Martinez", "US", 5, "course_shopify", "Made my first $1000 in dropshipping within a month. Incredible!"),
    ("David Johnson", "US", 4, "course_ebay", "eBay selling strategies work perfectly for the US market."),
    ("Fatima Al-Sayed", "AE", 5, "course_comp_apps", "Perfect for building digital literacy. Very well structured course."),
    ("Abdullah Al-Nahyan", "AE", 4, "course_amazon_va", "Amazon PPC skills are incredibly valuable. Getting clients easily."),
    ("Charlotte Williams", "GB", 5, "course_wordpress", "The WooCommerce section helped me launch my UK online store."),
    ("Robert Taylor", "US", 5, "course_smm", "Facebook ads management skills are top notch. Better than Udemy courses."),
    ("Noura Al-Qassimi", "AE", 5, "course_graphic", "Brand identity module is exceptionally well designed. Premium quality."),
    ("Oliver Anderson", "GB", 4, "course_shopify", "Shopify dropshipping to UK market works great with these techniques."),
    ("Ashley Williams", "US", 5, "course_comp_apps", "Google Suite skills from this course streamlined my entire workflow."),
    ("Khalid Al-Ameri", "AE", 5, "course_ebay", "International selling on eBay made easy. Fantastic course content."),
    ("Sophie Clark", "GB", 4, "course_amazon_va", "Got hired as a remote Amazon VA within weeks of completing the course."),
    ("Christopher Lee", "US", 5, "course_graphic", "Portfolio building advice was exactly what I needed. Now freelancing full-time."),
    ("Maryam Al-Falasi", "AE", 5, "course_wordpress", "Website security module was incredibly valuable for my business."),
    ("William Taylor", "GB", 5, "course_smm", "Analytics and reporting skills set me apart from other marketers."),
    ("Jessica Garcia", "US", 4, "course_shopify", "Scaling strategies helped me go from $500 to $5000 monthly revenue."),
    ("Ahmad Al-Suwaidi", "AE", 5, "course_amazon_va", "Seller Central navigation is taught with extreme clarity and precision."),
    ("Thomas Brown", "GB", 4, "course_ebay", "UK eBay market strategies are well covered. Very relevant content."),
]

async def seed_reviews():
    await db.reviews.delete_many({})
    all_reviews = []
    
    for i, (name, country, rating, course_id, comment) in enumerate(PK_REVIEWS):
        all_reviews.append({
            "review_id": f"review_pk_{i+1}",
            "user_id": f"seed_pk_{i+1}",
            "user_name": name,
            "user_picture": None,
            "user_country": country,
            "course_id": course_id,
            "rating": rating,
            "comment": comment,
            "created_at": datetime.now(timezone.utc).isoformat()
        })
    
    for i, (name, country, rating, course_id, comment) in enumerate(INTL_REVIEWS):
        all_reviews.append({
            "review_id": f"review_intl_{i+1}",
            "user_id": f"seed_intl_{i+1}",
            "user_name": name,
            "user_picture": None,
            "user_country": country,
            "course_id": course_id,
            "rating": rating,
            "comment": comment,
            "created_at": datetime.now(timezone.utc).isoformat()
        })
    
    for review in all_reviews:
        await db.reviews.insert_one(review)
    
    print(f"Seeded {len(all_reviews)} reviews ({len(PK_REVIEWS)} PK + {len(INTL_REVIEWS)} International)")

if __name__ == "__main__":
    asyncio.run(seed_reviews())
