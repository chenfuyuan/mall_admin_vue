<template>
  <div class="mod-config">
    <el-form
      :inline="true"
      :model="dataForm"
      @keyup.enter.native="getDataList()"
    >
      <el-form-item>
        <el-input
          v-model="dataForm.key"
          placeholder="参数名"
          clearable
        ></el-input>
      </el-form-item>
      <el-form-item>
        <el-button @click="getDataList()">查询</el-button>
        <el-button
          v-if="isAuth('product:brand:save')"
          type="primary"
          @click="addOrUpdateHandle()"
          >新增</el-button
        >
        <el-button
          v-if="isAuth('product:brand:delete')"
          type="danger"
          @click="deleteHandle()"
          :disabled="dataListSelections.length <= 0"
          >批量删除</el-button
        >
      </el-form-item>
    </el-form>
    <el-table
      :data="dataList"
      border
      v-loading="dataListLoading"
      @selection-change="selectionChangeHandle"
      style="width: 100%"
    >
      <el-table-column
        type="selection"
        header-align="center"
        align="center"
        width="50"
      >
      </el-table-column>
      <el-table-column
        prop="brandId"
        header-align="center"
        align="center"
        label="品牌id"
      >
      </el-table-column>
      <el-table-column
        prop="name"
        header-align="center"
        align="center"
        label="品牌名"
      >
      </el-table-column>
      <el-table-column
        prop="logo"
        header-align="center"
        align="center"
        label="品牌logo"
      >
        <template slot-scope="scope">
          <img :src="scope.row.logo" style="height: 80px; width: 100px" />
        </template>
      </el-table-column>
      <el-table-column
        prop="descript"
        header-align="center"
        align="center"
        label="介绍"
      >
      </el-table-column>
      <el-table-column
        prop="showStatus"
        header-align="center"
        align="center"
        label="显示状态"
      >
        <template slot-scope="scope">
          <el-switch
            v-model="scope.row.showStatus"
            active-color="#13ce66"
            inactive-color="#ff4949"
            :active-value="1"
            :inactive-value="0"
            @change="showStatusChange(scope.row)"
          >
          </el-switch>
        </template>
      </el-table-column>
      <el-table-column
        prop="firstLetter"
        header-align="center"
        align="center"
        label="检索首字母"
      >
      </el-table-column>
      <el-table-column
        prop="sort"
        header-align="center"
        align="center"
        label="排序"
      >
      </el-table-column>
      <el-table-column
        fixed="right"
        header-align="center"
        align="center"
        width="150"
        label="操作"
      >
        <template slot-scope="scope">
          <el-button
            type="text"
            size="small"
            @click="updateCategoryAndBrandRelationHandle(scope.row.brandId)"
            >关联分类</el-button
          >
          <el-button
            type="text"
            size="small"
            @click="addOrUpdateHandle(scope.row.brandId)"
            >修改</el-button
          >
          <el-button
            type="text"
            size="small"
            @click="deleteHandle(scope.row.brandId)"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      @size-change="sizeChangeHandle"
      @current-change="currentChangeHandle"
      :current-page="pageIndex"
      :page-sizes="[10, 20, 50, 100]"
      :page-size="pageSize"
      :total="totalPage"
      layout="total, sizes, prev, pager, next, jumper"
    >
    </el-pagination>
    <!-- 弹窗, 新增 / 修改 -->
    <add-or-update
      v-if="addOrUpdateVisible"
      ref="addOrUpdate"
      @refreshDataList="getDataList"
    ></add-or-update>

    <!-- 关联分类弹窗 -->
    <el-dialog
      title="关联分类"
      :visible.sync="cateRelationDialogVisible"
      width="30%"
    >
      <el-popover placement="right-end" v-model="popCatelogSelectVisible">
        <category-cascader :catelogPath.sync="catelogPath"></category-cascader>
        <div style="text-align: right; margin: 0">
          <el-button
            size="mini"
            type="text"
            @click="popCatelogSelectVisible = false"
            >取消</el-button
          >
          <el-button type="primary" size="mini" @click="addCatelogSelect"
            >确定</el-button
          >
        </div>
        <el-button slot="reference">新增关联</el-button>
      </el-popover>
      <el-table :data="cateRelationTableData" style="width: 100%">
        <el-table-column prop="id" label="#"></el-table-column>
        <el-table-column prop="brandName" label="品牌名"></el-table-column>
        <el-table-column prop="catelogName" label="分类名"></el-table-column>
        <el-table-column
          fixed="right"
          header-align="center"
          align="center"
          label="操作"
        >
          <template slot-scope="scope">
            <el-button
              type="text"
              size="small"
              @click="deleteCateRelationHandle(scope.row.id, scope.row.brandId)"
              >移除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cateRelationDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="cateRelationDialogVisible = false"
          >确 定</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script>
import AddOrUpdate from "./brand-add-or-update";
import Tools from "@/utils/Tool";
import GlobalConst from "@/utils/GlobalConst";
import CategoryCascader from "../common/category-cascader.vue"
export default {
  data() {
    return {
      dataForm: {
        key: "",
      },
      dataList: [],
      pageIndex: 1,
      pageSize: 10,
      totalPage: 0,
      dataListLoading: false,
      dataListSelections: [],
      addOrUpdateVisible: false,
      cateRelationDialogVisible: false,
      popCatelogSelectVisible: false,
      cateRelationTableData:[],
      catelogPath: [],
    };
  },
  components: {
    AddOrUpdate,
    CategoryCascader
  },
  activated() {
    this.getDataList();
  },
  methods: {
    
    // 删除分类关联
    deleteCateRelationHandle(id, brandId) {
      this.$http({
        url: this.$http.adornUrl("/product/categorybrandrelation/delete"),
        method: "post",
        data: this.$http.adornData([id], false)
      }).then(({ data }) => {
        this.getCategoryAndBrandRelation();
      });
    },

    //添加分类选择
    addCatelogSelect() {
      //{"brandId":1,"catelogId":2}
      this.popCatelogSelectVisible =false;
      this.$http({
        url: this.$http.adornUrl("/product/categorybrandrelation/save"),
        method: "post",
        data: this.$http.adornData({brandId:this.brandId,catelogId:this.catelogPath[this.catelogPath.length-1]}, false)
      }).then(({ data }) => {
        this.getCategoryAndBrandRelation();
      });
    },    

    //更新分类与品牌关系控制器
    updateCategoryAndBrandRelationHandle(brandId) {
      this.cateRelationDialogVisible = true;
      this.brandId = brandId;
      this.getCategoryAndBrandRelation();
    },

    //获取分类与品牌关系
    getCategoryAndBrandRelation() {
      this.$http({
        url: this.$http.adornUrl("/product/categorybrandrelation/category/list"),
        method: "get",
        params: this.$http.adornParams({
          brandId: this.brandId
        })
      }).then(({ data }) => {
        debugger;
        this.cateRelationTableData = data.relationList;
        console.log(this.cateRelationTableData)
      });
    },
    //改变 显示状态
    showStatusChange(brand) {
      if (Tools.isEmpty(brand)) {
        return;
      }

      //获取brandId和showStatus
      let { brandId, showStatus } = brand;

      this.updateBrandShowStatusRequest(
        { brandId, showStatus },
        "更新显示状态成功!"
      );
    },

    /**
     * 发送更新品牌请求
     * @param brand 需要更新的品牌信息
     * @successMsg 请求成功后提示的消息
     */
    updateBrandShowStatusRequest(
      brand,
      successMsg = "更新成功",
      callback = GlobalConst.RESPONSE_EMPTY_CALLBACK
    ) {
      if (Tools.isEmpty(brand) && Tools.isEmpty(brand.brandId)) {
        //判空
        Tools.messageError(this, "更新品牌时发送错误,品牌id为空!");
        return;
      }
      //发送请求
      this.$http({
        url: this.$http.adornUrl("/product/brand/update/showStatus"),
        method: "post",
        data: this.$http.adornData(brand, false),
      }).then(({ data: response }) => {
        //调用通用的请求响应函数
        GlobalConst.RESPONSE_COMMON_CALLBACK(this, response, successMsg);

        //调用特定的请求响应函数
        callback(response);
      });
    },

    // 获取数据列表
    getDataList() {
      this.dataListLoading = true;
      this.$http({
        url: this.$http.adornUrl("/product/brand/list"),
        method: "get",
        params: this.$http.adornParams({
          page: this.pageIndex,
          limit: this.pageSize,
          key: this.dataForm.key,
        }),
      }).then(({ data }) => {
        if (data && data.code === GlobalConst.RESPONSE_CODE.OK) {
          this.dataList = data.page.list;
          this.totalPage = data.page.totalCount;
        } else {
          this.dataList = [];
          this.totalPage = 0;
        }
        this.dataListLoading = false;
      });
    },
    // 每页数
    sizeChangeHandle(val) {
      this.pageSize = val;
      this.pageIndex = 1;
      this.getDataList();
    },
    // 当前页
    currentChangeHandle(val) {
      this.pageIndex = val;
      this.getDataList();
    },
    // 多选
    selectionChangeHandle(val) {
      this.dataListSelections = val;
    },
    // 新增 / 修改
    addOrUpdateHandle(id) {
      this.addOrUpdateVisible = true;
      this.$nextTick(() => {
        this.$refs.addOrUpdate.init(id);
      });
    },
    // 删除
    deleteHandle(id) {
      var ids = id
        ? [id]
        : this.dataListSelections.map((item) => {
            return item.brandId;
          });
      this.$confirm(
        `确定对[id=${ids.join(",")}]进行[${id ? "删除" : "批量删除"}]操作?`,
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).then(() => {
        this.$http({
          url: this.$http.adornUrl("/product/brand/delete"),
          method: "post",
          data: this.$http.adornData(ids, false),
        }).then(({ data }) => {
          if (data && data.code === 0) {
            this.$message({
              message: "操作成功",
              type: "success",
              duration: 1500,
              onClose: () => {
                this.getDataList();
              },
            });
          } else {
            this.$message.error(data.msg);
          }
        });
      });
    },
  },
};
</script>
