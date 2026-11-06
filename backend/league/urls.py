from rest_framework.routers import DefaultRouter

from .views import ChampionshipViewSet, TeamViewSet, PlayerViewSet, MatchViewSet, GoogleLoginView,LoginView
from .views import ChampionshipTableView, UserDetailView, RefereeMatchesView, UserRoleView
from rest_framework_simplejwt.views import TokenRefreshView

from django.urls import path, include
router = DefaultRouter()

router.register("championships", ChampionshipViewSet)
router.register("teams", TeamViewSet, basename="team")
router.register("players", PlayerViewSet, basename="player")
router.register("matches", MatchViewSet)

urlpatterns = [
    path("", include(router.urls)),
    path("google-login", GoogleLoginView.as_view(), name="google-login"),
    path("login/", LoginView.as_view(), name="login"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("championships/<int:championship_id>/table/", ChampionshipTableView.as_view(), name="championship-table"),
    path("users/<int:user_id>/", UserDetailView.as_view(), name="user-detail"),
    path("referee/matches/", RefereeMatchesView.as_view(), name="referee-matches"),
    path("user/role/", UserRoleView.as_view(), name="user-role"),
]

