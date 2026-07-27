"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "../../lib/utils";

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root>) {
  const values = React.useMemo(
    () => value ?? defaultValue ?? [min],
    [defaultValue, min, value],
  );

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      className={cn(
        "relative flex min-h-11 w-full touch-none select-none items-center data-[disabled]:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-11 data-[orientation=vertical]:flex-col",
        className,
      )}
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-[2px] bg-survey-line data-[orientation=vertical]:h-full data-[orientation=vertical]:w-2">
        <SliderPrimitive.Range className="absolute h-full bg-lightning data-[orientation=vertical]:w-full" />
      </SliderPrimitive.Track>
      {values.map((_, index) => (
        <SliderPrimitive.Thumb
          key={index}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          className="block size-6 shrink-0 rounded-[3px] border-2 border-lightning bg-ink shadow-[0_0_0_4px_rgb(244_201_93_/_0.12)] outline-none transition-[box-shadow,background-color] focus-visible:ring-[3px] focus-visible:ring-ring/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none"
        />
      ))}
    </SliderPrimitive.Root>
  );
}

export { Slider };
