# mainapp/urls.py

from django.urls import path, include
from . import views
from django.contrib.auth.views import LogoutView
from rest_framework.routers import DefaultRouter
from .views import chat_history_list
from .support_dashboard_views import (
    support_dashboard,
    user_list,
    user_edit,
    credits_adjust,
    referral_code_list,
    referral_code_create,
    referral_code_update,
)

router = DefaultRouter()
router.register(r'relations', views.RelationViewSet, basename='relation-api')
router.register(r'characters', views.CharacterViewSet, basename='character-api')


urlpatterns = [

    path('', views.home, name='home'),
    path('login/', views.login_view, name='login'),
    path('logout/', LogoutView.as_view(next_page='home'), name='logout'),
    path('customize/<int:relation_id>/', views.customize_call_view, name='customize-call'),
    path('chat/<int:relation_id>/', views.chat_view, name='chat'),

    path('relations/', views.RelationListView.as_view(), name='relation-list'),
    path('relations/<int:pk>/', views.RelationDetailView.as_view(), name='relation-detail'),
    path('relations/new/', views.RelationCreateView.as_view(), name='relation-create'),
    path('relations/<int:pk>/edit/', views.RelationUpdateView.as_view(), name='relation-update'),
    path('relations/<int:pk>/delete/', views.RelationDeleteView.as_view(), name='relation-delete'),


    path('api/', include(router.urls)),

    # API Authentication
    path('api/register/', views.ApiRegisterView.as_view(), name='api-register'),
    path('api/send-otp/', views.send_otp_view, name='verify-otp'),
    path('api/login/', views.ApiLoginView.as_view(), name='api-login'),
    path('api/logout/', views.ApiLogoutView.as_view(), name='api-logout'),
    path('api/auth/google-login/', views.GoogleLoginView.as_view(), name='google-login'),
    path('api/forgot-password/', views.ForgotPasswordView.as_view(), name='api-forgot-password'),
    path('api/reset-password/', views.ResetPasswordView.as_view(), name='api-reset-password'),

    # API Data Endpoints
    path('api/profile/', views.ProfileView.as_view(), name='api-profile'),
    path('api/change-password/', views.ChangePasswordView.as_view(), name='api-change-password'),
    path('api/custom-characters/create-custom/', views.CreateCustomCharacterView.as_view(), name='api-create-custom-character'),
    path('api/custom-characters/options/', views.GetCustomCharacterOptionsView.as_view(), name='api-character-options'),
    path('api/notifications/', views.ApiNotificationListView.as_view(), name='api-notifications'),
    path('api/call-history/', views.ApiCallHistoryListView.as_view(), name='api-call-history'),
    path('api/relations/<int:relation_id>/start-call/', views.StartCallView.as_view(), name='api-start-call'),
    path('api/characters/<int:character_id>/start-call/', views.StartCharacterCallView.as_view(), name='api-start-character-call'),
    path('api/chat/gemini/stream/', views.GeminiChatStreamView.as_view(), name='api-gemini-chat-stream'),

    path('chat-history/', chat_history_list, name='chat-history-list'),

    # Support Dashboard URLs
    path('support-dashboard/', support_dashboard, name='support-dashboard'),
    path('support-dashboard/users/', user_list, name='user-list'),
    path('support-dashboard/users/<int:user_id>/edit/', user_edit, name='user-edit'),
    path('support-dashboard/credits/', credits_adjust, name='credits-adjust'),
    path('support-dashboard/referral-codes/', referral_code_list, name='referral-code-list'),
    path('support-dashboard/referral-codes/create/', referral_code_create, name='referral-code-create'),
    path('support-dashboard/referral-codes/<int:code_id>/edit/', referral_code_update, name='referral-code-update'),
]