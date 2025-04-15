from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
import json

SCOPES = ['https://www.googleapis.com/auth/calendar']

def get_calendar_service():
    token = {
        "access_token": "ya29.a0AZYkNZh5eW0TPCP2TwFzeuDiIOimx-ON_086Rc5V10NssKPmpcVtw3j28MgxOhTxD8EYas_NbArdM-5YKj9u_Fg0hk_bq75FqB4r9Edd4DhfQWl3QhTtsowmZTL6MtanffI7Qm8_ZlSJ3rG1DVVL26Nz2lrSa6VvKGX7jZ4gaCgYKASMSARUSFQHGX2MiLFSE6_FOA_OKTA6DMH_SHw0175",
        "refresh_token": "1//05TXk7Fmsq9tUCgYIARAAGAUSNwF-L9Ir6A3tOr9fqcFE76zk8KcWLlA7cuqDoTpNFqW3mShVn7RTbEHjGRiNXPgTL-_oYyeZnnk",
        "token_type": "Bearer",
        "expires_in": 3599,
        "scope": "https://www.googleapis.com/auth/calendar",
        "created": 1744721587
    }
    
    creds = Credentials(
        token=token['access_token'],
        refresh_token=token['refresh_token'],
        token_uri="https://oauth2.googleapis.com/token",
        client_id="405706290742-918jnqkcrd0hcqn1i9ritgp152dgafkq.apps.googleusercontent.com",
        client_secret="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",
        scopes=SCOPES
    )
    
    return build('calendar', 'v3', credentials=creds)

def create_calendar_event(summary, description, start_time, end_time, timezone, attendees=None):
    service = get_calendar_service()
    
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
    }
    
    if attendees:
        event['attendees'] = [{'email': email} for email in attendees]
        
    event = service.events().insert(calendarId='primary', body=event, sendUpdates='all').execute()
    return event['id']