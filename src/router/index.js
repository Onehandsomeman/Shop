import Vue from 'vue'
import VueRouter from 'vue-router'
const Login = ()=>import('@/views/Login')
const Home = ()=>import('@/views/Home')
const Welcome = ()=>import('@/components/HomeWelcome')
const Users = ()=>import('@/components/User/Users')
const Rights = ()=>import('@/components/Power/Rights')
const Roles = ()=>import('@/components/Power/Roles')
const Cate = ()=>import('@/components/Goods/Cate')

Vue.use(VueRouter)

const routes = [
  { path:'/login',component:Login },
  { path:'/',redirect:'/login' },
  { path:'/home',component:Home,redirect:'/welcome',
    children:[
      { path:'/welcome',component:Welcome },
      { path: '/Users',component:Users},
      { path:'/rights',component:Rights},
      { path:'/roles',component:Roles},
      { path:'/categories',component:Cate}
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
