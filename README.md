# SocialConnect

SocialConnect is a minimal social media web application built with Next.js, TypeScript, Tailwind CSS, shadcn/ui, and Supabase. Users can register, create profiles, publish posts with images, like and comment on posts, follow other users, and browse a personalized feed.

## Features

- Authentication with register, login, and logout
- User profiles with bio, avatar, website, location, and follower stats
- Post creation with text and single image upload
- Likes and comments with count tracking
- Personalized feed based on followed users
- Public profile pages with followers and following lists
- Supabase Storage support for avatars and post images

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- shadcn/ui
- Supabase Auth, Database, and Storage

## Project Structure

- `app/` - App Router pages, layouts, and API routes
- `components/` - Shared UI components
- `lib/` - Auth helpers, Supabase clients, validation, and utilities
- `public/` - Static assets

## Getting Started

Install dependencies:

```bash
npm install
```

Create a `.env.local` file and set these variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - start the development server
- `npm run build` - build the app for production
- `npm run start` - run the production build
- `npm run lint` - run ESLint

## Storage Buckets

The app expects Supabase Storage buckets for:

- `avatars`
- `post-images`

## Notes

- Avatar uploads and post image uploads are validated for JPEG and PNG only.
- Posts are limited to 280 characters.
- Profile responses include `posts_count`.
- The feed shows posts from the signed-in user and the users they follow.

## License

No license has been specified for this project.
