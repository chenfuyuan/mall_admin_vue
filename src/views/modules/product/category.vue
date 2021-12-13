<!--  -->
<template>
  <div>
    <!--树形分类列表-->
    <el-tree
      :data="menus"
      :props="defaultProps"
      :expand-on-click-node="false"
      node-key="catId"
      :default-expanded-keys="expandedKeys"
    >
      <!--菜单操作按钮组-->
      <span class="custom-tree-node" slot-scope="{ node, data }">
        <span>{{ node.label }}</span>
        <span>
          <!--添加按钮-->
          <el-button
            v-if="node.level <= 2"
            type="text"
            size="mini"
            @click="() => append(data)"
          >
            添加
          </el-button>
          <!--刪除按钮-->
          <el-button
            v-if="node.childNodes.length == 0"
            type="text"
            size="mini"
            @click="() => remove(node, data)"
          >
            刪除
          </el-button>
        </span>
      </span>
    </el-tree>

    <!--添加弹出框-->

    <!--添加分类弹出框-->
    <div class="add-dialog">
      <el-dialog title="添加分类" :visible.sync="addDialogFormVisible" width="30%">
        <el-form :model="category">
          <el-form-item label="分类名称">
            <el-input v-model="category.name" autocomplete="off"></el-input>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button type="primary" @click="() => addCategory()"
            >添加</el-button
          >
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import Vue from "vue";
//这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
//例如：import 《组件名称》 from '《组件路径》';

export default {
  //import引入的组件需要注入到对象中才能使用
  components: {},
  data() {
    //这里存放数据
    return {
      currentCategory:{},
      expandedKeys: [],
      addDialogFormVisible: false, //添加分类弹出框显示状态
      category: {}, //弹出框表单信息
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
    //获取菜单
    getMenus() {
      this.$http({
        url: this.$http.adornUrl("/product/category/list/tree"),
        method: "get",
      }).then(({ data }) => {
        this.menus = data.data;
      });
    },

    /**
     * 添加分类
     */
    addCategory() {
      this.$http({
        url: this.$http.adornUrl("/product/category/save"),
        method: "post",
        data: this.$http.adornData(this.category, false),
      }).then(({ data }) => {
        //显示添加成功消息
        this.$message({
          showClose: true,
          message: "添加成功",
          type: "success",
        });
        debugger;
        //添加到当前菜单
        this.category.catId = data.saveCatId;
        //添加进数组的是引用地址，应该将该对象复制一份放入数组
        this.currentCategory.subCategorys.push({...this.category});
        this.expandedKeys.push(data.saveCatId);
        //关闭弹窗
        this.addDialogFormVisible = false;
      });
    },

    /**
     * 添加弹出框弹出
     */
    append(data) {
      //初始化category对象
      this.category = {
        catId: "",
        name: "",
        parentCid: data.catId,
        catLevel: data.catLevel * 1 + 1,
        showStatus: 1,
        sort: 0,
        productCount: 0,
      };
      this.currentCategory=data;
      //显示弹框
      this.addDialogFormVisible = true;
    },

    /**
     * 删除菜单
     */
    remove(node, data) {
      //弹出确认弹框
      this.$confirm(`是否删除【${data.name}】分类？`, "删除分类", {
        confirmButtonText: "删除",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          //进行删除操作
          let catIds = [data.catId];
          this.$http({
            url: this.$http.adornUrl("/product/category/delete"),
            method: "post",
            data: this.$http.adornData(catIds, false),
          }).then(({ data }) => {
            //显示成功删除消息
            this.$message({
              showClose: true,
              message: "删除成功",
              type: "success",
            });

            //从菜单中删除分类
            const parent = node.parent;
            const childrens = parent.data.subCategorys || parent.data;
            let index = childrens.findIndex((item) => item.catId == data.catId);
            childrens.splice(index, 1);
            return;
          });
        })
        .catch(() => {});
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