import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { c as cn } from "./router-DVpNmuSS.mjs";
import { R as Root } from "../_libs/radix-ui__react-label.mjs";
const Input = reactExports.forwardRef(({ className, type, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  "input",
  {
    type,
    ref,
    className: cn(
      "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-[var(--shadow-soft)] transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50",
      className
    ),
    ...props
  }
));
Input.displayName = "Input";
const Label = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Root,
  {
    ref,
    className: cn(
      "text-sm font-medium leading-none text-foreground/80 peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
      className
    ),
    ...props
  }
));
Label.displayName = Root.displayName;
export {
  Input as I,
  Label as L
};
