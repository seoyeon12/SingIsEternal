import Vue from 'vue'
import Router from 'vue-router'

import HomeMap from '@/components/Map'
import Login from '@/components/Login'
import Join from '@/components/Join'

Vue.use(Router)

export default new Router({
    mode: 'history',
    routes: [
        {
            path: '/',
            name: 'Home',
            component: HomeMap
        },
        {
            path: '/login',
            name: 'Login',
            component: Login
        },
        {
            path: '/join',
            name: 'Join',
            component: Join
        }
    ]
})