import { AiOutlineCloseCircle } from 'react-icons/ai'
import { AiOutlineSearch } from 'react-icons/ai'
import { useState } from 'react'
import { Friend } from './Friend'
import './../style/Popup.css';
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/auth";
import "firebase/compat/analytics";


import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { v4 as uuidv4 } from 'uuid';


interface GroupData {
    id: string;
    name: string;
    members: string[];
    admin: string;
}

interface UserProps {
    currentUser: firebase.User;
}

interface UserData {
    id: string;
    displayName: string;
}

export function Popup(props: { removePopup: any, isShowingFriends: boolean, currentUser: firebase.User }) {

    const [classState, setClassState] = useState('Make-group');

    const [users, setUsers] = useState<UserData[]>([]);

    const [searchWord, setSearchWord] = useState("");

    const [groups, setGroups] = useState<GroupData[]>([]);

    const [showFriendAdded, setShowPopup] = useState(false);

    const fetchGroups = async () => {
        const groupCollection = firebase.firestore().collection("groups");
        const querySnapshot = await groupCollection.where('name', '>=', searchWord).get();
        // const querySnapshot = await groupCollection.where('name', '>=', searchWord)
        //     .where('name', '<=', searchWord + '\uf8ff').get();
        const matchingGroups: GroupData[] = [];
        querySnapshot.forEach((doc) => {
            const group = doc.data() as GroupData;
            matchingGroups.push(group);
        }
        );
        setGroups(matchingGroups);
    }

    const makeNewGroup = () => {
        const groupCollection = firebase.firestore().collection("groups");
        setClassState("Made-new-group")
        if (searchWord == "") {
            return;
        }

        const newGroup = {
            id: uuidv4(),
            name: searchWord,
            members: [props.currentUser.uid],
            admin: props.currentUser.uid
        }

        const newGroupID = groupCollection.add(newGroup);

        newGroupID.then((docRef) => {
            // Add group to user
            const currentUserRef = firebase.firestore().collection("users").doc(props.currentUser.uid);
            currentUserRef.update({
                groups: firebase.firestore.FieldValue.arrayUnion(docRef.id)
            });
        });

        // Add user to group
        const groupRef = firebase.firestore().collection("groups").doc(newGroup.name);
        groupRef.update({
            members: firebase.firestore.FieldValue.arrayUnion(props.currentUser.uid)
        });

        props.removePopup();
    }

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
        console.log("Friend added");
    };

    const handleJoinGroup = async (groupId: string) => {

        // Add group to user
        const currentUserRef = firebase.firestore().collection("users").doc(props.currentUser.uid);
        currentUserRef.update({
            groups: firebase.firestore.FieldValue.arrayUnion(groupId)
        });

        // Add user to group
        const groupRef = firebase.firestore().collection("groups").doc(groupId);
        groupRef.update({
            members: firebase.firestore.FieldValue.arrayUnion(props.currentUser.uid)
        });

        console.log("Group joined");

    };

    return (
        <>
            <div className="Overlay" onClick={props.removePopup} />
            <div className="Popup">
                <div className="Popup-inner">
                    <AiOutlineCloseCircle className="Popup-close-button" onClick={props.removePopup} />
                    {/* <button className="Friend-close-button" onClick={props.removePopup}>Close</button> */}
                    <h3>{`Add ${props.isShowingFriends ? "Friends" : "Groups"}`}</h3>
                    <div className="Popup-content">
                        <input className="Input-field" type="text" placeholder={`${props.isShowingFriends ? "Friend" : "Group"} name`} value={searchWord} onChange={(e) => setSearchWord(e.target.value)} />
                        <AiOutlineSearch className="Popup-search-icon" onClick={props.isShowingFriends ? handleSearch : fetchGroups} />
                    </div>

                    <div className="Friends-popup">

                        {props.isShowingFriends ? null :
                            <div className="Friends-popup-inner">
                                <div className="Friend">
                                    <div className={classState} onClick={makeNewGroup}>Make New Group with Name</div>
                                </div>
                            </div>
                        }
                        {
                            props.isShowingFriends ?

                                users.map((user, key) => (
                                    <>
                                        {
                                            user.displayName.toLowerCase().includes(searchWord.toLowerCase()) ?
                                                <div key={key} className="Friends-popup-inner">
                                                    <Friend name={user.displayName} />
                                                    <div className="Add-friend-button" onClick={() => handleAddFriend(user.id)}>Add</div>
                                                </div>
                                                : null
                                        }
                                    </>
                                ))
                                :
                                groups.map((group, key) => (
                                    <>
                                        {
                                            group.name.toLowerCase().includes(searchWord.toLowerCase()) ?
                                                <div key={key} className="Friends-popup-inner">
                                                    <Friend name={group.name} />
                                                    <div className="Add-friend-button" onClick={() => handleJoinGroup(group.id)}>Join</div>
                                                </div>
                                                : null
                                        }
                                    </>
                                ))
                        }
                    </div>
                </div>

            </div>
        </>
    );
}
