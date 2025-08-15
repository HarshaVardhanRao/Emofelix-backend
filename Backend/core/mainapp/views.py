# mainapp/views.py

# --- Django and Python Imports ---
from django.conf import settings
from django.contrib.auth import authenticate, login
from django.contrib.auth.decorators import login_required
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth.views import LogoutView as TemplateLogoutView
from django.http import StreamingHttpResponse
from django.shortcuts import render, redirect, get_object_or_404
from django.urls import reverse_lazy
from django.utils.encoding import smart_str
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
import google.generativeai as genai

# --- Local Imports ---
from .models import *
from .serializers import *

# Configure Gemini only once
if getattr(settings, 'GEMINI_API_KEY', None):
    try:
        genai.configure(api_key=settings.GEMINI_API_KEY)
    except Exception:
        pass

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
import random


from django.core.mail import send_mail
from django.conf import settings

def send_otp_email(email):
    """Generate a 6-digit OTP and send it to the given email."""
    otp = str(random.randint(100000, 999999)) 
    
    subject = "Email Verification OTP"
    message = f"Your OTP for verification is: {otp}\nThis OTP will expire in 10 minutes."
    
    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,  # Ensure this is set in settings.py
        [email],
        fail_silently=False,
    )
    
    return otp


def login_view(request):
    """Template-based login view."""
    if request.user.is_authenticated:
        return redirect('home')
    if request.method == 'POST':
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
    fields = ['name', 'relation_type', 'emotion_model', 'voice_model'
    ]
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
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        email = request.data.get("email")

        if not email:
            return Response({"error": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)

        # Generate and send OTP
        otp = send_otp_email(email)

        # Store OTP in cache for 10 minutes
        cache.set(f"otp_{email}", otp, timeout=600)

        return Response({
            "message": "OTP sent to email. Please verify before completing registration."
        }, status=status.HTTP_200_OK) # Anyone can register

from rest_framework.views import APIView
from django.core.cache import cache
class VerifyOtpView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        otp = request.data.get("otp")

        stored_otp = cache.get(f"otp_{email}")
        if stored_otp is None:
            return Response({"error": "OTP expired or invalid."}, status=status.HTTP_400_BAD_REQUEST)

        if stored_otp != otp:
            return Response({"error": "Incorrect OTP."}, status=status.HTTP_400_BAD_REQUEST)

        # OTP is correct → Proceed with user creation
        serializer = UserRegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        cache.delete(f"otp_{email}")  # Clean up

        return Response({"message": "Email verified & user registered successfully."})


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

class StartCharacterCallView(APIView):
    """API Endpoint to prepare a call with a specific character (by character id)."""
    permission_classes = [IsAuthenticated]
    def post(self, request, character_id):
        character = get_object_or_404(Character, pk=character_id, user=request.user)
        # Optionally, persist preferences or log an intent here
        call_type = request.data.get('call_type')
        mood = request.data.get('mood')
        topic = request.data.get('topic')
        additional_details = request.data.get('additional_details')
        language = request.data.get('language')
        return Response({
            'message': f"Preparing {call_type or 'chat'} with {character.name}",
            'character_id': character.id,
            'voice_model': character.voice_model,
            'emotion_model': character.emotion_model,
            'mood': mood,
            'topic': topic,
            'additional_details': additional_details,
            'language': language,
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

class GeminiChatStreamView(APIView):
    """Streaming chat endpoint backed by Gemini model.
    Expects JSON body with keys:
      - message (str) latest user message
      - relation_type (str)
      - mood (str) optional mood label
      - topic (str) optional topic
      - additional_details (str) optional extra context
      - nickname (str) optional user's nickname
      - history (list[{role, content}]) prior turns (role in {user, assistant})
    Returns SSE stream of words: lines formatted as 'data: <word>\n\n'
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if not getattr(settings, 'GEMINI_API_KEY', None):
            return Response({"error": "Gemini API key not configured"}, status=500)

        message = request.data.get('message', '').strip()
        relation_type = request.data.get('relation_type', 'Friend')
        mood = request.data.get('mood') or 'Neutral'
        topic = request.data.get('topic') or 'General conversation'
        additional_details = request.data.get('additional_details') or ''
        nickname = request.data.get('nickname') or request.user.first_name or request.user.username
        history = request.data.get('history') or []
        relation_id = request.data.get('relation_id')

        if not message:
            return Response({"error": "Message is required"}, status=400)

        # Build conversation context as plain text (Gemini also supports structured messages; keep simple here)
        system_preamble = (
            f"You are role-playing as the user's {relation_type}. "
            f"Speak lovingly and supportively, matching the emotional tone requested. "
            f"User mood: {mood}. Topic: {topic}. Nickname of user: {nickname}. "
            f"Additional context: {additional_details}. Do NOT break character; refer to the user by their nickname naturally." 
        )

        conversation_lines = [f"System: {system_preamble}"]
        for turn in history:
            r = turn.get('role')
            c = smart_str(turn.get('content', ''))
            if r == 'user':
                conversation_lines.append(f"User: {c}")
            elif r == 'assistant':
                conversation_lines.append(f"{relation_type}: {c}")
        conversation_lines.append(f"User: {message}")
        conversation_lines.append(f"{relation_type}:")
        prompt_text = "\n".join(conversation_lines)

        model_name = getattr(settings, 'GEMINI_MODEL_NAME', 'gemini-1.5-flash')

        # Streaming response for chat
        def stream_gen():
            try:
                model = genai.GenerativeModel(model_name)
                response = model.generate_content(prompt_text, stream=True)
                for chunk in response:
                    try:
                        text = getattr(chunk, 'text', '') or ''
                    except Exception:
                        text = ''
                    if not text:
                        continue
                    for word in text.split():
                        yield f"data: {word}\n\n".encode('utf-8')
                yield b"data: [END]\n\n"
            except Exception as e:
                err = f"data: Sorry, an internal error occurred: {str(e)[:120]}\n\n"
                yield err.encode('utf-8')

        # Generate summary at the end of chat using Gemini
        summary_prompt = prompt_text + "\n\nSummarize this chat in 2-3 sentences for record keeping."
        try:
            model = genai.GenerativeModel(model_name)
            summary_response = model.generate_content(summary_prompt)
            summary_text = getattr(summary_response, 'text', None)
            if not summary_text and hasattr(summary_response, 'candidates'):
                summary_text = summary_response.candidates[0].text if summary_response.candidates else ''
        except Exception:
            summary_text = ''

        # Save summary to ChatHistory
        if relation_id and summary_text:
            try:
                relation = Relation.objects.get(id=relation_id, user=request.user)
                ChatHistory.objects.create(
                    user=request.user,
                    relation=relation,
                    summary=summary_text
                )
            except Relation.DoesNotExist:
                pass

        return StreamingHttpResponse(stream_gen(), content_type='text/event-stream')

from .models import ChatHistory
from django.contrib.auth.decorators import login_required

@login_required
def chat_history_list(request):
    chat_histories = ChatHistory.objects.filter(user=request.user).select_related('relation').order_by('-timestamp')
    return render(request, 'mainapp/callhistory_list.html', {
        'chat_histories': chat_histories
    })

from django.views.decorators.http import require_POST
from django.http import JsonResponse
from .models import ChatHistory, Relation

@require_POST
@login_required
def add_chat_summary(request):
    summary = request.POST.get('summary')
    relation_id = request.POST.get('relation_id')
    if not summary or not relation_id:
        return JsonResponse({'error': 'Missing summary or relation_id.'}, status=400)
    try:
        relation = Relation.objects.get(id=relation_id, user=request.user)
    except Relation.DoesNotExist:
        return JsonResponse({'error': 'Relation not found.'}, status=404)
    chat_history = ChatHistory.objects.create(
        user=request.user,
        relation=relation,
        summary=summary
    )
    return JsonResponse({'success': True, 'chat_history_id': chat_history.id})
