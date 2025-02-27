import { Chip } from "src/components/Chip/Chip";
import { CurrencyIcons } from "src/components/Currency/CurrencyIcon";
import { WorkEstimationBudgetDetails } from "src/components/RewardBudget/RewardBudget.type";
import { RewardBudgetUtils } from "src/components/RewardBudget/RewardBudget.utils";
import { TooltipPosition, withTooltip } from "src/components/Tooltip";
import { useIntl } from "src/hooks/useIntl";
import InformationLine from "src/icons/InformationLine";
import { Currency } from "src/types";
import { cn } from "src/utils/cn";
import { formatMoneyAmount } from "src/utils/money";

interface RewardBudgetDetailsProps {
  budget: WorkEstimationBudgetDetails;
  amount: number;
  selectedBudgetDollarEquivalent?: number;
}

interface RewardBudgetDetailsRowProps {
  currency: WorkEstimationBudgetDetails["currency"];
  amount: number;
  label: string;
  dollar?: number | undefined;
  warning?: boolean;
  warningIcon?: boolean;
  purple?: boolean;
}

const RewardBudgetDetailsRow = ({
  currency,
  amount,
  dollar,
  label,
  warning,
  warningIcon,
  purple,
}: RewardBudgetDetailsRowProps) => {
  const { T } = useIntl();
  return (
    <div className="flex w-full flex-row items-center justify-between gap-1">
      <div className="flex flex-row items-center justify-end gap-1">
        {warning && warningIcon ? (
          <div
            {...withTooltip(T("rewardBudget.detail.exceedsBudgetTooltip"), {
              position: TooltipPosition.Bottom,
            })}
          >
            <InformationLine className=" leading-[14px] text-[14p] text-orange-500" />
          </div>
        ) : null}
        <p className="font-walsheim text-sm text-greyscale-300">{label}</p>
      </div>
      <div className="flex flex-row items-center justify-end gap-1">
        {dollar && currency !== Currency.USD ? (
          <p
            className="font-walsheim text-xs font-normal text-spaceBlue-200"
            {...withTooltip(T("rewardBudget.detail.dollarTooltip"), {
              position: TooltipPosition.Bottom,
            })}
          >
            {`~${formatMoneyAmount({ amount: dollar, currency: Currency.USD })}`}
          </p>
        ) : null}
        <p
          className={cn(
            "font-walsheim text-sm font-normal",
            warning && "text-orange-500",
            purple && " text-spacePurple-500"
          )}
        >
          {formatMoneyAmount({
            amount,
            currency,
            showCurrency: false,
          })}
        </p>
        <Chip solid>
          <CurrencyIcons currency={currency} className="h-full w-full" />
        </Chip>
      </div>
    </div>
  );
};

const RewardBudgetDetails = ({ budget, amount, selectedBudgetDollarEquivalent }: RewardBudgetDetailsProps) => {
  const { T } = useIntl();
  const amountExceeds = budget.remaining - amount < 0;

  return (
    <div className="flex flex-col items-start justify-start gap-1">
      <RewardBudgetDetailsRow
        label={T("rewardBudget.detail.remaining")}
        currency={budget.currency}
        dollar={budget.remainingDollarsEquivalent}
        amount={budget.remaining}
      />
      <RewardBudgetDetailsRow
        label={T("rewardBudget.detail.this")}
        currency={budget.currency}
        dollar={selectedBudgetDollarEquivalent}
        amount={amount}
        warning={amountExceeds}
        purple
      />
      <RewardBudgetDetailsRow
        label={T("rewardBudget.detail.left")}
        currency={budget.currency}
        dollar={RewardBudgetUtils.getDollarForLeftToSpend({
          remaining: budget.remainingDollarsEquivalent,
          selected: selectedBudgetDollarEquivalent,
        })}
        amount={budget.remaining - amount}
        warningIcon
        warning={amountExceeds}
      />
    </div>
  );
};

export default RewardBudgetDetails;
