//#region FIREBASE INIT
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-app.js";
import { getFirestore, doc, getDoc } from 'https://www.gstatic.com/firebasejs/9.16.0/firebase-firestore.js';

const firebaseConfig = {
apiKey: "AIzaSyCo_urqG3I5MEb1eBCmHOJm15ufWzW5Vbo",
authDomain: "odos-375812.firebaseapp.com",
projectId: "odos-375812",
storageBucket: "odos-375812.appspot.com",
messagingSenderId: "377747953042",
appId: "1:377747953042:web:61fdf5c517003581ce9d4b",
measurementId: "G-R8SCX24SWJ"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
//#endregion

const date = new Date();
let currentDate = `${date.getDate()}${date.getMonth()+1}${date.getFullYear()}`;

console.log(currentDate);

const docRef = doc(db, 'song-collection', `${currentDate}`);
const docSnap = await getDoc(docRef);

if (docSnap.exists()) {
    console.log('data:', docSnap.data());
}
else {
    console.log('nope');
}

const todayArtist = docSnap.data().artist;
const todayTitle = docSnap.data().title;
const todayID = docSnap.data().id;
const todayURL = docSnap.data().url;
const todayBackground = docSnap.data().background;

localStorage.setItem('artist', todayArtist);
localStorage.setItem('title', todayTitle);
localStorage.setItem('url', todayURL);
localStorage.setItem('id', todayID);
localStorage.setItem('bg', todayBackground);

let url = `https://odos.comas-dylan.workers.dev/getLyricsByName/${todayArtist}/${todayTitle}`;

fetch(url).then(response => response.json()).then(data => { localStorage.setItem('lyrics', JSON.stringify(data.lyrics)); });