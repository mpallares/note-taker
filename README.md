# NoteTaker

A modern, full-stack note-taking application built with Next.js 15, featuring secure authentication and a beautiful UI.

## Features

- **User Authentication**
  - Email/Password registration and login
  - Secure password hashing with bcrypt
  - Session management with NextAuth v5
  - Protected routes with middleware

- **Note Management**
  - Create, read, update, and delete notes
  - Rich text editing interface
  - Real-time updates
  - User-specific note storage

- **Modern UI/UX**
  - Responsive design with Tailwind CSS v4
  - Glassmorphism effects and gradient backgrounds
  - Split-screen authentication pages
  - Clean, intuitive note editor

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React, TypeScript
- **Styling**: Tailwind CSS v4
- **Authentication**: NextAuth v5
- **Database**: PostgreSQL (Neon)
- **ORM**: Prisma
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- PostgreSQL database (we recommend [Neon](https://neon.tech) for serverless PostgreSQL)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/mpallares/note-taker.git
cd note-taker
```

2. Install dependencies:
```bash
npm install
# or
bun install
```

3. Set up environment variables:

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="your-postgresql-connection-string"

# NextAuth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

To generate a secure `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

4. Set up the database:
```bash
npx prisma db push
npx prisma generate
```

5. Run the development server:
```bash
npm run dev
# or
bun dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

The application uses two main models:

- **User**: Stores user authentication data (email, hashed password, name)
- **Note**: Stores user notes with title, content, and user relationship

## Project Structure

```
note-taker/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/  # NextAuth API routes
│   │   ├── register/            # User registration endpoint
│   │   └── notes/               # Notes CRUD endpoints
│   ├── login/                   # Login page
│   ├── register/                # Registration page
│   ├── notes/                   # Main notes interface
│   └── layout.tsx               # Root layout with providers
├── lib/
│   └── prisma.ts                # Prisma client singleton
├── types/
│   └── next-auth.d.ts           # NextAuth type extensions
├── prisma/
│   └── schema.prisma            # Database schema
├── auth.ts                      # NextAuth configuration
└── middleware.ts                # Route protection
```

## API Routes

- `POST /api/register` - Create new user account
- `POST /api/auth/signin` - Sign in with credentials
- `GET /api/notes` - Get all notes for authenticated user
- `POST /api/notes` - Create a new note
- `GET /api/notes/[id]` - Get specific note
- `PATCH /api/notes/[id]` - Update note
- `DELETE /api/notes/[id]` - Delete note

## Security Features

- Password hashing with bcrypt
- JWT-based session management
- Protected API routes (user can only access their own notes)
- Route middleware to protect authenticated pages
- CSRF protection via NextAuth

## Deployment

### Deploy to Vercel

1. Push your code to GitHub

2. Import your repository in [Vercel](https://vercel.com)

3. Add environment variables in Vercel:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` (your production URL)

4. Deploy!

The database will be automatically set up via Prisma during the build process.

## Development

### Run Prisma Studio

To view and edit your database:
```bash
npx prisma studio
```

### Database Migrations

After changing the schema:
```bash
npx prisma db push
npx prisma generate
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
