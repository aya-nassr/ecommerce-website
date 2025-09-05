# Hexashop E-commerce Website

A complete single-page e-commerce website built with HTML, CSS, and JavaScript that loads content dynamically from a JSON file.

## Features

### Core Functionality
- **Dynamic Content Loading**: All content is loaded from `info.json` file
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Search Functionality**: Real-time product search by name
- **Shopping Cart**: Full cart functionality with localStorage persistence
- **Product Sections**: Displays "Recommended" and "Popular Items" sections

### Shopping Cart Features
- Add products to cart with quantity management
- Increase/decrease item quantities
- Remove individual items
- Clear entire cart
- Persistent cart state across browser sessions
- Real-time total calculation
- Sidebar cart interface

### Visual Design
- Modern, clean design inspired by the Hexashop template
- Hexagonal logo design
- Category cards with overlay text
- Product cards with hover effects
- Smooth animations and transitions
- Professional color scheme

## File Structure

```
hexashop/
├── index.html          # Main HTML file
├── style.css           # CSS styling
├── script.js           # JavaScript functionality
├── info.json           # Website content data
└── README.md           # This documentation
```

## Technical Requirements Met

1. **Single-page application** with one HTML, one CSS, and one JavaScript file
2. **Dynamic content rendering** from JSON data structure
3. **Navigation bar** with logo, search, and cart functionality
4. **Hero section** with call-to-action button
5. **Product sections** with grid layout
6. **Shopping cart sidebar** with full functionality
7. **Footer** with social media links and dynamic copyright
8. **Responsive design** for all screen sizes
9. **localStorage integration** for cart persistence

## JSON Data Structure

The `info.json` file follows the provided schema with:
- `page_sections` array containing different section types
- Hero section with title, subtitle, and CTA button
- Product grids with product arrays
- Footer with social media links and copyright text

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES6+ JavaScript features
- CSS Grid and Flexbox layouts
- LocalStorage API

## Usage

1. Open `index.html` in a web browser
2. The website will automatically load content from `info.json`
3. Use the search bar to filter products
4. Click product action buttons to interact with items
5. Use the cart button to view and manage cart contents

## Customization

To customize the website:
1. Edit `info.json` to change content, products, and sections
2. Modify `style.css` for visual styling changes
3. Update `script.js` for functionality modifications

The website is designed to be easily maintainable and extensible while following modern web development best practices.

