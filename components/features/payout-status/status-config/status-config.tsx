import { VariantProps } from "tailwind-variants";

import { getFormattedDateToLocaleDateString } from "src/utils/date";

import { tagVariants } from "components/ds/tag/tag.variants";
import { TStatusConfig } from "components/features/payout-status/status-config/status-config.types";
import { RemixIconsName } from "components/layout/icon/remix-icon-names.types";

function createStatusConfig(
  config: Omit<TStatusConfig.ReturnType, "icon" | "borderColor"> & { icon: string; borderColor: string }
): TStatusConfig.ReturnType {
  return {
    ...config,
    icon: config.icon as RemixIconsName,
    borderColor: config.borderColor as VariantProps<typeof tagVariants>["borderColor"],
  };
}
export function getStatusConfig({
  status,
  dateRelativeToNow,
  date,
  isBillingError,
}: TStatusConfig.Props): TStatusConfig.ReturnType {
  const defaultDate = date ? getFormattedDateToLocaleDateString(new Date(date)) : "";

  const statusConfigs: Record<string, TStatusConfig.ReturnType> = {
    COMPLETE: createStatusConfig({
      icon: "ri-check-line",
      labelToken: "v2.features.payoutStatus.complete.label",
      tooltipToken: "v2.features.payoutStatus.processedOnDate",
      tooltipParams: { date: defaultDate },
      borderColor: "grey",
      iconClassName: "text-snow",
    }),
    LOCKED: createStatusConfig({
      icon: "ri-lock-fill",
      labelToken: "v2.features.payoutStatus.locked.label",
      tooltipToken:
        dateRelativeToNow?.status === "past"
          ? "v2.features.payoutStatus.unlockedOnDate"
          : dateRelativeToNow?.status === "future"
          ? "v2.features.payoutStatus.lockedUntilDate"
          : "v2.features.payoutStatus.lockedUntilFurther",
      tooltipParams: { date: defaultDate },
      borderColor: "grey",
      iconClassName: "text-snow",
    }),
    PENDING_INVOICE: createStatusConfig({
      icon: "ri-loader-2-line",
      labelToken: "v2.features.payoutStatus.invoicePending.label",
      tooltipToken: "v2.features.payoutStatus.invoicePending.tooltip",
      tooltipParams: {},
      borderColor: "multi-color",
      iconClassName: "text-snow",
    }),
    PENDING_SIGNUP: createStatusConfig({
      icon: "ri-error-warning-line",
      labelToken: "v2.features.payoutStatus.pendingSignup.label",
      tooltipToken: "v2.features.payoutStatus.pendingSignup.tooltip",
      tooltipParams: {},
      borderColor: "grey",
      iconClassName: "text-snow",
    }),
    PROCESSING: createStatusConfig({
      icon: "ri-time-line",
      labelToken: "v2.features.payoutStatus.processing.label",
      tooltipToken: "v2.features.payoutStatus.processing.tooltip",
      tooltipParams: {},
      borderColor: "grey",
      iconClassName: "text-snow",
    }),
    MISSING_PAYOUT_INFO: createStatusConfig({
      icon: "ri-error-warning-line",
      labelToken: "v2.features.payoutStatus.payoutInfoMissing.label",
      tooltipToken: "v2.features.payoutStatus.payoutInfoMissing.tooltip",
      tooltipParams: {},
      borderColor: "orange",
      iconClassName: "text-orange-500",
    }),
    PENDING_VERIFICATION: createStatusConfig({
      icon: "ri-error-warning-line",
      labelToken: "v2.features.payoutStatus.pendingVerification.label",
      tooltipToken: "v2.features.payoutStatus.pendingVerification.tooltip",
      tooltipParams: {},
      borderColor: "orange",
      iconClassName: "text-orange-500",
    }),
    ERROR_VERIFICATION: createStatusConfig({
      icon: "ri-error-warning-line",
      labelToken: "v2.features.payoutStatus.errorVerification.label",
      tooltipToken: "v2.features.payoutStatus.errorVerification.tooltip",
      tooltipParams: {},
      borderColor: "red",
      iconClassName: "text-github-red",
    }),
    PENDING_CONTRIBUTOR: createStatusConfig({
      icon: "ri-user-3-line",
      labelToken: "v2.features.payoutStatus.pendingContributor.label",
      tooltipToken: "v2.features.payoutStatus.pendingContributor.tooltip",
      tooltipParams: {},
      borderColor: "grey",
      iconClassName: "text-snow",
    }),
  };

  if (status === "PENDING_VERIFICATION" && isBillingError) {
    return statusConfigs.ERROR_VERIFICATION;
  }

  return (
    statusConfigs[status] || {
      icon: "",
      labelToken: "",
      tooltipToken: "",
      tooltipParams: {},
      borderColor: "grey",
      iconClassName: "text-snow",
    }
  );
}
