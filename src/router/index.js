import Vue from 'vue'
import VueRouter from 'vue-router'
const Login = ()=>import('@/views/Login')
const Home = ()=>import('@/views/Home')
const Welcome = ()=>import('@/components/HomeWelcome')
const Users = ()=>import('@/components/Users')


Vue.use(VueRouter)

const routes = [
  { path:'/login',component:Login },
  { path:'/',redirect:'/login' },
  { path:'/home',component:Home,redirect:'/welcome',
    children:[
      { path:'/welcome',component:Welcome },
      { path: '/Users',component:Users}
    ]
  }
]


const router = new VueRouter({
  routes
})

router.beforeEach((to,from,next)=>{
  if(to.path === '/login') return next()
  const tokenStr = window.sessionStorage.getItem('token')
  if(!tokenStr) return next('/login')
  next()
})


export default router
