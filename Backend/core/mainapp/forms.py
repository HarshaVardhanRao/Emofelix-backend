from django import forms
from .models import CustomUser, Membership, ReferralCode

class StaffUserEditForm(forms.ModelForm):
    class Meta:
        model = CustomUser
        exclude = ['first_name', 'last_name', 'username', 'email', 'password']

class CreditsAdjustForm(forms.Form):
    user = forms.ModelChoiceField(queryset=CustomUser.objects.all(), required=False)
    credits = forms.IntegerField(label='Credits to add/subtract')
    bulk = forms.BooleanField(required=False, initial=False, help_text='Apply to all filtered users')
    filter_active = forms.BooleanField(required=False, initial=False, help_text='Only active users')
    filter_date_joined = forms.DateField(required=False, help_text='Joined after this date')

class ReferralCodeForm(forms.ModelForm):
    class Meta:
        model = ReferralCode
        fields = ['code', 'credits', 'max_redemptions', 'active']

class ReferralCodeUpdateForm(forms.ModelForm):
    class Meta:
        model = ReferralCode
        fields = ['credits', 'max_redemptions', 'active']
