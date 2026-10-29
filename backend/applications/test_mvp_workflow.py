from django.urls import reverse
from rest_framework.test import APITestCase


class MVPWorkflowTests(APITestCase):
    def test_create_retrieve_edit_list_and_delete_workflow(self):
        list_url = reverse("application-list")
        created = self.client.post(list_url, {
            "company": "Workflow Demo GmbH",
            "position": "Praktikum FIAE",
            "applied_on": "2026-10-29",
            "next_action_on": "2026-10-30",
        }, format="json")
        self.assertEqual(created.status_code, 201)
        detail_url = reverse("application-detail", args=[created.data["id"]])
        detail = self.client.get(detail_url)
        self.assertEqual(detail.status_code, 200)
        self.assertEqual(detail.data["company"], "Workflow Demo GmbH")
        updated = self.client.put(detail_url, {
            "company": "Workflow Demo GmbH",
            "position": "Praktikum Backend",
            "status": "interview",
            "applied_on": "2026-10-29",
            "location": "Berlin",
            "notes": "Fiktiver Test",
            "job_url": "https://example.com/jobs/1",
            "next_action_on": None,
        }, format="json")
        self.assertEqual(updated.status_code, 200)
        listed = self.client.get(list_url)
        self.assertEqual(listed.status_code, 200)
        self.assertEqual(len(listed.data), 1)
        self.assertEqual(listed.data[0]["status"], "interview")
        self.assertIsNone(listed.data[0]["next_action_on"])
        self.assertEqual(self.client.delete(detail_url).status_code, 204)
        self.assertEqual(self.client.get(list_url).data, [])
        self.assertEqual(self.client.get(detail_url).status_code, 404)
