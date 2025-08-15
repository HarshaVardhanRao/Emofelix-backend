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

class CustomCharacterSerializer(serializers.ModelSerializer):
    """Serializer for creating custom characters with validation and emocoins cost."""
    
    class Meta:
        model = Character
        fields = ('id', 'name', 'character_type', 'emotion_model', 'voice_model', 'nickname', 'created_at')
        read_only_fields = ('user', 'created_at')
    
    def validate_name(self, value):
        """Validate character name."""
        if len(value.strip()) < 2:
            raise serializers.ValidationError("Character name must be at least 2 characters long.")
        if len(value) > 100:
            raise serializers.ValidationError("Character name must not exceed 100 characters.")
        if not value.replace(' ', '').replace('-', '').replace("'", '').isalpha():
            raise serializers.ValidationError("Character name should only contain letters, spaces, hyphens, and apostrophes.")
        return value.strip()
    
    def validate_character_type(self, value):
        """Validate character type against available choices."""
        valid_types = [choice[0] for choice in Character.CHARACTER_TYPES]
        if value not in valid_types:
            raise serializers.ValidationError(f"Invalid character type. Choose from: {', '.join(valid_types)}")
        return value
    
    def validate_emotion_model(self, value):
        """Validate emotion model."""
        valid_emotions = ['Caring', 'Supportive', 'Cheerful', 'Calm', 'Energetic', 'Wise', 'Playful', 'Protective', 'Understanding', 'Loving']
        if value not in valid_emotions:
            raise serializers.ValidationError(f"Invalid emotion model. Choose from: {', '.join(valid_emotions)}")
        return value
    
    def validate_voice_model(self, value):
        """Validate voice model."""
        valid_voices = ['Warm', 'Gentle', 'Strong', 'Soft', 'Deep', 'Light', 'Melodic', 'Soothing', 'Confident', 'Tender']
        if value not in valid_voices:
            raise serializers.ValidationError(f"Invalid voice model. Choose from: {', '.join(valid_voices)}")
        return value
    
    def validate_nickname(self, value):
        """Validate nickname."""
        if value and len(value.strip()) < 2:
            raise serializers.ValidationError("Nickname must be at least 2 characters long.")
        if value and len(value) > 100:
            raise serializers.ValidationError("Nickname must not exceed 100 characters.")
        return value.strip() if value else value
    
    def validate(self, attrs):
        """Cross-field validation."""
        user = self.context['request'].user
        character_type = attrs.get('character_type')
        
        # Check if user already has this character type
        if Character.objects.filter(user=user, character_type=character_type).exists():
            raise serializers.ValidationError(f"You already have a {character_type} character. Each user can only have one character per type.")
        
        # Check if user has enough emocoins
        if user.emocoins < 10:
            raise serializers.ValidationError(f"Insufficient emocoins. You need 10 emocoins to create a custom character. You have {user.emocoins} emocoins.")
        
        return attrs

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
