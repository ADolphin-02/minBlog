var app = getApp()
var countdown = 5;

const request = require('../../../utils/request.js');
Page({
  /**
   * 页面的初始数据
   */
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    Custom: app.globalData.Custom,
    skin: app.globalData.skin,
    style: app.globalData.highlightStyle,
    hasUserInfo: false,
    userInfo:null,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    // CommentShow: false,
    ButtonTimer: '',//  按钮定时器
    LastTime: 60,
    // CommentSwitch: true,
    commentValue: '',
    openId:'',
    placeholder:'尽管吐槽吧....',
    commentId:0,
    focus:false
    // commentList: []
    // CommentContent:''
  },
  

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    var articleId = options.articleId
    this.setData({
      articleId : articleId
    })

    var urlContent = app.globalData.url + '/wx/getContentByAid/' + articleId;
    var token = app.globalData.token;
    var params = {};
    //@todo 文章内容网络请求API数据
    request.requestGetApi(urlContent, token, params, this, this.successFunPost, this.failFunPost);

    var urlComments = app.globalData.url + '/wx/comments/getCommentsByAid/' + articleId;
    //@todo 评论列表网络请求API数据
    request.requestGetApi(urlComments, token, params, this, this.successComment, this.failComment);
    // var urlSwitch = app.globalData.url + '/api/content/options/keys/comment_api_enabled';
    // //@todo 评论开启按钮网络请求API数据
    // request.requestGetApi(urlSwitch, token, params, this, this.successSwitch, this.failSwitch);
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // this.setData({
    //   openId: app.globalData.openId,
    // })
    if (app.globalData.userInfo) {
      this.setData({
          userInfo: app.globalData.userInfo,
          hasUserInfo: true
      })
  } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
          this.setData({
              userInfo: res.userInfo,
              hasUserInfo: true,
          })
      }
  } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
          success: res => {
              app.globalData.userInfo = res.userInfo
              this.setData({
                  userInfo: res.userInfo,
                  hasUserInfo: true
              })
          }
      })
  }
  },
  getUserInfo: function (e) {
    var that = this;
    // 拒绝获取个人资料时候
    if (e.detail.errMsg == "getUserInfo:fail auth deny") {
      that.setData({
        hasUserInfo: false,
        Role: '游客',
        roleFlag: false,// 不知道
      })
    } else {
      app.globalData.userInfo = e.detail.userInfo;
      that.setData({
        userInfo: e.detail.userInfo,
        hasUserInfo: true,
      })
      app.globalData.Role = '已登陆',

      //userInfo存储到storage
      wx.setStorage({
        key: 'userInfo',
        data: e.detail.userInfo,
        success: function (result) {
          console.log(result, 'userInfo写入缓存')
        }
      })
      var that = this;
      // 发送给后台服务器
      that.login(e.detail.userInfo)
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },
  /**
     * 评论模块
   */
  Comment: function (e) {
    var content = e.detail.value.replace(/\s+/g, '');// 去空格
    // console.log(content);
    var that = this;
    that.setData({
      CommentContent: content,
    });
  },
  /**
   * 评论按键
   */
  CommentSubmit: function (e) {
    var openId = app.globalData.openId;

    var that = this;

    if (!that.data.CommentContent) {
      wx.showToast({
        title: '评论内容不能为空！',
        icon: 'none',
        duration: 2000
      })
    } else {
      that.setData({
        CommentShow: true,
      });
      // 按键倒计时
      that.data.ButtonTimer = setInterval(function () {
        if (countdown == 0) {
          that.setData({
            CommentShow: false,
          })
          countdown = 60;
          clearInterval(that.data.ButtonTimer);
          return;
        } else {
          that.setData({
            LastTime: countdown
          });
          // console.warn(countdown);
          countdown--;
        }
      }, 1000)
      // console.warn(that.data.CommentContent);

      var urlPostList = app.globalData.url + '/wx/comments/addComments';
      var token = app.globalData.token;
      var params = {
        openId: openId,
        content: that.data.CommentContent,
        pid: that.data.commentId,
        articleId: that.data.articleId,
        nickName:app.globalData.userInfo.nickName,
        avatarUrl:app.globalData.userInfo.avatarUrl,
      };


      //@todo 搜索文章网络请求API数据
      request.requestPostApi(urlPostList, token, params, this, this.successSendComment, this.failSendComment);
    }
  },
  focusComment(e){
    // console.warn(e.currentTarget)
    let that = this;
    let nickName = e.currentTarget.dataset.nickname;
    let commentId = e.currentTarget.dataset.commentid;

    that.setData({
      commentId: commentId,
      placeholder: "回复" + nickName + ":",
      focus: true
    });
  },
  /**
   * 失去焦点时
   * @param {*} e 
   */
  onReplyBlur: function (e) {
    let that = this;
    const text = e.detail.value.trim();
    if (text === '') {
      that.setData({
        commentId: 0, 
        placeholder: "尽管吐槽吧  ...",
      });
    }
  },
  Likes(e){
    // console.warn(e)
    wx.showToast({
      title: "文章点赞功能开发中...",
      icon: 'none',
      duration: 2000
  })  
  },
  deleteComment(e){
    console.warn(this.data.commentId)
  },
  //删除弹窗
  showModal(e) {
    this.setData({
      modalName: 'RadioModal', // 显示弹窗
      commentId:e.currentTarget.dataset.commentid // 弹窗评论id
    })
  },
  hideModal(e) {
    this.setData({
      commentId: 0, 
      modalName: null
    })
  },
  /**
       * 文章详情请求--接口调用成功处理
       */
  successFunPost: function (res, selfObj) {
    var that = this;

    that.setData({
      articleTitle: res.data.title,
      articleLook: res.data.look,
      articleLikes: res.data.likes,
      articleText: res.data.text,
      articleDate: res.data.createTime,
      articleLabelValues: res.data.labelValues,
      // articleThumbnail: res.data.thumbnail,
    })
  },
  /**
     * 文章详情请求--接口调用失败处理
     */
    failFunPost: function (res, selfObj) {
      console.error('failFunPosts', res)
  },
  /**
     * 评论列表请求--接口调用成功处理
     */
  successComment: function (res, selfObj) {
    var that = this;
    // console.warn(res.data);
    // if (list.length != 0) {
    //   for (let i = 0; i < list.length; ++i) {
    //     list[i].falg = true;
    //     if (list[i].isAdmin) {
    //       list[i].email = '';
    //       list[i].authorUrl = 'https://cn.gravatar.com/avatar/3958035fa354403fa9ca3fca36b08068?s=256&d=mm';
    //     }
    //   }

    //   list[list.length - 1].falg = false;
    // }
    if(res.data !=null){
      that.setData({
        commentList: res.data,
        userInfo: res.data.userInfo
      })
    }
    
  },

  successSendComment: function (res, selfObj) {
    var that = this;
    // console.warn(res.data);
    that.setData({
      commentValue:"", // input控件
      CommentContent:'', // 表单
      focus: false,
    })
    
    // wx.showToast({
    //     title: '博主审核通过后可显示！',
    //     icon: 'none',
    //     duration: 2000
    //   })
    wx.showToast({
      title: '提交成功',
      icon: 'success',
      duration: 1500
    })
    var articleId = that.data.articleId
    var token = app.globalData.token;
    var urlComments = app.globalData.url + '/wx/comments/getCommentsByAid/' + articleId;
    // var urlComments = urlContent + '/comments/list_view';
    var params = {};
    //@todo 评论列表网络请求API数据
    request.requestGetApi(urlComments, token, params, this, this.successComment, this.failComment);
},

failSendComment: function (res, selfObj) {
    console.error('failComment', res)
},
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})