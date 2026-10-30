from django.contrib import admin
from .models import Championship, Team, Player, Match 

# Register your models here.
admin.site.register(Championship)

#admin.site.register(Team)
@admin.register(Team)
class TeamAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "leader",
        "get_championships",
    )

    list_display_links = (
        "name",
    )

    search_fields = (
        "name",
        "leader__name",
    )

    list_filter = (
        "championships__name",
    )

    ordering = (
        "name",
    )

    @admin.display(description="Championships")
    def get_championships(self, obj):
        championships_name = []

        for championship in obj.championships.all():
            championships_name.append(championship.name)

        championships_linked_names = ", ".join(championships_name)
        return championships_linked_names

    list_per_page = 25

#admin.site.register(Player)
@admin.register(Player)
class PlayerAdmin(admin.ModelAdmin):
    list_display = (
        "first_name",
        "last_name",
        "birth_date",
        "email",
        "team",
    )

    list_display_links = (
        "first_name",
        "last_name",
    )

    search_fields = (
        "first_name",
        "last_name",
        "email",
        "team__name" 
        #__name, __: kapcsoló a másik táblára, name: a másik tábla mezőjére utal
    )

    ordering = (
        "first_name",
        "last_name",
    )

    list_per_page = 25


#admin.site.register(Match)
@admin.register(Match)
class MatchAdmin(admin.ModelAdmin):
    list_display = (
        "championship",
        "home_team",
        "away_team",
        "home_score",
        "away_score",
        "date_time",
        "status",
        "referee",
    )

    list_display_links = (
        "home_team",
        "away_team",
    )

    list_filter = (
        "status",
        "championship",
        "referee",
    )

    search_fields = (
        "home_team__name",
        "away_team__name",
    )

    ordering = (
        "-date_time",
    )

    date_hierarchy = "date_time"
    

    list_per_page = 25