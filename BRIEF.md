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
- Header on top
    - Desktop: "Intrepid" logo in top left, then "Cruises", "Destinations", and "Deals" in navbar with user profile menu in top right
    - Mobile: Hamburger menu in top left with "Intrepid" logo in centre, with user profile menu in top right. Navbar should be in the hamburger menu.
- Footer on bottom
    - Dark grey footer with social media links and link tree
- Search inputs on the top, filters on left rail (for desktop) and on a button (for mobile)
- "View by" button group: Itinerary and Cruise Date
- Product cards by Itinerary
    - Users should be able to dig into each Itinerary to see a quick view of the cruise along with cruise dates that fall under that Itinerary
- Product cards by Cruise Date
    - Users should be able to dig into each Cruise Date to see a quick view of the cruise along with stateroom pricing
- Cards should represent the products and contain the Itinerary name, cruise dates, ship name, the itinerary map, along with a "Save" button to favorite and a "Compare" button to compare cruises
    - Cruise cards should have a "Quick view" button to give an overview of the cruise
    - Cruise cards should have a "Book now" button that takes users into the booking flow
- Pricing functionality should also have a "guest calculator" where a stateroom would have a maximum of 4 guests 

## Style
- Google font: Open Sans
- Use blues and whites as brand colours

## Tech
- Vue 3 + TypeScript + Vuetify3
- Chart.js via vue-chartjs for all charts
- Fake data from a local JSON (no API calls)