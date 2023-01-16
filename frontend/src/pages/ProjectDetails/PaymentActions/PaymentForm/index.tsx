import { gql } from "@apollo/client";
import { HasuraUserRole } from "src/types";
import { useForm, SubmitHandler, FormProvider } from "react-hook-form";
import { useHasuraMutation, useHasuraQuery } from "src/hooks/useHasuraQuery";
import { Inputs } from "./types";
import Input from "src/components/FormInput";
import { useEffect, useState } from "react";
import { useIntl } from "src/hooks/useIntl";
import Card from "src/components/Card";
import EstimationComponent, { BASE_RATE_USD } from "./EstimationComponent";
import { FindUserQueryForPaymentFormQuery } from "src/__generated/graphql";
import { debounce } from "lodash";

const DEFAULT_NUMBER_OF_DAYS = 2;

const REGEX_VALID_GITHUB_PULL_REQUEST_URL = /https:\/\/github\.com\/([\w-]+)\/([\w-]+)\/pull\/\d+/g;

interface PaymentFormProps {
  projectId: string;
  budget: {
    remainingAmount: number;
    initialAmount: number;
  };
}

const PaymentForm: React.FC<PaymentFormProps> = ({ projectId, budget }) => {
  const { T } = useIntl();
  const formMethods = useForm<Inputs>({
    defaultValues: {
      linkToIssue: "",
      contributor: "",
      remainingBudget: budget.remainingAmount,
    },
  });

  const [numberOfDays, setNumberOfDays] = useState(DEFAULT_NUMBER_OF_DAYS);

  const tryIncreaseNumberOfDays = () => {
    const increment = numberOfDays < 1 ? 0.5 : 1;
    if (numberOfDays < 20 && budget.remainingAmount - (numberOfDays + increment) * BASE_RATE_USD >= 0) {
      setNumberOfDays(numberOfDays + increment);
    }
  };

  const tryDecreaseNumberOfDays = () => {
    if (numberOfDays > 0.5) {
      const decrement = numberOfDays == 1 ? 0.5 : 1;
      setNumberOfDays(numberOfDays - decrement);
    }
  };

  const [insertPayment] = useHasuraMutation(REQUEST_PAYMENT_MUTATION, HasuraUserRole.RegisteredUser, {
    variables: { projectId, amount: numberOfDays * BASE_RATE_USD },
  });

  const { handleSubmit, setError, clearErrors } = formMethods;

  const [contributorLogin, setContributorLogin] = useState("");

  const findUserQuery = useHasuraQuery<FindUserQueryForPaymentFormQuery>(
    FIND_USER_QUERY,
    HasuraUserRole.RegisteredUser,
    {
      skip: !contributorLogin,
      variables: {
        username: contributorLogin,
      },
      context: {
        ignoreGraphQLErrors: true, // tell ApolloWrapper to ignore the errors
      },
    }
  );

  useEffect(() => {
    if (findUserQuery.error) {
      setError("contributor", { message: T("github.invalidLogin") });
    } else {
      clearErrors("contributor");
    }
  }, [findUserQuery.error]);

  const onSubmit: SubmitHandler<Inputs> = async formData => {
    await insertPayment(mapFormDataToSchema(formData, findUserQuery.data?.fetchUserDetails.id));
    window.location.reload();
  };

  return (
    <>
      <FormProvider {...formMethods}>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3 justify-between w-full">
          <div className="flex flex-col gap-3">
            <Card>
              <div className="flex flex-col gap-8 w-full">
                <div className="flex flex-col">
                  <Input
                    label={T("payment.form.contributor")}
                    name="contributor"
                    placeholder="Github login"
                    options={{
                      required: T("form.required"),
                      validate: () => !!findUserQuery.data?.fetchUserDetails.id || T("github.invalidLogin"),
                    }}
                    onChange={debounce(({ target }) => setContributorLogin(target.value), 500)}
                    loading={findUserQuery.loading}
                  />
                  <Input
                    label={T("payment.form.linkToIssue")}
                    name="linkToIssue"
                    placeholder=""
                    options={{
                      required: T("form.required"),
                      pattern: { value: REGEX_VALID_GITHUB_PULL_REQUEST_URL, message: T("payment.form.invalidPRLink") },
                    }}
                  />
                </div>
              </div>
            </Card>
            <EstimationComponent
              numberOfDays={numberOfDays}
              decreaseNumberOfDays={tryDecreaseNumberOfDays}
              increaseNumberOfDays={tryIncreaseNumberOfDays}
              budget={budget}
              submitDisabled={findUserQuery.loading}
            />
          </div>
        </form>
      </FormProvider>
    </>
  );
};

export const REQUEST_PAYMENT_MUTATION = gql`
  mutation RequestPayment($amount: Int!, $contributorId: Int!, $projectId: Uuid!, $reason: Reason!) {
    requestPayment(amountInUsd: $amount, projectId: $projectId, reason: $reason, recipientId: $contributorId)
  }
`;

export const FIND_USER_QUERY = gql`
  query FindUserQueryForPaymentForm($username: String!) {
    fetchUserDetails(username: $username) {
      id
    }
  }
`;

const mapFormDataToSchema = ({ linkToIssue }: Inputs, contributorId?: number) => {
  return {
    variables: {
      contributorId,
      reason: {
        workItems: [linkToIssue],
      },
    },
  };
};

export default PaymentForm;
