<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <el-table :data="rightsList" border stripe>
        <el-table-column type="index" width="50" label="序号"></el-table-column>
        <el-table-column label="权限名称" prop="authName"></el-table-column>
        <el-table-column label="访问路径" prop="path"></el-table-column>
        <el-table-column label="权限层级" prop="level" width="270px">
          <template slot-scope="scope">
            <el-button v-if="scope.row.level == 0" type="primary" size="mini" plain>一级</el-button>
            <el-button v-else-if="scope.row.level == 1" type="success" size="mini" plain>二级</el-button>
            <el-button type="danger" size="mini" v-else plain>三级</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 存放权限列表
      rightsList: [],
    };
  },
  created() {
    this.getRightsList();
  },
  methods: {
    async getRightsList() {
      const {data: res} = await this.$http.get('rights/list');
      if(res.meta.status !== 200) return this.$message.error('获取权限列表失败！');
      
      this.rightsList = res.data;


    }
  },
};
</script>

<style scoped lang="less">
</style>
