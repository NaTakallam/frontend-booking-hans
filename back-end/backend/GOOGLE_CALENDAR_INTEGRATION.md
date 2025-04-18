# Google Calendar Integration Guide

This document explains how the Google Calendar integration works in this project, from authentication to creating calendar events.

## 1. OAuth 2.0 Authentication Flow

The system uses Google's OAuth 2.0 protocol to authenticate and authorize your application to access Google Calendar on behalf of a user:

### Step 1: Authorization Request
- When a user visits `/api/google-auth/`, the `google_auth` view function is called
- This function uses `get_authorization_url()` from `oauth_flow.py` to:
  - Create a Flow object with your client credentials
  - Generate an authorization URL with the requested scopes
  - Return this URL to the user

### Step 2: User Authorization
- The user is redirected to Google's authorization page
- They sign in with their Google account
- They grant permission for your app to access their calendar

### Step 3: Token Exchange
- Google redirects back to your callback URL (`/oauth2callback/`) with an authorization code
- The `oauth2callback` view function calls `get_tokens_from_code()` to:
  - Exchange the code for access and refresh tokens
  - Create a token data dictionary with all necessary information
  - Save this data to `credentials.json` for future use

## 2. Calendar Event Creation

Once authenticated, the system can create calendar events:

### Step 1: API Request
- A client sends a POST request to `/api/events/` with event details:
  ```json
  {
      "participants": ["user@example.com"],
      "start_time": "2024-04-17T10:00:00Z",
      "end_time": "2024-04-17T11:00:00Z",
      "time_zone": "UTC"
  }
  ```

### Step 2: Data Validation
- The `EventViewSet.create()` method validates the request data
- It checks that end time is after start time
- It uses the `EventSerializer` to convert the data to a model instance

### Step 3: Google Calendar Integration
- The system calls `create_calendar_event()` from `google_calendar.py` to:
  - Get a calendar service using the stored credentials
  - Create an event object with the provided details
  - Insert the event into the user's Google Calendar
  - Return the Google Calendar event ID

### Step 4: Database Storage
- The event is saved to your local database with the Google Calendar event ID
- This allows you to track which events in your database correspond to which Google Calendar events

### Step 5: Email Notifications
- The system sends confirmation emails to all participants
- This is handled by the `send_event_confirmation_email()` function

## 3. Token Refresh Mechanism

The system handles token expiration automatically:

- When `get_calendar_service()` is called, it checks if the token is expired
- If expired, it uses the refresh token to get a new access token
- The new token information is saved to `credentials.json`
- This ensures continuous access to the Google Calendar API

## 4. Key Components

### OAuth Flow (`oauth_flow.py`)
- Handles the OAuth 2.0 authentication process
- Generates authorization URLs
- Exchanges authorization codes for tokens
- Saves token information for future use

### Google Calendar Integration (`google_calendar.py`)
- Creates a calendar service using the stored credentials
- Handles token refresh when needed
- Creates calendar events with the provided details

### Event Management (`views.py`, `models.py`, `serializers.py`)
- Handles API requests for event creation
- Validates event data
- Stores events in the database
- Sends confirmation emails to participants

### URL Configuration (`urls.py`)
- Maps URLs to view functions
- Ensures the OAuth callback URL is accessible

## 5. Security Considerations

- The system stores sensitive credentials in `credentials.json`
- In a production environment, you should:
  - Use environment variables for sensitive information
  - Implement proper user authentication
  - Use HTTPS for all communications
  - Regularly rotate credentials

## 6. Troubleshooting

If you encounter issues:

1. **Authentication Problems**:
   - Check that your OAuth consent screen is properly configured
   - Verify that your redirect URIs match exactly
   - Ensure your client ID and secret are correct

2. **Token Issues**:
   - If tokens expire, the system should automatically refresh them
   - If refresh fails, you may need to re-authenticate

3. **Calendar API Errors**:
   - Check that the requested scopes are properly configured
   - Verify that the user has granted the necessary permissions

## 7. How to Get New Access and Refresh Tokens

1. **Visit the Google Auth URL**:
   Open your browser and go to:
   ```
   http://localhost:8000/api/google-auth/
   ```

2. **Authorize the Application**:
   - You'll be redirected to Google's authorization page
   - Sign in with your Google account
   - Grant the requested permissions

3. **Receive the Tokens**:
   - After authorization, you'll be redirected back to your application
   - The application will automatically save the new tokens to `credentials.json`
   - You'll see a success message with the token information

4. **Use the New Tokens**:
   - The application will now use these new tokens for Google Calendar API calls
   - The tokens will be automatically refreshed when they expire

## 8. Important Notes

1. **Token Expiration**:
   - Access tokens typically expire after 1 hour
   - Refresh tokens don't expire unless revoked
   - Our code automatically refreshes the access token when it expires

2. **Security**:
   - Keep your `credentials.json` file secure
   - Don't commit it to version control
   - Consider using environment variables for production

3. **Troubleshooting**:
   - If you get "unauthorized_client" errors, make sure your OAuth consent screen is properly configured
   - Check that your redirect URIs match exactly what's in the Google Cloud Console
   - Ensure your application is using the correct client ID and secret 