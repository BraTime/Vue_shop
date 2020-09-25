<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 头部警告区域 -->
      <el-alert type="warning" title="注意：只允许为第三季分类设置相关参数！" show-icon closable></el-alert>
      <!-- 选择商品分类区域 -->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类：</span>
          <!-- 选择商品分类的级联选择框 -->
          <el-cascader
            v-model="selectedCateKeys"
            :options="cateList"
            :props="cateProps"
            @change="catePropsChange"
          ></el-cascader>
        </el-col>
      </el-row>
      <!-- tab页签区域 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <!-- 添加动态参数面板 -->
        <el-tab-pane label="动态参数" name="many">
          <!-- 动态按钮 -->
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
            @click="addDialogVisible = true"
          >添加参数</el-button>
          <!-- 动态面板 -->
          <el-table :data="manyTableData" border>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 循环渲染tag标签 -->
                <el-tag
                  v-for="(item, i) in scope.row.attr_vals"
                  :key="i"
                  closable
                  @close="handleClose(i , scope.row)"
                >{{item}}</el-tag>
                <!-- 输入的文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <!-- 添加tag的按钮 -->
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index" label="序号" width="50px"></el-table-column>
            <!-- 参数列和操作列 -->
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  size="mini"
                  type="primary"
                  icon="el-icon-edit"
                  @click="showEditDialog(scope.row.attr_id)"
                >修改</el-button>
                <el-button
                  size="mini"
                  type="danger"
                  icon="el-icon-delete"
                  @click="removeAttr(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 添加静态属性面板 -->
        <el-tab-pane label="静态属性" name="only">
          <!-- 静态按钮 -->
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
            @click="addDialogVisible = true"
          >添加属性</el-button>
          <!-- 静态面板 -->
          <el-table :data="onlyTableData" border>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 循环渲染tag标签 -->
                <el-tag
                  v-for="(item, i) in scope.row.attr_vals"
                  :key="i"
                  closable
                  @close="handleClose(i , scope.row)"
                >{{item}}</el-tag>
                <!-- 输入的文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <!-- 添加tag的按钮 -->
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index" label="序号" width="50px"></el-table-column>
            <!-- 参数列和操作列 -->
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  size="mini"
                  type="primary"
                  icon="el-icon-edit"
                  @click="showEditDialog(scope.row.attr_id)"
                >修改</el-button>
                <el-button
                  size="mini"
                  type="danger"
                  icon="el-icon-delete"
                  @click="removeAttr(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!--  -->
      </el-tabs>
    </el-card>
    <!-- 添加参数对话框 -->
    <el-dialog
      :title="'添加'+titleText"
      :visible="addDialogVisible"
      width="50%"
      @close="addDialogClose"
    >
      <!-- 添加参数对话框 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="addAttr">确认</el-button>
      </span>
    </el-dialog>
    <!-- 修改参数对话框 -->
    <el-dialog
      :title="'修改'+titleText"
      :visible="editDialogVisible"
      width="50%"
      @close="editDialogClose"
    >
      <!-- 修改参数对话框 -->
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="editAttr">确认</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 商品分类列表
      cateList: [],
      // cascard级联选择器的配置对象
      cateProps: {
        // 指定选择的值为某个属性值
        value: "cat_id",
        // 指定看到的值为某个属性值
        label: "cat_name",
        // 指定选项的子选项为属性值
        children: "children",
        // 次级菜单的展开方式
        expandTrigger: "hover",
      },
      //  级联选择框双向绑定到的数组
      selectedCateKeys: "",
      //  被激活的tabs页签名称
      activeName: "many",
      //  动态参数数据
      manyTableData: [],
      //  静态属性数据
      onlyTableData: [],
      //  添加参数对话框隐藏
      addDialogVisible: false,
      //  添加参数表单
      addForm: {
        attr_name: "",
      },
      //  添加参数表单验证规则
      addFormRules: {
        attr_name: [
          { required: true, message: "请输入参数名称", trigger: "blur" },
        ],
      },
      //  修改参数对话框隐藏
      editDialogVisible: false,
      //  修改参数表单
      editForm: {},
      //  修改参数表单验证规则
      editFormRules: {
        attr_name: [
          { required: true, message: "请输入参数名称", trigger: "blur" },
        ],
      },
    };
  },
  created() {
    this.getCategories();
  },
  computed: {
    isBtnDisabled() {
      if (this.selectedCateKeys.length != 3) {
        return true;
      }
      return false;
    },
    // 当前选中的三级分类id
    selectedCateId() {
      return this.selectedCateKeys[this.selectedCateKeys.length - 1];
    },
    // 动态计算添加对话框标题
    titleText() {
      if (this.activeName == "many") {
        return "动态参数";
      }
      return "静态属性";
    },
  },
  methods: {
    // 获取商品分类列表数据
    async getCategories() {
      const { data: res } = await this.$http.get("categories");
      if (res.meta.status != 200)
        return this.$message.error("获取商品分类失败");
      // console.log(res);
      this.cateList = res.data;
    },
    // 级联选择框值改变触发
    async catePropsChange() {
      // console.log(this.selectedCateKeys)
      // 只能选择三级分类 即数组长度必须为3
      if (this.selectedCateKeys.length != 3) {
        // 商品分类输入框清空
        this.selectedCateKeys = [];
        // 下边的table表也清空
        this.manyTableData = [];
        this.onlyTableData = [];
        return this.$message.error("未选择三级分类");
      }
      //  获取参数数据
      this.getParamsData();
    },
    // tab页签的点击事件
    handleTabClick() {
      // console.log(this.activeName);
      //  获取参数数据
      this.getParamsData();
    },
    // 获取参数的列表数据
    async getParamsData() {
      //根据所选数据的id和所处面板(only/many)获取对应参数数据
      const { data: res } = await this.$http.get(
        `categories/${this.selectedCateId}/attributes`,
        {
          params: { sel: this.activeName },
        }
      );
      // 将attr_vals的字符串分割成数组
      res.data.forEach((item) => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(" ") : [];
        // 自定义属性，控制tag文本框的显示隐藏
        item.inputVisible = false;
        // 自定义属性，文本框的值
        item.inputValue = "";
      });
      // console.log(res.data);
      if (res.meta.status != 200)
        return this.$message.error("获取参数信息失败");
      //  区分动态参数和静态属性数据
      if (this.activeName == "many") {
        this.manyTableData = res.data;
      } else {
        this.onlyTableData = res.data;
      }
    },
    // 点击添加 ，显示添加对话框
    showAddDialog() {
      this.addDialogVisible = true;
    },
    // 监听添加对话框的关闭事件
    addDialogClose() {
      // 重置表单
      this.$refs.addFormRef.resetFields();
    },
    // 点击添加参数确认操作
    addAttr() {
      // 表单验证通过，提交请求
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) return;
        const { data: res } = await this.$http.post(
          `categories/${this.selectedCateId}/attributes`,
          {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName,
          }
        );
        if (res.meta.status != 201) return this.$message.error("添加参数失败");
        // console.log(res);
        // 成功 关闭对话框 刷新列表
        this.$message.success("添加参数成功");
        this.getParamsData();
        this.addDialogVisible = false;
      });
    },
    // 点击修改 ，显示对话框
    async showEditDialog(attr_id) {
      // 根据参数id查询参数
      const { data: res } = await this.$http.get(
        `categories/${this.selectedCateId}/attributes/${attr_id}`,
        {
          params: { attr_sel: this.activeName },
        }
      );
      if (res.meta.status != 200) return;
      //console.log(res);
      //  将查询到的参数给修改表单 再显示对话框
      this.editForm = res.data;
      this.editDialogVisible = true;
    },
    // 监听修改对话框的关闭事件
    editDialogClose() {
      // 重置表单
      this.$refs.editFormRef.resetFields();
    },
    // 点击修改参数确认操作
    editAttr() {
      // 表单验证通过，提交请求
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) return;
        const { data: res } = await this.$http.put(
          `categories/${this.selectedCateId}/attributes/${this.editForm.attr_id}`,
          {
            attr_name: this.editForm.attr_name,
            attr_sel: this.activeName,
          }
        );
        if (res.meta.status != 200) return this.$message.error("修改参数失败");
        // console.log(res);
        // 成功 关闭对话框 刷新列表
        this.$message.success("修改参数成功");
        this.getParamsData();
        this.editDialogVisible = false;
      });
    },
    // 删除操作
    async removeAttr(attr_id) {
      const confirmRes = await this.$confirm(
        "此操作将永久删除该参数, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);
      if (confirmRes != "confirm") {
        return this.$message.info("已取消删除");
      }
      //点击了确认 发起删除请求
      const { data: res } = await this.$http.delete(
        `categories/${this.selectedCateId}/attributes/${attr_id}`
      );
      if (res.meta.status != 200) return this.$message.error("删除参数失败");
      // console.log(res);
      // 成功 关闭对话框 刷新列表
      this.$message.success("删除参数成功");
      this.getParamsData();
      this.editDialogVisible = false;
    },
    // 文本框失去焦点或按下enter触发
    handleInputConfirm(row) {
      // 判断文本框输入值是否合法
      if (row.inputValue.trim().length === 0) {
        // 去掉空格后为空 则清空文本框并隐藏
        row.inputValue = "";
        row.inputVisible = false;
        return;
      }
      // 若没有return，则进行后续处理
      row.attr_vals.push(row.inputValue.trim());
      // 清空文本框
      row.inputValue = "";
      // 发起请求，将添加值增加到数据库
      this.saveAttrVals(row);
    },
    // 修改提交参数:attr_vals保存到数据库
    async saveAttrVals(row) {
      const { data: res } = await this.$http.put(
        `categories/${this.selectedCateId}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(" "),
        }
      );
      // console.log(res)
      if (res.meta.status != 200) return this.$message.error("添加参数失败");
      // 成功了
      this.$message.success("添加参数成功");
    },
    // 点击添加tag按钮
    showInput(row) {
      // 输入框显示
      row.inputVisible = true;
      // 让文本框自动获取焦点
      // nextTick方法:当页面重新渲染后才可以执行指定回调函数中的代码(这里就是必须文本框显示后才可以执行获取焦点的函数)
      this.$nextTick((_) => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },
    // 删除对应的tag参数标签
    handleClose(i, row) {
      // 删除索引对应的参数可选项
      row.attr_vals.splice(i, 1);
      // 将对attr_vals的操作结果保存到数据库中
      this.saveAttrVals(row);
    },
    //
  },
};
</script>

<style scoped lang="less">
.cat_opt {
  margin: 15px 0;
}
.el-tag {
  margin-right: 10px;
}
.input-new-tag {
  width: 120px;
}
</style>
