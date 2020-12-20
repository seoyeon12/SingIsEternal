import Vue from 'vue'
import App from './App.vue'
import router from './router'
import firebase from 'firebase'

Vue.config.productionTip = false

// Your web app's Firebase configuration
var firebaseConfig = {
  apiKey: "",
  authDomain: "testuser-49e8a.firebaseapp.com",
  databaseURL: "https://testuser-49e8a.firebaseio.com",
  projectId: "",
  storageBucket: "testuser-49e8a.appspot.com",
  messagingSenderId: "",
  appId: "",
  measurementId: ""
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
