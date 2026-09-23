import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { getMyPostById, deletePost } from "../../service/post/PostService";
import { likePost, unlikePost } from "../../service/like/likeService";
import { createSave, deleteSave } from "../../service/save/SaveService";

import PostDate from "../../components/post/PostDate";
import CommentsModal from "../../components/post/CommentModal";
import ConfirmationModal from "../../components/modal/ConfirmationModal";

import { HiOutlineDotsVertical } from "react-icons/hi";
import {
  FaHeart,
  FaBookmark,
  FaRegBookmark,
  FaRegComment,
  FaRegHeart
} from "react-icons/fa6";
import { CiShare2 } from "react-icons/ci";
import { MdDeleteForever } from "react-icons/md";

import "../../styles/post.css";

function MyPostDetails() {

  const { postId } = useParams();
  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);


  /*
   * POST
   */
  const {
    data,
    isLoading,
    isError
  } = useQuery({
    queryKey: ["mypost", postId],
    queryFn: () => getMyPostById(Number(postId)),
    enabled: !!postId,
  });


  /*
   * LIKE / UNLIKE
   */
  const likeMutation = useMutation({

    mutationFn: async () => {

      if (data?.likedByMe) {
        await unlikePost(Number(postId));
      } else {
        await likePost(Number(postId));
      }

    },

    onSuccess: () => {

      queryClient.invalidateQueries({
        queryKey: ["mypost", postId],
      });

      queryClient.invalidateQueries({
        queryKey: ["feed"],
      });

      queryClient.invalidateQueries({
        queryKey: ["my-posts-liked"],
      });

      queryClient.invalidateQueries({
        queryKey: ["my-posts"],
      });

    },

  });


  const handleLike = () => {

    if (likeMutation.isPending) {
      return;
    }

    likeMutation.mutate();

  };


  /*
   * SAVE / UNSAVE
   */
  const saveMutation = useMutation({

    mutationFn: async () => {

      if (data?.saveByMe) {
        await deleteSave(Number(postId));
      } else {
        await createSave(Number(postId));
      }

    },

    onSuccess: () => {

      queryClient.invalidateQueries({
        queryKey: ["mypost", postId],
      });

      queryClient.invalidateQueries({
        queryKey: ["feed"],
      });

      queryClient.invalidateQueries({
        queryKey: ["my-posts-saved"],
      });

    },

  });


  const handleSave = () => {

    if (saveMutation.isPending) {
      return;
    }

    saveMutation.mutate();

  };


  /*
   * CLOSE DROPDOWN WHEN CLICKING OUTSIDE
   */
  useEffect(() => {

    const handleClickOutside = (event: MouseEvent) => {

      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }

    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };

  }, []);


  /*
   * DELETE POST
   */
  const deletePostMutation = useMutation({

    mutationFn: () => deletePost(Number(postId)),

    onSuccess: async () => {

      setIsDeleteModalOpen(false);

      await queryClient.invalidateQueries({
        queryKey: ["mypost"],
      });

      await queryClient.invalidateQueries({
        queryKey: ["my-posts"],
      });

      await queryClient.invalidateQueries({
        queryKey: ["feed"],
      });

      navigate("/profile");
    },

  });


  if (isLoading) {
    return <p>Carregando...</p>;
  }

  if (isError || !data) {
    return <p>Erro ao carregar o post.</p>;
  }


  const handleDeleteClick = () => {
    setIsDropdownOpen(false);
    setIsDeleteModalOpen(true);
  };


  const handleConfirmDelete = () => {
    deletePostMutation.mutate();
  };


  return (
    <main className="feed-lay">

      <div className="post-details-box">

        <div className="post-details-content">

          <img
            className="post-details-img"
            src={data.imageUrl}
            alt={data.title}
          />

        </div>


        <div className="post-details-data-box">

          <div className="post-data-lay">

            <div className="post-user-data-box">

              <img
                className="user-post-pfp"
                src={data.user.profileImageUrl}
                alt=""
              />

              <div className="post-user-data">

                <p>{data.user.name}</p>

                <span>
                  @{data.user.userName}
                </span>

                <PostDate date={data.createdAt} />

              </div>

            </div>


            <div className="post-details-actions">

              <div
                className="post-options"
                ref={dropdownRef}
              >

                <button
                  className="post-options-button"
                  onClick={() =>
                    setIsDropdownOpen((prev) => !prev)
                  }
                >
                  <HiOutlineDotsVertical className="action-icon" />
                </button>


                {isDropdownOpen && (

                  <div className="post-options-dropdown">

                    <button
                      className="post-delete-option"
                      onClick={handleDeleteClick}
                    >
                      <MdDeleteForever />
                      Delete post
                    </button>

                  </div>

                )}

              </div>

            </div>

          </div>


          <div className="post-data-content">

            <div className="post-title">
              <h3>{data.title}</h3>
            </div>


            <div className="post-tags">

              {data.tags.map((tag) => (
                <span key={tag.id}>
                  #{tag.name}
                </span>
              ))}

            </div>


            <div className="post-description-box-a">

              <p>{data.description}</p>

            </div>


            <div className="post-action-box">

              {/* LIKE */}
              <div
                className={`action ${
                  data.likedByMe ? "action-liked" : ""
                }`}
                onClick={handleLike}
              >

                {data.likedByMe ? (
                  <FaHeart className="liked" />
                ) : (
                  <FaRegHeart className="unliked" />
                )}

                <p>
                  {data.likesCount}
                </p>

              </div>


              {/* COMMENTS */}
              <div
                className="action"
                onClick={() => setIsCommentsOpen(true)}
              >

                <FaRegComment />

                <p>
                  {data.commentsCount}
                </p>

              </div>


              {/* SHARE */}
              <div className="action">

                <CiShare2 className="icon-share" />

                0

              </div>


              {/* SAVE */}
              <div
                className={`action-l ${
                  data.saveByMe ? "action-saved" : ""
                }`}
                onClick={handleSave}
              >

                {data.saveByMe ? (
                  <FaBookmark />
                ) : (
                  <FaRegBookmark />
                )}

              </div>

            </div>

          </div>

        </div>

      </div>


      <CommentsModal
        postId={Number(postId)}
        isOpen={isCommentsOpen}
        onClose={() => setIsCommentsOpen(false)}
      />


      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        title="Delete post?"
        message="Are you sure you want to delete this post? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={deletePostMutation.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
      />

    </main>
  );
}


export default MyPostDetails;