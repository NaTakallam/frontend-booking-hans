from django.shortcuts import render, redirect
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view
from django.http import HttpResponse
from django.contrib.auth import login
from django.contrib.auth.models import User
from .models import Event, GoogleToken
from .serializers import EventSerializer
from .google_calendar import create_calendar_event
from .email_utils import send_event_confirmation_email
from .oauth_flow import get_authorization_url, get_tokens_from_code, refresh_token
import traceback
import logging

# Set up logging
logger = logging.getLogger(__name__)

@api_view(['GET'])
def google_auth(request):
    """
    Start the Google OAuth flow.
    """
    authorization_url, state = get_authorization_url()
    return Response({"authorization_url": authorization_url})

@api_view(['GET'])
def oauth2callback(request):
    """
    Handle the OAuth callback.
    """
    code = request.GET.get('code')
    if code:
        try:
            token_data = get_tokens_from_code(code)
            
            # Get user from token data
            from django.contrib.auth.models import User
            from .models import GoogleToken
            
            # Try to get the user from the token
            try:
                token = GoogleToken.objects.select_related('user').get(
                    access_token=token_data['access_token']
                )
                user = token.user
                
                # Log the user in
                login(request, user)
                
                return Response({
                    "message": "Authentication successful! You can now close this window.",
                    "token_data": {
                        "user": {
                            "username": user.username,
                            "email": user.email,
                            "first_name": user.first_name,
                            "last_name": user.last_name
                        }
                    }
                })
            except GoogleToken.DoesNotExist:
                return Response({
                    "error": "Token not found in database"
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            logger.error(f"Error in OAuth callback: {str(e)}")
            logger.error(traceback.format_exc())
            return Response({
                "error": f"Authentication failed: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    else:
        return Response({
            "error": "No authorization code received"
        }, status=status.HTTP_400_BAD_REQUEST)

class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer

    def create(self, request, *args, **kwargs):
        logger.info(f"Received event creation request: {request.data}")
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            logger.info(f"Serializer is valid: {serializer.validated_data}")
            if serializer.validated_data['end_time'] <= serializer.validated_data['start_time']:
                logger.warning("End time is before or equal to start time")
                return Response(
                    {'error': 'End time must be after start time'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            try:
                # Get the user from the email
                email = serializer.validated_data['email']
                user = User.objects.get(email=email)
                
                # Verify Google token
                try:
                    token = GoogleToken.objects.get(user=user)
                    if token.is_expired():
                        # Try to refresh the token
                        logger.info(f"Token expired, attempting to refresh for user {email}")
                        if refresh_token(token):
                            logger.info(f"Token refreshed successfully for user {email}")
                        else:
                            logger.error(f"Failed to refresh token for user {email}")
                            return Response(
                                {'error': 'Your Google token has expired. Please re-authenticate.'},
                                status=status.HTTP_401_UNAUTHORIZED
                            )
                except GoogleToken.DoesNotExist:
                    logger.error(f"No Google token found for user {email}")
                    return Response(
                        {'error': 'You need to authenticate with Google first.'},
                        status=status.HTTP_401_UNAUTHORIZED
                    )

                logger.info("Attempting to create Google Calendar event")
                # Create Google Calendar event with Meet
                google_event_id, meet_link = create_calendar_event(
                    summary=f"Meeting with {len(serializer.validated_data['participants'])} participants",
                    description="Booking appointment",
                    start_time=serializer.validated_data['start_time'],
                    end_time=serializer.validated_data['end_time'],
                    timezone=serializer.validated_data['time_zone'],
                    attendees=serializer.validated_data['participants'],
                    email=email
                )
                logger.info(f"Google Calendar event created with ID: {google_event_id}")
                
                # Save the event to database with Meet link
                instance = serializer.save(
                    google_calendar_event_id=google_event_id,
                    meet_link=meet_link
                )
                logger.info(f"Event saved to database with ID: {instance.id}")
                
                # Send confirmation email to all participants
                for participant_email in instance.get_participants_list():
                    try:
                        logger.info(f"Sending confirmation email to {participant_email}")
                        send_event_confirmation_email(
                            participant_email=participant_email,
                            start_time=serializer.validated_data['start_time'],
                            end_time=serializer.validated_data['end_time'],
                            timezone=serializer.validated_data['time_zone'],
                            meet_link=meet_link,
                            organizer_email=email
                        )
                        logger.info(f"Confirmation email sent to {participant_email}")
                    except Exception as email_error:
                        logger.error(f"Failed to send confirmation email to {participant_email}: {str(email_error)}")
                        logger.error(traceback.format_exc())
                
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            except User.DoesNotExist:
                logger.error(f"User with email {email} does not exist")
                return Response(
                    {'error': 'User with this email does not exist.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            except Exception as e:
                logger.error(f"Failed to create event: {str(e)}")
                logger.error(traceback.format_exc())
                return Response(
                    {'error': f'Failed to create event: {str(e)}'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        logger.error(f"Serializer validation failed: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
