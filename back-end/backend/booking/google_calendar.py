from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from google.auth.transport.requests import Request
import json
from datetime import datetime, timedelta
import os
import logging

logger = logging.getLogger(__name__)

SCOPES = ['https://www.googleapis.com/auth/calendar']

def get_calendar_service(email=None):
    try:
        if email:
            # Try to get token from database
            from django.contrib.auth.models import User
            from .models import GoogleToken
            
            try:
                user = User.objects.get(email=email)
                token = GoogleToken.objects.get(user=user)
                
                # Create credentials object from database token
                creds = Credentials(
                    token=token.access_token,
                    refresh_token=token.refresh_token,
                    token_uri="https://oauth2.googleapis.com/token",
                    client_id=token.client_id if hasattr(token, 'client_id') else None,
                    client_secret=token.client_secret if hasattr(token, 'client_secret') else None,
                    scopes=SCOPES
                )
                
                # Check if token needs refresh
                if creds.expired:
                    try:
                        logger.info(f"Token expired, refreshing for user {email}")
                        creds.refresh(Request())
                        
                        # Update token in database
                        token.access_token = creds.token
                        token.expires_in = int(creds.expiry.timestamp() - datetime.now().timestamp())
                        token.save()
                        
                        logger.info(f"Token refreshed successfully for user {email}")
                    except Exception as e:
                        logger.error(f"Error refreshing token: {str(e)}")
                        raise
                
                return build('calendar', 'v3', credentials=creds)
            except (User.DoesNotExist, GoogleToken.DoesNotExist):
                logger.error(f"No token found for user {email}")
                raise
        else:
            # Fallback to credentials.json file
            # Get the absolute path to the credentials file
            current_dir = os.path.dirname(os.path.abspath(__file__))
            backend_dir = os.path.dirname(current_dir)
            credentials_path = os.path.join(backend_dir, 'credentials.json')
            
            logger.info(f"Looking for credentials at: {credentials_path}")
            
            # Load credentials from the credentials.json file
            with open(credentials_path, 'r') as f:
                creds_data = json.load(f)
            
            # Create credentials object
            creds = Credentials(
                token=creds_data.get('access_token'),
                refresh_token=creds_data.get('refresh_token'),
                token_uri="https://oauth2.googleapis.com/token",
                client_id=creds_data.get('client_id'),
                client_secret=creds_data.get('client_secret'),
                scopes=SCOPES
            )
            
            # Check if token needs refresh
            if creds.expired:
                try:
                    logger.info("Token expired, refreshing from credentials.json")
                    creds.refresh(Request())
                    # Update credentials file with new token
                    creds_data.update({
                        'access_token': creds.token,
                        'expires_in': int(creds.expiry.timestamp() - datetime.now().timestamp()),
                        'created': int(datetime.now().timestamp())
                    })
                    
                    # Save updated credentials
                    with open(credentials_path, 'w') as f:
                        json.dump(creds_data, f, indent=2)
                    
                    logger.info("Updated credentials.json file with new token")
                    
                except Exception as e:
                    logger.error(f"Error refreshing token: {str(e)}")
                    raise
            
            return build('calendar', 'v3', credentials=creds)
    except Exception as e:
        logger.error(f"Error creating calendar service: {str(e)}")
        raise

def create_calendar_event(summary, description, start_time, end_time, timezone, attendees=None, email=None):
    service = get_calendar_service(email)
    
    event = {
        'summary': summary,
        'description': description,
        'start': {
            'dateTime': start_time.isoformat(),
            'timeZone': timezone,
        },
        'end': {
            'dateTime': end_time.isoformat(),
            'timeZone': timezone,
        },
        'conferenceData': {
            'createRequest': {
                'requestId': f'{start_time.isoformat()}-{end_time.isoformat()}',
                'conferenceSolutionKey': {
                    'type': 'hangoutsMeet'
                }
            }
        },
        'organizer': {
            'email': email,
            'self': True
        }
    }
    
    if attendees:
        # Make sure the organizer is always included in attendees
        if email and email not in attendees:
            attendees.append(email)
        event['attendees'] = [{'email': email} for email in attendees]
        
    event = service.events().insert(
        calendarId='primary',
        body=event,
        sendUpdates='all',
        conferenceDataVersion=1  # Required for Meet integration
    ).execute()
    
    # Extract Meet link from the response
    meet_link = None
    if 'conferenceData' in event and 'entryPoints' in event['conferenceData']:
        for entry in event['conferenceData']['entryPoints']:
            if entry.get('entryPointType') == 'video':
                meet_link = entry.get('uri')
                break
    
    return event['id'], meet_link