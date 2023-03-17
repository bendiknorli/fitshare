import { useEffect, useState } from "react";
import firebase from "firebase/compat/app";

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

export function PostPreview(props: {
  id: string;
  name: string;
  program?: ProgramView;
  setDescription: (description: string) => void;
  handleImage: (image: File) => void;
  image: string;
}) {

  const [newPostDescription, setNewPostDescription] = useState<string>("");

  return (
    <div className="Post">
      <strong>{props.name}</strong>
      <br></br>
      <div className="Post-content">
        <input className="Input-field" type="text" placeholder="Description" value={newPostDescription} onChange={(e) => {
          setNewPostDescription(e.target.value);
          props.setDescription(e.target.value)
        }} />
        <br></br>
        <strong>{props.program && props.program.workouts.length > 0 ? props.program.name : ""}</strong>
        <br></br>

        {props.program && props.program.workouts.map((workout, key) => (
          <div className="Workout" key={key}>
            <br></br>
            <strong>{workout.workoutName}</strong>
            <br></br>
            {workout.exercises.map((exercise, key) => (
              <div className="Exercise" key={key}>
                <strong>{exercise.name}</strong>
                <br></br>
                {exercise.sets} sets of {exercise.reps} reps
                <br></br>
              </div>
            ))}
          </div>
        ))}
        {props.image ? <><br></br> <img src={props.image} className="Post-image" alt="Exercise" /><br></br></> : null}
        <input
          type="file"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              props.handleImage(e.target.files[0]);
            }
          }}
        />
      </div>
    </div>
  );
}

//style input og lagre content
