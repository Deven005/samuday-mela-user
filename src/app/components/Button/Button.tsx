// Function to conditionally join class names
function cn(...classes: (string | false)[]) {
  return classes.filter(Boolean).join(" ");
}

// Button variants type
type Variant =
  | "default"
  | "primary"
  | "secondary"
  | "accent"
  | "ghost"
  | "link"
  | "outline"
  | "info"
  | "success"
  | "warning"
  | "error";

// ButtonProps for TypeScript
type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
};

export const Button = ({
  children,
  className,
  variant = "default",
  ...props
}: ButtonProps) => {
  return (
    <button
      className={cn(
        "btn transition-all duration-200 ease-in-out hover:scale-105 active:scale-95 cursor-pointer",
        variant !== "default" ? `btn-${variant}` : "",
        `${className}`
      )}
      {...props}
    >
      {children}
    </button>
  );
};
