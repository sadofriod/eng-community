# English Speaking Coach PRD (MVP)

Last Updated: 2026-04-08
Owner: dushihua
Stage: MVP implementation start

## 1. Product Positioning

### 1.1 Problem Statement

职场用户常见问题不是“看不懂英语”，而是“说不出口、说不地道、说完不确定是否得体”。
现有通用英语学习产品偏词汇和语法练习，缺少针对职场表达场景的短时高频口语闭环训练。

### 1.2 Product Goal

在 2-4 周内交付一个个人可稳定使用的口语训练 MVP，帮助用户在 10-20 分钟内完成一轮高质量练习：

1. 选择职场场景
2. 语音表达
3. 自动转写
4. AI 反馈
5. 改进重练
6. 会话总结与次日复练建议

### 1.3 Target Users

- 主目标用户：希望提升英语表达质量的职场人士
- 使用方式：个人自用为主
- 使用节奏：每天或隔天 1 次，每次 10-20 分钟

## 2. Scope

### 2.1 In Scope (MVP)

- 单人 AI 口语练习闭环
- 职场高频场景题库（20-30 个）
- 语音录制与语音转写
- 场景相关反馈（流利度、准确性、词汇、职场得体度）
- 重点问题定位与替换表达建议
- 二次重练与前后对比
- 历史记录与连续练习天数

### 2.2 Out of Scope (MVP)

- 实时多人语音房间
- 社区互评与公开内容流
- 完整订阅/支付体系
- 复杂发音逐音素打分

## 3. Core Scenarios

MVP 首批场景建议覆盖以下 5 类，每类 4-6 条题目：

1. 自我介绍与背景说明
2. 会议进展同步与周报陈述
3. 提建议、表达异议与礼貌反驳
4. 跨团队协作沟通与需求确认
5. 面试常见问答（行为题、项目复盘）

## 4. User Flow (10-20 min)

1. 选择场景（1-2 分钟）
2. 第一轮语音表达（2-4 分钟）
3. 自动转写 + 结构化反馈（30-90 秒）
4. 查看改进建议（2-4 分钟）
5. 第二轮重练（2-4 分钟）
6. 结果总结与复练计划（1-2 分钟）

## 5. Functional Requirements

### 5.1 P0 Requirements

#### FR-01 场景管理

- 提供 20-30 个预设职场场景
- 每个场景包含：标题、上下文、目标表达点、建议时长

#### FR-02 语音采集

- 支持网页端录音
- 显示录音时长和状态（录制中、已停止、上传中）
- 失败时支持重新录制

#### FR-03 语音转写

- 将音频转写为文本并保留时间戳（至少句级）
- 转写失败给出可恢复提示

#### FR-04 AI 反馈

- 输出维度：
  - Fluency（流利度）
  - Accuracy（语法和表达准确性）
  - Vocabulary（词汇多样性）
  - Professional Tone（职场得体度）
- 每轮反馈至少包含：
  - 3 条具体问题
  - 3 条可直接替换的改写句
  - 1 个下次练习重点

#### FR-05 二次重练对比

- 支持在反馈后立即再次录音
- 展示第一次与第二次改进对比（文本和维度评分变化）

#### FR-06 历史记录

- 可查看最近会话记录
- 每条记录包含场景、转写、反馈摘要、改进建议

#### FR-07 连续练习追踪

- 展示连续练习天数
- 提供中断提醒（轻量）

### 5.2 P1 Requirements (Post MVP)

- 自定义场景输入
- 高频错误词/句库
- 周报式学习总结
- 轻量发音纠错（非逐音素）

## 6. Non-functional Requirements

### 6.1 Performance

- 单次转写 + 反馈等待时间建议 < 12 秒
- 页面首屏可交互时间建议 < 2 秒（常规网络）

### 6.2 Reliability

- 语音上传失败可重试
- 反馈失败可再次生成（同一转写文本）

### 6.3 Privacy

- 音频与转写仅用于本用户学习
- 提供会话删除能力
- 记录数据保留策略可配置（默认保留）

## 7. KPI and Success Criteria

MVP 以“可持续使用”作为第一目标：

- 每周完成会话数 >= 5
- 单次会话完成率 >= 70%
- 二次重练触发率 >= 50%
- 连续 7 天内至少 4 天有练习记录

## 8. Technical Direction (MVP)

### 8.1 Stack

- Frontend: Next.js 15 + TypeScript
- Styling: Tailwind CSS
- Backend: Next.js Route Handlers
- AI: LLM 反馈服务 + Speech-to-Text 服务
- Storage: PostgreSQL (Prisma) 或 Supabase Postgres
- Deployment: Vercel

### 8.2 Minimal Data Model

- User
- Scenario
- PracticeSession
- TranscriptSegment
- FeedbackReport
- RetryAttempt
- DailyStreak

## 9. Milestones (2-4 weeks)

### Week 1

- 完成场景选择 -> 录音 -> 转写基础链路
- 完成会话主流程页面

### Week 2

- 完成结构化反馈生成
- 完成二次重练与前后对比

### Week 3

- 完成历史记录与连续练习追踪
- 完成异常处理和稳定性优化

### Week 4 (Optional Buffer)

- 体验打磨、指标埋点、回归测试
- 输出 V1 功能优先级列表

## 10. Risks and Mitigation

1. 语音转写准确率不稳定
	- 缓解：限制场景语速建议，增加转写后手动修正入口

2. 反馈内容空泛
	- 缓解：固定反馈 JSON 模板 + 场景目标表达点约束

3. API 成本不可控
	- 缓解：限制单次音频时长、分层模型调用策略、缓存重复请求

4. 2-4 周工期压力
	- 缓解：坚持 P0 范围，延后社交和复杂发音功能

## 11. Acceptance Checklist

- 可完成完整会话闭环（场景 -> 录音 -> 转写 -> 反馈 -> 重练）
- 历史记录可回看
- 连续练习天数可计算
- 异常流程可恢复（录音失败/转写失败/反馈失败）
- 用户可在 10-20 分钟内完成单次训练

## 12. Next Step

立即进入实现：

1. 输出技术设计文档（接口、数据结构、模块边界）
2. 生成 MVP 任务清单（按周和按模块）
3. 搭建代码骨架并完成第一条语音转写链路
