import { useEffect, useMemo } from "react";

import ErrorFallback from "src/ErrorFallback";
import SortingDropdown, { PROJECT_SORTINGS, Sorting } from "src/_pages/Projects/Sorting/SortingDropdown";
import { useProjectFilter } from "src/_pages/Projects/useProjectFilter";
import ProjectApi from "src/api/Project";
import { useInfiniteBaseQueryProps } from "src/api/useInfiniteBaseQuery";
import { IMAGES } from "src/assets/img";
import ProjectCard, { Variant as ProjectCardVariant } from "src/components/ProjectCard";
import { ShowMore } from "src/components/Table/ShowMore";
import { useIntl } from "src/hooks/useIntl";
import { usePosthog } from "src/hooks/usePosthog";
import { isUserProjectLead } from "src/utils/isUserProjectLead";

import { EmptyState } from "components/layout/placeholders/empty-state/empty-state";

import { useCurrentUser } from "hooks/users/use-current-user/use-current-user";

import { FilterButton } from "../FilterPanel/FilterButton";
import { SortButton } from "../Sorting/SortButton";
import SubmitProject from "../SubmitProject";
import AllProjectLoading from "./AllProjectsLoading";

export const DEFAULT_SORTING = Sorting.Trending;
// TODO clean/delete this file once the New All Project Page is live
type Props = {
  search: string;
  clearSearch: () => void;
  sorting?: Sorting;
  setSorting: (sorting?: Sorting) => void;
  restoreScroll: () => void;
  filterPanelOpen: boolean;
  setFilterPanelOpen: (open: boolean) => void;
  sortingPanelOpen: boolean;
  setSortingPanelOpen: (open: boolean) => void;
  setTechnologies: (technologies: string[]) => void;
  // setSponsors: (sponsors: Sponsor[]) => void;
};

export default function AllProjects({
  search,
  clearSearch,
  sorting,
  setSorting,
  restoreScroll,
  filterPanelOpen,
  setFilterPanelOpen,
  sortingPanelOpen,
  setSortingPanelOpen,
  setTechnologies,
}: // setSponsors,
Props) {
  const { T } = useIntl();
  const { githubUserId } = useCurrentUser();
  const { capture } = usePosthog();

  const {
    projectFilter: {
      ownership,
      technologies,
      // sponsors
    },
    clear: clearFilters,
  } = useProjectFilter();

  function handleClear() {
    clearFilters();
    clearSearch();
  }

  const queryParams = useMemo(() => {
    const params: useInfiniteBaseQueryProps["queryParams"] = [
      technologies.length > 0 ? ["technologies", technologies.join(",")] : null,
      // sponsors.length > 0 ? ["sponsorId", sponsors.map(({ id }) => id).join(",")] : null,
      search ? ["search", search] : null,
      sorting ? ["sort", sorting] : null,
      ownership ? ["mine", String(ownership === "Mine")] : null,
    ].filter((param): param is string[] => Boolean(param));

    return params;
  }, [
    technologies,
    // sponsors,
    search,
    sorting,
    ownership,
  ]);

  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } =
    ProjectApi.queries.useInfiniteList({
      queryParams,
    });

  useEffect(() => {
    capture("project_list_viewed", {
      technologies,
      // sponsors: sponsors.map(({ name }) => name),
      ownership,
    });
  }, [
    ownership,
    technologies,
    // sponsors
  ]);

  useEffect(() => {
    restoreScroll();
  }, [restoreScroll]);

  useEffect(() => {
    if (data && !isLoading) {
      const blackListedTech = process.env.NEXT_PUBLIC_LANGUAGES_FILTER;
      const technologies = [...new Set(data?.pages?.flatMap(({ technologies = "" }) => technologies))] ?? [];
      // const sponsors = uniqBy(
      //   data?.pages
      //     ?.flatMap(({ sponsors = null }) => sponsors)
      //     .filter((sponsor): sponsor is Sponsor => Boolean(sponsor)),
      //   "id"
      // );

      setTechnologies(technologies.length ? technologies.filter(item => !blackListedTech?.includes(item)) : []);
      // setSponsors(sponsors);
    }
  }, [data]);

  if (isLoading) {
    return <AllProjectLoading />;
  }

  if (isError) {
    return <ErrorFallback />;
  }

  const projects = data?.pages?.flatMap(({ projects }) => projects) ?? [];

  if (projects.length) {
    return (
      <div className="flex flex-col gap-5">
        <div className="relative flex h-10 items-center justify-between">
          <div className="px-2 font-medium text-spaceBlue-200">
            {T("projects.count", { count: data?.pages?.[0]?.totalItemNumber ?? 0 })}
          </div>
          <div className="absolute right-0 top-0 z-10 hidden xl:block">
            <SortingDropdown all={PROJECT_SORTINGS} current={sorting || DEFAULT_SORTING} onChange={setSorting} />
          </div>
          <div className="flex items-center gap-2 xl:hidden">
            <SortButton panelOpen={sortingPanelOpen} setPanelOpen={setSortingPanelOpen} />
            <FilterButton panelOpen={filterPanelOpen} setPanelOpen={setFilterPanelOpen} />
          </div>
        </div>
        <div className="flex grow flex-col gap-5">
          <div className="xl:hidden">
            <SubmitProject className="mb-0" />
          </div>
          {projects.map((project, index) => {
            const isFirstHiringProject = index === 0 && project.hiring;
            const isLeader = isUserProjectLead(project, githubUserId);

            return (
              <ProjectCard
                className={isFirstHiringProject ? "mt-3" : undefined}
                key={project.id}
                project={project}
                variant={
                  isLeader && project.isMissingGithubAppInstallation
                    ? ProjectCardVariant.Error
                    : ProjectCardVariant.Default
                }
              />
            );
          })}
          {hasNextPage ? <ShowMore onClick={fetchNextPage} loading={isFetchingNextPage} /> : null}
        </div>
      </div>
    );
  }

  return (
    <EmptyState
      illustrationSrc={IMAGES.global.categories}
      title={{ token: "projects.fallback.title" }}
      description={{ token: "projects.fallback.subTitle" }}
      actionLabel={{ token: "projects.fallback.clearFiltersButton" }}
      onAction={handleClear}
    />
  );
}
