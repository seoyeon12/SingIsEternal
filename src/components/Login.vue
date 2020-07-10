<template>
    <div class="login">
        <div class="loginForm" v-if="isLogin">
            <h3>Login</h3>
            <input type="text" v-model="email" placeholder="email"><br>
            <input type="password" v-model="password" placeholder="password"><br>
            <button v-on:click="login">로그인</button>
            <p>만약 계정이 없다면,<router-link :to="{ name: 'Join'}">회원가입</router-link>을 먼저 진행해주세요!</p>
        </div>
        <div class="succLogin" v-if="!isLogin">
            <h3>{{ email }}</h3>
            <h3>어서오십시오. 곧 즐겨찾기 기능이 지원될 예정입니다.</h3>
        </div>
    </div>
</template>

<script>
import firebase from 'firebase'

export default {
    name: 'login',
    data() {
        return{
            email: '',
            password: '',
            isLogin: true
        }
    },
    mounted () {
        console.log("11111111111111111111111");
        if(sessionStorage.length === 0){
            this.isLogin = true;
            console.log("로그인이 안되어있습니다.");
        }else{
            this.isLogin = !this.isLogin;
            this.email = sessionStorage.getItem('email');
            console.log("로그인이 된 상태입니다.");
        }
    },
    methods: {
        /*login() {
            firebase.auth().onAuthStateChanged(function(user) {
                if (user) {
                    // User is signed in.
                    alert("Succed Login");
                    console.log("Succed Login");
                    //console.log(this.email, this.password);
                    //console.log(user);
                    // this.saveUserInfo();
                    this.$router.push('/');
                    // this.$router.push({ name: "Home" });
                } else {
                    // No user is signed in.
                    alert("UnSucced Login");
                }
            });
        },*/
        login() {
            firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION)
                .then(() => {
                    // console.log("####", this);
                    return firebase.auth().signInWithEmailAndPassword(this.email, this.password);
                })
                .then(() => {
                    const user = firebase.auth().currentUser;
                    // console.log(user);
                    this.isLogin = false;
                    sessionStorage.setItem('email', user.email);
                    alert(`로그인 완료 ${user.email}`);
                    this.$router.push("/");
                })
                .catch(function(error) {
                    const errorCode = error.code;
                    const errorMessage = error.message;
                    alert(errorMessage + errorCode);
                });
        }
    }
}
</script>

<style scoped>
.login {
    margin-top: 40px;
}
input {
    margin: 10px 0;
    width: 20%;
    padding: 15px;
}
button {
    margin-top: 20px;
    width: 10%;
    cursor: pointer;
}
p {
    margin-top: 40px;
    font-size: 15px;
}
p a {
    text-decoration: underline;
    cursor: pointer;
}
</style>