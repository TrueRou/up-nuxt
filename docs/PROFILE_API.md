# Profile API 文档

## 概述

Profile API 提供了用户资料管理功能，包括用户偏好设置和账号管理。

## API 端点

### 1. 获取用户资料

**端点:** `GET /api/profile`

**认证:** 需要登录

**响应:**
```json
{
  "code": 200,
  "node": "success",
  "message": null,
  "data": {
    "preference": {
      "user_id": 1,
      "maimaiVersion": "舞萌DX 2024",
      "simplifiedCode": "ABC123",
      "characterName": "玩家角色",
      "friendCode": "1234567890",
      "displayName": "测试玩家",
      "dxRating": "15000",
      "qrSize": 15,
      "maskType": 0,
      "charaInfoColor": "#fee37c",
      "dynamicRating": true,
      "showDate": true,
      "characterId": "char_001",
      "backgroundId": "bg_001",
      "frameId": "frame_001",
      "passnameId": "pass_001"
    },
    "accounts": [
      {
        "id": 1,
        "user_id": 1,
        "server_id": 1,
        "credentials": "encrypted_credentials",
        "enabled": true,
        "created_at": "2024-01-01T00:00:00.000Z",
        "updated_at": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

### 2. 更新用户资料

**端点:** `PUT /api/profile`

**认证:** 需要登录

**请求体:**
```json
{
  "preference": {
    "displayName": "新的显示名称",
    "friendCode": "9876543210",
    "qrSize": 20,
    "charaInfoColor": "#ff0000",
    "dynamicRating": false,
    "showDate": true
  }
}
```

**响应:** 与 GET /api/profile 相同

### 3. 获取账号列表

**端点:** `GET /api/prober/accounts`

**认证:** 需要登录

**响应:**
```json
{
  "code": 200,
  "node": "success",
  "message": null,
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "server_id": 1,
      "credentials": "encrypted_credentials",
      "enabled": true,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### 4. 添加或更新账号

**端点:** `PUT /api/prober/accounts`

**认证:** 需要登录

**请求体 (添加新账号):**
```json
{
  "server_id": 1,
  "credentials": "user_credentials",
  "enabled": true
}
```

**请求体 (更新现有账号):**
```json
{
  "id": 1,
  "server_id": 1,
  "credentials": "updated_credentials",
  "enabled": false
}
```

**响应:**
```json
{
  "code": 200,
  "node": "success",
  "message": null,
  "data": {
    "id": 1,
    "user_id": 1,
    "server_id": 1,
    "credentials": "updated_credentials",
    "enabled": false,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T12:00:00.000Z"
  }
}
```

### 5. 删除账号

**端点:** `DELETE /api/prober/accounts/:id`

**认证:** 需要登录

**参数:**
- `id` (路径参数): 要删除的账号ID

**响应:**
```json
{
  "code": 200,
  "node": "success",
  "message": null,
  "data": null
}
```

## 前端使用示例

### 使用 Composable

```typescript
import { useProfile } from '~/composables/useProfile'

// 在组件中使用
const { getProfile, updateProfile, getAccounts, upsertAccount, deleteAccount } = useProfile()

// 获取用户资料
const profile = await getProfile()

// 更新用户偏好设置
await updateProfile({
  preference: {
    displayName: '新名称',
    qrSize: 20
  }
})

// 获取账号列表
const accounts = await getAccounts()

// 添加新账号
await upsertAccount({
  server_id: 1,
  credentials: 'my_credentials',
  enabled: true
})

// 更新现有账号
await upsertAccount({
  id: 1,
  server_id: 1,
  credentials: 'updated_credentials',
  enabled: false
})

// 删除账号
await deleteAccount(1)
```

### 页面示例

访问 `/profile` 页面可以查看和管理用户资料。

## 数据库表结构

### tbl_preference (用户偏好设置)

| 字段             | 类型    | 说明                         |
|------------------|---------|------------------------------|
| user_id          | integer | 用户ID (主键)                |
| maimai_version   | text    | maimai版本                   |
| simplified_code  | text    | 简化代码                     |
| character_name   | text    | 角色名称                     |
| friend_code      | text    | 好友代码                     |
| display_name     | text    | 显示名称                     |
| dx_rating        | text    | DX评分                       |
| qr_size          | integer | 二维码大小 (默认: 15)        |
| mask_type        | integer | 遮罩类型 (默认: 0)           |
| chara_info_color | text    | 角色信息颜色 (默认: #fee37c) |
| dynamic_rating   | boolean | 动态评分 (默认: true)        |
| show_date        | boolean | 显示日期 (默认: true)        |
| character_id     | text    | 角色ID                       |
| background_id    | text    | 背景ID                       |
| frame_id         | text    | 边框ID                       |
| passname_id      | text    | 通行证名称ID                 |

### tbl_account (用户账号)

| 字段        | 类型      | 说明                  |
|-------------|-----------|-----------------------|
| id          | serial    | 账号ID (主键)         |
| user_id     | integer   | 用户ID                |
| server_id   | integer   | 服务器ID (外键)       |
| credentials | text      | 凭证                  |
| enabled     | boolean   | 是否启用 (默认: true) |
| created_at  | timestamp | 创建时间              |
| updated_at  | timestamp | 更新时间              |

## 错误处理

所有API在遇到错误时会返回适当的HTTP状态码：

- `401 Unauthorized`: 未登录或登录已过期
- `404 Not Found`: 资源不存在或无权访问
- `400 Bad Request`: 请求参数错误
- `500 Internal Server Error`: 服务器内部错误

## 安全性

- 所有API端点都需要用户登录认证
- 用户只能访问和修改自己的资料和账号
- 账号凭证应该加密存储（建议在存储前进行加密处理）
