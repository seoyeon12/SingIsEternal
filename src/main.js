import Vue from 'vue'
import App from './App.vue'
import router from './router'
import firebase from 'firebase'

Vue.config.productionTip = false

// 파이어베이스 설정 Config
// Info.txt
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
