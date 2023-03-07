import { useState } from "react";
import { FiThumbsUp } from "react-icons/fi";
import { AiOutlineComment } from "react-icons/ai";

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

export function Post(props: {
  id: string,
  name: string,
  description: string,
  program: ProgramView,
  image?: string,
  likes: number,
  liked: boolean,
  comments: { person: string; content: string; }[],
  toggleLiked: (id: string) => void, addComment: (id: string, comment: string) => void
}) {

  const [userComment, setUserComment] = useState("");

  return <div className="Post">
    <div className="Post-likes">{props.likes} </div>
    <FiThumbsUp key={props.id} className="Thumb-icon"
      style={{ fill: props.liked ? "yellow" : "" }} onClick={() => {
        props.toggleLiked(props.id)
      }} />
    <strong>{props.name}</strong>
    <br></br>
    <div className="Post-content">
      <strong>{props.program.workouts.length > 0 ? "Program" : ""}</strong>
      <br></br>
      <p>{props.description}</p>
      <br></br>

      {props.program.workouts.map((workout, key) => (
        <div className="Workout" key={key}>
          <br></br>
          <strong>{workout.name}</strong>
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

      {props.image ? <><br></br> <img src={props.image} className="Post-image" alt="Exercise" /></> : ""}

      {props.comments.length > 0 ? <><br></br><strong>Comments</strong></> : ""}

      <input className="Comment-input" placeholder="Write a comment!" value={userComment} onChange={(e) => setUserComment(e.target.value)} />

      <div className="Comment-icon" onClick={() => {
        setUserComment("")
        props.addComment(props.id, userComment)

      }} >
        Comment
        <AiOutlineComment key={props.id} />
      </div>

      {props.comments.map((comment, key) => (
        <div key={key} className="Comment-text"><strong>{comment.person}:</strong> {comment.content}</div>
      ))}

    </div>
  </div>;
}
