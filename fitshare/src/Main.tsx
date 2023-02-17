import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from "./pages/App"
import NewProgram from "./pages/NewProgram";
import TrainingPrograms from "./pages/TrainingPrograms";
import Error404page from './pages/Error404page';

import firebase from "firebase/compat/app"
interface UserProps {
  currentUser: firebase.User;
}

const Main: React.FC<UserProps> = ({ currentUser }) => {
  return (
    <BrowserRouter>
      <Routes> {/* The Switch decides which component to show based on the current URL.*/}
        <Route path="/" element={<App currentUser={currentUser} />} />
        <Route path="/programs" element={<TrainingPrograms />} />
        <Route path="/newprogram" element={<NewProgram />} />
        <Route path="/*" element={<Error404page />} />
      </Routes>
    </BrowserRouter>
  );
}

export default Main;