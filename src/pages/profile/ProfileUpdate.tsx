import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaCamera } from "react-icons/fa";

import { useProfile } from "../../hooks/useProfile";
import { useUpdateProfile } from "../../hooks/useUpdateProfile";
import { formatePfpL } from "../../utils/formateImgProfile";

import "../../styles/profile-update.css";
import { uploadFile } from "../../service/upload/UpdateService";
import Loading from "../../components/layout/Loading";

function ProfileUpdate() {
    const navigate = useNavigate();

    const { data: profile, isLoading, isError } = useProfile();
    const updateProfileMutation = useUpdateProfile();

    const [name, setName] = useState("");
    const [userName, setUserName] = useState("");
    const [bio, setBio] = useState("");
    const [messageStatus, setMessageStatus] = useState("");

    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);

    useEffect(() => {
        if (profile) {
            setName(profile.name ?? "");
            setUserName(profile.userName ?? "");
            setBio(profile.bio ?? "");
            setMessageStatus(profile.messageStatus ?? "");
        }
    }, [profile]);

    useEffect(() => {
        return () => {
            if (imagePreview) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [imagePreview]);

    if (isLoading) {
        return <Loading />;
    }

    if (isError || !profile) {
        return <p>Erro ao carregar perfil.</p>;
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (!file) {
            return;
        }

        setImageFile(file);

        if (imagePreview) {
            URL.revokeObjectURL(imagePreview);
        }

        const previewUrl = URL.createObjectURL(file);
        setImagePreview(previewUrl);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            let imageUrl = profile.imageUrlProfile;

            if (imageFile) {
                imageUrl = await uploadFile(imageFile);
            }

            updateProfileMutation.mutate({
                name: name.trim(),
                userName: userName.trim(),
                bio: bio.trim(),
                messageStatus: messageStatus.trim(),
                imageUrlProfile: imageUrl,
            });
        } catch (error) {
            console.error("Erro ao enviar imagem:", error);
        }
    };

    return (
        <div className="profile-update">
            <div className="profile-update-header">
                <h1>Edit profile</h1>
                <p>Update how you appear to other artists on Artisphere.</p>
            </div>

            <form className="profile-update-form" onSubmit={handleSubmit}>
                {/* FOTO */}

                <div className="profile-update-photo">
                    <label htmlFor="profile-image" className="profile-image-wrapper">
                        <img
                            src={imagePreview ?? formatePfpL(profile.imageUrlProfile)}
                            alt="Foto de perfil"
                        />

                        <div className="profile-image-overlay">
                            <FaCamera />
                        </div>
                    </label>

                    <input
                        id="profile-image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                    />

                    <div className="profile-photo-info">
                        <strong>Profile picture</strong>

                        <span>
                            {imageFile ? imageFile.name : "Click the photo to change it"}
                        </span>
                    </div>
                </div>

                {/* CAMPOS */}

                <div className="profile-update-fields">
                    <div className="profile-field">
                        <label htmlFor="name">Name</label>

                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div className="profile-field">
                        <label htmlFor="userName">Username</label>

                        <input
                            id="userName"
                            type="text"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                        />
                    </div>

                    <div className="profile-field">
                        <label htmlFor="bio">Bio</label>

                        <textarea
                            id="bio"
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            maxLength={200}
                            rows={4}
                        />

                        <span>{bio.length}/200</span>
                    </div>

                    <div className="profile-field">
                        <label htmlFor="messageStatus">Status</label>

                        <input
                            id="messageStatus"
                            type="text"
                            value={messageStatus}
                            onChange={(e) => setMessageStatus(e.target.value)}
                            maxLength={30}
                        />

                        <span>{messageStatus.length}/30</span>
                    </div>
                </div>

                {/* BOTÕES */}

                <div className="profile-update-actions">
                    <button
                        type="button"
                        className="btn-cancel"
                        onClick={() => navigate(-1)}
                        disabled={updateProfileMutation.isPending}
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        className="btn-save"
                        disabled={updateProfileMutation.isPending}
                    >
                        {updateProfileMutation.isPending ? "Saving..." : "Save changes"}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default ProfileUpdate;