from rest_framework import serializers

from .models import Application


class ApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Application
        fields = (
            "id", "company", "position", "location", "status", "applied_on",
            "job_url", "notes", "next_action_on", "created_at",
        )
        read_only_fields = ("id", "created_at")
