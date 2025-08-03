from django.db.models.signals import post_save
from django.dispatch import receiver
from rest_framework.authtoken.models import Token
from django.conf import settings
from .models import Character

@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_auth_token(sender, instance=None, created=False, **kwargs):
    if created:
        Token.objects.create(user=instance)

@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_default_characters(sender, instance=None, created=False, **kwargs):
    """Create 5 default characters when a user is created. Unlock the first one."""
    if created:
        default_characters = [
            {
                'name': 'Mom',
                'character_type': 'Mother',
                'emotion_model': 'Warm & Nurturing',
                'voice_model': 'Gentle & Caring',
                'is_unlocked': True,  # First character is unlocked
                'unlock_order': 1
            },
            {
                'name': 'Dad', 
                'character_type': 'Father',
                'emotion_model': 'Strong & Supportive',
                'voice_model': 'Deep & Reassuring',
                'is_unlocked': False,
                'unlock_order': 2
            },
            {
                'name': 'Best Friend',
                'character_type': 'Friend', 
                'emotion_model': 'Fun & Understanding',
                'voice_model': 'Cheerful & Friendly',
                'is_unlocked': False,
                'unlock_order': 3
            },
            {
                'name': 'Sister',
                'character_type': 'Sister',
                'emotion_model': 'Playful & Loyal',
                'voice_model': 'Sweet & Bubbly', 
                'is_unlocked': False,
                'unlock_order': 4
            },
            {
                'name': 'Partner',
                'character_type': 'Partner',
                'emotion_model': 'Romantic & Caring', 
                'voice_model': 'Intimate & Loving',
                'is_unlocked': False,
                'unlock_order': 5
            }
        ]
        
        for char_data in default_characters:
            Character.objects.create(user=instance, **char_data)