# Aurora Learning Platform

A modern, comprehensive online learning platform built with Next.js, featuring course management, user authentication, video streaming, and interactive dashboards.

## Features

- 🎓 **Course Management**: Browse, enroll, and track progress in courses
- 🔐 **User Authentication**: Secure login/signup with Appwrite
- 📹 **Video Player**: Integrated video lessons with progress tracking
- 📊 **Dashboard**: Comprehensive user dashboard with analytics
- 💳 **Payment Integration**: Course checkout and payment processing
- 📱 **Responsive Design**: Mobile-first, fully responsive interface
- 🔍 **Search & Filter**: Advanced course discovery features
- 👤 **User Profiles**: Customizable user profiles and settings

## Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS
- **Backend**: Appwrite (Database, Authentication, Storage)
- **Video Player**: React Player
- **UI Components**: Custom components with Heroicons
- **Notifications**: React Hot Toast
- **Styling**: Tailwind CSS with custom design system

## Prerequisites

- Node.js 18+ and npm
- Appwrite account (Cloud or self-hosted)
- Modern web browser

## Quick Start

### 1. Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd aurora-learning-platform/front-end

# Install dependencies
npm install
```

### 2. Environment Setup

1. Copy the environment template:
   ```bash
   cp .env.example .env.local
   ```

2. Update `.env.local` with your Appwrite credentials:
   ```env
   NEXT_PUBLIC_APPWRITE_PROJECT_ID="your_project_id_here"
   NEXT_PUBLIC_APPWRITE_ENDPOINT="https://fra.cloud.appwrite.io/v1"
   ```

### 3. Appwrite Backend Setup

**Important**: Before running the application, you must set up your Appwrite backend.

📖 **Follow the detailed setup guide**: [APPWRITE_SETUP.md](./APPWRITE_SETUP.md)

This guide covers:
- Creating an Appwrite project
- Setting up databases and collections
- Configuring authentication
- Setting permissions
- Troubleshooting common issues

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── about/             # About page
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── contact/           # Contact page
│   ├── courses/           # Course-related pages
│   ├── dashboard/         # User dashboard
│   └── profile/           # User profile
├── components/            # Reusable components
│   ├── features/          # Feature-specific components
│   ├── icons/             # Custom icons
│   └── shared/            # Shared UI components
├── contexts/              # React contexts
│   ├── AuthContext.js     # Authentication state
│   ├── CourseContext.js   # Course management
│   └── VideoContext.js    # Video player state
└── lib/                   # Utilities and configurations
    └── appwrite.js        # Appwrite client setup
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Key Features Guide

### Authentication
- Sign up/Login with email and password
- Protected routes and user sessions
- Profile management

### Course Management
- Browse courses by category and level
- Search and filter functionality
- Course enrollment and progress tracking
- Video lessons with playback controls

### Dashboard
- Personal learning analytics
- Course progress overview
- Recent activity tracking
- Quick access to enrolled courses

### Responsive Design
- Mobile-first approach
- Tablet and desktop optimized
- Touch-friendly interface

## Environment Variables

Required environment variables in `.env.local`:

```env
# Appwrite Configuration
NEXT_PUBLIC_APPWRITE_ENDPOINT="https://fra.cloud.appwrite.io/v1"
NEXT_PUBLIC_APPWRITE_PROJECT_ID="your_project_id"

# Database IDs
NEXT_PUBLIC_APPWRITE_DATABASE_MAIN_ID=aurora_main

# Collection IDs
NEXT_PUBLIC_APPWRITE_COLLECTION_USERS_ID=users
NEXT_PUBLIC_APPWRITE_COLLECTION_COURSES_ID=courses
NEXT_PUBLIC_APPWRITE_COLLECTION_LESSONS_ID=lessons
NEXT_PUBLIC_APPWRITE_COLLECTION_ENROLLMENTS_ID=enrollments

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Aurora Innovative Learning
```

## Troubleshooting

### Common Issues

1. **Appwrite Connection Errors**
   - Verify Project ID in `.env.local`
   - Check Appwrite Console for correct endpoint
   - Ensure platform is configured for localhost:3000

2. **Module Not Found Errors**
   - Run `npm install` to install dependencies
   - Clear `.next` cache: `rm -rf .next`

3. **Environment Variables Not Loading**
   - Restart development server after changing `.env.local`
   - Ensure file is in project root

### Getting Help

- Check the [Appwrite Setup Guide](./APPWRITE_SETUP.md)
- Review browser console for error messages
- Ensure all dependencies are installed

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Check the documentation
- Review the setup guides
- Open an issue for bugs or feature requests
