from django.contrib import admin
from .models import Event, GoogleToken
from django.utils import timezone
from django.utils.html import format_html

@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ('id', 'get_participants_display', 'start_time', 'end_time', 'time_zone', 'created_at', 'has_google_calendar', 'has_meet')
    list_filter = ('time_zone', 'created_at')
    search_fields = ('participants', 'google_calendar_event_id')
    readonly_fields = ('created_at', 'updated_at', 'meet_link')
    ordering = ('-created_at',)
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Event Details', {
            'fields': ('participants', 'start_time', 'end_time', 'time_zone')
        }),
        ('Google Calendar Integration', {
            'fields': ('google_calendar_event_id', 'meet_link'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def get_participants_display(self, obj):
        participants = obj.get_participants_list()
        return ', '.join(participants) if participants else 'No participants'
    get_participants_display.short_description = 'Participants'

    def has_google_calendar(self, obj):
        return bool(obj.google_calendar_event_id)
    has_google_calendar.boolean = True
    has_google_calendar.short_description = 'Google Calendar'

    def has_meet(self, obj):
        if obj.meet_link:
            return format_html('<a href="{}" target="_blank">Join Meet</a>', obj.meet_link)
        return False
    has_meet.short_description = 'Meet Link'

@admin.register(GoogleToken)
class GoogleTokenAdmin(admin.ModelAdmin):
    list_display = ('user', 'token_type', 'expires_in', 'created', 'updated', 'is_expired')
    list_filter = ('token_type', 'created')
    search_fields = ('user__username', 'user__email')
    readonly_fields = ('created', 'updated')
    ordering = ('-created',)
    
    fieldsets = (
        ('User Information', {
            'fields': ('user',)
        }),
        ('Token Information', {
            'fields': ('access_token', 'refresh_token', 'token_type', 'expires_in', 'scope'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created', 'updated'),
            'classes': ('collapse',)
        }),
    )

    def is_expired(self, obj):
        from datetime import timedelta
        expiry_time = obj.created + timedelta(seconds=obj.expires_in)
        return timezone.now() > expiry_time
    is_expired.boolean = True
    is_expired.short_description = 'Expired'
