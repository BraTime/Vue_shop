<template>
  <!-- 布局容器 -->
  <el-container class="home-container">
    <!-- 头部区域 -->
    <el-header>
      <div>
        <img src="../assets/logo.png" alt />
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <!-- 页面主体区域 -->
    <el-container>
      <!-- 左侧边栏 -->
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <!-- 菜单折叠按钮 collapse属性是否水平折叠-->
        <div class="toggle-button" @click="toggleCollapse">|||</div>
        <!-- 侧边栏菜单区域 unique-opened控制每次只能展开一个菜单 router属性表示是否开启路由模式 default-active当前菜单高亮显示-->
        <el-menu background-color="#333744" text-color="#fff" active-text-color="#369BFF" unique-opened :collapse="isCollapse" :collapse-transition="false" :router="true" :default-active="activePath">
          <!-- 一级菜单 index表示菜单的唯一标识 -->
          <el-submenu :index="item.id+''" v-for="item in menuList" :key="item.id">
            <!-- 一级菜单区域 -->
            <template slot="title">
              <i :class="iconsObj[item.id]"></i>
              <span>{{item.authName}}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item :index="'/'+itemChild.path" v-for="itemChild in item.children" :key="itemChild.id" @click="saveNavState('/'+itemChild.path)">
              <template slot="title">
                <i class="el-icon-menu"></i>
                <span>{{itemChild.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 右侧内容 -->
      <el-main>
        <!-- 路由占位符 -->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
    data() {
        return {
            // 存放左侧菜单数据
            menuList: [],
            // 一级菜单的id指向字体图标
            iconsObj: {
                '125': 'iconfont icon-users',
                '103': 'iconfont icon-tijikongjian',
                '101': 'iconfont icon-shangpin',
                '102': 'iconfont icon-danju',
                '145': 'iconfont icon-baobiao',
            },
            isCollapse: false, // 是否水平折叠菜单
            activePath: '', // 被激活的链接地址
        }
    },
    created() {
        this.getMenuList();
        // 一初始化，立即把activePath值取出来
        this.activePath = window.sessionStorage.getItem('activePath');
    },
  methods: {
    // 退出登录
    logout() {
      // 1.清除token 2.跳转登录页
      window.sessionStorage.clear();
      this.$router.push("/login");
    },
    // 获取左侧菜单
    async getMenuList() {
        const {data: res } = await this.$http.get('menus');
        // console.log(res)
        // 获取失败 弹出失败信息
        if(res.meta.status !== 200) return this.$message.error(res.meta.message);
        // 获取成功
        this.menuList = res.data;
        // console.log(this.menuList)
    },
    // 切换水平菜单的折叠展开
    toggleCollapse() {
      this.isCollapse = !this.isCollapse;
    },
    // 保存链接的激活状态
    saveNavState(activePath) {
      // 保存点击的path到sessionStorage中
      window.sessionStorage.setItem('activePath' , activePath);
      this.activePath = activePath;
    }
  },
};
</script>

<style lang="less" scoped>
.home-container {
  height: 100%;
  .el-header {
    background-color: #373d41;
    display: flex;
    justify-content: space-between;
    padding-left: 0;
    color: #fff;
    font-size: 20px;
    align-items: center;
    > div {
      display: flex;
      align-items: center;
      img {
        width: 50px;
        height: 50px;
        margin-right: 15px;
      }
    }
  }
  .el-aside {
    background-color: #333744;
    .toggle-button {
      background-color: #485164;
      font-size: 10px;
      line-height: 24px;
      color: #fff;
      text-align: center;
      letter-spacing: 0.2em; // 字间距
      cursor: pointer;
    }
    .iconfont {
        margin-right: 10px;
    }
    .el-menu {
        border-right: none;
    }
  }
  .el-main {
    background-color: #eaedf2;
  }
}
</style>