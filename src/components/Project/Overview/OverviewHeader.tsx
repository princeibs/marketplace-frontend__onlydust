"use client";

import process from "process";
import { useMemo, useState } from "react";

import { ProjectConstants } from "src/api/Project/constants";
import { UseGetProjectBySlugResponse } from "src/api/Project/queries";
import { IMAGES } from "src/assets/img";
import MarkdownPreview from "src/components/MarkdownPreview";
import { withTooltip } from "src/components/Tooltip";
import { useIntl } from "src/hooks/useIntl";
import LockFill from "src/icons/LockFill";

import { SelectableTagItem } from "components/ds/form/selectable-tag/selectable-tag-item/selectable-tag-item";
import { Tooltip } from "components/ds/tooltip/tooltip";
import { Icon } from "components/layout/icon/icon";
import { Translate } from "components/layout/translate/translate";

export interface ProjectOverviewHeaderProps {
  project: UseGetProjectBySlugResponse;
  description?: boolean;
}

const LOREM_IPSUM = `
Lorem ipsum dolor sit amet, consectetur *adipiscing elit*. Sed non risus. **Suspendisse lectus** tortor, dignissim sit amet:
- adipiscing nec
- ultricies sed
- dolor.

Cras elementum ultrices diam. Maecenas ligula massa, varius a, semper congue, euismod non, mi. Proin porttitor, orci nec nonummy molestie, enim est eleifend mi, non fermentum diam nisl sit amet erat. Duis semper. Duis arcu massa, scelerisque vitae, consequat in, pretium a, enim. Pellentesque congue.
`;

export const ProjectOverviewHeader = ({ project, description = true }: ProjectOverviewHeaderProps) => {
  const [isError, setIsError] = useState(false);
  const dpr = window.devicePixelRatio;
  const optimizeSrc = useMemo(() => {
    if (isError) {
      return IMAGES.logo.space;
    }
    if (project?.logoUrl) {
      return `${process.env.NEXT_PUBLIC_CLOUDFLARE_RESIZE_PREFIX}width=${80 * dpr},height=${80 * dpr},fit=cover/${
        project?.logoUrl
      }`;
    }

    return IMAGES.logo.space;
  }, [project?.logoUrl, isError]);
  const { T } = useIntl();

  const Tags = useMemo(() => {
    if (!project?.tags) {
      return null;
    }

    return (
      <>
        {project.tags.map(tag => {
          const { icon, label, tooltip } = ProjectConstants.tagMapping[tag];

          return (
            <Tooltip key={label} content={<Translate token={tooltip} />}>
              <SelectableTagItem.Static>
                <Icon {...icon} />
                <Translate token={label} />
              </SelectableTagItem.Static>
            </Tooltip>
          );
        })}
      </>
    );
  }, [project]);

  return (
    <>
      <div className="flex flex-row items-center gap-4">
        <img
          alt={project.name || ""}
          src={optimizeSrc}
          loading="lazy"
          className="h-20 w-20 flex-shrink-0 rounded-lg bg-spaceBlue-900 object-cover"
          onError={() => setIsError(true)}
        />
        <div className="flex w-full flex-col gap-1">
          <div className="flex flex-row items-center justify-between font-belwe text-2xl font-normal text-greyscale-50">
            {project.name}
            {project.visibility === "PRIVATE" && (
              <div
                className="flex flex-row items-center gap-2 rounded-lg bg-orange-900 px-2.5 py-1 font-walsheim text-xs font-medium text-orange-500 hover:cursor-default"
                {...withTooltip(T("project.visibility.private.tooltip"))}
              >
                <LockFill /> {T("project.visibility.private.name")}
              </div>
            )}
          </div>

          {project.tags?.length ? <div className="hidden flex-wrap gap-2 lg:flex">{Tags}</div> : null}
        </div>
      </div>
      {project.tags?.length ? <div className="flex flex-wrap gap-2 lg:hidden">{Tags}</div> : null}
      {description ? (
        <MarkdownPreview className="text-sm">{project.longDescription || LOREM_IPSUM}</MarkdownPreview>
      ) : null}
    </>
  );
};
