# Static Data Files

This directory contains JSON files with static data for different pages of the Aurora Innovative Learning website.

## Structure

```
src/data/static/
├── homepage.json    # Homepage content (hero, features, stats, testimonials)
├── about.json       # About page content (mission, vision, team, values)
├── courses.json     # Courses page content (categories, featured courses, learning paths)
├── contact.json     # Contact page content (contact info, offices, departments)
├── index.js         # Export file for easy importing
└── README.md        # This documentation file
```

## Usage

### Import all data
```javascript
import staticData from '@/data/static';

// Access specific page data
const homepageData = staticData.homepage;
const aboutData = staticData.about;
```

### Import specific page data
```javascript
import { homepageData, aboutData, coursesData, contactData } from '@/data/static';
```

### Import individual files
```javascript
import homepageData from '@/data/static/homepage.json';
import aboutData from '@/data/static/about.json';
```

### Use helper functions
```javascript
import { getPageData, getHomepageData } from '@/data/static';

const homepage = getHomepageData();
const about = getPageData('about');
```

## Data Structure

### Homepage Data (`homepage.json`)
- `hero`: Hero section content
- `features`: Feature highlights
- `stats`: Platform statistics
- `testimonials`: Student testimonials

### About Data (`about.json`)
- `hero`: Page hero section
- `mission`: Company mission statement
- `vision`: Company vision statement
- `values`: Core company values
- `team`: Team member information
- `achievements`: Company achievements

### Courses Data (`courses.json`)
- `hero`: Page hero section
- `categories`: Course categories
- `featuredCourses`: Featured course listings
- `learningPaths`: Structured learning paths
- `benefits`: Course benefits

### Contact Data (`contact.json`)
- `hero`: Page hero section
- `contactInfo`: General contact information
- `offices`: Office locations
- `departments`: Department-specific contacts
- `socialMedia`: Social media links
- `faq`: Frequently asked questions

## Customization

To customize the content:

1. Edit the relevant JSON file
2. Maintain the existing structure to avoid breaking components
3. Update image paths in `/public/images/` directory
4. Test changes in development environment

## Best Practices

- Keep JSON files properly formatted
- Use descriptive IDs for list items
- Maintain consistent naming conventions
- Update image references when adding new images
- Test all changes before deploying

## Image Assets

Make sure to add corresponding images to the `/public/images/` directory:

- `/public/images/hero-bg.jpg`
- `/public/images/about-hero.jpg`
- `/public/images/courses-hero.jpg`
- `/public/images/contact-hero.jpg`
- `/public/images/testimonials/`
- `/public/images/team/`
- `/public/images/courses/`

## Notes

- All prices are in USD
- Ratings are on a 5-point scale
- Phone numbers use international format
- Email addresses should be valid and monitored
- Social media URLs should be updated with actual accounts