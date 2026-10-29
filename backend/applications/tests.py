from datetime import datetime, timezone as datetime_timezone
from unittest.mock import patch

from django.core.exceptions import ValidationError
from django.test import TestCase
from django.utils import timezone

from .models import Application


class ApplicationTests(TestCase):
    def test_save_and_retrieve_application(self):
        application = Application(
            company="Beispiel GmbH",
            position="Fachinformatiker Praktikum",
            location="Berlin",
            status=Application.Status.INTERVIEW,
            applied_on="2026-10-20",
            job_url="https://example.com/jobs/1",
            notes="Fiktive Bewerbung",
            next_action_on="2026-10-30",
        )
        application.full_clean()
        application.save()

        stored = Application.objects.get(pk=application.pk)
        for field in (
            "company", "position", "location", "status", "applied_on",
            "job_url", "notes", "next_action_on",
        ):
            self.assertEqual(getattr(stored, field), getattr(application, field))
        self.assertIsNotNone(stored.created_at)
        self.assertTrue(timezone.is_aware(stored.created_at))
        self.assertEqual(str(stored), "Beispiel GmbH – Fachinformatiker Praktikum")

    def test_optional_fields_can_be_empty(self):
        application = Application(company="Muster AG", position="Praktikum")
        application.full_clean()
        application.save()
        application.refresh_from_db()

        self.assertEqual(application.location, "")
        self.assertEqual(application.job_url, "")
        self.assertEqual(application.notes, "")
        self.assertIsNone(application.next_action_on)
        self.assertEqual(application.status, Application.Status.APPLIED)

    def test_model_validation_rejects_empty_required_fields(self):
        for field in ("company", "position"):
            with self.subTest(field=field):
                application = Application(company="Muster AG", position="Praktikum")
                setattr(application, field, "")
                with self.assertRaises(ValidationError) as error:
                    application.full_clean()
                self.assertIn(field, error.exception.message_dict)

    def test_model_validation_rejects_unknown_status(self):
        application = Application(
            company="Muster AG", position="Praktikum", status="unknown"
        )
        with self.assertRaises(ValidationError) as error:
            application.full_clean()
        self.assertIn("status", error.exception.message_dict)

    def test_default_date_uses_berlin_day_at_utc_midnight_boundary(self):
        instant = datetime(2026, 1, 1, 23, 30, tzinfo=datetime_timezone.utc)
        with timezone.override("Europe/Berlin"), patch(
            "django.utils.timezone.now", return_value=instant
        ):
            application = Application(company="Muster AG", position="Praktikum")
        self.assertEqual(application.applied_on.isoformat(), "2026-01-02")
