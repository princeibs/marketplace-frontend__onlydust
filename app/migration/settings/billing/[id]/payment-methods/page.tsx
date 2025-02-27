"use client";

import { withAuthenticationRequired } from "@auth0/auth0-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";

import BillingProfilesApi from "src/api/BillingProfiles";
import useMutationAlert from "src/api/useMutationAlert";
import { Key, useIntl } from "src/hooks/useIntl";

import { FormFooter } from "../../../components/form-footer/form-footer";
import { PayoutForm } from "./features/form/form";
import { REGEX } from "./features/form/form.regex";
import { TPayoutForm } from "./features/form/form.types";
import { formatToData, formatToSchema } from "./features/form/form.utils";

const INVALID_ETHEREUM_WALLET = "invalidEthereumWallet";
const INVALID_STARKNET_ADDRESS = "invalidStarknetAddress";
const INVALID_OPTIMISM_ADDRESS = "invalidOptimismAddress";
const INVALID_APTOS_ADDRESS = "invalidAptosAddress";
const IBAN_IS_REQUIRED = "ibanIsRequired";
const BIC_IS_REQUIRED = "bicIsRequired";

type KeyType =
  | typeof INVALID_ETHEREUM_WALLET
  | typeof INVALID_STARKNET_ADDRESS
  | typeof INVALID_OPTIMISM_ADDRESS
  | typeof INVALID_APTOS_ADDRESS
  | typeof IBAN_IS_REQUIRED
  | typeof BIC_IS_REQUIRED;

const keys: Record<KeyType, Key> = {
  [INVALID_ETHEREUM_WALLET]: "v2.commons.form.errors.wallets.ethereum.invalid",
  [INVALID_STARKNET_ADDRESS]: "v2.commons.form.errors.wallets.starknet.invalid",
  [INVALID_OPTIMISM_ADDRESS]: "v2.commons.form.errors.wallets.optimism.invalid",
  [INVALID_APTOS_ADDRESS]: "v2.commons.form.errors.wallets.aptos.invalid",
  [IBAN_IS_REQUIRED]: "v2.commons.form.errors.wallets.sepa.iban.required",
  [BIC_IS_REQUIRED]: "v2.commons.form.errors.wallets.sepa.bic.required",
};

const formSchema = z
  .object({
    ethWallet: z
      .union([z.string().regex(REGEX.ethWallet, keys.invalidEthereumWallet), z.string().length(0)])
      .optional(),
    starknetAddress: z
      .union([z.string().regex(REGEX.starknetAddress, keys.invalidStarknetAddress), z.string().length(0)])
      .optional(),
    optimismAddress: z
      .union([z.string().regex(REGEX.optimismAddress, keys.invalidOptimismAddress), z.string().length(0)])
      .optional(),
    aptosAddress: z
      .union([z.string().regex(REGEX.aptosAddress, keys.invalidAptosAddress), z.string().length(0)])
      .optional(),
    sepaAccount: z.object({
      iban: z.string().optional(),
      bic: z.string().optional(),
    }),
  })
  .superRefine(({ sepaAccount }, context) => {
    const { iban, bic } = sepaAccount;
    if ((iban && !bic) || (!iban && bic)) {
      if (!iban) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: keys.ibanIsRequired,
          path: ["sepaAccount", "iban"],
        });
      }
      if (!bic) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: keys.bicIsRequired,
          path: ["sepaAccount", "bic"],
        });
      }
    }
  });

// TODO: Change input errors with new components
function SettingsPayoutPage() {
  const { T } = useIntl();
  const { id } = useParams<{ id: string }>();
  const { data } = BillingProfilesApi.queries.useGetPayoutInfo({
    params: {
      id,
    },
  });

  const formMethods = useForm<TPayoutForm.Data>({
    mode: "all",
    resolver: zodResolver(formSchema),
  });

  const { handleSubmit, reset, trigger, watch } = formMethods;

  // We need this to trigger in realtime
  useEffect(() => {
    trigger("sepaAccount.iban");
    trigger("sepaAccount.bic");
  }, [watch("sepaAccount.iban"), watch("sepaAccount.bic")]);

  useEffect(() => {
    if (data) {
      reset(formatToData(data));
    }
  }, [data]);

  const {
    mutate: updateUserPayoutInformation,
    isPending: userPayoutInformationIsPending,
    ...restUpdatePayoutInformationMutation
  } = BillingProfilesApi.mutations.useUpdatePayoutSettings({
    params: {
      id,
    },
  });

  useMutationAlert({
    mutation: restUpdatePayoutInformationMutation,
    success: {
      message: T("v2.commons.alert.global.success"),
    },
    error: {
      message: T("v2.commons.alert.global.error"),
    },
  });

  const onSubmit = (formData: TPayoutForm.Data) => {
    updateUserPayoutInformation(formatToSchema(formData));
  };

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <PayoutForm />

        <FormFooter isPending={userPayoutInformationIsPending} isAbsolute={false} />
      </form>
    </FormProvider>
  );
}

export default withAuthenticationRequired(SettingsPayoutPage);
