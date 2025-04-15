from rest_framework import serializers
from .models import Event

class EventSerializer(serializers.ModelSerializer):
    participants = serializers.ListField(
        child=serializers.EmailField(),
        write_only=True
    )
    participants_list = serializers.ListField(
        child=serializers.EmailField(),
        read_only=True,
        source='get_participants_list'
    )

    class Meta:
        model = Event
        fields = ['id', 'participants', 'participants_list', 'start_time', 'end_time', 'time_zone', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']

    def create(self, validated_data):
        participants = validated_data.pop('participants')
        instance = super().create(validated_data)
        instance.set_participants_list(participants)
        instance.save()
        return instance

    def update(self, instance, validated_data):
        if 'participants' in validated_data:
            participants = validated_data.pop('participants')
            instance.set_participants_list(participants)
        return super().update(instance, validated_data)