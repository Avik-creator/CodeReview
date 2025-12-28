# CodeReviewer

![OG_IMAGE](https://codereviewer.avikmukherjee.me/og-image.webp)

Having trouble getting your PR reviewed? Worry not! **CodeReviewer** is here to save the day. An intelligent code review platform powered by AI that provides comprehensive feedback on pull requests.

## 🎯 Features

- **AI-Powered Code Reviews** - Get instant, intelligent feedback on your pull requests
- **GitHub Integration** - Seamlessly connect with your GitHub repositories
- **Real-time Analysis** - Analyze code quality, security issues, and best practices
- **Dashboard** - Manage and track all your code reviews in one place
- **Repository Management** - Monitor multiple repositories
- **Settings** - Customize your CodeReviewer experience
- **Dark/Light Theme** - Choose your preferred theme

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org) - React framework with App Router
- **Language**: TypeScript
- **Database**: PostgreSQL with [Prisma ORM](https://www.prisma.io)
- **Authentication**: Better Auth
- **UI Components**: Radix UI
- **Styling**: Tailwind CSS
- **AI Integration**: AI SDK (Google)
- **Vector Search**: Pinecone
- **Rate Limiting**: Upstash Redis
- **Workflow**: Inngest
- **State Management**: TanStack React Query

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- bun (or npm/yarn/pnpm)
- PostgreSQL database
- GitHub OAuth App credentials

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd codereviewer
```

2. Install dependencies:

```bash
bun install
# or
npm install
```

3. Set up environment variables:
   Create a `.env.local` file in the root directory with the following variables:

```env
# Database
DATABASE_URL=your_postgresql_connection_string

# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# AI/LLM
GOOGLE_API_KEY=your_google_api_key

# Pinecone Vector Database
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_ENVIRONMENT=your_pinecone_environment

# Upstash Redis
UPSTASH_REDIS_REST_URL=your_upstash_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_token

# Other Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. Set up the database:

```bash
bun prisma migrate dev
# or
npm run postinstall
```

5. Run the development server:

```bash
bun dev
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## 📁 Project Structure

```
codereviewer/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Main dashboard
│   ├── privacy/           # Privacy policy
│   └── terms/             # Terms of service
├── components/            # React components
│   ├── ai-elements/       # AI-related UI components
│   ├── auth/              # Authentication components
│   ├── dashboard/         # Dashboard components
│   ├── ui/                # Base UI components (Radix UI)
│   └── providers/         # React providers
├── hooks/                 # Custom React hooks
├── inngest/              # Workflow definitions
├── lib/                  # Utility functions and libraries
├── prisma/               # Database schema and migrations
└── public/               # Static assets
```

## 🖼️ Open Graph (OG) Image

The application includes Open Graph metadata for better social media sharing. The OG image is configured in [app/layout.tsx](app/layout.tsx):

```typescript
openGraph: {
  title: "CodeReviewer",
  description: "Having Trouble Getting your PR reviewed, worry not! CodeReviewer is here to save the day.",
  url: "https://codereviewer.avikmukherjee.me",
  siteName: "Avik Mukherjee's Portfolio",
  images: [
    {
      url: "/og-image.webp",
      width: 1200,
      height: 630,
      alt: "CodeReviewer",
    },
  ],
  locale: "en_US",
  type: "website",
}
```

### Setting up Your OG Image

1. **Prepare the image**: Place your OG image in the `public/` directory
2. **Recommended specifications**:

   - Format: `.webp`, `.png`, or `.jpg`
   - Dimensions: 1200x630px (or any 1.91:1 aspect ratio)
   - File size: < 500KB for optimal performance

3. **Update the metadata**: The OG image path in [app/layout.tsx](app/layout.tsx) should match your image location:

   ```typescript
   url: "/og-image.webp",
   ```

4. **Twitter Card**: The same image is used for Twitter sharing with `summary_large_image` card type.

When you share a link to CodeReviewer on social media, it will display the configured OG image with the title and description.

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Radix UI](https://www.radix-ui.com)
- [Tailwind CSS](https://tailwindcss.com)
- [Better Auth Documentation](https://betterauth.dev)
- [AI SDK](https://sdk.vercel.ai)

## 🚀 Building for Production

```bash
bun run build
bun start
# or
npm run build
npm start
```

## 📦 Deployment

The application is optimized for deployment on [Vercel](https://vercel.com) and can be deployed with:

```bash
vercel deploy
```

## 📝 License

This project is private and proprietary.

## 👤 Author

Created by [Avik Mukherjee](https://avikmukherjee.me)

---

For support and inquiries, please visit the main portfolio website or contact through GitHub.
