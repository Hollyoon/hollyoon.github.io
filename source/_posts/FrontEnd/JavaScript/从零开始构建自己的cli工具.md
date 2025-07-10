---
title: 从零开始构建自己的CLI工具，提高效率
date: 2021-08-24 15:13:04
tags: JavaScript
categories: FrontEnd
---

## 前言
公司需要的新项目比较多，主管要求我准备搭建一个通用的框架，放在git上，以便于新项目直接套用。我不禁开始思考，如果每次要新建一个项目，做法的流程大概就是新建一个文件夹（或者在git仓库上新建），然后拷贝通用框架的git地址，拉取到该文件夹，然后就可以开发的。这操作流程看起来比较繁琐，效率也很低，需要拷贝时肯定要先打开git仓库，然后找通用框架的git地址，后面需要新建项目，git地址未必能记得，还需要取git仓库。这样可不行的，所以我就想到之前就很🔥的cli工具，之前看到好多大神写的文章，感觉很酷也很崇拜，心想自己也要写出一个，但久久没机会，主要是没需求用到，也就不知道怎么写。这不，现在机会来了嘛，就这么开始跃跃欲试下手～😎

> cli工具大多数需要插件工具，也就意味着你需要看比较多的文档，所以需要一颗耐心的❤️。

**Ready coffe，Let's start**

## START

### cli需要用到的工具库 🔧

| 名称 | 简介 | 文档地址 |
| --- | --- |---|
| commander| 命令行自定义指令，比如说 -v, -c | https://github.com/tj/commander.js/blob/master/Readme_zh-CN.md |
| chalk | 美化样式，高亮字体 |  https://github.com/chalk/chalk |
| inquirer | 交互式回答 | https://github.com/SBoudrias/Inquirer.js/  |
| figlet | 艺术字 |  https://github.com/patorjk/figlet.js |
| ora | 加载的动画效果 |  https://github.com/sindresorhus/ora | 
| download-git-repo | 下载远程模板 | https://www.npmjs.com/package/download-git-repo |
| handlebars | 可以替换模板中的动态字符串 | https://handlebarsjs.com/zh/guide/#%E4%BB%80%E4%B9%88%E6%98%AF-handlebars ｜


### 新建一个项目 🆕

* 新建文件夹 📁

```JavaScript
mkdir fency-cli   //新建文件夹，名字随意
cd fency-cli     //进入文件夹里面
npm init -y     //快速生成package.json
```

* 安装刚才说到的所有工具库 ⬇️

```JavaScript
yarn add commander chalk inquirer figlet ora download-git-repo handlebars -D
```

> Tips: ora, 我用的是5.6版本，6以上用import

* 新建命令行的入口文件 **/bin/cli.js** 📃
```
#! /usr/bin/env node //用于解释程序的脚本

console.log('Hello fe-cli') //为了测试是否正常
```

* 在package.json文件中增加入口文件 **bin**字段 🏠

```json
{
    "name": "fency-cli",
    "version": "1.0.0",
    "description": "脚手架工具",
    "bin": {
        "fe-cli": "./bin/cli.js"
    },
    ...
}
```
> 增加bin，是为了"npm link"正常使用，“fe-cli“作为命令行的名字，下面我们可以测试下～

* 然后把这个命令映射到全局 🔗

```JavaScript
npm link
```

* 执行完成，效果是这样的 ✅

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/80a0ea888c5c4d0caf4a753af5b2626d~tplv-k3u1fbpfcp-watermark.image)

* 然后测试下，在命令行输入fe-cli执行 ⚙️

![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9f1ecb68c3ca4de7a9b3b7086392f60a~tplv-k3u1fbpfcp-watermark.image)

> Hello fency-cli 就是cli文件的打印结果，然后只要你改动某个文件，会同步更新到全局的。


### 获取版本号 🏷
* 一般项目都会有版本号，而版本号代表功能的迭代，所以我们先做个cli的版本号，版本号都是与package.json里的version有关，看下面的🌰

```JavaScript
const { program } = require('commander')
const package=require('../package.json')

//获取package.json的版本号
program.version(package.version)

//解析命令行的指令，必须要加上，不然打印不出信息
program.parse(process.argv)
```

* 然后测试下，输入 **fe-cli -V** 或者 **fe-cli --version**

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f9e06b4606204632817fff5e52020964~tplv-k3u1fbpfcp-watermark.image)

> program.version第二个参数没自定义的话，默认就是-V或者--version，要是想支持-v, 就要加上第二个参数，比如program.version(package.version, '-v, --version')



### 新建业务的项目
一般我们新建业务的项目时，流程大概是这样，新建一个文件夹和命名，然后拷贝通用框架到该项目，然后把该项目推送到git仓库。现在我们要把这些流程改为自动化流程～👀

> Tips: 克隆通用框架的git地址或者推送到git仓库之前，要设置好ssh，不然没法用。

废话不多说，start～🙈

* 准备交互式的回答
  因为我们项目会有两个类型，一个是前台的框架，另一个是后台的框架，所以我是这么准备，先让用户用创建的命令行，然后输入文件夹的名字和描述（输入后要判断是否有同名的，如果有同名就提醒用户），然后选择一个框架，选择后就可以开始拷贝。

在src文件夹新建一个question.js

```JavaScript
const fse=require('fs-extra')

const create = [
    {
        name:'conf',
        type:'confirm',
        message:'🆕 是否创建新的项目？'
    },{
        name:'name',
        message:'👉 请输入项目名称:',
        validate:function(val){
            if(!val){
                return '亲，你忘了输入项目的名称哦～'
            }
            if(fse.existsSync(val)){
                return '当前目录已存在同名的项目，请更换项目名'
            }
            return true
        },
        when: res => Boolean(res.conf)
    },{
        name:'desc',
        message:'💬 请输入项目的描述:',
        when:res=>Boolean(res.conf)
    },{
        name:'template',
        type:'list',
        message:'🔜 请选择一个框架?',
        choices:[
            {
                key:'a',
                name:'普通通用框架',
                value:'', //前台通用框架的git地址
            },
            {
                key:'b',
                name:'中后台通用框架',
                value:'', //中后台的通用框架git地址
            }
        ],
        filter:function(val){
            return val.toLowerCase()
        },
        when: res =>{
            Boolean(res.conf)
        }
    }
]

module.exports={
    create
}
```

* 增加创建文件的逻辑，在src文件夹下面新建一个create.js

```JavaScript

const download = require('download-git-repo')
const ora = require('ora')
const fse = require('fs-extra')
const handlebars = require('handlebars')
const myChalk = require('../utils/chalk')

const { red, yellow, green } = myChalk

function createProject(project) {
    //获取用户输入，选择的信息
    const { template, name, desc } = project;
    const spinner = ora("正在拉取框架...");
    spinner.start();
    download(template, name, { clone: true }, async function (err) {
        if (err) {
            red(err);
            spinner.text = red(`拉取失败. ${err}`)
            spinner.fail()
            process.exit(1);
        } else {
            spinner.text = green(`拉取成功...`)
            spinner.succeed()
            spinner.text = yellow('请稍等，. 正在替换package.json中的项目名称、描述...')
            const multiMeta={
                project_name: name,
                project_desc: desc
            }
            const multiFiles=[
                `${name}/package.json`
            ]
            // 用条件循环把模板字符替换到文件去
            for (var i = 0; i < multiFiles.length; i++) {
                // 这里记得 try {} catch {} 哦，以便出错时可以终止掉 Spinner
                try {
                    // 等待读取文件
                    const multiFilesContent = await fse.readFile(multiFiles[i], 'utf8')
                    // 等待替换文件，handlebars.compile(原文件内容)(模板字符)
                    const multiFilesResult = await handlebars.compile(multiFilesContent)(multiMeta)
                    // 等待输出文件
                    await fse.outputFile(multiFiles[i], multiFilesResult)
                } catch (err) {
                    // 如果出错，Spinner 就改变文字信息
                    spinner.text = red(`项目创建失败. ${err}`)
                    // 终止等待动画并显示 X 标志
                    spinner.fail()
                    // 退出进程
                    process.exit(1)
                }
            }
            // 如果成功，Spinner 就改变文字信息
            spinner.text = yellow(`项目已创建成功！`)
            // 终止等待动画并显示 ✔ 标志
            spinner.succeed()
        }
    });
}

module.exports = createProject
```

* 然后处理用户输入的create命令行
  cli.js增加一段代码

```JavaScript
const inquirer = require('inquirer')
const package = require('../package.json')
const question = require('../src/question')
const myChalk = require('../utils/chalk')
const createProject = require('../src/create')

const { red } = myChalk
/** 创建项目 */

program
    .command('create')
    .description('创建一个项目')
    .action(function(){
        inquirer.prompt(question.create).then(async answer => {
            if(answer.conf){
                createProject(answer)
            }else{
                red(`🆘 您已经终止此操作 🆘`)
            }
        }).catch(err=>{
            red(`❌ 程序出错 ❌`)
            process.exit(1);
        })
})
```

* 最后我们看看效果

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6efd9db2aa7643c6bffdd20d059f4761~tplv-k3u1fbpfcp-watermark.image)

Cool～

### 把新项目推送到git仓库
一般公司都会有自己的git仓库，以供多个小伙伴一起开发用，所以要实现新项目推送到git仓库的自动流程，但前提要在远程仓库新建一个库，然后复制git地址。（目前只能这样，小伙伴如果有更好的办法，不妨说下，在此非常感谢🙏）

* question.js增加一个交互式答案
```JavaScript
const pushGit=[
    {
        name:'url',
        type:'input',
        message:'🌲 请输入远程仓库的地址:',
    }
]
```

* 增加推送远程仓库的功能，在src文件夹新建一个git文件
```JavaScript
const execa = require('execa')
const ora = require('ora')
const spinner = ora('git pushing...\n')
const myChalk = require('../utils/chalk')

const { red, green } =myChalk

async function push(gitRemote) {
    const runCMD = (command, args) => {
        if (!args) {
            [command, ...args] = command.split(/\s+/);
        }
        return execa(command, args).catch((err) => {
            spinner.fail(
                red("推送失败，请检查远程仓库地址对不对")
            );
        });
    };
    await runCMD("echo unicorns");
    await runCMD("git init");
    await runCMD(`git remote add origin ${gitRemote}`);
    await runCMD("git add .");
    await runCMD("git commit -m init");
    spinner.start();
    await runCMD("git push origin master").then((res) => {
        if (res) {
            spinner.stop();
            console.log();
            console.log(
                green(
                    " 🎉 推送成功辣～\n" +
                    " \n" +
                    " 😀 可以愉快开始打码，愿神兽保佑你，写的代码永无bug\n"
                )
            );
         }
    });
}

module.exports = {
    push
}

* 最后新增推送的命令行
cli.js新增一段代码
```JavaScript
const git = require('../src/git')

/** 推送远程仓库 */
program
    .command('pushGit')
    .description('推送到gitlab仓库')
    .action(function(){
        inquirer.prompt(question.pushGit).then(answer=>{
            git.push(answer.url)
        }).catch(err => {
            red(`❌ 程序出错 ❌`)
            process.exit(1);
        })
    })
```

这样就能成功推送到远程仓库，没出意外的话。

嗯，到此为止啦，如果有新功能的需求，可以自己拓展下。本人有时间的话，也会同步更新哈～

[fency-cli的demo](https://github.com/ifency/fency-cli)
