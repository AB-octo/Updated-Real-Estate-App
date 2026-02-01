from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Property, PropertyImage

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password')

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password']
        )
        return user

class PropertyImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertyImage
        fields = ('id', 'image')

class PropertySerializer(serializers.ModelSerializer):
    owner = serializers.ReadOnlyField(source='owner.username')
    images = PropertyImageSerializer(many=True, read_only=True)

    class Meta:
        model = Property
        fields = ('id', 'owner', 'title', 'description', 'price', 'location', 'latitude', 'longitude', 'image', 'images', 'is_approved', 'created_at', 'updated_at')
        read_only_fields = ('is_approved', 'created_at', 'updated_at', 'owner')
