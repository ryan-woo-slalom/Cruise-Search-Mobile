# Cruise Search Mobile Experience

## Summary
The cruise line, Intrepid Cruise Lines, is building a cruise search application that is designed primarily for a mobile experience, but should still work for all resolutions. It should have searching and filtering functionality that helps potential cruisers find vacations that match their travel style and budget. Being mainly a mobile experience, the search and filtering functionality is incredibly important when searching for cruises on-the-go with one hand. Users should also be able to save, compare, and shop for cruises.

## Data
Generate a fake dataset as a JSON file (src/data/metrics) with cruise data from July to December 2027, including but not limited to:
- Price per person based on double occupancy
- Total base price based on double occupancy
- Itinerary name
- Itinerary map
- Ship name
- Cruise Dates

## Layout (Vuetify)
- Responsive website
- Working interactive prototype

### Header
- Header on top
    - Desktop: "Intrepid" logo in top left, then "Cruises", "Destinations", and "Deals" in navbar with user profile menu in top right
    - Mobile: Hamburger menu in top left with "Intrepid" logo in centre, with user profile menu in top right. Navbar should be in the hamburger menu.

### Body - Search, Filter and Sort
- Long full-width Search input bar at the top of the page that allows users to do a keyword search. It should not be in the Filters.
- Next to the Search input bar should be a Staterooms control where users can choose the number of staterooms for their cruise, and then also the number of guests per stateroom. Each stateroom should have an "Adults" and "Children" control. Maximum number of guests should be 4. With at least one Child, there must be at least one Adult. This "Guests" control changes the price per person calculation.
- Filters on left rail (for desktop) and on a button (for mobile)
- "Pricing by" button group: Per Stateroom and Per Person 
- "View by" button group: Itinerary and Cruise Date
    - Product cards by Itinerary
        - Users should be able to dig into each Itinerary to see a quick view of the cruise along with cruise dates that fall under that Itinerary
    - Product cards by Cruise Date
        - Users should be able to dig into each Cruise Date to see a quick view of the cruise along with stateroom pricing

### Body - Search Results
- Have a section header separating the Search and Filter controls and the Search Results. This section header should keep a count of the search results.
- "ResultCard" reusable component
    - should represent the products and contain the Itinerary name, cruise dates, ship name, the itinerary map, along with a "Save" button to favorite and a "Compare" button to compare cruises
    - Cruise cards should have a "Quick view" button to give an overview of the cruise
    - Cruise cards should have a "Book now" button that takes users into the booking flow
    - Cruise cards should have an image of the highlight destination in the itinerary
- Quickview
    - Should contain the cruise itinerary
    - Should include information and highlights about the ship
    - Should include highlighted destinations
    - Should include a date selector
    - Should include a pricing calculator based off the global "Guests" control as reference

### Footer
- Footer on bottom
    - Dark grey footer with social media links and link tree

## Style
- Google font: Open Sans
- Use blues and whites as brand colours

## Tech
- Vue 3 + TypeScript + Vuetify3
- Chart.js via vue-chartjs for all charts
- Fake data from a local JSON (no API calls)