# Profile API 测试指南

本文档提供了测试Profile API的方法和步骤。

## 前提条件

1. 确保数据库已正确配置并运行
2. 运行数据库迁移（如果尚未运行）
3. 已有一个测试用户账号并成功登录

## 测试步骤

### 1. 启动开发服务器

```bash
pnpm dev
```

### 2. 登录系统

访问 `/auth/login` 页面，使用测试账号登录。

### 3. 测试Profile页面

访问 `/profile` 页面，你应该能看到：
- 用户偏好设置表单
- 账号列表（如果有的话）

### 4. 测试功能

#### 4.1 查看资料
- 页面加载时会自动获取用户资料
- 如果是首次访问，会自动创建默认的偏好设置

#### 4.2 更新偏好设置
1. 修改任意偏好设置字段（如显示名称、二维码大小等）
2. 点击"保存"按钮
3. 应该看到成功提示
4. 刷新页面，确认更改已保存

#### 4.3 查看账号列表
- 账号列表会显示所有关联的游戏账号
- 显示服务器ID和启用状态

#### 4.4 删除账号（如果有账号）
1. 点击账号旁边的"删除"按钮
2. 确认删除操作
3. 应该看到成功提示
4. 账号从列表中移除

## API测试（使用curl或Postman）

### 获取访问令牌

首先需要登录获取会话cookie。

### 测试GET /api/profile

```bash
curl -X GET http://localhost:3000/api/profile \
  -H "Cookie: your-session-cookie" \
  -H "Content-Type: application/json"
```

期望响应：
```json
{
  "code": 200,
  "node": "success",
  "message": null,
  "data": {
    "preference": {
      "user_id": 1,
      "qrSize": 15,
      "maskType": 0,
      "charaInfoColor": "#fee37c",
      "dynamicRating": true,
      "showDate": true,
      ...
    },
    "accounts": []
  }
}
```

### 测试PUT /api/profile

```bash
curl -X PUT http://localhost:3000/api/profile \
  -H "Cookie: your-session-cookie" \
  -H "Content-Type: application/json" \
  -d '{
    "preference": {
      "displayName": "测试用户",
      "friendCode": "1234567890",
      "qrSize": 20
    }
  }'
```

期望响应：更新后的完整资料

### 测试GET /api/prober/accounts

```bash
curl -X GET http://localhost:3000/api/prober/accounts \
  -H "Cookie: your-session-cookie" \
  -H "Content-Type: application/json"
```

### 测试PUT /api/prober/accounts（添加账号）

```bash
curl -X PUT http://localhost:3000/api/prober/accounts \
  -H "Cookie: your-session-cookie" \
  -H "Content-Type: application/json" \
  -d '{
    "server_id": 1,
    "credentials": "test_credentials",
    "enabled": true
  }'
```

### 测试DELETE /api/prober/accounts/:id

```bash
curl -X DELETE http://localhost:3000/api/prober/accounts/1 \
  -H "Cookie: your-session-cookie" \
  -H "Content-Type: application/json"
```

## 浏览器开发者工具测试

### 使用浏览器控制台

打开浏览器开发者工具（F12），在控制台中运行：

```javascript
// 获取用户资料
const profile = await $fetch('/api/profile')
console.log(profile)

// 更新用户资料
const updated = await $fetch('/api/profile', {
  method: 'PUT',
  body: {
    preference: {
      displayName: '新名称',
      qrSize: 20
    }
  }
})
console.log(updated)

// 获取账号列表
const accounts = await $fetch('/api/prober/accounts')
console.log(accounts)
```

## 常见问题排查

### 1. 401 Unauthorized错误
- **原因**: 未登录或会话已过期
- **解决**: 重新登录系统

### 2. 404 Not Found错误（账号操作）
- **原因**: 账号不存在或不属于当前用户
- **解决**: 确认账号ID正确且属于当前登录用户

### 3. 数据库连接错误
- **原因**: 数据库未运行或配置错误
- **解决**: 检查DATABASE_URL环境变量和数据库状态

### 4. 类型错误
- **原因**: 请求数据格式不正确
- **解决**: 检查请求体是否符合TypeScript类型定义

## 数据验证

### 验证数据库中的数据

```sql
-- 查看用户偏好设置
SELECT * FROM tbl_preference WHERE user_id = 1;

-- 查看用户账号
SELECT * FROM tbl_account WHERE user_id = 1;

-- 查看服务器信息
SELECT * FROM tbl_server;
```

## 性能测试

### 并发测试
可以使用工具如Apache Bench (ab) 或 wrk 进行并发测试：

```bash
# 安装ab（如果尚未安装）
# Ubuntu: apt-get install apache2-utils
# macOS: 自带

# 测试GET /api/profile
ab -n 100 -c 10 http://localhost:3000/api/profile
```

### 响应时间
监控API响应时间，确保在可接受范围内（建议<500ms）。

## 集成测试建议

可以创建自动化测试脚本：

```typescript
// tests/api/profile.test.ts
import { describe, it, expect } from 'vitest'

describe('Profile API', () => {
  it('should get user profile', async () => {
    // 实现测试逻辑
  })
  
  it('should update user preference', async () => {
    // 实现测试逻辑
  })
  
  it('should create and delete account', async () => {
    // 实现测试逻辑
  })
})
```

## 结论

通过以上测试步骤，你可以验证Profile API的所有功能是否正常工作。如果遇到问题，请检查：
1. 数据库连接
2. 用户认证状态
3. API请求格式
4. 服务器日志
