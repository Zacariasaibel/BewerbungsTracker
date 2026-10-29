from django.db import models
from django.utils import timezone


class Application(models.Model):
    class Status(models.TextChoices):
        APPLIED = "applied", "Beworben"
        INTERVIEW = "interview", "Vorstellungsgespräch"
        REJECTED = "rejected", "Absage"
        ACCEPTED = "accepted", "Zusage"

    company = models.CharField("Unternehmen", max_length=200)
    position = models.CharField("Position", max_length=200)
    location = models.CharField("Standort", max_length=200, blank=True)
    status = models.CharField(
        "Status", max_length=20, choices=Status.choices, default=Status.APPLIED
    )
    applied_on = models.DateField("Bewerbungsdatum", default=timezone.localdate)
    job_url = models.URLField("Link", max_length=2000, blank=True)
    notes = models.TextField("Notizen", max_length=10000, blank=True)
    next_action_on = models.DateField("Nachfassdatum", blank=True, null=True)
    created_at = models.DateTimeField("Erstellt am", auto_now_add=True)

    class Meta:
        verbose_name = "Bewerbung"
        verbose_name_plural = "Bewerbungen"

    def __str__(self):
        return f"{self.company} – {self.position}"
