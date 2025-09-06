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
    export_users_csv,
    export_users_json,
    generate_analytics_report,
    support_dashboard_tasks,
    support_dashboard_task_detail,
    support_dashboard_app_reviews,
    support_dashboard_user_referrals,
    support_dashboard_task_toggle,
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
    path('api/profile/count/', views.ProfileCountView, name='api-relation-count'),
    path('api/register/', views.ApiRegisterView.as_view(), name='api-register'),
    path('api/send-otp/', views.send_otp_view, name='verify-otp'),
    path('api/login/', views.ApiLoginView.as_view(), name='api-login'),
    path('api/logout/', views.ApiLogoutView.as_view(), name='api-logout'),
    path('api/auth/google-login/', views.GoogleLoginView.as_view(), name='google-login'),
    path('api/auth/accept-terms/', views.AcceptTermsView.as_view(), name='accept-terms'),
    path('api/auth/accept-terms-login/', views.AcceptTermsForLoginView.as_view(), name='accept-terms-login'),
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
    path('api/characters/<int:character_id>/nickname/', views.GetCharacterNicknameView.as_view(), name='api-get-character-nickname'),
    path('api/chat/gemini/stream/', views.GeminiChatStreamView.as_view(), name='api-gemini-chat-stream'),

    # Tasks and Rewards API
    path('api/tasks/', views.TaskListView.as_view(), name='api-task-list'),
    path('api/tasks/completed/', views.UserTaskListView.as_view(), name='api-user-task-list'),
    path('api/tasks/<int:task_id>/complete/', views.CompleteTaskView.as_view(), name='api-complete-task'),
    
    # App Review API
    path('api/reviews/submit/', views.SubmitAppReviewView.as_view(), name='api-submit-review'),
    path('api/reviews/', views.AppReviewListView.as_view(), name='api-review-list'),
    
    # Referral System API
    path('api/referrals/my-code/', views.GetMyReferralCodeView.as_view(), name='api-my-referral-code'),
    path('api/referrals/use-code/', views.UseReferralCodeView.as_view(), name='api-use-referral-code'),
    path('api/referrals/redeem-code/', views.RedeemReferralCodeView.as_view(), name='api-redeem-referral-code'),
    path('api/referrals/my-referrals/', views.MyReferralsView.as_view(), name='api-my-referrals'),

    path('chat-history/', chat_history_list, name='chat-history-list'),

    # Support Dashboard URLs
    path('support-dashboard/', support_dashboard, name='support-dashboard'),
    path('support-dashboard/users/', user_list, name='user-list'),
    path('support-dashboard/users/<int:user_id>/edit/', user_edit, name='user-edit'),
    path('support-dashboard/credits/', credits_adjust, name='credits-adjust'),
    path('support-dashboard/referral-codes/', referral_code_list, name='referral-code-list'),
    path('support-dashboard/referral-codes/create/', referral_code_create, name='referral-code-create'),
    path('support-dashboard/referral-codes/<int:code_id>/edit/', referral_code_update, name='referral-code-update'),
    
    # Export and Reports URLs
    path('support-dashboard/export/users-csv/', export_users_csv, name='export-users-csv'),
    path('support-dashboard/export/users-json/', export_users_json, name='export-users-json'),
    path('support-dashboard/reports/analytics/', generate_analytics_report, name='analytics-report'),
    
    # Task Management URLs
    path('support-dashboard/tasks/', support_dashboard_tasks, name='support-dashboard-tasks'),
    path('support-dashboard/tasks/<int:task_id>/', support_dashboard_task_detail, name='support-dashboard-task-detail'),
    path('support-dashboard/tasks/<int:task_id>/toggle/', support_dashboard_task_toggle, name='support-dashboard-task-toggle'),
    path('support-dashboard/reviews/', support_dashboard_app_reviews, name='support-dashboard-reviews'),
    path('support-dashboard/user-referrals/', support_dashboard_user_referrals, name='support-dashboard-user-referrals'),

    # Mobile OAuth
    path("api/auth/mobile/google-login/", views.mobile_google_login, name="mobile-google-login"),
    path("api/auth/mobile/google-complete/", views.mobile_google_complete, name="mobile-google-complete"),
]