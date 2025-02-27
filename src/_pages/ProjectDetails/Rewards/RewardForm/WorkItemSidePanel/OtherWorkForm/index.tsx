import { sortBy } from "lodash";
import { useParams } from "next/navigation";
import { FormEventHandler, useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useMediaQuery } from "usehooks-ts";

import { components } from "src/__generated/api";
import { liveIssueToCached } from "src/_pages/ProjectDetails/Rewards/RewardForm/WorkItemSidePanel/WorkItems/OtherIssueInput";
import {
  RewardableWorkItem,
  issueToWorkItem,
} from "src/_pages/ProjectDetails/Rewards/RewardForm/WorkItemSidePanel/WorkItems/WorkItems";
import ProjectApi from "src/api/Project";
import useMutationAlert from "src/api/useMutationAlert";
import Button, { Width } from "src/components/Button";
import Callout from "src/components/Callout";
import FormSelect from "src/components/FormSelect";
import { viewportConfig } from "src/config";
import { useIntl } from "src/hooks/useIntl";
import CheckLine from "src/icons/CheckLine";
import DraftLine from "src/icons/DraftLine";
import ExchangeDollarLine from "src/icons/ExchangeDollarLine";
import MoreLine from "src/icons/MoreLine";
import TeamLine from "src/icons/TeamLine";
import isDefined from "src/utils/isDefined";

import Description from "./Description";
import RepoSelect from "./RepoSelect";
import Title from "./Title";
import { OtherWork } from "./types";

type Props = {
  projectId: string;
  contributorHandle: string;
  addWorkItem: (workItem: RewardableWorkItem) => void;
};

export default function OtherWorkForm({ projectId, contributorHandle, addWorkItem }: Props) {
  const { T } = useIntl();
  const isXl = useMediaQuery(`(min-width: ${viewportConfig.breakpoints.xl}px)`);
  const { slug = "" } = useParams<{ slug: string }>();

  const workKinds = [
    { icon: <DraftLine />, label: T("reward.form.contributions.other.kinds.documentation") },
    { icon: <TeamLine />, label: T("reward.form.contributions.other.kinds.meeting") },
    { icon: <ExchangeDollarLine />, label: T("reward.form.contributions.other.kinds.subscription") },
    { icon: <MoreLine />, label: T("reward.form.contributions.other.kinds.other") },
  ];
  const defaultWorkKind = workKinds[0].label;

  const [selectedRepo, setSelectedRepo] = useState<components["schemas"]["GithubRepoResponse"] | null>();
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  const formMethods = useForm<OtherWork>({
    defaultValues: {
      workKind: defaultWorkKind,
    },
  });

  const { watch, setValue, control } = formMethods;
  const workKind = watch("workKind");

  const defaultTitle = T("reward.form.contributions.other.issue.defaultTitle", {
    kind: workKind,
    author: contributorHandle,
  });

  const { data: project } = ProjectApi.queries.useGetProjectBySlug({
    params: { slug },
  });

  const projectRepos = project?.repos || [];

  const repos = sortBy(projectRepos, "name").filter(isDefined);

  useEffect(() => {
    if (!selectedRepo) setSelectedRepo(repos[0]);
  }, [selectedRepo, repos]);

  const clearForm = () => {
    setTitle("");
    setDescription("");
    setValue("workKind", defaultWorkKind);
  };

  const {
    mutate: createOtherWork,
    isPending,
    ...restcreateOtherWorkMutation
  } = ProjectApi.mutations.useCreateOtherWorks({
    params: { projectId },
    options: {
      onSuccess: data => {
        clearForm();
        addWorkItem(issueToWorkItem(liveIssueToCached(data)));
      },
    },
  });

  useMutationAlert({
    mutation: restcreateOtherWorkMutation,
    success: {
      message: T("reward.form.contributions.other.work.success"),
    },
    error: {
      message: T("reward.form.contributions.other.work.error"),
    },
  });

  const onSubmit: FormEventHandler<HTMLFormElement> = e => {
    e.preventDefault();
    createOtherWork({
      githubRepoId: selectedRepo?.id || 0,
      title: title || defaultTitle,
      description,
    });
    e.stopPropagation();
  };

  return (
    <FormProvider {...formMethods}>
      <form className="flex h-full min-h-0 flex-col justify-between overflow-y-auto" onSubmit={onSubmit}>
        <div className="flex min-h-0 flex-col justify-start gap-4 px-6 pt-8 scrollbar-thin scrollbar-thumb-white/12 scrollbar-thumb-rounded scrollbar-w-1.5 xl:pb-0">
          <div className="font-belwe text-base font-normal text-greyscale-50">
            {T("reward.form.contributions.other.title")}
          </div>
          <FormSelect name="workKind" options={workKinds} control={control} />
          <Title title={title} setTitle={setTitle} defaultTitle={defaultTitle} />
          <Description description={description} setDescription={setDescription} />
          <div className="mb-8">
            <Callout>{T("reward.form.contributions.other.callout")}</Callout>
          </div>
        </div>
        <div className="flex flex-row justify-between gap-8 border-t border-greyscale-50/8 bg-white/2 p-4 xl:px-6 xl:py-8">
          {selectedRepo ? <RepoSelect repos={repos} repo={selectedRepo} setRepo={setSelectedRepo} /> : <div />}
          <Button
            width={Width.Fit}
            disabled={!workKind || !description || isPending || !selectedRepo?.hasIssues}
            htmlType="submit"
          >
            {isXl && <CheckLine />}
            {T("reward.form.contributions.other.footer.submitButton")}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
