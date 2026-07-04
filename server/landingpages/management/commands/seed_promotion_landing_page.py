"""
Idempotently create/update the "promotion" (bathroom remodel) ad landing page
and its sections. Safe to re-run: existing sections for this page are replaced
each time so the command is always the source of truth for its content.
"""
from django.core.management.base import BaseCommand
from django.db import transaction

from landingpages.models import LandingPage, LandingPageSection

SUBDOMAIN = 'promotion'
PHONE_NUMBER = '+19048661738'

# Rotating hero backdrop — real project photos, not stock. Auto-advances only
# (no swipe/arrows), so the exact order just needs visual variety.
HERO_IMAGES = [
    'https://tolatiles.com/media/gallery/2026/02/20250619_090843.webp',  # glass shower, gold fixtures
    'https://tolatiles.com/media/gallery/2026/02/20250619_090853.webp',  # matching soaking tub, same remodel
    'https://tolatiles.com/media/gallery/2026/02/20260205_102458.webp',  # patterned accent tile shower
    'https://tolatiles.com/media/gallery/2026/01/1000000917.webp',       # bold green tile shower w/ bench
]

SECTIONS = [
    {
        'section_type': 'hero',
        'config': {
            'headline': 'Transform Your Bathroom',
            'subheadline': "Custom tile showers, floors & full remodels — built by Jacksonville's trusted tile experts.",
            'media_type': 'image',
            'images': HERO_IMAGES,
            'show_google_rating': True,
            'show_lead_form': True,
            'lead_form': {
                'heading': 'Get Your Free Bathroom Quote',
                'button_label': 'Get My Free Quote',
                'success_message': "Thank you! We'll call you shortly to schedule your free bathroom quote.",
                'project_type': 'bathroom',
            },
        },
    },
    {
        'section_type': 'reviews',
        'config': {
            'heading': 'What Our Customers Say',
            'quotes': [
                {
                    'author': 'Garrett E.',
                    'rating': 5,
                    'text': (
                        "I had a really great experience with Tola Tiles... I'm really happy with "
                        "how everything turned out and would absolutely recommend Tola Tiles to "
                        "anyone looking for quality work and a team you can trust. I will be using "
                        "them going forward to redo all of my bathrooms."
                    ),
                },
                {
                    'author': 'Mark Stackhouse',
                    'rating': 5,
                    'text': (
                        "I can't say enough GREAT things about this company!! They came to the job "
                        "on time, explained the process... Meni took his time measuring and cutting "
                        "as needed. The job turned out FANTASTIC!!!! I would recommend this company "
                        "to anyone who needs or wants exceptional tile work done."
                    ),
                },
                {
                    'author': 'Andrew Grossman',
                    'rating': 5,
                    'text': (
                        "100/10!!!! We could not be more pleased with the work Tola Tiles did. They "
                        "were extremely professional and showed great care in installing our tile. "
                        "To add to it, they were very reasonable in pricing. We will be using Tola "
                        "for all future projects!"
                    ),
                },
            ],
        },
    },
    {
        'section_type': 'headline',
        'config': {
            'text': 'Licensed & Insured Bathroom Tile Experts',
            'subtext': 'Serving Jacksonville and the surrounding area with high-quality shower, floor, and full bathroom tile installations.',
        },
    },
    {
        'section_type': 'gallery',
        'config': {
            'heading': 'Recent Bathroom Projects',
            'gallery_category': 'shower',
        },
    },
    {
        'section_type': 'cta',
        'config': {
            'label': 'Ready to Remodel Your Bathroom?',
        },
    },
]


class Command(BaseCommand):
    help = 'Create or update the promotion.tolatiles.com bathroom remodel landing page and its sections.'

    @transaction.atomic
    def handle(self, *args, **options):
        landing_page, created = LandingPage.objects.update_or_create(
            subdomain=SUBDOMAIN,
            defaults={
                'name': 'Bathroom Remodel Promo',
                'status': 'published',
                'page_title': 'Bathroom Remodel & Tile Experts | Tola Tiles',
                'meta_title': 'Bathroom Tile Remodel | Free Quote | Tola Tiles',
                'meta_description': (
                    'Transform your bathroom with expert tile installation. Licensed, insured, '
                    'and trusted by Jacksonville homeowners. Get your free quote today.'
                ),
                'is_indexed': False,
                'phone_number': PHONE_NUMBER,
            },
        )

        landing_page.sections.all().delete()
        for order, section in enumerate(SECTIONS):
            LandingPageSection.objects.create(
                landing_page=landing_page,
                section_type=section['section_type'],
                order=order,
                is_enabled=True,
                config=section['config'],
            )

        verb = 'Created' if created else 'Updated'
        self.stdout.write(self.style.SUCCESS(
            f'{verb} landing page "{landing_page.name}" at {SUBDOMAIN}.tolatiles.com '
            f'with {len(SECTIONS)} sections.'
        ))
