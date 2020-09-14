<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加角色按钮区域 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addRolesDialog = true">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 角色列表区域 -->
      <el-table :data="rolesList" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              v-for="(item1 , i1) in scope.row.children"
              :key="item1.id"
              :class="['al-center' , 'bd-bottom' , i1 === 0 ? 'bd-top' : '']"
            >
              <!-- 一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row , item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 二级和三级权限 -->
              <el-col :span="19">
                <el-row
                  v-for="(item2 , i2) in item1.children"
                  :key="item2.id"
                  :class="['al-center' , i2 === 0 ? '' : 'bd-top']"
                >
                  <!-- 二级权限 -->
                  <el-col :span="8">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRightById(scope.row , item2.id)"
                    >{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 三级权限 -->
                  <el-col :span="16">
                    <el-tag
                      type="warning"
                      v-for="item3 in item2.children"
                      :key="item3.id"
                      closable
                      @close="removeRightById(scope.row , item3.id)"
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index" label="序号" width="50"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <el-button
              type="primary"
              size="mini"
              icon="el-icon-edit"
              @click="showEditDialog(scope.row.id)"
            >编辑</el-button>
            <el-button
              type="danger"
              size="mini"
              icon="el-icon-delete"
              @click="removeRolesById(scope.row.id)"
            >删除</el-button>
            <el-button
              type="warning"
              size="mini"
              icon="el-icon-setting"
              @click="showSetRightsDialog(scope.row)"
            >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 添加角色对话框 -->
    <el-dialog title="添加角色" :visible.sync="addRolesDialog" width="50%" @close="addDialogClose">
      <!-- 内容区域 -->
      <el-form :model="addForm" :rules="addRolesFormRules" ref="rolesFormRef" label-width="70px">
        <el-form-item label="角色名" prop="roleName">
          <el-input v-model="addForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input v-model="addForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addRolesDialog = false">取 消</el-button>
        <el-button type="primary" @click="addRoles">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑角色对话框 -->
    <el-dialog title="编辑角色" :visible.sync="editRolesDialog" width="50%" @close="editDialogClose">
      <!-- 内容区域 -->
      <el-form :model="editForm" :rules="editRolesFormRules" ref="editFormRef" label-width="70px">
        <el-form-item label="角色ID">
          <el-input v-model="editForm.roleId" disabled></el-input>
        </el-form-item>
        <el-form-item label="角色名" prop="roleName">
          <el-input v-model="editForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input v-model="editForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editRolesDialog = false">取 消</el-button>
        <el-button type="primary" @click="editRoles">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配权限对话框 -->
    <el-dialog title="分配权限" :visible.sync="setRightsdialogVisible" width="50%">
      <!-- 树形组件 -->
      <el-tree
        ref="treeRef"
        :data="rightsList"
        :props="rightsProps"
        node-key="id"
        show-checkbox
        default-expand-all
        :default-checked-keys="defKeys"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightsdialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 存放角色列表
      rolesList: [],
      // 存放权限列表
      rightsList: [],
      // 添加角色对话框默认隐藏
      addRolesDialog: false,
      // 编辑角色框默认隐藏
      editRolesDialog: false,
      // 权限对话框默认隐藏
      setRightsdialogVisible: false,
      // 添加角色表单
      addForm: {
        roleName: "",
        roleDesc: "",
      },
      // 添加角色表单验证规则
      addRolesFormRules: {
        roleName: [
          { required: true, message: "请输入角色名", trigger: "blur" },
          { min: 3, max: 10, message: "长度在 3~10个字符", trigger: "blur" },
        ],
      },
      // 编辑角色表单
      editForm: {
        roleId: "",
        roleName: "",
        roleDesc: "",
      },
      // 编辑角色表单验证规则
      editRolesFormRules: {
        roleName: [
          { required: true, message: "请输入角色名", trigger: "blur" },
          { min: 3, max: 10, message: "长度在 3~10个字符", trigger: "blur" },
        ],
      },
      //树形组件的权限属性绑定对象
      rightsProps: {
        children: "children", //指定子树为节点对象的某个属性值
        label: "authName", //指定节点标签为节点对象的某个属性值
      },
      // 默认勾选的节点的 key 的数组
      defKeys: [],
      // 即将分配角色的id
      roleId: "",
    };
  },
  created() {
    this.getRolesList();
  },
  methods: {
    // 获取角色列表
    async getRolesList() {
      const { data: res } = await this.$http.get("/roles");
      if (res.meta.status !== 200)
        return this.$message.error("获取角色列表失败！");

      this.rolesList = res.data;
    },
    // 添加角色
    addRoles() {
      // 表单校验通过后再发起请求
      this.$refs.rolesFormRef.validate(async (valid) => {
        if (!valid) return;
        const { data: res } = await this.$http.post("roles", this.addForm);
        if (res.meta.status !== 201) return this.$message.error("添加角色失败");
        // 成功，关闭对话框，更新角色列表
        this.$message.success("添加角色成功");
        this.addRolesDialog = false;
        this.getRolesList();
      });
    },
    // 监听添加对话框关闭事件
    addDialogClose() {
      // 重置表单
      this.$refs.rolesFormRef.resetFields();
    },
    // 监听编辑对话框关闭事件
    editDialogClose() {
      // 重置表单
      this.$refs.editFormRef.resetFields();
    },
    // 点击编辑按钮
    async showEditDialog(id) {
      // 根据id获取数据
      const { data: res } = await this.$http.get("roles/" + id);
      if (res.meta.status != 200) {
        return this.$message.erroe("查询角色失败");
      }
      this.editForm = res.data;
      // 弹出编辑框
      this.editRolesDialog = true;
    },
    // 提交编辑内容
    editRoles() {
      // 表单校验通过后才可提交
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) return;
        // 通过提交
        const { data: res } = await this.$http.put(
          "roles/" + this.editForm.roleId,
          this.editForm
        );
        if (res.meta.status != 200) {
          return this.$message.erroe("提交角色信息失败");
        }
        // 成功 关闭表单 刷新角色列表
        this.$message.success("提交角色信息成功");
        this.getRolesList();
        this.editRolesDialog = false;
      });
    },
    // 点击删除按钮
    async removeRolesById(id) {
      // resConfirm用于接收点击确认取消的输出值
      const resConfirm = await this.$confirm(
        "此操作将永久删除该角色, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);
      // 点击确认，输出confirm
      // 点取消 报错 使用catch捕获错误后 输出cancel
      if (resConfirm != "confirm") {
        return this.$message.info("已取消删除");
      }
      // 点击确认 执行删除操作
      const { data: res } = await this.$http.delete("roles/" + id);
      if (res.meta.status != 200) {
        // 删除失败
        return this.$message.error("删除用户失败");
      }
      // 删除成功 刷新列表
      this.getRolesList();
      this.$message.success("已删除角色信息");
    },
    // 根据id删除对应权限
    async removeRightById(role, rightId) {
      const resConfirm = await this.$confirm(
        "此操作将永久删除该权限, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);
      // 点击确认，输出confirm
      // 点取消 报错 使用catch捕获错误后 输出cancel
      if (resConfirm != "confirm") {
        return this.$message.info("已取消删除");
      }
      // 确认 则删除权限
      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${rightId}`
      );
      if (res.meta.status != 200) {
        // 删除失败
        return this.$message.error("删除权限失败");
      }
      // 删除成功 刷新权限
      // this.getRolesList(); 会刷新页面
      // 直接将返回的权限给角色信息
      role.children = res.data;
      this.$message.success("已删除该权限");
    },
    // 点击分配权限操作 显示对话框
    async showSetRightsDialog(role) {
      // 获取角色id
      this.roleId = role.id;
      // 获取所有权限
      const { data: res } = await this.$http.get("rights/tree");
      if (res.meta.status != 200)
        return this.$message.error("获取权限列表失败");
      this.rightsList = res.data;
      // 获取该角色的三级权限
      const arr = [];
      this.getLeafKeys(role, arr);
      //console.log(arr)
      // 将其给默认勾选的id数组
      this.defKeys = arr;
      this.setRightsdialogVisible = true;
    },
    // 通过递归获取角色下所有三级权限的id 并存入arr中
    getLeafKeys(node, arr) {
      // 通过判断有无children属性 来区分是否是三级权限
      // 没有children 是三级权限
      if (!node.children) return arr.push(node.id);
      // 不是三级 则在循环中递归调用
      node.children.forEach((item) => {
        this.getLeafKeys(item, arr);
      });
    },
    // 点击分配权限设置确定操作
    async allotRights() {
      // 获取已选择和半选中的权限的id
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys(),
      ];
      // console.log(keys)
      // 拼接以，分割的字符串
      const idStr = keys.join(",");
      // 通过 请求体 发送给后端
      const { data: res } = await this.$http.post(
        `roles/${this.roleId}/rights`,
        { rids: idStr }
      );
      if (res.meta.status != 200) return this.$message.error("分配权限失败");
      this.$message.success("分配权限成功");
      // 更新权限列表 关闭对话框
      this.getRolesList();
      this.setRightsdialogVisible = false;
    },
    // 
  },
};
</script>

<style scoped lang="less">
.el-tag {
  margin: 7px;
}
.al-center {
  display: flex;
  align-items: center;
}
.bd-top {
  border-top: 1px solid #eee;
}
.bd-bottom {
  border-bottom: 1px solid #eee;
}
</style>
