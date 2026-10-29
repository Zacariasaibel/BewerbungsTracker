from datetime import timedelta
from io import StringIO

from django.core.management import call_command
from django.test import TestCase
from django.utils import timezone

from .models import Application


class SeedDemoTests(TestCase):
    def test_seed_is_repeatable_and_preserves_existing_records(self):
        existing = Application.objects.create(company="Eigene Demo", position="Praktikum")
        call_command("seed_demo", stdout=StringIO())
        self.assertEqual(Application.objects.count(), 11)
        demo = Application.objects.get(company="Nordlicht Demo GmbH")
        demo.notes = "Eigene Notiz"
        demo.status = Application.Status.ACCEPTED
        demo.save()
        before = list(Application.objects.order_by("id").values())
        call_command("seed_demo", stdout=StringIO())
        self.assertEqual(list(Application.objects.order_by("id").values()), before)
        self.assertTrue(Application.objects.filter(pk=existing.pk).exists())

    def test_seed_has_all_statuses_and_due_today_future_and_empty_dates(self):
        call_command("seed_demo", stdout=StringIO())
        self.assertEqual(Application.objects.count(), 10)
        self.assertEqual(set(Application.objects.values_list("status", flat=True)), set(Application.Status.values))
        today = timezone.localdate()
        self.assertTrue(Application.objects.filter(next_action_on=today).exists())
        self.assertTrue(Application.objects.filter(next_action_on__lt=today).exists())
        self.assertTrue(Application.objects.filter(next_action_on__gt=today).exists())
        self.assertTrue(Application.objects.filter(next_action_on__isnull=True).exists())
        self.assertTrue(Application.objects.filter(applied_on=today - timedelta(days=1)).exists())
