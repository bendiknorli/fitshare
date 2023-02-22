import { useEffect, useState } from "react";
import './../style/NewProgram.css';
import { useNavigate } from 'react-router-dom';
import { BiArrowBack } from 'react-icons/bi';
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/auth";
import "firebase/compat/analytics";
import { useDocumentData } from "react-firebase-hooks/firestore";

interface Exercise {
  name: string;
  sets: number;
  reps: number;
  id: string;
}

interface Workout {
  id: string;
  name: string;
  exercises: String[];
}

interface Program {
  id: string;
  name: string;
  workouts: string[];
}

export function TrainingPrograms(props: { currentUser: firebase.User }) {

  const handleBack = () => {
    navigate('/');
  };

  const navigate = useNavigate();

  const addProgram = () => {
    navigate('/newprogram');
  };

  const addExecution = () => {
    navigate('/newexecution');
  };

  const [programs, setPrograms] = useState<Program[]>([
    {
      id: "0",
      name: "Your programs",
      workouts: []
    },
  ]);

  const [workouts, setWorkouts] = useState<Workout[]>([
    {
      id: "0",
      name: "Your workouts",
      exercises: []
    },
  ]);

  const [exercises, setExercises] = useState<Exercise[]>([
    {
      id: "0",
      name: "Exercise 1",
      sets: 0,
      reps: 0
    },
  ]);

  const [currentProgram, setCurrentProgram] = useState<Program>(programs[0]);

  const currentUserRef = firebase.firestore().collection("users").doc(props.currentUser.uid);
  const [currentUserData] = useDocumentData(currentUserRef as any);

  useEffect(() => {
    let unsubscribe: firebase.Unsubscribe | undefined;
    if (currentUserData) {
      if (currentUserData.programs.length > 0) {
        const programsRef = firebase.firestore().collection("programs").where(firebase.firestore.FieldPath.documentId(), "in", currentUserData.programs);
        unsubscribe = programsRef.onSnapshot((querySnapshot) => {
          const programs: any = [];
          querySnapshot.forEach((doc) => {
            programs.push(doc.data());
          });
          setPrograms(programs);
        });
      }
      else {
        setPrograms([]);
      }
      return () => {
        if (unsubscribe) unsubscribe();
      };
    }
  }, [currentUserData]);

  // useEffect(() => {
  //   console.log("useEffect");
  //   console.log(currentProgram);
  //   const matchingWorkouts: Workout[] = [];
  //   currentProgram.workouts.forEach(async (workoutId) => {
  //     const workoutCollection = firebase.firestore().collection("workout");
  //     const querySnapshot = await workoutCollection.where('id', '==', workoutId).get();
  //     querySnapshot.forEach((doc) => {
  //       const workout = doc.data() as Workout;
  //       matchingWorkouts.push(workout);
  //       // workouts.push(workout);
  //     });
  //   }
  //   );
  //   // setWorkouts(workouts);
  //   setWorkouts(matchingWorkouts);
  //   console.log(workouts);
  // }, [currentProgram]);


  return (
    <div className="NewProgram">
      <BiArrowBack className="Back-button" onClick={handleBack} />

      <h1>Your Programs</h1>
      <div className="Overviews">
        <div className="Overview">
          <h2>Programs</h2>
          <div className="Create-new-button" onClick={addProgram}>Create New Program</div>

          {programs.map((program, key) => (
            <div key={key} className={currentProgram.id === program.id ? "Option-selected" : "Option"}
              onClick={() => { setCurrentProgram(program) }}>
              {program.name}
            </div>
          ))}

        </div>
        <br></br>
        <div className="Overview">
          <h2>Executions</h2>
          <div className="Create-new-button" onClick={addExecution}>Add new Execution</div>
          {workouts.map((workoutBut, key) => (
            <>
              <div key={workoutBut.id} className="Option" >
                {workoutBut.name}
              </div>
            </>
          ))}

        </div>

      </div >
    </div >
  );
}

export default TrainingPrograms;
