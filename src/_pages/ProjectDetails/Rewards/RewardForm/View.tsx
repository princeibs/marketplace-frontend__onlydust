import { useRouter } from "next/navigation";
import { ReactElement, ReactNode, useEffect, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { useMediaQuery } from "usehooks-ts";

import ContributorSelect from "src/_pages/ProjectDetails/Rewards/RewardForm/ContributorSelect";
import {
  RewardableWorkItem,
  contributionToWorkItem,
} from "src/_pages/ProjectDetails/Rewards/RewardForm/WorkItemSidePanel/WorkItems/WorkItems";
import Title from "src/_pages/ProjectDetails/Title";
import ProjectApi from "src/api/Project";
import { CompletedRewardableItem } from "src/api/Project/queries";
import useMutationAlert from "src/api/useMutationAlert";
import { IMAGES } from "src/assets/img";
import Button, { ButtonSize, ButtonType, Width } from "src/components/Button";
import Callout from "src/components/Callout";
import Card from "src/components/Card";
import { RewardBudget } from "src/components/RewardBudget/RewardBudget";
import { RewardBudgetChangeProps } from "src/components/RewardBudget/RewardBudget.type";
import Skeleton from "src/components/Skeleton";
import { viewportConfig } from "src/config";
import { useIntl } from "src/hooks/useIntl";
import Add from "src/icons/Add";
import CloseLine from "src/icons/CloseLine";
import { GithubContributionType, ProjectBudgetType } from "src/types";
import { BudgetCurrencyType } from "src/utils/money";

import { AutoAddOrIgnore } from "./AutoAdd/AutoAddOrIgnore";
import { WorkItem } from "./WorkItem";
import WorkItemSidePanel from "./WorkItemSidePanel";
import { Contributor } from "./types";
import useWorkItems from "./useWorkItems";

interface Props {
  projectId: string;
  projectBudget: ProjectBudgetType;
  preferredCurrency?: BudgetCurrencyType;
  onWorkItemsChange: (workItems: RewardableWorkItem[]) => void;
  contributor: Contributor | null | undefined;
  setContributor: (contributor: Contributor | null | undefined) => void;
  unpaidContributions: CompletedRewardableItem;
  isCreateProjectRewardLoading?: boolean;
  isCompletedContributionsLoading?: boolean;
}

type TitleProps = {
  title: string;
  rightAction?: ReactElement;
};

function SectionTitle({ title, rightAction }: TitleProps) {
  return (
    <div className="mx-4 flex items-end justify-between border-b border-b-greyscale-50/8 pb-2 font-belwe text-base font-normal text-greyscale-50">
      {title}
      {rightAction}
    </div>
  );
}

const contributionsKeyMap: Record<GithubContributionType, keyof CompletedRewardableItem> = {
  [GithubContributionType.Issue]: "rewardableIssues",
  [GithubContributionType.PullRequest]: "rewardablePullRequests",
  [GithubContributionType.CodeReview]: "rewardableCodeReviews",
};

const View: React.FC<Props> = ({
  projectBudget,
  onWorkItemsChange,
  projectId,
  contributor,
  setContributor,
  unpaidContributions,
  isCreateProjectRewardLoading,
  preferredCurrency,
  isCompletedContributionsLoading,
}) => {
  const { control, setValue } = useFormContext();
  const { T } = useIntl();
  const isXl = useMediaQuery(`(min-width: ${viewportConfig.breakpoints.xl}px)`);
  const isMd = useMediaQuery(`(min-width: ${viewportConfig.breakpoints.md}px)`);
  const router = useRouter();
  const [sidePanelOpen, setSidePanelOpen] = useState(false);

  const { workItems, add: addWorkItem, remove: removeWorkItem, clear: clearWorkItems } = useWorkItems();
  const displayCallout = contributor && !contributor.isRegistered;

  const handleAutoAdd = (type: GithubContributionType) => {
    if (!unpaidContributions) return;

    const filteredTypedContributions = unpaidContributions[contributionsKeyMap[type]];
    const workItems = filteredTypedContributions.map(
      contribution => contributionToWorkItem(contribution) as RewardableWorkItem
    );

    addWorkItem(workItems);
  };

  const { mutate: ignoreContribution, ...restignoreContributionMutation } =
    ProjectApi.mutations.useIgnoreUnignoreContribution({
      params: { projectId },
    });

  useMutationAlert({
    mutation: restignoreContributionMutation,
    success: {
      message: T("reward.form.contributions.ignoreUnignoreContributions.success", {
        action: "ignored",
      }),
    },
    error: {
      message: T("reward.form.contributions.ignoreUnignoreContributions.error", {
        action: "ignored",
      }),
    },
  });

  const handleAutoIgnore = (type: GithubContributionType) => {
    if (!unpaidContributions) return;

    const filteredTypedContributions = unpaidContributions[contributionsKeyMap[type]];
    const filteredTypedContributionsIds = filteredTypedContributions
      .map(({ contributionId }) => contributionId)
      .filter((contributionId): contributionId is string => contributionId !== undefined);
    ignoreContribution({ contributionsToIgnore: [...filteredTypedContributionsIds] });
  };

  useEffect(() => {
    onWorkItemsChange(workItems);
  }, [workItems]);

  useEffect(() => {
    clearWorkItems();
  }, [contributor]);

  const renderAutoAddOrIgnore = () => {
    if (isCompletedContributionsLoading) {
      return <Skeleton variant="quickActions" />;
    }

    if (
      !isCompletedContributionsLoading &&
      (unpaidContributions?.rewardablePullRequests ||
        unpaidContributions?.rewardableIssues ||
        unpaidContributions?.rewardableCodeReviews)
    ) {
      return (
        <AutoAddOrIgnore
          unpaidContributions={unpaidContributions}
          onAutoAdd={handleAutoAdd}
          onAutoIgnore={handleAutoIgnore}
          workItems={workItems}
        />
      );
    }

    return null;
  };

  return (
    <>
      {isXl && (
        <Title>
          <div className="flex flex-row items-center gap-3">
            <div onClick={() => router.back()}>
              <Button type={ButtonType.Secondary} size={ButtonSize.Sm} iconOnly>
                <CloseLine className="text-base" />
              </Button>
            </div>
            <div className="text-2xl xl:text-3xl">{T("project.details.rewards.new.title")}</div>
          </div>
        </Title>
      )}
      <div className="flex h-full flex-col items-start gap-5 xl:flex-row">
        <div className="w-full">
          <div className="flex w-full flex-col gap-6">
            <Card className="z-10 px-4 py-7" padded={false}>
              <div className={displayCallout ? "xl:h-52" : "h-24"}>
                <SectionTitle title={T("reward.form.contributor.title")} />
                <div className="relative z-10">
                  <ContributorSelect
                    projectId={projectId}
                    contributor={contributor}
                    setContributor={setContributor}
                    sidePanelOpened={sidePanelOpen}
                  />
                </div>
                {displayCallout && (
                  <div className="mx-4 pt-24">
                    <Callout>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm xl:text-base xl:font-medium">
                          {T("reward.form.contributor.needsToSignup.title", { contributor: contributor?.login })}
                        </span>
                        <span>{T("reward.form.contributor.needsToSignup.details")}</span>
                      </div>
                    </Callout>
                  </div>
                )}
              </div>
              {contributor && (
                <div className="pt-8 xl:pt-12">
                  <SectionTitle
                    title={T("reward.form.contributions.title")}
                    rightAction={
                      <div className="flex flex-row items-center gap-2">
                        {workItems.length > 0 && (
                          <Button type={ButtonType.Ternary} size={ButtonSize.Sm} onClick={() => clearWorkItems()}>
                            <CloseLine />
                            {T(isMd ? "reward.form.contributions.clear" : "reward.form.contributions.clearShort")}
                          </Button>
                        )}
                        <Button
                          size={ButtonSize.Sm}
                          type={ButtonType.Secondary}
                          onClick={() => setSidePanelOpen(true)}
                          iconOnly
                        >
                          <Add />
                        </Button>
                      </div>
                    }
                  />
                  <div className="relative z-0 mx-4 flex flex-col gap-3 pt-4" data-testid="added-work-items">
                    <div className="text-sm text-greyscale-300 xl:text-base">
                      {T("reward.form.contributions.subTitle")}
                    </div>

                    {renderAutoAddOrIgnore()}

                    {workItems.map(workItem => (
                      <WorkItem
                        key={workItem.id}
                        workItem={workItem}
                        action={() => removeWorkItem(workItem)}
                        contributor={contributor}
                      />
                    ))}
                  </div>
                  <div onClick={() => setSidePanelOpen(true)} data-testid="add-work-item-btn" className="mx-4 pt-8">
                    <Button size={ButtonSize.Md} type={ButtonType.Secondary} width={Width.Full}>
                      <Add />
                      {T("reward.form.contributions.addContribution")}
                    </Button>
                  </div>
                </div>
              )}
            </Card>
            {contributor && (
              <WorkItemSidePanel
                projectId={projectId}
                open={sidePanelOpen}
                setOpen={setSidePanelOpen}
                workItems={workItems}
                addWorkItem={addWorkItem}
                contributor={contributor}
              />
            )}
          </div>
        </div>
        <div className="w-full shrink-0 xl:w-[384px]">
          {!contributor && (
            <PlaceholderWithImage
              text={T("reward.form.missingContributor")}
              imageElement={
                <img
                  width={267}
                  src={IMAGES.global.pickContributor}
                  className="absolute bottom-0 right-0 top-0"
                  loading="lazy"
                  alt={T("reward.form.contributor.title")}
                />
              }
            />
          )}
          {contributor && workItems.length === 0 && (
            <PlaceholderWithImage
              text={T("reward.form.missingContribution")}
              imageElement={
                <img
                  width={165}
                  src={IMAGES.global.addContribution}
                  className="absolute bottom-0 right-0"
                  loading="lazy"
                  alt={T("reward.form.contributor.title")}
                />
              }
            />
          )}
          {contributor && workItems.length > 0 && projectBudget?.budgets && (
            <Controller
              name="rewardBudget"
              control={control}
              render={() => (
                <RewardBudget
                  budgets={projectBudget.budgets}
                  preferedCurrency={preferredCurrency}
                  onChange={({ amount, currency }: RewardBudgetChangeProps) => {
                    setValue("amountToWire", amount);
                    setValue("currency", currency);
                  }}
                  loading={isCreateProjectRewardLoading}
                />
              )}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default View;

function PlaceholderWithImage({ text, imageElement }: { text: string; imageElement: ReactNode }) {
  return (
    <Card padded={false} className="relative flex h-[163px] items-center bg-noise-medium pl-8">
      <span className="max-w-[160px] font-walsheim text-greyscale-50">{text}</span>
      {imageElement}
    </Card>
  );
}
