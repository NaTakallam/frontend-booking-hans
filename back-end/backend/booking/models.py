from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta
import logging

logger = logging.getLogger(__name__)

class Event(models.Model):
    participants = models.TextField(default='')  # Default empty string for existing records
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    time_zone = models.CharField(max_length=50)
    google_calendar_event_id = models.CharField(max_length=255, null=True, blank=True)
    meet_link = models.URLField(max_length=500, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def get_participants_list(self):
        return [email.strip() for email in self.participants.split(',') if email.strip()]

    def set_participants_list(self, participants):
        self.participants = ','.join(participants)

    def __str__(self):
        return f"Event at {self.start_time} with {len(self.get_participants_list())} participants"

class GoogleToken(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='google_token')
    access_token = models.TextField()
    refresh_token = models.TextField()
    token_type = models.CharField(max_length=50, default='Bearer')
    expires_in = models.IntegerField()
    scope = models.TextField()
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Google Token for {self.user.username}"

    def is_expired(self):
        # Add a 5-minute buffer to ensure we refresh before actual expiration
        buffer_seconds = 300  # 5 minutes
        expiry_time = self.created + timedelta(seconds=self.expires_in - buffer_seconds)
        is_expired = timezone.now() > expiry_time
        
        if is_expired:
            logger.info(f"Token for {self.user.email} is expired. Created: {self.created}, Expires in: {self.expires_in} seconds")
        else:
            logger.info(f"Token for {self.user.email} is still valid. Created: {self.created}, Expires in: {self.expires_in} seconds")
            
        return is_expired

    class Meta:
        verbose_name = "Google Token"
        verbose_name_plural = "Google Tokens"
