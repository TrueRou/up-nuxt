-- 插入示例服务器数据（如果不存在）
-- 这些数据仅用于开发和测试
INSERT INTO
    tbl_server (
        name,
        description,
        identifier,
        tips_title,
        tips_desc,
        tips_url,
        credentials_strategy,
        credentials_field
    )
VALUES
    (
        'maimai DX 国际版',
        'maimai DX 国际版游戏服务器',
        'maimai-dx-intl',
        '如何获取凭证',
        '请登录游戏后在设置中查看您的玩家ID',
        'https://example.com/help',
        'player_id',
        'player_id'
    ),
    (
        'maimai DX 日本版',
        'maimai DX 日本版游戏服务器',
        'maimai-dx-jp',
        '如何获取凭证',
        '请登录游戏后在设置中查看您的玩家ID',
        'https://example.com/help',
        'player_id',
        'player_id'
    ),
    (
        'maimai DX 国服',
        'maimai DX 国服游戏服务器',
        'maimai-dx-cn',
        '如何获取凭证',
        '请登录游戏后在设置中查看您的玩家ID',
        'https://example.com/help',
        'player_id',
        'player_id'
    ) ON CONFLICT DO NOTHING;