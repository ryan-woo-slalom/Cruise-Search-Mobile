# Cruise Search Mobile Experience

## Summary
The cruise line, Intrepid Cruise Lines, is building a cruise search application that is designed primarily for a mobile experience, but should still work for all resolutions. It should have searching and filtering functionality that helps potential cruisers find vacations that match their travel style and budget. Being mainly a mobile experience, the search and filtering functionality is incredibly important when searching for cruises on-the-go with one hand. Users should also be able to save, compare, and shop for cruises.

## Data
Comprehensive fake dataset as a JSON file (src/data/metrics.json) with 77 cruise departures across 22+ different itineraries, spanning July 2027 through February 2028, including:
- Price per person based on double occupancy
- Total base price based on double occupancy
- Itinerary name and itinerary map (destinations)
- Ship name
- Cruise dates and night duration
- Stateroom pricing by type (interior, oceanview, balcony, suite)

## Layout (Vuetify)
- Responsive website
- Working interactive prototype

### Header
- Header on top with responsive design
    - Desktop: Orange ship logo icon in top left, blue "Intrepid" text, then "Cruises", "Destinations", and "Deals" in navbar with user profile menu in top right
        - "Cruises" links to the Cruise Search page (active)
        - "Destinations" is placeholder for future destinations screen
        - "Deals" is placeholder for future deals screen
    - Mobile: Hamburger menu in top left (no chevron arrows) with orange ship logo icon and blue "Intrepid" text in centre, user profile menu in top right
        - Navigation drawer contains nav links (no "Cruise Search" label)

### Body - Search, Filter and Sort
- Full-width Search section at the top of the page
  - Search input bar with magnifying glass icon for keyword search
  - Search button with magnifying glass icon and "Search" label to the right of input
  - Search does NOT apply live filtering; users must click the Search button to trigger results
  - Search queries across itinerary names, ship names, and destinations/itinerary map
- Staterooms control
    - Positioned to the right of the Search input bar in a card panel
    - "Staterooms" title with +/- buttons to add/remove staterooms (minimum 1, maximum 4)
    - Each stateroom displayed in an expandable accordion panel labeled "Stateroom 1", "Stateroom 2", etc, with a trash can icon to remove
    - Within each accordion panel:
      - Stateroom type selector (dropdown or pill buttons): Interior, Oceanview, Balcony, Suite
      - "Adults" control (Ages 18+) with -/+ buttons and current count displayed
      - "Children" control (Under 18) with -/+ buttons and current count displayed
      - Constraint: Maximum 4 guests per stateroom, minimum 1 adult per stateroom
      - Helper text: "Max 4 guests per stateroom and at least 1 adult."
    - Guest summary displayed below accordions: "X staterooms • Y Adults, Z Children"
    - This control's configuration syncs to the Quickview modal stateroom defaults (but changes in Quick View don't affect the Search page) 
- Filters on left rail (for desktop) and on a button (for mobile)
    - Chip-based filter UI with individual removable selections
    - Month and Ship selections render as blue closable chips inside the select input fields
    - Price and Cruise Nights show as single adjustable chips when range is modified from defaults
    - Each chip can be removed individually to update filters immediately
- "Pricing by" dropdown menu: Per Stateroom and Per Person
    - Pricing by Stateroom
        - Refreshes the card to show the price by stateroom
    - Pricing per Person
        - Refreshes the card to show the price per person
- "View by" dropdown menu: Itinerary and Cruise Date
    - Product cards by Itinerary
        - Number of Itinerary search results should reflect the number of itineraries only
        - Users should be able to dig into each Itinerary to see a quick view of the cruise along with cruise dates that fall under that Itinerary
    - Product cards by Cruise Date
        - Number of Cruise Date search results should reflect the number of cruise dates only
        - Users should be able to dig into each Cruise Date to see a quick view of the cruise along with stateroom pricing
- Sorting dropdown that lets users sort the search results
    - Sorting options:
        - Recommended - Sorts based on knowledge about the user (Saved cruises, Location, etc)
        - Highest Rated - Sorts by highest rated user-reviewed cruises
        - Price: Low to High - Sorts by lowest price first (also sorts the cruise dates lowest price first in the Itinerary View)
        - Price: High to Low - Sorts by highest price first
- Applied Filters Summary
  - Display a summary line showing all active filters and searches (search term, selected months, ships, price range, night range)
  - Shows "No filters applied" when no filters are active
  - Updated in real-time as filters/searches are applied
  - Individual removable blue chips for each active filter with close (X) button
  - "Clear filters" button positioned at the end of the filter chips row to reset all filters when there are filters selected

### Body - Search Results
- Have a section header separating the Search and Filter controls and the Search Results. This section header should keep a count of the search results.
- "ResultCard" reusable component
    - Displays itinerary name (or ship name for date view), cruise dates, ship name, and destinations
    - "Save" button (Heart icon) - blue filled heart when saved, outlined heart when unsaved
    - "Compare" button (Checkbox icon with "Compare" label)
    - User-reviewed 5-star rating display
    - "Quickview" button (secondary style) to show cruise details modal
    - "Book now" button (primary orange style) for booking flow
    - Destination image with fallback to default SVG if unavailable
    - Stacked accordion view of cruise dates within each itinerary card
- Quickview modal
    - Displays cruise itinerary, ship information, and highlighted destinations
    - Cruise date selector with pricing calculator for each date
    - Stateroom configuration panel (independent from Search page controls)
        - Add/remove staterooms with +/- buttons
        - Select stateroom type (interior, oceanview, balcony, suite)
        - Configure guest count per stateroom (adults/children)
        - Shows dynamic pricing per stateroom and per person
        - Changes to configuration do not affect Search page settings
    - "Estimated Total" price displayed prominently right-aligned
    - "Per Stateroom" and "Per Person" pricing shown as supporting text
    - "Save cruise" button to save this cruise configuration to Saved Cruises page
    - "Save" (Heart) button - filled when saved, outlined when not
    - "Compare" button to add cruise to comparison panel
    - "Close" button (secondary style) to dismiss modal
    - "Book now" button (primary orange style) for booking flow


### Body - Features
- Compare
    - Once a cruise card is selected to be compared, a "Compare" panel appear pinned at the bottom (maximum 4 selections)
    - Contains information about the cruise itinerary, cruise dates, prices, ship name, as well as the destinations visited, and ship highlights 
    - Should have an "Expand" button to expand and see the cruises selected to compare
    - Should have a "Collapse" button to collapse the panel back to its pinned view

### Booking Landing
- Booking Landing
    - Once the Book Now button is clicked, take user to a Booking Landing page which contains information about the cruise they selected
    - Contains the Staterooms and number of guests they selected
    - Contains the estimated base price as well as a breakdown of price per stateroom and price per person
    - Contains a "Back" button to return to Cruise Search
    - Contains a "Continue" button to continue into the Booking Flow
    - Users should still be able to configure and reconfigure the staterooms and guests that they selected on the Cruise Search page

### Booking Flow
- Booking Flow
    - Continuing from the Booking Landing page, users should be taken to a multi-step process where they select various aspects of their cruise
        - Cabin type: various incarnations of the selected staterooms (example: Interior with View, Balcony with Chairs, Luxury Stateroom)
        - Cruise add-ons
   
### Footer
- Footer on bottom
    - Dark grey footer with social media links and link tree

## Style
- Google font: Open Sans
- Brand Colors:
  - Primary (Orange): #E67E22 - Used for Call-to-Action buttons (Book now, Search) and primary chips
  - Secondary (Blue): #0b4f8a - Used for interactive elements, Filter buttons, and secondary chips
  - Text Colors: Dark grey for body text, white for light backgrounds
- Background: Light grey with a hint of blue
- Buttons:
  - Book now, Search: Primary (orange, filled/flat)
  - Close, Quickview, Filter: Secondary (blue)
  - Default states use icon+text or text only (no icon-only buttons)
- Card Design:
  - Ship name chip: Orange filled badge
  - Sailings/nights chip: Blue outlined with white background
  - Price display: Large, bold, dark grey text (no container)
- Logo: Orange ship icon with blue "Intrepid" text

## Tech
- Vue 3 + TypeScript + Vuetify3
- Chart.js via vue-chartjs for all charts
- Fake data from a local JSON (no API calls)

## Implementation Details

### Router Configuration
The application has been set up with Vue Router (v4) with the following routes:
- `/` (home) → HomeView.vue
- `/saved-cruises` (saved-cruises) → SavedCruisesView.vue
- `/booking-landing` (booking-landing) → BookingLandingView.vue
- `/booking-flow` (booking-flow) → BookingFlowView.vue

### Booking Flow Components

#### BookingLandingView.vue
- **Purpose**: Displays a summary of the cruise booking before users proceed to the multi-step booking process
- **Location**: src/views/BookingLandingView.vue
- **Features**:
  - Query parameter handling: cruiseId, stateroomTypes, adults, children, totalPrice, pricePerStateroom, pricePerPerson
  - Displays cruise details (name, dates, duration, ship)
  - **Editable Stateroom Configuration**:
    - Accordion interface for each stateroom (min 1, max 4)
    - Add/Remove stateroom buttons (+/- controls with 1-4 stateroom limit)
    - For each stateroom:
      - Type selector dropdown (Interior, Oceanview, Balcony, Suite)
      - Adults count with +/- buttons (min 1 per stateroom, max 4 total per stateroom)
      - Children count with +/- buttons (min 0, max based on room capacity)
      - Price display per stateroom type
    - Remove button per stateroom (disabled if only 1 stateroom remains)
  - Dynamic pricing recalculation as users modify selections:
    - Total cruise price across all staterooms
    - Price per stateroom (total price ÷ number of staterooms)
    - Price per person (total price ÷ total guests)
  - Pricing card with breakdown displayed on right side (sticky positioning)
  - Navigation: Back button (returns to home), Continue button (proceeds to booking flow with updated values)
  - Stateroom type label formatter for display (interior → "Interior", etc.)

#### BookingFlowView.vue
- **Purpose**: Multi-step booking process for cruise bookings
- **Location**: src/views/BookingFlowView.vue
- **Features**:
  - Vuetify Stepper component with 3 steps:
    - **Step 1: Cabin Type** - Selection of cabin type variants across 4 categories:
      - Interior: Standard, Premium, Spacious
      - Oceanview: Standard, Premium with Balcony
      - Balcony: Standard, Deluxe, Grand
      - Suite: Grand, Penthouse
      - Single selection per variant (radio group or select interface)
      - Optional pricing display per variant where available
    - **Step 2: Add-ons** - Checkboxes for optional services (Beverage Package, Speciality Dining, Internet, Shore Excursions)
    - **Step 3: Review & Confirm** - Summary display with final pricing including add-ons
  - Dynamic pricing: Add-on selections recalculate total cost in real-time
  - Query parameter parsing to restore user's cruise and pricing selection
  - Navigation: Previous/Next buttons to navigate between steps, Cancel button to exit
  - Complete Booking button on final step (returns to home upon completion)
  - Currency formatting with locale-aware number formatting

### ResultCard Component Updates
- Added `book` event emit to result card component
- Book Now button now emits the 'book' event with cruise data
- Allows direct navigation to booking landing with default configuration (1 interior stateroom, 2 adults)

### HomeView.vue Updates
- Imported useRouter from vue-router for navigation
- Added goToBookingLanding() function to navigate from Quick View modal
- Added bookCruiseFromCard() function to handle Book Now clicks from ResultCard
- Updated both ResultCard instances (itinerary and date views) with @book listener
- Quick View "Book Now" button calls goToBookingLanding() with full stateroom configuration
- Result card "Book Now" buttons navigate directly with default configuration (1 interior stateroom, 2 adults)