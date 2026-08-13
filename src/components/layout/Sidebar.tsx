function Sidebar() {
    return (
        <aside className="sidebar">
            <h1>Social</h1>

            <nav>
                <a href="/feed">Feed</a>
                <a href="/perfil">Perfil</a>
                <a href="/contatos">Mensagens</a>
                <a href="/notifications">Notificações</a>
            </nav>
        </aside>
    );
}

export default Sidebar;