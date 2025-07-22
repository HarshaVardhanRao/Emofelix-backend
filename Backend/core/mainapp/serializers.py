# mainapp/serializers.py

from rest_framework import serializers
from .models import (
    CustomUser, Call, CallHistory, CallPreference, ChatPreference,
    Relation, Notification, PaymentDetail, PaymentHistory, Membership,
    ReferralProgram
)

class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'first_name', 'last_name']

class CallSerializer(serializers.ModelSerializer):
    class Meta:
        model = Call
        fields = '__all__'

class CallHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = CallHistory
        fields = '__all__'

class CallPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = CallPreference
        fields = '__all__'

class ChatPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatPreference
        fields = '__all__'

class RelationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Relation
        fields = '__all__'

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'

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
