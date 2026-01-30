from django.contrib import admin
from .models import Property

@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    list_display = ('title', 'owner', 'price', 'location', 'is_approved')
    list_filter = ('is_approved', 'location')
    search_fields = ('title', 'description', 'location')
    actions = ['approve_properties']

    def approve_properties(self, request, queryset):
        queryset.update(is_approved=True)
    approve_properties.short_description = "Approve selected properties"
