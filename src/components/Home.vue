<template>
    <div class="home">
        <el-button type="info" @click="logout">退出</el-button>
    </div>
</template>

<script>
    export default {
        methods: {
            // 退出登录
            logout() {
                // 1.清除token 2.跳转登录页
                window.sessionStorage.clear();
                this.$router.push('/login');
            }
        },
    }
</script>

<style lang="less" scoped>

</style>