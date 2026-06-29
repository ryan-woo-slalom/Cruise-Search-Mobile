# Cruise Card Image Sources

Cruise cards now load local images from `public/images` for reliable rendering.

## Source Platform
- Pexels: https://www.pexels.com
- Pexels License: https://www.pexels.com/license/

## Local Files and Original Sources
- `public/images/mediterranean.jpg`
  - https://images.pexels.com/photos/3278215/pexels-photo-3278215.jpeg
- `public/images/caribbean.jpg`
  - https://images.pexels.com/photos/1007836/pexels-photo-1007836.jpeg
- `public/images/alaska.jpg`
  - https://images.pexels.com/photos/813011/pexels-photo-813011.jpeg
- `public/images/nordic.jpg`
  - https://images.pexels.com/photos/1268855/pexels-photo-1268855.jpeg
- `public/images/pacific.jpg`
  - https://images.pexels.com/photos/346529/pexels-photo-346529.jpeg
- `public/images/transatlantic.jpg`
  - https://images.pexels.com/photos/1371360/pexels-photo-1371360.jpeg
- `public/images/default.jpg`
  - https://images.pexels.com/photos/3278216/pexels-photo-3278216.jpeg

## Notes
- App mapping now points to local paths under `/images/*.jpg`.
- This avoids outages from third-party image endpoints and works offline once the app is built.
