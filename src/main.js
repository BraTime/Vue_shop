import Vue from 'vue'
import App from './App.vue'
import router from './router'
// 导入字体图标
import './assets/fonts/iconfont.css';
// 导入全局样式
import "./assets/css/global.css"
// 导入axios
import axios from "axios"
// 设置请求的根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
//设置成全局的，然后再组件中通过this调用
Vue.prototype.$http = axios
// 引入element-ui
// import ElementUI from "element-ui"
 import "element-ui/lib/theme-chalk/index.css"
// Vue.use(ElementUI)
// 按需导入element-ui
import {Button , Form , FormItem , Input , Message} from "element-ui"
// Message弹框提示组件
Vue.use(Button)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)
// 全局挂载弹框提示
Vue.prototype.$message = Message;



Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
