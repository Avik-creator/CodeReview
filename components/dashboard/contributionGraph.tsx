"use client";
import { ActivityCalendar } from "react-activity-calendar";
import { useTheme } from "next-themes";
import { useQuery } from "@tanstack/react-query";
import { getContributionStats } from "@/app/actions/dashboard";

const ContributionGraph = () => {
  const { theme } = useTheme();
  const { data, isLoading } = useQuery({
    queryKey: ["contribution-graph"],
    queryFn: async () => await getContributionStats(),
    staleTime: 1000 * 60 * 5,
  });

  if (isLoading) {
    return (
      <div className="w-full flex flex-col items-center justify-center p-8">
        <div className="animate-pulse text-muted-foreground">
          Loading Contribution Data....
        </div>
      </div>
    );
  }

  if (!data || !data.contributions.length) {
    return (
      <div className="w-full flex flex-col items-center justify-center p-8">
        <div className="animate-pulse text-muted-foreground">
          No Contribution Data Available.
        </div>
      </div>
    );
  }

  // Enhanced dark mode color palette with better contrast and visibility
  const darkThemeColors = [
    "hsl(220, 13%, 18%)", // Level 0 - Very dark gray (better than #161b22)
    "hsl(142, 50%, 35%)", // Level 1 - Darker green
    "hsl(142, 60%, 45%)", // Level 2 - Medium green
    "hsl(142, 70%, 55%)", // Level 3 - Bright green
    "hsl(142, 80%, 65%)", // Level 4 - Very bright green
  ];

  const lightThemeColors = [
    "hsl(0, 0%, 92%)", // Level 0 - Light gray
    "hsl(142, 40%, 70%)", // Level 1 - Light green
    "hsl(142, 50%, 55%)", // Level 2 - Medium green
    "hsl(142, 65%, 45%)", // Level 3 - Bright green
    "hsl(142, 71%, 40%)", // Level 4 - Deep green
  ];

  return (
    <div className="w-full flex flex-col items-center gap-4 p-4">
      <div className="text-sm text-muted-foreground">
        <span className="font-semibold text-foreground">
          {data.totalContributions}
        </span>
        {" contributions in the last year"}
      </div>
      <div className="w-full overflow-x-auto">
        <div className="flex justify-center min-w-max px-4">
          <ActivityCalendar
            data={data.contributions}
            colorScheme={theme === "dark" ? "dark" : "light"}
            blockSize={12}
            blockMargin={2}
            fontSize={14}
            showWeekdayLabels
            showMonthLabels
            theme={{
              light: lightThemeColors,
              dark: darkThemeColors,
            }}
            labels={{
              legend: {
                less: "Less",
                more: "More",
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ContributionGraph;
