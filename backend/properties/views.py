from rest_framework import viewsets, permissions, filters, generics, response, views
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from .models import Property, PropertyImage
from .serializers import PropertySerializer, UserSerializer
from django.contrib.auth.models import User

class ProfileView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        return response.Response({
            'username': request.user.username,
            'email': request.user.email,
            'is_staff': request.user.is_staff
        })

class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to edit/delete it.
    Staff members can also edit/delete any object.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request
        if request.method in permissions.SAFE_METHODS:
            return True
        # Staff can do anything
        if request.user.is_staff:
            return True
        # Write permissions are only allowed to the owner
        return obj.owner == request.user

class PropertyViewSet(viewsets.ModelViewSet):
    serializer_class = PropertySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['location', 'price'] # Exact filtering
    search_fields = ['title', 'location', 'description'] # Text search

    def get_queryset(self):
        user = self.request.user
        
        # 1. Detail actions (approve/reject/update/delete) - allow staff and owners
        if self.detail:
            # Staff can access anything
            if user.is_staff:
                return Property.objects.all()
            # Owners can access their own properties
            if user.is_authenticated:
                return Property.objects.filter(owner=user) | Property.objects.filter(is_approved=True)
        
        # 2. Admin moderation view
        is_admin_view = self.request.query_params.get('admin', 'false').lower() == 'true'
        if is_admin_view and user.is_staff:
            return Property.objects.all()
            
        # 3. 'My Listings' view: show all properties owned by the user
        mine = self.request.query_params.get('mine', 'false').lower() == 'true'
        if mine and user.is_authenticated:
            return Property.objects.filter(owner=user)

        # 4. Public 'Properties' section: show ONLY approved properties
        return Property.objects.filter(is_approved=True)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def approve(self, request, pk=None):
        property_obj = self.get_object()
        property_obj.is_approved = True
        property_obj.save()
        return response.Response({'status': 'property approved'})

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def reject(self, request, pk=None):
        property_obj = self.get_object()
        property_obj.is_approved = False
        property_obj.save()
        return response.Response({'status': 'property rejected'})

    def perform_create(self, serializer):
        # Get all uploaded files
        images = self.request.FILES.getlist('images')
        
        # Backend validation: check if all files are images
        for img in images:
            if not img.content_type.startswith('image/'):
                from rest_framework.exceptions import ValidationError
                raise ValidationError(f"File {img.name} is not an image.")

        # Use the first image as the primary image if available
        primary_image = images[0] if images else None
        
        # New properties start as pending (is_approved=False)
        # They will only show in public list after admin approval
        property_obj = serializer.save(owner=self.request.user, image=primary_image, is_approved=False)
        
        # Save all images to the PropertyImage model
        for image in images:
            PropertyImage.objects.create(property=property_obj, image=image)

import requests
from django.conf import settings

def verify_recaptcha(token):
    secret_key = "6Ldk5VwsAAAAAMMoItxktZjHHsSxBjH3S6chvzNz"
    data = {
        'secret': secret_key,
        'response': token
    }
    r = requests.post('https://www.google.com/recaptcha/api/siteverify', data=data)
    result = r.json()
    return result.get('success', False)

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = UserSerializer

    def post(self, request, *args, **kwargs):
        captcha_token = request.data.get('captcha_token')
        if not captcha_token or not verify_recaptcha(captcha_token):
            return response.Response({'error': 'Invalid reCAPTCHA'}, status=400)
        return super().post(request, *args, **kwargs)

from rest_framework_simplejwt.views import TokenObtainPairView

class CustomTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        captcha_token = request.data.get('captcha_token')
        if not captcha_token or not verify_recaptcha(captcha_token):
            return response.Response({'error': 'Invalid reCAPTCHA'}, status=400)
        return super().post(request, *args, **kwargs)
