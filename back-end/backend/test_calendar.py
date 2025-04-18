from booking.google_calendar import create_calendar_event
from datetime import datetime, timedelta
import pytz

# Create test event for 1 hour from now
timezone = 'Asia/Jakarta'
tz = pytz.timezone(timezone)
start_time = datetime.now(tz) + timedelta(hours=1)
end_time = start_time + timedelta(hours=1)

try:
    event_id = create_calendar_event(
        summary="Test Event",
        description="This is a test event to verify calendar integration",
        start_time=start_time,
        end_time=end_time,
        timezone=timezone
    )
    print(f"Success! Event created with ID: {event_id}")
except Exception as e:
    print(f"Error creating event: {str(e)}")