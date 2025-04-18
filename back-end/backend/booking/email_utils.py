from django.core.mail import send_mail
from django.conf import settings
from datetime import datetime

def send_event_confirmation_email(participant_email, start_time, end_time, timezone, meet_link=None, organizer_email=None):
    subject = 'Event Booking Confirmation'
    
    # Format the times in a readable format
    start_str = start_time.strftime("%B %d, %Y at %I:%M %p")
    end_str = end_time.strftime("%I:%M %p")
    
    message = f"""
Hello,

Your event has been successfully scheduled!

Date: {start_str}
End Time: {end_str}
Time Zone: {timezone}
"""

    if organizer_email:
        message += f"""
Organizer: {organizer_email}
"""

    if meet_link:
        message += f"""
Google Meet Link: {meet_link}

You can join the meeting by clicking the link above when it's time.
"""

    message += """
The event has been added to your Google Calendar, and you will receive a calendar invitation shortly.

Best regards,
Your Booking System
    """
    
    send_mail(
        subject=subject,
        message=message,
        from_email=settings.EMAIL_HOST_USER,
        recipient_list=[participant_email],
        fail_silently=False,
    )