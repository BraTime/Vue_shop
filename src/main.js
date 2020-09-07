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
// 请求拦截器 一请求即触发
axios.interceptors.request.use(config => {
  // console.log(config.headers)
  // 给请求头设置一个token字段 Authorization: token值 以便获取有权限的api
  config.headers.Authorization = window.sessionStorage.getItem('token');
  // 最后一定要返回config
  return config;
})
//设置成全局的，然后再组件中通过this调用
Vue.prototype.$http = axios

// 引入element-ui
// import ElementUI from "element-ui"
 import "element-ui/lib/theme-chalk/index.css"
// Vue.use(ElementUI)
// 按需导入element-ui
import {Button , Form , FormItem , Input , Message , Container , Header , Main , Aside  , Menu , Submenu , MenuItem , Breadcrumb , BreadcrumbItem , Card , Row , Col , Table , TableColumn , Switch , Tooltip , Pagination , Dialog , MessageBox} from "element-ui"
// Message弹框提示组件
Vue.use(Button)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)
Vue.use(Container)
Vue.use(Header)
Vue.use(Main)
Vue.use(Aside)
Vue.use(Menu)
Vue.use(Submenu)
Vue.use(MenuItem)
Vue.use(Breadcrumb)
Vue.use(BreadcrumbItem)
Vue.use(Card)
Vue.use(Row)
Vue.use(Col)
Vue.use(Table)
Vue.use(TableColumn)
Vue.use(Switch)
Vue.use(Tooltip)
Vue.use(Pagination)
Vue.use(Dialog)

// 全局挂载弹框提示
Vue.prototype.$message = Message;
// 全局挂载消息确认框
Vue.prototype.$confirm = MessageBox.confirm;



Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
