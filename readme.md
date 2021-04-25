# Little Vote

## 概述

设计一个投票程序，用户可以使用该程序给指定的用户名投票，同时用户也可以查询指定用户名的当前票数。

1. 该程序需要每 2 秒随机生成一个`ticket`，由服务端产生，并且提供相应的接口获取该`ticket`，每个`ticket`的有效时间是从服务端生成到下一次生成新的`ticket`为止
2. 在`ticket`的有效期间内，支持给任意用户投任意次数的票。并且每个`ticket`的使用次数存在一个上限

## 接口设计

1. 投票`vote`

   ```text
   输入：指定的用户名（支持多个）
   输出：ticket
   行为：检查ticket是否合法，合法则将指定的（多个）用户的票数＋1
   输出：投票结果
   ```

2. 查询`query`

   ```text
   输⼊: 指定的⽤户名
   输出：指定⽤户的当前票数
   ```

3. 获取票据`cas`

   ```text
   输⼊：⽆
   输出：当前的服务器票据
   ```

## 要求

1. 不限语言，请使用`GraphQL`设计相应的 API
2. 投票数据需要持久化
3. 请尽可能的提升性能，注意程序可能存在的条件竞争，扩展性等问题



## 验证

In the middle of a `token` update, the voting failed as expected:

