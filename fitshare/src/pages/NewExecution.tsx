import { Post } from '../components/Post';
import { Group } from '../components/Group';
import { Friend } from '../components/Friend';
import { Popup } from '../components/Popup';
import './../style/NewExecution.css';
import './../style/NewProgram.css';
import ExercisePhoto from '.m../ExercisePhoto.jpeg';
import FitShareLogo from './../FitShareLogo.png';
import { useState, useEffect, Key } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { AiOutlineUserAdd } from 'react-icons/ai'
import { AiOutlineUsergroupAdd } from 'react-icons/ai'
import firebase from "firebase/compat/app"
import { useDocumentData, useCollectionData } from "react-firebase-hooks/firestore";
import { BiArrowBack } from 'react-icons/bi';
import { AiOutlineSearch } from 'react-icons/ai'
import { GiWeightLiftingUp } from 'react-icons/gi'
import { Execution } from '../components/Execution';

import CanvasJS from '../components/canvasjs.react';
import CanvasJSReact from '../components/canvasjs.react';
var CanvasJSChart = CanvasJSReact.CanvasJSChart;


interface Exercise {
    name: string;
    sets: number;
    reps: number;
    id: string;
    owner: string;
}

interface Execution {
    id: string;
    name: string;
    owner: string;
    weight: string;
    date: firebase.firestore.Timestamp;
}


export function NewExecution(props: { currentUser: firebase.User }) {

    const handleBack = () => {
        navigate('/programs');
    };

    const navigate = useNavigate();

    const [exercises, setExercises] = useState<Exercise[]>([
        {
            name: "Your exercises",
            sets: 0,
            reps: 0,
            id: "1",
            owner: props.currentUser.uid,
        }
    ]);

    const [weight, setWeight] = useState("");

    const [loggedExercises, setLoggedExercises] = useState<Exercise[]>([]);

    const [searchWord, setSearchWord] = useState("");

    const [exerciseNames, setExerciseNames] = useState<string[]>([]);

    const [selectedExercise, setSelectedExercise] = useState(exercises[0]);

    const [previousExcecutions, setPreviousExcecutions] = useState<Execution[]>([]);

    const [dataPoints, setDataPoints] = useState<{ x: number, y: number }[]>([]);

    const handleSearch = async () => {
        exerciseNames.splice(0);
        const usersCollection = firebase.firestore().collection("exercise");
        const querySnapshot = await usersCollection.where("name", ">=", searchWord).get();
        const matchingExercises: Exercise[] = [];
        querySnapshot.forEach((doc) => {
            const exercise = doc.data() as Exercise;
            if (exercise.owner === props.currentUser.uid && !exerciseNames.includes(exercise.name)) {
                matchingExercises.push(exercise);
                exerciseNames.push(exercise.name);
            }
        });
        setExercises(matchingExercises);
    };

    const handleAddExecution = () => {
        if (weight !== "") {
            setLoggedExercises([...loggedExercises, selectedExercise]);
            saveWeight(selectedExercise);
        }
        streakFunc(props.currentUser);
    };

    const streakFunc = (async (user: firebase.User) => {
        const today = new Date();
        const userId = user.uid;

        const executions = await firebase.firestore().collection('execution').where('owner', '==', userId).get();

        let hasLoggedToday = false;
        executions.forEach((executionDoc) => {
            const execution = executionDoc.data();
            const executionDate = execution.date.toDate();
            if (executionDate.toDateString() === today.toDateString()) {
                hasLoggedToday = true;
            }
        });

        if (!hasLoggedToday) {
            const userDoc = await firebase.firestore().collection('users').doc(userId).get();
            const streakCount = userDoc.data()?.streakCount || 0;
            const newStreakCount = streakCount + 1;
            await firebase.firestore().collection('users').doc(userId).update({ streakCount: newStreakCount });
        }
    });

    const saveWeight = async (exercise: Exercise) => {
        const newExecution: Execution = {
            id: uuidv4(),
            name: exercise.name,
            owner: props.currentUser.uid,
            weight: weight,
            date: firebase.firestore.Timestamp.now(),
        };

        const executionCollection = firebase.firestore().collection("execution");
        executionCollection.doc(newExecution.id).set(newExecution);
        setWeight("");
    }

    useEffect(() => {
        const executionCollection = firebase.firestore().collection("execution");
        const query = executionCollection.where("owner", "==", props.currentUser.uid).where("name", "==", selectedExercise.name);

        const querySnapshot = query.get();

        querySnapshot.then((querySnapshot) => {
            const matchingExecutions: Execution[] = [];
            querySnapshot.forEach((doc) => {
                const execution = doc.data() as Execution;
                matchingExecutions.push(execution);
            });

            // Sort the executions by date
            matchingExecutions.sort((a, b) => {
                return a.date.toMillis() - b.date.toMillis();
            });


            // Create the datapoints for the graph
            const dataPoints: { x: number, y: number }[] = [];

            for (let i = 0; i < matchingExecutions.length; i++) {
                dataPoints.push({ x: i, y: parseInt(matchingExecutions[i].weight) });
            }

            setDataPoints(dataPoints);
        });


    }, [selectedExercise, loggedExercises]);

    return (
        <div className="Execution-container">
            <BiArrowBack className="Back-button" onClick={handleBack} />
            <h1>New Execution</h1>
            <div className="Overviews">
                <div className="Overview">
                    <div className="Searchbar-content">
                        <input className="Input-field" type="text" placeholder={"Exercise"} value={searchWord} onChange={(e) => setSearchWord(e.target.value)} />
                        <AiOutlineSearch className="Popup-search-icon" onClick={handleSearch} />
                    </div>
                    <div>
                        {exercises.map((exercise, key) => (
                            <>
                                {
                                    exercise.name.toLowerCase().includes(searchWord.toLowerCase()) ?
                                        <div key={key} className="Exercise-popup-inner">
                                            <Execution name={exercise.name}
                                                onClick={() => { setSelectedExercise(exercise) }}
                                                selected={selectedExercise === exercise}
                                            />
                                        </div>
                                        : null
                                }
                            </>
                        ))
                        }


                    </div>
                </div>
                <div className="Overview">
                    <h2>Previous Executions</h2>
                    <div className="Log-input">
                        <input className="Input-field" placeholder="Weight (kg)" value={weight} onChange={(e) => {
                            // Only allow numbers
                            const re = /^[0-9\b]+$/;
                            if (e.target.value === '' || re.test(e.target.value)) {
                                setWeight(e.target.value)
                            }
                        }
                        } />
                        <div className="Log-execution-button"
                            onClick={() => handleAddExecution()}>Log
                        </div>
                    </div>

                    <CanvasJSChart options={{
                        animationEnabled: true,
                        exportEnabled: true,
                        theme: "dark1", // "light1", "dark1", "dark2"
                        title: {
                            text: selectedExercise.name,
                        },
                        axisY: {
                            title: "Weight",
                            suffix: "kg"
                        },
                        axisX: {
                            title: "Execution",
                            interval: 1
                        },
                        data: [{
                            type: "line",
                            toolTipContent: "Execution {x}: {y}kg",
                            dataPoints: dataPoints
                        }]
                    }}
                    /* onRef={ref => this.chart = ref} */
                    />

                </div>
            </div>
        </div>
    );
}

export default NewExecution;