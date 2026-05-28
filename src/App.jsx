import { useEffect, useMemo, useRef, useState } from "react";
import { DENOMINATIONS, SUGGESTIONS } from "./lib/constants";
import { parseAssistantResponse } from "./lib/response";
import { createChristianArtDataUrl } from "./lib/visuals";

const DEFAULT_DENOMINATION = "Protestant";

function formatText(content) {
  const parts = content.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }

    return <span key={index}>{part}</span>;
  });
}

function ScriptureBlock({ verse, reference }) {
  return (
    <div className="scripture-card">
      <p className="scripture-verse">"{verse}"</p>
      <span className="scripture-ref">— {reference}</span>
    </div>
  );
}

function ImageBlock({ prompt }) {
  const [status, setStatus] = useState("loading");
  const [useLocalFallback, setUseLocalFallback] = useState(false);
  const imageUrl = useMemo(() => {
    const safePrompt = `Christian sacred religious art: ${prompt}, reverent, beautiful, cinematic, soft natural light, highly detailed`;
    return `https://image.pollinations.ai/prompt/${encodeURIComponent(safePrompt)}?width=640&height=640&nologo=true`;
  }, [prompt]);
  const fallbackUrl = useMemo(() => createChristianArtDataUrl(prompt, 640, 640), [prompt]);
  const activeUrl = useLocalFallback ? fallbackUrl : imageUrl;

  return (
    <div className="image-block">
      {status === "loading" && (
        <div className="image-loading">
          <span className="spinner">⟳</span>
          Generating Christian image...
        </div>
      )}
      <img
        src={activeUrl}
        alt="Christian AI generated artwork"
        onLoad={() => setStatus("done")}
        onError={() => {
          if (!useLocalFallback) {
            setUseLocalFallback(true);
            setStatus("loading");
            return;
          }
          setStatus("done");
        }}
        className={status === "done" ? "image-result" : "image-hidden"}
      />
      {status === "error" && <div className="image-error">Image generation unavailable. Please try a simpler, safer prompt.</div>}
    </div>
  );
}

function DemoVideo() {
  const [ready, setReady] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 960;
    canvas.height = 540;

    const context = canvas.getContext("2d");
    if (!context || typeof canvas.captureStream !== "function") {
      setReady(true);
      return undefined;
    }

    const stream = canvas.captureStream(30);
    let rafId = 0;
    const start = performance.now();
    const duration = 4200;

    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(() => {});
    }

    const drawFrame = (timestamp) => {
      const progress = Math.min((timestamp - start) / duration, 1);
      const width = canvas.width;
      const height = canvas.height;

      const gradient = context.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, "#19140f");
      gradient.addColorStop(0.48, "#5f4320");
      gradient.addColorStop(1, "#e3cfa7");
      context.fillStyle = gradient;
      context.fillRect(0, 0, width, height);

      context.fillStyle = "rgba(255, 247, 231, 0.08)";
      for (let index = 0; index < 32; index += 1) {
        const x = (index * 73 + progress * 180) % width;
        const y = (index * 41 + progress * 120) % height;
        context.beginPath();
        context.arc(x, y, 3 + (index % 4), 0, Math.PI * 2);
        context.fill();
      }

      context.save();
      context.translate(width / 2, height / 2 - 16);
      context.strokeStyle = "#f6ead0";
      context.shadowColor = "rgba(255, 241, 212, 0.65)";
      context.shadowBlur = 24;
      context.lineCap = "round";
      context.lineWidth = 14;
      context.beginPath();
      context.moveTo(0, -130);
      context.lineTo(0, 120);
      context.stroke();
      context.beginPath();
      context.moveTo(-68, -12);
      context.lineTo(68, -12);
      context.stroke();
      context.restore();

      context.fillStyle = "rgba(255, 246, 225, 0.95)";
      context.textAlign = "center";
      context.font = "700 42px Georgia, serif";
      context.fillText("Christian AI Assistant", width / 2, 112);
      context.font = "500 22px 'Source Sans 3', sans-serif";
      context.fillText("scripture-grounded · denomination-aware · moderated", width / 2, 152);

      const barWidth = 520;
      const barHeight = 12;
      const barX = (width - barWidth) / 2;
      const barY = height - 88;
      context.fillStyle = "rgba(255,255,255,0.18)";
      context.fillRect(barX, barY, barWidth, barHeight);
      context.fillStyle = "#f5d9a4";
      context.fillRect(barX, barY, barWidth * progress, barHeight);

      context.fillStyle = "rgba(255, 246, 225, 0.82)";
      context.font = "500 18px 'Source Sans 3', sans-serif";
      context.fillText("Built for grounded answers and safe Christian image generation", width / 2, height - 52);

      if (!ready) setReady(true);
      rafId = requestAnimationFrame(drawFrame);
    };

    rafId = requestAnimationFrame(drawFrame);

    return () => {
      cancelAnimationFrame(rafId);
      stream.getTracks().forEach((track) => track.stop());
    };
  }, []);

  return (
    <div className="demo-video-shell">
      {!ready && <div className="demo-video-loading">Generating local walkthrough clip...</div>}
      <video ref={videoRef} controls muted autoPlay loop playsInline className="demo-video-element" />
    </div>
  );
}

function Message({ message }) {
  if (message.role === "user") {
    return (
      <div className="message-row user-row">
        <div className="user-bubble">{message.content}</div>
      </div>
    );
  }

  const parsed = parseAssistantResponse(message.content);

  return (
    <div className="message-row assistant-row">
      <div className="assistant-avatar">✝</div>
      <div className="assistant-column">
        <div className="assistant-chrome">
          <span className="assistant-label">Christian AI</span>
          <span className="assistant-badge">Grounded response</span>
        </div>
        {parsed.isFlagged && <div className="moderation-badge">🛡 Content moderated</div>}
        <div className="assistant-bubble">
          {parsed.blocks.map((block, index) =>
            block.type === "scripture" ? (
              <ScriptureBlock key={index} verse={block.verse} reference={block.ref} />
            ) : (
              <p className="text-block" key={index}>
                {formatText(block.content)}
              </p>
            )
          )}
          {parsed.imagePrompt && <ImageBlock prompt={parsed.imagePrompt} />}
        </div>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="message-row assistant-row">
      <div className="assistant-avatar">✝</div>
      <div className="assistant-column">
        <div className="assistant-bubble typing-bubble">
          <span className="typing-dot" />
          <span className="typing-dot" />
          <span className="typing-dot" />
        </div>
      </div>
    </div>
  );
}

function localEndpoint() {
  const baseUrl =
    import.meta.env.VITE_API_BASE_URL ||
    "https://christian-ai-assistant.onrender.com";
  return `${baseUrl}/api/chat`;
}

export default function App() {
  const [denomination, setDenomination] = useState(DEFAULT_DENOMINATION);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  const featuredMedia = useMemo(
    () => [
      {
        type: "image",
        title: "Nativity",
        prompt: "a peaceful nativity scene with candlelight, reverent faces, warm gold and blue tones, painterly detail",
        caption: "Christian image generation via Pollinations"
      },
      {
        type: "image",
        title: "Stained Glass",
        prompt: "a radiant stained glass window with a cross, doves, sunlight, sacred church atmosphere, ornate detail",
        caption: "Safe sacred-art style prompt"
      },
      {
        type: "video",
        title: "Walkthrough Reel",
        caption: "Short product demo clip"
      }
    ],
    []
  );

  const quickReplies = useMemo(
    () => [
      "Explain the Holy Trinity simply",
      "What does John 3:16 mean?",
      "Generate a reverent church image",
      "Catholic vs Protestant view on salvation"
    ],
    []
  );

  useEffect(() => {
    if (messages.length > 0 || loading) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  async function sendMessage(text) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const nextMessages = [...messages, { role: "user", content: trimmed }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch(localEndpoint(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          denomination,
          messages: nextMessages
        })
      });

      const data = await response.json();
      const reply = data.reply || "I'm sorry, I couldn't generate a response.";
      setMessages((current) => [...current, { role: "assistant", content: reply }]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: "A connection error occurred. Please try again."
        }
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage(input);
    }
  }

  const showWelcome = messages.length === 0;

  return (
    <div className="app-shell">
      <div className="app-frame">
        <header className="top-bar">
          <div className="brand-group">
            <div className="brand-mark">✝</div>
            <div>
              <div className="brand-title">Christian AI Assistant</div>
              <div className="brand-subtitle">Scripture-grounded · Denomination-aware · Moderated</div>
            </div>
          </div>
          <div className="header-actions">
            <div className="status-pill">Live demo</div>
            <div className="status-chip">Render + Vercel</div>
          </div>
        </header>

        <section className="summary-strip">
          <div className="summary-item">
            <span className="summary-kicker">Grounding</span>
            <strong>Real verses only</strong>
          </div>
          <div className="summary-item">
            <span className="summary-kicker">Safety</span>
            <strong>Moderation-first replies</strong>
          </div>
          <div className="summary-item">
            <span className="summary-kicker">Images</span>
            <strong>Christian art generation</strong>
          </div>
          <div className="summary-item">
            <span className="summary-kicker">Context</span>
            <strong>{denomination} theology mode</strong>
          </div>
        </section>

        <section className="denomination-bar">
          <span className="bar-label">Tradition</span>
          <div className="denomination-pills">
            {DENOMINATIONS.map((item) => (
              <button
                key={item}
                className={`denom-pill ${denomination === item ? "active" : ""}`}
                onClick={() => setDenomination(item)}
                type="button"
              >
                {item}
              </button>
            ))}
          </div>
        </section>

        <main className="chat-area">
          {showWelcome && (
            <section className="welcome-panel">
              <div className="welcome-copy">
                <div className="welcome-kicker">Faithful by design</div>
                <div className="welcome-symbol">✝</div>
                <h1>Ask about Scripture with clarity and reverence</h1>
                <p>
                  This assistant keeps answers Biblically grounded, distinguishes
                  Christian traditions, and refuses harmful or fabricated religious output.
                </p>

                <div className="welcome-actions">
                  <button type="button" className="primary-cta" onClick={() => sendMessage("Explain the Holy Trinity in simple terms")}>
                    Start with theology
                  </button>
                  <button type="button" className="secondary-cta" onClick={() => sendMessage("Generate a reverent nativity scene image")}>
                    Try image generation
                  </button>
                </div>

                <div className="welcome-highlights">
                  <div className="highlight-card">
                    <span className="highlight-label">Grounded</span>
                    <strong>Real verse citations only</strong>
                    <p>Fake references are corrected instead of repeated.</p>
                  </div>
                  <div className="highlight-card">
                    <span className="highlight-label">Safe</span>
                    <strong>Moderation built in</strong>
                    <p>Harmful or adversarial religious prompts are refused gracefully.</p>
                  </div>
                  <div className="highlight-card">
                    <span className="highlight-label">Multimodal</span>
                    <strong>Christian image generation</strong>
                    <p>Safe visual prompts can generate reverent artwork on demand.</p>
                  </div>
                </div>
              </div>

              <div className="welcome-showcase">
                <div className="showcase-card showcase-hero">
                  <div className="showcase-tag">Featured demos</div>
                  <div className="media-showcase">
                    {featuredMedia.map((item) =>
                      item.type === "image" ? (
                        <article key={item.title} className="media-card">
                          <div className="media-frame">
                            <img
                              src={createChristianArtDataUrl(item.prompt, 520, 360)}
                              alt={item.title}
                            />
                          </div>
                          <div className="media-meta">
                            <strong>{item.title}</strong>
                            <span>{item.caption}</span>
                          </div>
                        </article>
                      ) : (
                        <article key={item.title} className="media-card">
                          <div className="media-frame media-video">
                            <DemoVideo />
                          </div>
                          <div className="media-meta">
                            <strong>{item.title}</strong>
                            <span>{item.caption}</span>
                          </div>
                        </article>
                      )
                    )}
                  </div>
                </div>

                <div className="showcase-card quick-panel">
                  <div className="quick-panel-header">
                    <strong>Quick prompts</strong>
                    <span>Tap to demo the assistant</span>
                  </div>
                  <div className="suggestion-grid compact">
                    {quickReplies.map((suggestion) => (
                      <button key={suggestion} type="button" className="suggestion-chip" onClick={() => sendMessage(suggestion)}>
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}

          {messages.map((message, index) => (
            <Message key={index} message={message} />
          ))}

          {loading && <TypingIndicator />}
          <div ref={bottomRef} />
        </main>

        <footer className="composer">
          <div className="composer-shell">
            <div className="composer-meta">
              <span className="composer-label">Conversation</span>
              <span className="composer-help">Press Enter to send, Shift+Enter for a new line</span>
            </div>
            <div className="composer-row">
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a question or say 'Generate an image of...'"
                rows={1}
                className="composer-input"
              />
              <button type="button" className="send-button" onClick={() => sendMessage(input)} disabled={!input.trim() || loading}>
                ↑
              </button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
