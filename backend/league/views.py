#from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.permissions import DjangoModelPermissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from django.contrib.auth.models import User

from .permissions import PublicReadDjangoModelPermisson, TeamPermission, PlayerPermission, MatchPermission
from .models import Championship, Match, Player, Team
from .serializers import ChampionshipSerializer, TeamSerializer, MatchSerializer, PlayerSerializer

from django.conf import settings

from google.oauth2 import id_token
from google.auth.transport import requests

from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import AllowAny


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


        