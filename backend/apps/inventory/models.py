"""Modelos de Estoque: Categoria, Marca, Produto e Movimentação."""
from django.conf import settings
from django.db import models

from apps.core.managers import TenantManager
from apps.core.models import BaseModel


class Category(BaseModel):
    """Categoria de produtos (ex.: Ração, Brinquedo, Higiene)."""

    tenant = models.ForeignKey(
        "tenants.Tenant",
        on_delete=models.CASCADE,
        related_name="categories",
    )
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)

    objects = TenantManager()

    class Meta:
        db_table = "inventory_categories"
        ordering = ["name"]
        unique_together = [("tenant", "name")]

    def __str__(self):
        return self.name


class Brand(BaseModel):
    """Marca de produtos (ex.: Royal Canin, Pedigree)."""

    tenant = models.ForeignKey(
        "tenants.Tenant",
        on_delete=models.CASCADE,
        related_name="brands",
    )
    name = models.CharField(max_length=100)
    website = models.URLField(blank=True)

    objects = TenantManager()

    class Meta:
        db_table = "inventory_brands"
        ordering = ["name"]
        unique_together = [("tenant", "name")]

    def __str__(self):
        return self.name


class Product(BaseModel):
    """Produto no estoque."""

    tenant = models.ForeignKey(
        "tenants.Tenant",
        on_delete=models.CASCADE,
        related_name="products",
    )
    name = models.CharField(max_length=200)
    sku = models.CharField(max_length=50, blank=True)
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="products",
    )
    brand = models.ForeignKey(
        Brand,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="products",
    )
    quantity = models.PositiveIntegerField(default=0)
    minimum_stock = models.PositiveIntegerField(default=0)
    cost_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    sale_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    expiration_date = models.DateField(null=True, blank=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    objects = TenantManager()

    class Meta:
        db_table = "inventory_products"
        ordering = ["name"]
        indexes = [
            models.Index(fields=["tenant", "name"]),
            models.Index(fields=["tenant", "sku"]),
            models.Index(fields=["tenant", "is_active"]),
        ]

    def __str__(self):
        return self.name

    @property
    def is_low_stock(self):
        return self.quantity < self.minimum_stock


class InventoryMovement(BaseModel):
    """Registro de movimentação de estoque (auditoria)."""

    MOVEMENT_TYPES = [
        ("IN", "Entrada"),
        ("OUT", "Saída"),
        ("ADJ", "Ajuste"),
    ]

    tenant = models.ForeignKey(
        "tenants.Tenant",
        on_delete=models.CASCADE,
        related_name="inventory_movements",
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="movements",
    )
    movement_type = models.CharField(max_length=3, choices=MOVEMENT_TYPES)
    quantity = models.PositiveIntegerField()
    note = models.TextField(blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="inventory_movements",
    )

    objects = TenantManager()

    class Meta:
        db_table = "inventory_movements"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.get_movement_type_display()} {self.quantity} de {self.product.name}"
