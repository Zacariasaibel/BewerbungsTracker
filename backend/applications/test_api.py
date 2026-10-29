from django.urls import reverse
from rest_framework.test import APITestCase

from .models import Application


class ApplicationAPITests(APITestCase):
    def setUp(self):
        self.list_url = reverse("application-list")
        self.payload = {
            "company": "Beispiel GmbH",
            "position": "Praktikum FIAE",
            "location": "Berlin",
            "status": "interview",
            "applied_on": "2026-10-20",
            "job_url": "https://example.com/jobs/1",
            "notes": "Fiktive Bewerbung",
            "next_action_on": "2026-10-30",
        }

    def create_application(self):
        return Application.objects.create(**self.payload)

    def detail_url(self, pk):
        return reverse("application-detail", args=[pk])

    def test_empty_list_is_json_array(self):
        response = self.client.get(self.list_url, HTTP_ACCEPT="application/json")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), [])

    def test_list_order_and_retrieve(self):
        older = self.create_application()
        newer = self.create_application()
        newest = Application.objects.create(
            company="Muster AG", position="Praktikum", applied_on="2026-10-21"
        )
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            [item["id"] for item in response.json()], [newest.pk, newer.pk, older.pk]
        )
        response = self.client.get(self.detail_url(older.pk))
        self.assertEqual(response.status_code, 200)
        for field, value in self.payload.items():
            self.assertEqual(response.json()[field], value)

    def test_create_valid_application(self):
        response = self.client.post(self.list_url, self.payload, format="json")
        self.assertEqual(response.status_code, 201)
        stored = Application.objects.get(pk=response.json()["id"])
        self.assertEqual(stored.company, self.payload["company"])
        self.assertIn("created_at", response.json())

    def test_create_with_only_required_fields(self):
        response = self.client.post(
            self.list_url, {"company": "Muster AG", "position": "Praktikum"},
            format="json",
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json()["status"], "applied")
        self.assertEqual(response.json()["location"], "")
        self.assertEqual(response.json()["job_url"], "")
        self.assertEqual(response.json()["notes"], "")
        self.assertIsNone(response.json()["next_action_on"])

    def test_full_update(self):
        application = self.create_application()
        payload = {
            **self.payload, "company": "Neue Firma", "position": "Entwicklung",
            "location": "Hamburg", "status": "accepted", "notes": "Zusage",
            "applied_on": "2026-10-22", "job_url": "", "next_action_on": None,
        }
        response = self.client.put(self.detail_url(application.pk), payload, format="json")
        self.assertEqual(response.status_code, 200)
        stored = self.client.get(self.detail_url(application.pk)).json()
        for field, value in payload.items():
            self.assertEqual(stored[field], value)

    def test_partial_update(self):
        application = self.create_application()
        response = self.client.patch(
            self.detail_url(application.pk), {"status": "rejected"}, format="json"
        )
        self.assertEqual(response.status_code, 200)
        application.refresh_from_db()
        self.assertEqual(application.status, "rejected")
        self.assertEqual(application.company, self.payload["company"])

    def test_delete(self):
        application = self.create_application()
        response = self.client.delete(self.detail_url(application.pk))
        self.assertEqual(response.status_code, 204)
        self.assertEqual(response.content, b"")
        self.assertFalse(Application.objects.filter(pk=application.pk).exists())

    def test_invalid_creation_does_not_save(self):
        invalid_values = {
            "company": ["", "   ", "x" * 201, None],
            "position": ["", " \t ", "x" * 201, None],
            "location": ["x" * 201],
            "status": ["unknown", ""],
            "job_url": ["not-a-url", "https://example.com/" + "x" * 2000],
            "notes": ["x" * 10001],
            "applied_on": ["2026-02-30", "invalid"],
            "next_action_on": ["2026-13-01", "invalid"],
        }
        for field, values in invalid_values.items():
            for value in values:
                with self.subTest(field=field, value=str(value)[:30]):
                    response = self.client.post(
                        self.list_url, {**self.payload, field: value}, format="json"
                    )
                    self.assertEqual(response.status_code, 400)
                    self.assertIn(field, response.json())
                    self.assertEqual(Application.objects.count(), 0)
        for field in ("company", "position"):
            with self.subTest(missing=field):
                payload = self.payload.copy()
                del payload[field]
                response = self.client.post(self.list_url, payload, format="json")
                self.assertEqual(response.status_code, 400)
                self.assertIn(field, response.json())
                self.assertEqual(Application.objects.count(), 0)

    def test_invalid_updates_do_not_save_any_changes(self):
        application = self.create_application()
        url = self.detail_url(application.pk)
        before = self.client.get(url).json()
        for method, payload in (
            (self.client.put, {**self.payload, "company": "Changed", "status": "invalid"}),
            (self.client.patch, {"company": "Changed", "position": "   "}),
            (self.client.put, {"status": "accepted"}),
        ):
            with self.subTest(method=method.__name__):
                response = method(url, payload, format="json")
                self.assertEqual(response.status_code, 400)
                self.assertEqual(self.client.get(url).json(), before)

    def test_missing_identifier(self):
        url = self.detail_url(999999)
        for method in (self.client.get, self.client.put, self.client.patch, self.client.delete):
            with self.subTest(method=method.__name__):
                response = method(url, **(
                    {"data": self.payload, "format": "json"}
                    if method.__name__ in ("put", "patch") else {}
                ))
                self.assertEqual(response.status_code, 404)

    def test_read_only_fields_cannot_be_overwritten(self):
        forged = {"id": 999999, "created_at": "2000-01-01T00:00:00Z"}
        response = self.client.post(
            self.list_url, {**self.payload, **forged}, format="json"
        )
        self.assertEqual(response.status_code, 201)
        original = response.json()
        self.assertNotEqual(original["id"], forged["id"])
        self.assertNotEqual(original["created_at"][:10], "2000-01-01")
        url = self.detail_url(original["id"])
        for method, payload in (
            (self.client.put, {**self.payload, **forged}),
            (self.client.patch, forged),
        ):
            response = method(url, payload, format="json")
            self.assertEqual(response.status_code, 200)
            self.assertEqual(response.json()["id"], original["id"])
            self.assertEqual(response.json()["created_at"], original["created_at"])
        self.assertEqual(Application.objects.count(), 1)
