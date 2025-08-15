# mainapp/serializers.py
from rest_framework import serializers
from .models import *
from django.contrib.auth import authenticate

class UserRegisterSerializer(serializers.ModelSerializer):
    """Serializer for user registration."""
    class Meta:
        model = CustomUser
        fields = ('id', 'email', 'password', 'first_name', 'last_name')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = CustomUser.objects.create_user(
            username=validated_data['email'], # Use email as username
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            emocoins=validated_data.get('emocoins', 5)  # Default to 5 if not provided
        )
        return user

class ProfileSerializer(serializers.ModelSerializer):
    """Serializer for retrieving and updating user profile."""
    class Meta:
        model = CustomUser
        fields = ('id', 'email', 'first_name', 'last_name', 'emocoins')
        read_only_fields = ('email', 'id') # Don't allow email change via this endpoint

class CharacterSerializer(serializers.ModelSerializer):
    """Serializer for Character model."""
    class Meta:
        model = Character
        fields = ('id', 'name', 'character_type', 'emotion_model', 'voice_model', 'nickname', 'created_at')
        read_only_fields = ('user', 'created_at')

# Keep your existing serializers and add the above
class RelationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Relation
        fields = '__all__'
        read_only_fields = ('user',) # User should be set from request context

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'

class CallHistorySerializer(serializers.ModelSerializer):
    # Add relation details to the history output
    relation_name = serializers.CharField(source='call.relation.name', read_only=True)

    class Meta:
        model = CallHistory
        fields = ('id', 'call', 'duration_seconds', 'feedback', 'created_at', 'relation_name')


class PaymentDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentDetail
        fields = '__all__'

class PaymentHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentHistory
        fields = '__all__'

class MembershipSerializer(serializers.ModelSerializer):
    class Meta:
        model = Membership
        fields = '__all__'

class ReferralProgramSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReferralProgram
        fields = '__all__'
