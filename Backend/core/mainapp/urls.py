# mainapp/urls.py

from django.urls import path, include
from . import views
from django.contrib.auth.views import LogoutView
from rest_framework.routers import DefaultRouter

# --- API Router ---
router = DefaultRouter()
router.register(r'users', views.UserViewSet)
# ... (register other viewsets)

# --- Template URL Patterns ---
urlpatterns = [
    # Main pages with new flow
    path('', views.home, name='home'),
    path('login/', views.login_view, name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('customize/<int:relation_id>/', views.customize_call_view, name='customize-call'),
    path('chat/<int:relation_id>/', views.chat_view, name='chat'),

    # Relation CRUD (for management)
    path('relations/', views.RelationListView.as_view(), name='relation-list'),
    path('relations/<int:pk>/', views.RelationDetailView.as_view(), name='relation-detail'),
    path('relations/new/', views.RelationCreateView.as_view(), name='relation-create'),
    path('relations/<int:pk>/edit/', views.RelationUpdateView.as_view(), name='relation-update'),
    path('relations/<int:pk>/delete/', views.RelationDeleteView.as_view(), name='relation-delete'),

    # API URLs
    path('api/', include(router.urls)),
    path('api/auth/google-login/', views.GoogleLoginView.as_view(), name='google-login'),
]