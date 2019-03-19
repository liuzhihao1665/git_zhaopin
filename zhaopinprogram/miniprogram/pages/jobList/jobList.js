//index.js
//简历列表
const app = getApp()
debugger;
Page({
  data: {
    motto: 'Hello World',
    jobList: [],
    queryConditionMsg:"",
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    db:{},
    pageNum:0, //分页 下标
    conditionFlag:false //是否有条件查询
  },
  queryCondition: function (event) {
    this.setData({
      "queryConditionMsg": event.detail.value
    })
  },
  onLoad:function(){
    
    this.queryAllJobList();
  },
  //下拉刷新
  onPullDownRefresh() {
    // wx.showNavigationBarLoading() //在标题栏中显示加载
    this.setData(
      {       
        "pageNum": 0,
        "conditionFlag":false
      }
    );
    this.data.conditionFlag
    this.queryAllJobList();
  },
  queryAllJobList:function(num){
    let that = this;
    that.setData(
      {
        "pageNum": num || 0,
        "db": wx.cloud.database()
      }
    );
    let flag = !this.data.pageNum ? true : false;
    const command = this.data.db.command;
    wx.showLoading({
      title: '正在查询',
      mask: true
    })
    this.data.db.collection('job')
      .orderBy('updateTime', 'desc')
      .skip(this.data.pageNum) // 跳过结果集中的前 10 条，从第 11 条开始返回
      .limit(1) // 限制返回数量为 10 条
      .get()
      .then(res =>{
        let jobList = flag ? res.data : that.data.jobList.concat(res.data);
        that.setData(
          {
            "jobList": jobList,
            "pageNum": that.data.pageNum + res.data.length
          }
        );
        wx.hideLoading();
        wx.hideNavigationBarLoading() //在标题栏中隐藏加载
        wx.stopPullDownRefresh();
      })
      .catch(console.error)
  },
  queryJobList: function (e,num) {
    
    let that = this;
    that.setData(
      {
        "conditionFlag": true,
        "pageNum": num || 0
      }
    );
    let flag = !this.data.pageNum ? true : false;
    const command = this.data.db.command;
    wx.showLoading({
      title: '正在查询',
      mask: true
    })
    this.data.db.collection('job')
      .where(
        command.or([
          {
          jobName: that.data.queryConditionMsg
          },
          {
            yearMonthDay: that.data.queryConditionMsg
          }
        ])
      )
      .orderBy('updateTime', 'desc')
      .skip(this.data.pageNum) // 跳过结果集中的前 10 条，从第 11 条开始返回
      .limit(10) // 限制返回数量为 10 条
      .get()
      .then(res => {
        let jobList = flag ? res.data : that.data.jobList.concat(res.data);
        that.setData(
          {
            "jobList": jobList,
            "pageNum": that.data.pageNum + res.data.length
          }
        );
        wx.hideLoading();
        wx.hideNavigationBarLoading() //在标题栏中隐藏加载
      })
      .catch(console.error)
  },
  //上拉加载
  onReachBottom: function () {
    if (this.data.conditionFlag){
      this.queryJobList(null,this.data.pageNum);//后台获取新数据并追加渲染
      return;
    }
    this.queryAllJobList(this.data.pageNum);//后台获取新数据并追加渲染
  },
  goToCreateShare:function(){
    wx.navigateTo({
      url: '../createShare/createShare',
    })
  }
})
