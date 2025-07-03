# Excel Pro AI Backend

This is the backend server for the Excel Pro AI application.

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Create a `.env` file in the root directory with the following variables:
   ```
   MONGODB_URI=mongodb://localhost:27017/excel_ai_app
   JWT_SECRET=your_jwt_secret_key_change_in_production
   PORT=5000
   ```

3. Start the server:
   ```
   npm run dev
   ```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user
- `GET /api/auth/me` - Get current user (requires authentication)
- `PUT /api/auth/profile` - Update user profile (requires authentication)
- `PUT /api/auth/change-password` - Change password (requires authentication)

### Spreadsheets

- `GET /api/excel` - Get all spreadsheets for a user (requires authentication)
- `GET /api/excel/:id` - Get a specific spreadsheet (requires authentication)
- `POST /api/excel` - Create a new spreadsheet (requires authentication)
- `PUT /api/excel/:id` - Update a spreadsheet (requires authentication)
- `DELETE /api/excel/:id` - Delete a spreadsheet (requires authentication)
- `PUT /api/excel/:id/share` - Share a spreadsheet (requires authentication)
- `GET /api/excel/public/:id` - Get a public spreadsheet

### Referrals

- `POST /api/referral/generate` - Generate a referral code (requires authentication)
- `GET /api/referral/my-referrals` - Get user's referral codes (requires authentication)
- `POST /api/referral/validate` - Validate a referral code
- `POST /api/referral/apply` - Apply a referral code (requires authentication)