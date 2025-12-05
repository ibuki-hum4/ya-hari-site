export interface ContributionDay {
    date: string;
    contributionCount: number;
    contributionLevel: "NONE" | "FIRST_QUARTILE" | "SECOND_QUARTILE" | "THIRD_QUARTILE" | "FOURTH_QUARTILE";
}

export interface ContributionWeek {
    contributionDays: ContributionDay[];
}

export interface ContributionCalendar {
    totalContributions: number;
    weeks: ContributionWeek[];
}

interface ContributionResponse {
    data: {
        user: {
            contributionsCollection: {
                contributionCalendar: ContributionCalendar;
            };
        };
    };
}

const CONTRIBUTIONS_QUERY = `
    query ($username: String!, $from: DateTime!, $to: DateTime!) {
        user(login: $username) {
            contributionsCollection(from: $from, to: $to) {
                contributionCalendar {
                    totalContributions
                    weeks {
                        contributionDays {
                            date
                            contributionCount
                            contributionLevel
                        }
                    }
                }
            }
        }
    }
`;

export async function getContributions(username: string, year?: number): Promise<ContributionCalendar | null> {
    try {
        const token = process.env.GH_TOKEN?.trim();
        
        // 年を指定しない場合は現在の年
        const targetYear = year || new Date().getFullYear();
        const from = `${targetYear}-01-01T00:00:00Z`;
        const to = `${targetYear}-12-31T23:59:59Z`;
        
        const response = await fetch("https://api.github.com/graphql", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                query: CONTRIBUTIONS_QUERY,
                variables: { username, from, to },
            }),
            cache: "no-store",
        });

        if (!response.ok) {
            console.error("GitHub API error:", response.status, await response.text());
            return null;
        }

        const data: ContributionResponse = await response.json();
        return data.data.user.contributionsCollection.contributionCalendar;
    } catch (error) {
        console.error("Failed to fetch GitHub contributions:", error);
        return null;
    }
}
