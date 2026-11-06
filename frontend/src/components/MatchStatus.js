 export function getChampionshipStatus (status){
    switch(status){
        case "scheduled":
            return "Tervezett";
        
            case "ongoing":
                return "Aktív";

            case "finished":
                return "Befejezett";
            
                case "cancelled":
                    return "Elmaradt"

            default:
                return "Ismeretlen";
    }
}