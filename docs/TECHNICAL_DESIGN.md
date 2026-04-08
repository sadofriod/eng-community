# English Speaking Coach - Technical Design (MVP)

Last Updated: 2026-04-08

## 1. Implementation Goal

在 2-4 周内实现单人语音口语训练闭环：

1. 场景选择
2. 语音录制
3. 语音转写
4. 结构化反馈
5. 二次重练
6. 历史回看

## 2. Architecture

## 2.1 High-level

- Client: Next.js Web App (App Router)
- API: Next.js Route Handlers
- DB: PostgreSQL + Prisma
- Speech: Speech-to-Text provider
- Feedback: LLM provider

## 2.2 Request Flow

1. 用户创建会话并选择场景
2. 前端上传音频到后端
3. 后端调用语音转写服务并写入转写结果
4. 后端调用 LLM 生成结构化反馈并入库
5. 前端展示反馈并引导二次录音
6. 保存重练结果与对比摘要

## 3. Project Structure Suggestion

- app/
- app/practice/page.tsx
- app/history/page.tsx
- app/api/scenarios/route.ts
- app/api/sessions/route.ts
- app/api/sessions/[id]/transcribe/route.ts
- app/api/sessions/[id]/feedback/route.ts
- app/api/sessions/[id]/retry/route.ts
- app/api/dashboard/route.ts
- lib/db.ts
- lib/ai/transcribe.ts
- lib/ai/feedback.ts
- lib/validation.ts
- prisma/schema.prisma

## 4. API Contracts

## 4.1 Create Session

- Method: POST
- Path: /api/sessions

Request:

```json
{
  "scenarioId": "scn_intro_01"
}
```

Response:

```json
{
  "sessionId": "sess_xxx",
  "status": "CREATED"
}
```

## 4.2 Transcribe Audio

- Method: POST
- Path: /api/sessions/{id}/transcribe
- Body: multipart/form-data (audio)

Response:

```json
{
  "sessionId": "sess_xxx",
  "transcript": "...",
  "segments": [
    { "start": 0.0, "end": 3.2, "text": "..." }
  ]
}
```

## 4.3 Generate Feedback

- Method: POST
- Path: /api/sessions/{id}/feedback

Request:

```json
{
  "transcript": "...",
  "scenarioId": "scn_intro_01"
}
```

Response:

```json
{
  "scores": {
    "fluency": 68,
    "accuracy": 61,
    "vocabulary": 57,
    "professionalTone": 72
  },
  "issues": [
    "...",
    "...",
    "..."
  ],
  "rewrites": [
    {
      "original": "...",
      "improved": "...",
      "why": "..."
    }
  ],
  "nextFocus": "..."
}
```

## 4.4 Retry Attempt

- Method: POST
- Path: /api/sessions/{id}/retry

Request:

```json
{
  "audioRef": "retry-audio-key",
  "transcript": "..."
}
```

Response:

```json
{
  "retryId": "retry_xxx",
  "delta": {
    "fluency": 6,
    "accuracy": 4,
    "vocabulary": 3,
    "professionalTone": 2
  }
}
```

## 4.5 History and Dashboard

- GET /api/sessions?limit=20
- GET /api/dashboard

Dashboard response includes:

- streakDays
- sessionsThisWeek
- retryRate
- topWeaknessTags

## 5. Data Model (Prisma-oriented)

## 5.1 Entities

- User
- Scenario
- PracticeSession
- TranscriptSegment
- FeedbackReport
- RetryAttempt
- DailyStreak

## 5.2 Schema Draft

```prisma
model User {
  id        String   @id @default(cuid())
  email     String?  @unique
  createdAt DateTime @default(now())
  sessions  PracticeSession[]
}

model Scenario {
  id              String   @id
  title           String
  category        String
  prompt          String
  targetPoints    Json
  suggestedMinute Int
  active          Boolean  @default(true)
  createdAt       DateTime @default(now())
}

model PracticeSession {
  id            String   @id @default(cuid())
  userId        String
  scenarioId    String
  status        String
  transcript    String?
  summary       String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  user          User     @relation(fields: [userId], references: [id])
  scenario       Scenario @relation(fields: [scenarioId], references: [id])
  feedbackReport FeedbackReport?
  retries        RetryAttempt[]
}

model FeedbackReport {
  id                 String   @id @default(cuid())
  sessionId          String   @unique
  fluency            Int
  accuracy           Int
  vocabulary         Int
  professionalTone   Int
  issues             Json
  rewrites           Json
  nextFocus          String
  createdAt          DateTime @default(now())

  session            PracticeSession @relation(fields: [sessionId], references: [id])
}

model RetryAttempt {
  id               String   @id @default(cuid())
  sessionId        String
  transcript       String
  deltaFluency     Int
  deltaAccuracy    Int
  deltaVocabulary  Int
  deltaTone        Int
  createdAt        DateTime @default(now())

  session          PracticeSession @relation(fields: [sessionId], references: [id])
}
```

## 6. Prompt Contract for Feedback

LLM 输入必须包含：

- 场景名称与上下文
- 目标表达点（targetPoints）
- 用户转写文本

LLM 输出必须为 JSON，字段固定：

- scores.fluency
- scores.accuracy
- scores.vocabulary
- scores.professionalTone
- issues[3]
- rewrites[3]
- nextFocus

## 7. Error Handling

- 音频为空: 400 INVALID_AUDIO
- 转写失败: 502 TRANSCRIBE_FAILED
- 模型返回非 JSON: 502 INVALID_FEEDBACK_FORMAT
- 会话不存在: 404 SESSION_NOT_FOUND

## 8. Week 1 Build Order

1. 场景接口和本地场景种子
2. 创建会话接口
3. 录音上传和转写接口
4. 练习主页面打通
5. 基础历史列表
