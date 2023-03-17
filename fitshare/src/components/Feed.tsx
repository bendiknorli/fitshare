import firebase from "firebase/compat/app";
import { Post } from '../components/Post';
import './../style/App.css';
import './../style/NewProgram.css';
import { useState, useEffect } from 'react';
import { useDocumentData } from "react-firebase-hooks/firestore";

interface Post {
    id: string;
    name: string;
    description: string;
    program: ProgramView;
    timeStamp: firebase.firestore.Timestamp;
    likes: number;
    liked: boolean; // THIS WILL BE REMOVED
    likedBy: string[];
    owner: string;
    caption?: string;
    image: string;
    comments: {
        person: string;
        content: string;
    }[];
}

interface ExerciseView {
    name?: string;
    sets?: number;
    reps?: number;
}

interface WorkoutView {
    name?: string;
    exercises: ExerciseView[];

}

interface ProgramView {
    name: string;
    workouts: WorkoutView[];
}

interface FeedInfo {
    currentUser: firebase.User;
    currentGroup: GroupData | null;
}

interface GroupData {
    id: string;
    name: string;
    members: string[];
    admin: string;
    posts: string[];
}

export function Feed(props: FeedInfo) {
    const [posts, setPosts] = useState<Post[]>([]);

    const uniquePostIds = new Set<string>();

    function toggleLiked(id: string) {
        const newPosts = [...posts];
        const post = newPosts.find((post) => post.id === id);

        if (post != null) {
            post.liked = !post.liked;
            if (post.liked) {
                post.likes += 1;
                post.likedBy.push(props.currentUser.uid);
            } else {
                post.likes -= 1;
                post.likedBy = post.likedBy.filter(
                    (uid) => uid !== props.currentUser.uid
                );
            }
        }
        setPosts(newPosts);

        // Update post in database
        const postRef = firebase.firestore().collection("posts").doc(id);
        postRef.update({
            likes: post?.likes,
            likedBy: post?.likedBy,
        });
    }

    function addComment(id: string, comment: string) {
        const newPosts = [...posts];

        const post = newPosts.find((post) => post.id === id);

        if (post && comment !== "") {
            post.comments.push({
                person: props.currentUser.displayName!,
                content: comment,
            });
        }
        setPosts(newPosts);

        // Update post in database
        const postRef = firebase.firestore().collection("posts").doc(id);
        postRef.update({
            comments: post?.comments,
        });
    }

    function deletePost(id: string) {
        const newPosts = posts.filter((post) => post.id !== id);
        setPosts(newPosts);
      
        // Delete post from the posts collection in Firestore
        const postRef = firebase.firestore().collection("posts").doc(id);
        postRef.delete();
      
        // Delete post from the currentGroup
        if (props.currentGroup) {
          const groupRef = firebase.firestore().collection("groups").doc(props.currentGroup.id);
          groupRef.update({
            posts: firebase.firestore.FieldValue.arrayRemove(id)
          });
        }
      }
    const currentUserRef = firebase
        .firestore()
        .collection("users")
        .doc(props.currentUser.uid);
    const [currentUserData] = useDocumentData(currentUserRef as any);

    useEffect(() => {
        let friendsUnsubscribe: firebase.Unsubscribe | undefined;
        let postsUnsubscribe: firebase.Unsubscribe | undefined;

        setPosts([]);

        if (currentUserData) {

            if (props.currentGroup) {
                // Get current group from database
                const groupRef = firebase
                    .firestore()
                    .collection("groups")
                    .doc(props.currentGroup.id);

                // Get posts from current group
                groupRef.onSnapshot((doc) => {
                    const groupData = doc.data();
                    if (groupData?.posts) {
                        groupData.posts.forEach((post: string) => {
                            // Get post data from database
                            const postRef = firebase
                                .firestore()
                                .collection("posts")
                                .doc(post);

                            postsUnsubscribe = postRef.onSnapshot((doc) => {
                                const postData = doc.data();

                                const postAuthorRef = firebase
                                    .firestore()
                                    .collection("users")
                                    .doc(postData?.owner);

                                postAuthorRef.onSnapshot((doc) => {
                                    const postAuthor = doc.data();
                                    addPost(postAuthor, postData);

                                });

                            });
                        });
                    }
                });
                return;
            }

            // Get posts from current user
            currentUserData.posts.forEach((post: string) => {
                // Get post data from database
                const postRef = firebase
                    .firestore()
                    .collection("posts")
                    .doc(post);

                postsUnsubscribe = postRef.onSnapshot((doc) => {
                    const postData = doc.data();
                    addPost(currentUserData, postData);
                });
            });

            // Get posts from friends
            if (currentUserData.friends.length > 0) {
                const friendsRef = firebase
                    .firestore()
                    .collection("users")
                    .where(
                        firebase.firestore.FieldPath.documentId(),
                        "in",
                        currentUserData.friends
                    );

                friendsUnsubscribe = friendsRef.onSnapshot((querySnapshot) => {
                    querySnapshot.forEach((doc) => {
                        const friend = doc.data();

                        friend.posts.forEach((post: string) => {

                            // Get post data from database
                            const postRef = firebase
                                .firestore()
                                .collection("posts")
                                .doc(post);

                            postsUnsubscribe = postRef.onSnapshot((doc) => {

                                const postData = doc.data();

                                addPost(friend, postData);

                            });
                        });
                    });
                });
            }

            // Get posts from groups
            if (currentUserData.groups.length > 0) {
                const groupsRef = firebase
                    .firestore()
                    .collection("groups")
                    .where(
                        firebase.firestore.FieldPath.documentId(),
                        "in",
                        currentUserData.groups
                    );

                groupsRef.onSnapshot((querySnapshot) => {
                    querySnapshot.forEach((doc) => {
                        const group = doc.data();

                        if (group.posts) {
                            group.posts.forEach((post: string) => {
                                // Get post data from database
                                const postRef = firebase
                                    .firestore()
                                    .collection("posts")
                                    .doc(post);

                                postsUnsubscribe = postRef.onSnapshot((doc) => {
                                    const postData = doc.data();

                                    const postAuthorRef = firebase
                                        .firestore()
                                        .collection("users")
                                        .doc(postData?.owner);

                                    postAuthorRef.onSnapshot((doc) => {
                                        const postAuthor = doc.data();
                                        addPost(postAuthor, postData);

                                    });

                                });
                            });
                        }

                    });
                });
            }

            return () => {
                if (friendsUnsubscribe) friendsUnsubscribe();
                if (postsUnsubscribe) postsUnsubscribe();
            };
        }
    }, [currentUserData, props.currentGroup]);

    function addPost(author?: firebase.firestore.DocumentData, postData?: firebase.firestore.DocumentData) {
        if (uniquePostIds.has(postData?.id)) {
            return;
        }

        const postProgramRef = postData?.program;
        const postProgramWorkouts = postProgramRef?.split("*Workout*");

        const newPostProgram: ProgramView = {
            name: postProgramWorkouts.shift(),
            workouts: [],
        }

        postProgramWorkouts?.forEach((workout: string) => {
            const workoutExercises = workout.split("*Exercise*");
            const newWorkout: WorkoutView = {
                name: workoutExercises.shift(),
                exercises: [],
            };

            workoutExercises?.forEach((exercise: string) => {
                const exerciseSets = exercise.split("*Sets*");
                const exerciseReps = exerciseSets[1].split("*Reps*");
                const newExercise: ExerciseView = {
                    name: exerciseSets.shift(),
                    sets: parseInt(exerciseSets[0]),
                    reps: parseInt(exerciseReps[1]),
                };
                newWorkout.exercises.push(newExercise);
            });

            newPostProgram.workouts.push(newWorkout);
        });


        // Check if current user has liked post
        let liked = false;
        postData?.likedBy.map((person: string) => {
            if (person === props.currentUser.uid) {
                liked = true;
            }
        });

        const newPost: Post = {
            id: postData?.id,
            name: author?.displayName,
            description: postData?.description,
            program: newPostProgram,
            image: postData?.image,
            likes: postData?.likedBy.length,
            liked: liked,
            comments: postData?.comments,
            likedBy: postData?.likedBy,
            owner: author?.uid,
            timeStamp: postData?.timeStamp,
        };

        setPosts((posts) => [...posts, newPost]);

        uniquePostIds.add(postData?.id);
    }


    return <div className="Group-feed">

        {
            posts.sort((a, b) => {
                return b.timeStamp.toMillis() - a.timeStamp.toMillis();
            }).map((post, key) => (
                <Post
                    key={key} // TODO: Change to post.id (error occurs when post.id is used)
                    id={post.id}
                    name={post.name}
                    description={post.description}
                    program={post.program}
                    image={post.image}
                    likes={post.likes}
                    liked={post.liked}
                    isAdmin={props.currentGroup?.admin === props.currentUser.uid}
                    comments={post.comments}
                    toggleLiked={toggleLiked}
                    addComment={addComment}
                    deletePost = {deletePost}
                />
            ))}
    </div>;
}