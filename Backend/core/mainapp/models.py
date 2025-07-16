from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager, Group, Permission
import uuid


# -------------------------------
# Custom User Manager & Model
# -------------------------------
class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Users must have an email")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password or uuid.uuid4().hex[:10])
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return self.create_user(email, password, **extra_fields)


class CustomUser(AbstractBaseUser, PermissionsMixin):
    GENDER_CHOICES = (("M", "Male"), ("F", "Female"), ("O", "Other"))

    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=100)
    phone = models.CharField(max_length=15, blank=True)
    dob = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES, blank=True)
    profile_pic = models.URLField(blank=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = CustomUserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["full_name"]

    groups = models.ManyToManyField(
    Group,
    related_name="customuser_set",  # Avoids clash with auth.User.groups
    blank=True,
    help_text="The groups this user belongs to.",
    verbose_name="groups",)

    user_permissions = models.ManyToManyField(
    Permission,
    related_name="customuser_set",  # Avoids clash with auth.User.user_permissions
    blank=True,
    help_text="Specific permissions for this user.",
    verbose_name="user permissions",)


    def __str__(self):
        return self.email


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
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
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
