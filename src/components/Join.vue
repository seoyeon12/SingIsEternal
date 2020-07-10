<template>
    <div class="join">
        <p>회원가입</p>
        <input type="text" placeholder="email" v-model="email"><br>
        <input type="password" placeholder="password" v-model="password"><br>
        <button v-on:click="join">가입하기</button>
        <span>또는 <router-link to="/login">로그인</router-link>으로 돌아가기</span>
    </div>
</template>

<script>
import firebase from 'firebase'

export default {
    name: 'Join',
    data() {
        return {
            email: '',
            password: ''
        }
    },
    methods: {
        join() {
            firebase.auth().createUserWithEmailAndPassword(this.email, this.password)
            .then(() => {
                alert('회원가입 되었습니다.');
                this.$router.push("/login");
            })
            .catch(function(error) {
                // Handle Errors here.
                var errorCode = error.code;
                var errorMessage = error.message;
                if (errorCode == 'auth/weak-password') {
                    alert('비밀번호가 많이 취약합니다... 다시 입력해주세요!!');
                } else {
                    alert(errorMessage);
                }
                console.log(error);
            });
        // console.log(this.email," : ",typeof(this.email));
        // console.log(this.password," : ",typeof(this.password));
        }
    }
}
</script>

<style scoped>
.join {
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
    font-size: 20px;
}
span {
    display: block;
    margin-top: 20px;
    font-size: 15px;
}
</style>