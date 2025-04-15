from django.contrib import admin
from .models import Event

@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ('get_participants_display', 'start_time', 'end_time', 'time_zone', 'created_at')
    list_filter = ('time_zone', 'created_at')
    search_fields = ('participants',)

    def get_participants_display(self, obj):
        return obj.participants
    get_participants_display.short_description = 'Participants'
