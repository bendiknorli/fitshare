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
    image?: string;
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

interface UserProps {
    currentUser: firebase.User;
}

export function Feed(props: UserProps) {
    const [posts, setPosts] = useState<Post[]>([]);

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
    const currentUserRef = firebase
        .firestore()
        .collection("users")
        .doc(props.currentUser.uid);
    const [currentUserData] = useDocumentData(currentUserRef as any);

    useEffect(() => {
        let friendsUnsubscribe: firebase.Unsubscribe | undefined;
        let postsUnsubscribe: firebase.Unsubscribe | undefined;

        if (currentUserData) {
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
                    const friendsIterate: any = [];
                    querySnapshot.forEach((doc) => {
                        const friend = doc.data();
                        friendsIterate.push(friend);

                        friend.posts.forEach((post: string) => {

                            // Get post data from database
                            const postRef = firebase
                                .firestore()
                                .collection("posts")
                                .doc(post);

                            postsUnsubscribe = postRef.onSnapshot((doc) => {
                                const postData = doc.data();

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

                                newPostProgram.name = "";

                                // Check if current user has liked post
                                let liked = false;
                                postData?.likedBy.map((person: string) => {
                                    if (person === props.currentUser.uid) {
                                        liked = true;
                                    }
                                });

                                const newPost: Post = {
                                    id: postData?.id,
                                    name: friend.displayName,
                                    description: postData?.description,
                                    program: newPostProgram,
                                    likes: postData?.likedBy.length,
                                    liked: liked,
                                    comments: postData?.comments,
                                    likedBy: postData?.likedBy,
                                    owner: friend.uid,
                                    timeStamp: firebase.firestore.Timestamp.now(),
                                };

                                // Only add post if it doesn't already exist
                                if (!posts.find((post) => post.id === postData?.id)
                                ) {
                                    setPosts((posts) => [...posts, newPost]);
                                }
                            });
                        });
                    });
                });
            }
            return () => {
                if (friendsUnsubscribe) friendsUnsubscribe();
                if (postsUnsubscribe) postsUnsubscribe();
            };
        }
    }, [currentUserData]);


    return <div className="Group-feed">
        {posts.map((post, key) => (
            <Post
                key={key} // TODO: Change to post.id (error occurs when post.id is used)
                id={post.id}
                name={post.name}
                description={post.description}
                program={post.program}
                image={post.image}
                likes={post.likes}
                liked={post.liked}
                comments={post.comments}
                toggleLiked={toggleLiked}
                addComment={addComment}
            />
        ))}
    </div>;
}
