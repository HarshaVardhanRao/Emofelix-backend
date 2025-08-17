from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import user_passes_test
from django.contrib import messages
from django.db.models import Q
from .models import CustomUser, Membership, ReferralCode
from .forms import StaffUserEditForm, CreditsAdjustForm, ReferralCodeForm, ReferralCodeUpdateForm

@user_passes_test(lambda u: u.is_staff)
def support_dashboard(request):
    return render(request, 'mainapp/support_dashboard.html')

@user_passes_test(lambda u: u.is_staff)
def user_list(request):
    users = CustomUser.objects.all()
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
        users = users.filter(username__icontains=search_query)
    if gender:
        users = users.filter(gender=gender)
    if date_joined_before:
        users = users.filter(date_joined__lte=date_joined_before)
    if date_joined_after:
        users = users.filter(date_joined__gte=date_joined_after)
    if new_or_existing == 'new':
        users = users.filter(date_joined__gte=timezone.now()-timezone.timedelta(days=7))
    elif new_or_existing == 'existing':
        users = users.filter(date_joined__lt=timezone.now()-timezone.timedelta(days=7))

    selected_users = request.POST.getlist('selected_users')
    if request.method == 'POST':
        credits = int(request.POST.get('credits', 0))
        if 'all' in selected_users:
            target_users = users
        else:
            target_users = users.filter(id__in=selected_users)
        for u in target_users:
            membership, _ = Membership.objects.get_or_create(user=u)
            membership.credits += credits
            membership.save()
        messages.success(request, 'Credits updated.')
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
