# 安装Commitizen规范化git commit
前提:需要安装node.js。参考笔记[[Windows10 安装 Node.js]]
## 1. Commitizen安装
```
npm install -g commitizen
```

## 2. 安装changelog
```
npm install -g conventional-changelog
npm install -g conventional-changelog-cli
```
执行``npm ls -g -depth=0``查看是否安装成功。结果为如下，表示成功:
```
> npm ls -g -depth=0
C:\Users\chenfuyuan\AppData\Roaming\npm
├── conventional-changelog-cli@2.1.1
└── conventional-changelog@3.1.24
```

## 3. 支持Angluar的Commit message格式
```
commitizen init cz-conventional-changelog --save --save-exact
```
因为commitizen工具是基于Node.js的，而我们iOS项目工程目录下是没有package.json文件，所以会报错：
```
npm WARN saveError ENOENT: no such file or directory, open '/Users/Elite/package.json'
npm WARN enoent ENOENT: no such file or directory, open '/Users/Elite/package.json'
```
对于此种错误，创建一个空的package.json文件，然后进入到项目目录，执行
```
npm init --yes
```
然后进入到你要操作的项目目录，执行
```
conventional-changelog -p angular -i CHANGELOG.md -s
```
此时项目中多了CHANGELOG.md文件，表示生成 Change log成功了。以后，凡是用到git commit 命令的时候统一改为git cz,然后就会出现选项，生成符合格式的Commit Message。实例如下：