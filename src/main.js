import Vue from 'vue'
import App from './App.vue'
import router from './router'
import firebase from 'firebase'

Vue.config.productionTip = false

// Your web app's Firebase configuration
var firebaseConfig = {
  apiKey: "AIzaSyD_TV5LVhncrcqUHbPcsQ5T32MYbshM3No",
  authDomain: "testuser-49e8a.firebaseapp.com",
  databaseURL: "https://testuser-49e8a.firebaseio.com",
  projectId: "testuser-49e8a",
  storageBucket: "testuser-49e8a.appspot.com",
  messagingSenderId: "86454766357",
  appId: "1:86454766357:web:0be3273044eab89944371c",
  measurementId: "G-Y0N37HYBGH"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
