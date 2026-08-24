import "../../styles/btn.css"

interface ButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    type?: "button" | "submit" | "reset";
}

function Button({
    children,
    onClick,
    type = "button"
}: ButtonProps) {
    return (
        <button
            type={type}
            onClick={onClick}
            className="button"
        >
            {children}
        </button>
    );
}

export default Button;