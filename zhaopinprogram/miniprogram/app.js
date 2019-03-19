//app.js
App({
  onLaunch: function () {
    console.log("start")
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        traceUser: true,
      })
    }

    this.globalData = {
      userInfo:{},
      codeParam:[]
    }
  },
  // onLoad: function (options){
  //   debugger;
  //   if (options.scene) {
  //     let scene = decodeURIComponent(options.scene);
  //     //&是我们定义的参数链接方式
  //     let userId = options.scene.split("&")[0];
  //     let recommendId = options.scene.split('&')[1];
  //     //其他逻辑处理。。。。。
  //   }
  // }
})
