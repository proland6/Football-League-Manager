#from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.permissions import DjangoModelPermissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from django.contrib.auth.models import User
from django.contrib.auth import authenticate

from .permissions import PublicReadDjangoModelPermisson, TeamPermission, PlayerPermission, MatchPermission
from .models import Championship, Match, Player, Team
from .serializers import ChampionshipSerializer, TeamSerializer, MatchSerializer, PlayerSerializer, ChampionshipTableSerializer

from django.conf import settings

from google.oauth2 import id_token
from google.auth.transport import requests

from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import AllowAny, IsAuthenticated


class ChampionshipViewSet(viewsets.ModelViewSet):
    queryset = Championship.objects.all()
    serializer_class = ChampionshipSerializer
    permission_classes = [PublicReadDjangoModelPermisson]

class TeamViewSet(viewsets.ModelViewSet):
    queryset = Team.objects.all()
    serializer_class = TeamSerializer
    permission_classes = [TeamPermission]

class PlayerViewSet(viewsets.ModelViewSet):
    queryset = Player.objects.all()
    serializer_class = PlayerSerializer
    permission_classes = [PlayerPermission]

class MatchViewSet(viewsets.ModelViewSet):
    queryset = Match.objects.all()
    serializer_class = MatchSerializer
    permission_classes = [MatchPermission]

class GoogleLoginView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        credential = request.data.get("credential")

        if not credential:
            return Response(
                {"error": "Google credential is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            id_info = id_token.verify_oauth2_token(
                credential,
                requests.Request(),
                settings.GOOGLE_CLIENT_ID,
            )

        except ValueError:
            return Response(
                {
                    "error": "Invalid Google credential"
                }, 
                status=status.HTTP_401_UNAUTHORIZED,
            )

        email = id_info.get("email")
        email_verified = id_info.get("email_verified")

        if not email or not email_verified:
            return Response(
                {
                    "error": "Google email is not verified."
                },
                status=status.HTTP_401_UNAUTHORIZED,
            )

        try:
            user = User.objects.get(email=email)

        except User.DoesNotExist:
            return Response(
                {
                    "error": "User with this email does not exist."
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "refresh": str(refresh),
                "access": str(refresh.access_token)
            },
            status=status.HTTP_200_OK,
        )

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")

        if not email or not password:
            return Response(
                {"error": "Email and password are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {"error": "Invalid email or password."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        authenticated_user = authenticate(
            request,
            username=user.username,
            password=password
        )

        if authenticated_user is None:
            return Response(
                {"error": "Invalid email or password."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        refresh = RefreshToken.for_user(authenticated_user)

        return Response(
            {
                "refresh": str(refresh),
                "access": str(refresh.access_token)
            },
            status=status.HTTP_200_OK
        )

class ChampionshipTableView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, championship_id):

        try:
            championship = Championship.objects.get(id=championship_id)
        except Championship.DoesNotExist:
            return Response(
                {"error": "Championship not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        teams = championship.team_set.all()

        matches = Match.objects.filter(
            championship=championship,
            status=Match.Status.FINISHED
        )

        table = []

        for team in teams:

            played = 0
            wins = 0
            draws = 0
            losses = 0
            goals_for = 0
            goals_against = 0

            for match in matches:

                if match.home_team_id == team.id:
                    goals_for += match.home_score
                    goals_against += match.away_score
                    played += 1

                    if match.home_score > match.away_score:
                        wins += 1
                    elif match.home_score == match.away_score:
                        draws += 1
                    else:
                        losses += 1

                elif match.away_team_id == team.id:
                    goals_for += match.away_score
                    goals_against += match.home_score
                    played += 1

                    if match.away_score > match.home_score:
                        wins += 1
                    elif match.away_score == match.home_score:
                        draws += 1
                    else:
                        losses += 1

            goal_difference = goals_for - goals_against
            points = wins * 3 + draws

            table.append({
                "team_id": team.id,
                "team_name": team.name,
                "played": played,
                "wins": wins,
                "draws": draws,
                "losses": losses,
                "goals_for": goals_for,
                "goals_against": goals_against,
                "goal_difference": goal_difference,
                "points": points
            })

        table.sort(
            key=lambda team: (
                team["points"],
                team["goal_difference"],
                team["goals_for"]
            ),
            reverse=True
        )

        serializer = ChampionshipTableSerializer(table, many=True)

        return Response(serializer.data)

class UserDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)

            return Response({
                "id": user.id,
                "username": user.username,
                "first_name": user.first_name,
                "last_name": user.last_name
            })

        except User.DoesNotExist:
            return Response(
                {"error": "User not found."},
                status=status.HTTP_404_NOT_FOUND
            )


class RefereeMatchesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not request.user.groups.filter(name="Referee").exists():
            return Response(
                {"detail": "You are not a referee."},
                status=status.HTTP_403_FORBIDDEN
            )

        matches = Match.objects.filter(
            referee=request.user,
            status=Match.Status.SCHEDULED
        ).order_by("date_time")

        serializer = MatchSerializer(
            matches,
            many=True,
            context={"request": request}
        )

        return Response(serializer.data)


class UserRoleView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        is_referee = request.user.groups.filter(
            name="Referee"
        ).exists()

        is_team_leader = Team.objects.filter(
            leader=request.user
        ).exists()

        roles = []

        if is_referee:
            roles.append("referee")

        if is_team_leader:
            roles.append("team_leader")

        return Response({
            "user_id": request.user.id,
            "roles": roles
        })