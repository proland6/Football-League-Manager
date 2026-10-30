from django.db import models
from django.contrib.auth.models import User

#Championship table
class Championship(models.Model):
    name = models.CharField(max_length=50)
    start_date = models.DateField()
    end_date = models.DateField()

    class Status(models.TextChoices):
        PLANNED = "planned", "Tervezett"
        ONGOING = "ongoing", "Aktív"
        FINISHED = "finished", "Befejezett"
 
    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.ONGOING
    )

    def __str__(self):
        return self.name


#Team table
class Team(models.Model):
    name = models.CharField(max_length=40)

    leader = models.ForeignKey(
        User,
        on_delete = models.SET_NULL,
        null = True,
        blank = True
    )

    #Championship és Team közötti N:M kapcsolat létrehozása
    championships = models.ManyToManyField(Championship)

    def __str__(self):
        return self.name

#Player table
class Player(models.Model):
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    birth_date = models.DateField()
    email = models.CharField(max_length=50)

    team = models.ForeignKey(
        Team,
        on_delete = models.SET_NULL,
        null = True,
        blank = True
    )

    image = models.ImageField(
        upload_to= "players/",
        null= True,
        blank= True,
    )

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

#Match table
class Match(models.Model):
    championship = models.ForeignKey(
        Championship,
        on_delete = models.CASCADE,
    )

    home_team = models.ForeignKey(
        Team,
        on_delete = models.CASCADE,
        related_name = "home_matches",
    )
    away_team = models.ForeignKey(
        Team, 
        on_delete = models.CASCADE,
        related_name = "away_matches",
    )
    home_score = models.IntegerField(null=True, blank=True)
    away_score = models.IntegerField(null=True, blank=True)
    date_time = models.DateTimeField()

    class Status(models.TextChoices):
            SCHEDULED = "scheduled", "Tervezett"
            ONGOING = "ongoing", "Aktív"
            FINISHED = "finished", "Befejezett"
            CANCELLED = "cancelled", "Törölt"
    
    status = models.CharField(
        max_length=10,
        choices = Status.choices,
        default = Status.ONGOING)

    referee = models.ForeignKey(
        User,
        on_delete = models.SET_NULL,
        null = True,
        blank = True,
        related_name = "matches_referee",
    )

    def __str__(self):
        return f"{self.home_team} - {self.away_team}"





