import { useState } from "react";
import { useNavigate } from "react-router-dom";
import './../style/NewProgram.css';
import { BiArrowBack } from 'react-icons/bi';
import { v4 as uuidv4 } from 'uuid';
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/auth";
import "firebase/compat/analytics";


interface Exercise {
  name: string;
  sets: number;
  reps: number;
  id: string;
  owner: string;
}

interface Workout {
  id: string;
  name: string;
  exercises: Exercise[];
}

interface Program {
  owner: string;
  id: string;
  name: string;
  workouts: String[];
}


export function NewProgram(props: { currentUser: firebase.User }) {

  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/programs');
  };

  const saveProgram = async () => {
    const newProgram: Program = {
      owner: props.currentUser.uid,
      id: uuidv4(),
      name: newProgramName,
      workouts: []
    };


    workouts.slice(1).forEach(element => {
      newProgram.workouts.push(element.id);
    });
    const programCollection = firebase.firestore().collection("programs");
    programCollection.doc(newProgram.id).set(newProgram);
    const currentUserRef = firebase.firestore().collection("users").doc(props.currentUser.uid);
    await currentUserRef.update({
      programs: firebase.firestore.FieldValue.arrayUnion(newProgram.id)
    });


    navigate('/programs');
  };

  const [workouts, setWorkouts] = useState<Workout[]>([
    {
      id: "0",
      name: "Your workouts",
      exercises: [
        {
          name: "Your exercises",
          sets: 0,
          reps: 0,
          id: "1",
          owner: props.currentUser.uid,
        },
      ],
    },
  ]);

  const [currentWorkout, setCurrentWorkout] = useState<Workout>(workouts[0]);

  const [newProgramName, setNewProgramName] = useState<string>("");

  const [newWorkoutName, setNewWorkoutName] = useState<string>("");

  const [newExerciseName, setNewExerciseName] = useState<string>("");

  const [newExerciseSets, setNewExerciseSets] = useState<string>("");

  const [newExerciseReps, setNewExerciseReps] = useState<string>("");

  const addWorkout = () => {
    if (newWorkoutName === "" || workouts.find((workout) => workout.name === newWorkoutName)) {
      return;
    }

    const newWorkout: Workout = {
      id: uuidv4(),
      name: newWorkoutName,
      exercises: [],
    };

    const workoutCollection = firebase.firestore().collection("workout");
    workoutCollection.doc(newWorkout.id).set(newWorkout);

    setWorkouts([...workouts, newWorkout]);
    setCurrentWorkout(newWorkout);
    setNewWorkoutName("");
  };


  const addExercise = async () => {
    if (newExerciseName === "" || newExerciseSets === "" || newExerciseReps === "") {
      return;
    }

    const newExercise: Exercise = {
      name: newExerciseName,
      sets: parseInt(newExerciseSets),
      reps: parseInt(newExerciseReps),
      id: uuidv4(),
      owner: props.currentUser.uid,
    }

    const newWorkouts = [...workouts];
    const workout = newWorkouts.find((workout) => workout.id === currentWorkout.id);

    if (workout) {
      workout.exercises.push(newExercise);
    }

    const exerciseCollection = firebase.firestore().collection("exercise");
    exerciseCollection.doc(newExercise.id).set(newExercise);
    const currentWorkoutRef = firebase.firestore().collection("workout").doc(currentWorkout.id);
    await currentWorkoutRef.update({
      exercises: firebase.firestore.FieldValue.arrayUnion(newExercise.id)
    });

    setWorkouts(newWorkouts);
    setNewExerciseName("");
    setNewExerciseSets("");
    setNewExerciseReps("");
  };


  return (
    <div className="NewProgram">
      <BiArrowBack className="Back-button" onClick={handleBack} />
      <input className="New-program-header" placeholder="Program name..." value={newProgramName} onChange={(e) => setNewProgramName(e.target.value)} />
      <div className="Overviews">
        <div className="Overview">
          <h2>Workouts</h2>
          <div className="Option-input">
            <input className="Input-field" placeholder="New Workout..."
              value={newWorkoutName} onChange={(e) => setNewWorkoutName(e.target.value)} />
            <div className="Add-button" onClick={addWorkout}>Add</div>
          </div>

          {workouts.map((workoutBut, key) => (
            <>
              {workoutBut != null ?
                <div key={key} className={currentWorkout.id === workoutBut.id ? "Option-selected" : "Option"}
                  onClick={() => setCurrentWorkout(workoutBut)}>
                  {workoutBut.name}
                </div> : null
              }
            </>
          ))}

        </div>
        <br></br>
        <div className="Overview">
          <h2>Exercises</h2>
          <div className="Option-input">
            <input className="Input-field" placeholder="New Exercise..." value={newExerciseName} onChange={(e) => setNewExerciseName(e.target.value)} />
            <input className="Input-field-small" placeholder="Sets" value={newExerciseSets} onChange={(e) => {
              // Only allow numbers
              const re = /^[0-9\b]+$/;
              if (e.target.value === '' || re.test(e.target.value)) {
                setNewExerciseSets(e.target.value)
              }
            }
            }
            />
            X
            <input className="Input-field-small" placeholder="Reps" value={newExerciseReps} onChange={(e) => {
              // Only allow numbers
              const re = /^[0-9\b]+$/;
              if (e.target.value === '' || re.test(e.target.value)) {
                setNewExerciseReps(e.target.value)
              }
            }
            } />
            <div className="Add-button" onClick={addExercise}>Add</div>
          </div>
          {currentWorkout.exercises.map((exercise, key) => (
            <>{exercise != null ?
              <div key={key} className="Exercise-info">
                {exercise.name}
                <br></br>
                {exercise.sets} sets of {exercise.reps} reps
              </div> : null
            }
            </>
          ))}
        </div>
      </div >
      <div className="Save-button" onClick={saveProgram}> Save
      </div>
    </div>
  );
}

export default NewProgram;
