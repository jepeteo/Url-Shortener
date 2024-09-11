# URL Shortener

A modern, feature-rich URL shortening service built with Next.js, MongoDB, and Shadcn UI components.

## Features

- User authentication with NextAuth
- Create shortened URLs
- Dashboard to manage and view shortened URLs
- Analytics for each shortened URL
- Pagination for URL list
- Responsive design with Shadcn UI components
- Password reset functionality
- Rate limiting to prevent abuse

## Getting Started

### Prerequisites

- Node.js (version 18 or later)
- MongoDB database

### Installation

1. Clone the repository:

git clone https://github.com/jepeteo/url-shortener.git

2. Install dependencies:

cd url-shortener npm install

3. Set up environment variables:

Create a `.env.local` file in the root directory and add the following:

MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_SECRET=your_nextauth_secret
NEXT_PUBLIC_BASE_URL=http://localhost:3000

4. Run the development server:

npm run dev

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Usage

- Register or sign in to start creating shortened URLs
- Use the dashboard to manage your URLs and view analytics
- Share your shortened URLs with others

## Demo Account

To quickly test the features of our URL shortener:

1. Click on the "Try Demo Account" button on the sign-in page.
2. You'll be logged in with these credentials:
   - Email: demo@example.com
   - Password: demopassword

Note: The demo account has pre-populated data to showcase the application's features.

## API Routes

- `POST /api/shorten`: Create a new shortened URL
- `GET /api/urls`: Retrieve user's URLs (paginated)
- `DELETE /api/urls/[id]`: Delete a specific URL
- `GET /api/[shortCode]`: Redirect to the original URL

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
