# mainapp/models.py

from django.db import models
from django.contrib.auth.models import AbstractUser

# -------------------------------
# User Model
# -------------------------------
class CustomUser(AbstractUser):
    # You can add additional fields here if needed in the future
    def __str__(self):
        return self.username

# -------------------------------
# Calls and Preferences
# -------------------------------
class Call(models.Model):
    DIRECTION = (("IN", "Incoming"), ("OUT", "Outgoing"))

    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    relation = models.CharField(max_length=50)
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
# Relations
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


# -------------------------------
# Referral Program
# -------------------------------
class ReferralProgram(models.Model):
    referrer = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="referrals")
    referred_user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name="referred_by")
    referral_token = models.CharField(max_length=20, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)