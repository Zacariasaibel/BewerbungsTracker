from datetime import timedelta

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from applications.models import Application


class Command(BaseCommand):
    help = "Create ten fictional demo applications without changing existing records."

    @transaction.atomic
    def handle(self, *args, **options):
        today = timezone.localdate()
        examples = [
            ("Nordlicht Demo GmbH", "Praktikum Anwendungsentwicklung", "Hamburg", "applied", -18, -3),
            ("Codegarten Demo AG", "Praktikum FIAE", "Berlin", "interview", -14, 0),
            ("Rheinwerk Demo IT", "Praktikum Webentwicklung", "Köln", "applied", -10, -1),
            ("Pixelhafen Demo GmbH", "Praktikum Frontend", "Bremen", "interview", -8, 2),
            ("Datenfuchs Demo GmbH", "Praktikum Python", "Leipzig", "applied", -6, 4),
            ("Wolkenbau Demo AG", "Praktikum Softwareentwicklung", "München", "accepted", -30, -2),
            ("Mainblick Demo IT", "Praktikum Backend", "Frankfurt", "rejected", -25, -5),
            ("Bitwiese Demo GmbH", "Praktikum Fullstack", "Remote", "applied", -3, 7),
            ("Spreecode Demo GmbH", "Praktikum Django", "Berlin", "interview", -12, 1),
            ("Tannenbyte Demo IT", "Praktikum Angular", "Stuttgart", "applied", -1, None),
        ]
        created_count = 0
        for company, position, location, status, applied_offset, followup_offset in examples:
            if Application.objects.filter(company=company, position=position).exists():
                continue
            application = Application(
                company=company,
                position=position,
                location=location,
                status=status,
                applied_on=today + timedelta(days=applied_offset),
                next_action_on=(
                    today + timedelta(days=followup_offset)
                    if followup_offset is not None else None
                ),
                job_url="https://example.com/jobs/demo",
                notes="Fiktive Demobewerbung. Kein echtes Unternehmen und keine echte Stellenanzeige.",
            )
            application.full_clean()
            application.save()
            created_count += 1
        self.stdout.write(self.style.SUCCESS(
            f"{created_count} Demobewerbungen erstellt. Vorhandene Einträge bleiben unverändert."
        ))
