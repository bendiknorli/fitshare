import firebase from "firebase/compat/app";
import { Post } from '../components/Post';
import { Group } from '../components/Group';
import { Friend } from '../components/Friend';
import { Popup } from '../components/Popup';
import './../style/App.css';
import './../style/NewProgram.css';
import ExercisePhoto from './../ExercisePhoto.jpeg';
import FitShareLogo from './../FitShareLogo.png';
import { useState, useEffect, Key } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { AiOutlineUserAdd } from 'react-icons/ai';
import { AiOutlineUsergroupAdd } from 'react-icons/ai';
import { useDocumentData, useCollectionData } from "react-firebase-hooks/firestore";






interface UserProps {
  currentUser: firebase.User;
}

interface GroupData {
  id: string;
  name: string;
  members: string[];
  admin: string;
}

interface Exercise {
  name: string;
  sets: number;
  reps: number;
  id: string;
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

interface Post {
  id: string;
  name: string;
  program: string;
  // program: {
  //   workoutName: string;
  //   exercises: {
  //     name: string;
  //     sets: number;
  //     reps: number;
  //   }[];
  // }[];
  timeStamp: firebase.firestore.Timestamp;
  likes: number;
  likedBy: string[];
  owner: string;
  caption?: string;
  image?: string;
}

const App: React.FC<UserProps> = ({ currentUser }) => {

  
  const [isShowingFriendPopUp, setIsShowingFriendPopUp] =
    useState<boolean>(false);

  const [isShowingGroupPopUp, setIsShowingGroupPopUp] =
    useState<boolean>(false);

  const navigate = useNavigate();

  const handlePrograms = () => {
    navigate("/programs");
  };

  
  const [currentGroup, setCurrentGroup] = useState<GroupData | null>(null);

  const [inGroup,setInGroup] = useState<boolean>(false);

  const[membersOverhead,setMembersOverhead] = useState<string>("Friends");

  const [AddFriendIcon, setAddFriendIcon] = useState<string>("Add-friend-icon");


  // Oppdateres når inGroup eller currentGroup endres
  useEffect(() => {

  if (inGroup) {
    setCurrentPageName(currentGroup?.name || "");
    setMembersOverhead("Group members")
    setAddFriendIcon("")

    console.log(currentGroupData)

    if (currentGroupData)  {
      const membersRef = firebase
        .firestore()
        .collection("users")
        .where(
          firebase.firestore.FieldPath.documentId(),
          "in",
          currentGroupData?.members
        );

      membersRef.onSnapshot((querySnapshot) => {
        const members: any = [];
        querySnapshot.forEach((doc) => {
          members.push(doc.data());
        });
        setMembersData(members);
        console.log(members)
      });

    }
  } else {
    setCurrentPageName("Homepage");
    setMembersOverhead("Friends")
    setAddFriendIcon("Add-friend-icon")}
  }
, [inGroup,currentGroup]);


  const goToHomePage = () => {
    setInGroup(false);
  }

  const handleSetCurrentGroup = (group: GroupData) => {
    setCurrentGroup(group);
    setInGroup(true);
  }

  const [currentPageName, setCurrentPageName] = useState<string>("Homepage");

  

  const [posts, setPosts] = useState([
    {
      id: uuidv4(),
      name: "Gunnhild Pedersen",
      program: [
        {
          workoutName: "Leg day",
          exercises: [
            { name: "Bench Press", sets: 3, reps: 10 },
            { name: "Squat", sets: 3, reps: 10 },
          ],
        },
        {
          workoutName: "Workout 2",
          exercises: [
            { name: "Bench Press", sets: 3, reps: 10 },
            { name: "Squat", sets: 3, reps: 10 },
          ],
        },
      ],
      image: ExercisePhoto,
      likes: 0,
      liked: false,
      comments: [
        { person: "Roger", content: "Thats crazy!" },
        { person: "Roger", content: "No way!" },
        {
          person: "KeFnneth",
          content:
            "That is the most crazy thing I have ever seen in my entire life! I really hope I can look just like you in the future! You are the person I dream of being in my sleep!",
        },
        { person: "Sen", content: "I want you!" },
      ],
    },
    {
      id: uuidv4(),
      name: "Gunnhild Pedersen",
      program: [
        {
          workoutName: "Pull",
          exercises: [
            { name: "Bench Press", sets: 3, reps: 10 },
            { name: "Squat", sets: 3, reps: 10 },
          ],
        },
        {
          workoutName: "Workout 2",
          exercises: [
            { name: "Bench Press", sets: 3, reps: 10 },
            { name: "Squat", sets: 3, reps: 10 },
          ],
        },
      ],
      image: "",
      likes: 499,
      liked: true,
      comments: [],
    },
  ]);

  function toggleLiked(id: string) {
    const newPosts = [...posts];
    const post = newPosts.find((post) => post.id === id);

    if (post != null) {
      post.liked = !post.liked;
      if (post.liked) {
        post.likes += 1;
      } else {
        post.likes -= 1;
      }
    }
    setPosts(newPosts);
  }

  function addComment(id: string, comment: string) {
    const newPosts = [...posts];

    const post = newPosts.find((post) => post.id === id);

    if (post && comment !== "") {
      post.comments.push({
        person: currentUser.displayName!,
        content: comment,
      });
    }

    setPosts(newPosts);
  }
  // This is to get data about currentuser's friends
  // ref to current user in users collection firebase
  const currentUserRef = firebase
    .firestore()
    .collection("users")
    .doc(currentUser.uid);
  const [currentUserData] = useDocumentData(currentUserRef as any);


  // This is to get data about current group
  const currentGroupRef = firebase
    .firestore()
    .collection("groups")
    .doc(currentGroup?.id);
  const [currentGroupData] = useDocumentData(currentGroupRef as any);

  useEffect(() => {
    let friendsUnsubscribe: firebase.Unsubscribe | undefined;
    let postsUnsubscribe: firebase.Unsubscribe | undefined;

    if (currentUserData) {
      if (currentUserData.friends.length > 0) {
        // console.log(currentUserData.friends);
        const friendsRef = firebase
          .firestore()
          .collection("users")
          .where(
            firebase.firestore.FieldPath.documentId(),
            "in",
            currentUserData.friends
          );
        // console.log(friendsRef);

        const friendPosts: any = [];
        const friends: any = [];
        friendsUnsubscribe = friendsRef.onSnapshot((querySnapshot) => {
          const friendsIterate: any = [];
          querySnapshot.forEach((doc) => {
            friendsIterate.push(doc.data());
          });
          friends.push(...friendsIterate);

        });
        console.log(friends);

        friends.forEach((friend: any) => {
          console.log("HEI");
          const friendPostsRef = firebase
            .firestore()
            .collection("users")
            .doc(friend.id)
            .collection("posts");
          console.log(friendPostsRef);

          postsUnsubscribe = friendPostsRef.onSnapshot((querySnapshot) => {
            querySnapshot.forEach((doc) => {
              friendPosts.push(doc.data());
            });
          });
        });
        console.log(friendPosts);
        // setPosts([...posts, friendPosts]);
      } else {
        // setPosts([...posts]);
      }
      return () => {
        if (friendsUnsubscribe) friendsUnsubscribe();
        if (postsUnsubscribe) postsUnsubscribe();
      };
    }
  }, [currentUserData]);



  const [friendsData, setFriendsData] = useState<any>(null);
  const [groupsData, setGroupsData] = useState<any>(null);
  const [membersData, setMembersData] = useState<any>(null);


  useEffect(() => {
    let friendsUnsubscribe: firebase.Unsubscribe | undefined;
    let groupsUnsubcribe: firebase.Unsubscribe | undefined;

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
          const friends: any = [];
          querySnapshot.forEach((doc) => {
            friends.push(doc.data());
          });
          setFriendsData(friends);
          console.log(friendsData)
        });
      } else {
        setFriendsData([]); 
      }

      if (currentUserData.groups.length > 0) {
        const groupsRef = firebase
          .firestore()
          .collection("groups")
          .where(
            firebase.firestore.FieldPath.documentId(),
            "in",
            currentUserData.groups
          );

        groupsUnsubcribe = groupsRef.onSnapshot((querySnapshot) => {
          const groups: any = [];
          querySnapshot.forEach((doc) => {
            groups.push(doc.data());
          });
          setGroupsData(groups);
        });
      } else {
        setGroupsData([]);
      }

      return () => {
        if (friendsUnsubscribe) friendsUnsubscribe();
        if (groupsUnsubcribe) groupsUnsubcribe();
      };
    }
  }, [currentUserData]);
  return (
    <div className="App">
      {/* LEFT SIDE */}
      <div className="Left-side-bar">
        <img
          className="FitSharelogo"
          src={FitShareLogo}
          alt="FitShareLogo"
          onClick={goToHomePage}
        ></img>
        <div className="Groups">
          <strong>Groups</strong>
          <AiOutlineUsergroupAdd
            className="Add-group"
            onClick={() => {
              setIsShowingGroupPopUp(true);
            }}
          />
          {groupsData
            ? groupsData.map((group: GroupData) => (
              <Group key={group.id} name={group.name}
                onClick={() => handleSetCurrentGroup(group)} />
            ))
            : null
          }
        </div>
      </div>

      {/* MIDDLE */}
      <div className="Middle">
        <div className="Top-bar">{currentPageName}</div>

        <div className="Post-buttons">
          <div className="Post-button">Post Program</div>

          <div className="Post-button">Post Image</div>
        </div>
          
        
      </div>

      {/* RIGHT SIDE */}
      <div className="Right-side-bar">
        <div className="Programs-button" onClick={handlePrograms}>
          Programs
        </div>


        <div className="Friends">
          <strong>{membersOverhead}</strong>
          {!inGroup && (
          <AiOutlineUserAdd
            className={AddFriendIcon}
            onClick={() => {
              setIsShowingFriendPopUp(true);
          }}
          />)}
          {inGroup ?
          (membersData?
            (
              membersData?.map((member: any) => (
               <Friend key={member.id} name={member.displayName} />
             ))
              )
            :
           null)
           :
           friendsData?
            (
              friendsData.map((friend: any) => (
               <Friend key={friend.id} name={friend.displayName} />
             ))
              )
            :
           null  
        }
         
        </div>
      </div>

      {isShowingFriendPopUp || isShowingGroupPopUp ? (
        <Popup
          removePopup={() => {
            setIsShowingFriendPopUp(false);
            setIsShowingGroupPopUp(false);
          }}
          isShowingFriends={isShowingFriendPopUp}
          currentUser={currentUser}
          friendsData={friendsData}
          groupsData={groupsData}
        />
      ) : null}

      <div>
        {inGroup ? (
          
          <>
          {currentPageName}
          </>
        ) : (
      
          <>
          {currentPageName}
          </>
        )}
      </div>
      
    </div>
  );
};

export default App;
