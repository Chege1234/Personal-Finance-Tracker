# Personal Finance Tracking Module Requirements Document

## 1. Application Overview

### 1.1 Application Name
Personal Finance Tracker

### 1.2 Application Description
A personal finance tracking module focused on daily spending discipline with rolling daily allowance logic. The system enforces monthly budgets through daily spending limits, carryover mechanics, and comprehensive analytics. Each user has their own account with personalized data access.

## 2. Core Functionality

### 2.1 User Authentication
- **Account Creation:**
  - When a user opens the link for the first time, they are prompted to create an account
  - User provides email address and creates a password
  - Account credentials are securely stored
- **Login:**
  - Returning users are prompted to login with their email and password
  - Standard login page functionality
  - Each user can only access their own data
- **First-time Setup:**
  - After successful first login, user is prompted to enter their monthly budget
  - App then works normally as described below

### 2.2 Progressive Web App Installation
- When user opens the app from a web browser (on phone or computer), they are prompted with an option to install the app
- Installation prompt appears for both mobile and desktop browsers
- User can choose to install or continue using in browser
- Once installed, app functions as a standalone application

### 2.3 Monthly Budget Setup
- User sets monthly budget amount
- Currency selection: USD, KSH, Turkish Lira
- System automatically detects current month and year
- System calculates:
  - Number of days in current month (28/29/30/31)
  - Base daily budget = monthly budget ÷ number of days in month
- Calculation auto-adjusts every new month
- **Budget modification:**
  - User can change the budget at any time during the month through a settings or edit option
  - When budget is changed mid-month, system recalculates daily budget based on remaining days
  - Carryover balance is preserved and continues to roll forward
  - All historical spending data is retained
- **Mid-month budget entry handling:**
  - If user enters budget after the 1st of the month, system divides monthly budget by total days in month to get daily budget
  - Carryover is set to 0 (assumes no spending from 1st until current date)
  - Available balance for current day = base daily budget
  - From next day onwards, carryover logic applies normally based on actual spending
- User is prompted to enter budget only on the 1st of each month
- During the month, opening the app shows details normally without budget prompt
- **Data reset:** When user is prompted to re-enter budget at the start of a new month, all previous spending data is cleared

### 2.4 Daily Spending Input
- User inputs amount spent each day
- User inputs description of what the amount was spent on
- Multiple spending entries per day are added together (not replaced)
- Each spending entry is saved with:
  - Date
  - Amount spent
  - Description of purchase
- Real-time adjustment: After entering spending, the available balance for that day immediately updates
  - Example: If available is 200 and user spends 20, available instantly shows 180
  - If user spends 200 when available is 200, available instantly shows 0
- Data persists and is viewable historically

### 2.5 Rolling Daily Allowance Logic
- System maintains rolling balance (not fixed daily reset)
- Rules:
  - Start of month: Carryover = 0, Today's allowed spend = base daily budget
  - If user spends less than daily budget: Unused amount becomes carryover and rolls forward to next day
  - If user spends more than daily budget: Overspent amount is deducted from carryover; if no carryover exists, next day's allowance is reduced

### 2.6 Daily Display
- **Date display at top:**
  - Show current day of week and year at the top of the page
  - Format: Saturday, 2026 (or Monday, 2026, etc.)
- Each day clearly shows:
  - Today's base budget (e.g., 200 TL)
  - Carryover from previous days (positive or negative)
  - Total available to spend today
  - Real-time remaining balance after spending entries
- Display examples:
  - Positive carryover: Today's budget: 200 TL / Extra available: +100 TL / Total available today: 300 TL
  - Negative carryover: Today's budget: 200 TL / Overspend from yesterday: −100 TL / Total available today: 100 TL

### 2.7 History & Analytics

#### 2.7.1 Transaction Categorization
- **Semantic categorization system (no hardcoded item lists):**
  - Normalize every transaction description (lowercase, trim, remove symbols)
  - Generate a semantic embedding for each transaction
  - Compare it against existing user categories using vector similarity
  - If similarity ≥ threshold (e.g. 0.80), assign the transaction to that existing category
  - If no category matches:
    - Create a new category using the normalized name
    - Persist it permanently (no duplicates)
  - Categories must merge automatically over time based on semantic similarity
  - Do NOT rely on keyword lists or hardcoded food/transport definitions
- **Category persistence:**
  - Each category must persist:
    - id
    - name
    - normalized_name
    - embedding
    - color
    - user_id
- **User control:**
  - Allow users to manually change a category
  - Provide a remember this category for future transactions option

#### 2.7.2 Category Color Assignment
- Assign a color once when a category is created
- Persist the color in the database
- Reuse the same color forever for that category
- NEVER assign colors at render time
- Use a fixed rotating palette:
  - #5B6CFF (blue-violet)
  - #19C37D (green)
  - #F59E0B (amber)
  - #EF4444 (red)
  - #8B5CF6 (purple)
  - #06B6D4 (cyan)
  - #10B981 (teal)
  - #EC4899 (pink)
- If categories exceed palette length, cycle deterministically (hash category id → index)

#### 2.7.3 Analytics Page Layout & Flow
- **Page order:**
  1. Spending overview summary (total spent, largest category, average daily spend)
  2. Spending by category pie chart
  3. Budget vs Actual weekly comparison graph
  4. Transaction history grouped by day

#### 2.7.4 Spending Overview Summary
- Display key metrics:
  - Total spent for selected period
  - Largest spending category
  - Average daily spend
  - Remaining budget for the month

#### 2.7.5 Spending by Category Pie Chart
- **Chart type:** DONUT chart styled exactly like premium finance apps
- **Layout rules:**
  - Donut chart on the LEFT
  - Category legend on the RIGHT
  - Legend rows show:
    - Colored dot
    - Category name
    - Amount aligned to the far right
    - No percentages displayed
  - Clean spacing and alignment
- **Chart geometry:**
  - Donut thickness: medium (not thin, not bulky)
  - Inner radius large enough for breathing space
  - Rounded slice edges
  - Small white/transparent gaps between slices
  - No stroke outlines
  - No shadows
  - No labels on the chart itself
- **Color behavior:**
  - Each slice uses the category's persisted color
  - No gradients
  - No repeated colors
  - No single-color charts unless there is truly only one category
- **Typography & UI polish:**
  - Section title: BY CATEGORY (uppercase, subtle, muted gray)
  - Category text: medium weight
  - Amount text: darker, slightly bolder for contrast
  - Background: clean card on light surface OR dark card on dark mode
  - Rounded container corners
  - Plenty of padding — nothing cramped
- **Quality checks before rendering:**
  - Ensure categories are merged semantically (no fragmentation)
  - Ensure each category has a unique persisted color
  - Ensure legend order matches chart order
  - Ensure chart looks balanced even with many categories
- Show category distribution for the selected month
- Maximum 6–7 visible categories; group the rest as Other
- Sorted largest to smallest
- Display amount on hover or tap
- Tapping a category filters the transaction list

#### 2.7.6 Budget vs Actual Weekly Comparison Graph
- **Graph type:** Bar chart or line chart showing weekly budget vs actual spending
- **Calculation logic:**
  - Weekly budget = monthly budget ÷ 4
  - Display 4 weeks per month
  - Each week shows:
    - Budgeted amount (weekly budget)
    - Actual spending for that week
- **Visual requirements:**
  - Two bars/lines per week: one for budget, one for actual
  - Use accent color for budget line/bar
  - Use contrasting color for actual spending
  - Clearly label weeks (Week 1, Week 2, Week 3, Week 4)
  - Show values on hover or tap
- **Placement:** Display below the spending by category pie chart
- **Styling consistency:**
  - Follow same dark mode and light mode color rules as other charts
  - Use card-based layout with proper spacing
  - Include section title similar to other analytics sections

#### 2.7.7 Additional Analytics Graphs
- Line chart for spending over time
- Optional bar chart for category comparison
- No more than two charts per screen
- Each chart must include a short explanatory label
- **Chart styling in dark mode:**
  - Chart backgrounds should match card surfaces
  - Gridlines must be very subtle
  - Highlight key data points with the accent color only
  - Avoid rainbow color schemes

#### 2.7.8 Transaction History
- Display spending history separated by date
- Each date shows all spending entries for that specific day
- Show transaction description and category
- Allow filtering by month and category
- Always show how transactions are categorized and allow edits

#### 2.7.9 User Control & Trust
- Allow filtering by month and category
- Always show how transactions are categorized and allow edits

#### 2.7.10 Optional Premium Enhancements
- Detect money leaks (frequent small expenses, subscriptions)
- Highlight behavioral spending patterns
- Provide a simple monthly spending discipline or confidence score

### 2.8 Month Transitions
- At start of new month:
  - User prompted to enter new monthly budget (can reuse previous or update)
  - Carryover resets to zero
  - Daily budget recalculates based on new month length
  - All calculations start fresh

## 3. Design Requirements

### 3.1 Design Goals
- The app should feel clean, modern, and confident, not playful or cluttered
- Visual hierarchy must prioritize clarity over decoration
- The interface should reduce cognitive load and make financial information instantly understandable
- The final UI should feel like a production-ready finance product, not a prototype
- The design should inspire trust, discipline, and confidence in managing money
- Analytics should feel calm, intelligent, and intentional

### 3.2 Color System

#### 3.2.1 Light Mode
- Use a strict, minimal palette:
  - Primary: deep navy / dark slate for headers and structure
  - Accent: emerald or teal for positive values, progress, and primary actions
  - Neutrals: soft light gray background, white cards
  - Red only for overspending or errors, amber for warnings
- Avoid bright, neon, or excessive colors

#### 3.2.2 Dark Mode (Premium Finance-Grade)
- **Background and surfaces (strict):**
  - Background (main): #0B1220 (deep blue-black, not pure black)
  - Surface / Cards: #111827 (slightly lighter than background)
  - Elevated surfaces: #1F2937
- **Typography:**
  - Primary text: #E5E7EB (soft white, easy on the eyes)
  - Secondary text: #9CA3AF (muted gray)
  - Disabled text / hints: #6B7280
- **Accent & status colors:**
  - Primary accent (actions, highlights): #10B981 (emerald / growth)
  - Positive / under budget: #22C55E
  - Warning: #F59E0B
  - Negative / overspend: #EF4444
  - Info / neutral: #38BDF8
- **Usage rules:**
  - Never use pure black (#000000) or pure white (#FFFFFF) in dark mode
  - Accent colors must be used sparingly and intentionally
  - Red is reserved only for overspending or errors
  - Avoid saturated or neon tones
- **Typography & contrast:**
  - Use slightly lower contrast than light mode to reduce eye strain
  - Numbers remain more prominent than labels
  - Muted labels should never compete with primary values
- **Cards & layout:**
  - All content should sit on card or surface layers, never directly on the background
  - Cards use subtle elevation and soft shadows or borders for separation
  - Rounded corners consistent with light mode
- **Charts & analytics in dark mode:**
  - Dark background: #0E1117
  - Chart labels: #E6EDF3
  - Chart backgrounds should match card surfaces
  - Gridlines must be very subtle
  - Highlight key data points with the accent color only
  - Avoid rainbow color schemes
  - Legend text must always be visible and readable
  - No washed-out or repeated colors
- **Interactions & polish:**
  - Smooth transitions when switching between light and dark mode
  - Hover and active states should slightly increase brightness, not saturation
- **Expected result:**
  - Dark mode should feel professional, calm, and premium
  - The UI should resemble high-quality finance or productivity software, not a gaming dashboard

### 3.3 Layout & Format
- Use a card-based layout with clear separation between sections
- Each major data point (monthly budget, remaining balance, daily allowance, recent spending) must be displayed in its own card
- Cards should have rounded corners, subtle shadows, and generous padding
- Avoid flat, edge-to-edge content without structure
- Clean, card-based layout with strong spacing and hierarchy

### 3.4 Information Hierarchy
- Above the fold show only:
  - Current month and year
  - Remaining budget (largest and most prominent number)
  - Daily spending allowance
- Remaining budget should be visually dominant and emotionally anchoring

### 3.5 Typography
- Use a modern, readable font such as Inter or a similar system font
- Numbers should be large and bold; labels should be smaller and muted
- Do not use uniform font sizes across the app

### 3.6 Spacing & Alignment
- Use consistent spacing (8px / 16px / 24px / 32px increments)
- Add generous white space to improve readability and perceived quality
- Align content cleanly; avoid cramped or dense layouts

### 3.7 Buttons & Interactions
- Only one primary action per screen (e.g., Set Budget or Update Budget)
- Primary buttons use the accent color and are visually prominent
- Secondary actions should be subdued (outline or text buttons)

### 3.8 UX Polish
- Include a progress indicator showing budget usage
- Use green for healthy spending, red for overspending
- Add subtle animations for number changes and progress updates
- Provide friendly, calm empty states instead of blank screens
- Standard login page design with account creation flow
- Simple and numeric interface
- No financial advice or motivational text
- Focus on discipline tool functionality
- Clear, unambiguous number displays
- Data persistence and historical access
- Consistent category icons
- Subtle animations for chart transitions and number updates
- Helpful empty states when data is insufficient