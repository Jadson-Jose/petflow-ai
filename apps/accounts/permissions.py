from rest_framework.permissions import BasePermission

from apps.accounts.models import UserRole


class IsOwner(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == UserRole.OWNER


class IsStaff(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == UserRole.STAFF


class IsViewer(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == UserRole.VIEWER


class IsOwnerOrStaff(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in (
            UserRole.OWNER,
            UserRole.STAFF,
        )


class IsTenantUser(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.tenant is not None
