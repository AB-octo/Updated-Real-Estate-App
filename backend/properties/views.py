from rest_framework import viewsets, permissions, filters, generics
from django_filters.rest_framework import DjangoFilterBackend
from .models import Property
from .serializers import PropertySerializer, UserSerializer
from django.contrib.auth.models import User

class IsOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.owner == request.user

class PropertyViewSet(viewsets.ModelViewSet):
    serializer_class = PropertySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['location', 'price'] # Exact filtering
    search_fields = ['title', 'location', 'description'] # Text search

    def get_queryset(self):
        # Admin sees all
        if self.request.user.is_staff:
            return Property.objects.all()
        
        # Public users see approved only
        # User who owns it can see their own (even if unapproved? user list view might show it)
        # For simplicity:
        # If filtering for specific user, show theirs?
        # But for the main list, show approved.
        return Property.objects.filter(is_approved=True)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = UserSerializer
