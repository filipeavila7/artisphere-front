import { useEffect, useRef, useState } from "react";
import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { FaImage, FaPlus, FaTimes } from "react-icons/fa";

import { uploadFile } from "../../service/upload/UpdateService";
import { createPost } from "../../service/post/PostService";
import { useToast } from "../../hooks/useToast";

import "../../styles/new-post.css";

function NewPost() {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { showToast } = useToast();

    const [file, setFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState("");

    const createMutation = useMutation({
        mutationFn: async () => {
            if (!file) {
                throw new Error("Please select an image");
            }

            // Faz o upload somente quando publicar
            const imageUrl = await uploadFile(file);

            return createPost({
                title: title.trim(),
                description: description.trim(),
                imageUrl,
                tags,
            });
        },

        onSuccess: async () => {
            // Atualiza o feed e outras listas que exibem posts
            await queryClient.invalidateQueries({
                queryKey: ["posts"],
            });

            await queryClient.invalidateQueries({
                queryKey: ["my-posts"],
            });

            await queryClient.invalidateQueries({
                queryKey: ["my-posts-saved"],
            });

            showToast(
                "success",
                "Post publicado com sucesso!"
            );

            navigate("/feed");
        },

        onError: (error) => {
            console.error(error);

            showToast(
                "error",
                "Não foi possível publicar o post. Tente novamente."
            );
        },
    });

    useEffect(() => {
        return () => {
            if (imagePreview) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [imagePreview]);

    const handleFileChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const selectedFile = event.target.files?.[0];

        if (!selectedFile) return;

        if (!selectedFile.type.startsWith("image/")) {
            showToast(
                "warning",
                "Selecione um arquivo de imagem."
            );

            return;
        }

        if (imagePreview) {
            URL.revokeObjectURL(imagePreview);
        }

        setFile(selectedFile);
        setImagePreview(URL.createObjectURL(selectedFile));
    };

    const handleImageClick = () => {
        fileInputRef.current?.click();
    };

    const addTag = () => {
        const tag = tagInput
            .trim()
            .replace(/^#/, "")
            .toLowerCase();

        if (!tag) return;

        if (tags.length >= 5) {
            showToast(
                "warning",
                "Você pode adicionar no máximo 5 tags."
            );

            return;
        }

        if (tags.includes(tag)) {
            setTagInput("");

            showToast(
                "warning",
                "Essa tag já foi adicionada."
            );

            return;
        }

        setTags((prev) => [...prev, tag]);
        setTagInput("");
    };

    const handleTagKeyDown = (
        event: React.KeyboardEvent<HTMLInputElement>
    ) => {
        if (event.key !== "Enter") return;

        event.preventDefault();

        addTag();
    };

    const removeTag = (tagToRemove: string) => {
        setTags((prev) =>
            prev.filter((tag) => tag !== tagToRemove)
        );
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();

        if (!file) {
            showToast(
                "warning",
                "Selecione uma imagem para publicar."
            );

            return;
        }

        if (!title.trim()) {
            showToast(
                "warning",
                "Digite um título para o post."
            );

            return;
        }

        createMutation.mutate();
    };

    return (
        <main className="new-post-page">
            <form
                className="new-post-layout"
                onSubmit={handleSubmit}
            >
                <div className="new-post-box-up">

                    {/* IMAGE */}
                    <div className="new-post-img-box">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            hidden
                        />

                        {imagePreview ? (
                            <div className="new-post-image-preview">
                                <img
                                    src={imagePreview}
                                    alt="Post preview"
                                />

                                <button
                                    type="button"
                                    className="change-image-button"
                                    onClick={handleImageClick}
                                >
                                    <FaImage />
                                    Change image
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                className="image-upload-button"
                                onClick={handleImageClick}
                            >
                                <div className="image-upload-icon">
                                    <FaImage />
                                </div>

                                <span className="image-upload-title">
                                    Add an image
                                </span>

                                <span className="image-upload-subtitle">
                                    Click to select an image
                                </span>
                            </button>
                        )}
                    </div>

                    {/* TAGS */}
                    <div className="new-post-tags-box">
                        <div className="new-post-section-header">
                            <h2>Tags</h2>

                            <span>
                                {tags.length}/5
                            </span>
                        </div>

                        <div className="tags-container">
                            {tags.map((tag) => (
                                <div
                                    className="post-tag"
                                    key={tag}
                                >
                                    <span>
                                        #{tag}
                                    </span>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            removeTag(tag)
                                        }
                                        aria-label={`Remove ${tag}`}
                                    >
                                        <FaTimes />
                                    </button>
                                </div>
                            ))}

                            <div className="tag-input-container">
                                <span className="tag-hash">
                                    #
                                </span>

                                <input
                                    type="text"
                                    value={tagInput}
                                    onChange={(event) =>
                                        setTagInput(
                                            event.target.value
                                        )
                                    }
                                    onKeyDown={handleTagKeyDown}
                                    placeholder={
                                        tags.length < 5
                                            ? "Add a tag..."
                                            : "Maximum reached"
                                    }
                                    disabled={
                                        tags.length >= 5
                                    }
                                />

                                <button
                                    type="button"
                                    className="add-tag-button"
                                    onClick={addTag}
                                    disabled={
                                        !tagInput.trim() ||
                                        tags.length >= 5
                                    }
                                >
                                    <FaPlus />
                                </button>
                            </div>
                        </div>

                        <p className="tags-hint">
                            Press Enter to add a tag
                        </p>
                    </div>
                </div>

                <div className="new-post-box-down">

                    {/* TITLE */}
                    <div className="post-title-box">
                        <div className="input-header">
                            <label htmlFor="post-title">
                                Title
                            </label>

                            <span>
                                {title.length}/40
                            </span>
                        </div>

                        <input
                            id="post-title"
                            type="text"
                            value={title}
                            onChange={(event) =>
                                setTitle(event.target.value)
                            }
                            maxLength={40}
                            placeholder="Give your artwork a title..."
                            required
                        />
                    </div>

                    {/* DESCRIPTION */}
                    <div className="post-description-box">
                        <div className="input-header">
                            <label htmlFor="post-description">
                                Description
                            </label>

                            <span>
                                {description.length}/150
                            </span>
                        </div>

                        <textarea
                            id="post-description"
                            value={description}
                            onChange={(event) =>
                                setDescription(
                                    event.target.value
                                )
                            }
                            maxLength={150}
                            placeholder="Tell something about your artwork..."
                        />
                    </div>
                </div>

                <div className="new-post-actions">
                    <button
                        type="submit"
                        className="publish-post-button"
                        disabled={
                            !file ||
                            !title.trim() ||
                            createMutation.isPending
                        }
                    >
                        {createMutation.isPending
                            ? "Publishing..."
                            : "Publish post"}
                    </button>
                </div>
            </form>
        </main>
    );
}

export default NewPost;