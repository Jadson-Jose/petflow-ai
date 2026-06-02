from django.db import models
import uuid
from django.db import models

class Tenant(models.Model):
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
    )
    
    name = models.CharField(max_length=255)
    
    slug = models.SlugField(
        unique=True,
        max_length=100,
    )
    
    is_active = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(
        auto_now_add=True,
    )
    
    updated_at = models.DateTimeField(
        auto_now=True,
    )
    
    class Meta:
        db_table = "tenants"
        
    def __str__(self) -> str:
        return self.name
