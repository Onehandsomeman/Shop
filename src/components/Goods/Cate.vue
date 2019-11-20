<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCategory" >添加分类</el-button>
        </el-col>
      </el-row>
        <!--      表格-->
    <tree-table class="treeTable" :data="cateList"
                :columns="columns"
                :selection-type="false"
                :expand-type="false"
                show-index index-text="#" border
                :show-row-hover="false">
      <template slot="isok" slot-scope="scope">
        <i class="el-icon-success" style="color: lightgreen" v-if="scope.row.cat_deleted === false"></i>
        <i class="el-icon-error" style="color: red" v-else></i>
      </template>
      <template slot="order" slot-scope="scope">
        <el-tag v-if="scope.row.cat_level === 0">一级</el-tag>
        <el-tag type="success" v-else-if="scope.row.cat_level ===1">二级</el-tag>
        <el-tag type="warning" v-else>三级</el-tag>
      </template>
      <template slot="ope" slot-scope="scope">
        <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
        <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
      </template>
    </tree-table>
<!--        分页-->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
<!--      添加分类对话框-->
      <el-dialog
        title="添加分类"
        :visible.sync="showCateDialog"
        width="50%" @close="cateFormClosed">
        <el-form :model="cateForm" :rules="cateFormRules" ref="cateFormRef" label-width="100px">
          <el-form-item label="活动名称" prop="cat_name">
            <el-input type="request" v-model="cateForm.cat_name"></el-input>
          </el-form-item>
          <el-form-item label="父级分类">
            <el-cascader
              expandTrigger="hover"
              :options="parentCateList"
              v-model="selectedKeys"
              :props="cascaderProps"
              @change="parentCateChange" clearable change-on-select
              >
            </el-cascader>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="showCateDialog = false">取 消</el-button>
          <el-button type="primary" @click="addCategories">确 定</el-button>
        </span>
      </el-dialog>

    </el-card>
  </div>
</template>

<script>
  export default {
    name: "Cate",
    data(){
      return{
        //查询条件
        queryInfo:{
          type:3,
          pagenum:1,
          pagesize:5
        },
        //商品分类数据
        cateList:[],
        //总数据条数
        total:0,
        columns:[
          {
            label:'分类名称',
            prop:'cat_name'
          },
          {
            label:'是否有效',
            type:'template',
            template:'isok'
          },
          {
            label:'排序',
            type:'template',
            template:'order'
          },
          {
            label:'操作',
            type:'template',
            template:'ope'
          }
        ],
        showCateDialog : false,
        //添加分类的表单数据对象
        cateForm:{
          cat_name:'',
          cat_pid:0,
          cat_level:0
        },
        cateFormRules:{
          cat_name: [
            { required: true, message: '请输入分类名称', trigger: 'blur' },
            { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur' }
          ],
        },
        parentCateList:[],
        cascaderProps:{
          value:'cat_id',
          label:'cat_name',
          children:'children'
        },
        selectedKeys:[],

      }
    },
    created() {
      this.getCateList()
    },
    methods:{
      //获取商品分类数据
     async getCateList(){
      const {data:res} = await this.$http.get('categories',{params:this.queryInfo})
       if(res.meta.status !== 200) return this.$message.error('获取数据失败~')
       this.cateList = res.data.result
       this.total = res.data.total
       // console.log(res)
      },
      //监听size改变事件
      handleSizeChange(newsize){
       this.queryInfo.pagesize = newsize
        thie.getCateList()
      },
      //监听页码改变事件
      handleCurrentChange(newpage){
       this.queryInfo.pagenum =newpage
        this.getCateList()
      },
      //显示添加分类对话框
      showAddCategory(){
       this.getParentCate()
       this.showCateDialog = true
      },
      //添加商品分类
      addCategories(){
       this.$refs.cateFormRef.validate(async valid=>{
         if(!valid) return
        const {data:res} = await this.$http.post('categories',this.cateForm)
         if(res.meta.status !== 201){
           return this.$message.error('添加分类失败~')
         }
         this.$message.success('添加分类成功~')
         this.getCateList()
         this.showCateDialog = false
       })
      },
      //获取父级分类的商品列表
      async getParentCate(){
       const {data:res} = await this.$http.get('categories',{params:{type:2}})
        if(res.meta.status !== 200) return this.$message.error('获取商品列表失败~')
        this.parentCateList = res.data
        // console.log(this.parentCateList)
      },
      parentCateChange(){
        if(this.selectedKeys.length>0){
          this.cateForm.cat_pid = this.selectedKeys[this.selectedKeys.length-1]
          this.cateForm.cat_leavel = this.selectedKeys.length
          // console.log(this.selectedKeys)
          return
        }else {
          this.cateForm.cat_pid =0
          this.cateForm.cat_leavel = 0
        }
      },
      cateFormClosed(){
       this.$refs.cateFormRef.resetFields();
        this.selectedKeys = []
        this.cateForm.cat_level = 0
        this.cateForm.cat_pid = 0
      }
    }
  }
</script>

<style lang="less" scoped>
.treeTable{
  margin-top: 15px;
}
  .el-cascader{
    width: 100%;
  }
</style>
