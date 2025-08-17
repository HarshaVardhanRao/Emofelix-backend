from django import template
from ..models import Membership

register = template.Library()

@register.simple_tag
def get_user_credits(user):
    """Get user credits from membership, creating one if it doesn't exist."""
    try:
        membership, created = Membership.objects.get_or_create(user=user)
        return membership.credits
    except:
        return 0

@register.simple_tag 
def get_user_membership(user):
    """Get or create user membership."""
    membership, created = Membership.objects.get_or_create(user=user)
    return membership

@register.simple_tag
def calculate_percentage(numerator, denominator):
    """Calculate percentage safely."""
    if denominator and denominator > 0:
        return int((numerator / denominator) * 100)
    return 0