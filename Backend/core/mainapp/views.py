# mainapp/views.py

# --- Django and Python Imports ---
from django.conf import settings
from django.contrib.auth import authenticate, login
from django.contrib.auth.decorators import login_required
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth.views import LogoutView as TemplateLogoutView
from django.shortcuts import render, redirect, get_object_or_404
from django.urls import reverse_lazy
from django.views.generic import ListView, DetailView, CreateView, UpdateView, DeleteView

# --- DRF Imports ---
from rest_framework import generics, viewsets, status
from rest_framework.authtoken.models import Token
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

# --- Google Auth Imports ---
from google.oauth2 import id_token
from google.auth.transport import requests

# --- Local Imports ---
from .models import *
from .serializers import *

# =============================================================================
# TEMPLATE-BASED VIEWS (FOR WEB INTERFACE)
# =============================================================================

# --- Main User Flow ---

@login_required
def home(request):
    """Page 1: Displays the banner and the grid of relations for the user to select."""
    relations = Relation.objects.filter(user=request.user)
    return render(request, 'mainapp/dashboard.html', {'relations': relations})

@login_required
def customize_call_view(request, relation_id):
    """Page 2: Displays the screen to customize call preferences for a selected relation."""
    relation = get_object_or_404(Relation, pk=relation_id, user=request.user)
    return render(request, 'mainapp/customize_call.html', {'relation': relation})

@login_required
def chat_view(request, relation_id):
    """Page 3: Displays the chat interface and handles the streaming interaction."""
    relation = get_object_or_404(Relation, pk=relation_id, user=request.user)
    token, created = Token.objects.get_or_create(user=request.user)
    
    initial_message = request.GET.get('message', '')
    mood_rating = request.GET.get('mood', 'N/A')

    context = {
        'relation': relation,
        'auth_token': token.key,
        'user_id': request.user.id,
        'initial_message': initial_message,
        'mood_rating': mood_rating,
    }
    return render(request, 'mainapp/chat.html', context)

# --- Standard Authentication Views ---

def login_view(request):
    """Template-based login view."""
    if request.user.is_authenticated:
        return redirect('home')
    if request.method == 'POST': # Corrected typo from 'emthod'
        email = request.POST.get('email')
        password = request.POST.get('password')
        # Authenticate using email
        user = authenticate(request, username=email, password=password)
        if user:
            login(request, user)
            return redirect('home')
        else:
            # Add error message handling for the template
            pass
    return render(request, 'mainapp/loginfile.html')

# Note: The standard LogoutView is imported directly in urls.py, which is fine.

# --- Generic Class-Based Views for Management ---

class RelationListView(LoginRequiredMixin, ListView):
    model = Relation
    template_name = 'mainapp/relation_list.html'
    context_object_name = 'relations'
    def get_queryset(self):
        return Relation.objects.filter(user=self.request.user)

class RelationDetailView(LoginRequiredMixin, DetailView):
    model = Relation
    template_name = 'mainapp/relation_detail.html'

class RelationCreateView(LoginRequiredMixin, CreateView):
    model = Relation
    fields = ['name', 'relation_type', 'emotion_model', 'voice_model']
    template_name = 'mainapp/relation_form.html'
    success_url = reverse_lazy('relation-list')
    def form_valid(self, form):
        form.instance.user = self.request.user
        return super().form_valid(form)

class RelationUpdateView(LoginRequiredMixin, UpdateView):
    model = Relation
    fields = ['name', 'relation_type', 'emotion_model', 'voice_model']
    template_name = 'mainapp/relation_form.html'
    success_url = reverse_lazy('relation-list')

class RelationDeleteView(LoginRequiredMixin, DeleteView):
    model = Relation
    template_name = 'mainapp/relation_confirm_delete.html'
    success_url = reverse_lazy('relation-list')


# =============================================================================
# API VIEWS (FOR ANDROID APP AND WEB CLIENTS)
# =============================================================================

# --- API Authentication ---

class ApiRegisterView(generics.CreateAPIView):
    """API Endpoint for standard email & password registration."""
    queryset = CustomUser.objects.all()
    serializer_class = UserRegisterSerializer
    permission_classes = [AllowAny]     # Anyone can register

class ApiLoginView(ObtainAuthToken):
    """API Endpoint for standard email & password login. Returns auth token."""
    permission_classes = [AllowAny]
    def post(self, request, *args, **kwargs):
        # Use email for the username field in authentication
        request.data['username'] = request.data.get('email')
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user_id': user.pk,
            'email': user.email
        })

class ApiLogoutView(APIView):
    """API Endpoint for logging out. Deletes the auth token."""
    permission_classes = [IsAuthenticated]
    def post(self, request):
        request.user.auth_token.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class GoogleLoginView(APIView):
    """API Endpoint for creating or logging in a user via Google ID token."""
    permission_classes = [AllowAny]
    def post(self, request):
        google_token = request.data.get('id_token')
        if not google_token:
            return Response({'error': 'ID token is required'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            idinfo = id_token.verify_oauth2_token(google_token, requests.Request(), settings.SOCIAL_AUTH_GOOGLE_OAUTH2_KEY)
            email = idinfo['email']
            user, created = CustomUser.objects.get_or_create(
                email=email,
                defaults={
                    'username': email,
                    'first_name': idinfo.get('given_name', ''),
                    'last_name': idinfo.get('family_name', ''),
                }
            )
            drf_token, _ = Token.objects.get_or_create(user=user)
            return Response({
                'token': drf_token.key,
                'user_id': user.id,
                'email': user.email,
            })
        except ValueError:
            return Response({'error': 'Invalid Google token'}, status=status.HTTP_400_BAD_REQUEST)

class ForgotPasswordView(APIView):
    """Placeholder for forgot password logic."""
    permission_classes = [AllowAny]
    def post(self, request):
        # Full implementation requires email sending configuration
        return Response({"message": "If an account with this email exists, a password reset link has been sent."})

# --- API Data Endpoints ---

class ProfileView(generics.RetrieveUpdateAPIView):
    """API Endpoint for getting and updating user profile."""
    permission_classes = [IsAuthenticated]
    serializer_class = ProfileSerializer
    def get_object(self):
        return self.request.user

class RelationViewSet(viewsets.ModelViewSet):
    """CRUD API endpoint for Relations."""
    permission_classes = [IsAuthenticated]
    serializer_class = RelationSerializer
    def get_queryset(self):
        return Relation.objects.filter(user=self.request.user)
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class CharacterViewSet(viewsets.ModelViewSet):
    """CRUD API endpoint for Characters."""
    permission_classes = [IsAuthenticated]
    serializer_class = CharacterSerializer
    def get_queryset(self):
        return Character.objects.filter(user=self.request.user)
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class StartCallView(APIView):
    """API Endpoint to prepare a call with a specific relation."""
    permission_classes = [IsAuthenticated]
    def post(self, request, relation_id):
        relation = get_object_or_404(Relation, pk=relation_id, user=request.user)
        return Response({
            'message': f"Preparing call with {relation.name}",
            'relation_id': relation.id,
            'voice_model': relation.voice_model,
            'emotion_model': relation.emotion_model,
        })

class ApiNotificationListView(generics.ListAPIView):
    """API Endpoint to list notifications for the user."""
    permission_classes = [IsAuthenticated]
    serializer_class = NotificationSerializer
    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

class ApiCallHistoryListView(generics.ListAPIView):
    """API Endpoint to list call history, filterable by relation."""
    permission_classes = [IsAuthenticated]
    serializer_class = CallHistorySerializer
    def get_queryset(self):
        queryset = CallHistory.objects.filter(user=self.request.user)
        relation_id = self.request.query_params.get('relation_id')
        if relation_id:
            queryset = queryset.filter(call__relation__id=relation_id)
        return queryset
