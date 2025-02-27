import { Key } from "src/hooks/useIntl";

import { TUseSettingsError } from "hooks/users/use-settings-error/use-settings-error.types";

export namespace TUseMenu {
  export const ERROR_COLORS = {
    WARNING: "WARNING",
    ERROR: "ERROR",
    DEFAULT: "DEFAULT",
  } as const;

  export interface Return {
    labelToken: Key;
    redirection: string;
    errorColor: keyof typeof ERROR_COLORS;
    error: TUseSettingsError.Return["error"];
    isBillingWarning: boolean;
    isBillingError: boolean;
  }
}
