//index.js
const app = getApp();
Page({
  data: {
    avatarUrl: './user-unlogin.png',
    resumeList: {},
    logged: false,
    takeSession: false,
    requestResult: '',
    app: {},
    db: {},
    bgurl: "./img/bg.jpg"
    // flag:false//是否通过扫码进入
  },

  onLoad: function(options) {
    debugger;
    if (!wx.cloud) {
      wx.redirectTo({
        url: '../chooseLib/chooseLib',
      })
      return
    }
    //获取二维码参数
    if (options.scene) {
      let scene = decodeURIComponent(options.scene);
      //二维码参数为分享表_id
      app.globalData.codeParam = scene;
      //直接进入分享页面
      wx.navigateTo({
        url: '../shareEnter/shareEnter',
      })
    }
  },

  onGetUserInfo: function(e) {;
    if (!this.logged && e.detail.userInfo) {
      app.globalData.userInfo = e.detail.userInfo;
      this.setData({
        logged: true,
        avatarUrl: e.detail.userInfo.avatarUrl,
        userInfo: e.detail.userInfo
      })
      this.onGetOpenid();
    }
  },

  onGetOpenid: function() {
    wx.showLoading({
      title: '正在登录',
      mask: true
    })
    // 调用云函数
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        console.log('[云函数] [login] user openid: ', res.result.openid);
        app.globalData.appid = res.result.appid;
        app.globalData.userInfo.openid = res.result.openid;
        //调用管理员openid查询接口
        let db = wx.cloud.database();
        db.collection('adminList')
          .get()
          .then(res => {
            wx.hideLoading();
            let adminOpenIdList = [];
            res.data.map(function(item) {
              adminOpenIdList.push(item.openid);
            })
            //正式环境放开
            // if (adminOpenIdList.indexOf(app.globalData.userInfo.openid) == -1) {
            //   //非管理员
            //   wx.showModal({
            //     content: '非管理员请通过扫码进入！',
            //     showCancel: false,
            //     confirmText: '好的',
            //     confirmColor: '#333',
            //     success: function(res) {
            //       return
            //     },
            //     fail: function(res) {}
            //   })
            //   return;
            // }else{
              wx.navigateTo({
                url: '../jobList/jobList',
              })
            // }
          })
          .catch(console.error)
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
        wx.navigateTo({
          url: '../deployFunctions/deployFunctions',
        })
      }
    })
  },

})