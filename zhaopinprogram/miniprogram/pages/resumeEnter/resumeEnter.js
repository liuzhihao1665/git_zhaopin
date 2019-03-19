//index.js
//获取应用实例  
const app = getApp()

Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    model: {
      isShow: false
    },
    model1: {
      isShow: false
    },
    jobId:"",
    bgurl: "./img/bg.png"
  },
  onLoad: function (options){
    debugger;
    this.app = getApp();
  },
  upresume:function(){
      this.setData({
        model: {
          isShow:true,
          src: "./img/bg@2x.png",
          sc:"./img/sc@2x.png",
          title: "上传简历"
        }
      })
  },
  upbutton:function(){
    ;
    let that = this;
    //测试赋值
    // app.globalData.codeParam = "XINVpMDR1TiNyo87";
    //根据分享表_id查询职位id
    let db = wx.cloud.database();
    const command = db.command;
    db.collection('sharer')
      .where(
        {
        _id: this.app.globalData.codeParam
        }
      )
      .get()
      .then(res => {
        if (res.data.length == 0) {
          wx.showModal({
            content: '抱歉，该职位已失效！',
            showCancel: false,
            confirmText: '好的',
            confirmColor: '#333',
            success: function (res) {
              if (res.confirm) { }
            },
            fail: function (res) { }
          })
        } else {
          that.setData(
            {
              "jobId": res.data[0].jobID
            }
          );
          wx.chooseMessageFile({
            count: 1,
            success: function (res) {
              wx.showLoading({
                title: '上传中',
              })
              
              const filePath = res.tempFiles[0].path;
              const cloudPath = res.tempFiles[0].name;
              debugger;
              wx.cloud.uploadFile({
                cloudPath,
                filePath,
                success: res => {
                  let db = wx.cloud.database();
                  const command = db.command;
                  ;
                  //存入数据库
                  db.collection('resumeList').add({
                    // data 字段表示需新增的 JSON 数据
                    data: {
                      id:res.fileID,
                      jobId: that.data.jobId,
                      emloy:0,
                      url:"",
                      phoneNum:"",
                      openid: app.globalData.userInfo.openid,
                      uploadTime: new Date().getTime()
                    }
                  })
                    .then(res => {
                      wx.hideLoading();
                      wx.showModal({
                        content: '上传成功！',
                        showCancel: false,
                        confirmText: '好的',
                        confirmColor: '#333',
                        success: function (res) {
                            that.setData({
                              model:false
                            })
                        },
                        fail: function (res) { }
                      })
                    })
                    .catch(e=>{
                      wx.hideLoading();
                      wx.showModal({
                        content: '抱歉，上传失败！',
                        showCancel: false,
                        confirmText: '好的',
                        confirmColor: '#333',
                        success: function (res) {
                          ;
                          that.setData({
                            model: {
                              isShow: false
                            }
                          })
                        },
                        fail: function (res) { }
                      })
                    })
                },
                fail: res => {
                  wx.hideLoading()
                  wx.showModal({
                    content: '抱歉，上传失败！',
                    showCancel: false,
                    confirmText: '好的',
                    confirmColor: '#333',
                    success: function (res) {
                      that.setData({
                        model: {
                          isShow: false
                        }
                      })
                    },
                    fail: function (res) { }
                  })
                },
                complete: res => {
                  
                }
              })
            }
          })

        }
      })
      .catch(() => {
        wx.showModal({
          content: '系统错误，请稍后重试！',
          showCancel: false,
          confirmText: '好的',
          confirmColor: '#333',
          success: function (res) {
            wx.hideLoading()
          },
          fail: function (res) { }
        })
      })
  },

  mobileInput: function (e) {
    this.setData({
      mobile: e.detail.value
    })
  },
  urlInput: function (e) {
    ;
    this.setData({
      url: e.detail.value
    })
  },

  buttonTap: function () {
    this.setData({
      model1: {
        isShow: true,
        src: "./img/1.png"
      }
    })
  },
  btnclick: function () {
    ;
    var url = this.data.url;
    var mobile = this.data.mobile;
    var name = /^[u4E00-u9FA5]+$/;
    if (url == '') {
      wx.showToast({
        title: '请输入简历链接',
        icon: 'succes',
        duration: 1000,
        mask: true
      })
      return false
    }
    var myreg = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1})|(17[0-9]{1}))+\d{8})$/;
    if (!myreg.test(mobile)) {
      wx.showToast({
        title: '手机号有误！',
        icon: 'success',
        duration: 1500
      })
      return false;
    }
    ;
    let that = this;
    //根据分享表_id查询职位id
    let db = wx.cloud.database();
    const command = db.command;
    debugger;
    db.collection('sharer')
      .where(
        {
          _id: app.globalData.codeParam
        }
      )
      .get()
      .then(res => {
        if (res.data.length == 0) {
          wx.showModal({
            content: '抱歉，该职位已失效！',
            showCancel: false,
            confirmText: '好的',
            confirmColor: '#333',
            success: function (res) {
              if (res.confirm) { }
            },
            fail: function (res) {}
          })
        } else {
          that.setData(
            {
              "jobId": res.data[0].jobID
            }
          );
          //存入数据库
          db.collection('resumeList').add({
            // data 字段表示需新增的 JSON 数据
            data: {
              jobId: that.data.jobId,
              emloy: 0,
              url: url,
              phoneNum: mobile,
              openid: app.globalData.userInfo.openid,
              uploadTime: new Date().getTime()
            }
          })
            .then(res => {
              wx.hideLoading();
              wx.showModal({
                content: '投递成功！',
                showCancel: false,
                confirmText: '好的',
                confirmColor: '#333',
                success: function (res) {
                  that.setData({
                    model1: false
                  })
                },
                fail: function (res) {
                  wx.hideLoading();
                  wx.showModal({
                    content: '抱歉，投递失败！',
                    showCancel: false,
                    confirmText: '好的',
                    confirmColor: '#333',
                    success: function (res) {
                      ;
                      that.setData({
                        model: {
                          isShow: false
                        }
                      })
                    },
                    fail: function (res) { }
                  })
                }
              })
            })
            .catch(e => {
              wx.hideLoading();
              wx.showModal({
                content: '抱歉，投递失败！',
                showCancel: false,
                confirmText: '好的',
                confirmColor: '#333',
                success: function (res) {
                  ;
                  that.setData({
                    model: {
                      isShow: false
                    }
                  })
                },
                fail: function (res) { }
              })
            })

        }
      })
      .catch(() => {
        wx.showModal({
          content: '系统错误，请稍后重试！',
          showCancel: false,
          confirmText: '好的',
          confirmColor: '#333',
          success: function (res) {
            if (res.confirm) { }
          },
          fail: function (res) { }
        })
      })
  }
  ,
  masktouch:function(){
      this.setData({
        model: {
          isShow: false
        },
        model1: {
          isShow: false
        }
      })
  }
})