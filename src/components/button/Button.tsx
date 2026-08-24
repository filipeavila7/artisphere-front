import "../../styles/btn.css"

// interface para definir quais propriedades o botao vai receber
interface ButtonProps {
    children: React.ReactNode; // conteudo dentro do componente 
    icon?: React.ReactNode; // icone, o ? siginfica que sera opcional
    onClick?: () => void; // onclick opcional, passa uma função quando é clicado
    type?: "button" | "submit" | "reset"; // tipos do botao 
}

// faz destructuring da interface
function Button({
    children,
    icon,
    onClick,
    type = "button" // tipo do botao por padrão
}: ButtonProps) {
    return (
        // retorna um botao com as propriedades passadas como parametros
        <button
            type={type}
            onClick={onClick}
            className="button"
        >
            {icon}
            <span>{children}</span>
        </button>
    );
}

export default Button;