import Vue from 'vue'
import Router from 'vue-router'

import Login from "./components/Login.vue"
import Home from "./components/Home.vue"

Vue.use(Router)

const router = new Router({
  routes: [
    {path: '/' , redirect: '/login'},
    {path: '/login' , component: Login},
    {path: '/home' , component: Home},
  ]
});

// 挂载路由导航守卫
router.beforeEach((to,from,next) => {
  // to 要访问的路径 from 从哪个路径来 next 放行next()或next('/login')
  // 如果访问登录页 直接放行
  if(to.path === '/login') return next();
  // 获取token
  const tokenStr = window.sessionStorage.getItem('token');
  // 没有token 强制跳转登录页
  if(!tokenStr) return next('/login');
  // 有则，放行，跳转后面的页面
  next();
})

export default router;
