# mainapp/serializers.py
from rest_framework import serializers
from .models import *
from django.contrib.auth import authenticate

class UserRegisterSerializer(serializers.ModelSerializer):
    """Serializer for user registration."""
    terms_accepted = serializers.BooleanField(write_only=True)
    
    class Meta:
        model = CustomUser
        fields = ('id', 'email', 'password', 'first_name', 'last_name', 'terms_accepted')
        extra_kwargs = {'password': {'write_only': True}}

    def validate_terms_accepted(self, value):
        """Validate that user has accepted terms and conditions."""
        if not value:
            raise serializers.ValidationError("You must accept the Terms and Conditions to create an account.")
        return value

    def create(self, validated_data):
        from django.utils import timezone
        
        terms_accepted = validated_data.pop('terms_accepted', False)
        
        user = CustomUser.objects.create_user(
            username=validated_data['email'], # Use email as username
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            emocoins=validated_data.get('emocoins', 15),  # Default to 15 if not provided
            terms_accepted=terms_accepted,
            terms_accepted_at=timezone.now() if terms_accepted else None
        )
        return user

class ProfileSerializer(serializers.ModelSerializer):
    """Serializer for retrieving and updating user profile."""
    class Meta:
        model = CustomUser
        fields = ('id', 'email', 'first_name', 'last_name', 'emocoins', 'terms_accepted', 'terms_accepted_at')
        read_only_fields = ('email', 'id', 'terms_accepted', 'terms_accepted_at') # Don't allow email change via this endpoint

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
        
        # For custom characters, allow multiple characters of the same type
        # Only check for emocoins
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


class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ['id', 'title', 'description', 'task_type', 'reward_emocoins', 'is_active', 'max_completions_per_user']


class UserTaskSerializer(serializers.ModelSerializer):
    task_details = TaskSerializer(source='task', read_only=True)
    
    class Meta:
        model = UserTask
        fields = ['id', 'task', 'task_details', 'completed_at', 'reward_claimed']


class AppReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = AppReview
        fields = [
            'id', 'rating', 'what_you_like', 'what_to_improve', 
            'recommend_to_others', 'favorite_feature', 'additional_feedback',
            'created_at'
        ]
        read_only_fields = ['created_at']
    
    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError("Rating must be between 1 and 5.")
        return value
    
    def validate_what_you_like(self, value):
        if len(value.strip()) < 10:
            raise serializers.ValidationError("Please provide at least 10 characters for what you like about the app.")
        return value.strip()


class UserReferralSerializer(serializers.ModelSerializer):
    referrer_username = serializers.CharField(source='referrer.username', read_only=True)
    referred_username = serializers.CharField(source='referred_user.username', read_only=True)
    
    class Meta:
        model = UserReferral
        fields = [
            'id', 'referrer_username', 'referred_username', 'referral_code',
            'created_at', 'referral_used_at', 'referrer_reward_given', 
            'referred_reward_given', 'referrer_reward_emocoins', 'referred_reward_emocoins'
        ]


class ReferralCodeRedemptionSerializer(serializers.ModelSerializer):
    referral_code_name = serializers.CharField(source='referral_code.code', read_only=True)
    
    class Meta:
        model = ReferralCodeRedemption
        fields = ['id', 'referral_code', 'referral_code_name', 'redeemed_at', 'credits_received']
