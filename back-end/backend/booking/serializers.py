from rest_framework import serializers
from .models import Event, GoogleToken
from django.contrib.auth.models import User
from .oauth_flow import refresh_token

class EventSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(write_only=True, required=True)
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
        fields = ['id', 'email', 'participants', 'participants_list', 'start_time', 'end_time', 'time_zone', 'created_at', 'updated_at', 'meet_link']
        read_only_fields = ['created_at', 'updated_at', 'meet_link']

    def validate_email(self, value):
        try:
            user = User.objects.get(email=value)
            # Check if user has a valid Google token
            try:
                token = GoogleToken.objects.get(user=user)
                if token.is_expired():
                    # Try to refresh the token
                    if refresh_token(token):
                        return value
                    raise serializers.ValidationError("Your Google token has expired. Please re-authenticate.")
            except GoogleToken.DoesNotExist:
                raise serializers.ValidationError("You need to authenticate with Google first.")
        except User.DoesNotExist:
            raise serializers.ValidationError("User with this email does not exist.")
        return value

    def create(self, validated_data):
        email = validated_data.pop('email')
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