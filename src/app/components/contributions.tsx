import { getContributions } from "@/lib/github";
import { withMinDuration } from "@/lib/with-min-duration";
import ContributionsClient from "./ContributionsClient";

export default async function Contributions() {
    const username = "ibuki-hum4";
    const currentYear = new Date().getFullYear();
    const joinedYear = 2023; // GitHubアカウント作成年

    const calendar = await withMinDuration(getContributions(username, currentYear));

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
