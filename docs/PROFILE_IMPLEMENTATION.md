# Profile 功能实现总结

本次实现完成了用户资料（Profile）的查询和更新功能，包括用户偏好设置（preference）和账号列表（accounts）的管理。

## 已创建的文件

### 1. 类型定义
- **`shared/types/profile.d.ts`** - Profile相关的TypeScript类型定义
  - `UserPreference` - 用户偏好设置
  - `UserAccount` - 用户账号
  - `UserProfile` - 用户资料（包含preference和accounts）
  - `UpdateUserPreferenceRequest` - 更新偏好设置请求
  - `UpdateUserProfileRequest` - 更新资料请求

### 2. API接口（Server端）
- **`server/api/profile/index.get.ts`** - 获取用户资料
  - 查询用户偏好设置（如不存在则创建默认值）
  - 查询用户账号列表
  - 需要登录认证
  
- **`server/api/profile/index.put.ts`** - 更新用户资料
  - 更新或创建用户偏好设置
  - 返回更新后的完整资料
  - 需要登录认证

- **`server/api/prober/accounts.get.ts`** - 获取用户账号列表
  - 查询当前用户的所有账号
  - 需要登录认证

- **`server/api/prober/accounts.put.ts`** - 添加或更新账号
  - 支持创建新账号（不提供id）
  - 支持更新现有账号（提供id）
  - 验证账号所有权
  - 需要登录认证

- **`server/api/prober/accounts/[id].delete.ts`** - 删除账号
  - 删除指定ID的账号
  - 验证账号所有权
  - 需要登录认证

### 3. 前端部分
- **`app/composables/useProfile.ts`** - Profile管理的Composable
  - `getProfile()` - 获取用户资料
  - `updateProfile()` - 更新用户资料
  - `getAccounts()` - 获取账号列表
  - `upsertAccount()` - 添加或更新账号
  - `deleteAccount()` - 删除账号

- **`app/pages/profile.vue`** - 用户资料管理页面
  - 显示和编辑用户偏好设置
  - 显示账号列表
  - 删除账号功能
  - 带有完整的UI和交互逻辑

### 4. 国际化
- **`i18n/locales/zh-CN.json`** - 中文翻译
- **`i18n/locales/en-GB.json`** - 英文翻译
  - 添加了profile相关的所有文本翻译
  - 添加了通用操作文本（保存、删除等）

### 5. 文档
- **`docs/PROFILE_API.md`** - API文档
  - 详细的API端点说明
  - 请求和响应示例
  - 数据库表结构
  - 使用示例
  - 错误处理说明

## 功能特性

### 用户偏好设置（Preference）
- maimai版本
- 简化代码
- 角色名称
- 好友代码
- 显示名称
- DX评分
- 二维码大小
- 遮罩类型
- 角色信息颜色
- 动态评分开关
- 显示日期开关
- 角色ID、背景ID、边框ID、通行证名称ID

### 账号管理（Accounts）
- 查看所有账号
- 添加新账号（服务器ID + 凭证）
- 更新现有账号
- 删除账号
- 启用/禁用账号

## 安全性

1. **认证保护**
   - 所有API端点都需要用户登录
   - 使用`getUserSession()`验证用户身份

2. **权限控制**
   - 用户只能访问和修改自己的数据
   - 更新/删除账号时验证所有权

3. **数据验证**
   - 使用TypeScript类型确保数据结构正确
   - 服务端验证请求数据

## 数据库集成

使用Drizzle ORM与PostgreSQL数据库交互：
- `tbl_preference` - 用户偏好设置表
- `tbl_account` - 用户账号表
- `tbl_server` - 服务器信息表（外键引用）

## 使用方法

### 前端使用Composable
```typescript
const { getProfile, updateProfile } = useProfile()

// 获取资料
const profile = await getProfile()

// 更新资料
await updateProfile({
  preference: {
    displayName: '新名称',
    qrSize: 20
  }
})
```

### 访问页面
直接访问 `/profile` 页面即可查看和管理用户资料。

## 注意事项

1. **账号凭证安全**
   - 当前凭证以明文存储在数据库中
   - 建议在生产环境中实现加密存储

2. **默认值处理**
   - 首次访问时会自动创建默认的偏好设置
   - 某些字段有合理的默认值（如qrSize=15）

3. **扩展性**
   - 类型定义使用了可选字段，便于未来扩展
   - API设计支持部分更新（只更新提供的字段）

## 下一步建议

1. 实现账号凭证的加密存储
2. 添加账号验证功能（验证凭证是否有效）
3. 实现账号同步功能（从游戏服务器同步数据）
4. 添加更多的偏好设置选项
5. 实现批量操作（批量启用/禁用账号）
