# mainapp/views.py

from django.shortcuts import render, redirect, get_object_or_404
from django.urls import reverse_lazy
from django.contrib.auth.decorators import login_required
from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic import ListView, DetailView, CreateView, UpdateView, DeleteView
from rest_framework import viewsets
from rest_framework.authtoken.models import Token
from rest_framework.views import APIView
from rest_framework.response import Response
from google.oauth2 import id_token
from google.auth.transport import requests
from django.conf import settings
from .models import CustomUser

from .models import (
    CustomUser, Call, CallHistory, CallPreference, ChatPreference,
    Relation, Notification, PaymentDetail, PaymentHistory, Membership,
    ReferralProgram
)
from .serializers import (
    CustomUserSerializer, CallSerializer, CallHistorySerializer,
    CallPreferenceSerializer, ChatPreferenceSerializer, RelationSerializer,
    NotificationSerializer, PaymentDetailSerializer, PaymentHistorySerializer,
    MembershipSerializer, ReferralProgramSerializer
)

# --- NEW MULTI-PAGE FLOW VIEWS ---

@login_required
def home(request):
    """
    Page 1: Displays the banner and the grid of relations for the user to select.
    """
    relations = Relation.objects.filter(user=request.user)
    return render(request, 'mainapp/dashboard.html', {'relations': relations})

@login_required
def customize_call_view(request, relation_id):
    """
    Page 2: Displays the screen to customize call preferences for a selected relation.
    """
    relation = get_object_or_404(Relation, pk=relation_id, user=request.user)
    # This view now only renders the template. The form will submit to the chat view.
    return render(request, 'mainapp/customize_call.html', {'relation': relation})

@login_required
def chat_view(request, relation_id):
    """
    Page 3: Displays the chat interface and handles the streaming interaction.
    """
    relation = get_object_or_404(Relation, pk=relation_id, user=request.user)
    token, created = Token.objects.get_or_create(user=request.user)
    
    # Get initial data from the form submission on the customize_call page
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


# --- Original Views (can be kept for other purposes or admin) ---

def login_view(request):
    if request.user.is_authenticated:
        return redirect('home')
    return render(request, 'mainapp/login.html')

# --- Generic Class-Based Views for CRUD Operations (for admin/management) ---

# Relation Views
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

# Call History Views
class CallHistoryListView(LoginRequiredMixin, ListView):
    model = CallHistory
    template_name = 'mainapp/callhistory_list.html'
    context_object_name = 'call_histories'
    def get_queryset(self):
        return CallHistory.objects.filter(user=self.request.user)

class CallHistoryDetailView(LoginRequiredMixin, DetailView):
    model = CallHistory
    template_name = 'mainapp/callhistory_detail.html'

# Membership Views
class MembershipDetailView(LoginRequiredMixin, DetailView):
    model = Membership
    template_name = 'mainapp/membership_detail.html'
    def get_object(self):
        # Use filter and first to avoid error if no membership exists
        return Membership.objects.filter(user=self.request.user).first()

class MembershipUpdateView(LoginRequiredMixin, UpdateView):
    model = Membership
    fields = ['plan']
    template_name = 'mainapp/membership_form.html'
    success_url = reverse_lazy('membership-detail')
    def get_object(self):
        return Membership.objects.get(user=self.request.user)


# --- API Views (No changes needed here) ---

class UserViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer

class CallViewSet(viewsets.ModelViewSet):
    queryset = Call.objects.all()
    serializer_class = CallSerializer

# ... (other viewsets remain the same)


class GoogleLoginView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        """
            {
                "id_token":"'My-fake-token'",
                "username": "email@gmail.com",
                "first_name": "'testname'",
                "last_name": "'family_name'"
            }
        """
        google_token = request.data.get('id_token')
        if not google_token:
            return Response({'error': 'ID token is required'}, status=400)

        try:
            # Verify the token with Google
            idinfo = id_token.verify_oauth2_token(google_token, requests.Request(), settings.SOCIAL_AUTH_GOOGLE_OAUTH2_KEY)

            # Get or create the user
            email = idinfo['email']
            user, created = CustomUser.objects.get_or_create(
                email=email,
                defaults={
                    'username': email,
                    'first_name': idinfo.get('given_name', ''),
                    'last_name': idinfo.get('family_name', ''),
                }
            )

            # Get the Django REST Framework token
            drf_token, _ = Token.objects.get_or_create(user=user)

            return Response({
                'token': drf_token.key,
                'user_id': user.id,
                'email': user.email,
            })

        except ValueError:
            # Invalid token
            return Response({'error': 'Invalid Google token'}, status=400)