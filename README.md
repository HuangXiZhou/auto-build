# auto-build
Node自动化部署

# Node 自动化部署
当我们在更新迭代 Node 项目的时候，我们需要做以下几步：

1. `git push` 将代码提交至代码仓库

2. 在服务器中执行 `git pull` 拉取最新代码

3. `pm2 start` 运行你的代码

这样做固然没错，但是一旦项目更新迭代过快，就需要不断的重复着上面的步骤，在各种 bash 面板中来回切换，很是麻烦。

这时候，Webhooks 闪亮登场！

对于 Webhooks， Github 给出的解释是：
>Webhooks allow you to build or set up integrations which subscribe to certain events on GitHub.com.

简单来说，利用 Webhooks，我们就可以实现网站的自动部署，现在就来看看具体该怎么做

## **配置脚本**
这段脚本内容是我们需要服务器自动执行的

```bash
# autoBuild.sh

#! /bin/bash
git reset --hard origin/master
git clean -f
git pull
npm start
```
注：这段脚本将会自动在服务器中执行

## **编写 js 文件执行脚本**
由于我使用的是 Github 作为代码仓库，所以在这里，我们使用 [github-Webhooks-handler](https://github.com/rvagg/github-Webhooks-handler) 这个库来实现我们的脚本自动执行工作

按照文档，我们按照以下方式来编写 js 文件：

```javascript
// autoBuild.js
var http = require('http')
var spawn = require('child_process').spawn
var createHandler = require('github-Webhooks-handler')
var handler = createHandler({ path: '/pushCode', secret: '' }) // 在代码仓库的 Webhooks 选项处配置
http.createServer(function (req, res) {
  handler(req, res, function (err) {
    res.statusCode = 404;
    res.end('no such location')
  })
}).listen(7777)

handler.on('error', function (err) {
  console.error('Error:', err.message)
})

// 监听 push 事件
handler.on('push', function (event) {
  console.log('Received a push event for %s to %s',
    event.payload.repository.name,
    event.payload.ref)
  rumCommand('sh', ['./autoBuild.sh'], function( txt ) { // 执行 autoBuild.sh 脚本文件
    console.log(txt)
  })
})

function rumCommand( cmd, args, callback ) {
    var child = spawn( cmd, args )
    var response = ''
    child.stdout.on('data', function( buffer ){ response += buffer.toString(); })
    child.stdout.on('end', function(){ callback( response ) })
}
```
在 app.js 中，我们将端口设置为 3001，在这里代码就不放出来了，可以在文末的 Github 链接里找到本教程的全部示例代码

## **Nginx 配置**
由于我们的示例代码是跑在 3001 端口的，执行自动化部署的 js 文件则跑在 7777 端口，所以我们需要配置一下 Nginx 来启用这两个端口：

```bash
# 启用 7777 端口
server {
    listen 7777;
    listen [::]:7777
    server_name huangxizhou.com; #在这里填上你自己的服务器 ip 地址或者域名
    
    root /var/www/html/auto-build;
}

# 启用 3001 端口
server {
    listen 3001;
    listen [::]:3001
    server_name huangxizhou.com; #在这里填上你自己的服务器 ip 地址或者域名
    
    root /var/www/html/auto-build;
}
```
这样一来，Nginx 就配置完毕了，接下来就是代码仓库的 Webhooks 配置

## **Webhooks 配置**
首先，我们进入你想实现自动化部署的仓库，点击 settings -> Webhooks 来配置

![Webhooks](http://ojiq40lzd.bkt.clouddn.com/%E5%B1%8F%E5%B9%95%E5%BF%AB%E7%85%A7%202017-10-16%20%E4%B8%8B%E5%8D%884.02.33.png)

在右侧，就是配置你的接口地址以及 Secret，对应之前的 js 文件里面的 Secret，选择 Content type 为 `application/json`

## **初始化项目**
第一次部署项目，还是需要我们自己手动操作的。
首先提交代码至代码仓库（这里是Github），然后进入服务器执行 `git pull`

这样，我们就成功部署了我们 Node 实现自动部署的代码了

让我们修改代码来试试效果怎么样
`git push` 之后转到服务器内一看，完美，成功运行
![](http://ojiq40lzd.bkt.clouddn.com/WechatIMG36.jpeg)

再看看 Github

![](http://ojiq40lzd.bkt.clouddn.com/%E5%B1%8F%E5%B9%95%E5%BF%AB%E7%85%A7%202017-10-16%20%E4%B8%8B%E5%8D%884.22.32.png)

已经自动触发了接口，Node 自动化部署成功

## **最后**
此技术不仅仅局限于 Node

局限性也是有的，只能单项目自动化部署，且必须依赖代码仓库

最后的最后...  各位大佬有要2019年毕业的前端开发实习生的嘛，[我的简历](https://huangxizhou.com/resume)请大佬收下 T T

本项目的源码地址：[https://github.com/HuangXiZhou/auto-build](https://github.com/HuangXiZhou/auto-build)

感谢阅读 ; )
