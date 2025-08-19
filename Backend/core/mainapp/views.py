# mainapp/views.py

# --- Django and Python Imports ---
from django.conf import settings
from django.contrib.auth import authenticate, login
from django.contrib.auth.decorators import login_required
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth.views import LogoutView as TemplateLogoutView
from django.core.cache import cache
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
from rest_framework.decorators import api_view, permission_classes

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

def send_otp_email(email, purpose="registration"):
    """Generate a 6-digit OTP and send it to the given email."""
    otp = str(random.randint(100000, 999999)) 
    
    if purpose == "registration":
        subject = "Your EmoFelix OTP – A Gentle Step to Get You Started"
        message = f"Hello Friend 💙,\nYour one-time password (OTP) for email verification is: {otp} \nThis OTP will stay valid for the next 10 minutes. Please enter it soon to continue your journey with EmoFelix.\nAt EmoFelix, we’re here to be your safe space — caring, supportive, and always by your side. \nWith warmth,\nThe EmoFelix Team"
    elif purpose == "password_reset":
        subject = "Password Reset OTP - EmoFelix"
        message = f"Hello,\n\nWe received a request to reset your password for your EmoFelix account.\n\nYour password reset OTP is: {otp}\n\nThis OTP will expire in 10 minutes. If you didn't request this password reset, please ignore this email.\n\nBest regards,\nThe EmoFelix Team"
    else:
        subject = "OTP Verification"
        message = f"Your OTP is: {otp}\nThis OTP will expire in 10 minutes."
    
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

@api_view(['POST'])
@permission_classes([AllowAny])
def send_otp_view(request):
    email = request.data.get("email")
    if not email:
        return Response({"error": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)

    otp = send_otp_email(email)
    # Store OTP in cache for 10 minutes
    cache.set(f"otp_{email}", otp, timeout=600)

    return Response({
        "message": "OTP sent to email. Please verify before completing registration."
    }, status=status.HTTP_200_OK)

class ApiRegisterView(generics.CreateAPIView):
    """API Endpoint for standard email & password registration."""
    queryset = CustomUser.objects.all()
    serializer_class = UserRegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        email = request.data.get("email")
        user_otp = request.data.get("otp")
        
        if not email:
            return Response({"error": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        if not user_otp:
            return Response({"error": "OTP is required"}, status=status.HTTP_400_BAD_REQUEST)

        generated_otp = cache.get(f"otp_{email}")
        if not generated_otp:
            return Response({"error": "OTP Expired"}, status=status.HTTP_410_GONE)

        if user_otp != generated_otp:
            return Response({"error": "Invalid OTP"}, status=status.HTTP_400_BAD_REQUEST)

        # OTP is valid, now create the user
        response = super().create(request, *args, **kwargs)
        
        # Clear OTP from cache
        cache.delete(f"otp_{email}")
        
        return Response({
            "message": "OTP verified successfully. User registered."
        }, status=status.HTTP_201_CREATED) # Anyone can register

from rest_framework.views import APIView
from django.core.cache import cache

class ApiLoginView(ObtainAuthToken):
    """API Endpoint for standard email & password login. Returns auth token."""
    permission_classes = [AllowAny]
    def post(self, request, *args, **kwargs):
        # Use email for the username field in authentication
        request.data['username'] = request.data.get('email')
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        
        # Check if user has accepted terms and conditions
        if not user.terms_accepted:
            return Response({
                'error': 'You must accept the current Terms and Conditions to continue',
                'requires_terms_acceptance': True,
                'user_id': user.id
            }, status=status.HTTP_403_FORBIDDEN)
        
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
        terms_accepted = request.data.get('terms_accepted', False)
        
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
                    'emocoins': 15  # Default to 15 emocoins
                }
            )
            
            # For users who accepted terms in this request, update their acceptance status
            if terms_accepted:
                from django.utils import timezone
                user.terms_accepted = True
                user.terms_accepted_at = timezone.now()
                user.save()
            
            # Always allow login, but let frontend know if terms need to be accepted
            drf_token, _ = Token.objects.get_or_create(user=user)
            response_data = {
                'token': drf_token.key,
                'user_id': user.id,
                'email': user.email,
            }
            
            # Add terms acceptance requirement flag if needed
            if not user.terms_accepted:
                response_data['requires_terms_acceptance'] = True
                
            return Response(response_data)
        except ValueError:
            return Response({'error': 'Invalid Google token'}, status=status.HTTP_400_BAD_REQUEST)

class AcceptTermsView(APIView):
    """API Endpoint for authenticated users to accept terms and conditions."""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        terms_accepted = request.data.get('terms_accepted', False)
        
        if not terms_accepted:
            return Response({'error': 'You must accept the Terms and Conditions'}, status=status.HTTP_400_BAD_REQUEST)
        
        user = request.user
        from django.utils import timezone
        user.terms_accepted = True
        user.terms_accepted_at = timezone.now()
        user.save()
        
        return Response({
            'message': 'Terms accepted successfully',
            'terms_accepted': True
        })
    
    def post(self, request):
        user = request.user
        terms_accepted = request.data.get('terms_accepted', False)
        
        if not terms_accepted:
            return Response({
                'error': 'You must accept the Terms and Conditions'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        from django.utils import timezone
        user.terms_accepted = True
        user.terms_accepted_at = timezone.now()
        user.save()
        
        return Response({
            'message': 'Terms and Conditions accepted successfully',
            'terms_accepted_at': user.terms_accepted_at
        })

class AcceptTermsForLoginView(APIView):
    """API Endpoint for users to accept terms and complete login."""
    permission_classes = [AllowAny]
    
    def post(self, request):
        user_id = request.data.get('user_id')
        terms_accepted = request.data.get('terms_accepted', False)
        
        if not user_id:
            return Response({'error': 'User ID is required'}, status=status.HTTP_400_BAD_REQUEST)
            
        if not terms_accepted:
            return Response({'error': 'You must accept the Terms and Conditions'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = CustomUser.objects.get(id=user_id)
            from django.utils import timezone
            user.terms_accepted = True
            user.terms_accepted_at = timezone.now()
            user.save()
            
            # Create or get token for login
            token, created = Token.objects.get_or_create(user=user)
            return Response({
                'message': 'Terms accepted successfully. Login completed.',
                'token': token.key,
                'user_id': user.pk,
                'email': user.email
            })
        except CustomUser.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

class ForgotPasswordView(APIView):
    """Send password reset OTP to user's email."""
    permission_classes = [AllowAny]
    
    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({"error": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = CustomUser.objects.get(email=email)
            # Generate OTP and send email
            otp = send_otp_email(email, purpose="password_reset")
            # Store OTP in cache for 10 minutes
            cache.set(f"reset_otp_{email}", otp, timeout=600)
            
            return Response({
                "message": "If an account with this email exists, a password reset OTP has been sent."
            }, status=status.HTTP_200_OK)
        except CustomUser.DoesNotExist:
            # Don't reveal if email exists or not for security
            return Response({
                "message": "If an account with this email exists, a password reset OTP has been sent."
            }, status=status.HTTP_200_OK)

class ResetPasswordView(APIView):
    """Reset password using OTP verification."""
    permission_classes = [AllowAny]
    
    def post(self, request):
        email = request.data.get('email')
        otp = request.data.get('otp')
        new_password = request.data.get('new_password')
        
        if not email or not otp or not new_password:
            return Response({
                "error": "Email, OTP and new password are required"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Verify OTP
        stored_otp = cache.get(f"reset_otp_{email}")
        if not stored_otp:
            return Response({"error": "OTP expired or invalid"}, status=status.HTTP_400_BAD_REQUEST)
        
        if otp != stored_otp:
            return Response({"error": "Invalid OTP"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = CustomUser.objects.get(email=email)
            user.set_password(new_password)
            user.save()
            
            # Clear OTP from cache
            cache.delete(f"reset_otp_{email}")
            
            return Response({
                "message": "Password has been reset successfully"
            }, status=status.HTTP_200_OK)
        except CustomUser.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

# --- API Data Endpoints ---

class ProfileView(generics.RetrieveUpdateAPIView):
    """API Endpoint for getting and updating user profile."""
    permission_classes = [IsAuthenticated]
    serializer_class = ProfileSerializer
    def get_object(self):
        return self.request.user

class ChangePasswordView(APIView):
    """API Endpoint for changing user password."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        current_password = request.data.get('current_password')
        new_password = request.data.get('new_password')

        if not current_password or not new_password:
            return Response(
                {'error': 'Both current password and new password are required.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        

        # Verify current password
        if not request.user.check_password(current_password):
            return Response(
                {'error': 'Current password is incorrect.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate new password length
        if len(new_password) < 6:
            return Response(
                {'error': 'New password must be at least 6 characters long.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Set new password
        request.user.set_password(new_password)
        request.user.save()

        return Response(
            {'message': 'Password changed successfully.'}, 
            status=status.HTTP_200_OK
        )

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

class CreateCustomCharacterView(APIView):
    """API Endpoint to create custom characters for 10 emocoins."""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = CustomCharacterSerializer(data=request.data, context={'request': request})
        
        if not serializer.is_valid():
            return Response({"errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check emocoins again before creating (double-check for race conditions)
        user = request.user
        if user.emocoins < 10:
            return Response({
                "error": f"Insufficient emocoins. You need 10 emocoins to create a custom character. You have {user.emocoins} emocoins."
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Deduct emocoins and create character
        user.emocoins -= 10
        user.save()
        
        character = serializer.save(user=user)
        
        return Response({
            "message": "Custom character created successfully!",
            "character": CharacterSerializer(character).data,
            "remaining_emocoins": user.emocoins
        }, status=status.HTTP_201_CREATED)

class GetCustomCharacterOptionsView(APIView):
    """API Endpoint to get available options for creating custom characters."""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        available_types = [
            {"value": choice[0], "label": choice[1]} 
            for choice in Character.CHARACTER_TYPES 
        ]
        
        return Response({
            "character_types": available_types,
            "emotion_models": [
                "Caring", "Supportive", "Cheerful", "Calm", "Energetic", 
                "Wise", "Playful", "Protective", "Understanding", "Loving"
            ],
            "voice_models": [
                "Warm", "Gentle", "Strong", "Soft", "Deep", 
                "Light", "Melodic", "Soothing", "Confident", "Tender"
            ],
            "cost": 10,
            "user_emocoins": request.user.emocoins,
            "can_create": request.user.emocoins >= 10 and len(available_types) > 0
        }, status=status.HTTP_200_OK)

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
        nickname = Character.objects.filter(user=request.user, character_type=relation_type).first()
        if nickname:
            nickname = nickname.nickname or request.user.first_name or request.user.username
        else:
            nickname = request.user.first_name or request.user.username
        history = request.data.get('history') or []
        relation_id = request.data.get('relation_id')

        if not message:
            return Response({"error": "Message is required"}, status=400)

        # Build conversation context as plain text (Gemini also supports structured messages; keep simple here)
        system_preamble = (
            f"You are role-playing as the user's {relation_type}. Call him as {nickname}. "
            f"Speak lovingly and supportively, matching the emotional tone requested. "
            f"User mood: {mood}. Topic: {topic}. Nickname of user: {nickname}. "
            f"Additional context: {additional_details}. Do NOT break character; refer to the user by their nickname naturally. Talk more naturally like human. Don't get too formal and use big sentences like AI Chatbots. Keep it short and simple. Don't be extra energized or excited, just be normal and calm. Don't be poetic. Don't beat about the bush."
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


# -------------------------------
# Tasks and Rewards API Views
# -------------------------------
class TaskListView(generics.ListAPIView):
    """List all available tasks for earning emocoins."""
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Task.objects.filter(is_active=True)
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        
        # Add completion status for each task
        user_completed_tasks = UserTask.objects.filter(user=request.user).values_list('task_id', flat=True)
        
        tasks_data = []
        for task_data in serializer.data:
            task_id = task_data['id']
            completion_count = UserTask.objects.filter(user=request.user, task_id=task_id).count()
            max_completions = task_data['max_completions_per_user']
            
            task_data['is_completed'] = task_id in user_completed_tasks
            task_data['completion_count'] = completion_count
            task_data['can_complete'] = completion_count < max_completions
            tasks_data.append(task_data)
        
        return Response(tasks_data)


class UserTaskListView(generics.ListAPIView):
    """List user's completed tasks."""
    serializer_class = UserTaskSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return UserTask.objects.filter(user=self.request.user).order_by('-completed_at')


class CompleteTaskView(APIView):
    """Complete a specific task and award emocoins."""
    permission_classes = [IsAuthenticated]
    
    def post(self, request, task_id):
        try:
            task = Task.objects.get(id=task_id, is_active=True)
        except Task.DoesNotExist:
            return Response({"error": "Task not found or inactive."}, status=404)
        
        # Check if user can complete this task
        completion_count = UserTask.objects.filter(user=request.user, task=task).count()
        if completion_count >= task.max_completions_per_user:
            return Response({"error": "Task already completed maximum times."}, status=400)
        
        # Handle different task types
        if task.task_type == 'REVIEW':
            # For review tasks, we handle completion in the review submission
            return Response({"error": "Review task must be completed through review submission."}, status=400)
        elif task.task_type == 'REFERRAL':
            # Check if user has successful referrals
            referral_count = UserReferral.objects.filter(referrer=request.user).count()
            if referral_count == 0:
                return Response({"error": "No referrals found. Share your referral code first."}, status=400)
        
        # Create task completion record
        user_task = UserTask.objects.create(user=request.user, task=task)
        
        # Award emocoins
        request.user.emocoins += task.reward_emocoins
        request.user.save()
        
        return Response({
            "message": f"Task completed! You earned {task.reward_emocoins} emocoins.",
            "emocoins_earned": task.reward_emocoins,
            "total_emocoins": request.user.emocoins
        })


# -------------------------------
# App Review API Views
# -------------------------------
class SubmitAppReviewView(APIView):
    """Submit app review and earn emocoins."""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        # Check if user has already submitted a review
        if AppReview.objects.filter(user=request.user).exists():
            return Response({"error": "You have already submitted a review."}, status=400)
        
        serializer = AppReviewSerializer(data=request.data)
        if serializer.is_valid():
            # Save the review
            review = serializer.save(user=request.user)
            
            # Find and complete the review task
            try:
                review_task = Task.objects.get(task_type='REVIEW', is_active=True)
                user_task, created = UserTask.objects.get_or_create(user=request.user, task=review_task)
                
                if created:
                    # Award emocoins
                    request.user.emocoins += review_task.reward_emocoins
                    request.user.save()
                    
                    # Mark review as rewarded
                    review.reward_given = True
                    review.save()
                    
                    return Response({
                        "message": f"Thank you for your review! You earned {review_task.reward_emocoins} emocoins.",
                        "emocoins_earned": review_task.reward_emocoins,
                        "total_emocoins": request.user.emocoins
                    }, status=201)
                else:
                    return Response({
                        "message": "Review submitted, but reward already claimed.",
                    }, status=201)
            except Task.DoesNotExist:
                return Response({
                    "message": "Review submitted successfully, but no reward task found."
                }, status=201)
        
        return Response(serializer.errors, status=400)


class AppReviewListView(generics.ListAPIView):
    """List user's submitted reviews."""
    serializer_class = AppReviewSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return AppReview.objects.filter(user=self.request.user).order_by('-created_at')


# -------------------------------
# Referral System API Views
# -------------------------------
class GetMyReferralCodeView(APIView):
    """Get user's personal referral code for sharing."""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        # Generate referral code if doesn't exist
        referral_code = f"REF{user.id:06d}{user.username[:3].upper()}"
        
        # Get or create referral stats
        sent_referrals = UserReferral.objects.filter(referrer=user)
        total_referrals = sent_referrals.count()
        successful_referrals = sent_referrals.filter(referrer_reward_given=True).count()
        
        return Response({
            "referral_code": referral_code,
            "referral_url": f"https://emofelix.com/register?ref={referral_code}",
            "total_referrals": total_referrals,
            "successful_referrals": successful_referrals,
            "reward_per_referral": 10,  # 10 emocoins per successful referral
        })


class UseReferralCodeView(APIView):
    """Use a referral code during registration."""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        referral_code = request.data.get('referral_code', '').strip()
        
        if not referral_code:
            return Response({"error": "Referral code is required."}, status=400)
        
        # Check if user already used a referral code
        if UserReferral.objects.filter(referred_user=request.user).exists():
            return Response({"error": "You have already used a referral code."}, status=400)
        
        # Extract referrer ID from code (format: REF000001ABC)
        if not referral_code.startswith('REF') or len(referral_code) < 9:
            return Response({"error": "Invalid referral code format."}, status=400)
        
        try:
            referrer_id = int(referral_code[3:9])
            referrer = CustomUser.objects.get(id=referrer_id)
        except (ValueError, CustomUser.DoesNotExist):
            return Response({"error": "Invalid referral code."}, status=400)
        
        if referrer == request.user:
            return Response({"error": "You cannot use your own referral code."}, status=400)
        
        # Create referral record
        user_referral = UserReferral.objects.create(
            referrer=referrer,
            referred_user=request.user,
            referral_code=referral_code
        )
        
        # Award emocoins to both users
        referrer.emocoins += user_referral.referrer_reward_emocoins
        referrer.save()
        user_referral.referrer_reward_given = True
        
        request.user.emocoins += user_referral.referred_reward_emocoins
        request.user.save()
        user_referral.referred_reward_given = True
        user_referral.save()
        
        return Response({
            "message": f"Referral code applied! You earned {user_referral.referred_reward_emocoins} emocoins.",
            "emocoins_earned": user_referral.referred_reward_emocoins,
            "total_emocoins": request.user.emocoins
        })


class RedeemReferralCodeView(APIView):
    """Redeem admin-created referral codes."""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        code = request.data.get('code', '').strip().upper()
        
        if not code:
            return Response({"error": "Referral code is required."}, status=400)
        
        try:
            referral_code = ReferralCode.objects.get(code=code, active=True)
        except ReferralCode.DoesNotExist:
            return Response({"error": "Invalid or inactive referral code."}, status=400)
        
        # Check if already redeemed by user
        if ReferralCodeRedemption.objects.filter(user=request.user, referral_code=referral_code).exists():
            return Response({"error": "You have already redeemed this code."}, status=400)
        
        # Check if code has reached max redemptions
        if referral_code.redeemed_count >= referral_code.max_redemptions:
            return Response({"error": "Referral code has been fully redeemed."}, status=400)
        
        # Create redemption record
        redemption = ReferralCodeRedemption.objects.create(
            user=request.user,
            referral_code=referral_code,
            credits_received=referral_code.credits
        )
        
        # Award credits to membership
        membership, created = Membership.objects.get_or_create(user=request.user)
        membership.credits += referral_code.credits
        membership.save()
        
        # Update referral code
        referral_code.redeemed_count += 1
        referral_code.save()
        
        return Response({
            "message": f"Referral code redeemed! You received {referral_code.credits} credits.",
            "credits_received": referral_code.credits,
            "total_credits": membership.credits
        })


class MyReferralsView(generics.ListAPIView):
    """List user's referral history."""
    serializer_class = UserReferralSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return UserReferral.objects.filter(referrer=self.request.user).order_by('-created_at')

def create_superuser(request):
    """Create a superuser account for admin access."""
    user = CustomUser.objects.create_superuser(
        username='emofelixadmin',
        email='admin@example.com',
        password='HopireEmofelix'
    )
    user.save()
    return redirect('/admin/')