# Profile 功能完整实现

## 概述

已完成用户资料（Profile）管理系统的完整实现，包括用户偏好设置和账号管理功能。

## 📁 文件结构

```
up-nuxt/
├── app/
│   ├── composables/
│   │   └── useProfile.ts              # Profile管理Composable
│   └── pages/
│       └── profile.vue                # Profile页面
├── server/
│   ├── api/
│   │   ├── profile/
│   │   │   ├── index.get.ts          # 获取用户资料
│   │   │   └── index.put.ts          # 更新用户资料
│   │   ├── prober/
│   │   │   ├── accounts.get.ts       # 获取账号列表
│   │   │   ├── accounts.put.ts       # 添加/更新账号
│   │   │   └── accounts/
│   │   │       └── [id].delete.ts    # 删除账号
│   │   └── servers/
│   │       └── index.get.ts          # 获取服务器列表
│   └── database/
│       └── seeds/
│           └── servers.sql           # 服务器示例数据
├── shared/
│   └── types/
│       └── profile.d.ts              # Profile类型定义
├── i18n/
│   └── locales/
│       ├── zh-CN.json                # 中文翻译
│       └── en-GB.json                # 英文翻译
└── docs/
    ├── PROFILE_API.md                # API文档
    ├── PROFILE_IMPLEMENTATION.md     # 实现总结
    └── PROFILE_TESTING.md            # 测试指南
```

## ✨ 功能特性

### 1. 用户偏好设置（Preference）

- ✅ maimai版本设置
- ✅ 简化代码
- ✅ 角色名称
- ✅ 好友代码
- ✅ 显示名称
- ✅ DX评分
- ✅ 二维码大小（10-30）
- ✅ 遮罩类型
- ✅ 角色信息颜色（颜色选择器）
- ✅ 动态评分开关
- ✅ 显示日期开关
- ✅ 角色、背景、边框、通行证ID

### 2. 账号管理（Accounts）

- ✅ 查看所有账号
- ✅ 添加新账号
- ✅ 更新现有账号
- ✅ 删除账号
- ✅ 启用/禁用账号
- ✅ 账号所有权验证

### 3. 服务器管理

- ✅ 获取可用服务器列表
- ✅ 服务器信息展示

## 🚀 API端点

| 方法   | 端点                       | 描述           | 认证 |
|--------|----------------------------|----------------|------|
| GET    | `/api/profile`             | 获取用户资料   | ✅    |
| PUT    | `/api/profile`             | 更新用户资料   | ✅    |
| GET    | `/api/prober/accounts`     | 获取账号列表   | ✅    |
| PUT    | `/api/prober/accounts`     | 添加/更新账号  | ✅    |
| DELETE | `/api/prober/accounts/:id` | 删除账号       | ✅    |
| GET    | `/api/servers`             | 获取服务器列表 | ❌    |

## 📦 数据库表

### tbl_preference（用户偏好设置）

| 字段             | 类型    | 默认值  | 说明         |
|------------------|---------|---------|--------------|
| user_id          | integer | -       | 用户ID（主键） |
| maimai_version   | text    | null    | maimai版本   |
| simplified_code  | text    | null    | 简化代码     |
| character_name   | text    | null    | 角色名称     |
| friend_code      | text    | null    | 好友代码     |
| display_name     | text    | null    | 显示名称     |
| dx_rating        | text    | null    | DX评分       |
| qr_size          | integer | 15      | 二维码大小   |
| mask_type        | integer | 0       | 遮罩类型     |
| chara_info_color | text    | #fee37c | 角色信息颜色 |
| dynamic_rating   | boolean | true    | 动态评分     |
| show_date        | boolean | true    | 显示日期     |
| character_id     | text    | null    | 角色ID       |
| background_id    | text    | null    | 背景ID       |
| frame_id         | text    | null    | 边框ID       |
| passname_id      | text    | null    | 通行证名称ID |

### tbl_account（用户账号）

| 字段        | 类型      | 默认值 | 说明           |
|-------------|-----------|--------|----------------|
| id          | serial    | -      | 账号ID（主键）   |
| user_id     | integer   | -      | 用户ID         |
| server_id   | integer   | -      | 服务器ID（外键） |
| credentials | text      | -      | 凭证           |
| enabled     | boolean   | true   | 是否启用       |
| created_at  | timestamp | now()  | 创建时间       |
| updated_at  | timestamp | now()  | 更新时间       |

### tbl_server（服务器）

| 字段                 | 类型   | 说明           |
|----------------------|--------|----------------|
| id                   | serial | 服务器ID（主键） |
| name                 | text   | 服务器名称     |
| description          | text   | 服务器描述     |
| identifier           | text   | 服务器标识符   |
| tips_title           | text   | 提示标题       |
| tips_desc            | text   | 提示描述       |
| tips_url             | text   | 提示URL        |
| credentials_strategy | text   | 凭证策略       |
| credentials_field    | text   | 凭证字段       |

## 🔧 使用方法

### 在Vue组件中使用Composable

```vue
<script setup>
const { getProfile, updateProfile, getAccounts, getServers } = useProfile()

// 获取用户资料
const profile = await getProfile()

// 更新偏好设置
await updateProfile({
  preference: {
    displayName: '新名称',
    qrSize: 20,
    dynamicRating: false
  }
})

// 获取账号列表
const accounts = await getAccounts()

// 获取服务器列表
const servers = await getServers()
</script>
```

### 直接访问页面

访问 `/profile` 页面即可查看和编辑用户资料。

## 🔐 安全性

1. **认证保护**
   - 所有API端点都需要用户登录（除了获取服务器列表）
   - 使用session验证用户身份

2. **权限控制**
   - 用户只能访问和修改自己的数据
   - 更新/删除账号时验证所有权

3. **数据验证**
   - TypeScript类型检查
   - 服务端数据验证

⚠️ **注意**: 账号凭证当前以明文存储，建议在生产环境中实现加密。

## 🌍 国际化

支持多语言：
- 中文（zh-CN）
- 英文（en-GB）

所有UI文本都已翻译。

## 📝 文档

- **[PROFILE_API.md](./PROFILE_API.md)** - 详细的API文档
- **[PROFILE_IMPLEMENTATION.md](./PROFILE_IMPLEMENTATION.md)** - 实现细节
- **[PROFILE_TESTING.md](./PROFILE_TESTING.md)** - 测试指南

## 🧪 测试

### 快速测试

1. 启动开发服务器：
   ```bash
   pnpm dev
   ```

2. 登录系统

3. 访问 `/profile` 页面

4. 尝试编辑偏好设置并保存

### API测试

使用浏览器控制台：

```javascript
// 获取资料
const profile = await $fetch('/api/profile')

// 更新资料
await $fetch('/api/profile', {
  method: 'PUT',
  body: { preference: { displayName: '测试' } }
})
```

详细测试方法请参见 [PROFILE_TESTING.md](./PROFILE_TESTING.md)

## 🗄️ 数据库设置

### 运行迁移

如果尚未运行迁移：

```bash
pnpm drizzle-kit push
```

### 插入示例服务器数据

```bash
psql $DATABASE_URL < server/database/seeds/servers.sql
```

或手动执行seeds/servers.sql中的SQL语句。

## 📊 数据流程

```
用户 → Profile页面 → useProfile Composable → API端点 → Drizzle ORM → PostgreSQL数据库
```

### 获取资料流程

1. 用户访问 `/profile` 页面
2. 页面调用 `getProfile()` composable
3. 发送 GET 请求到 `/api/profile`
4. API验证用户身份
5. 查询数据库（preference + accounts）
6. 如果preference不存在，创建默认值
7. 返回完整的profile数据
8. 页面展示数据

### 更新资料流程

1. 用户修改表单并点击保存
2. 调用 `updateProfile()` 并传入数据
3. 发送 PUT 请求到 `/api/profile`
4. API验证用户身份
5. 更新数据库中的preference记录
6. 返回更新后的完整数据
7. 页面显示成功消息

## 🎯 下一步建议

1. **安全增强**
   - 实现账号凭证加密存储
   - 添加操作日志记录

2. **功能扩展**
   - 账号验证功能
   - 数据同步功能
   - 批量操作支持

3. **用户体验**
   - 添加表单验证
   - 实时预览功能
   - 更多自定义选项

4. **性能优化**
   - 添加缓存机制
   - 实现数据懒加载
   - 优化数据库查询

5. **测试**
   - 编写单元测试
   - 添加集成测试
   - E2E测试

## 🐛 故障排查

### 常见问题

1. **401 Unauthorized**
   - 确保已登录
   - 检查session是否有效

2. **404 Not Found**
   - 确认API端点正确
   - 检查路由配置

3. **数据库错误**
   - 检查DATABASE_URL环境变量
   - 确认数据库运行中
   - 验证表是否已创建

4. **类型错误**
   - 重启TypeScript服务器
   - 检查类型定义是否正确导入

## 📄 许可证

此项目的一部分，遵循项目主许可证。

## 👥 贡献

欢迎提交问题和改进建议！
