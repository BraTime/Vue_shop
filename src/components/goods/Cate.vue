<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 添加按钮 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="showCateDialog">添加商品</el-button>
        </el-col>
      </el-row>
      <!-- 分类列表 -->
      <tree-table
        class="treetable"
        :data="categories"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        index-text="序号"
        border
        :show-row-hover="false"
      >
        <!-- 是否有效模板列 -->
        <template slot="isOk" slot-scope="scope">
          <!-- cat_deleted值为false显示√ 反之x -->
          <i v-if="scope.row.cat_deleted" class="el-icon-error" style="color: red"></i>
          <i v-else class="el-icon-success" style="color: green;"></i>
        </template>
        <!-- 排序模板列 -->
        <template slot="order" slot-scope="scope">
          <!-- 按照cat_level的值渲染标签 -->
          <el-tag size="mini" v-if="scope.row.cat_level == 0">一级</el-tag>
          <el-tag size="mini" type="success" v-else-if="scope.row.cat_level == 1">二级</el-tag>
          <el-tag size="mini" type="warning" v-else>三级</el-tag>
        </template>
        <!-- 操作模板列 -->
        <template slot="opt" slot-scope="scope">
          <el-button
            size="mini"
            type="primary"
            icon="el-icon-edit"
            @click="showEditCateDialog(scope.row)"
          >编辑</el-button>
          <el-button
            size="mini"
            type="danger"
            icon="el-icon-delete"
            @click="deleteCate(scope.row.cat_id)"
          >删除</el-button>
        </template>
      </tree-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3, 5, 8, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
    <!-- 添加分类对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="50%"
      @close="addCateDialogClose"
    >
      <el-form :model="addCateForm" :rules="addCateFormRules" ref="addFormRef" label-width="100px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <!-- options指定数据源 -->
          <!-- props指定配置对象 -->
          <el-cascader
            v-model="selectedKeys"
            :options="parentsCateList"
            :props="cascardProps"
            @change="parentCateChange"
            change-on-select
            clearable
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑对话框 -->
    <el-dialog
      title="修改名称"
      :visible.sync="editCateDialogVisible"
      width="50%"
      @close="editCateDialogClose"
    >
      <el-form
        :model="editCateForm"
        :rules="editCateFormRules"
        ref="editFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="editCateForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 查询商品分类数据条件
      queryInfo: {
        type: 3, // 3层分类列表[1,2,3]
        pagenum: 1, //当前页
        pagesize: 5, // 每页显示5条
      },
      // 存放商品分类数据列表 ，默认空
      categories: [],
      // 总数据数量
      total: 0,
      // 为tree-table指定列的定义
      columns: [
        {
          label: "分类名称", //列标题名称
          prop: "cat_name", //对应列内容的属性名
        },
        {
          label: "是否有效",
          type: "template", // 定位为模板列
          template: "isOk", // 对应的作用域插槽
        },
        {
          label: "排序",
          type: "template", // 定位为模板列
          template: "order", // 对应的作用域插槽
        },
        {
          label: "操作",
          type: "template", // 定位为模板列
          template: "opt", // 对应的作用域插槽
        },
      ],
      // 添加商品分类对话框 默认隐藏
      addCateDialogVisible: false,
      // 编辑商品分类对话框 默认隐藏
      editCateDialogVisible: false,
      // 添加分类的表单验证
      addCateForm: {
        cat_pid: 0, // 分类父id,默认0
        cat_name: "", // 分类名称
        cat_level: 0, // 分类层级0-2，默认一级分类0
      },
      // 添加分类的表单验证规则对象
      addCateFormRules: {
        cat_name: [
          { required: true, message: "请输入分类名称", trigger: "blur" },
          { min: 3, max: 10, message: "长度在 3~10个字符", trigger: "blur" },
        ],
      },
      // 前两级父类分类列表
      parentsCateList: [],
      // cascard级联选择器的配置对象
      cascardProps: {
        // 指定选项的值为某个属性值
        value: "cat_id",
        // 指定选项的标签为某个属性值
        label: "cat_name",
        // 指定选项的子选项为属性值
        children: "children",
        // 次级菜单的展开方式
        expandTrigger: "hover",
      },
      // 选中的父级分类
      selectedKeys: [],
      // 修改分类的表单验证
      editCateForm: {
        cat_name: "",
        cat_id: "",
      },
      // 修改分类的表单验证规则
      editCateFormRules: {
        cat_name: [
          { required: true, message: "请输入分类名称", trigger: "blur" },
          { min: 3, max: 10, message: "长度在 3~10个字符", trigger: "blur" },
        ],
      },
    };
  },
  created() {
    this.getCategories();
  },
  methods: {
    //  获取商品分类列表数据
    async getCategories() {
      const { data: res } = await this.$http.get("categories", {
        params: this.queryInfo,
      });
      if (res.meta.status != 200)
        return this.$message.error("获取商品分类失败");
      // console.log(res)
      this.categories = res.data.result;
      this.total = res.data.total;
    },
    // 监听pagesize改变事件
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      // 刷新列表
      this.getCategories();
    },
    // 监听当前页pagenum改变
    handleCurrentChange(newNum) {
      this.queryInfo.pagenum = newNum;
      // 刷新列表
      this.getCategories();
    },
    // 点击添加 显示对话框
    showCateDialog() {
      // 获取父级分类的数据列表
      this.getParentsCateList();
      // 再显示对话框
      this.addCateDialogVisible = true;
    },
    // 获取添加对话框父级分类列表
    async getParentsCateList() {
      const { data: res } = await this.$http.get("categories", {
        params: { type: 2 },
      });
      if (res.meta.status != 200)
        return this.$message.error("获取父级分类失败");
      this.parentsCateList = res.data;
    },
    // 添加框的父级分类选择框值改变
    parentCateChange() {
      // console.log(this.selectedKeys)
      // 判断selectedKeys长度，0未选择，添加的为一级 1为二级 2为三级
      if (this.selectedKeys.length > 0) {
        // 父id就是数组最后一个
        this.addCateForm.cat_pid = this.selectedKeys[
          this.selectedKeys.length - 1
        ];
        // 层级0-2就是数组长度
        this.addCateForm.cat_level = this.selectedKeys.length;
      } else {
        this.addCateForm.cat_pid = 0;
        // 层级0-2就是数组长度
        this.addCateForm.cat_level = 0;
      }
    },
    // 点击添加确认按钮
    addCate() {
      console.log(this.addCateForm);
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) return;
        // 校验通过，发送添加请求
        const { data: res } = await this.$http.post(
          "categories",
          this.addCateForm
        );
        if (res.meta.status != 201) return this.$message.error("添加分类失败");
        // 成功，刷新分类列表 关闭对话框
        this.$message.success("添加分类成功");
        this.getCategories();
        this.addCateDialogVisible = false;
      });
    },
    // 监听添加对话框关闭事件
    addCateDialogClose() {
      // 清空对话框表单
      this.$refs.addFormRef.resetFields();
      // 清空级联选择器选中的值
      this.selectedKeys = [];
      this.addCateForm.cat_level = 0;
      this.addCateForm.cat_pid = 0;
    },
    // 点击编辑按钮操作
    showEditCateDialog(info) {
      // console.log(info)
      this.editCateForm.cat_id = info.cat_id;
      this.editCateForm.cat_name = info.cat_name;
      this.editCateDialogVisible = true;
      console.log(this.editCateForm);
    },
    // 监听编辑分类对话框的关闭
    editCateDialogClose() {
      this.$refs.editFormRef.resetFields();
    },
    // 点击编辑对话框的确认操作
    editCate() {
      // 验证表单 提交修改申请
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) return;
        const { data: res } = await this.$http.put(
          "categories/" + this.editCateForm.cat_id,
          { cat_name: this.editCateForm.cat_name }
        );
        if (res.meta.status != 200)
          return this.$message.error("修改分类名称失败");
        // 成功，刷新分类列表 关闭对话框
        this.$message.success("修改分类名称成功");
        this.getCategories();
        this.editCateDialogVisible = false;
      });
    },
    // 点击删除按钮操作
    async deleteCate(id) {
      // 消息弹框
      const confirmRes = await this.$confirm(
        "此操作将永久删除该分类, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);
      // console.log(confirmRes)
      // 点击取消
      if (confirmRes != "confirm") {
        return this.$message.info("已取消修改");
      }
      // 点击确定 发送删除请求
      const { data: res } = await this.$http.delete("categories/" + id);
      if (res.meta.status != 200) return this.$message.error("删除分类失败");
      // 成功，刷新分类列表
      this.$message.success("删除分类成功");
      this.getCategories();
    },
  },
};
</script>

<style scoped lang="less">
.treetable {
  margin-top: 15px;
}
.el-cascader {
  width: 100%;
}
</style>
