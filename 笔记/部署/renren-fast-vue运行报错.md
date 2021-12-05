# renren-fast-vue运行报错
## npm install报错
### npm install Error: not found: python2
#### 问题:
node-sass 安装失败，报``not found: python2``

#### 解决方案:
1. 删除根目录中的``node-modules``文件

2. 删除``yarn_error.log``文件

3. ``package.json``里面删除``node-sass : ^4.13.0``

4. 专门为node-sass设置全局镜像

   ```
   npm config set sass_binary_site https://npm.taobao.org/mirrors/node-sass/
   ```

5. ``npm i node-sass``

