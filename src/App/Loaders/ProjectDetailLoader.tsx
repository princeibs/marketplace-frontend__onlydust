import { useMediaQuery } from "usehooks-ts";

import InsightSkeleton from "src/_pages/ProjectDetails/Insights/Insights.skeleton";
import { ContributionTableSkeleton } from "src/components/Contribution/ContributionTableSkeleton";
import Skeleton, { SkeletonVariant } from "src/components/Skeleton";
import { viewportConfig } from "src/config";

import { NEXT_ROUTER } from "constants/router";

import { useMatchPath } from "hooks/router/useMatchPath";

export default function ProjectDetailsLoader() {
  const isXl = useMediaQuery(`(min-width: ${viewportConfig.breakpoints.xl}px)`);
  const matches = {
    isProjectOverview: useMatchPath(NEXT_ROUTER.projects.details.root("[slug]")),
    isProjectContributors: useMatchPath(NEXT_ROUTER.projects.details.contributors("[slug]")),
    isProjectRewards: useMatchPath(NEXT_ROUTER.projects.details.rewards.root("[slug]")),
    isProjectRewardForm: useMatchPath(NEXT_ROUTER.projects.details.rewards.new("[slug]")),
    isProjectContributions: useMatchPath(NEXT_ROUTER.projects.details.contributions("[slug]")),
    isProjectInsights: useMatchPath(NEXT_ROUTER.projects.details.insights("[slug]")),
  };

  const renderSkeleton = (variant: SkeletonVariant) => <Skeleton variant={variant} />;

  return (
    <div className="flex w-full flex-1 flex-col gap-4 overflow-hidden pt-4 xl:h-0 xl:flex-row xl:gap-2 xl:p-6 xl:pt-0">
      {isXl && (
        <div className="flex w-full shrink-0 flex-col gap-6 bg-white/4 bg-noise-medium p-6 font-walsheim xl:w-80 xl:rounded-l-2xl">
          {renderSkeleton("projectSidebar")}
        </div>
      )}
      <div className="h-full w-full overflow-y-auto bg-space bg-no-repeat scrollbar-thin scrollbar-thumb-white/12 scrollbar-thumb-rounded scrollbar-w-1.5 lg:rounded-r-3xl">
        <div className="h-full">
          <div className="mx-auto flex h-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 xl:px-8">
            {matches.isProjectOverview ? renderSkeleton("projectOverview") : null}
            {matches.isProjectContributors ? (
              <>
                <div className="max-w-[15%]">{renderSkeleton("counter")}</div>
                {renderSkeleton("contributorList")}
              </>
            ) : null}
            {matches.isProjectRewards ? renderSkeleton("projectRewards") : null}
            {matches.isProjectRewardForm ? renderSkeleton("projectRewardForm") : null}
            {matches.isProjectContributions ? <ContributionTableSkeleton /> : null}
            {matches.isProjectInsights ? <InsightSkeleton /> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
