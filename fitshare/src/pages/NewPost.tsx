import React, { PureComponent, useState, useEffect } from "react";
import "./../style/NewProgram.css";
import { useNavigate } from "react-router-dom";
import { BiArrowBack } from "react-icons/bi";
import "./../style/NewPost.css";
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import { v4 as uuidv4 } from 'uuid';
import "firebase/compat/auth";
import "firebase/compat/analytics";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { PostPreview } from "./../components/PostPreview";

interface Exercise {
  name: string;
  sets: number;
  reps: number;
  id: string;
}

interface Workout {
  id: string;
  name: string;
  exercises: string[];
}

interface Program {
  id: string;
  name: string;
  workouts: string[];
}

interface ProgramView {
  id: string;
  name: string;
  workouts: [{
    workoutName: string;
    exercises: [{
      name: string;
      sets: number;
      reps: number;
    }]
  }]
}

interface Post {
  owner: string;
  id: string,
  description: string
  comments: [];
  likedBy: [];
  likes: number;
  program: string;
}

export function NewPost(props: { currentUser: firebase.User }) {

  const navigate = useNavigate();

  const publishPost = async () => {

    var programString = "";

    // Remove the first dummy program
    programViews.shift();

    // Add correct program with workouts and exercises to string
    programViews.forEach((programView) => {
      if (programView.id === currentProgram.id) {
        programString = "";
        programString += programView.name;
        programView.workouts.forEach((workout) => {
          programString += "*Workout*"
          programString += workout.workoutName;
          workout.exercises.forEach((exercise) => {
            programString += "*Exercise*"
            programString += exercise.name;
            programString += "*Sets*"
            programString += exercise.sets;
            programString += "*Reps*"
            programString += exercise.reps;
          });
        });
      }
    });

    const newPost: Post = {
      owner: props.currentUser.uid,
      id: uuidv4(),
      description: description,
      comments: [],
      likedBy: [],
      likes: 0,
      program: programString
    };

    const programCollection = firebase.firestore().collection("posts");
    programCollection.doc(newPost.id).set(newPost);
    const currentUserRef = firebase.firestore().collection("users").doc(props.currentUser.uid);
    await currentUserRef.update({
      posts: firebase.firestore.FieldValue.arrayUnion(newPost.id)
    });

    navigate('/');
  };

  const [description, setDescription] = useState<string>("Dette er en description");

  const [programs, setPrograms] = useState<Program[]>([
    {
      id: "0",
      name: "Your programs",
      workouts: [],
    },
  ]);

  const [currentProgram, setCurrentProgram] = useState<Program>(programs[0]);

  const [programViews, setProgramViews] = useState<ProgramView[]>([
    {
      id: "0",
      name: "Your programs",
      workouts: [{
        workoutName: "Your workouts",
        exercises: [{
          name: "Your exercises",
          sets: 0,
          reps: 0
        }]
      }]
    }
  ]);

  const currentUserRef = firebase
    .firestore()
    .collection("users")
    .doc(props.currentUser.uid);
  const [currentUserData] = useDocumentData(currentUserRef as any);

  useEffect(() => {
    if (currentUserData) {
      if (currentUserData.programs.length > 0) {
        const programsRef = firebase.firestore().collection("programs").where(firebase.firestore.FieldPath.documentId(), "in", currentUserData.programs);
        programsRef.onSnapshot((querySnapshot) => {
          const newPrograms: any = [];

          querySnapshot.forEach((doc) => {
            const program = doc.data();
            // Add program to programs list on the left
            newPrograms.push(program);

            const programView: ProgramView = {
              id: program.id,
              name: program.name,
              workouts: [{
                workoutName: "",
                exercises: [{
                  name: "",
                  sets: 0,
                  reps: 0
                }]
              }]
            };

            if (program.workouts.length !== 0) {

              const workoutsRef = firebase.firestore().collection("workout").where(firebase.firestore.FieldPath.documentId(), "in", program.workouts);
              workoutsRef.onSnapshot((querySnapshot) => {
                const newWorkouts: any = [];
                querySnapshot.forEach((doc) => {
                  const workout = doc.data();
                  newWorkouts.push(workout);

                  const exercisesRef = firebase.firestore().collection("exercise").where(firebase.firestore.FieldPath.documentId(), "in", workout.exercises);
                  exercisesRef.onSnapshot((querySnapshot) => {
                    const exercises: any = [];
                    querySnapshot.forEach((doc) => {
                      const exercise = doc.data();
                      exercises.push(exercise);
                    });
                    programView.workouts.push({
                      workoutName: workout.name,
                      exercises: exercises
                    });
                  });
                });
              });
            }
            // Remove first empty workout
            programView.workouts.shift();
            setProgramViews(programViews => [...programViews, programView]);
          });
          setPrograms(newPrograms);
        });

      } else {
        setPrograms([]);
      }
    }
  }, [currentUserData]);

  return (
    <div className="New-Post">
      <h1>Select program to post</h1>
      <div className="Overviews">
        <div className="Overview">
          {programs.length > 0 && programs.map((program, key) => (
            <div
              key={key}
              className={
                currentProgram.id === program.id ? "Option-selected" : "Option"
              }
              onClick={() => {
                setCurrentProgram(program);
              }}
            >
              {program.name}
            </div>
          ))}
        </div>
        <div className="Overview">
          <PostPreview
            id={currentProgram.id}
            name={props.currentUser.displayName!}
            program={programViews.find((programView) => programView.id === currentProgram.id)!}
            setDescription={setDescription}
          />
        </div>
      </div>
      <div className="New-post-button" onClick={publishPost}>Post</div>
    </div>
  );
}

export default NewPost;
