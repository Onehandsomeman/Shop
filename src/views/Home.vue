<template>
  <el-container>
    <el-header>
      <div>
        <img src="../assets/test.jpg" alt="">
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>

    <el-container>
      <el-aside :width="isCollapse?'64px':'200px'">
        <div class="toggle" @click="toggleCollapse">|||</div>
        <el-menu background-color="#333744" text-color="#fff"
                 active-text-color="#409eff" unique-opened
                 :collapse="isCollapse" :collapse-transition="false"
                 router :default-active="activePath">
          <el-submenu :index="item.id+''" v-for="item in menuList" :key="item.id">
            <template slot="title">
              <i :class="iconsObj[item.id]"></i>
              <span>{{item.authName}}</span>
            </template>
            <el-menu-item :index="items.path"
                          v-for="items in item.children"
                          :key="items.id" @click="saveNavState(items.path)">
              <template slot="title">
                <i class="el-icon-menu"></i>
                {{items.authName}}
              </template>
            </el-menu-item>
           </el-submenu>
        </el-menu>
      </el-aside>
      <el-main>
        <router-view/>
      </el-main>
    </el-container>
  </el-container>

</template>

<script>
  export default {
    name: "Home",
    data(){
      return{
        menuList:[],
        iconsObj: {
            '125': 'iconfont icon-user',
            '103': 'iconfont icon-tijikongjian',
            '101': 'iconfont icon-shangpin',
            '102': 'iconfont icon-danju',
            '145': 'iconfont icon-baobiao'
        },
        isCollapse:false,
        activePath:''
      }
    },
    created(){
      this.getMenuList()
      this.activePath = window.sessionStorage.getItem('activePath')
    },
    methods:{
      logout(){
        window.sessionStorage.clear();
        this.$router.push('/login')
      },
      async getMenuList(){
        const {data:res} = await this.$http.get('menus')
          if(res.meta.status !== 200) return this.$message.error(res.meta.status);
          this.menuList = res.data


      },
      toggleCollapse(){
        this.isCollapse = !this.isCollapse;
      },
      saveNavState(state){
        window.sessionStorage.setItem('activePath',state)
        this.activePath = state;

      }
    }
  }
</script>

<style lang="less" scoped>
  .el-container{
    height: 100%;
  }
.el-header{
  background-color: #373d41;
  display: flex;
  justify-content: space-between;
  padding-left: 0;
  align-items: center;
  color: #fff;
  font-size: 20px;
  >div{
    display: flex;
    align-items: center;
  }
  img{
    height: 60px;
    width: 60px;
    border-radius: 50%;
    margin-right: 15px;
  }
}
.iconfont{
  margin-right: 15px;
}
  .el-aside{
    background-color: #333744;
    .el-menu{
      border-right: 0;
    }
  }
  .el-main{
    background-color: #eaedf1;
  }

  .toggle{
    background-color: #4a5064;
    font-size: 10px;
    line-height: 24px;
    color: #fff;
    text-align: center;
    letter-spacing: 0.2em;
    cursor: pointer;
  }
</style>
