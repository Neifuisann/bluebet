# Football Match Score Prediction

A web application that allows users to predict the scores of upcoming football matches and compete with others.

## Features

- User registration and authentication
- View upcoming football matches
- Make score predictions before matches begin
- View prediction history and results
- Scoring system based on prediction accuracy
- Responsive UI for desktop and mobile

## Technologies Used

- Next.js
- React
- TypeScript
- Tailwind CSS
- Prisma (SQLite database)
- NextAuth.js for authentication

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn

### Installation

1. Clone this repository
   ```
   git clone <repository-url>
   cd football-predictor
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Set up the database
   ```
   npx prisma migrate dev
   ```

4. Seed the database with sample teams and matches (after starting the server)
   - Register an account
   - Navigate to the Matches page
   - Click "Add Sample Matches" button

5. Start the development server
   ```
   npm run dev
   ```

6. Visit [http://localhost:3000](http://localhost:3000) in your browser

## Scoring System

- 3 points for predicting the exact score
- 2 points for predicting the correct result and goal difference
- 1 point for predicting the correct result (win/loss/draw)
- 0 points for incorrect predictions

## License

MIT
