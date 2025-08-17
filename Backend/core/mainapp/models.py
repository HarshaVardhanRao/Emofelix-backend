# mainapp/models.py

from django.db import models
from django.contrib.auth.models import AbstractUser

# -------------------------------
# User Model
# -------------------------------
class CustomUser(AbstractUser):
    @property
    def age(self):
        from datetime import date
        if self.date_of_birth:
            today = date.today()
            return today.year - self.date_of_birth.year - ((today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day))
        return None
    GENDER_CHOICES = (
        ('male', 'Male'),
        ('female', 'Female'),
        ('other', 'Other'),
    )
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, blank=True, null=True)
    date_of_birth = models.DateField(blank=True, null=True)
    emocoins = models.PositiveIntegerField(default=0, help_text="Emocoins earned through activities.")
    def __str__(self):
        return self.username

# -------------------------------
# Characters (AI Companions)
# -------------------------------
class Character(models.Model):
    CHARACTER_TYPES = [
        ('Mother', 'Mother'),
        ('Father', 'Father'),
        ('Sister', 'Sister'),
        ('Brother', 'Brother'),
        ('Partner', 'Partner'),
        ('Friend', 'Friend'),
        ('Grandmother', 'Grandmother'),
        ('Grandfather', 'Grandfather'),
        ('Mentor', 'Mentor'),
        ('Child', 'Child'),
    ]
    
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="characters")
    name = models.CharField(max_length=100)
    character_type = models.CharField(max_length=50, choices=CHARACTER_TYPES)
    emotion_model = models.CharField(max_length=100)
    voice_model = models.CharField(max_length=100)
    nickname = models.CharField(max_length=100, help_text="What the character usually calls the user.", blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    streak = models.PositiveIntegerField(default=0, help_text="Time spent communicating with this character (in minutes)")

    class Meta:
        ordering = ['created_at']
        # Removed unique_together constraint to allow multiple characters of same type

    def __str__(self):
        return f"{self.name} ({self.character_type})"

# -------------------------------
# Relations (Legacy - keeping for backward compatibility)
# -------------------------------
class Relation(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="relations")
    name = models.CharField(max_length=100)
    relation_type = models.CharField(max_length=50)  # e.g. "Mother", "Friend"
    emotion_model = models.CharField(max_length=100)
    voice_model = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.name} ({self.relation_type})"
# -------------------------------
# Calls and Preferences
# -------------------------------
class Call(models.Model):
    DIRECTION = (("IN", "Incoming"), ("OUT", "Outgoing"))

    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    relation = models.ForeignKey(Relation, on_delete=models.CASCADE, related_name="calls")  
    timestamp = models.DateTimeField(auto_now_add=True)
    emotion_detected = models.CharField(max_length=50, blank=True)
    voice_model_used = models.CharField(max_length=100)
    direction = models.CharField(max_length=3, choices=DIRECTION)

    def __str__(self):
        return f"{self.relation} call by {self.user}"


class CallHistory(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    call = models.ForeignKey(Call, on_delete=models.CASCADE)
    duration_seconds = models.PositiveIntegerField()
    feedback = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)


class CallPreference(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE)
    preferred_times = models.CharField(max_length=100)  # e.g. "Evenings"
    preferred_emotions = models.CharField(max_length=100)  # e.g. "Calm, Supportive"
    preferred_voices = models.CharField(max_length=100)  # e.g. "Mom-like, Dad-like"


# -------------------------------
# Chat Preferences
# -------------------------------
class ChatPreference(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE)
    emotion_tone = models.CharField(max_length=100)  # e.g. "Empathetic, Cheerful"
    voice_type = models.CharField(max_length=100)    # e.g. "Warm, Friendly"


# -------------------------------
# Chat History
# -------------------------------
class ChatHistory(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    relation = models.ForeignKey(Relation, on_delete=models.CASCADE)
    summary = models.TextField(help_text="Summary of the chat between user and relation.")
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"ChatHistory: {self.user.username} & {self.relation.name} @ {self.timestamp}" 


# -------------------------------
# Notifications
# -------------------------------
class Notification(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)


# -------------------------------
# Payments and Memberships
# -------------------------------
class PaymentDetail(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    provider = models.CharField(max_length=50)  # e.g. "Stripe", "Razorpay"
    payment_method = models.CharField(max_length=100)
    card_last4 = models.CharField(max_length=4, blank=True)


class PaymentHistory(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=8, decimal_places=2)
    transaction_id = models.CharField(max_length=100)
    status = models.CharField(max_length=20)
    created_at = models.DateTimeField(auto_now_add=True)


class Membership(models.Model):
    PLAN_CHOICES = (
        ("FREE", "Free"),
        ("BASIC", "Basic"),
        ("PREMIUM", "Premium"),
    )
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE)
    plan = models.CharField(max_length=10, choices=PLAN_CHOICES)
    start_date = models.DateField(auto_now_add=True)
    expiry_date = models.DateField(null=True, blank=True)
    credits = models.PositiveIntegerField(default=15, help_text="Credits used to unlock characters. Each character costs 5 credits.")


# -------------------------------
# Referral Program
# -------------------------------
class ReferralProgram(models.Model):
    referrer = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="referrals")
    referred_user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name="referred_by")
    referral_token = models.CharField(max_length=20, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

class ReferralCode(models.Model):
    code = models.CharField(max_length=50, unique=True)
    credits = models.PositiveIntegerField(default=0, help_text="Credits granted by this code.")
    max_redemptions = models.PositiveIntegerField(default=1, help_text="Maximum times this code can be redeemed.")
    redeemed_count = models.PositiveIntegerField(default=0, help_text="Number of times this code has been redeemed.")
    active = models.BooleanField(default=True, help_text="Is this code active?")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.code} ({self.credits} credits)"


# -------------------------------
# Tasks and Rewards System
# -------------------------------
class Task(models.Model):
    TASK_TYPES = [
        ('REVIEW', 'App Review'),
        ('REFERRAL', 'Referral'),
        ('DAILY_LOGIN', 'Daily Login'),
        ('FIRST_CALL', 'First Call'),
        ('COMPLETE_PROFILE', 'Complete Profile'),
        ('SOCIAL_SHARE', 'Social Share'),
    ]
    
    title = models.CharField(max_length=200)
    description = models.TextField()
    task_type = models.CharField(max_length=20, choices=TASK_TYPES)
    reward_emocoins = models.PositiveIntegerField(default=5)
    is_active = models.BooleanField(default=True)
    max_completions_per_user = models.PositiveIntegerField(default=1, help_text="How many times a user can complete this task")
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.title} - {self.reward_emocoins} emocoins"


class UserTask(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="completed_tasks")
    task = models.ForeignKey(Task, on_delete=models.CASCADE)
    completed_at = models.DateTimeField(auto_now_add=True)
    reward_claimed = models.BooleanField(default=True)
    
    class Meta:
        unique_together = ['user', 'task']
    
    def __str__(self):
        return f"{self.user.username} - {self.task.title}"


class AppReview(models.Model):
    RATING_CHOICES = [
        (1, '1 Star'),
        (2, '2 Stars'),
        (3, '3 Stars'),
        (4, '4 Stars'),
        (5, '5 Stars'),
    ]
    
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="app_reviews")
    rating = models.IntegerField(choices=RATING_CHOICES)
    
    # Review questions and answers
    what_you_like = models.TextField(help_text="What do you like most about the app?", blank=True)
    what_to_improve = models.TextField(help_text="What could be improved?", blank=True)
    recommend_to_others = models.BooleanField(help_text="Would you recommend this app to others?")
    favorite_feature = models.CharField(max_length=200, help_text="What's your favorite feature?", blank=True)
    additional_feedback = models.TextField(help_text="Any additional feedback?", blank=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    reward_given = models.BooleanField(default=False)
    
    def __str__(self):
        return f"Review by {self.user.username} - {self.rating} stars"


# -------------------------------
# Enhanced Referral System
# -------------------------------
class UserReferral(models.Model):
    """Enhanced referral tracking system"""
    referrer = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="sent_referrals")
    referred_user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name="received_referral")
    referral_code = models.CharField(max_length=20, unique=True, help_text="Unique referral code generated for sharing")
    
    # Tracking
    created_at = models.DateTimeField(auto_now_add=True)
    referral_used_at = models.DateTimeField(auto_now_add=True)
    
    # Rewards
    referrer_reward_given = models.BooleanField(default=False)
    referred_reward_given = models.BooleanField(default=False)
    referrer_reward_emocoins = models.PositiveIntegerField(default=10)
    referred_reward_emocoins = models.PositiveIntegerField(default=5)
    
    def __str__(self):
        return f"{self.referrer.username} referred {self.referred_user.username}"


class ReferralCodeRedemption(models.Model):
    """Track referral code redemptions"""
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    referral_code = models.ForeignKey(ReferralCode, on_delete=models.CASCADE)
    redeemed_at = models.DateTimeField(auto_now_add=True)
    credits_received = models.PositiveIntegerField()
    
    class Meta:
        unique_together = ['user', 'referral_code']
    
    def __str__(self):
        return f"{self.user.username} redeemed {self.referral_code.code}"
