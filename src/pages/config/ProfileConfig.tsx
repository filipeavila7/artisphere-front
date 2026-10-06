

import { useEffect, useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { FaLock, FaGlobe } from "react-icons/fa";



import ConfirmationModal from "../../components/modal/ConfirmationModal";



import {

    myProfile,

    updateMyProfile,

} from "../../service/profile/ProfileService";



import "../../styles/config.css";
import { FaStar } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";



function ProfileConfig() {

    const queryClient = useQueryClient();

    const navigate = useNavigate();

    const [isPrivateProfile, setIsPrivateProfile] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);

    const [pendingVisibility, setPendingVisibility] = useState<boolean | null>(

        null

    );



    const {

        data: profile,

        isLoading,

        isError,

    } = useQuery({

        queryKey: ["my-profile"],

        queryFn: myProfile,

    });



    useEffect(() => {

        if (profile) {

            setIsPrivateProfile(profile.isPrivateProfile);

        }

    }, [profile]);



    const updateProfileMutation = useMutation({

        mutationFn: (isPrivate: boolean) =>

            updateMyProfile({

                isPrivateProfile: isPrivate,

            }),



        onSuccess: (updatedProfile) => {

            setIsPrivateProfile(updatedProfile.isPrivateProfile);

            setIsModalOpen(false);

            setPendingVisibility(null);



            void queryClient.setQueryData(

                ["my-profile"],

                updatedProfile

            );



            void queryClient.invalidateQueries({

                queryKey: ["profile"],

            });

        },

    });



    const handleChangeVisibility = (newValue: boolean) => {

        if (newValue === isPrivateProfile) {

            return;

        }



        setPendingVisibility(newValue);

        setIsModalOpen(true);

    };



    const handleConfirm = () => {

        if (pendingVisibility === null) {

            return;

        }



        updateProfileMutation.mutate(pendingVisibility);

    };



    const handleCancel = () => {

        if (updateProfileMutation.isPending) {

            return;

        }



        setIsModalOpen(false);

        setPendingVisibility(null);

    };



    if (isLoading) {

        return (

            <div className="profile-config-page">

                <p>Carregando configurações...</p>

            </div>

        );

    }



    if (isError || !profile) {

        return (

            <div className="profile-config-page">

                <p>Erro ao carregar configurações.</p>

            </div>

        );

    }



    const isChangingToPrivate = pendingVisibility === true;



    return (

        <div className="profile-config-page">



            <div className="profile-config-header">

                <h1>Profile settings</h1>

                <p>Manage your profile visibility.</p>

            </div>



            <div className="profile-config-section">



                <div className="profile-config-section-header">

                    <h2>Profile visibility</h2>

                    <p>

                        Choose who can access your profile and its content.

                    </p>

                </div>



                <div className="visibility-options">



                    <button

                        className={`visibility-option ${!isPrivateProfile ? "selected" : ""

                            }`}

                        onClick={() => handleChangeVisibility(false)}

                    >

                        <div className="visibility-icon-a">

                            <FaGlobe />

                        </div>



                        <div className="visibility-info">

                            <strong>Public</strong>

                            <span>

                                Anyone can access your profile.

                            </span>

                        </div>



                        <div className="visibility-radio">

                            <span />

                        </div>

                    </button>



                    <button

                        className={`visibility-option ${isPrivateProfile ? "selected" : ""

                            }`}

                        onClick={() => handleChangeVisibility(true)}

                    >

                        <div className="visibility-icon-a">

                            <FaLock />

                        </div>



                        <div className="visibility-info">

                            <strong>Private</strong>

                            <span>

                                Only accepted followers can access your profile.

                            </span>

                        </div>



                        <div className="visibility-radio">

                            <span />

                        </div>

                    </button>



                </div>

                <div className="close-friends-box">
                    <div className="profile-config-section-header">

                        <h2>Close Friends</h2>

                        <p>
                            Choose who can see your private Stories and content shared exclusively with your Close Friends.
                        </p>




                    </div>

                    <div onClick={()=> navigate("/profile/config/close-friends")} className="close-option">
                        <div className="close-icon-box">
                            <div className="visibility-icon-a">

                                <FaStar />

                            </div>
                        </div>

                        <div className="close-content">
                            <strong>View Close Friends list</strong>

                            <span>
                                Manage who can see your private Stories
                            </span>
                        </div>



                    </div>
                </div>



            </div>



            <ConfirmationModal

                isOpen={isModalOpen}

                title={

                    isChangingToPrivate

                        ? "Make profile private?"

                        : "Make profile public?"

                }

                message={

                    isChangingToPrivate

                        ? "Your profile will become private. New users will need to request to follow you before accessing your profile."

                        : "Your profile will become public. Anyone will be able to access your profile."

                }

                confirmText={

                    isChangingToPrivate

                        ? "Make private"

                        : "Make public"

                }

                cancelText="Cancel"

                isLoading={updateProfileMutation.isPending}

                onConfirm={handleConfirm}

                onCancel={handleCancel}

            />



        </div>

    );

}



export default ProfileConfig;

