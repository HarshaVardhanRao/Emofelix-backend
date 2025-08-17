from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import user_passes_test, login_required
from django.contrib.admin.views.decorators import staff_member_required
from django.contrib import messages
from django.db.models import Q, Sum, Count, Avg
from django.db import models
from django.utils import timezone
from django.http import HttpResponse, JsonResponse
from datetime import timedelta
import csv
import json
from .models import CustomUser, Membership, ReferralCode, Character, Call, CallHistory, Task, UserTask, AppReview, UserReferral
from .forms import StaffUserEditForm, CreditsAdjustForm, ReferralCodeForm, ReferralCodeUpdateForm

@user_passes_test(lambda u: u.is_staff)
def support_dashboard(request):
    # Calculate statistics for dashboard
    total_users = CustomUser.objects.count()
    active_codes = ReferralCode.objects.filter(active=True).count()
    total_redemptions = ReferralCode.objects.aggregate(Sum('redeemed_count'))['redeemed_count__sum'] or 0
    credits_distributed = ReferralCode.objects.aggregate(
        total=Sum('redeemed_count') * Sum('credits')
    )['total'] or 0
    new_users_week = CustomUser.objects.filter(
        date_joined__gte=timezone.now() - timedelta(days=7)
    ).count()
    
    context = {
        'total_users': total_users,
        'active_codes': active_codes,
        'credits_distributed': credits_distributed,
        'new_users_week': new_users_week,
    }
    return render(request, 'mainapp/support_dashboard.html', context)

@user_passes_test(lambda u: u.is_staff)
def user_list(request):
    users = CustomUser.objects.select_related('membership').all()
    return render(request, 'mainapp/user_list.html', {'users': users})

@user_passes_test(lambda u: u.is_staff)
def user_edit(request, user_id):
    user = get_object_or_404(CustomUser, pk=user_id)
    if request.method == 'POST':
        form = StaffUserEditForm(request.POST, instance=user)
        if form.is_valid():
            form.save()
            messages.success(request, 'User updated successfully.')
            return redirect('user-list')
    else:
        form = StaffUserEditForm(instance=user)
    return render(request, 'mainapp/user_edit.html', {'form': form, 'user': user})

@user_passes_test(lambda u: u.is_staff)
def credits_adjust(request):
    users = CustomUser.objects.all()
    search_query = request.GET.get('search', '')
    gender = request.GET.get('gender', '')
    date_joined_before = request.GET.get('date_joined_before', '')
    date_joined_after = request.GET.get('date_joined_after', '')
    new_or_existing = request.GET.get('new_or_existing', '')

    # Filtering logic
    if search_query:
        users = users.filter(
            Q(username__icontains=search_query) | 
            Q(email__icontains=search_query) |
            Q(first_name__icontains=search_query) |
            Q(last_name__icontains=search_query)
        )
    if gender:
        users = users.filter(gender=gender)
    if date_joined_before:
        users = users.filter(date_joined__lte=date_joined_before)
    if date_joined_after:
        users = users.filter(date_joined__gte=date_joined_after)
    if new_or_existing == 'new':
        users = users.filter(date_joined__gte=timezone.now()-timedelta(days=7))
    elif new_or_existing == 'existing':
        users = users.filter(date_joined__lt=timezone.now()-timedelta(days=7))

    selected_users = request.POST.getlist('selected_users')
    if request.method == 'POST':
        credits = int(request.POST.get('credits', 0))
        if 'all' in selected_users:
            target_users = users
        else:
            target_users = users.filter(id__in=selected_users)
        
        updated_count = 0
        for u in target_users:
            membership, _ = Membership.objects.get_or_create(user=u)
            membership.credits += credits
            membership.save()
            updated_count += 1
            
        messages.success(request, f'Credits {"added to" if credits > 0 else "subtracted from"} {updated_count} users.')
        return redirect('credits-adjust')
        
    return render(request, 'mainapp/credits_adjust.html', {
        'users': users,
        'search_query': search_query,
        'gender': gender,
        'date_joined_before': date_joined_before,
        'date_joined_after': date_joined_after,
        'new_or_existing': new_or_existing,
    })

@user_passes_test(lambda u: u.is_staff)
def referral_code_list(request):
    codes = ReferralCode.objects.all()
    return render(request, 'mainapp/referral_code_list.html', {'codes': codes})

@user_passes_test(lambda u: u.is_staff)
def referral_code_create(request):
    if request.method == 'POST':
        form = ReferralCodeForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, 'Referral code created.')
            return redirect('referral-code-list')
    else:
        form = ReferralCodeForm()
    return render(request, 'mainapp/referral_code_form.html', {'form': form})

@user_passes_test(lambda u: u.is_staff)
def referral_code_update(request, code_id):
    code = get_object_or_404(ReferralCode, pk=code_id)
    if request.method == 'POST':
        form = ReferralCodeUpdateForm(request.POST, instance=code)
        if form.is_valid():
            form.save()
            messages.success(request, 'Referral code updated.')
            return redirect('referral-code-list')
    else:
        form = ReferralCodeUpdateForm(instance=code)
    return render(request, 'mainapp/referral_code_form.html', {'form': form, 'code': code})


@user_passes_test(lambda u: u.is_staff)
def export_users_csv(request):
    """Export users data as CSV file."""
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="users_export.csv"'
    
    writer = csv.writer(response)
    writer.writerow([
        'ID', 'Username', 'Email', 'First Name', 'Last Name', 
        'Gender', 'Date of Birth', 'Date Joined', 'Last Login', 
        'Is Active', 'Is Staff', 'Emocoins', 'Credits', 
        'Characters Count', 'Calls Count'
    ])
    
    users = CustomUser.objects.select_related('membership').all()
    
    for user in users:
        # Get or create membership
        membership, _ = Membership.objects.get_or_create(user=user)
        
        writer.writerow([
            user.pk,
            user.username,
            user.email,
            user.first_name,
            user.last_name,
            user.gender or '',
            user.date_of_birth or '',
            user.date_joined.strftime('%Y-%m-%d %H:%M:%S'),
            user.last_login.strftime('%Y-%m-%d %H:%M:%S') if user.last_login else '',
            'Yes' if user.is_active else 'No',
            'Yes' if user.is_staff else 'No',
            user.emocoins,
            membership.credits,
            Character.objects.filter(user=user).count(),
            Call.objects.filter(user=user).count(),
        ])
    
    return response


@user_passes_test(lambda u: u.is_staff)
def export_users_json(request):
    """Export users data as JSON file."""
    users = CustomUser.objects.select_related('membership').all()
    
    users_data = []
    for user in users:
        membership, _ = Membership.objects.get_or_create(user=user)
        
        user_data = {
            'id': user.pk,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'gender': user.gender,
            'date_of_birth': user.date_of_birth.isoformat() if user.date_of_birth else None,
            'date_joined': user.date_joined.isoformat(),
            'last_login': user.last_login.isoformat() if user.last_login else None,
            'is_active': user.is_active,
            'is_staff': user.is_staff,
            'emocoins': user.emocoins,
            'credits': membership.credits,
            'characters_count': Character.objects.filter(user=user).count(),
            'calls_count': Call.objects.filter(user=user).count(),
        }
        users_data.append(user_data)
    
    response = HttpResponse(
        json.dumps(users_data, indent=2),
        content_type='application/json'
    )
    response['Content-Disposition'] = 'attachment; filename="users_export.json"'
    return response


@user_passes_test(lambda u: u.is_staff)
def generate_analytics_report(request):
    """Generate comprehensive analytics report."""
    # Date ranges
    today = timezone.now().date()
    week_ago = today - timedelta(days=7)
    month_ago = today - timedelta(days=30)
    year_ago = today - timedelta(days=365)
    
    # User Statistics
    total_users = CustomUser.objects.count()
    active_users = CustomUser.objects.filter(is_active=True).count()
    new_users_week = CustomUser.objects.filter(date_joined__gte=week_ago).count()
    new_users_month = CustomUser.objects.filter(date_joined__gte=month_ago).count()
    
    # Gender distribution
    gender_stats = CustomUser.objects.values('gender').annotate(count=Count('id')).order_by('gender')
    
    # Character Statistics
    total_characters = Character.objects.count()
    characters_by_type = Character.objects.values('character_type').annotate(
        count=Count('id')
    ).order_by('-count')
    
    # Call Statistics
    total_calls = Call.objects.count()
    calls_this_week = Call.objects.filter(timestamp__gte=week_ago).count()
    calls_this_month = Call.objects.filter(timestamp__gte=month_ago).count()
    
    # Referral Code Statistics
    total_referral_codes = ReferralCode.objects.count()
    active_referral_codes = ReferralCode.objects.filter(active=True).count()
    total_redemptions = ReferralCode.objects.aggregate(Sum('redeemed_count'))['redeemed_count__sum'] or 0
    
    # Credits Statistics
    total_credits_distributed = Membership.objects.aggregate(Sum('credits'))['credits__sum'] or 0
    avg_credits_per_user = Membership.objects.aggregate(Avg('credits'))['credits__avg'] or 0
    
    # Emocoins Statistics
    total_emocoins = CustomUser.objects.aggregate(Sum('emocoins'))['emocoins__sum'] or 0
    avg_emocoins_per_user = CustomUser.objects.aggregate(Avg('emocoins'))['emocoins__avg'] or 0
    
    # User engagement trends (last 30 days)
    user_registrations_trend = []
    max_registrations = 1  # minimum to avoid division by zero
    for i in range(30):
        date = today - timedelta(days=i)
        count = CustomUser.objects.filter(date_joined__date=date).count()
        user_registrations_trend.append({
            'date': date.isoformat(),
            'count': count
        })
        if count > max_registrations:
            max_registrations = count
    user_registrations_trend.reverse()
    
    # Add percentage calculations for chart display
    for day in user_registrations_trend:
        day['percentage'] = (day['count'] / max_registrations * 100) if max_registrations > 0 else 0
    
    # Calls trend (last 30 days)
    calls_trend = []
    max_calls = 1  # minimum to avoid division by zero
    for i in range(30):
        date = today - timedelta(days=i)
        count = Call.objects.filter(timestamp__date=date).count()
        calls_trend.append({
            'date': date.isoformat(),
            'count': count
        })
        if count > max_calls:
            max_calls = count
    calls_trend.reverse()
    
    # Add percentage calculations for chart display
    for day in calls_trend:
        day['percentage'] = (day['count'] / max_calls * 100) if max_calls > 0 else 0
    
    report_data = {
        'generated_at': timezone.now().isoformat(),
        'user_statistics': {
            'total_users': total_users,
            'active_users': active_users,
            'inactive_users': total_users - active_users,
            'new_users_this_week': new_users_week,
            'new_users_this_month': new_users_month,
            'gender_distribution': list(gender_stats),
        },
        'character_statistics': {
            'total_characters': total_characters,
            'characters_by_type': list(characters_by_type),
            'avg_characters_per_user': round(total_characters / total_users, 2) if total_users > 0 else 0,
        },
        'call_statistics': {
            'total_calls': total_calls,
            'calls_this_week': calls_this_week,
            'calls_this_month': calls_this_month,
            'avg_calls_per_user': round(total_calls / total_users, 2) if total_users > 0 else 0,
        },
        'referral_statistics': {
            'total_codes': total_referral_codes,
            'active_codes': active_referral_codes,
            'total_redemptions': total_redemptions,
            'avg_redemptions_per_code': round(total_redemptions / total_referral_codes, 2) if total_referral_codes > 0 else 0,
        },
        'credits_statistics': {
            'total_credits_distributed': total_credits_distributed,
            'avg_credits_per_user': round(avg_credits_per_user, 2),
        },
        'emocoins_statistics': {
            'total_emocoins': total_emocoins,
            'avg_emocoins_per_user': round(avg_emocoins_per_user, 2),
        },
        'trends': {
            'user_registrations': user_registrations_trend,
            'calls': calls_trend,
        }
    }
    
    if request.GET.get('format') == 'json':
        response = HttpResponse(
            json.dumps(report_data, indent=2),
            content_type='application/json'
        )
        response['Content-Disposition'] = 'attachment; filename="analytics_report.json"'
        return response
    else:
        return render(request, 'mainapp/analytics_report.html', {
            'report': report_data
        })


# Task Management Views
@login_required
@staff_member_required
def support_dashboard_tasks(request):
    """Display all tasks with completion statistics"""
    tasks = Task.objects.all().order_by('id')
    
    # Add completion statistics to each task
    task_stats = []
    for task in tasks:
        user_tasks = UserTask.objects.filter(task=task)
        completed_count = user_tasks.count()  # All UserTask records represent completions
        total_attempts = completed_count  # Same as completed count since we only create records on completion
        
        task_stats.append({
            'task': task,
            'completed_count': completed_count,
            'total_attempts': total_attempts,
            'completion_rate': 100 if total_attempts > 0 else 0  # 100% since all records are completions
        })
    
    context = {
        'task_stats': task_stats,
        'total_tasks': tasks.count(),
        'active_tasks': tasks.filter(is_active=True).count()
    }
    
    return render(request, 'mainapp/support_dashboard_tasks.html', context)


@login_required
@staff_member_required
def support_dashboard_task_detail(request, task_id):
    """View detailed information about a specific task"""
    task = get_object_or_404(Task, id=task_id)
    user_tasks = UserTask.objects.filter(task=task).select_related('user').order_by('-completed_at')
    
    # Statistics
    completed_count = user_tasks.count()  # All UserTask records represent completions
    total_attempts = completed_count  # Same as completed count
    completion_rate = 100 if total_attempts > 0 else 0  # 100% since all records are completions
    
    # Recent completions
    recent_completions = user_tasks.order_by('-completed_at')[:10]
    
    # Calculate total rewards given
    total_rewards = completed_count * task.reward_emocoins
    
    context = {
        'task': task,
        'user_tasks': user_tasks[:20],  # Latest 20 attempts
        'completed_count': completed_count,
        'total_attempts': total_attempts,
        'completion_rate': completion_rate,
        'total_rewards': total_rewards,
        'recent_completions': recent_completions
    }
    
    return render(request, 'mainapp/support_dashboard_task_detail.html', context)


@login_required
@staff_member_required
def support_dashboard_app_reviews(request):
    """Display all app reviews"""
    reviews = AppReview.objects.select_related('user').order_by('-created_at')
    
    # Statistics
    total_reviews = reviews.count()
    avg_rating = reviews.aggregate(avg_rating=models.Avg('rating'))['avg_rating'] or 0
    rating_distribution = {}
    
    for i in range(1, 6):
        count = reviews.filter(rating=i).count()
        percentage = (count * 100 / total_reviews) if total_reviews > 0 else 0
        rating_distribution[i] = {
            'count': count,
            'percentage': percentage
        }
    
    context = {
        'reviews': reviews[:50],  # Latest 50 reviews
        'total_reviews': total_reviews,
        'avg_rating': round(avg_rating, 1),
        'rating_distribution': rating_distribution
    }
    
    return render(request, 'mainapp/support_dashboard_app_reviews.html', context)


@login_required
@staff_member_required
def support_dashboard_user_referrals(request):
    """Display user referral statistics"""
    # Get all user referrals
    referrals = UserReferral.objects.select_related('referrer', 'referred_user').order_by('-created_at')
    
    # Statistics
    total_referrals = referrals.count()
    successful_referrals = referrals.filter(referred_user__isnull=False).count()  # All referrals with referred users
    
    # Count unique referrers (users who have referred others)
    unique_referrers = referrals.values('referrer').distinct().count()
    
    # Get top referrers by counting how many people they've referred
    from django.db.models import Count
    top_referrers = (referrals
                    .values('referrer__id', 'referrer__username')
                    .annotate(referral_count=Count('referred_user'))
                    .order_by('-referral_count')[:10])
    
    # Calculate success rate (all referrals are successful since they have referred_user)
    success_rate = 100.0 if total_referrals > 0 else 0
    
    context = {
        'referrals': referrals[:50],  # Latest 50 referrals
        'total_referrals': total_referrals,
        'successful_referrals': successful_referrals,
        'unique_referrers': unique_referrers,
        'success_rate': success_rate,
        'top_referrers': top_referrers
    }
    
    return render(request, 'mainapp/support_dashboard_user_referrals.html', context)


@login_required
@staff_member_required
def support_dashboard_task_toggle(request, task_id):
    """Toggle task active status"""
    if request.method == 'POST':
        task = get_object_or_404(Task, id=task_id)
        task.is_active = not task.is_active
        task.save()
        
        messages.success(request, f'Task "{task.title}" {"activated" if task.is_active else "deactivated"}')
    
    return redirect('support-dashboard-tasks')
