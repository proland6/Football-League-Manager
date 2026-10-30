from rest_framework.routers import DefaultRouter

from .views import ChampionshipViewSet, TeamViewSet, PlayerViewSet, MatchViewSet, GoogleLoginView
from rest_framework_simplejwt.views import TokenRefreshView

from django.urls import path, include
router = DefaultRouter()

router.register("championships", ChampionshipViewSet)
router.register("teams", TeamViewSet)
router.register("players", PlayerViewSet)
router.register("matches", MatchViewSet)

urlpatterns = [
    path("", include(router.urls)),
    path("google-login", GoogleLoginView.as_view(), name="google-login"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
]

