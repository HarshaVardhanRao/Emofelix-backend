from django.core.management.base import BaseCommand
from mainapp.models import Task, ReferralCode

class Command(BaseCommand):
    help = 'Initialize tasks and referral codes for the emocoins system'

    def handle(self, *args, **options):
        # Create tasks
        tasks = [
            {
                'title': 'Review Our App',
                'description': 'Share your feedback about the app and help us improve! Tell us what you love and what could be better.',
                'task_type': 'REVIEW',
                'reward_emocoins': 5,
                'max_completions_per_user': 1,
                'is_active': True
            },
            {
                'title': 'Invite a Friend',
                'description': 'Share your referral code with friends and family. Both you and your friend will earn emocoins when they join!',
                'task_type': 'REFERRAL',
                'reward_emocoins': 10,
                'max_completions_per_user': 50,  # Allow multiple referrals
                'is_active': True
            },
            {
                'title': 'Complete Your Profile',
                'description': 'Add your personal information to make your experience more personalized.',
                'task_type': 'COMPLETE_PROFILE',
                'reward_emocoins': 3,
                'max_completions_per_user': 1,
                'is_active': True
            },
            {
                'title': 'Make Your First Call',
                'description': 'Connect with one of your loved ones and experience the magic of AI-powered emotional support.',
                'task_type': 'FIRST_CALL',
                'reward_emocoins': 8,
                'max_completions_per_user': 1,
                'is_active': True
            },
            {
                'title': 'Share on Social Media',
                'description': 'Spread the love! Share Emofelix on your social media and help others find emotional support.',
                'task_type': 'SOCIAL_SHARE',
                'reward_emocoins': 3,
                'max_completions_per_user': 3,  # Allow sharing on different platforms
                'is_active': True
            }
        ]

        created_tasks = 0
        for task_data in tasks:
            task, created = Task.objects.get_or_create(
                task_type=task_data['task_type'],
                defaults=task_data
            )
            if created:
                created_tasks += 1
                self.stdout.write(
                    self.style.SUCCESS(f'Created task: {task.title}')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'Task already exists: {task.title}')
                )

        # Create some referral codes
        referral_codes = [
            {
                'code': 'WELCOME2024',
                'credits': 10,
                'max_redemptions': 100,
                'active': True
            },
            {
                'code': 'NEWUSER50',
                'credits': 5,
                'max_redemptions': 50,
                'active': True
            },
            {
                'code': 'BETA100',
                'credits': 15,
                'max_redemptions': 100,
                'active': True
            }
        ]

        created_codes = 0
        for code_data in referral_codes:
            code, created = ReferralCode.objects.get_or_create(
                code=code_data['code'],
                defaults=code_data
            )
            if created:
                created_codes += 1
                self.stdout.write(
                    self.style.SUCCESS(f'Created referral code: {code.code}')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'Referral code already exists: {code.code}')
                )

        self.stdout.write(
            self.style.SUCCESS(
                f'\nInitialization complete!\n'
                f'Created {created_tasks} tasks and {created_codes} referral codes.'
            )
        )