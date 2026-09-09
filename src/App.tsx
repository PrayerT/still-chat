import { english, type Language } from './copy';
import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowDown, ArrowUp, ArrowUpRight, Bookmark, Check, CircleHelp, Coffee, Headphones, Leaf, Menu, MessageCircle, Moon, RotateCcw, Sparkles, Sun, X } from "lucide-react";
type Message = { id: number; role: "you" | "companion"; text: string };
type Character = "xiaoman" | "luyu";
export default function Home({ language = 'zh' }: { language?: Language } = {}) {
const tr = (value: string) => language === 'en' ? (english[value] ?? value) : value;
const people = {
  xiaoman: { name: tr("小满"), initial: tr("满"), line: tr("写点字，也听你说。"), tags: [tr("慢热的倾听者"), tr("喜欢海边")], place: tr("海边的咖啡馆"), reply: tr("那就先把那些‘应该做的事’放一放。窗外的海还在，咖啡也可以慢慢喝。\n\n今天有没有一个很小的瞬间，让你觉得还不错？"), opening: tr("今天有点累，什么都不想做。") },
  luyu: { name: tr("陆屿"), initial: tr("屿"), line: tr("走一小段路，聊一点日常。"), tags: [tr("温和的同行者"), tr("收集旧唱片")], place: tr("雨后的林间小屋"), reply: tr("那今晚就走慢一点吧。刚才雨停了，树叶上还挂着水珠。\n\n不必把一天都解释清楚，挑一件想说的小事就好。"), opening: tr("想找个安静的地方待一会儿。") },
};
function initialMessages(id: Character): Message[] { return [{ id: 1, role: "you", text: people[id].opening }, { id: 2, role: "companion", text: people[id].reply }]; }
const prompts = [tr("说说今天的小事"), tr("陪我安静一会儿"), tr("换个轻松的话题")];
const replies = [tr("好，我们从一件小事说起。\n\n比如路上看到的一棵树，或者午饭里最好吃的那一口。你想先说哪件？"), tr("好，那就不用急着找话题。\n\n把肩膀放松一点，看看窗外。等你想说的时候，再写下来就好。"), tr("那来聊个轻松的：如果明天可以随意去一个地方，你会选山里、海边，还是熟悉的小街？")];

  const [character, setCharacter] = useState<Character>("xiaoman");
  const [mode, setMode] = useState<"quiet" | "immersive">("quiet");
  const [messages, setMessages] = useState<Message[]>(initialMessages("xiaoman"));
  const [conversations, setConversations] = useState<Record<Character, Message[]>>({ xiaoman: initialMessages("xiaoman"), luyu: initialMessages("luyu") });
  const [text, setText] = useState(""); const [typing, setTyping] = useState(false);
  const [saved, setSaved] = useState<{ key: string; name: string; text: string }[]>([]);
  const [dialog, setDialog] = useState<"about" | "saved" | "reset" | null>(null);
  const [menuOpen, setMenuOpen] = useState(false); const [sound, setSound] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [showJump, setShowJump] = useState(false); const [notice, setNotice] = useState("");
  const logRef = useRef<HTMLDivElement>(null); const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null); const modalRef = useRef<HTMLDialogElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const audio = useRef<AudioContext | null>(null); const p = people[character];
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "end" }); }, [messages, typing]);
  useEffect(() => { if (dialog) modalRef.current?.showModal(); else modalRef.current?.close(); }, [dialog]);
  useEffect(() => { if (!notice) return; const t = setTimeout(() => setNotice(""), 2600); return () => clearTimeout(t); }, [notice]);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); void audio.current?.close(); }, []);
  useEffect(() => { const mq = window.matchMedia("(max-width: 640px)"); const update = () => setMobile(mq.matches); update(); mq.addEventListener("change", update); return () => mq.removeEventListener("change", update); }, []);
  useEffect(() => { const close = (e: KeyboardEvent) => { if (e.key === "Escape") setMenuOpen(false); }; window.addEventListener("keydown", close); return () => window.removeEventListener("keydown", close); }, []);
  function choose(id: Character) { if (typing || id === character) { setMenuOpen(false); return; } setConversations(prev => ({ ...prev, [character]: messages })); setMessages(conversations[id]); setCharacter(id); setText(""); setMenuOpen(false); }
  function send(value: string) {
    const content = value.trim(); if (!content || typing) return;
    setMessages(prev => [...prev, { id: Date.now(), role: "you", text: content.slice(0, 1000) }]); setText(""); setTyping(true);
    if (inputRef.current) inputRef.current.style.height = "auto";
    const i = prompts.indexOf(content);
    timer.current = setTimeout(() => { setMessages(prev => [...prev, { id: Date.now(), role: "companion", text: i >= 0 ? replies[i] : tr("这里先展示一段预设回应，方便你体验聊天的节奏与排版。\n\n如果想继续试试，可以点下方的话题，或者切换右上角的‘入境’，看看另一种阅读氛围。") }]); setTyping(false); timer.current = null; }, 1000);
  }
  function submit(e: FormEvent) { e.preventDefault(); send(text); }
  function save(m: Message) { const key = `${character}-${m.id}`; if (saved.some(s => s.key === key)) { setSaved(prev => prev.filter(s => s.key !== key)); setNotice(tr("已取消收藏")); } else { setSaved(prev => [...prev, { key, name: p.name, text: m.text }]); setNotice(tr("收进我们的片段了")); } }
  async function toggleSound() { try { if (sound) { await audio.current?.suspend(); setSound(false); return; } if (!audio.current) { const ctx = new AudioContext(); const buffer = ctx.createBuffer(1, ctx.sampleRate * 3, ctx.sampleRate); const data = buffer.getChannelData(0); let last = 0; for (let i = 0; i < data.length; i++) { last = (last + (Math.random() * 2 - 1) * 0.02) / 1.02; data[i] = last * 3.5; } const source = ctx.createBufferSource(); source.buffer = buffer; source.loop = true; const filter = ctx.createBiquadFilter(); filter.type = "lowpass"; filter.frequency.value = 550; const gain = ctx.createGain(); gain.gain.value = 0.1; source.connect(filter); filter.connect(gain); gain.connect(ctx.destination); source.start(); audio.current = ctx; } await audio.current.resume(); setSound(true); } catch { setNotice(tr("浏览器暂时无法播放环境声，请检查声音权限")); } }
  return <div lang={language === "en" ? "en" : "zh-CN"} className={`app ${mode} ${character} lang-${language}`}>
    {menuOpen && <button className="sidebar-backdrop" aria-label={tr("关闭导航")} onClick={() => setMenuOpen(false)} />}
    <aside className={`sidebar ${menuOpen ? "open" : ""}`} inert={mobile && !menuOpen}>
      <a className="brand" href="/" aria-label={tr("STILL 首页")}>still<span>·</span><small>{tr("慢一点，听你说")}</small></a>
      <button className="mobile-close icon-button" aria-label={tr("关闭导航")} onClick={() => setMenuOpen(false)}><X size={20} /></button>
      <div className="side-section-label">{tr("留一点时间，给自己")}</div>
      <button className="nav-item active" onClick={() => { setDialog(null); setMenuOpen(false); }}><MessageCircle size={18} />{tr("此刻的对话")}<span className="nav-dot" /></button>
      <button className="nav-item" onClick={() => { setDialog("saved"); setMenuOpen(false); }}><Bookmark size={18} />{tr("我们的片段")}{saved.length > 0 && <span className="count">{saved.length}</span>}</button>
      <div className="side-section-label companions-label">{tr("熟悉的声音")}<span>02</span></div>
      {(Object.keys(people) as Character[]).map(id => <button key={id} className={`person ${character === id ? "selected" : ""}`} onClick={() => choose(id)} disabled={typing && id !== character}><span className={`avatar ${id}`}>{id === "xiaoman" ? <img src="/avatar.webp" width="80" height="120" alt="" decoding="async" /> : <Leaf size={21} />}</span><span><strong>{people[id].name}</strong><small>{id === "xiaoman" ? tr("海边的咖啡还温着") : tr("下过雨的路，很好走")}</small></span>{character === id && <span className="person-indicator" />}</button>)}
      <div className="side-note"><span className="small-star">✳</span><p>{tr("不用每一天")}<br />{tr("都过得很有意义。")}</p><small>{tr("有些时候，待着就很好。")}</small></div>
      <div className="sidebar-bottom"><div className="guest-mark">{tr("你")}</div><div><strong>{tr("这一刻的你")}</strong><small>{tr("把今天放轻一点")}</small></div><button className="icon-button" onClick={() => setDialog("about")} aria-label={tr("关于这个演示")}><CircleHelp size={18} /></button></div>
    </aside>
    <main className="main">
      <header className="topbar"><div className="breadcrumb"><button className="mobile-menu icon-button" aria-label={tr("展开导航")} onClick={() => setMenuOpen(true)}><Menu size={20} /></button><span>{tr("此刻")}</span><span className="slash">/</span><strong>{tr("与")}{p.name}{tr("的对话")}</strong></div><div className="top-actions"><a className="language-switch" href={language === "en" ? "/" : "/en/"} hrefLang={language === "en" ? "zh-CN" : "en"} aria-label={language === "en" ? "切换到中文" : "Switch to English"} onClick={e => { if ((messages.length > 2 || saved.length > 0 || text.trim()) && !window.confirm(language === "en" ? "Switch language? This starts a new demo session." : "切换语言会开始新的演示，是否继续？")) e.preventDefault(); }}>{language === "en" ? "中文" : "EN"}</a><div className="view-switch" role="group" aria-label={tr("聊天布局")}><button className={mode === "quiet" ? "selected" : ""} onClick={() => setMode("quiet")} aria-pressed={mode === "quiet"}><Sun size={14} />{tr("留白")}</button><button className={mode === "immersive" ? "selected" : ""} onClick={() => setMode("immersive")} aria-pressed={mode === "immersive"}><Moon size={14} />{tr("入境")}</button></div><span className="demo-badge">{tr("交互样例")}</span></div></header>
      <div className="workspace">
        <section className="scene-panel" aria-label={language === "en" ? `${p.name} — scene` : `${p.name}的场景介绍`}>{character === "xiaoman" ? <picture className="scene-image"><source media="(max-width: 640px)" srcSet="/scene-480.webp" /><img src="/scene-960.webp" alt="" width="960" height="1440" fetchPriority="high" decoding="async" /></picture> : <div className="scene-image" />}<div className="scene-shade" /><div className="scene-top"><span><span className="scene-dot" />{tr("此刻，慢慢来")}</span><span>{tr("章节")} {character === "xiaoman" ? "01" : "02"}</span></div><div className="scene-caption"><span className="scene-eyebrow">{tr("为你留一点空间")}</span><h1>{p.name}<span>·</span></h1><p>{p.line}</p><div className="scene-tags">{p.tags.map(t => <span key={t}>{t}</span>)}</div><div className="scene-line" /><div className="scene-location"><span><Coffee size={14} />{p.place}</span><span>18:42 <Sun size={14} /></span></div></div></section>
        <section className="conversation" aria-label={tr("聊天")}>
          <div className="conversation-heading"><div><span className="eyebrow">{tr("只在你我之间")}</span><h2>{tr("今天，想从哪里聊起？")}</h2></div><button className="icon-button reset" aria-label={tr("重新开始这段对话")} onClick={() => setDialog("reset")}><RotateCcw size={17} /></button></div>
          <div className="chat-log" ref={logRef} role="log" aria-live="polite" aria-relevant="additions text" onScroll={() => { const el = logRef.current; if (el) setShowJump(el.scrollHeight - el.scrollTop - el.clientHeight > 120); }}><div className="day-divider"><span />{tr("今天 · 傍晚")}<span /></div><p className="stage-direction">{character === "xiaoman" ? tr("窗外的天色慢慢暗下来，杯子里还有一点温热。") : tr("雨刚刚停。远处传来一声鸟鸣，唱片还在转。")}</p>
            {messages.map(m => <article key={m.id} className={`message ${m.role}`}>{m.role === "companion" && <div className="message-author"><span className={`mini-avatar ${character}`}>{p.initial}</span><span>{p.name}</span><small>{tr("演示对话")}</small></div>}<div className="bubble">{m.text.split("\n\n").map((line, i) => <p key={i}>{line}</p>)}</div>{m.role === "companion" && <button className={`save-message ${saved.some(s => s.key === `${character}-${m.id}`) ? "is-saved" : ""}`} onClick={() => save(m)} aria-label={saved.some(s => s.key === `${character}-${m.id}`) ? tr("取消收藏这段话") : tr("收藏这段话")}>{saved.some(s => s.key === `${character}-${m.id}`) ? <Check size={13} /> : <Bookmark size={13} />}<span>{saved.some(s => s.key === `${character}-${m.id}`) ? tr("已收好") : tr("收好这句话")}</span></button>}</article>)}
            {typing && <div className="typing" role="status" aria-label={tr("演示回应准备中")}><span /><span /><span /></div>}<div ref={endRef} />
          </div>
          {showJump && <button className="jump-latest" onClick={() => endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })}><ArrowDown size={14} />{tr("回到最新")}</button>}
          <div className="composer-area"><div className="prompt-heading"><span>{tr("也可以这样开始")}</span><span className="short-rule" /></div><div className="prompts">{prompts.map((s, i) => <button key={s} disabled={typing} onClick={() => send(s)}>{i === 0 ? <Coffee size={13} /> : i === 1 ? <Leaf size={13} /> : <Sparkles size={13} />}{s}<ArrowUpRight size={12} /></button>)}</div><form className="composer" onSubmit={submit}><label className="sr-only" htmlFor="message">{tr("写给")}{p.name}{tr("的话")}</label><textarea id="message" ref={inputRef} value={text} maxLength={1000} placeholder={tr("不用想好再说，想到什么就写下来…")} rows={1} onChange={e => { setText(e.target.value); e.target.style.height = "auto"; e.target.style.height = `${Math.min(e.target.scrollHeight, 112)}px`; }} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); send(text); } }} /><div className="composer-bottom"><button type="button" className={`sound-button ${sound ? "on" : ""}`} aria-pressed={sound} onClick={toggleSound}><Headphones size={14} /><span>{sound ? tr("环境声已开启") : tr("一点环境声")}</span>{sound && <span className="sound-bars"><i /><i /><i /></span>}</button><div className="send-wrap"><span>{text.length > 800 ? `${text.length}/1000` : tr("Enter 发送")}</span><button type="submit" className="send-button" disabled={!text.trim() || typing} aria-label={tr("发送消息")}><ArrowUp size={19} /></button></div></div></form><p className="demo-note">{tr("预设回复的交互演示 · 对话与收藏仅保留在本次页面")}</p></div>
        </section>
      </div>
      <footer className="main-footer"><span>{tr("少一点喧闹，多一点陪伴。")}</span><button onClick={() => setDialog("about")}>{tr("关于这个样例")}<ArrowUpRight size={12} /></button></footer>
    </main>
    <dialog ref={modalRef} className="modal" onCancel={() => setDialog(null)} onClick={e => { if (e.target === modalRef.current) setDialog(null); }}><div className="modal-inner"><button className="icon-button modal-close" onClick={() => setDialog(null)} aria-label={tr("关闭窗口")}><X size={20} /></button>
      {dialog === "about" && <><span className="eyebrow">{tr("交互界面设计样例")}</span><h2>{tr("让对话，慢一点。")}</h2><p>{tr("STILL 是一份可操作的聊天界面样例。这里的人物和对话都是演示内容，发送后会展示预设回应。")}</p><p>{tr("你可以切换「留白 / 入境」、体验两位角色的对话、收藏片段，或打开一段轻柔的环境声。手机和桌面有各自的布局。")}</p><div className="modal-callout">{tr("对话不会上传，也不会跨设备同步。关闭或刷新页面后，输入内容与收藏都会清空。")}</div><p className="muted">{tr("原创界面演示 · Prayer · 2026")}</p></>}
      {dialog === "saved" && <><span className="eyebrow">{tr("值得收好的小事")}</span><h2>{tr("我们的片段")}<small>{saved.length.toString().padStart(2, "0")}</small></h2>{saved.length === 0 ? <div className="empty-state"><Bookmark size={27} /><p>{tr("有些话，值得再读一次。")}</p><small>{tr("点对话下方的「收好这句话」，就会出现在这里。")}</small></div> : <div className="saved-list">{saved.map(s => <div className="saved-item" key={s.key}><span>{s.name}</span><p>{s.text}</p><button onClick={() => setSaved(prev => prev.filter(v => v.key !== s.key))}>{tr("移除")}</button></div>)}</div>}</>}
      {dialog === "reset" && <><span className="eyebrow">{tr("一个新的开始")}</span><h2>{tr("重新开始这段对话？")}</h2><p>{tr("与")}{p.name}{tr("的消息会恢复为最初的演示内容，已经收藏的片段会保留。")}</p><div className="modal-buttons"><button onClick={() => setDialog(null)}>{tr("继续聊")}</button><button className="confirm" onClick={() => { if (timer.current) clearTimeout(timer.current); setTyping(false); setMessages(initialMessages(character)); setConversations(prev => ({ ...prev, [character]: initialMessages(character) })); setText(""); setDialog(null); }}>{tr("重新开始")}</button></div></>}
    </div></dialog>
    {notice && <div className="toast" role="status"><Check size={15} />{notice}</div>}
  </div>;
}
