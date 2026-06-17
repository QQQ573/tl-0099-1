# 烟花模拟器 — Easing 公式与参数说明

## 缓动曲线 (Easing Curves)

缓动曲线控制粒子在不同阶段的位置插值方式。输入 `t` 为归一化时间 `[0, 1]`，输出为插值进度值。

### easeOutCubic
```
f(t) = 1 - (1 - t)³
```
**用途**: 升空阶段。粒子初始快速上升，接近顶点时减速，模拟真实烟花弹减速效果。

### easeOutQuart
```
f(t) = 1 - (1 - t)⁴
```
**用途**: 开花扩散。比 easeOutCubic 更急剧的初始爆发，随后迅速趋于平缓，模拟烟花球形展开时先快后慢的扩散感。

### easeInOutQuad
```
f(t) = t < 0.5 ? 2t² : 1 - (-2t + 2)² / 2
```
**用途**: 通用过渡。前半段缓慢加速，后半段缓慢减速，适合需要对称节奏的场景。

### easeOutExpo
```
f(t) = t === 1 ? 1 : 1 - 2^(-10t)
```
**用途**: 拖尾淡出。极速衰减，粒子迅速消散，余辉拖尾短促有力，模拟余光快速熄灭。

### easeInCubic
```
f(t) = t³
```
**用途**: 重力加速下落。从静止开始加速，模拟自由落体运动，用于烟花碎片下落阶段。

---

## 参数说明

### 发射参数 (Launch)

| 参数 | 类型 | 范围 | 默认值 | 说明 |
|------|------|------|--------|------|
| `burstCount` | number | 80–1500 | 300 | 单次开花的粒子数量。数量越多效果越密集，但性能开销越大 |
| `launchHeight` | number | 2–30 | 10 | 烟花升空高度（米）。决定开花点距地面距离 |
| `launchDuration` | number | 0.3–4 | 1.5 | 从发射到开花的时间（秒）。越长升空越慢 |
| `launchInterval` | number | 0.1–3 | 0.8 | 多组烟花发射的间隔秒数 |

### 开花参数 (Burst)

| 参数 | 类型 | 范围 | 默认值 | 说明 |
|------|------|------|--------|------|
| `radius` | number | 1–15 | 5 | 开花球形扩散半径（米）。决定烟花展开范围 |
| `duration` | number | 0.5–5 | 2 | 开花持续时间（秒）。从粒子展开到消散的总时长 |
| `trailLength` | number | 0–20 | 8 | 拖尾长度。控制粒子的视觉余辉长度 |
| `gravity` | number | 0–3 | 0.5 | 重力系数。影响粒子下落加速度，0 为无重力漂浮 |

### 颜色参数 (Color)

| 参数 | 类型 | 范围 | 默认值 | 说明 |
|------|------|------|--------|------|
| `gradient` | [string, string, string] | — | ['#ff0044', '#ffaa00', '#ffff66'] | 三色渐变：[起始色, 中间色, 结束色]。粒子颜色在三者间插值 |
| `hueVariation` | number | 0–1 | 0.1 | 色相随机偏移量。0 为无偏移（统一色），1 为全色相随机 |

### 缓动参数 (Easing)

| 参数 | 类型 | 可选值 | 默认值 | 说明 |
|------|------|--------|--------|------|
| `launchEase` | EasingType | easeOutCubic / easeOutQuart / easeInOutQuad / easeOutExpo / easeInCubic | easeOutCubic | 升空阶段的缓动函数 |
| `burstEase` | EasingType | 同上 | easeOutExpo | 开花扩散的缓动函数 |
| `fadeEase` | EasingType | 同上 | easeInCubic | 消散淡出的缓动函数 |

---

## 预设 JSON 格式

```json
{
  "name": "Preset Name",
  "version": "1.0.0",
  "launch": {
    "burstCount": 300,
    "launchHeight": 10,
    "launchDuration": 1.5,
    "launchInterval": 0.8
  },
  "burst": {
    "radius": 5,
    "duration": 2,
    "trailLength": 8,
    "gravity": 0.5
  },
  "color": {
    "gradient": ["#ff0044", "#ffaa00", "#ffff66"],
    "hueVariation": 0.1
  },
  "easing": {
    "launchEase": "easeOutCubic",
    "burstEase": "easeOutExpo",
    "fadeEase": "easeInCubic"
  }
}
```

### 校验规则

- `burstCount` 必须在 80–1500 范围内
- 所有时长和尺寸必须为正数
- `gradient` 必须是包含 3 个颜色字符串的数组
- `hueVariation` 必须在 0–1 范围内
- `easing` 值必须是预定义的缓动函数名之一

---

## Docker 部署

```bash
docker-compose up -d --build
```

应用将在 `http://localhost:8080` 启动。
