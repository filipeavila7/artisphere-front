import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import ConfirmationModal from "../../components/modal/ConfirmationModal";
import { useMyConnections } from "../../hooks/useMyConnections";

import "../../styles/close.css";

import {
    getMyCloseFriends,
    addUsersInCloseFriends,
    removeUsersFromCloseFriends
} from "../../service/close-friends/CloseFriendsService";

import type { UserResponse } from "../../types/user/UserResponse";

function CloseFriends() {

    const queryClient = useQueryClient();

    const {
        data: connectionsData,
        isLoading: isLoadingConnections,
        isFetchingNextPage,
        fetchNextPage,
        hasNextPage,
    } = useMyConnections();

    const {
        data: closeFriendsData,
        isLoading: isLoadingCloseFriends,
    } = useQuery({
        queryKey: ["my-close-friends"],
        queryFn: () => getMyCloseFriends(0, 20),
    });

    const connections = useMemo(() => {
        return connectionsData?.pages.flatMap(
            (page) => page.content
        ) ?? [];
    }, [connectionsData]);

    /*
     * IDs das pessoas que já estão nos melhores amigos.
     */
    const closeFriendIds = useMemo(() => {
        return new Set(
            closeFriendsData?.content.map(
                (closeFriend) => closeFriend.friend.id
            ) ?? []
        );
    }, [closeFriendsData]);

    const [selectedIds, setSelectedIds] = useState<Set<number>>(
        new Set()
    );

    const [initialized, setInitialized] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);

    const [isSaving, setIsSaving] = useState(false);

    /*
     * Inicializa os checkboxes com os melhores amigos
     * retornados pelo endpoint /close-friends.
     */
    useEffect(() => {

        if (
            !initialized &&
            !isLoadingCloseFriends
        ) {
            setSelectedIds(new Set(closeFriendIds));
            setInitialized(true);
        }

    }, [
        closeFriendIds,
        initialized,
        isLoadingCloseFriends
    ]);

    const closeFriends = useMemo(() => {
        return connections.filter((user) =>
            selectedIds.has(user.id)
        );
    }, [
        connections,
        selectedIds
    ]);

    const otherConnections = useMemo(() => {
        return connections.filter(
            (user) => !selectedIds.has(user.id)
        );
    }, [
        connections,
        selectedIds
    ]);

    function handleToggle(userId: number) {

        setSelectedIds((current) => {

            const next = new Set(current);

            if (next.has(userId)) {
                next.delete(userId);
            } else {
                next.add(userId);
            }

            return next;
        });
    }

    function handleSave() {
        setIsModalOpen(true);
    }

    async function handleConfirmSave() {

        const originalIds = new Set(closeFriendIds);

        const userIdsToAdd: number[] = [];
        const userIdsToRemove: number[] = [];

        selectedIds.forEach((userId) => {

            if (!originalIds.has(userId)) {
                userIdsToAdd.push(userId);
            }

        });

        originalIds.forEach((userId) => {

            if (!selectedIds.has(userId)) {
                userIdsToRemove.push(userId);
            }

        });

        try {

            setIsSaving(true);

            if (userIdsToAdd.length > 0) {

                await addUsersInCloseFriends({
                    userIds: userIdsToAdd,
                });

            }

            if (userIdsToRemove.length > 0) {

                await removeUsersFromCloseFriends({
                    userIds: userIdsToRemove,
                });

            }

            await queryClient.invalidateQueries({
                queryKey: ["my-close-friends"],
            });

            await queryClient.invalidateQueries({
                queryKey: ["my-connections"],
            });

            setIsModalOpen(false);

        } finally {

            setIsSaving(false);

        }
    }

    function renderUser(user: UserResponse) {

        return (
            <label
                key={user.id}
                className="close-friends-user"
            >

                <div className="close-friends-user-info">

                    <img
                        src={
                            user.profileImageUrl ||
                            "/null-pfp.png"
                        }
                        alt=""
                        className="close-friends-avatar"
                    />

                    <div className="close-friends-user-data">

                        <strong>
                            {user.name}
                        </strong>

                        <span>
                            @{user.userName}
                        </span>

                    </div>

                </div>

                <input
                    type="checkbox"
                    checked={selectedIds.has(user.id)}
                    onChange={() =>
                        handleToggle(user.id)
                    }
                />

            </label>
        );
    }

    if (
        isLoadingConnections ||
        isLoadingCloseFriends
    ) {
        return (
            <div className="close-friends-page">
                <p>
                    Carregando conexões...
                </p>
            </div>
        );
    }

    return (
        <div className="close-friends-page">

            <header className="close-friends-header">

                <div className="close-friends-title">

                    <h1>Close Friends</h1>

                    <p>
                        Choose who can see your exclusive Close Friends Stories.
                    </p>

                </div>

                <button
                    className="close-friends-save"
                    onClick={handleSave}
                    disabled={isSaving}
                >
                    {isSaving
                        ? "Saving..."
                        : "Save"
                    }
                </button>

            </header>

            <main className="close-friends-content">

                <section className="close-friends-section">

                    <div className="section-header">

                        <div>

                            <h2>
                                Close Friends
                            </h2>

                            <p>
                                People who are already on your Close Friends list.
                            </p>

                        </div>

                        <span>
                            {closeFriends.length}
                        </span>

                    </div>

                    <div className="close-friends-list">

                        {closeFriends.length === 0 ? (

                            <div className="empty-close-friends">

                                <p>
                                    You haven't added anyone to your Close Friends list yet.
                                </p>

                            </div>

                        ) : (

                            closeFriends.map(renderUser)

                        )}

                    </div>

                </section>

                <section className="close-friends-section">

                    <div className="section-header">

                        <div>

                            <h2>
                                Connections
                            </h2>

                            <p>
                                People you follow or who follow you.
                            </p>

                        </div>

                        <span>
                            {otherConnections.length}
                        </span>

                    </div>

                    <div className="close-friends-list">

                        {otherConnections.length === 0 ? (

                            <div className="empty-close-friends">

                                <p>
                                    There are no other connections.
                                </p>

                            </div>

                        ) : (

                            otherConnections.map(renderUser)

                        )}

                    </div>

                </section>

                {hasNextPage && (

                    <button
                        type="button"
                        onClick={() => fetchNextPage()}
                        disabled={isFetchingNextPage}
                    >
                        {isFetchingNextPage
                            ? "Loading..."
                            : "Load more"
                        }
                    </button>

                )}

            </main>

            <ConfirmationModal
                isOpen={isModalOpen}
                title="Save Close Friends?"
                message="The changes to your Close Friends list will be applied."
                confirmText="Save"
                cancelText="Cancel"
                onConfirm={handleConfirmSave}
                onCancel={() =>
                    setIsModalOpen(false)
                }
                isLoading={isSaving}
            />

        </div>
    );
}

export default CloseFriends;