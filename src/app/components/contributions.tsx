import { getContributions } from "@/lib/github";
import ContributionsClient from "./ContributionsClient";

export default async function Contributions() {
    const username = "ibuki-hum4";
    const currentYear = new Date().getFullYear();
    const joinedYear = 2023; // GitHubアカウント作成年
    
    const calendar = await getContributions(username, currentYear);

    if (!calendar) {
        return null;
    }

    return (
        <ContributionsClient
            username={username}
            initialCalendar={calendar}
            initialYear={currentYear}
            joinedYear={joinedYear}
        />
    );
}
