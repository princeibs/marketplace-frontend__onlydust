import { Input as NextInput } from "@nextui-org/react";

import { cn } from "src/utils/cn";

import { Icon } from "components/layout/icon/icon";

import { TInput } from "./input.types";

export function Input(props: TInput.Props) {
  return (
    <NextInput
      className="h-fit flex-col items-start gap-2"
      classNames={{
        mainWrapper: "w-full",
        inputWrapper: cn(
          "rounded-lg border border-greyscale-50/8 bg-white/5 focus-within:!border-spacePurple-500 focus-within:bg-spacePurple-900 focus-within:ring-1 focus-within:ring-spacePurple-500 hover:border hover:border-greyscale-50/8 h-8 min-h-8 px-3 py-2 transition-none",
          "group-data-[invalid=true]:!border-greyscale-50/8 group-data-[invalid=true]:focus-within:!border-spacePurple-500"
        ),
        innerWrapper: "gap-2",
        input:
          "!p-0 !od-text-body-s group-data-[invalid=true]:!text-greyscale-50 text-greyscale-50 focus:placeholder:text-spacePurple-200/60 placeholder:text-spaceBlue-200",
        label:
          "!od-text-body-s-bold !p-0 pointer-events-auto text-greyscale-50 group-data-[invalid=true]:!text-greyscale-50 w-full",
        helperWrapper: "p-0 mt-2",
        description: "!od-text-body-xs text-greyscale-200 group-data-[invalid=true]:!text-greyscale-200",
        errorMessage: "group-data-[invalid=true]:!text-greyscale-200",
      }}
      variant="bordered"
      labelPlacement="outside-left"
      {...props}
      label={
        <div className="flex w-full flex-row items-center justify-between">
          {props.label}
          {props.isInvalid ? <Icon remixName="ri-error-warning-line" size={16} className="text-orange-500" /> : null}
        </div>
      }
    />
  );
}
