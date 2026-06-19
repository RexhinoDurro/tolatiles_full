from django.core.management.base import BaseCommand
from quotes.models import Customer, Deal, Quote


class Command(BaseCommand):
    help = 'Assign orphan quotes (deal=NULL) to new deals, one deal per customer'

    def handle(self, *args, **options):
        customers_with_orphans = Customer.objects.filter(
            quotes__deal__isnull=True
        ).distinct()

        total_deals = 0
        total_quotes = 0

        for customer in customers_with_orphans:
            orphan_quotes = Quote.objects.filter(customer=customer, deal__isnull=True)
            count = orphan_quotes.count()
            if count == 0:
                continue

            deal = Deal.objects.create(
                customer=customer,
                stage='new_deal',
                address=customer.address or '',
                job_type='other',
            )

            orphan_quotes.update(deal=deal)
            total_deals += 1
            total_quotes += count
            self.stdout.write(
                f'  Customer "{customer.name}": created deal #{deal.id}, linked {count} quote(s)'
            )

        self.stdout.write(self.style.SUCCESS(
            f'Done. Created {total_deals} deal(s), linked {total_quotes} quote(s).'
        ))
