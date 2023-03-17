import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./pages/App";
import NewProgram from "./pages/NewProgram";
import NewPost from "./pages/NewPost";
import TrainingPrograms from "./pages/TrainingPrograms";
import Error404page from './pages/Error404page';
import NewExecution from './pages/NewExecution';

import firebase from "firebase/compat/app"

interface UserProps {
  currentUser: firebase.User;
}

const Main: React.FC<UserProps> = ({ currentUser }) => {
  return (
    <BrowserRouter>
      <Routes>
        {" "}
        {/* The Switch decides which component to show based on the current URL.*/}
        <Route path="/" element={<App currentUser={currentUser} />} />
        <Route
          path="/programs"
          element={<TrainingPrograms currentUser={currentUser} />}
        />
        <Route
          path="/newprogram"
          element={<NewProgram currentUser={currentUser} />}
        />
        <Route
          path="/newpost"
          element={<NewPost currentUser={currentUser} />}
        />
        <Route path="/*" element={<Error404page />} />
        <Route path="/newexecution" element={<NewExecution currentUser={currentUser} />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Main;