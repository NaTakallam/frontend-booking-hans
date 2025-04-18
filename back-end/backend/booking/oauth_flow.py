from google_auth_oauthlib.flow import Flow
from django.conf import settings
from django.contrib.auth.models import User
from .models import GoogleToken
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
import os
import json
import warnings
import time
import logging

logger = logging.getLogger(__name__)

# OAuth 2.0 client configuration
CLIENT_CONFIG = {
    "web": {
        "client_id": "405706290742-918jnqkcrd0hcqn1i9ritgp152dgafkq.apps.googleusercontent.com",
        "client_secret": "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",
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "redirect_uris": ["http://localhost:8000/oauth2callback/"],
        "scopes": [
            "https://www.googleapis.com/auth/calendar",
            "https://www.googleapis.com/auth/calendar.events",
            "openid",
            "https://www.googleapis.com/auth/userinfo.profile",
            "https://www.googleapis.com/auth/userinfo.email"
        ]
    }
}

def get_authorization_url():
    """
    Generate the authorization URL for the OAuth flow.
    """
    # Create a flow instance
    flow = Flow.from_client_config(
        CLIENT_CONFIG,
        scopes=CLIENT_CONFIG["web"]["scopes"],
        redirect_uri="http://localhost:8000/oauth2callback/"
    )
    
    # Generate the authorization URL
    authorization_url, state = flow.authorization_url(
        access_type='offline',
        include_granted_scopes='true',
        prompt='consent'
    )
    
    return authorization_url, state

def refresh_token(token_obj):
    """
    Refresh an expired Google token.
    """
    try:
        logger.info(f"Attempting to refresh token for user {token_obj.user.email}")
        
        # Create credentials object
        creds = Credentials(
            token=token_obj.access_token,
            refresh_token=token_obj.refresh_token,
            token_uri="https://oauth2.googleapis.com/token",
            client_id=CLIENT_CONFIG["web"]["client_id"],
            client_secret=CLIENT_CONFIG["web"]["client_secret"],
            scopes=CLIENT_CONFIG["web"]["scopes"]
        )
        
        # Refresh the token
        creds.refresh(Request())
        
        # Get current timestamp
        current_time = time.time()
        
        # Update token in database
        token_obj.access_token = creds.token
        token_obj.expires_in = int(creds.expiry.timestamp() - current_time)
        token_obj.save()
        
        logger.info(f"Successfully refreshed token for user {token_obj.user.email}")
        
        # Also update the credentials.json file
        backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        credentials_path = os.path.join(backend_dir, 'credentials.json')
        
        token_data = {
            "access_token": creds.token,
            "refresh_token": token_obj.refresh_token,
            "token_type": "Bearer",
            "expires_in": int(creds.expiry.timestamp() - current_time),
            "scope": " ".join(creds.scopes),
            "created": int(current_time),
            "client_id": CLIENT_CONFIG["web"]["client_id"],
            "client_secret": CLIENT_CONFIG["web"]["client_secret"]
        }
        
        with open(credentials_path, 'w') as f:
            json.dump(token_data, f, indent=4)
            
        logger.info(f"Updated credentials.json file with new token")
        
        return True
    except Exception as e:
        logger.error(f"Error refreshing token: {str(e)}")
        logger.error(f"Token details: user={token_obj.user.email}, expires_in={token_obj.expires_in}")
        return False

def get_tokens_from_code(code):
    """
    Exchange the authorization code for access and refresh tokens.
    """
    # Suppress the scope warning
    with warnings.catch_warnings():
        warnings.simplefilter("ignore")
        
        # Create a flow instance
        flow = Flow.from_client_config(
            CLIENT_CONFIG,
            scopes=CLIENT_CONFIG["web"]["scopes"],
            redirect_uri="http://localhost:8000/oauth2callback/"
        )
        
        # Exchange the code for tokens
        flow.fetch_token(code=code)
        
        # Get the credentials
        credentials = flow.credentials
        
        # Get current timestamp
        current_time = time.time()
        
        # Create a token dictionary
        token_data = {
            "access_token": credentials.token,
            "refresh_token": credentials.refresh_token,
            "token_type": "Bearer",
            "expires_in": int(credentials.expiry.timestamp() - current_time),
            "scope": " ".join(credentials.scopes),
            "created": int(current_time),
            "client_id": CLIENT_CONFIG["web"]["client_id"],
            "client_secret": CLIENT_CONFIG["web"]["client_secret"]
        }
        
        # Save the token data to a file
        backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        credentials_path = os.path.join(backend_dir, 'credentials.json')
        
        with open(credentials_path, 'w') as f:
            json.dump(token_data, f, indent=4)

        # Get or create user based on email from Google
        try:
            # Get user info from Google
            user_info = get_user_info(credentials)
            email = user_info.get('email')
            
            if email:
                # Try to get existing user or create new one
                user, created = User.objects.get_or_create(
                    email=email,
                    defaults={
                        'username': email.split('@')[0],
                        'first_name': user_info.get('given_name', ''),
                        'last_name': user_info.get('family_name', '')
                    }
                )
                
                # Update or create GoogleToken
                GoogleToken.objects.update_or_create(
                    user=user,
                    defaults={
                        'access_token': token_data['access_token'],
                        'refresh_token': token_data['refresh_token'],
                        'token_type': token_data['token_type'],
                        'expires_in': token_data['expires_in'],
                        'scope': token_data['scope']
                    }
                )
        except Exception as e:
            print(f"Error saving user token: {str(e)}")
        
        return token_data

def get_user_info(credentials):
    """
    Get user information from Google using the credentials.
    """
    from googleapiclient.discovery import build
    
    service = build('oauth2', 'v2', credentials=credentials)
    user_info = service.userinfo().get().execute()
    return user_info 