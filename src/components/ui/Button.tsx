import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "../../lib/utils";
import { motion, HTMLMotionProps } from "motion/react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "gabon";
  size?: "sm" | "md" | "lg" | "icon";
}

// Combine for motion support if needed, but keeping it simple for base
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    const variants = {
      primary: "bg-love-red text-white hover:bg-rose-600 shadow-sm",
      secondary: "bg-stone-800 text-stone-50 hover:bg-stone-700",
      outline: "border-2 border-stone-200 bg-transparent hover:bg-stone-50 text-stone-800",
      ghost: "bg-transparent hover:bg-stone-100 text-stone-600",
      gabon: "bg-gabon-green text-white hover:bg-green-700",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-5 py-2.5",
      lg: "px-8 py-3.5 text-lg",
      icon: "p-2",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-full font-medium transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export default Button;
