import { components } from "src/__generated/api";
import { IMAGES } from "src/assets/img";
import { AvailableConversion } from "src/components/Currency/AvailableConversion";
import RoundedImage from "src/components/RoundedImage";
import Cell from "src/components/Table/Cell";
import Line from "src/components/Table/Line";
import { useIntl } from "src/hooks/useIntl";
import displayRelativeDate from "src/utils/displayRelativeDate";
import { pretty } from "src/utils/id";

import { PayoutStatus } from "components/features/payout-status/payout-status";

export type MyRewardType = components["schemas"]["MyRewardPageItemResponse"];

type Props = {
  reward: MyRewardType;
  onClick: () => void;
  selected: boolean;
  isBillingError?: boolean;
};

export default function RewardLine({ reward, onClick, selected, isBillingError }: Props) {
  const { T } = useIntl();

  return (
    <Line onClick={onClick} selected={selected}>
      <Cell>{displayRelativeDate(new Date(reward?.requestedAt))}</Cell>
      <Cell className="flex flex-row gap-3">
        <RoundedImage
          src={reward?.rewardedOnProjectLogoUrl || IMAGES.logo.space}
          alt={reward?.rewardedOnProjectName || ""}
        />
        <div className="flex flex-col justify-center truncate">
          <div className="font-belwe text-base font-normal">{reward?.rewardedOnProjectName}</div>
          <div className="text-spaceBlue-200">
            {T("reward.table.reward", { id: pretty(reward?.id), count: reward?.numberOfRewardedContributions })}
          </div>
        </div>
      </Cell>
      <Cell>
        {reward?.amount.total ? (
          <div className="rounded-full border border-white/8 bg-white/2 px-3 py-[6px]">
            <AvailableConversion
              tooltipId={`${reward?.id}-contributors-earned-details`}
              totalAmount={reward?.amount?.total}
              currency={{
                currency: reward?.amount?.currency,
                amount: reward?.amount?.total,
                dollar: reward?.amount?.dollarsEquivalent,
              }}
            />
          </div>
        ) : (
          "-"
        )}
      </Cell>
      <Cell>
        <PayoutStatus
          status={reward?.status}
          dates={{ unlockDate: reward?.unlockDate, processedAt: reward?.processedAt }}
          isBillingError={isBillingError}
        />
      </Cell>
    </Line>
  );
}
