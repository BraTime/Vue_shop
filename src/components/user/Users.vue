<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜索与添加区域 row,col都是栅格系统layout布局组件-->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 用户列表区域 -->
      <el-table :data="userList" border stripe>
        <el-table-column type="index" width="50" label="序号"></el-table-column>
        <!-- prop就是userList数组中每项具体的值 -->
        <el-table-column prop="username" label="姓名"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="mobile" label="电话"></el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>
        <!-- 使用了作用域插槽，所以这个prop="mg_state"会被覆盖，可删除 -->
        <el-table-column label="状态">
          <!-- 通过slot-scope获取el-table定义的row ,{{scope.row}}当前行的数据 -->
          <template slot-scope="scope">
            <!-- {{scope.row.mg_state}} -->
            <el-switch v-model="scope.row.mg_state" @change="userStateChanged(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(scope.row.id)"
            ></el-button>
            <!-- 删除按钮 -->
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeUserById(scope.row.id)"
            ></el-button>
            <!-- 设置按钮 -->
            <el-tooltip
              class="item"
              effect="dark"
              content="分配角色"
              placement="top"
              :enterable="false"
            >
              <el-button type="warning" icon="el-icon-setting" size="mini"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
    <!-- 添加用户对话框 -->
    <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="50%" @close="addDialogClose">
      <!-- 内容主体区域 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password" type="password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部按钮区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑对话框 -->
    <el-dialog
      title="编辑用户信息"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClose"
    >
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
  </div>
</template>

<script>
export default {
  data() {
    // 自定义校验邮箱规则
    var checkEmail = (rule, value, callback) => {
      const regEmail = /^[A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]+[-.])+[A-Za-z\d]{2,4}$/;
      if (regEmail.test(value)) {
        // 合法邮箱
        return callback();
      }
      callback(new Error("请输入正确邮箱"));
    };
    // 自定义校验手机号规则
    var checkMobile = (rule, value, callback) => {
      const regMobile = /^[1][3,4,5,7,8][0-9]{9}$/;
      if (regMobile.test(value)) {
        // 合法邮箱
        return callback();
      }
      callback(new Error("请输入正确手机号"));
    };
    return {
      // 获取用户请求参数
      queryInfo: {
        query: "", // 查询参数
        pagenum: 1, // 当前页码
        pagesize: 2, // 每页显示条数
      },
      // 用户列表
      userList: [],
      // 列表数据总数
      total: 0,
      // 添加用户对话框显示隐藏
      addDialogVisible: false,
      // 添加用户的表单验证
      addForm: {
        username: "",
        password: "",
        email: "",
        mobile: "",
      },
      //   添加表单的验证规则对象
      addFormRules: {
        username: [
          { required: true, message: "请输入用户名", trigger: "blur" },
          { min: 3, max: 10, message: "长度在 3~10个字符", trigger: "blur" },
        ],
        password: [
          { required: true, message: "请输入密码", trigger: "blur" },
          { min: 6, max: 15, message: "长度在 6~15个字符", trigger: "blur" },
        ],
        email: [
          { required: true, message: "请输入用户名", trigger: "blur" },
          { validator: checkEmail, trigger: "blur" },
        ],
        mobile: [
          { required: true, message: "请输入用户名", trigger: "blur" },
          { validator: checkMobile, trigger: "blur" },
        ],
      },
      // 编辑用户对话框显示隐藏
      editDialogVisible: false,
      // 保存查询到的用户信息
      editForm: {},
      //   编辑用户表单验证规则对象
      editFormRules: {
        email: [
          // 必选项 提示信息 失去焦点校验
          { required: true, message: "请输入邮箱", trigger: "blur" },
          { validator: checkEmail, trigger: "blur" },
        ],
        mobile: [
          { required: true, message: "请输入手机号", trigger: "blur" },
          { validator: checkMobile, trigger: "blur" },
        ],
      },
    };
  },
  created() {
    // 一初始化 就获取用户列表
    this.getUserList();
  },
  methods: {
    // 获取用户列表
    async getUserList() {
      const { data: res } = await this.$http.get("users", {
        params: this.queryInfo,
      });
      //console.log(res);
      if (res.meta.status != 200) return this.$message.error("获取用户失败");
      this.userList = res.data.users;
      this.total = res.data.total;
    },
    // 监听pagesize改变 选择每页显示多少条
    handleSizeChange(newSize) {
      //console.log(newSize)
      this.queryInfo.pagesize = newSize;
      // 重新获取数据
      this.getUserList();
    },
    // 监听页码值改变
    handleCurrentChange(newPage) {
      //console.log(newPage)
      this.queryInfo.pagenum = newPage;
      this.getUserList();
    },
    // 监听switch开关状态的改变
    async userStateChanged(userinfo) {
      // console.log(userinfo)
      // 调用修改状态的api。将状态存入数据库
      const { data: res } = await this.$http.put(
        `users/${userinfo.id}/state/${userinfo.mg_state}`
      );
      if (res.meta.status != 200) {
        // 不能更新状态 且提示失败
        userinfo.mg_state = !userinfo.mg_state;
        return this.$message.error("状态更新失败");
      }
      this.$message.success("状态更新成功");
    },
    // 监听添加用户对话框 关闭事件
    addDialogClose() {
      // 关闭 重置表单
      this.$refs.addFormRef.resetFields();
    },
    // 添加用户 表单预验证
    addUser() {
      // validate任一表单项被校验后触发
      this.$refs.addFormRef.validate(async (valid) => {
        // console.log(valid) 是个布尔值
        if (!valid) return;
        // 表单验证通过 发起添加请求
        const { data: res } = await this.$http.post("/users", this.addForm);
        if (res.meta.status != 201) {
          this.$message.error("添加用户失败");
        }
        this.$message.success("添加用户成功");
        // 关闭添加弹出框
        this.addDialogVisible = false;
        //  再重新获取用户列表
        this.getUserList();
      });
    },
    // 点击编辑操作
    async showEditDialog(id) {
      // 根据id查询用户信息
      const { data: res } = await this.$http.get("/users/" + id);
      // console.log(res)
      if (res.meta.status != 200) {
        return this.$message.erroe("查询用户失败");
      }
      this.editForm = res.data;
      // 弹出编辑框
      this.editDialogVisible = true;
    },
    // 监听编辑框关闭时间
    editDialogClose() {
      // 关闭 重置表单
      this.$refs.editFormRef.resetFields();
    },
    // 编辑用户信息 表单预验证
    editUserInfo() {
      // 表单验证
      this.$refs.editFormRef.validate(async (valid) => {
        // 未通过
        if (!valid) return;
        // 通过 发起修改请求
        const { data: res } = await this.$http.put(
          "/users/" + this.editForm.id,
          {
            email: this.editForm.email,
            mobile: this.editForm.mobile,
          }
        );
        // console.log(res)
        if (res.meta.status != 200) {
          return this.$message.error("修改用户信息失败");
        }
        // 关闭对话框 刷新列表 提示成功信息
        this.editDialogVisible = false;
        this.getUserList();
        this.$message.success("修改用户信息成功");
      });
    },
    // 根据id删除对应用户信息
    async removeUserById(id) {
      // 删除确认框
      const resConfirm = await this.$confirm(
        "此操作将永久删除该用户, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);
      // 点击确认，输出confirm 点取消 报错 使用catch捕获错误后 输出cancel
      // console.log(resConfirm)
      if (resConfirm != "confirm") {
        return this.$message.info("已取消删除");
      }
      // 发送请求 删除用户信息
      const { data: res } = await this.$http.delete("/users/" + id);
      if (res.meta.status != 200) {
        return this.$message.error("删除用户失败");
      }
      // 删除成功 刷新列表并提升成功信息
      this.getUserList();
      this.$message.success("已删除用户信息");
    },
    
  },
};
</script>

<style scoped lang="less">
</style>
