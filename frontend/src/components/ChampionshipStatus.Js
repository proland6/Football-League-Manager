export function getChampionshipStatus (status){
    switch(status){
        case "planned":
            return "Tervezett";
        
            case "ongoing":
                return "Aktív";

            case "finished":
                return "Befejezett";

            default:
                return "Ismeretlen";
    }
}