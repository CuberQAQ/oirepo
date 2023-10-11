# oirepo
## 介绍
  oirepo是一个用Node.js构建的，为OI训练准备的自用小工具，可以通过简单的命令将当前源文件存入仓库、载入源文件模板、编译执行单个源文件并按照配置启用响应编译参数。避免手动复制源文件、切题时花时间在删代码或写#include、using namespace std、freopen之类的鬼地方上，还可以一键载入各种提前设定好的模板，比如快读模板、邻接表模板... 暂时想到这些功能233
  
使用oirepo的工作流(部分)：
1. 当写出AC代码或反面教材或一题多解时，使用`oirepo save xxx`或直接`orp s xxx`，将当前源文件复制进repo（源文件仓库）的xxx.cpp
2. 当写出了一堆垃圾时，使用`oirepo clear`或直接`orp c`，清空当前源文件，并替换成默认模板文件。也可以在后面加上模板文件名来指定其它模板
3. 当AC了一道题，想要切题时，可以分别执行步骤1和2，也可使用`oirepo next xxx`或直接`orp n xxx`，将当前源文件复制进repo（源文件仓库）并用模板替换当前源文件
4. （待施工）想编译运行当前源文件，`oirepo run`或者`orp r`将使用预先配置好的命令编译并运行代码；也可以选择先将所有输入存进文件或流（用Ctrl+Z结束），再一次性传给待运行程序来模拟文件输入输出，计时并运行，输出结果和用时。
5. ...

oirepo需要配置一个repo（源文件仓库）文件夹，来存放写好的源文件；还有一个template（模板）文件夹，存放模板源文件，详见下文
## 快速入门
### 1. 安装Node.js
- 通过访问网站：[Node.js官网](https://nodejs.org/en/download)或[Node.js中文网](https://nodejs.cn/download/)获取安装包
- 也可使用命令行，如apt-get，choco等工具
### 2. 安装oirepo
- 从npm下载(推荐)：
  - 通过命令行执行`npm install oirepo -g`直接将oirepo全局安装至本地，npm会自动下载所有依赖包
- 从github获取源码包
  - 从github下载源码包并解压，或直接使用命令`git clone https://github.com/CuberQAQ/oirepo.git`(先确保安装了git)
  - 在源码目录下执行`npm i -g`，将oirepo全局安装至本地，npm会自动下载所有依赖包
### 3. 配置oirepo及更多
  使用 `oirepo help`和`oirepo help <子命令>`来获取帮助...
