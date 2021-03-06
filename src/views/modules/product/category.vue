<!--  -->
<template>
  <div>
    <!--操作按钮-->
    <!--是否开启拖拽，选择按钮-->
    <el-switch
      v-model="draggable"
      active-color="#13ce66"
      inactive-color="#ff4949"
      active-text="开启拖拽"
      inactive-text="关闭拖拽"
    >
    </el-switch>

    <!--批量删除按钮-->
    <el-button type="danger" @click="batchRemove">删除</el-button>
    <!--保存拖拽-->
    <el-button v-if="draggable" @click="batchSaveDrag">保存拖拽</el-button>

    <!--树形分类列表-->
    <el-tree
      :data="menus"
      :props="defaultProps"
      :expand-on-click-node="false"
      node-key="catId"
      :default-expanded-keys="expandedKeys"
      @node-expand="expandHandle"
      @node-collapse="collapseHandle"
      @node-drop="handleDrop"
      :draggable="draggable"
      :allow-drop="allowDrop"
      show-checkbox
      ref='tree'
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
          <!--更新按钮-->
          <el-button type="text" size="mini" @click="update(data)">
            更改
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

    <!--添加分类弹出框-->
    <div class="add-dialog">
      <el-dialog
        :title="dialogConfig.title"
        :visible.sync="dialogFormVisible"
        width="30%"
      >
        <el-form :model="category">
          <!--分类名称-->
          <el-form-item label="分类名称">
            <el-input v-model="category.name" autocomplete="off"></el-input>
          </el-form-item>

          <!--图标-->
          <el-form-item label="图标">
            <el-input v-model="category.icon" autocomplete="off"></el-input>
          </el-form-item>

          <!--计量单位-->
          <el-form-item label="计量单位">
            <el-input
              v-model="category.productUnit"
              autocomplete="off"
            ></el-input>
          </el-form-item>
        </el-form>

        <div slot="footer" class="dialog-footer">
          <el-button type="primary" @click="submit()">
            {{ dialogConfig.buttonText }}
          </el-button>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import Tools from "@/utils/Tool";
import GlobalConst from "@/utils/GlobalConst";
//这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
//例如：import 《组件名称》 from '《组件路径》';

//新的分类
const NEW_CATEGORY = {
  catId: null,
  name: "",
  parentCid: "",
  catLevel: "",
  showStatus: 1,
  sort: 0,
  productCount: 0,
  icon: "",
  productUnit: "",
};

const DIALOG_CONFIG = {
  add: {
    type: "add",
    title: "添加分类",
    buttonText: "添加",
  },
  update: {
    type: "update",
    title: "修改分类",
    buttonText: "修改",
  },
};

const MSG_SHOW_CATEGORY_NUM = 3;

//节点深度缓存 避免每次拖拽重复计算深度
let deepCacheMap = new Map();

export default {
  //import引入的组件需要注入到对象中才能使用
  components: {},
  data() {
    //这里存放数据
    return {
      draggable: false, //是否可以拖拽分类
      dialogConfig: {},
      currentCategory: {},
      expandedKeys: [],
      dialogFormVisible: false, //添加分类弹出框显示状态
      category: {}, //弹出框表单信息
      menus: [], //菜单
      defaultProps: {
        children: "subCategorys",
        label: "name",
      },
      updateCategoryList: [],
    };
  },
  //监听属性 类似于data概念
  computed: {},
  //监控data中的数据变化
  watch: {},
  //方法集合
  methods: {
    /**
     * 批量删除
     */
    batchRemove() {
      //获取所有已选择的分类节点
      let checkNodes = this.$refs.tree.getCheckedNodes();
      if(Tools.isEmpty(checkNodes)){
        this.$message({
          showClose:true,
          message:"请至少选择一个分类!"
        })
        return;
      }

      //组建需要删除的catIds数组
      let catIds = [];
      for (let index = 0; index < checkNodes.length; index++) {
        const element = checkNodes[index];
        catIds.push(element.catId);
      }


      let names = [];
      let forI = Math.min(checkNodes.length,MSG_SHOW_CATEGORY_NUM);
      for (let index = 0; index < forI; index++) {
        const element = checkNodes[index];
        names.push(element.name);
      }
      let confirmMsg = '';
      if(catIds.length > MSG_SHOW_CATEGORY_NUM){
        //超过指定显示分类数量时，显示 '等'
        confirmMsg = `是否删除{${names}}等分类？`;
      }else{
        confirmMsg = `是否删除分类{${names}}？`;
      }

      this.$confirm(confirmMsg)
      .then(_ =>{
          //发送删除请求
          this.removeRequest(catIds,"批量删除成功!"); 
      }).catch(_=>{});
    },

    /**
     * 批量保存拖拽结果
     */
    batchSaveDrag() {
      if (Tools.isEmpty(this.updateCategoryList)) {
        this.$message({
          showClose: true,
          message: "无需要保存的数据",
          type: "success",
        });
        return;
      }
      this.$http({
        url: this.$http.adornUrl("/product/category/batch/update"),
        method: "post",
        data: this.$http.adornData(this.updateCategoryList, false),
      }).then(({ data }) => {
        this.$message({
          showClose: true,
          message: data.msg,
          type: "success",
        });
        this.updateCategoryList = [];
        this.getMenus();
        this.draggable = false;
      });
    },

    /**
     * 添加一个更新分类
     */
    updateCategoryListPush(category) {
      if (Tools.isEmpty(category) || Tools.isEmpty(category.catId)) {
        return fasle;
      }

      const updateList = this.updateCategoryList;
      for (let index = 0; index < updateList.length; index++) {
        const element = updateList[index];
        if (element.catId == category.catId) {
          this.updateCategoryList.splice(index, 1); //删除已有数据
          break;
        }
      }

      //更新数据
      this.updateCategoryList.push(category);
    },
    /**
     * 拖拽成后事件
     * @param dragNode 拖拽的节点
     * @param dropNode 目标节点 before、after、inner
     * @param dropType 拖拽类型
     * @param ev 事件
     */
    handleDrop(dragNode, dropNode, dropType, ev) {
      console.log("handleDrop:", dragNode, dropNode, dropType);
      //成功后，需要刷新缓存
      this.dropSuccessRefreshCache(dragNode, dropNode, dropType);
      //当前数据
      if (dropType == "before" || dropType == "after") {
        this.handleDropBeforeAndAfter(dragNode, dropNode, dropType, ev);
      } else if (dropType == "inner") {
        this.handleDropInner(dragNode, dropNode, dropType, ev);
      }
      console.log("updateList", this.updateCategoryList);
    },

    /**
     * 拖拽成功后事件-拖拽目标位置 inner
     */
    handleDropInner(dragNode, dropNode, dropType, ev) {
      let parentCid = dropNode.data.catId;
      parentCid = parentCid ? parentCid : 0;
      let dropCategory = dropNode.data;

      //被拖拽的分类
      this.updateCategoryListPush({
        catId: dragNode.data.catId,
        parentCid,
        sort: dropCategory.subCategorys.length, //将元素添加到目标元素的最后一个位置
        catLevel: dropCategory.catLevel + 1,
        name: dragNode.data.name,
      });

      //判断拖拽分类的层级是否发生变化
      if (dragNode.level != dropNode.level + 1) {
        this.updateSubCategoryLevel(dragNode.data, dropNode.level + 2);
      }
    },
    /**
     * 拖拽成功后事件-拖拽目标位置 before,after
     */
    handleDropBeforeAndAfter(dragNode, dropNode, dropType, ev) {
      //parentCid
      let parentNode = dropNode.parent;

      let subCategorys;
      if (parentNode.data instanceof Array) {
        subCategorys = parentNode.data;
      } else {
        subCategorys = parentNode.data.subCategorys;
      }

      let parentCid = dropNode.data.parentCid;
      parentCid = parentCid ? parentCid : 0;
      //sort
      let index = -1;
      for (let i = 0; i < subCategorys.length; i++) {
        const element = subCategorys[i];

        if (element.catId == dragNode.data.catId) {
          //构建被拖拽节点更新数据 parentCid,sort,level
          this.updateCategoryListPush({
            catId: element.catId,
            parentCid,
            sort: i,
            catLevel: dropNode.level,
            name: element.name,
          });
          index = i; //拖拽节点的索引
        } else if (element.sort === 0 || index !== -1) {
          //当sort字段为0时，对其进行排序，或索引位于拖拽节点之后，需要更新排序
          this.updateCategoryListPush({
            catId: element.catId,
            sort: i,
            name: element.name,
          });
        }
      }

      //判断拖拽节点的子分类是否受影响
      if (dragNode.level !== dropNode.level) {
        //更新拖拽节点的所有子节点
        this.updateSubCategoryLevel(dragNode.data, dropNode.level + 1);
      }
    },

    /**
     * 更新所有子分类的层级
     */
    updateSubCategoryLevel(category, level) {
      if (Tools.isEmpty(category) || Tools.isEmpty(category.subCategorys)) {
        return;
      }

      let subCategorys = category.subCategorys;
      for (let index = 0; index < subCategorys.length; index++) {
        const element = subCategorys[index];
        //修改子分类
        this.updateCategoryListPush({
          catId: element.catId,
          catLevel: level,
          name: element.name,
        });

        //递归遍历 子分类
        this.updateSubCategoryLevel(element, level + 1);
      }
    },

    /**
     * 拖拽成功后，刷新深度缓存
     * @param dragNode 拖拽的节点
     * @param dropNode 目标节点 before、after、inner
     * @param dropType 拖拽类型
     * @returns 是否刷新缓存，true刷新，false没有刷新
     */
    dropSuccessRefreshCache(dragNode, dropNode, dropType) {
      //直接清除缓存
      //因为获取不到dragNode.parent，暂时使用直接清除缓存方式
      deepCacheMap = new Map();
      return true;

      /**let dragDeep = this.getCountDeep(dragNode); //拖拽节点深度
      //清空拖拽节点父节点的缓存,因为当拖拽节点时，父节点可能深度可能会变化
      //dragNode.parent == null 
      //deepCacheMap.delete(dragNode.parent.data.name);
    
      switch (dropType) {
        case "before":
        case "after":
          //需要刷新目标节点父节点的层级缓存
          let parent = dropNode.parent;
          let parentDeep = this.getCountDeep(parent);
          if (parentDeep - 1 > dragDeep) {
            debugger;
            this.deepCacheMap.set(parent.data.name, dragDeep + 1);
            return true;
          }
          break;
        case "inner":
          //需要刷新目标节点的层级缓存
          let dropDeep = this.getCountDeep(dropDeep);
          if (dropDeep - 1 > dragDeep) {
            debugger;
            this.deepCacheMap.set(drop.data.name, dragDeep + 1);
            return true;
          }
          break;
        default:
      }
      console.log("cache",deepCacheMap);
      return false;**/
    },
    /**
     * 拖拽时判断目标节点能否被放置
     * type 参数有三种情况：'prev'、'inner' 和 'next'，
     */
    allowDrop(draggingNode, dropNode, type) {
      //判断被拖动节点，以及所在父节点总层数不能大于3
      let dragNodeDeep = this.getCountDeep(draggingNode);
      let dropNodeLevel = dropNode.level;
      let dropParentNodeLevel = dropNode.parent.level;
      switch (type) {
        case "prev":
        case "next":
          //插入在目标节点的前，后，比较目标节点父节点的层级
          //父节点+拖拽节点层级大于3时，代表超过三级分类，不允许拖拽
          if (dropParentNodeLevel + dragNodeDeep > 3) {
            return false;
          }
          break;
        case "inner":
          //插入在目标节点里面时，比较目标节点层级
          //目标节点+拖拽节点总层级大于3，代表超过三级分类，不允许拖拽
          if (dropNodeLevel + dragNodeDeep > 3) {
            return false;
          }
          break;
        default:
          return false;
      }

      return true;
    },

    /**
     * 获取节点的总层数
     */
    getCountDeep(node) {
      if (Tools.isEmpty(node) || Tools.isEmpty(node.data)) {
        return;
      }
      //从缓存中取出 当前节点的总层数
      let countLevel = deepCacheMap.get(node.data.name);
      //如果从缓存中取不到，则重新计算
      if (Tools.isEmpty(countLevel)) {
        countLevel = this.countDeep(node);
        deepCacheMap.set(node.data.name, countLevel);
      }
      return countLevel;
    },
    /**
     * 计算节点深度
     */
    countDeep(node) {
      if (Tools.isEmpty(node.childNodes)) {
        return 1;
      }
      let maxLevel = 1;
      for (let i = 0; i < node.childNodes.length; i++) {
        //遍历所有子分类，递归计算深度
        let children = node.childNodes[i];
        let count = 1 + this.countDeep(children);
        if (count > maxLevel) {
          maxLevel = count;
        }
      }
      return maxLevel;
    },
    /**
     * 节点收缩
     */
    collapseHandle(data, node, component) {
      let index = this.expandedKeys.findIndex((item) => item === data.catId);
      this.expandedKeys.splice(index, 1);
    },

    /**
     * 节点展开
     */
    expandHandle(data, node, component) {
      this.expandedKeys.push(data.catId);
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

    /**
     * 提交
     */
    submit() {
      if (this.dialogConfig.type == "add") {
        this.addCategory();
      }
      if (this.dialogConfig.type == "update") {
        this.updateCategory();
      }
    },

    /**
     * 更新分类
     */
    updateCategory() {
      let { catId, name, icon, productUnit } = this.category;
      //发送更新请求
      this.$http({
        url: this.$http.adornUrl("/product/category/update"),
        method: "post",
        data: this.$http.adornData({ catId, name, icon, productUnit }, false),
      }).then(({ data }) => {
        this.$message({
          showClose: true,
          message: "更新成功",
          type: "success",
        });

        //关闭弹窗
        this.dialogFormVisible = false;

        //刷新菜单
        this.getMenus();
        this.expandedKeys.push(this.category.catId);
      });
    },

    /**
     * 更新按钮
     */
    update(data) {
      //从后台获取
      this.$http({
        url: this.$http.adornUrl(`/product/category/info/${data.catId}`),
        method: "get",
      })
        .then(({ data }) => {
          this.category = data.category;
          this.dialogFormVisible = true;
          this.dialogConfig = DIALOG_CONFIG.update;
        })
        .catch(() => {
          this.$message({
            showClose: true,
            message: "更新失败",
            type: "error",
          });
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

        //刷新菜单
        this.getMenus();
        this.expandedKeys.push(data.saveCatId);

        //关闭弹窗
        this.dialogFormVisible = false;
      });
    },

    /**
     * 添加弹出框弹出
     */
    append(data) {
      //初始化category对象
      this.category = { ...NEW_CATEGORY };
      this.category.parentCid = data.catId;
      this.category.catLevel = data.catLevel + 1;
      this.category.sort = data.subCategorys.length; //将添加的分类，置于最后
      //记录当前操作分类
      this.currentCategory = data;

      //显示弹框
      this.dialogFormVisible = true;
      debugger;
      this.dialogConfig = DIALOG_CONFIG.add;
    },

    /**
     * 删除请求
     */
    removeRequest(catIds, successMsg = "删除成功!") {
      if (Tools.isEmpty(catIds)) {
        return;
      }
      this.$http({
        url: this.$http.adornUrl("/product/category/delete"),
        method: "post",
        data: this.$http.adornData(catIds, false),
      }).then(({ data: response }) => {
        //显示成功删除消息
        if (response.code !== GlobalConst.RESPONSE_CODE.OK) {
          this.$message.error(response.msg);
          return;
        }

        this.$message({
          showClose:true,
          message:response.msg==='success'?successMsg:response.msg,
          type:"success"
        })
        //从菜单中删除分类
        // const parent = node.parent;
        // const childrens = parent.data.subCategorys || parent.data;
        // let index = childrens.findIndex((item) => item.catId == data.catId);
        // childrens.splice(index, 1);
        //刷新菜单
        this.getMenus();
      });
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
          //获取需要删除的分类的catId
          let catIds = [data.catId];
          this.removeRequest(catIds);
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