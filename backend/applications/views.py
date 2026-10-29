from rest_framework.permissions import AllowAny
from rest_framework.viewsets import ModelViewSet

from .models import Application
from .serializers import ApplicationSerializer


class ApplicationViewSet(ModelViewSet):
    queryset = Application.objects.order_by("-applied_on", "-id")
    serializer_class = ApplicationSerializer
    pagination_class = None
    permission_classes = [AllowAny]
    authentication_classes = []
