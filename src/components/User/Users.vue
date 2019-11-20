<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>活动管理</el-breadcrumb-item>
      <el-breadcrumb-item>活动列表</el-breadcrumb-item>
      <el-breadcrumb-item>活动详情</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row :gutter="15">
        <el-col :span="7">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible=true">添加用户</el-button>
        </el-col>
      </el-row>
      <el-table :data="userList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态" prop="mg_state">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state"
                       @change="userStateChanged(scope.row)">
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)"></el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeUserById(scope.row.id)"></el-button>
            <el-tooltip :enterable="false" class="item" effect="dark" content="分配角色" placement="top">
              <el-button type="warning" icon="el-icon-setting" size="mini" @click="setRole(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>

      </el-table>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 8]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>
    <el-dialog
      title="提示"
      :visible.sync="addDialogVisible"
      width="30%" @close="addDialogClosed">
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addUser" >确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog
      title="修改用户"
      :visible.sync="editDialogVisible"
      width="50%" @click="editDialogReset">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="editDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="editUserInfo">确 定</el-button>
  </span>
    </el-dialog>
    <el-dialog
      title="分配角色"
      :visible.sync="setRoleDialogVisible"
      width="50%" @close="setRoleClosed">
      <div>
        <p>当前的用户:{{this.userInfo.username}}</p>
        <p>当前的角色:{{this.userInfo.role_name}}</p>
        <el-select v-model="selectedRoleId" placeholder="请选择">
          <el-option
            v-for="item in roleList"
            :key="item.id"
            :label="item.roleName"
            :value="item.id">
          </el-option>
        </el-select>
      </div>
      <span slot="footer" class="dialog-footer">
    <el-button @click="setRoleDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
  </span>
    </el-dialog>

  </div>

</template>

<script>
  export default {
    name: "Users",
    data(){
      var checkEmail = (rule,value,callback)=>{
        const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
        if(regEmail.test(value)) return callback();
        callback(new Error('请输入合法的邮箱'))
      }
      var checkMobile = (rule,value,callback)=>{
        const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
        if(regMobile.test(value)) return callback();
        callback(new Error('请输入合法手机号'))
      }
      return{
        queryInfo:{
          query:'',
          pagenum:1,
          pagesize:6
        },
        userList:[],
        total:0,
        addDialogVisible:false,
        addForm:{
          username:'',
          password:'',
          email:'',
          mobile:''
        },
        addFormRules:{
          username:[
            { required: true, message: '请输入用户名', trigger: 'blur' },
            { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
          ],
          password:[
            { required: true, message: '请输入用户名', trigger: 'blur' },
            {  trigger: 'blur' }
          ],
          email:[
            { required: true, message: '请输入邮箱', trigger: 'blur' },
            { validator:checkEmail, trigger: 'blur' }
          ],
          mobile:[
            { required: true, message: '请输入手机号', trigger: 'blur' },
            { validator:checkMobile, trigger: 'blur' }
          ]

        },
        editDialogVisible:false,
        editForm:{},
        editFormRules:{
          email:[
            { required: true, message: '请输入用户邮箱', trigger: 'blur' },
            { validator:checkEmail, trigger: 'blur' }
          ],
          mobile:[
            { required: true, message: '请输入手机号', trigger: 'blur' },
            { validator:checkMobile, trigger: 'blur' }
          ]
        },
        setRoleDialogVisible:false,
        userInfo :{},
        roleList:[],
        selectedRoleId:''
      }
    },
    methods:{
      async getUserList(){
       const {data:res} = await this.$http.get('users',{
          params:this.queryInfo
        })
        if(res.meta.status !== 200) return this.$message.error('获取用户列表失败~')
        this.userList = res.data.users
        this.total = res.data.total

      },
      handleSizeChange(newSize){
        // console.log(newSize)
        this.queryInfo.pagesize = newSize
        // console.log(this.queryInfo.pagenum)
        this.getUserList()
      },
      handleCurrentChange(newPage){
        // console.log(newPage)
        this.queryInfo.pagenum = newPage
        this.getUserList()
      },
      async userStateChanged(newState){
        // console.log(newState)
        const {data:res} = await this.$http.put
          (`users/${newState.id}/state/${newState.mg_state}`)
        if(res.meta.status !== 200){
          newState.mg_state = !newState.mg_state
          return this.$message.error('更新用户失败~')
        }
          return this.$message.success('更新用户成功~')
      },
      addDialogClosed(){
        this.$refs.addFormRef.resetFields();
      },
      addUser(){
        this.$refs.addFormRef.validate(async valid=>{

          if(!valid) return;
          const {data:res} = await this.$http.post('users/',this.addForm)
          console.log(res)
          if(res.meta.status !== 201) return this.$message.error('添加用户失败~')
          return this.$message.success('添加用户成功~')
        });
      },
      async showEditDialog(id){
     const {data:res} = await this.$http.get('users/'+ id )
       if(res.meta.status !== 200) return this.$message.error('查询用户信息失败')
       this.editForm = res.data
        this.editDialogVisible = true
      },
      editDialogReset(){
        this.$refs.editFormRef.resetFields();
      },
      editUserInfo(){
        this.$refs.editFormRef.validate(async valid=>{
          if(!valid) return ;
          const {data:res} = await this.$http.put('users/'+this.editForm.id,{email:this.editForm.email,mobile:this.editForm.mobile})
          if(res.meta.status !== 200) return this.$message.error('用户提交失败~')
          this.editDialogVisible = false
          this.getUserList()
          this.$message.success('更新用户信息成功~')
        })
      },
      async removeUserById(id){
      const confirmResult =  await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err=>err)

        if(confirmResult!=='confirm'){
          this.$message.info('已经取消删除')
        }
        if(confirmResult==='confirm'){
          const { data: res } = await this.$http.delete('users/'+id)
          if (res.meta.status !== 200 && confirmResult === 'confirm') {
              return this.$message.error('删除用户失败！')
            }
              this.$message.success('删除用户成功！')
                this.getUserList()
          this.setRoleDialogVisible =false
        }


      },
      async setRole(userInfo){
        this.userInfo = userInfo
        const {data:res} = await this.$http.get('roles')
        this.roleList = res.data
        this.setRoleDialogVisible = true
      },
      async saveRoleInfo(){
        const {data:res} = await this.$http.put(`users/${this.userInfo.id}/role`,{rid:this.selectedRoleId})
        if(res.meta.status!==200){
          return  this.$message.error('更新角色失败~')
        }
        this.$message.success('更新角色成功~')
        this.getUserList()
        this.setRoleDialogVisible = false
      },
      setRoleClosed(){
        this.selectedRoleId = ''
      }
    },
    created() {
      this.getUserList()
    }
  }
</script>

<style lang="less" scoped>

</style>
