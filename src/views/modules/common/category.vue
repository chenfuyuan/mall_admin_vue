<!--  -->
<template>
  <el-tree
    :data="menus"
    :props="defaultProps"
    :expand-on-click-node="false"
    node-key="catId"
    ref="tree"
    @node-click="handleNodeClick"
  >
  </el-tree>
</template>

<script>
//这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
//例如：import 《组件名称》 from '《组件路径》';
import Tool from "@/utils/Tool"
export default {
  //import引入的组件需要注入到对象中才能使用
  components: {},
  data() {
    //这里存放数据
    return {
      menus: [], //菜单
      defaultProps: {
        children: "subCategorys",
        label: "name",
      },
    };
  },
  //监听属性 类似于data概念
  computed: {},
  //监控data中的数据变化
  watch: {},
  //方法集合
  methods: {

    //操控节点点击事件
    handleNodeClick(data,node,component){
      let categoryPath = [];
      this.getCategoryPath(node,categoryPath);
      data.categoryPath = categoryPath;
      console.log(data)
      this.$emit("handle-node-click",data,node,component);
    },

    getCategoryPath(node,path) {
      if(Tool.isEmpty(node) || Tool.isEmpty(node.parent)) {
        return;
      }
      this.getCategoryPath(node.parent,path);
      path.push(node.data.catId);
    },
    
    //获取菜单
    getMenus() {
      this.$http({
        url: this.$http.adornUrl("/product/category/list/tree"),
        method: "get",
      }).then(({ data }) => {
        this.menus = data.data;
      });
    },
  },
  //生命周期 - 创建完成（可以访问当前this实例）
  created() {
      this.getMenus();
  },
  //生命周期 - 挂载完成（可以访问DOM元素）
  mounted() {}, 
  beforeCreate() {}, //生命周期 - 创建之前
  beforeMount() {}, //生命周期 - 挂载之前
  beforeUpdate() {}, //生命周期 - 更新之前
  updated() {}, //生命周期 - 更新之后
  beforeDestroy() {}, //生命周期 - 销毁之前
  destroyed() {}, //生命周期 - 销毁完成
  activated() {}, //如果页面有keep-alive缓存功能，这个函数会触发
};
</script>
<style lang='scss' scoped>
//@import url(); 引入公共css类
</style>