import { initializeApp } from 'firebase/app'

const firebaseConfig = {
  apiKey: 'AIzaSyB8qFEmI627YHNjBoEMqNFJaN04UpCw7co',
  authDomain: 'tarp-a37fe.firebaseapp.com',
  databaseURL: 'https://tarp-a37fe-default-rtdb.firebaseio.com',
  projectId: 'tarp-a37fe',
  storageBucket: 'tarp-a37fe.appspot.com',
  messagingSenderId: '793409882466',
  appId: '1:793409882466:web:1c51283b9cefec9729443b',
  measurementId: 'G-4PCCZ1R6BR',
}

export const app = initializeApp(firebaseConfig)
