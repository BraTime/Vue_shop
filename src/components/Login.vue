<template>
  <div class="login-container">
    <div class="login_box">
      <!-- 头像区域 -->
      <div class="avatar_box">
        <img src="../assets/logo.png" alt />
      </div>
      <!-- 登录表单区域 -->
      <!-- :model绑定表单数据对象 :rules绑定表单验证规则对象 表单每一项的规则名为prop属性 -->
      <el-form
        ref="loginForm"
        :model="loginForm"
        :rules="loginRules"
        label-width="0px"
        class="login_form"
      >
        <!-- 用户名 -->
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            prefix-icon="iconfont icon-user"
            placeholder="请输入用户名"
          ></el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            prefix-icon="iconfont icon-3702mima"
            type="password"
            placeholder="请输入密码"
          ></el-input>
        </el-form-item>
        <!-- 按钮 -->
        <el-form-item class="btns">
          <el-button type="primary" @click="login('loginForm')">登录</el-button>
          <el-button type="info" @click="resetForm('loginForm')">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 登录表单的数据绑定对象
      loginForm: {
        username: "admin",
        password: "123456",
      },
      // 表单验证规则对象 失去焦点后验证
      loginRules: {
        // 验证用户名是否合法
        username: [
          { required: true, message: "请输入登录名称", trigger: "blur" },
          {
            min: 3,
            max: 10,
            message: "长度在 3 到 10 个字符",
            trigger: "blur",
          },
        ],
        // 验证密码是否符合规则
        password: [
          { required: true, message: "请输入登录密码", trigger: "blur" },
          {
            min: 6,
            max: 15,
            message: "长度在 6 到 15 个字符",
            trigger: "blur",
          },
        ],
      },
    };
  },
  methods: {
    // 表单重置
    resetForm(formName) {
      //console.log(this.$refs[formName]);
      this.$refs[formName].resetFields();
    },
    // 表单登录
    login(formName) {
      // validate对整个表单进行校验的方法。若不传入回调函数，则会返回一个 promise
      this.$refs[formName].validate(async (valid) => {
        // valid是布尔值 表示校验成功没
        if (!valid) return;
        // 验证成功后再登录  提取结果中的data键的值res
        const {data: res} = await this.$http.post('login' , this.loginForm)
        //console.log(res);
        // 判断请求状态
        if(res.meta.status !== 200) return this.$message.error('登录失败');
        
        this.$message.success('登录成功');
        // 1、登录成功之后的 token 保存到sessionStorage中
        //     a.其他接口需在登录之后才能访问
        //     b.token只在当前网页有效 所以保存在sessionStorage中
        //console.log(res);
        // 将token保存到浏览器临时缓存中
        window.sessionStorage.setItem("token" , res.data.token);
        // 2、通过编程式导航 跳转后台主页 路由地址/home
        this.$router.push('/home');
        // 路由导航
      });
    },
  },
};
</script>

<style lang="less" scoped>
.login-container {
  height: 100%;
  background-color: #2b4b6b;
  .login_box {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 450px;
    height: 300px;
    background-color: #fff;
    border-radius: 3px;
    .avatar_box {
      position: absolute;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 130px;
      height: 130px;
      background-color: #fff;
      border: 1px solid #fff;
      border-radius: 50%;
      padding: 10px;
      box-shadow: 0 0 10px #ddd;
      img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background-color: #eee;
      }
    }
    .login_form {
      position: absolute;
      bottom: 0;
      width: 100%;
      padding: 0 20px;
      box-sizing: border-box;
      .btns {
        display: flex;
        justify-content: flex-end;
      }
    }
  }
}
</style>