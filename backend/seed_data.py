"""Seed script - run once to populate initial data"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path
import os
import uuid
from datetime import datetime, timezone

load_dotenv(Path(__file__).parent / '.env')

client = AsyncIOMotorClient(os.environ['MONGO_URL'])
db = client[os.environ['DB_NAME']]

COURSES = [
    {
        "course_id": "course_comp_apps",
        "title": "Computer Applications",
        "short_description": "Master essential computer skills including MS Office, Google Suite, and productivity tools.",
        "description": "This comprehensive course covers everything you need to become proficient in computer applications. From Microsoft Office Suite to Google Workspace, you'll learn the tools that every professional needs. Perfect for beginners who want to build a strong foundation in digital literacy.",
        "price": 5000,
        "currency": "PKR",
        "image_url": "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600",
        "category": "Technology",
        "duration": "5 Weeks",
        "level": "Beginner",
        "instructor": "Hussnain Academy",
        "intro_video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ",
        "intro_video_type": "youtube",
        "requirements": ["Basic internet knowledge", "Laptop or desktop computer", "No prior experience needed"],
        "what_you_will_learn": ["Microsoft Word, Excel, PowerPoint", "Google Docs, Sheets, Slides", "Email management & cloud storage", "File management & organization", "Basic troubleshooting skills"],
        "weeks": [
            {"week_number": 1, "title": "Introduction to Computers", "description": "Getting started with computer basics", "lessons": [
                {"lesson_id": "ca_w1_l1", "title": "Computer Basics & Operating Systems", "video_type": "youtube", "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ", "duration": "25 min"},
                {"lesson_id": "ca_w1_l2", "title": "File Management & Organization", "video_type": "youtube", "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ", "duration": "20 min"},
                {"lesson_id": "ca_w1_l3", "title": "Internet & Email Basics", "video_type": "youtube", "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ", "duration": "15 min"}
            ], "assignment": {"assignment_id": "ca_a1", "title": "Setup Your Workspace", "description": "Create organized folders and set up your email account properly.", "is_final_project": False}},
            {"week_number": 2, "title": "Microsoft Word & Google Docs", "description": "Document creation and formatting", "lessons": [
                {"lesson_id": "ca_w2_l1", "title": "MS Word Fundamentals", "video_type": "youtube", "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ", "duration": "30 min"},
                {"lesson_id": "ca_w2_l2", "title": "Advanced Formatting & Templates", "video_type": "youtube", "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ", "duration": "25 min"},
                {"lesson_id": "ca_w2_l3", "title": "Google Docs Collaboration", "video_type": "youtube", "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ", "duration": "20 min"}
            ], "assignment": {"assignment_id": "ca_a2", "title": "Create a Professional Document", "description": "Design a professional resume using MS Word or Google Docs.", "is_final_project": False}},
            {"week_number": 3, "title": "Excel & Google Sheets", "description": "Spreadsheet mastery", "lessons": [
                {"lesson_id": "ca_w3_l1", "title": "Excel Basics & Formulas", "video_type": "youtube", "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ", "duration": "30 min"},
                {"lesson_id": "ca_w3_l2", "title": "Data Analysis & Charts", "video_type": "youtube", "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ", "duration": "25 min"}
            ], "assignment": {"assignment_id": "ca_a3", "title": "Budget Spreadsheet", "description": "Create a monthly budget tracker with formulas and charts.", "is_final_project": False}},
            {"week_number": 4, "title": "Presentations & Cloud Tools", "description": "Creating impactful presentations", "lessons": [
                {"lesson_id": "ca_w4_l1", "title": "PowerPoint & Google Slides", "video_type": "youtube", "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ", "duration": "25 min"},
                {"lesson_id": "ca_w4_l2", "title": "Cloud Storage & Collaboration", "video_type": "youtube", "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ", "duration": "20 min"}
            ], "assignment": {"assignment_id": "ca_a4", "title": "Professional Presentation", "description": "Create a 10-slide business presentation.", "is_final_project": False}},
            {"week_number": 5, "title": "Final Project", "description": "Apply everything you've learned", "lessons": [
                {"lesson_id": "ca_w5_l1", "title": "Project Guidelines & Review", "video_type": "youtube", "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ", "duration": "15 min"}
            ], "assignment": {"assignment_id": "ca_final", "title": "Complete Office Suite Project", "description": "Create a complete business proposal with document, spreadsheet analysis, and presentation.", "is_final_project": True}}
        ],
        "is_published": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "course_id": "course_graphic",
        "title": "Graphic Designing",
        "short_description": "Learn professional graphic design using Canva, Photoshop, and Illustrator.",
        "description": "Become a professional graphic designer from scratch. This course covers everything from basic design principles to advanced techniques in Canva, Adobe Photoshop, and Illustrator. Start freelancing and earn money with your design skills.",
        "price": 8000,
        "currency": "PKR",
        "image_url": "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=600",
        "category": "Design",
        "duration": "6 Weeks",
        "level": "Beginner to Intermediate",
        "instructor": "Hussnain Academy",
        "intro_video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ",
        "intro_video_type": "youtube",
        "requirements": ["Laptop or desktop computer", "Internet connection", "Canva account (free)", "No prior design experience needed"],
        "what_you_will_learn": ["Design principles & color theory", "Canva for social media & branding", "Adobe Photoshop basics", "Logo & brand identity design", "Freelancing on Fiverr & Upwork"],
        "weeks": [
            {"week_number": 1, "title": "Design Fundamentals", "description": "Learn the basics of visual design", "lessons": [
                {"lesson_id": "gd_w1_l1", "title": "Design Principles & Color Theory", "video_type": "youtube", "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ", "duration": "30 min"},
                {"lesson_id": "gd_w1_l2", "title": "Typography & Layout Basics", "video_type": "youtube", "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ", "duration": "25 min"}
            ], "assignment": {"assignment_id": "gd_a1", "title": "Color Palette Creation", "description": "Create 3 different color palettes for different brand types.", "is_final_project": False}},
            {"week_number": 2, "title": "Canva Mastery", "description": "Professional designs with Canva", "lessons": [
                {"lesson_id": "gd_w2_l1", "title": "Canva Interface & Tools", "video_type": "youtube", "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ", "duration": "30 min"},
                {"lesson_id": "gd_w2_l2", "title": "Social Media Post Design", "video_type": "youtube", "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ", "duration": "25 min"},
                {"lesson_id": "gd_w2_l3", "title": "Branding & Business Cards", "video_type": "youtube", "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ", "duration": "20 min"}
            ], "assignment": {"assignment_id": "gd_a2", "title": "Social Media Kit", "description": "Design a complete social media kit (5 posts + 2 stories) for a brand.", "is_final_project": False}},
            {"week_number": 3, "title": "Adobe Photoshop Basics", "description": "Photo editing and manipulation", "lessons": [
                {"lesson_id": "gd_w3_l1", "title": "Photoshop Interface & Tools", "video_type": "youtube", "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ", "duration": "35 min"},
                {"lesson_id": "gd_w3_l2", "title": "Photo Editing & Retouching", "video_type": "youtube", "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ", "duration": "30 min"}
            ], "assignment": {"assignment_id": "gd_a3", "title": "Photo Manipulation Project", "description": "Edit and enhance 5 photos using Photoshop techniques.", "is_final_project": False}},
            {"week_number": 4, "title": "Logo & Brand Identity", "description": "Creating professional logos", "lessons": [
                {"lesson_id": "gd_w4_l1", "title": "Logo Design Principles", "video_type": "youtube", "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ", "duration": "25 min"},
                {"lesson_id": "gd_w4_l2", "title": "Brand Identity Guidelines", "video_type": "youtube", "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ", "duration": "20 min"}
            ], "assignment": {"assignment_id": "gd_a4", "title": "Brand Identity Package", "description": "Create a complete brand identity for a fictional company.", "is_final_project": False}},
            {"week_number": 5, "title": "Freelancing & Portfolio", "description": "Start earning with your skills", "lessons": [
                {"lesson_id": "gd_w5_l1", "title": "Building Your Portfolio", "video_type": "youtube", "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ", "duration": "20 min"},
                {"lesson_id": "gd_w5_l2", "title": "Fiverr & Upwork Setup", "video_type": "youtube", "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ", "duration": "25 min"}
            ], "assignment": {"assignment_id": "gd_a5", "title": "Freelance Profile Setup", "description": "Set up your Fiverr or Upwork profile with portfolio pieces.", "is_final_project": False}},
            {"week_number": 6, "title": "Final Project", "description": "Complete brand design project", "lessons": [
                {"lesson_id": "gd_w6_l1", "title": "Final Project Briefing", "video_type": "youtube", "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ", "duration": "15 min"}
            ], "assignment": {"assignment_id": "gd_final", "title": "Complete Brand Design Project", "description": "Design a complete brand package: logo, social media kit, business card, and brand guidelines.", "is_final_project": True}}
        ],
        "is_published": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "course_id": "course_smm",
        "title": "Social Media Marketing",
        "short_description": "Master Facebook, Instagram, and TikTok marketing to grow brands and earn online.",
        "description": "Learn how to create, manage, and grow social media accounts for businesses. This course covers content creation, paid advertising, analytics, and client management. Start your social media marketing agency or freelance career.",
        "price": 10000,
        "currency": "PKR",
        "image_url": "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600",
        "category": "Marketing",
        "duration": "5 Weeks",
        "level": "Beginner",
        "instructor": "Hussnain Academy",
        "intro_video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ",
        "intro_video_type": "youtube",
        "requirements": ["Basic internet knowledge", "Laptop or mobile phone", "Social media accounts", "No prior marketing experience needed"],
        "what_you_will_learn": ["Facebook & Instagram Marketing", "Ads Management (Meta Ads)", "Content Creation Strategies", "Client Handling & Pitching", "Earning methods & freelancing"],
        "weeks": [
            {"week_number": 1, "title": "Social Media Fundamentals", "description": "Understanding social media platforms", "lessons": [
                {"lesson_id": "smm_w1_l1", "title": "Social Media Landscape Overview", "video_type": "youtube", "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ", "duration": "25 min"},
                {"lesson_id": "smm_w1_l2", "title": "Creating Business Profiles", "video_type": "youtube", "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ", "duration": "20 min"},
                {"lesson_id": "smm_w1_l3", "title": "Understanding Algorithms", "video_type": "youtube", "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ", "duration": "15 min"}
            ], "assignment": {"assignment_id": "smm_a1", "title": "Platform Audit", "description": "Analyze 3 successful brand pages and note their strategies.", "is_final_project": False}},
            {"week_number": 2, "title": "Content Creation", "description": "Creating engaging content", "lessons": [
                {"lesson_id": "smm_w2_l1", "title": "Content Strategy & Planning", "video_type": "youtube", "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ", "duration": "30 min"},
                {"lesson_id": "smm_w2_l2", "title": "Graphic & Video Content", "video_type": "youtube", "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ", "duration": "25 min"},
                {"lesson_id": "smm_w2_l3", "title": "Copywriting for Social Media", "video_type": "youtube", "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ", "duration": "20 min"}
            ], "assignment": {"assignment_id": "smm_a2", "title": "Content Calendar", "description": "Create a 1-week content calendar with 7 posts designed and written.", "is_final_project": False}},
            {"week_number": 3, "title": "Paid Advertising", "description": "Facebook & Instagram Ads", "lessons": [
                {"lesson_id": "smm_w3_l1", "title": "Meta Ads Manager Setup", "video_type": "youtube", "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ", "duration": "35 min"},
                {"lesson_id": "smm_w3_l2", "title": "Campaign Creation & Targeting", "video_type": "youtube", "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ", "duration": "30 min"},
                {"lesson_id": "smm_w3_l3", "title": "Budget & Optimization", "video_type": "youtube", "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ", "duration": "25 min"}
            ], "assignment": {"assignment_id": "smm_a3", "title": "Ad Campaign Plan", "description": "Design a complete ad campaign for a local business with targeting and budget.", "is_final_project": False}},
            {"week_number": 4, "title": "Analytics & Client Management", "description": "Measuring results and handling clients", "lessons": [
                {"lesson_id": "smm_w4_l1", "title": "Analytics & Reporting", "video_type": "youtube", "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ", "duration": "25 min"},
                {"lesson_id": "smm_w4_l2", "title": "Client Pitching & Management", "video_type": "youtube", "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ", "duration": "20 min"}
            ], "assignment": {"assignment_id": "smm_a4", "title": "Client Proposal", "description": "Write a professional social media management proposal.", "is_final_project": False}},
            {"week_number": 5, "title": "Final Project", "description": "Complete marketing campaign", "lessons": [
                {"lesson_id": "smm_w5_l1", "title": "Final Project Guidelines", "video_type": "youtube", "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ", "duration": "15 min"}
            ], "assignment": {"assignment_id": "smm_final", "title": "Complete Marketing Campaign", "description": "Create a full social media marketing campaign including content, ads plan, and analytics framework.", "is_final_project": True}}
        ],
        "is_published": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "course_id": "course_wordpress",
        "title": "WordPress Web Development",
        "short_description": "Build professional websites with WordPress - no coding required.",
        "description": "Learn to build stunning, professional websites using WordPress. From basic setup to advanced customization, e-commerce integration, and SEO. Start offering web development services and earn online.",
        "price": 12000,
        "currency": "PKR",
        "image_url": "https://images.unsplash.com/photo-1547658719-da2b51169166?w=600",
        "category": "Web Development",
        "duration": "6 Weeks",
        "level": "Beginner",
        "instructor": "Hussnain Academy",
        "intro_video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ",
        "intro_video_type": "youtube",
        "requirements": ["Laptop or desktop computer", "Internet connection", "Domain & hosting (guidance provided)", "No coding experience needed"],
        "what_you_will_learn": ["WordPress installation & setup", "Theme customization & page builders", "WooCommerce for online stores", "SEO optimization basics", "Website maintenance & security"],
        "weeks": [
            {"week_number": 1, "title": "WordPress Setup", "description": "Getting your website live", "lessons": [
                {"lesson_id": "wp_w1_l1", "title": "Domain & Hosting Setup", "video_type": "youtube", "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ", "duration": "30 min"},
                {"lesson_id": "wp_w1_l2", "title": "WordPress Installation", "video_type": "youtube", "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ", "duration": "20 min"},
                {"lesson_id": "wp_w1_l3", "title": "Dashboard Overview", "video_type": "youtube", "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ", "duration": "15 min"}
            ], "assignment": {"assignment_id": "wp_a1", "title": "Install WordPress", "description": "Set up WordPress on your hosting and configure basic settings.", "is_final_project": False}},
            {"week_number": 2, "title": "Themes & Customization", "description": "Making your site look professional", "lessons": [
                {"lesson_id": "wp_w2_l1", "title": "Choosing & Installing Themes", "video_type": "youtube", "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ", "duration": "25 min"},
                {"lesson_id": "wp_w2_l2", "title": "Elementor Page Builder", "video_type": "youtube", "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ", "duration": "35 min"}
            ], "assignment": {"assignment_id": "wp_a2", "title": "Build Homepage", "description": "Create a professional homepage using Elementor.", "is_final_project": False}},
            {"week_number": 3, "title": "Pages & Content", "description": "Building your website pages", "lessons": [
                {"lesson_id": "wp_w3_l1", "title": "Creating Essential Pages", "video_type": "youtube", "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ", "duration": "25 min"},
                {"lesson_id": "wp_w3_l2", "title": "Blog Setup & Content Writing", "video_type": "youtube", "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ", "duration": "20 min"}
            ], "assignment": {"assignment_id": "wp_a3", "title": "Create 5 Pages", "description": "Build Home, About, Services, Blog, and Contact pages.", "is_final_project": False}},
            {"week_number": 4, "title": "WooCommerce & E-commerce", "description": "Selling products online", "lessons": [
                {"lesson_id": "wp_w4_l1", "title": "WooCommerce Setup", "video_type": "youtube", "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ", "duration": "30 min"},
                {"lesson_id": "wp_w4_l2", "title": "Product Listings & Payments", "video_type": "youtube", "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ", "duration": "25 min"}
            ], "assignment": {"assignment_id": "wp_a4", "title": "E-commerce Store", "description": "Set up a basic online store with 5 products.", "is_final_project": False}},
            {"week_number": 5, "title": "SEO & Performance", "description": "Optimizing your website", "lessons": [
                {"lesson_id": "wp_w5_l1", "title": "SEO Fundamentals for WordPress", "video_type": "youtube", "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ", "duration": "25 min"},
                {"lesson_id": "wp_w5_l2", "title": "Speed & Security Optimization", "video_type": "youtube", "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ", "duration": "20 min"}
            ], "assignment": {"assignment_id": "wp_a5", "title": "SEO Audit", "description": "Perform a complete SEO audit on your website.", "is_final_project": False}},
            {"week_number": 6, "title": "Final Project", "description": "Complete website project", "lessons": [
                {"lesson_id": "wp_w6_l1", "title": "Final Project Briefing", "video_type": "youtube", "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ", "duration": "15 min"}
            ], "assignment": {"assignment_id": "wp_final", "title": "Professional Business Website", "description": "Build a complete professional website for a real or fictional business.", "is_final_project": True}}
        ],
        "is_published": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "course_id": "course_shopify",
        "title": "Shopify Dropshipping",
        "short_description": "Start your own e-commerce business with Shopify dropshipping.",
        "description": "Learn how to build and run a profitable dropshipping business using Shopify. From product research to store setup, marketing, and order fulfillment. Start your e-commerce journey and earn from anywhere in the world.",
        "price": 15000,
        "currency": "PKR",
        "image_url": "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600",
        "category": "E-Commerce",
        "duration": "5 Weeks",
        "level": "Beginner",
        "instructor": "Hussnain Academy",
        "intro_video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ",
        "intro_video_type": "youtube",
        "requirements": ["Laptop or computer", "Internet connection", "Small investment for Shopify subscription", "Willingness to learn e-commerce"],
        "what_you_will_learn": ["Shopify store setup from scratch", "Product research & winning products", "Supplier management (AliExpress, CJ)", "Facebook & Google Ads for e-commerce", "Order fulfillment & customer service"],
        "weeks": [
            {"week_number": 1, "title": "Dropshipping Fundamentals", "description": "Understanding the business model", "lessons": [
                {"lesson_id": "sh_w1_l1", "title": "What is Dropshipping?", "video_type": "youtube", "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ", "duration": "20 min"},
                {"lesson_id": "sh_w1_l2", "title": "Product Research Methods", "video_type": "youtube", "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ", "duration": "30 min"},
                {"lesson_id": "sh_w1_l3", "title": "Finding Reliable Suppliers", "video_type": "youtube", "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ", "duration": "25 min"}
            ], "assignment": {"assignment_id": "sh_a1", "title": "Product Research", "description": "Find 5 potential winning products with supplier links and profit margins.", "is_final_project": False}},
            {"week_number": 2, "title": "Shopify Store Setup", "description": "Building your online store", "lessons": [
                {"lesson_id": "sh_w2_l1", "title": "Shopify Account & Theme Setup", "video_type": "youtube", "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ", "duration": "30 min"},
                {"lesson_id": "sh_w2_l2", "title": "Product Listings & Collections", "video_type": "youtube", "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ", "duration": "25 min"},
                {"lesson_id": "sh_w2_l3", "title": "Payment & Shipping Setup", "video_type": "youtube", "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ", "duration": "20 min"}
            ], "assignment": {"assignment_id": "sh_a2", "title": "Store Setup", "description": "Set up your complete Shopify store with at least 3 products.", "is_final_project": False}},
            {"week_number": 3, "title": "Marketing & Ads", "description": "Driving traffic to your store", "lessons": [
                {"lesson_id": "sh_w3_l1", "title": "Facebook Ads for Dropshipping", "video_type": "youtube", "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ", "duration": "35 min"},
                {"lesson_id": "sh_w3_l2", "title": "TikTok & Organic Marketing", "video_type": "youtube", "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ", "duration": "25 min"}
            ], "assignment": {"assignment_id": "sh_a3", "title": "Ad Campaign", "description": "Create a Facebook ad campaign for your store.", "is_final_project": False}},
            {"week_number": 4, "title": "Operations & Scaling", "description": "Running and growing your business", "lessons": [
                {"lesson_id": "sh_w4_l1", "title": "Order Fulfillment Process", "video_type": "youtube", "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ", "duration": "20 min"},
                {"lesson_id": "sh_w4_l2", "title": "Customer Service & Returns", "video_type": "youtube", "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ", "duration": "15 min"},
                {"lesson_id": "sh_w4_l3", "title": "Scaling Strategies", "video_type": "youtube", "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ", "duration": "25 min"}
            ], "assignment": {"assignment_id": "sh_a4", "title": "Business Plan", "description": "Create a 30-day scaling plan for your store.", "is_final_project": False}},
            {"week_number": 5, "title": "Final Project", "description": "Launch your store", "lessons": [
                {"lesson_id": "sh_w5_l1", "title": "Final Project Briefing", "video_type": "youtube", "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ", "duration": "15 min"}
            ], "assignment": {"assignment_id": "sh_final", "title": "Launch Your Shopify Store", "description": "Launch a complete, optimized Shopify store with products, ads setup, and marketing plan.", "is_final_project": True}}
        ],
        "is_published": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "course_id": "course_amazon_va",
        "title": "Amazon Virtual Assistant",
        "short_description": "Become a skilled Amazon VA and earn from home with international clients.",
        "description": "Learn all the skills needed to become a professional Amazon Virtual Assistant. From product listing to PPC management, customer service, and account management. High-demand skill with clients worldwide.",
        "price": 12000,
        "currency": "PKR",
        "image_url": "https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?w=600",
        "category": "E-Commerce",
        "duration": "5 Weeks",
        "level": "Beginner",
        "instructor": "Hussnain Academy",
        "intro_video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ",
        "intro_video_type": "youtube",
        "requirements": ["Laptop or computer", "Good internet connection", "Basic English communication", "Willingness to learn Amazon ecosystem"],
        "what_you_will_learn": ["Amazon Seller Central navigation", "Product listing & optimization", "PPC advertising management", "Customer service handling", "Finding VA clients on Upwork/Fiverr"],
        "weeks": [
            {"week_number": 1, "title": "Amazon Basics", "description": "Understanding Amazon marketplace", "lessons": [
                {"lesson_id": "ava_w1_l1", "title": "Amazon Marketplace Overview", "video_type": "youtube", "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ", "duration": "25 min"},
                {"lesson_id": "ava_w1_l2", "title": "Seller Central Navigation", "video_type": "youtube", "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ", "duration": "30 min"}
            ], "assignment": {"assignment_id": "ava_a1", "title": "Platform Exploration", "description": "Create a detailed guide of Amazon Seller Central features.", "is_final_project": False}},
            {"week_number": 2, "title": "Product Listing", "description": "Creating optimized listings", "lessons": [
                {"lesson_id": "ava_w2_l1", "title": "Product Research & Keywords", "video_type": "youtube", "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ", "duration": "30 min"},
                {"lesson_id": "ava_w2_l2", "title": "Listing Optimization", "video_type": "youtube", "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ", "duration": "25 min"}
            ], "assignment": {"assignment_id": "ava_a2", "title": "Optimize a Listing", "description": "Write an optimized product listing with keywords and bullet points.", "is_final_project": False}},
            {"week_number": 3, "title": "PPC & Advertising", "description": "Amazon advertising mastery", "lessons": [
                {"lesson_id": "ava_w3_l1", "title": "PPC Campaign Types", "video_type": "youtube", "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ", "duration": "30 min"},
                {"lesson_id": "ava_w3_l2", "title": "Campaign Optimization", "video_type": "youtube", "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ", "duration": "25 min"}
            ], "assignment": {"assignment_id": "ava_a3", "title": "PPC Strategy", "description": "Create a PPC campaign strategy for a sample product.", "is_final_project": False}},
            {"week_number": 4, "title": "Account Management", "description": "Customer service and operations", "lessons": [
                {"lesson_id": "ava_w4_l1", "title": "Customer Service & Reviews", "video_type": "youtube", "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ", "duration": "20 min"},
                {"lesson_id": "ava_w4_l2", "title": "Inventory & Order Management", "video_type": "youtube", "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ", "duration": "20 min"}
            ], "assignment": {"assignment_id": "ava_a4", "title": "Management Workflow", "description": "Create a daily workflow for managing an Amazon account.", "is_final_project": False}},
            {"week_number": 5, "title": "Final Project", "description": "Portfolio and job applications", "lessons": [
                {"lesson_id": "ava_w5_l1", "title": "Building Your VA Portfolio", "video_type": "youtube", "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ", "duration": "20 min"},
                {"lesson_id": "ava_w5_l2", "title": "Finding Clients", "video_type": "youtube", "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ", "duration": "15 min"}
            ], "assignment": {"assignment_id": "ava_final", "title": "Complete VA Portfolio", "description": "Build a professional VA portfolio and apply to 5 VA jobs.", "is_final_project": True}}
        ],
        "is_published": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "course_id": "course_ebay",
        "title": "eBay Business",
        "short_description": "Start selling on eBay and build a profitable online business.",
        "description": "Learn how to source products, create listings, manage orders, and scale your eBay business. From beginner to advanced seller strategies. Start earning with one of the world's largest marketplaces.",
        "price": 10000,
        "currency": "PKR",
        "image_url": "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=600",
        "category": "E-Commerce",
        "duration": "5 Weeks",
        "level": "Beginner",
        "instructor": "Hussnain Academy",
        "intro_video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ",
        "intro_video_type": "youtube",
        "requirements": ["Laptop or computer", "Internet connection", "eBay account", "Basic English skills"],
        "what_you_will_learn": ["eBay account setup & policies", "Product sourcing strategies", "Listing optimization & SEO", "Shipping & customer service", "Scaling your eBay business"],
        "weeks": [
            {"week_number": 1, "title": "eBay Fundamentals", "description": "Getting started on eBay", "lessons": [
                {"lesson_id": "eb_w1_l1", "title": "eBay Platform Overview", "video_type": "youtube", "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ", "duration": "25 min"},
                {"lesson_id": "eb_w1_l2", "title": "Account Setup & Store Creation", "video_type": "youtube", "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ", "duration": "20 min"},
                {"lesson_id": "eb_w1_l3", "title": "eBay Policies & Rules", "video_type": "youtube", "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ", "duration": "15 min"}
            ], "assignment": {"assignment_id": "eb_a1", "title": "Store Setup", "description": "Create and configure your eBay seller account.", "is_final_project": False}},
            {"week_number": 2, "title": "Product Sourcing", "description": "Finding profitable products", "lessons": [
                {"lesson_id": "eb_w2_l1", "title": "Product Research Methods", "video_type": "youtube", "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ", "duration": "30 min"},
                {"lesson_id": "eb_w2_l2", "title": "Sourcing from Wholesale & Thrift", "video_type": "youtube", "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ", "duration": "25 min"}
            ], "assignment": {"assignment_id": "eb_a2", "title": "Product List", "description": "Find 10 profitable products to sell on eBay with pricing analysis.", "is_final_project": False}},
            {"week_number": 3, "title": "Listing & SEO", "description": "Optimizing your listings", "lessons": [
                {"lesson_id": "eb_w3_l1", "title": "Creating Winning Listings", "video_type": "youtube", "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ", "duration": "25 min"},
                {"lesson_id": "eb_w3_l2", "title": "eBay SEO & Keywords", "video_type": "youtube", "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ", "duration": "20 min"}
            ], "assignment": {"assignment_id": "eb_a3", "title": "Create 5 Listings", "description": "Create 5 optimized eBay listings with professional photos.", "is_final_project": False}},
            {"week_number": 4, "title": "Operations & Scaling", "description": "Running your eBay business", "lessons": [
                {"lesson_id": "eb_w4_l1", "title": "Shipping & Fulfillment", "video_type": "youtube", "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ", "duration": "20 min"},
                {"lesson_id": "eb_w4_l2", "title": "Customer Service Excellence", "video_type": "youtube", "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ", "duration": "15 min"},
                {"lesson_id": "eb_w4_l3", "title": "Scaling Strategies", "video_type": "youtube", "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ", "duration": "25 min"}
            ], "assignment": {"assignment_id": "eb_a4", "title": "Business Plan", "description": "Create a 3-month eBay business growth plan.", "is_final_project": False}},
            {"week_number": 5, "title": "Final Project", "description": "Launch your eBay business", "lessons": [
                {"lesson_id": "eb_w5_l1", "title": "Final Project Guidelines", "video_type": "youtube", "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ", "duration": "15 min"}
            ], "assignment": {"assignment_id": "eb_final", "title": "Launch Your eBay Store", "description": "Launch a complete eBay store with 10+ listed products and marketing strategy.", "is_final_project": True}}
        ],
        "is_published": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
]

DIPLOMA_TRACKS = [
    {
        "track_id": "track_digital_marketing",
        "title": "Digital Marketing Diploma",
        "description": "Master all aspects of digital marketing from social media to paid advertising. Complete this track to earn your Digital Marketing Diploma and start working with clients worldwide.",
        "courses": ["course_smm", "course_graphic"],
        "roadmap": [
            {"step": 1, "title": "Social Media Marketing", "description": "Learn platform-specific marketing strategies"},
            {"step": 2, "title": "Graphic Designing", "description": "Create professional marketing materials"},
            {"step": 3, "title": "Diploma Completion", "description": "Complete all assignments and final projects"}
        ],
        "outcomes": [
            "Manage social media accounts professionally",
            "Run paid advertising campaigns",
            "Create marketing graphics and content",
            "Land freelance clients or full-time marketing roles",
            "Earn PKR 50,000 - 200,000/month"
        ],
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "track_id": "track_ecommerce",
        "title": "E-Commerce Diploma",
        "description": "Build and scale your own e-commerce empire. From Shopify dropshipping to Amazon and eBay selling, this track covers all major platforms.",
        "courses": ["course_shopify", "course_amazon_va", "course_ebay"],
        "roadmap": [
            {"step": 1, "title": "Shopify Dropshipping", "description": "Build your own online store"},
            {"step": 2, "title": "Amazon Virtual Assistant", "description": "Master Amazon marketplace"},
            {"step": 3, "title": "eBay Business", "description": "Expand to eBay selling"},
            {"step": 4, "title": "Diploma Completion", "description": "Submit all final projects"}
        ],
        "outcomes": [
            "Run your own Shopify store",
            "Work as Amazon VA for international clients",
            "Sell on eBay globally",
            "Build multiple income streams",
            "Earn PKR 100,000 - 500,000/month"
        ],
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "track_id": "track_web_design",
        "title": "Web Design & Development Diploma",
        "description": "Become a professional web designer and developer. Build websites for clients and earn through freelancing platforms.",
        "courses": ["course_comp_apps", "course_graphic", "course_wordpress"],
        "roadmap": [
            {"step": 1, "title": "Computer Applications", "description": "Build strong computer fundamentals"},
            {"step": 2, "title": "Graphic Designing", "description": "Learn visual design principles"},
            {"step": 3, "title": "WordPress Development", "description": "Build professional websites"},
            {"step": 4, "title": "Diploma Completion", "description": "Build portfolio website"}
        ],
        "outcomes": [
            "Build professional websites from scratch",
            "Create stunning visual designs",
            "Offer web development as a service",
            "Freelance on Fiverr & Upwork",
            "Earn PKR 80,000 - 300,000/month"
        ],
        "created_at": datetime.now(timezone.utc).isoformat()
    }
]

REVIEWS = [
    {"review_id": "review_1", "user_id": "seed_user_1", "user_name": "Ahmed Khan", "user_picture": None, "course_id": "course_smm", "rating": 5, "comment": "This course changed my life! I started freelancing on Fiverr and now earning $500/month from social media management. The weekly structure made learning so easy.", "created_at": datetime.now(timezone.utc).isoformat()},
    {"review_id": "review_2", "user_id": "seed_user_2", "user_name": "Fatima Noor", "user_picture": None, "course_id": "course_graphic", "rating": 5, "comment": "Best graphic design course for beginners in Pakistan. The assignments were very practical and helped me build a real portfolio. Now I have 5 regular clients!", "created_at": datetime.now(timezone.utc).isoformat()},
    {"review_id": "review_3", "user_id": "seed_user_3", "user_name": "Muhammad Ali", "user_picture": None, "course_id": "course_shopify", "rating": 4, "comment": "Great step-by-step course on Shopify dropshipping. Made my first sale within 2 weeks of completing the course. Highly recommended for anyone wanting to start an online business.", "created_at": datetime.now(timezone.utc).isoformat()},
    {"review_id": "review_4", "user_id": "seed_user_4", "user_name": "Ayesha Malik", "user_picture": None, "course_id": "course_wordpress", "rating": 5, "comment": "I had zero coding knowledge but now I build websites for local businesses. The WordPress course is very well structured with weekly assignments that actually teach you real skills.", "created_at": datetime.now(timezone.utc).isoformat()},
    {"review_id": "review_5", "user_id": "seed_user_5", "user_name": "Hassan Raza", "user_picture": None, "course_id": "course_amazon_va", "rating": 5, "comment": "Working as an Amazon VA now, earning $800/month from home. This course covers everything you need to know. The final project really prepared me for real client work.", "created_at": datetime.now(timezone.utc).isoformat()},
    {"review_id": "review_6", "user_id": "seed_user_6", "user_name": "Sara Ahmed", "user_picture": None, "course_id": "course_ebay", "rating": 4, "comment": "Started selling on eBay after completing this course. Already made PKR 50,000 in my first month. The product sourcing strategies are golden!", "created_at": datetime.now(timezone.utc).isoformat()},
    {"review_id": "review_7", "user_id": "seed_user_7", "user_name": "Usman Sheikh", "user_picture": None, "course_id": "course_comp_apps", "rating": 5, "comment": "Perfect for absolute beginners. I went from knowing nothing about computers to being proficient in MS Office and Google Suite. Great foundation course!", "created_at": datetime.now(timezone.utc).isoformat()},
    {"review_id": "review_8", "user_id": "seed_user_8", "user_name": "Zainab Tariq", "user_picture": None, "course_id": "course_smm", "rating": 5, "comment": "The ads management module alone is worth the price. I'm now managing ads for 3 local businesses and earning a good income. Hussnain Academy is the best!", "created_at": datetime.now(timezone.utc).isoformat()},
]

async def seed():
    print("Seeding database...")

    # Clear existing data
    await db.courses.delete_many({})
    await db.diploma_tracks.delete_many({})
    await db.reviews.delete_many({})

    # Seed courses
    for course in COURSES:
        await db.courses.insert_one(course)
    print(f"Seeded {len(COURSES)} courses")

    # Seed diploma tracks
    for track in DIPLOMA_TRACKS:
        await db.diploma_tracks.insert_one(track)
    print(f"Seeded {len(DIPLOMA_TRACKS)} diploma tracks")

    # Seed reviews
    for review in REVIEWS:
        await db.reviews.insert_one(review)
    print(f"Seeded {len(REVIEWS)} reviews")

    print("Seeding complete!")

if __name__ == "__main__":
    asyncio.run(seed())
