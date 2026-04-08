# English Speaking Coach - MVP Tasks

Last Updated: 2026-04-08

## Week 1: Core Loop Skeleton

- [ ] 初始化应用骨架（Next.js + TypeScript + Prisma）
- [ ] 建立场景种子数据与场景读取接口
- [ ] 完成会话创建接口
- [ ] 完成前端录音组件（录制/停止/重录）
- [ ] 完成音频上传与转写接口
- [ ] 打通练习页首轮闭环

Definition of Done:

- 能从场景选择进入练习并得到可展示的转写文本

## Week 2: Feedback and Retry

- [ ] 实现反馈生成接口（结构化 JSON 输出）
- [ ] 完成反馈展示卡片（问题、改写、下次重点）
- [ ] 实现二次重练接口
- [ ] 完成前后对比视图
- [ ] 增加失败重试机制（转写失败/反馈失败）

Definition of Done:

- 用户可在同一会话内完成反馈后重练并看到变化

## Week 3: History and Consistency

- [ ] 完成历史会话列表页
- [ ] 完成会话详情页（转写 + 反馈 + 重练记录）
- [ ] 完成连续练习统计
- [ ] 完成基础日志与埋点
- [ ] 完成端到端回归测试清单

Definition of Done:

- 连续 3 天可稳定使用且历史数据一致

## Week 4: Polish and Release

- [ ] 优化性能（转写与反馈链路）
- [ ] 文案和交互细节优化
- [ ] 完成发布前验收
- [ ] 输出 V1 增强需求列表

Definition of Done:

- 满足 PRD 验收清单并可持续日常使用

## Module Checklist

## Frontend

- [ ] 练习页
- [ ] 反馈卡片
- [ ] 历史页
- [ ] 连续练习组件

## Backend

- [ ] sessions API
- [ ] transcribe API
- [ ] feedback API
- [ ] retry API
- [ ] dashboard API

## Data

- [ ] Prisma schema
- [ ] migration
- [ ] scenario seed

## Quality

- [ ] 错误码统一
- [ ] 超时与重试策略
- [ ] 冒烟测试
