from rest_framework import serializers
from .models import Championship, Team, Player, Match

class ChampionshipSerializer(serializers.ModelSerializer):
    class Meta:
        model = Championship
        fields = "__all__"

class TeamSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = "__all__"
 
class PlayerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Player
        fields = "__all__"

    def get_fields(self):
        fields = super().get_fields()

        request = self.context.get("request")
            
        if (
            request
            and request.user.is_authenticated
            and request.user.groups.filter(name="Team Leader").exists()
        ):

            fields["team"].read_only = True 

        return fields

    def create(self, validated_data):
        request = self.context.get("request")

        if(
            request
            and request.user.is_authenticated
            and request.user.groups.filter(name="Team Leader").exists()
        ):
            team = Team.objects.get(leader = request.user)
            validated_data["team"] = team

        return super().create(validated_data)
        
    def update(self, instance, validated_data):
        request = self.context.get("request")

        if (
            request
            and request.user.is_authenticated
            and request.user.groups.filter(name="Team Leader").exists()
        ):
            allowed_fields = {"email", "image"}

            changed_fields = {
                field
                for field, value in validated_data.items()
                if getattr(instance, field) != value
            }

            forbidden_fields = changed_fields - allowed_fields

            if forbidden_fields:
                raise serializers.ValidationError({
                "detail": "You can only modify the player's email and image."
                })

        return super().update(instance, validated_data)

    def validate_image(self, image):
        if image is None:
            return image

        max_size = 5 * 1024 * 1024

        if image.size > max_size:
            raise serializers.ValidationError(
            "The image size cannot exceed 5 MB."
            )

        if image.content_type not in ["image/jpeg", "image/png"]:
            raise serializers.ValidationError(
            "Only JPG, JPEG and PNG images are allowed."
            )

        return image

class MatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Match
        fields = "__all__"

    def get_fields(self):
        fields = super().get_fields()

        request = self.context.get("request")

        if (
            request
            and request.user.is_authenticated
            and request.user.groups.filter(name="Referee").exists()
        ):
            editable_fields = {
                "id",
                "home_score",
                "away_score",
                "status",
            }

            
            for field_name, field in fields.items():
                if field_name not in editable_fields:
                    field.read_only = True
        

        return fields


class ChampionshipTableSerializer(serializers.Serializer):
    team_id = serializers.IntegerField()
    team_name = serializers.CharField()
    played = serializers.IntegerField()
    wins = serializers.IntegerField()
    draws = serializers.IntegerField()
    losses = serializers.IntegerField()
    goals_for = serializers.IntegerField()
    goals_against = serializers.IntegerField()
    goal_difference = serializers.IntegerField()
    points = serializers.IntegerField()
