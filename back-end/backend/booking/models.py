from django.db import models

class Event(models.Model):
    participants = models.TextField(default='')  # Default empty string for existing records
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    time_zone = models.CharField(max_length=50)
    google_calendar_event_id = models.CharField(max_length=255, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def get_participants_list(self):
        return [email.strip() for email in self.participants.split(',') if email.strip()]

    def set_participants_list(self, participants):
        self.participants = ','.join(participants)

    def __str__(self):
        return f"Event at {self.start_time} with {len(self.get_participants_list())} participants"
