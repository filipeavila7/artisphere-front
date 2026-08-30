import { useState } from "react";

import "../../styles/contacts.css"

function MyFollows() {
  const [isOpen, setIsOpen] = useState(false);

    return (
        <aside className={`contacts-panel ${isOpen ? "open" : "closed"}`}>
            
            <button className="btn-my-follows" onClick={() => setIsOpen(prev => !prev)}>
                {isOpen ? ">>" : "<<"}
            </button>

            {isOpen && (
                <div className="contacts-content">
                    <h2>Conversas</h2>

                    {/* suas conversas aqui */}
                </div>
            )}

        </aside>
    );
}


export default MyFollows