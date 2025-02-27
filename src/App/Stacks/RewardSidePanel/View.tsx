import { UseMutateFunction } from "@tanstack/react-query";
import { PropsWithChildren, useMemo, useState } from "react";

import { OtherContributionTooltip } from "src/App/Stacks/RewardSidePanel/OtherContributionTooltip";
import { RewardTransactionDetails } from "src/App/Stacks/RewardSidePanel/TransactionDetails/RewardTransactionDetails";
import { useStackContribution, useStackProjectOverview } from "src/App/Stacks/Stacks";
import InfoIcon from "src/assets/icons/InfoIcon";
import Button, { ButtonSize } from "src/components/Button";
import Contributor from "src/components/Contributor";
import { CurrencyIcons } from "src/components/Currency/CurrencyIcon";
import GithubCodeReview from "src/components/GithubCard/GithubCodeReview/GithubCodeReview";
import GithubIssue from "src/components/GithubCard/GithubIssue/GithubIssue";
import GithubPullRequest from "src/components/GithubCard/GithubPullRequest/GithubPullRequest";
import RoundedImage, { ImageSize, Rounding } from "src/components/RoundedImage";
import { ShowMore } from "src/components/Table/ShowMore";
import Tooltip, { TooltipPosition } from "src/components/Tooltip";
import useInfiniteRewardItems from "src/hooks/useInfiniteRewardItems";
import { useIntl } from "src/hooks/useIntl";
import ErrorWarningLine from "src/icons/ErrorWarningLine";
import { useCloseStack } from "src/libs/react-stack";
import { Currency, GithubContributionType, PaymentStatus } from "src/types";
import { cn } from "src/utils/cn";
import { rewardItemToContribution } from "src/utils/formatToContribution";
import { pretty } from "src/utils/id";
import { formatMoneyAmount } from "src/utils/money";

import { Link } from "components/ds/link/link";
import { PayoutStatus } from "components/features/payout-status/payout-status";
import { BaseLink } from "components/layout/base-link/base-link";

import { NEXT_ROUTER } from "constants/router";

import { useMatchPath } from "hooks/router/useMatchPath";
import { useCurrentUser } from "hooks/users/use-current-user/use-current-user";

import MixedApi from "../../../api/Mixed";
import ConfirmationModal from "./ConfirmationModal";
import { SkeletonDetail } from "./SkeletonDetail";
import { SkeletonItems } from "./SkeletonItems";

enum Align {
  Top = "top",
  Center = "center",
}

export type Props = {
  rewardId: string;
  projectLeaderView?: boolean;
  onRewardCancel?: UseMutateFunction<unknown, Error, unknown, unknown>;
  projectId: string;
  isMine?: boolean;
  isBillingError?: boolean;
  redirectionStatus?: string;
};

export default function View({
  projectId,
  rewardId,
  onRewardCancel,
  projectLeaderView,
  isMine,
  isBillingError,
  redirectionStatus,
}: Props) {
  const { T } = useIntl();
  const { githubUserId } = useCurrentUser();
  const [openStackContribution] = useStackContribution();
  const [openProjectOverview] = useStackProjectOverview();
  const closeRewardPanel = useCloseStack();
  const isMyRewardsPage = useMatchPath(NEXT_ROUTER.rewards.all);

  const {
    data,
    isLoading: loading,
    isError,
  } = MixedApi.queries.useGetMixedReward({ params: { isMine: isMine || false, rewardId, projectId } });

  const infiniteOptions = isMine ? { isMine } : { projectId };

  const {
    data: rewardItemsData,
    error: rewardItemsError,
    isLoading: rewardItemsLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteRewardItems({ rewardId, enabled: Boolean(data), ...infiniteOptions });

  const rewardItems = rewardItemsData?.pages.flatMap(page => page.rewardItems) || [];

  const shouldDisplayCancelButton = projectLeaderView && onRewardCancel && data?.status !== PaymentStatus.COMPLETE;
  const isCurrencyUSD = data?.currency === Currency.USD;

  const PayoutStatusMemo = useMemo(() => {
    if (!data) {
      return null;
    }

    if (redirectionStatus && (data.status === "MISSING_PAYOUT_INFO" || data.status === "PENDING_VERIFICATION"))
      return (
        <BaseLink href={redirectionStatus} onClick={() => closeRewardPanel()}>
          <PayoutStatus
            status={data.status}
            dates={{ unlockDate: data?.unlockDate, processedAt: data?.processedAt }}
            isBillingError={isBillingError}
          />
        </BaseLink>
      );

    return (
      <PayoutStatus
        status={data.status}
        dates={{ unlockDate: data?.unlockDate, processedAt: data?.processedAt }}
        isBillingError={isBillingError}
      />
    );
  }, [data, isBillingError, redirectionStatus]);

  function renderRewardItems() {
    if (rewardItemsLoading) {
      return (
        <div className="py-8">
          <SkeletonItems />
        </div>
      );
    }

    if (rewardItemsError) {
      return (
        <p className="whitespace-pre-line py-24 text-center font-walsheim text-sm text-greyscale-50">
          {T("reward.table.detailsPanel.rewardItems.error")}
        </p>
      );
    }

    if (rewardItems.length) {
      const [{ totalItemNumber = 0 }] = rewardItemsData?.pages ?? [{}];

      return (
        <div className="flex h-full flex-col gap-3 overflow-hidden pt-8">
          <div className="font-belwe text-base font-normal text-greyscale-50">
            {T("reward.table.detailsPanel.contributions", { count: totalItemNumber })}
          </div>
          <div className="flex h-0 flex-auto flex-col gap-3 overflow-auto p-px pb-6 pr-4 scrollbar-thin scrollbar-thumb-white/12 scrollbar-thumb-rounded scrollbar-w-1.5">
            {rewardItems.map(item => {
              const hasContribution = Boolean(item.contributionId);
              const isNotMyContribution = isMyRewardsPage && !hasContribution;

              switch (item.type) {
                case GithubContributionType.PullRequest: {
                  return (
                    <OtherContributionTooltip key={item.id} visible={isNotMyContribution}>
                      <GithubPullRequest
                        pullRequest={item}
                        onCardClick={
                          hasContribution
                            ? () => {
                                openStackContribution({
                                  contributionId: item.contributionId,
                                  projectId,
                                  githubHtmlUrl: item.githubUrl,
                                });
                              }
                            : undefined
                        }
                        contributorLogin={data?.to.login}
                        badgeProps={{
                          contribution: rewardItemToContribution(item),
                          showExternal: isMyRewardsPage,
                        }}
                        disabled={!hasContribution}
                      />
                    </OtherContributionTooltip>
                  );
                }
                case GithubContributionType.Issue: {
                  return (
                    <OtherContributionTooltip key={item.id} visible={isNotMyContribution}>
                      <GithubIssue
                        issue={item}
                        onCardClick={
                          hasContribution
                            ? () => {
                                openStackContribution({
                                  contributionId: item.contributionId,
                                  projectId,
                                  githubHtmlUrl: item.githubUrl,
                                });
                              }
                            : undefined
                        }
                        badgeProps={{
                          contribution: rewardItemToContribution(item),
                          showExternal: isMyRewardsPage,
                        }}
                        disabled={!hasContribution}
                      />
                    </OtherContributionTooltip>
                  );
                }
                case GithubContributionType.CodeReview: {
                  return (
                    <OtherContributionTooltip key={item.id} visible={isNotMyContribution}>
                      <GithubCodeReview
                        onCardClick={
                          hasContribution
                            ? () => {
                                openStackContribution({
                                  contributionId: item.contributionId,
                                  projectId,
                                  githubHtmlUrl: item.githubUrl,
                                });
                              }
                            : undefined
                        }
                        codeReview={item}
                        badgeProps={{
                          contribution: rewardItemToContribution(item),
                          showExternal: isMyRewardsPage,
                        }}
                        disabled={!hasContribution}
                      />
                    </OtherContributionTooltip>
                  );
                }
                default: {
                  return null;
                }
              }
            })}
            {hasNextPage ? <ShowMore onClick={fetchNextPage} loading={isFetchingNextPage} /> : null}
          </div>
        </div>
      );
    }

    return null;
  }

  function renderDetail() {
    if (loading) {
      return (
        <div className="px-6 py-8">
          <SkeletonDetail />
        </div>
      );
    }

    if (isError) {
      return (
        <div className="flex h-full items-center justify-center px-6">
          <p className="whitespace-pre-line text-center font-walsheim text-greyscale-50">
            {T("reward.table.detailsPanel.error")}
          </p>
        </div>
      );
    }

    if (data) {
      return (
        <div className="flex h-full flex-col gap-8 overflow-hidden px-6">
          <div className="flex flex-wrap items-center gap-3 font-belwe text-2xl font-normal text-greyscale-50">
            {T("reward.table.detailsPanel.title", { id: pretty(data.id) })}
            {shouldDisplayCancelButton && <CancelRewardButton onRewardCancel={onRewardCancel} />}
          </div>
          <div className="flex h-full flex-col gap-8 divide-y divide-greyscale-50/12">
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2">
                {PayoutStatusMemo}
                <div className="flex items-center gap-1 font-walsheim text-xs text-spaceBlue-200">
                  <InfoIcon className="h-4 w-3" />
                  <span>
                    {data.currency === Currency.USD
                      ? T("currencies.network.label_dollar")
                      : T("currencies.network.label", { currency: T(`currencies.network.${data.currency}`) })}
                  </span>
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <div className="flex items-baseline gap-1 font-belwe text-5xl font-normal text-greyscale-50">
                  <div className="flex items-center gap-1">
                    <CurrencyIcons currency={data.currency} className="h-8 w-8" />
                    <span>
                      {formatMoneyAmount({ amount: data.amount, currency: data.currency, showCurrency: false })}
                    </span>
                  </div>
                  <span className="text-3xl">{data.currency}</span>
                </div>
                {!isCurrencyUSD && data.dollarsEquivalent ? (
                  <>
                    <Tooltip id="reward-detail-usd-est" position={TooltipPosition.Bottom}>
                      {T("reward.table.detailsPanel.usdEstimateTooltip")}
                    </Tooltip>
                    <span className="font-walsheim text-xl text-spaceBlue-200" data-tooltip-id="reward-detail-usd-est">
                      ~{formatMoneyAmount({ amount: data.dollarsEquivalent })}
                    </span>
                  </>
                ) : null}
              </div>
              {data.from ? (
                <Details>
                  <RoundedImage alt={data.from.login ?? ""} src={data.from.avatarUrl ?? ""} size={ImageSize.Xxs} />
                  <div className="flex flex-row items-center gap-1">
                    {T("reward.table.detailsPanel.from")}
                    <Contributor
                      contributor={{
                        login: data.from.login ?? "",
                        githubUserId: data.from.githubUserId ?? 0,
                        avatarUrl: null,
                      }}
                      clickable
                    />
                    {data.from.githubUserId === githubUserId && T("reward.table.detailsPanel.you")}
                  </div>
                </Details>
              ) : null}
              {data.to ? (
                <Details>
                  <RoundedImage alt={data.to.login ?? ""} src={data.to.avatarUrl ?? ""} size={ImageSize.Xxs} />
                  <div className="flex flex-row items-center gap-1">
                    {T("reward.table.detailsPanel.to")}
                    <Contributor
                      contributor={{
                        login: data.to.login ?? "",
                        githubUserId: data.to.githubUserId ?? 0,
                        avatarUrl: null,
                      }}
                      clickable
                    />
                    {data.to.githubUserId === githubUserId && T("reward.table.detailsPanel.you")}
                  </div>
                </Details>
              ) : null}
              {data.project ? (
                <Details>
                  <RoundedImage
                    alt={data.project.name || ""}
                    src={data.project.logoUrl}
                    size={ImageSize.Xxs}
                    rounding={Rounding.Circle}
                  />
                  <div className="flex flex-row items-center gap-1">
                    {T("reward.table.detailsPanel.on")}
                    <Link.Button onClick={() => openProjectOverview({ slug: data.project.slug })}>
                      {data.project.name}
                    </Link.Button>
                  </div>
                </Details>
              ) : null}
            </div>
            <RewardTransactionDetails
              isMine={isMine}
              status={data?.status}
              currency={data?.currency}
              createdAt={data?.createdAt}
              processedAt={data?.processedAt}
              unlockDate={data?.unlockDate}
              receipt={data?.receipt}
            />
            {renderRewardItems()}
          </div>
        </div>
      );
    }

    return (
      <div className="flex h-full items-center justify-center px-6">
        <p className="whitespace-pre-line text-center font-walsheim text-greyscale-50">
          {T("reward.table.detailsPanel.empty")}
        </p>
      </div>
    );
  }

  return renderDetail();
}

const Details = ({ align = Align.Center, children }: PropsWithChildren & { align?: Align }) => (
  <div
    className={cn("flex flex-row gap-2 font-walsheim text-sm font-normal text-greyscale-300", {
      "items-center": align === Align.Center,
      "items-start": align === Align.Top,
    })}
  >
    {children}
  </div>
);

type CancelRewardButtonProps = {
  onRewardCancel: UseMutateFunction<unknown, Error, unknown, unknown>;
};

function CancelRewardButton({ onRewardCancel }: CancelRewardButtonProps) {
  const { T } = useIntl();

  const [modalOpened, setModalOpened] = useState(false);

  const toggleModal = () => setModalOpened(!modalOpened);
  const closeModal = () => setModalOpened(false);

  return (
    <div className="relative">
      <Button size={ButtonSize.Sm} onClick={toggleModal} pressed={modalOpened} data-testid="cancel-reward-button">
        <ErrorWarningLine />
        {T("reward.table.detailsPanel.cancelReward.button")}
      </Button>
      <div
        className={cn("absolute top-10 z-10 xl:-inset-x-10", {
          hidden: !modalOpened,
        })}
      >
        <ConfirmationModal
          onClose={closeModal}
          onConfirm={() => {
            onRewardCancel({});
            closeModal();
          }}
        />
      </div>
    </div>
  );
}
