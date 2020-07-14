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
            var regExp = /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i;
            
            if(this.email == "" || this.password == ""){
                alert("이메일 또는 비밀번호를 입력해주세요!!");
            }else if(regExp.test(this.email) == false){
                alert("이메일 형식이 올바르지 않습니다.");
            }else{
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
            }
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