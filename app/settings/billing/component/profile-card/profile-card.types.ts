import { PropsWithChildren } from "react";

import { UseBillingProfileResponse } from "src/api/me/billing/queries";

export namespace TProfileCard {
  export interface Props extends PropsWithChildren {
    status?: UseBillingProfileResponse["status"];
    hasValidBillingProfile: boolean;
  }
}
