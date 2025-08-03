from django.contrib import admin
from .models import *
# Register your models here.

admin.site.register(CustomUser)
admin.site.register(Character)
admin.site.register(Relation)
# If you have other models like Notification, CallHistory, etc., register them here as well