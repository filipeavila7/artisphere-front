import { useState } from "react";

import { useProfile } from "../../hooks/useProfile";
import { useUpdateProfile } from "../../hooks/useUpdateProfile";
import { formatePfpL } from "../../utils/formateImgProfile";

function Me() {
    const { data, isLoading, isError } = useProfile();
    const updateProfileMutation = useUpdateProfile();

    const [isEditing, setIsEditing] = useState(false);
    const [messageStatus, setMessageStatus] = useState("");

    if (isLoading) {
        return <p>Carregando...</p>;
    }

    if (isError || !data) {
        return <p>Erro ao carregar perfil.</p>;
    }

    const handleEdit = () => {
        setMessageStatus(data.messageStatus ?? "");
        setIsEditing(true);
    };

    const handleSave = () => {
        updateProfileMutation.mutate(
            {
                messageStatus: messageStatus.trim(),
            },
            {
                onSuccess: () => {
                    setIsEditing(false);
                },
            }
        );
    };

    return (
        <div className="following">
            <div className="following-data">
                <img
                    className="following-pfp"
                    src={formatePfpL(data.imageUrlProfile)}
                    alt=""
                />

                <p className="following-name">You</p>
            </div>

            {isEditing ? (
                <textarea
                    className="message-status-input"
                    value={messageStatus}
                    onChange={(e) => setMessageStatus(e.target.value)}
                    onBlur={handleSave}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            handleSave();
                        }
                    }}
                    maxLength={30}
                    autoFocus
                    disabled={updateProfileMutation.isPending}
                />
            ) : (
                <div
                    className="message-status-box"
                    onClick={handleEdit}
                >
                    <p className="message-status">
                        {data.messageStatus || "New status..."}
                    </p>
                </div>
            )}
        </div>
    );
}

export default Me;