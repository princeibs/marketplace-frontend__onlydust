import { Disclosure, Transition } from "@headlessui/react";
import { ComponentProps, FC, PropsWithChildren } from "react";

import ArrowDownSLine from "src/icons/ArrowDownSLine";
import { cn } from "src/utils/cn";

import { Avatar } from "../Avatar";
import { Flex } from "../Layout/Flex";

enum Variants {
  DEFAULT = "DEFAULT",
  BLUE = "BLUE",
}

export type Variant = `${Variants}`;

export interface VerticalListItemDropProps extends PropsWithChildren {
  AvatarProps?: Partial<ComponentProps<typeof Avatar>>;
  ContainerProps?: Partial<ComponentProps<typeof Disclosure>>;
  ChildrenContainerProps?: {
    className?: string;
  };
  titleComponent?: React.ReactElement;
  avatarComponent?: React.ReactElement;
  actionComponent?: React.ReactElement;
  title: string;
  avatarSrc: string;
  avatarAlt: string;
  variant?: Variant;
}

export const VerticalListItemDrop: FC<VerticalListItemDropProps> = ({
  AvatarProps = {},
  ContainerProps = {},
  titleComponent,
  avatarComponent,
  actionComponent,
  children,
  ChildrenContainerProps = {},
  variant = Variants.DEFAULT,
  title,
  avatarAlt,
  avatarSrc,
}) => {
  const { className: ContainerClassName, ...RestContainerProps } = ContainerProps;

  return (
    <Disclosure
      defaultOpen
      className={cn(
        "flex w-full flex-col rounded-b-2xl border-b border-card-border-light duration-300 transition-all",
        ContainerClassName
      )}
      {...RestContainerProps}
      as="div"
    >
      {({ open }) => (
        <>
          <Disclosure.Button
            className={cn(
              "sticky -left-0 top-0 z-10 bg-greyscale-900",
              !open && "rounded-b-2xl",
              variant === Variants.BLUE && "bg-card-background-base"
            )}
          >
            <div
              className={cn(
                "rounded-t-2xl border-l border-r border-t border-card-border-light bg-greyscale-900 px-4 py-4 duration-150 transition-all",
                !open && "rounded-b-2xl",
                variant === Variants.BLUE && "bg-card-background-base"
              )}
            >
              <Flex
                className={cn(
                  "items-center justify-between bg-greyscale-900",
                  variant === Variants.BLUE && "bg-card-background-base"
                )}
              >
                <Flex justify="start" item="center" gap={2}>
                  {avatarComponent || (
                    <Avatar src={avatarSrc} alt={avatarAlt} size="6" shape="square" {...AvatarProps} />
                  )}
                  {titleComponent || <p className=" text-sm font-medium uppercase">{title}</p>}
                </Flex>

                <div className="flex items-center justify-end gap-1">
                  <ArrowDownSLine
                    className={cn(
                      "flex items-center justify-center text-[24px] text-greyscale-600 duration-150 ease-out transition-all",
                      open && "rotate-180 transform text-white"
                    )}
                  />
                  {actionComponent}
                </div>
              </Flex>
            </div>
          </Disclosure.Button>
          <Transition
            enter="transition duration-150 ease-out"
            enterFrom="transform scale-95 -translate-y-4 opacity-0"
            enterTo="transform scale-100 translate-y-0 opacity-100"
            leave="transition duration-300 ease-out"
            leaveFrom="transform scale-100 translate-y-0 opacity-100"
            leaveTo="transform scale-100 -translate-y-8 opacity-0"
          >
            <Disclosure.Panel
              className={cn(
                "w-full rounded-b-2xl border-l border-r border-card-border-light p-4 pt-0",
                ChildrenContainerProps.className
              )}
            >
              {children}
            </Disclosure.Panel>
          </Transition>
        </>
      )}
    </Disclosure>
  );
};
