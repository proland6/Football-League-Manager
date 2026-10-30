from rest_framework.permissions import DjangoModelPermissions, SAFE_METHODS, BasePermission

class PublicReadDjangoModelPermisson(DjangoModelPermissions):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True

        return super().has_permission(request, view)



class TeamPermission(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True

        if request.user.is_superuser:
            return True

        if request.user.groups.filter(name="Team Leader").exists() and request.method in ["PATCH", "PUT"]:
            return True
        
        return False

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True

        if request.user.is_superuser:
            return True
        
        return False

class PlayerPermission(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True

        if request.user.is_superuser:
            return True

        if request.user.groups.filter(name="Team Leader").exists() and request.method in ["POST", "PATCH", "PUT", "DELETE"]:
            return True

        return False

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True

        if  request.user.is_superuser:
            return True

        if request.user.groups.filter(name="Team Leader").exists() and obj.team.leader == request.user:
            return True
        
        return False

class MatchPermission(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True

        if request.user.is_superuser:
            return True

        if request.user.groups.filter(name="Referee").exists() and request.method in ["PUT", "PATCH"]:
            return True
        
        return False

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True

        if request.user.is_superuser:
            return True

        if request.user.groups.filter(name="Referee").exists() and obj.referee == request.user:
            return True
        
        return False
