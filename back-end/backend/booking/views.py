from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework import status
from .models import Event
from .serializers import EventSerializer
from .google_calendar import create_calendar_event
from .email_utils import send_event_confirmation_email

class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            if serializer.validated_data['end_time'] <= serializer.validated_data['start_time']:
                return Response(
                    {'error': 'End time must be after start time'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            try:
                # Create Google Calendar event
                google_event_id = create_calendar_event(
                    summary=f"Meeting with {len(serializer.validated_data['participants'])} participants",
                    description="Booking appointment",
                    start_time=serializer.validated_data['start_time'],
                    end_time=serializer.validated_data['end_time'],
                    timezone=serializer.validated_data['time_zone'],
                    attendees=serializer.validated_data['participants']
                )
                
                # Save the event to database
                instance = serializer.save(google_calendar_event_id=google_event_id)
                
                # Send confirmation email to all participants
                for participant_email in instance.get_participants_list():
                    try:
                        send_event_confirmation_email(
                            participant_email=participant_email,
                            start_time=serializer.validated_data['start_time'],
                            end_time=serializer.validated_data['end_time'],
                            timezone=serializer.validated_data['time_zone']
                        )
                    except Exception as email_error:
                        print(f"Failed to send confirmation email to {participant_email}: {str(email_error)}")
                
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            except Exception as e:
                return Response(
                    {'error': f'Failed to create event: {str(e)}'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
