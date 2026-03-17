import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  spring,
  useVideoConfig,
  Sequence,
} from "remotion";

const COLORS = {
  primary: "#FFD700",
  secondary: "#FF6B6B",
  accent: "#4ECDC4",
  lime: "#A8E6CF",
  lavender: "#C3B1E1",
  dark: "#1A1A1A",
  bg: "#FAFAFA",
  white: "#FFFFFF",
};

const FONT = "Space Grotesk, system-ui, sans-serif";

function BrutalCard({
  children,
  bg = COLORS.white,
  style,
}: {
  children: React.ReactNode;
  bg?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        border: "4px solid #000",
        boxShadow: "6px 6px 0 #000",
        background: bg,
        fontFamily: FONT,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// Scene 1: Intro / Logo
function IntroScene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoScale = spring({ frame, fps, config: { damping: 12 } });
  const taglineOpacity = interpolate(frame, [20, 35], [0, 1], { extrapolateRight: "clamp" });
  const badgeSlide = spring({ frame: frame - 10, fps, config: { damping: 15 } });

  return (
    <AbsoluteFill
      style={{
        background: COLORS.bg,
        justifyContent: "center",
        alignItems: "center",
        fontFamily: FONT,
      }}
    >
      {/* Background decorative cards */}
      <div
        style={{
          position: "absolute",
          top: 80,
          left: 120,
          transform: `rotate(-12deg) scale(${badgeSlide})`,
        }}
      >
        <BrutalCard bg={COLORS.primary} style={{ padding: "16px 24px" }}>
          <span style={{ fontSize: 28, fontWeight: 800, textTransform: "uppercase" }}>10 Platforms</span>
        </BrutalCard>
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 120,
          right: 160,
          transform: `rotate(8deg) scale(${badgeSlide})`,
        }}
      >
        <BrutalCard bg={COLORS.accent} style={{ padding: "16px 24px" }}>
          <span style={{ fontSize: 28, fontWeight: 800, textTransform: "uppercase" }}>AI Powered</span>
        </BrutalCard>
      </div>
      <div
        style={{
          position: "absolute",
          top: 160,
          right: 200,
          transform: `rotate(5deg) scale(${badgeSlide})`,
        }}
      >
        <BrutalCard bg={COLORS.lime} style={{ padding: "12px 20px" }}>
          <span style={{ fontSize: 22, fontWeight: 800, textTransform: "uppercase" }}>YouTube</span>
        </BrutalCard>
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 180,
          left: 180,
          transform: `rotate(-5deg) scale(${badgeSlide})`,
        }}
      >
        <BrutalCard bg={COLORS.lavender} style={{ padding: "12px 20px" }}>
          <span style={{ fontSize: 22, fontWeight: 800, textTransform: "uppercase" }}>Voice Learning</span>
        </BrutalCard>
      </div>

      {/* Main Logo */}
      <div style={{ transform: `scale(${logoScale})`, textAlign: "center" }}>
        <h1
          style={{
            fontSize: 120,
            fontWeight: 900,
            textTransform: "uppercase",
            letterSpacing: -3,
            margin: 0,
            lineHeight: 1,
          }}
        >
          Repurpose<span style={{ color: COLORS.secondary }}>AI</span>
        </h1>
        <p
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: "#999",
            marginTop: 8,
            opacity: taglineOpacity,
          }}
        >
          by CreativeSync
        </p>
        <p
          style={{
            fontSize: 36,
            fontWeight: 700,
            color: COLORS.dark,
            opacity: taglineOpacity,
            marginTop: 24,
          }}
        >
          One Input. Endless Outputs.
        </p>
      </div>
    </AbsoluteFill>
  );
}

// Scene 2: Step 1 - Paste Content
function PasteScene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cardScale = spring({ frame, fps, config: { damping: 12 } });
  const typingProgress = interpolate(frame, [15, 75], [0, 1], { extrapolateRight: "clamp" });

  const fullText =
    "The future of content creation is here. AI is transforming how creators work, enabling them to reach audiences on every platform...";
  const visibleText = fullText.slice(0, Math.floor(fullText.length * typingProgress));

  const cursorOpacity = Math.sin(frame * 0.3) > 0 ? 1 : 0;

  return (
    <AbsoluteFill
      style={{
        background: COLORS.bg,
        justifyContent: "center",
        alignItems: "center",
        fontFamily: FONT,
        padding: 80,
      }}
    >
      {/* Step badge */}
      <div style={{ position: "absolute", top: 60, left: 80, transform: `scale(${cardScale})` }}>
        <BrutalCard bg={COLORS.primary} style={{ padding: "12px 24px" }}>
          <span style={{ fontSize: 24, fontWeight: 800, textTransform: "uppercase" }}>
            Step 1: Upload
          </span>
        </BrutalCard>
      </div>

      {/* Content input mockup */}
      <div style={{ width: 1200, transform: `scale(${cardScale})` }}>
        <BrutalCard style={{ padding: 40 }}>
          {/* Input tabs */}
          <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
            {["Paste Text", "Import URL", "Upload File"].map((tab, i) => (
              <BrutalCard
                key={tab}
                bg={i === 0 ? COLORS.primary : COLORS.white}
                style={{ padding: "10px 20px" }}
              >
                <span style={{ fontSize: 18, fontWeight: 700 }}>{tab}</span>
              </BrutalCard>
            ))}
          </div>

          {/* Textarea mockup */}
          <div
            style={{
              border: "3px solid #000",
              padding: 24,
              minHeight: 300,
              background: COLORS.white,
              fontSize: 22,
              lineHeight: 1.6,
              fontWeight: 500,
              color: COLORS.dark,
            }}
          >
            {visibleText}
            <span style={{ opacity: cursorOpacity, color: COLORS.secondary }}>|</span>
          </div>

          {/* Word count */}
          <div style={{ marginTop: 12, fontSize: 16, color: "#999", fontWeight: 600 }}>
            {visibleText.length} characters | {visibleText.split(" ").filter(Boolean).length} words
          </div>
        </BrutalCard>
      </div>
    </AbsoluteFill>
  );
}

// Scene 3: AI Processing
function ProcessingScene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const platforms = [
    { name: "Twitter/X", icon: "X", color: COLORS.dark },
    { name: "LinkedIn", icon: "in", color: "#0A66C2" },
    { name: "Instagram", icon: "IG", color: "#E4405F" },
    { name: "TikTok", icon: "TT", color: COLORS.dark },
    { name: "Email", icon: "@", color: COLORS.accent },
    { name: "YouTube", icon: "YT", color: "#FF0000" },
    { name: "Reddit", icon: "R", color: "#FF4500" },
    { name: "Threads", icon: "Th", color: COLORS.dark },
    { name: "Blog", icon: "B", color: COLORS.lavender },
    { name: "Carousel", icon: "C", color: COLORS.lime },
  ];

  const centerPulse = Math.sin(frame * 0.15) * 0.05 + 1;
  const spinAngle = interpolate(frame, [0, 90], [0, 360]);

  return (
    <AbsoluteFill
      style={{
        background: COLORS.dark,
        justifyContent: "center",
        alignItems: "center",
        fontFamily: FONT,
      }}
    >
      {/* Step badge */}
      <div style={{ position: "absolute", top: 60, left: 80 }}>
        <BrutalCard bg={COLORS.secondary} style={{ padding: "12px 24px" }}>
          <span style={{ fontSize: 24, fontWeight: 800, textTransform: "uppercase", color: "#fff" }}>
            Step 2: AI Transform
          </span>
        </BrutalCard>
      </div>

      {/* Center AI badge */}
      <div style={{ transform: `scale(${centerPulse})`, position: "relative" }}>
        <BrutalCard bg={COLORS.primary} style={{ padding: "30px 50px", borderRadius: 0 }}>
          <span style={{ fontSize: 48, fontWeight: 900, textTransform: "uppercase" }}>AI</span>
        </BrutalCard>

        {/* Spinning ring indicator */}
        <div
          style={{
            position: "absolute",
            top: -40,
            left: -40,
            right: -40,
            bottom: -40,
            border: "4px dashed rgba(255,255,255,0.3)",
            transform: `rotate(${spinAngle}deg)`,
          }}
        />
      </div>

      {/* Platform icons around */}
      {platforms.map((p, i) => {
        const angle = (i / platforms.length) * Math.PI * 2 - Math.PI / 2;
        const radius = 350;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        const delay = i * 4;
        const platformScale = spring({ frame: frame - delay, fps, config: { damping: 10 } });

        return (
          <div
            key={p.name}
            style={{
              position: "absolute",
              left: `calc(50% + ${x}px)`,
              top: `calc(50% + ${y}px)`,
              transform: `translate(-50%, -50%) scale(${platformScale})`,
            }}
          >
            <BrutalCard bg={COLORS.white} style={{ padding: "14px 20px", textAlign: "center" as const }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: p.color }}>{p.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 700, marginTop: 4, textTransform: "uppercase" as const }}>
                {p.name}
              </div>
            </BrutalCard>
          </div>
        );
      })}
    </AbsoluteFill>
  );
}

// Scene 4: Results / Output
function ResultsScene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const outputs = [
    { platform: "Twitter/X", text: "The future of content is AI-powered. Creators who adapt now will dominate every platform.", color: COLORS.primary },
    { platform: "LinkedIn", text: "3 insights on the future of AI in content creation: 1. Multi-platform is non-negotiable...", color: "#0A66C2" },
    { platform: "Instagram", text: "AI + Creativity = Unlimited Content. Swipe for the full breakdown.", color: "#E4405F" },
  ];

  return (
    <AbsoluteFill
      style={{
        background: COLORS.bg,
        fontFamily: FONT,
        padding: 80,
        justifyContent: "center",
      }}
    >
      {/* Step badge */}
      <div style={{ position: "absolute", top: 60, left: 80 }}>
        <BrutalCard bg={COLORS.accent} style={{ padding: "12px 24px" }}>
          <span style={{ fontSize: 24, fontWeight: 800, textTransform: "uppercase" }}>
            Step 3: Share & Export
          </span>
        </BrutalCard>
      </div>

      {/* Output cards */}
      <div style={{ display: "flex", gap: 32, justifyContent: "center", marginTop: 40 }}>
        {outputs.map((out, i) => {
          const delay = i * 8;
          const cardSpring = spring({ frame: frame - delay, fps, config: { damping: 12 } });
          const rotation = (i - 1) * 3;

          return (
            <div
              key={out.platform}
              style={{
                transform: `scale(${cardSpring}) rotate(${rotation}deg)`,
                width: 380,
              }}
            >
              <BrutalCard style={{ padding: 32 }}>
                {/* Platform header */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                  <div
                    style={{
                      border: "3px solid #000",
                      background: out.color,
                      width: 44,
                      height: 44,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 900,
                      fontSize: 16,
                      color: out.color === COLORS.primary ? "#000" : "#fff",
                    }}
                  >
                    {out.platform.slice(0, 2).toUpperCase()}
                  </div>
                  <span style={{ fontSize: 22, fontWeight: 800, textTransform: "uppercase" as const }}>
                    {out.platform}
                  </span>
                </div>

                {/* Content */}
                <p style={{ fontSize: 18, lineHeight: 1.5, fontWeight: 500, color: "#333", margin: 0 }}>
                  {out.text}
                </p>

                {/* Action buttons */}
                <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                  <BrutalCard bg={COLORS.accent} style={{ padding: "8px 16px" }}>
                    <span style={{ fontSize: 14, fontWeight: 700 }}>Share</span>
                  </BrutalCard>
                  <BrutalCard bg={COLORS.lime} style={{ padding: "8px 16px" }}>
                    <span style={{ fontSize: 14, fontWeight: 700 }}>Copy</span>
                  </BrutalCard>
                  <BrutalCard bg={COLORS.lavender} style={{ padding: "8px 16px" }}>
                    <span style={{ fontSize: 14, fontWeight: 700 }}>AI Image</span>
                  </BrutalCard>
                </div>
              </BrutalCard>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
}

// Scene 5: CTA
function CTAScene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({ frame, fps, config: { damping: 12 } });
  const btnScale = spring({ frame: frame - 20, fps, config: { damping: 10 } });

  return (
    <AbsoluteFill
      style={{
        background: COLORS.dark,
        justifyContent: "center",
        alignItems: "center",
        fontFamily: FONT,
      }}
    >
      <div style={{ textAlign: "center", transform: `scale(${scale})` }}>
        <h2
          style={{
            fontSize: 90,
            fontWeight: 900,
            textTransform: "uppercase",
            color: COLORS.white,
            margin: 0,
            lineHeight: 1.1,
          }}
        >
          Start <span style={{ color: COLORS.primary }}>Free</span>
          <br />
          Today.
        </h2>
        <div style={{ marginTop: 40, transform: `scale(${btnScale})` }}>
          <BrutalCard bg={COLORS.primary} style={{ padding: "20px 60px", display: "inline-block" }}>
            <span style={{ fontSize: 32, fontWeight: 800, textTransform: "uppercase" }}>
              repurpose-ai.app &rarr;
            </span>
          </BrutalCard>
        </div>
        <p style={{ color: "#666", fontSize: 18, fontWeight: 600, marginTop: 24 }}>
          by CreativeSync
        </p>
      </div>
    </AbsoluteFill>
  );
}

// Main composition
export const DemoVideo: React.FC = () => {
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={90}>
        <IntroScene />
      </Sequence>
      <Sequence from={90} durationInFrames={90}>
        <PasteScene />
      </Sequence>
      <Sequence from={180} durationInFrames={90}>
        <ProcessingScene />
      </Sequence>
      <Sequence from={270} durationInFrames={90}>
        <ResultsScene />
      </Sequence>
      <Sequence from={360} durationInFrames={90}>
        <CTAScene />
      </Sequence>
    </AbsoluteFill>
  );
};
