import { AiOutlineCloseCircle } from 'react-icons/ai'
import { AiOutlineSearch } from 'react-icons/ai'
import { useState } from 'react'
import { Friend } from './Friend'
import firebase from "firebase/compat/app"
import "firebase/compat/firestore"

interface UserProps {
    currentUser: firebase.User;
  }
  
  interface UserData {
    id: string;
    displayName: string;
  }

export function Popup(props: { removePopup: any, isShowingFriends: boolean, currentUser: firebase.User }) {

    const [addedFriends, setAddedFriends] = useState<string[]>([]);

    const [users, setUsers] = useState<UserData[]>([]);

    const [searchWord, setSearchWord] = useState("");

    const [friendNames, setFriendNames] = useState([
        "Gunnhild Pedersen",
        "Tord",
        "Man",
        "Tor",
        "Herman Hermansen Hermansen",
        "Tommy",
        "Gard",
        "Zebra",
        "Peder"
    ])
    

    const handleSearch = async () => {
        const usersCollection = firebase.firestore().collection("users");
        const querySnapshot = await usersCollection.where("displayName", ">=", searchWord).get();
        const mathingUsers: UserData[] = [];
        querySnapshot.forEach((doc) => {
            const user = doc.data() as UserData;
            if (user.id !== props.currentUser.uid) {
                mathingUsers.push(user);
            }
        });
        setUsers(mathingUsers);
    };

    const handleAddFriend = async (friendId: string) => {
        const currentUserRef = firebase.firestore().collection("users").doc(props.currentUser.uid);
        await currentUserRef.update({
            friends: firebase.firestore.FieldValue.arrayUnion(friendId)
        });
        setAddedFriends((prev) => [...prev, friendId]);
        
    };
    return (
        <>
            <div className="Overlay" onClick={props.removePopup} />
            <div className="Popup">
                <div className="Popup-inner">
                    <AiOutlineCloseCircle className="Friend-close-button" onClick={props.removePopup} />
                    {/* <button className="Friend-close-button" onClick={props.removePopup}>Close</button> */}
                    <h3>{`Add ${props.isShowingFriends ? "Friends" : "Groups"}`}</h3>
                    <div className="Popup-content">
                        <input className="Input-field" type="text" placeholder={`${props.isShowingFriends ? "Friend" : "Group"} name`} value={searchWord} onChange={(e) => setSearchWord(e.target.value)} />
                        <AiOutlineSearch className="Search-for-new-friend" onClick={handleSearch}/>
                    </div>

                    <div className="Friends-popup">

                        {props.isShowingFriends ? null :
                            <div className="Friends-popup-inner">
                                <div className="Friend">
                                    <div className="Friend-name">Make new Group</div>
                                </div>
                            </div>
                        }

                        {users.map((user) => (
                            <div className="Friends-popup-inner" key={user.id}>
                                <Friend name={user.displayName} />
                                <div className= "Add-friend-button" onClick={() => handleAddFriend(user.id)}>{props.isShowingFriends ? ( addedFriends.includes(user.id) ? "Added":"Add") : "Join"}</div>
                            </div>
                        ))}
                    </div>
                </div>  

            </div>
        </>
    );
}