import React, { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import {
  LayoutDashboard, Users, CheckSquare, CalendarDays, Flag, Mail,
  MessageSquare, Settings, Search, Plus, ChevronDown, ArrowUpRight,
  ArrowDownRight, Coffee, CircleCheck, Clock3, Target, TrendingUp,
  MoreHorizontal, X, Trash2, Pencil, Download, Upload, Menu, Send,
  Phone, Globe, ExternalLink, Filter, Bell, CalendarPlus, Sparkles,
  CircleDollarSign, ListTodo, Check, ChevronLeft, ChevronRight,
  PanelLeftClose, PanelLeftOpen
} from "lucide-react";

const todayISO = () => new Date().toISOString().slice(0, 10);
const plusDays = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

// A clean starter workspace: records are created by the signed-in user.
const initialData = {
  goals: { revenue: 1000, customers: 10, days: 90, startDate: todayISO() },
  leads: [],
  tasks: [],
  activity: [],
  milestones: [],
  messages: [],
  events: [],
  settings: { businessName: "Roast & Revenue", ownerName: "", email: "", currency: "USD" }
};

const money = (n) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(Number(n || 0));
const shortDate = (v) => v ? new Date(`${v}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—";
const uid = () => Date.now() + Math.floor(Math.random() * 1000);

function App() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [workspaceReady, setWorkspaceReady] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const [authMessage, setAuthMessage] = useState("");
  const [syncStatus, setSyncStatus] = useState("Connected");
  const [data, setData] = useState(initialData);
  const [page, setPage] = useState("Overview");
  const [modal, setModal] = useState(null);
  const [search, setSearch] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [toast, setToast] = useState("");

  // Restore the signed-in user when the app opens and listen for login/logout changes.
  useEffect(() => {
    let alive = true;
    supabase.auth.getSession().then(({ data: result }) => {
      if (alive) {
        setSession(result.session);
        setAuthLoading(false);
      }
    }).catch(() => { if (alive) setAuthLoading(false); });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setAuthLoading(false);
    });
    return () => { alive = false; listener.subscription.unsubscribe(); };
  }, []);

  // Each authenticated user gets one private workspace row in public.workspaces.
  useEffect(() => {
    if (!session?.user?.id) {
      setWorkspaceReady(false);
      return;
    }
    let alive = true;
    setWorkspaceReady(false);
    (async () => {
      const { data: row, error } = await supabase
        .from("workspaces")
        .select("data")
        .eq("user_id", session.user.id)
        .maybeSingle();
      if (error) {
        if (alive) {
          setAuthMessage(`Could not load your workspace: ${error.message}`);
          setWorkspaceReady(false);
        }
        return;
      }
      if (row?.data) {
        setData({ ...initialData, ...row.data });
      } else {
        const { error: createError } = await supabase.from("workspaces").upsert({
          user_id: session.user.id,
          data: initialData,
          updated_at: new Date().toISOString()
        }, { onConflict: "user_id" });
        if (createError) {
          if (alive) setAuthMessage(`Could not create your workspace: ${createError.message}`);
          return;
        }
        setData(initialData);
      }
      if (alive) {
        setAuthMessage("");
        setWorkspaceReady(true);
        setSyncStatus("Connected to Supabase");
      }
    })();
    return () => { alive = false; };
  }, [session?.user?.id]);

  // Save changes to Supabase after a short pause; never save before the first load finishes.
  useEffect(() => {
    if (!session?.user?.id || !workspaceReady) return;
    setSyncStatus("Saving...");
    const timer = window.setTimeout(async () => {
      const { error } = await supabase.from("workspaces").upsert({
        user_id: session.user.id,
        data,
        updated_at: new Date().toISOString()
      }, { onConflict: "user_id" });
      setSyncStatus(error ? "Sync error" : "All changes saved");
      if (error) setAuthMessage(`Database save failed: ${error.message}`);
    }, 700);
    return () => window.clearTimeout(timer);
  }, [data, session?.user?.id, workspaceReady]);

  const handleAuth = async (event) => {
    event.preventDefault();
    setAuthBusy(true);
    setAuthMessage("");
    try {
      if (authMode === "signup") {
        const { data: result, error } = await supabase.auth.signUp({
          email: authEmail.trim(),
          password: authPassword,
          options: { emailRedirectTo: window.location.origin }
        });
        if (error) throw error;
        if (!result.session) setAuthMessage("Account created. Check your email and confirm your address, then log in.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: authEmail.trim(), password: authPassword
        });
        if (error) throw error;
      }
    } catch (error) {
      setAuthMessage(error.message || "Authentication failed. Please try again.");
    } finally {
      setAuthBusy(false);
    }
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) setAuthMessage(error.message);
    else {
      setData(initialData);
      setAuthMessage("");
    }
  };

  const update = (key, value) => setData((d) => ({ ...d, [key]: value }));
  const notify = (msg) => { setToast(msg); window.setTimeout(() => setToast(""), 2600); };

  if (authLoading) return <div style={authPageStyle}><div style={authCardStyle}>Loading your secure workspace...</div></div>;
  if (!session) return <div style={authPageStyle}><form style={authCardStyle} onSubmit={handleAuth}>
    <div style={{fontSize: 12, letterSpacing: 2, color: "#9a7558", fontWeight: 700}}>ROAST & REVENUE HQ</div>
    <h1 style={{margin: "10px 0 6px", color: "#30251f"}}>{authMode === "signup" ? "Create your account" : "Welcome back"}</h1>
    <p style={{margin: "0 0 22px", color: "#75685f", lineHeight: 1.5}}>Sign in to access your private business dashboard from any device.</p>
    <label style={authLabelStyle}>Email address<input style={authInputStyle} type="email" autoComplete="email" required value={authEmail} onChange={e=>setAuthEmail(e.target.value)} /></label>
    <label style={authLabelStyle}>Password<input style={authInputStyle} type="password" autoComplete={authMode === "signup" ? "new-password" : "current-password"} minLength={8} required value={authPassword} onChange={e=>setAuthPassword(e.target.value)} /></label>
    <button style={authButtonStyle} type="submit" disabled={authBusy}>{authBusy ? "Please wait..." : authMode === "signup" ? "Create account" : "Sign in"}</button>
    <button type="button" style={authSwitchStyle} onClick={()=>{setAuthMode(authMode === "signup" ? "login" : "signup");setAuthMessage("");}}>{authMode === "signup" ? "Already have an account? Sign in" : "New here? Create an account"}</button>
    {authMessage && <p role="alert" style={{marginTop: 16, color: "#8b4a32", fontSize: 14, lineHeight: 1.5}}>{authMessage}</p>}
  </form></div>;
  if (!workspaceReady) return <div style={authPageStyle}><div style={authCardStyle}>{authMessage || "Loading your private workspace..."}</div></div>;

  // Derived dashboard totals. Kept as a normal calculation so hooks are
  // never called conditionally while authentication screens are displayed.
  const totals = {
    revenue: data.activity.reduce((s, x) => s + Number(x.revenue || 0), 0),
    sales: data.activity.reduce((s, x) => s + Number(x.sales || 0), 0),
    prospects: data.activity.reduce((s, x) => s + Number(x.prospects || 0), 0),
    emails: data.activity.reduce((s, x) => s + Number(x.emails || 0), 0),
    replies: data.activity.reduce((s, x) => s + Number(x.replies || 0), 0),
    pending: data.tasks.filter((t) => !t.done).length,
  };

  const nav = [
    { name: "Overview", icon: LayoutDashboard, group: "WORKSPACE" },
    { name: "Leads & CRM", icon: Users },
    { name: "Daily tracker", icon: TrendingUp },
    { name: "Tasks", icon: CheckSquare },
    { name: "Calendar", icon: CalendarDays },
    { name: "Milestones", icon: Flag },
    { name: "Outreach", icon: Mail, group: "CUSTOMER COMMUNICATION" },
    { name: "Messages", icon: MessageSquare },
    { name: "Settings", icon: Settings, group: "PREFERENCES" },
  ];

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    downloadBlob(blob, "roast-revenue-backup.json");
    notify("Backup downloaded");
  };
  const exportCSV = () => {
    const rows = [["Business","Contact","Country","Email","Instagram","Website","Status","Template","Next follow-up","Notes"], ...data.leads.map(l => [l.business,l.contact,l.country,l.email,l.instagram,l.website,l.status,l.template,l.nextFollowUp,l.notes])];
    const csv = rows.map(r => r.map(v => `"${String(v ?? "").replaceAll('"','""')}"`).join(",")).join("\n");
    downloadBlob(new Blob([csv], { type: "text/csv" }), "coffee-shop-leads.csv");
    notify("Leads CSV downloaded");
  };
  const importJSON = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try { setData({ ...initialData, ...JSON.parse(reader.result) }); notify("Backup restored"); }
      catch { notify("That backup file could not be read"); }
    };
    reader.readAsText(file);
  };

  return (
    <div className="app-shell">
      <aside className={`sidebar ${sidebarOpen ? "" : "collapsed"}`}>
        <div className="brand">
          <div className="brand-mark"><Coffee size={20}/></div>
          {sidebarOpen && <div><strong>Roast & Revenue</strong><span>BUSINESS HQ</span></div>}
          <button className="icon-btn sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)} title="Toggle sidebar">
            {sidebarOpen ? <PanelLeftClose size={17}/> : <PanelLeftOpen size={17}/>}
          </button>
        </div>
        <div className="workspace-pill"><span className="online-dot"/> {sidebarOpen ? "90-DAY GROWTH PLAN" : "90D"}</div>
        <nav className="nav-list">
          {nav.map((item) => {
            const Icon = item.icon;
            return <React.Fragment key={item.name}>
              {item.group && sidebarOpen && <div className="nav-label">{item.group}</div>}
              <button className={`nav-item ${page === item.name ? "active" : ""}`} onClick={() => setPage(item.name)} title={item.name}>
                <Icon size={18}/>{sidebarOpen && <span>{item.name}</span>}
                {item.name === "Tasks" && sidebarOpen && <small>{totals.pending}</small>}
              </button>
            </React.Fragment>;
          })}
        </nav>
        {sidebarOpen && <div className="sidebar-bottom">
          <div className="mini-goal">
            <div className="mini-goal-top"><span>Revenue goal</span><Target size={15}/></div>
            <strong>{money(totals.revenue)} <em>/ {money(data.goals.revenue)}</em></strong>
            <div className="progress"><i style={{width: `${Math.min(100, totals.revenue / Math.max(1,data.goals.revenue)*100)}%`}}/></div>
            <span className="muted tiny">{Math.round(totals.revenue / Math.max(1,data.goals.revenue)*100)}% completed</span>
          </div>
          <div className="profile"><div className="avatar">RR</div><div><b>{data.settings.ownerName || "Your workspace"}</b><span>Founder account</span></div><MoreHorizontal size={17}/></div>
        </div>}
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumb"><span>Workspace</span><b>/</b><strong>{page}</strong></div>
          <div className="top-actions">
            <div className="search-box"><Search size={16}/><input placeholder="Search leads, tasks..." value={search} onChange={e=>setSearch(e.target.value)}/><kbd>⌘ K</kbd></div>
            <button className="icon-btn notification" onClick={() => setPage("Tasks")} title="View tasks"><Bell size={18}/><i/></button>
            <button className="avatar top-avatar" onClick={handleSignOut} title="Sign out">{(session.user.email || "RR").slice(0,2).toUpperCase()}</button>
          </div>
        </header>

        <div className="content">
          {authMessage && <div className="inline-tip" role="alert">{authMessage}</div>}
          {page === "Overview" && <Overview data={data} totals={totals} setPage={setPage} setModal={setModal} update={update} />}
          {page === "Leads & CRM" && <Leads data={data} update={update} setModal={setModal} search={search} notify={notify} />}
          {page === "Daily tracker" && <Tracker data={data} update={update} notify={notify} />}
          {page === "Tasks" && <Tasks data={data} update={update} setModal={setModal} search={search} />}
          {page === "Calendar" && <CalendarPage data={data} update={update} setModal={setModal} />}
          {page === "Milestones" && <Milestones data={data} update={update} setModal={setModal} />}
          {page === "Outreach" && <Outreach data={data} setModal={setModal} />}
          {page === "Messages" && <Messages data={data} update={update} setModal={setModal} />}
          {page === "Settings" && <SettingsPage data={data} update={update} exportJSON={exportJSON} exportCSV={exportCSV} importJSON={importJSON} notify={notify} />}
        </div>
        <footer className="footer"><span>Roast & Revenue HQ</span><span>Keep showing up. The numbers will tell you what to improve.</span><span>{syncStatus} <i className="online-dot"/></span></footer>
      </main>

      {modal && <Modal modal={modal} close={() => setModal(null)} data={data} update={update} notify={notify}/>}
      {toast && <div className="toast"><CircleCheck size={17}/>{toast}</div>}
    </div>
  );
}

function PageHeading({ eyebrow, title, subtitle, action, onAction }) {
  return <div className="page-heading"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{subtitle}</p></div>{action && <button className="btn primary" onClick={onAction}><Plus size={16}/>{action}</button>}</div>;
}
function StatCard({ label, value, sub, icon: Icon, tone="brown", trend }) {
  return <div className="stat-card"><div className="stat-top"><span>{label}</span><div className={`stat-icon ${tone}`}><Icon size={18}/></div></div><div className="stat-value">{value}</div><div className="stat-sub">{trend && <span className="trend"><ArrowUpRight size={13}/>{trend}</span>}{sub}</div></div>;
}
function Overview({ data, totals, setPage, setModal, update }) {
  const pct = Math.min(100, totals.revenue / Math.max(1,data.goals.revenue)*100);
  const today = data.activity.find(a => a.date === todayISO()) || {};
  const todayTasks = data.tasks.filter(t => t.due === todayISO());
  const upcoming = data.events.filter(e => e.date >= todayISO()).sort((a,b)=>a.date.localeCompare(b.date)).slice(0,4);
  const recentLeads = [...data.leads].slice(0,5);
  return <>
    <PageHeading eyebrow="YOUR BUSINESS AT A GLANCE" title="Good day. Let's grow." subtitle="A clear view of your sales activity, priorities and 90-day target." action="Add task" onAction={()=>setModal({type:"task"})}/>
    <div className="hero-banner">
      <div className="hero-copy"><div className="hero-kicker"><Sparkles size={14}/> YOUR 90-DAY MISSION</div><h2>Build momentum.<br/><i>Turn outreach into revenue.</i></h2><p>Your goal is {money(data.goals.revenue)} in {data.goals.days} days. Focus on qualified prospects, useful previews and consistent follow-ups.</p><button className="btn light" onClick={()=>setPage("Daily tracker")}>Log today's activity <ArrowUpRight size={15}/></button></div>
      <div className="hero-art"><div className="coffee-ring ring-one"/><div className="coffee-ring ring-two"/><div className="hero-cup"><Coffee size={58}/></div><div className="floating-note"><TrendingUp size={15}/><span><b>{Math.round(pct)}%</b><small>goal progress</small></span></div></div>
    </div>
    <div className="stats-grid">
      <StatCard label="Revenue collected" value={money(totals.revenue)} sub={`of ${money(data.goals.revenue)} goal`} icon={CircleDollarSign} tone="green"/>
      <StatCard label="Customers won" value={totals.sales} sub={`target: ${data.goals.customers}`} icon={Users} tone="blue"/>
      <StatCard label="Prospects researched" value={totals.prospects} sub="from daily tracker" icon={Target} tone="gold"/>
      <StatCard label="Pending tasks" value={totals.pending} sub="across your workspace" icon={ListTodo} tone="rose"/>
    </div>
    <div className="dashboard-grid">
      <section className="panel revenue-panel">
        <div className="panel-head"><div><h3>Revenue progress</h3><p>Track money actually received, not just promised.</p></div><button className="text-btn" onClick={()=>setPage("Daily tracker")}>View tracker <ArrowUpRight size={14}/></button></div>
        <div className="revenue-number">{money(totals.revenue)} <span>/ {money(data.goals.revenue)}</span></div>
        <div className="large-progress"><i style={{width:`${pct}%`}}/></div>
        <div className="progress-labels"><span>{Math.round(pct)}% of target reached</span><span>{money(Math.max(0,data.goals.revenue-totals.revenue))} remaining</span></div>
        <div className="revenue-footer"><div><span className="dot green-dot"/>Revenue received</div><div><span className="dot grey-dot"/>Remaining target</div></div>
      </section>
      <section className="panel daily-panel">
        <div className="panel-head"><div><h3>Today's activity</h3><p>{new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})}</p></div><button className="round-arrow" onClick={()=>setPage("Daily tracker")}><ArrowUpRight size={17}/></button></div>
        <div className="activity-mini-grid">
          <div><b>{today.prospects || 0}</b><span>Prospects</span></div><div><b>{today.emails || 0}</b><span>Emails</span></div><div><b>{today.replies || 0}</b><span>Replies</span></div><div><b>{today.previews || 0}</b><span>Previews</span></div>
        </div>
        <button className="btn outline full" onClick={()=>setPage("Daily tracker")}>Update daily numbers <Pencil size={14}/></button>
      </section>
      <section className="panel tasks-panel">
        <div className="panel-head"><div><h3>Today's priorities</h3><p>Small steps, completed consistently.</p></div><button className="text-btn" onClick={()=>setPage("Tasks")}>All tasks <ArrowUpRight size={14}/></button></div>
        {todayTasks.length ? todayTasks.slice(0,4).map(t=><div className="task-line" key={t.id}><button className={`check-circle ${t.done?"checked":""}`} onClick={()=>update("tasks",data.tasks.map(x=>x.id===t.id?{...x,done:!x.done}:x))}>{t.done&&<Check size={12}/>}</button><span className={t.done?"strike":""}>{t.title}</span><small>{t.priority}</small></div>) : <Empty text="No tasks due today. Add one small action to keep momentum."/>}
      </section>
      <section className="panel leads-panel">
        <div className="panel-head"><div><h3>Recent prospects</h3><p>Your latest business opportunities.</p></div><button className="text-btn" onClick={()=>setPage("Leads & CRM")}>Open CRM <ArrowUpRight size={14}/></button></div>
        {recentLeads.length ? <div className="mini-leads">{recentLeads.map(l=><div className="mini-lead" key={l.id}><div className="lead-avatar">{l.business.slice(0,1)}</div><div className="lead-info"><b>{l.business}</b><span>{l.country} · Template {l.template || "—"}</span></div><StatusPill status={l.status}/></div>)}</div> : <Empty text="Your first prospect will appear here."/>}
      </section>
    </div>
    <div className="bottom-grid">
      <section className="panel"><div className="panel-head"><div><h3>Upcoming calendar</h3><p>Meetings, follow-ups and delivery dates.</p></div><button className="text-btn" onClick={()=>setPage("Calendar")}>Calendar <ArrowUpRight size={14}/></button></div>
        {upcoming.length ? upcoming.map(e=><div className="event-row" key={e.id}><div className="event-date"><b>{new Date(`${e.date}T12:00:00`).getDate()}</b><span>{new Date(`${e.date}T12:00:00`).toLocaleDateString("en-US",{month:"short"})}</span></div><div><b>{e.title}</b><span>{e.time || "All day"} · {e.kind}</span></div></div>) : <Empty text="No upcoming events. Add a follow-up or milestone."/>}
      </section>
      <section className="panel"><div className="panel-head"><div><h3>Milestone snapshot</h3><p>Keep the 90-day plan moving.</p></div><button className="text-btn" onClick={()=>setPage("Milestones")}>All milestones <ArrowUpRight size={14}/></button></div>
        <div className="milestone-mini">{data.milestones.slice(0,3).map(m=><div key={m.id}><span className={`milestone-dot ${m.done?"done":""}`}>{m.done?<Check size={11}/>:null}</span><div><b className={m.done?"strike":""}>{m.title}</b><span>{shortDate(m.target)}</span></div></div>)}</div>
      </section>
    </div>
  </>;
}

function StatusPill({status}) {
  const cls = status.toLowerCase().replaceAll(" ","-");
  return <span className={`status-pill ${cls}`}>{status}</span>;
}
function Empty({text}) { return <div className="empty-state"><Coffee size={20}/><span>{text}</span></div>; }

function Leads({data,update,setModal,search,notify}) {
  const [filter,setFilter] = useState("All");
  const statuses = ["All","New","Contacted","Replied","Interested","Preview sent","Negotiating","Won","Lost"];
  const list = data.leads.filter(l => (filter==="All"||l.status===filter) && `${l.business} ${l.contact} ${l.email} ${l.country}`.toLowerCase().includes(search.toLowerCase()));
  const change = (id,field,value)=>update("leads",data.leads.map(l=>l.id===id?{...l,[field]:value}:l));
  return <>
    <PageHeading eyebrow="CUSTOMER PIPELINE" title="Leads & CRM" subtitle="Every coffee shop, conversation and opportunity in one place." action="Add prospect" onAction={()=>setModal({type:"lead"})}/>
    <div className="stats-strip"><span><b>{data.leads.length}</b> total prospects</span><span><b>{data.leads.filter(l=>l.status==="Interested").length}</b> interested</span><span><b>{data.leads.filter(l=>l.status==="Won").length}</b> won</span><span><b>{data.leads.filter(l=>l.status==="Lost").length}</b> lost</span></div>
    <div className="panel table-panel">
      <div className="table-toolbar"><div className="filter-tabs">{statuses.map(s=><button key={s} className={filter===s?"selected":""} onClick={()=>setFilter(s)}>{s}</button>)}</div><span className="muted tiny">{list.length} records</span></div>
      <div className="table-wrap"><table><thead><tr><th>BUSINESS</th><th>CONTACT</th><th>COUNTRY</th><th>STATUS</th><th>TEMPLATE</th><th>FOLLOW-UP</th><th>VALUE</th><th></th></tr></thead><tbody>
        {list.map(l=><tr key={l.id}><td><div className="table-business"><div className="lead-avatar">{l.business.slice(0,1)}</div><div><b>{l.business}</b><span>{l.email || "No email added"}</span></div></div></td><td>{l.contact || "—"}</td><td>{l.country || "—"}</td><td><select className="inline-select" value={l.status} onChange={e=>change(l.id,"status",e.target.value)}>{statuses.filter(x=>x!=="All").map(s=><option key={s}>{s}</option>)}</select></td><td>#{l.template || "—"}</td><td>{shortDate(l.nextFollowUp)}</td><td>{money(l.value)}</td><td><button className="icon-btn" onClick={()=>setModal({type:"lead",item:l})}><Pencil size={15}/></button></td></tr>)}
      </tbody></table>{!list.length&&<Empty text="No matching prospects yet. Add your first coffee shop."/>}</div>
    </div>
  </>;
}



function Tracker({ data, update, notify }) {
  const today = todayISO();

  const [date, setDate] = useState(today);
  const [draft, setDraft] = useState(null);
  const [period, setPeriod] = useState("7days");
  const [anchor, setAnchor] = useState(today);
  const [customStart, setCustomStart] = useState(today);
  const [customEnd, setCustomEnd] = useState(today);
  const [historySearch, setHistorySearch] = useState("");
  const [goalPeriod, setGoalPeriod] = useState("weekly");

  const defaultGoals = {
    weekly: {
      prospects: 50,
      emails: 30,
      dms: 20,
      followUps: 15,
      previews: 5,
      sales: 1
    },
    monthly: {
      prospects: 200,
      emails: 120,
      dms: 80,
      followUps: 60,
      previews: 20,
      sales: 1
    }
  };

  const savedGoals = data.trackerGoals || defaultGoals;
  const [goalDraft, setGoalDraft] = useState(savedGoals);

  const emptyRecord = (selectedDate) => ({
    date: selectedDate,
    prospects: 0,
    emails: 0,
    dms: 0,
    followUps: 0,
    previews: 0,
    replies: 0,
    interested: 0,
    sales: 0,
    revenue: 0,
    notes: ""
  });

  useEffect(() => {
    const existing = data.activity.find(a => a.date === date);
    setDraft(existing ? { ...emptyRecord(date), ...existing } : emptyRecord(date));
  }, [date, data.activity]);

  useEffect(() => {
    setGoalDraft(data.trackerGoals || defaultGoals);
  }, [data.trackerGoals]);

  const parseDate = (value) => {
    const [y, m, d] = value.split("-").map(Number);
    return new Date(y, m - 1, d, 12);
  };

  const formatISO = (value) => {
    const y = value.getFullYear();
    const m = String(value.getMonth() + 1).padStart(2, "0");
    const d = String(value.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const shiftDays = (value, amount) => {
    const result = parseDate(value);
    result.setDate(result.getDate() + amount);
    return formatISO(result);
  };

  const getRange = () => {
    if (period === "custom") {
      return {
        start: customStart,
        end: customEnd
      };
    }

    if (period === "thisMonth") {
      const d = parseDate(today);
      return {
        start: formatISO(new Date(d.getFullYear(), d.getMonth(), 1, 12)),
        end: formatISO(new Date(d.getFullYear(), d.getMonth() + 1, 0, 12))
      };
    }

    if (period === "lastMonth") {
      const d = parseDate(today);
      return {
        start: formatISO(new Date(d.getFullYear(), d.getMonth() - 1, 1, 12)),
        end: formatISO(new Date(d.getFullYear(), d.getMonth(), 0, 12))
      };
    }

    const end = anchor;
    const days = period === "30days" ? 30 : 7;

    return {
      start: shiftDays(end, -(days - 1)),
      end
    };
  };

  const range = getRange();

  const rangeDates = [];
  if (range.start && range.end && range.start <= range.end) {
    let cursor = range.start;
    let count = 0;

    while (cursor <= range.end && count < 366) {
      rangeDates.push(cursor);
      cursor = shiftDays(cursor, 1);
      count++;
    }
  }

  const rangeRecords = data.activity.filter(
    a => a.date >= range.start && a.date <= range.end
  );

  const totals = rangeRecords.reduce((result, item) => {
    [
      "prospects", "emails", "dms", "followUps",
      "previews", "replies", "interested", "sales", "revenue"
    ].forEach(key => {
      result[key] += Number(item[key] || 0);
    });
    return result;
  }, {
    prospects: 0,
    emails: 0,
    dms: 0,
    followUps: 0,
    previews: 0,
    replies: 0,
    interested: 0,
    sales: 0,
    revenue: 0
  });

  const outreach = totals.emails + totals.dms + totals.followUps;

  const replyRate = outreach
    ? (totals.replies / outreach) * 100
    : 0;

  const interestRate = outreach
    ? (totals.interested / outreach) * 100
    : 0;

  const salesConversion = outreach
    ? (totals.sales / outreach) * 100
    : 0;

  const averageSale = totals.sales
    ? totals.revenue / totals.sales
    : 0;

  const chartMetrics = [
    { key: "prospects", label: "Prospects", color: "#a77b58" },
    { key: "emails", label: "Emails", color: "#547c9c" },
    { key: "dms", label: "Instagram DMs", color: "#9275ad" },
    { key: "replies", label: "Replies", color: "#5c9877" }
  ];

  const chartValues = rangeDates.map(day => {
    const record = data.activity.find(a => a.date === day) || {};
    return { date: day, ...record };
  });

  const maxValue = Math.max(
    1,
    ...chartValues.flatMap(item =>
      chartMetrics.map(metric => Number(item[metric.key] || 0))
    )
  );

  const chartScale = Math.ceil(maxValue / 4) * 4 || 4;

  const saveActivity = () => {
    if (!draft) return;

    const record = {
      ...draft,
      date,
      prospects: Math.max(0, Number(draft.prospects) || 0),
      emails: Math.max(0, Number(draft.emails) || 0),
      dms: Math.max(0, Number(draft.dms) || 0),
      followUps: Math.max(0, Number(draft.followUps) || 0),
      previews: Math.max(0, Number(draft.previews) || 0),
      replies: Math.max(0, Number(draft.replies) || 0),
      interested: Math.max(0, Number(draft.interested) || 0),
      sales: Math.max(0, Number(draft.sales) || 0),
      revenue: Math.max(0, Number(draft.revenue) || 0)
    };

    const updated = [
      ...data.activity.filter(a => a.date !== date),
      record
    ].sort((a, b) => a.date.localeCompare(b.date));

    update("activity", updated);
    notify("Activity saved successfully");
  };

  const saveGoals = () => {
    update("trackerGoals", goalDraft);
    notify("Activity targets saved");
  };

  const changeGoal = (key, value) => {
    setGoalDraft(current => ({
      ...current,
      [goalPeriod]: {
        ...current[goalPeriod],
        [key]: Math.max(0, Number(value) || 0)
      }
    }));
  };

  const movePeriod = (direction) => {
    if (period === "thisMonth" || period === "lastMonth") {
      const d = parseDate(anchor);
      d.setMonth(d.getMonth() + direction);
      setAnchor(formatISO(d));
      setPeriod("30days");
      return;
    }

    const amount = period === "30days" ? 30 : 7;
    setAnchor(shiftDays(anchor, amount * direction));
  };

  const selectPeriod = (value) => {
    setPeriod(value);
    setAnchor(today);
  };

  const editRecord = (record) => {
    setDate(record.date);
    setDraft({ ...emptyRecord(record.date), ...record });
  };

  const deleteRecord = (recordDate) => {
    if (!window.confirm(`Delete activity for ${recordDate}?`)) return;

    update(
      "activity",
      data.activity.filter(a => a.date !== recordDate)
    );

    if (date === recordDate) {
      setDraft(emptyRecord(date));
    }

    notify("Activity record deleted");
  };

  const exportActivity = () => {
    const columns = [
      "Date", "Prospects", "Emails", "DMs", "Follow-ups",
      "Previews", "Replies", "Interested", "Sales", "Revenue", "Notes"
    ];

    const keys = [
      "date", "prospects", "emails", "dms", "followUps",
      "previews", "replies", "interested", "sales", "revenue", "notes"
    ];

    const rows = [
      columns,
      ...rangeRecords.map(record =>
        keys.map(key => record[key] ?? "")
      )
    ];

    const csv = rows.map(row =>
      row.map(value =>
        `"${String(value).replaceAll('"', '""')}"`
      ).join(",")
    ).join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;"
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `activity-${range.start}-to-${range.end}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    notify("Activity CSV downloaded");
  };

  const fields = [
    ["prospects", "New prospects researched"],
    ["emails", "Personalized emails sent"],
    ["dms", "Instagram DMs sent"],
    ["followUps", "Follow-ups sent"],
    ["previews", "Personalized previews sent"],
    ["replies", "Replies received"],
    ["interested", "Interested prospects"],
    ["sales", "Customers who paid"],
    ["revenue", "Revenue received ($)"]
  ];

  const history = [...data.activity]
    .filter(item =>
      item.date.includes(historySearch.trim()) ||
      shortDate(item.date).toLowerCase().includes(historySearch.trim().toLowerCase())
    )
    .sort((a, b) => b.date.localeCompare(a.date));

  const formatRangeTitle = () => {
    if (!range.start || !range.end) return "Select a valid date range";

    if (range.start.slice(0, 7) === range.end.slice(0, 7)) {
      return parseDate(range.start).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric"
      });
    }

    return `${shortDate(range.start)} – ${shortDate(range.end)}`;
  };

  const summaryCards = [
    { label: "Prospects researched", value: totals.prospects, note: "Businesses researched" },
    { label: "Outreach sent", value: outreach, note: "Emails, DMs and follow-ups" },
    { label: "Replies received", value: totals.replies, note: "Responses from prospects" },
    { label: "Revenue received", value: money(totals.revenue), note: `${totals.sales} paid customers` }
  ];

  return (
    <>
      <PageHeading
        eyebrow="CONSISTENCY BUILDS REVENUE"
        title="Daily activity tracker"
        subtitle="Track your outreach, measure your performance and understand what turns prospects into paying customers."
      />

      {/* PERFORMANCE SUMMARY */}
      <div className="stats-grid">
        {summaryCards.map(card => (
          <div className="stat-card" key={card.label}>
            <div className="stat-top">
              <span>{card.label}</span>
              <TrendingUp size={17} />
            </div>
            <div className="stat-value">{card.value}</div>
            <div className="stat-sub">{card.note}</div>
          </div>
        ))}
      </div>

      {/* DATE RANGE CONTROLS */}
      <div className="panel" style={{ marginBottom: 20 }}>
        <div className="panel-head">
          <div>
            <h3>Performance overview</h3>
            <p>{formatRangeTitle()}</p>
          </div>
          <button
            className="btn outline"
            onClick={() => {
              setPeriod("7days");
              setAnchor(today);
              setDate(today);
            }}
          >
            Today
          </button>
        </div>

        <div style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          alignItems: "center",
          marginBottom: 16
        }}>
          {[
            ["7days", "7 Days"],
            ["30days", "30 Days"],
            ["thisMonth", "This Month"],
            ["lastMonth", "Last Month"],
            ["custom", "Custom Range"]
          ].map(([value, label]) => (
            <button
              key={value}
              className={`btn ${period === value ? "primary" : "outline"}`}
              onClick={() => selectPeriod(value)}
            >
              {label}
            </button>
          ))}
        </div>

        {period === "custom" && (
          <div style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            marginBottom: 16
          }}>
            <label className="form-field">
              <span>Start date</span>
              <input
                type="date"
                value={customStart}
                onChange={e => setCustomStart(e.target.value)}
              />
            </label>
            <label className="form-field">
              <span>End date</span>
              <input
                type="date"
                min={customStart}
                value={customEnd}
                onChange={e => setCustomEnd(e.target.value)}
              />
            </label>
          </div>
        )}

        {period !== "thisMonth" && period !== "lastMonth" && period !== "custom" && (
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10
          }}>
            <button className="btn outline" onClick={() => movePeriod(-1)}>
              <ChevronLeft size={16} /> Previous
            </button>
            <span className="muted tiny">
              {shortDate(range.start)} – {shortDate(range.end)}
            </span>
            <button
              className="btn outline"
              onClick={() => movePeriod(1)}
              disabled={range.end >= today}
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        )}

        {(period === "thisMonth" || period === "lastMonth") && (
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}>
            <button className="btn outline" onClick={() => movePeriod(-1)}>
              <ChevronLeft size={16} /> Previous month
            </button>
            <button className="btn outline" onClick={() => selectPeriod("thisMonth")}>
              Current month
            </button>
            <button className="btn outline" onClick={() => movePeriod(1)}>
              Next month <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* ACTIVITY GRAPH */}
      <div className="panel" style={{ marginBottom: 20 }}>
        <div className="panel-head">
          <div>
            <h3>Daily activity graph</h3>
            <p>Compare prospects, emails, DMs and replies.</p>
          </div>
        </div>

        <div style={{
          display: "flex",
          gap: 14,
          flexWrap: "wrap",
          marginBottom: 18
        }}>
          {chartMetrics.map(metric => (
            <span key={metric.key} style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 12
            }}>
              <i style={{
                width: 10,
                height: 10,
                borderRadius: 3,
                background: metric.color
              }} />
              {metric.label}
            </span>
          ))}
        </div>

        {chartValues.length > 0 ? (
          <div style={{ overflowX: "auto" }}>
            <div style={{
              minWidth: chartValues.length > 14 ? 850 : 550,
              display: "flex",
              gap: 8
            }}>
              <div style={{
                height: 220,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                paddingBottom: 26,
                color: "#82776f",
                fontSize: 11
              }}>
                {[4, 3, 2, 1, 0].map(n => (
                  <span key={n}>{Math.round(chartScale * n / 4)}</span>
                ))}
              </div>

              {chartValues.map(item => (
                <div key={item.date} style={{
                  flex: 1,
                  minWidth: 45,
                  height: 220,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                  alignItems: "center"
                }}>
                  <div style={{
                    height: 190,
                    width: "100%",
                    display: "flex",
                    alignItems: "flex-end",
                    justifyContent: "center",
                    gap: 2,
                    borderBottom: "1px solid #ded7d0"
                  }}>
                    {chartMetrics.map(metric => {
                      const value = Number(item[metric.key] || 0);
                      const height = value
                        ? Math.max(3, value / chartScale * 175)
                        : 0;

                      return (
                        <div
                          key={metric.key}
                          title={`${metric.label}: ${value}`}
                          style={{
                            width: "19%",
                            maxWidth: 18,
                            height: `${height}px`,
                            background: metric.color,
                            borderRadius: "4px 4px 0 0",
                            position: "relative"
                          }}
                        >
                          {value > 0 && (
                            <span style={{
                              position: "absolute",
                              top: -17,
                              left: "50%",
                              transform: "translateX(-50%)",
                              fontSize: 9,
                              color: "#55483f"
                            }}>
                              {value}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <span style={{
                    marginTop: 8,
                    fontSize: 10,
                    color: "#82776f",
                    whiteSpace: "nowrap"
                  }}>
                    {parseDate(item.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric"
                    })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <Empty text="Choose a valid date range to view activity." />
        )}
        <p className="muted tiny" style={{ marginTop: 12 }}>
          Days without saved activity show zero. Hover over a bar to see its exact value.
        </p>
      </div>

      {/* CONVERSION RATES */}
      <div className="panel" style={{ marginBottom: 20 }}>
        <div className="panel-head">
          <div>
            <h3>Sales conversion performance</h3>
            <p>Understand how well your outreach is working.</p>
          </div>
        </div>

        <div className="stats-grid">
          {[
            ["Reply rate", `${replyRate.toFixed(1)}%`, "Replies ÷ outreach sent"],
            ["Interest rate", `${interestRate.toFixed(1)}%`, "Interested ÷ outreach sent"],
            ["Sales conversion", `${salesConversion.toFixed(1)}%`, "Paid customers ÷ outreach sent"],
            ["Average sale value", money(averageSale), "Revenue ÷ paid customers"]
          ].map(([label, value, note]) => (
            <div className="stat-card" key={label}>
              <div className="stat-top"><span>{label}</span></div>
              <div className="stat-value">{value}</div>
              <div className="stat-sub">{note}</div>
            </div>
          ))}
        </div>
        <p className="muted tiny">
          These are activity-based estimates. A prospect may receive multiple messages, so they are not unique-lead conversion rates.
        </p>
      </div>

      {/* DAILY ENTRY */}
      <div className="panel tracker-panel" style={{ marginBottom: 20 }}>
        <div className="tracker-header">
          <div>
            <h3>Activity log</h3>
            <p>Enter the actual numbers for the selected date.</p>
          </div>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
          />
        </div>

        {draft && (
          <>
            <div className="tracker-fields">
              {fields.map(([key, label]) => (
                <label className="tracker-field" key={key}>
                  <span>{label}</span>
                  <input
                    type="number"
                    min="0"
                    value={draft[key] ?? 0}
                    onChange={e => setDraft(current => ({
                      ...current,
                      [key]: key === "revenue"
                        ? Math.max(0, Number(e.target.value) || 0)
                        : Math.max(0, Number(e.target.value) || 0)
                    }))}
                  />
                </label>
              ))}
            </div>

            <label className="form-field">
              <span>Daily notes / what did you learn?</span>
              <textarea
                rows="3"
                value={draft.notes || ""}
                onChange={e => setDraft(current => ({
                  ...current,
                  notes: e.target.value
                }))}
                placeholder="What worked? What objections did you hear? What should change tomorrow?"
              />
            </label>

            <div className="inline-tip">
              <Sparkles size={16} />
              Log revenue only after payment is actually received.
            </div>

            <div style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: 16
            }}>
              <button className="btn primary" onClick={saveActivity}>
                <Check size={16} /> Save Activity
              </button>
            </div>
          </>
        )}
      </div>

      {/* WEEKLY AND MONTHLY GOALS */}
      <div className="panel" style={{ marginBottom: 20 }}>
        <div className="panel-head">
          <div>
            <h3>Activity goals</h3>
            <p>Set targets and measure your progress.</p>
          </div>
        </div>

        <div className="filter-tabs" style={{ marginBottom: 18 }}>
          <button
            className={goalPeriod === "weekly" ? "selected" : ""}
            onClick={() => setGoalPeriod("weekly")}
          >
            Weekly goals
          </button>
          <button
            className={goalPeriod === "monthly" ? "selected" : ""}
            onClick={() => setGoalPeriod("monthly")}
          >
            Monthly goals
          </button>
        </div>

        {[
          ["prospects", "Research prospects"],
          ["emails", "Send emails"],
          ["dms", "Send Instagram DMs"],
          ["followUps", "Send follow-ups"],
          ["previews", "Create website previews"],
          ["sales", "Get paying customers"]
        ].map(([key, label]) => {
          const target = Number(goalDraft[goalPeriod]?.[key] || 0);
          const start = parseDate(today);
          const day = start.getDay() || 7;

          const weekStart = formatISO(
            new Date(start.getFullYear(), start.getMonth(), start.getDate() - day + 1, 12)
          );
          const weekEnd = shiftDays(weekStart, 6);

          const monthStart = formatISO(
            new Date(start.getFullYear(), start.getMonth(), 1, 12)
          );
          const monthEnd = formatISO(
            new Date(start.getFullYear(), start.getMonth() + 1, 0, 12)
          );

          const goalStart = goalPeriod === "weekly" ? weekStart : monthStart;
          const goalEnd = goalPeriod === "weekly" ? weekEnd : monthEnd;

          const actual = data.activity
            .filter(item => item.date >= goalStart && item.date <= goalEnd)
            .reduce((sum, item) => sum + Number(item[key] || 0), 0);

          const percent = target
            ? Math.min(100, actual / target * 100)
            : 0;

          return (
            <div key={key} style={{ marginBottom: 18 }}>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
                flexWrap: "wrap"
              }}>
                <b>{label}</b>
                <span className="muted tiny">
                  {actual} / {target}
                </span>
              </div>

              <div className="progress" style={{ margin: "8px 0" }}>
                <i style={{ width: `${percent}%` }} />
              </div>

              <label className="form-field">
                <span>Target for {goalPeriod === "weekly" ? "this week" : "this month"}</span>
                <input
                  type="number"
                  min="0"
                  value={target}
                  onChange={e => changeGoal(key, e.target.value)}
                />
              </label>
            </div>
          );
        })}

        <button className="btn primary" onClick={saveGoals}>
          <Check size={16} /> Save activity goals
        </button>
      </div>

      {/* ACTIVITY HISTORY */}
      <div className="panel">
        <div className="panel-head">
          <div>
            <h3>Activity history</h3>
            <p>Find, edit, export or delete previous records.</p>
          </div>
          <button className="btn outline" onClick={exportActivity}>
            <Download size={15} /> Export CSV
          </button>
        </div>

        <div style={{ marginBottom: 16 }}>
          <input
            type="search"
            placeholder="Search by date, e.g. 2026-11-27 or Nov 27"
            value={historySearch}
            onChange={e => setHistorySearch(e.target.value)}
            style={{
              width: "100%",
              maxWidth: 380,
              padding: 11,
              border: "1px solid #ded7d0",
              borderRadius: 8
            }}
          />
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>NO.</th>
                <th>DATE</th>
                <th>PROSPECTS</th>
                <th>EMAILS</th>
                <th>DMs</th>
                <th>FOLLOW-UPS</th>
                <th>REPLIES</th>
                <th>SALES</th>
                <th>REVENUE</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item, index) => (
                <tr key={item.date}>
                  <td>{index + 1}</td>
                  <td>{shortDate(item.date)}</td>
                  <td>{item.prospects || 0}</td>
                  <td>{item.emails || 0}</td>
                  <td>{item.dms || 0}</td>
                  <td>{item.followUps || 0}</td>
                  <td>{item.replies || 0}</td>
                  <td>{item.sales || 0}</td>
                  <td>{money(item.revenue)}</td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        className="icon-btn"
                        title="Edit this date"
                        onClick={() => editRecord(item)}
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        className="icon-btn"
                        title="Delete this record"
                        onClick={() => deleteRecord(item.date)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!history.length && (
            <Empty text="No activity records found. Save your first daily entry." />
          )}
        </div>

        <p className="muted tiny" style={{ marginTop: 12 }}>
          Showing {history.length} saved activity records.
        </p>
      </div>
    </>
  );
}


function Tasks({data,update,setModal,search}) {
  const [filter,setFilter]=useState("All");
  const list=data.tasks.filter(t=>(filter==="All"||(filter==="Completed"?t.done:!t.done))&&`${t.title} ${t.category}`.toLowerCase().includes(search.toLowerCase())).sort((a,b)=>a.due.localeCompare(b.due));
  const toggle=id=>update("tasks",data.tasks.map(t=>t.id===id?{...t,done:!t.done}:t));
  return <>
    <PageHeading eyebrow="EXECUTION BOARD" title="Tasks & daily actions" subtitle="Turn the 90-day strategy into small actions you can complete." action="Create task" onAction={()=>setModal({type:"task"})}/>
    <div className="task-summary"><div><b>{data.tasks.filter(t=>!t.done).length}</b><span>Open tasks</span></div><div><b>{data.tasks.filter(t=>t.done).length}</b><span>Completed</span></div><div><b>{data.tasks.filter(t=>t.due===todayISO()&&!t.done).length}</b><span>Due today</span></div></div>
    <div className="panel"><div className="table-toolbar"><div className="filter-tabs">{["All","Open","Completed"].map(s=><button key={s} className={filter===s?"selected":""} onClick={()=>setFilter(s)}>{s}</button>)}</div></div>
      {list.map(t=><div className="task-card" key={t.id}><button className={`check-circle big ${t.done?"checked":""}`} onClick={()=>toggle(t.id)}>{t.done&&<Check size={13}/>}</button><div className="task-card-main"><b className={t.done?"strike":""}>{t.title}</b><span>{t.category} · Due {shortDate(t.due)} {t.notes?`· ${t.notes}`:""}</span></div><span className={`priority ${t.priority.toLowerCase()}`}>{t.priority}</span><button className="icon-btn" onClick={()=>setModal({type:"task",item:t})}><Pencil size={15}/></button></div>)}
      {!list.length&&<Empty text="No tasks in this view."/>}
    </div>
  </>;
}

function CalendarPage({data,update,setModal}) {
  const [month,setMonth]=useState(new Date());
  const year=month.getFullYear(), m=month.getMonth();
  const first=new Date(year,m,1), days=new Date(year,m+1,0).getDate(), offset=(first.getDay()+6)%7;
  const cells=[...Array(offset).fill(null),...Array(days).fill(0).map((_,i)=>i+1)];
  const eventsFor=(day)=>data.events.filter(e=>e.date===`${year}-${String(m+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`);
  return <>
    <PageHeading eyebrow="PLAN YOUR FOLLOW-THROUGH" title="Calendar" subtitle="Schedule outreach blocks, follow-ups, customer meetings and delivery dates." action="Add event" onAction={()=>setModal({type:"event"})}/>
    <div className="calendar-layout"><section className="panel calendar-panel"><div className="calendar-head"><button className="icon-btn" onClick={()=>setMonth(new Date(year,m-1,1))}><ChevronLeft/></button><h3>{month.toLocaleDateString("en-US",{month:"long",year:"numeric"})}</h3><button className="icon-btn" onClick={()=>setMonth(new Date(year,m+1,1))}><ChevronRight/></button><button className="text-btn today-btn" onClick={()=>setMonth(new Date())}>Today</button></div>
      <div className="calendar-grid">{["MON","TUE","WED","THU","FRI","SAT","SUN"].map(d=><div className="cal-weekday" key={d}>{d}</div>)}{cells.map((day,i)=><div key={i} className={`cal-cell ${!day?"blank":""} ${day&&`${year}-${String(m+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`===todayISO()?"is-today":""}`} onClick={()=>day&&setModal({type:"event",item:{date:`${year}-${String(m+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`}})}>{day&&<><span className="cal-day">{day}</span>{eventsFor(day).slice(0,2).map(e=><div className="cal-event" key={e.id}>{e.title}</div>)}{eventsFor(day).length>2&&<small>+{eventsFor(day).length-2} more</small>}</>}</div>)}</div>
    </section><section className="panel agenda-panel"><div className="panel-head"><div><h3>Upcoming events</h3><p>Your next scheduled actions.</p></div><CalendarPlus size={18}/></div>{data.events.filter(e=>e.date>=todayISO()).sort((a,b)=>a.date.localeCompare(b.date)).map(e=><div className="agenda-item" key={e.id}><div className="agenda-date"><b>{new Date(`${e.date}T12:00:00`).getDate()}</b><span>{new Date(`${e.date}T12:00:00`).toLocaleDateString("en-US",{month:"short"})}</span></div><div className="agenda-copy"><b>{e.title}</b><span>{e.time||"All day"} · {e.kind}</span></div><button className="icon-btn" onClick={()=>setModal({type:"event",item:e})}><Pencil size={14}/></button></div>)}{!data.events.length&&<Empty text="Your calendar is clear. Add your first event."/>}</section></div>
  </>;
}

function Milestones({data,update,setModal}) {
  const completed=data.milestones.filter(m=>m.done).length;
  return <>
    <PageHeading eyebrow="90-DAY SCORECARD" title="Milestones" subtitle="Track meaningful outcomes, not just busy work." action="Add milestone" onAction={()=>setModal({type:"milestone"})}/>
    <div className="milestone-progress panel"><div><span className="eyebrow">OVERALL COMPLETION</span><h2>{completed} <small>/ {data.milestones.length} milestones</small></h2></div><div className="large-progress"><i style={{width:`${data.milestones.length?completed/data.milestones.length*100:0}%`}}/></div></div>
    <div className="milestone-list">{data.milestones.map((m,i)=><div className={`milestone-card panel ${m.done?"is-done":""}`} key={m.id}><div className="milestone-index">{m.done?<Check size={18}/>:String(i+1).padStart(2,"0")}</div><div className="milestone-body"><div className="milestone-meta">TARGET DATE · {shortDate(m.target)}</div><h3 className={m.done?"strike":""}>{m.title}</h3><p>{m.detail}</p></div><button className={`btn ${m.done?"outline":"primary"}`} onClick={()=>update("milestones",data.milestones.map(x=>x.id===m.id?{...x,done:!x.done}:x))}>{m.done?"Completed":"Mark complete"}</button><button className="icon-btn" onClick={()=>setModal({type:"milestone",item:m})}><Pencil size={15}/></button></div>)}</div>
  </>;
}

function Outreach({data,setModal}) {
  return <>
    <PageHeading eyebrow="CONVERSATION STARTERS" title="Outreach studio" subtitle="Keep your message personal, relevant and focused on the owner's business."/>
    <div className="outreach-grid">
      <div className="panel outreach-card"><div className="outreach-icon"><Mail/></div><span className="eyebrow">FIRST CONTACT · EMAIL</span><h3>Personalized introduction</h3><p>Use when you have a specific observation about the business. Link to one relevant catalogue page or preview.</p><pre>{`Subject: A website idea for [Coffee Shop]

Hi [Name],

I came across [Business] and liked your
[real detail about their brand].

I create modern websites for independent
coffee shops. I had an idea for how your
menu, location and opening hours could
be easier for customers to find.

Would you be open to seeing a quick
personalized preview?

Best,
[Your name]`}</pre><button className="btn outline" onClick={()=>copyText("Subject: A website idea for [Coffee Shop]\n\nHi [Name],\n\nI came across [Business] and liked your [real detail about their brand].\n\nI create modern websites for independent coffee shops. I had an idea for how your menu, location and opening hours could be easier for customers to find.\n\nWould you be open to seeing a quick personalized preview?\n\nBest,\n[Your name]")}>Copy email <Download size={14}/></button></div>
      <div className="panel outreach-card"><div className="outreach-icon purple"><MessageSquare/></div><span className="eyebrow">SOCIAL · INSTAGRAM DM</span><h3>Friendly first message</h3><p>Start a genuine conversation. Don't paste a long pitch or send repeated messages.</p><pre>{`Hey! I found [Coffee Shop] and
really liked your [specific detail].

I design websites for independent
coffee shops and had an idea for
how your business could look online.

Would it be okay if I shared a
quick design example?`}</pre><button className="btn outline" onClick={()=>copyText("Hey! I found [Coffee Shop] and really liked your [specific detail].\n\nI design websites for independent coffee shops and had an idea for how your business could look online.\n\nWould it be okay if I shared a quick design example?")}>Copy DM <Download size={14}/></button></div>
      <div className="panel outreach-card"><div className="outreach-icon gold"><VideoIcon/></div><span className="eyebrow">FOLLOW-UP · LOOM</span><h3>Personalized video preview</h3><p>Record a 30–45 second screen walkthrough for your best-fit prospects. Show their business name, your design and mobile layout.</p><ul><li>Keep it under one minute.</li><li>Explain one or two useful improvements.</li><li>End with a low-pressure question.</li></ul><button className="btn outline" onClick={()=>window.open("https://www.loom.com/","_blank")}>Open Loom <ExternalLink size={14}/></button></div>
      <div className="panel outreach-card"><div className="outreach-icon green"><ListTodo/></div><span className="eyebrow">AFTER INTEREST · ONBOARDING</span><h3>Collect project details</h3><p>Only send your Tally requirements form after the customer agrees to proceed and the scope/payment terms are clear.</p><ul><li>Business name and contact details.</li><li>Logo, menu, photos and brand colors.</li><li>Location, opening hours and required features.</li></ul><button className="btn outline" onClick={()=>window.open("https://tally.so/","_blank")}>Open Tally <ExternalLink size={14}/></button></div>
    </div>
    <div className="inline-tip"><Bell size={16}/> Follow-up guidance: a polite follow-up after 3–5 business days can be reasonable. Stop if they decline or opt out.</div>
  </>;
}
function VideoIcon(){return <Send size={19}/>;}
function copyText(t){navigator.clipboard?.writeText(t);}
function Messages({data,update,setModal}) {
  const [filter,setFilter]=useState("All");
  const list=data.messages.filter(m=>filter==="All"||m.type===filter).sort((a,b)=>b.date.localeCompare(a.date));
  return <>
    <PageHeading eyebrow="INBOX NOTES" title="Messages & replies" subtitle="Manually log important replies from email, Instagram and other channels." action="Log a message" onAction={()=>setModal({type:"message"})}/>
    <div className="stats-strip"><span><b>{data.messages.length}</b> logged messages</span><span><b>{data.messages.filter(m=>m.type==="Interested").length}</b> interested</span><span><b>{data.messages.filter(m=>m.type==="Needs follow-up").length}</b> need follow-up</span></div>
    <div className="panel"><div className="table-toolbar"><div className="filter-tabs">{["All","Interested","Question","Not interested","Needs follow-up"].map(s=><button key={s} className={filter===s?"selected":""} onClick={()=>setFilter(s)}>{s}</button>)}</div></div>
      {list.map(m=><div className="message-row" key={m.id}><div className="message-icon"><MessageSquare size={17}/></div><div className="message-main"><div><b>{m.from}</b><span className="muted"> · {m.channel} · {shortDate(m.date)}</span></div><strong>{m.subject}</strong><p>{m.summary}</p><small>Follow-up: {shortDate(m.followUp)}</small></div><StatusPill status={m.type}/><button className="icon-btn" onClick={()=>setModal({type:"message",item:m})}><Pencil size={15}/></button></div>)}
      {!list.length&&<Empty text="No messages logged in this view."/>}
    </div>
  </>;
}

function SettingsPage({data,update,exportJSON,exportCSV,importJSON,notify}) {
  const [settings,setSettings]=useState(data.settings);
  const [goals,setGoals]=useState(data.goals);
  useEffect(()=>{setSettings(data.settings);setGoals(data.goals)},[data.settings,data.goals]);
  return <>
    <PageHeading eyebrow="WORKSPACE PREFERENCES" title="Settings & data" subtitle="Edit your business identity, revenue target and backup your records."/>
    <div className="settings-grid"><section className="panel settings-panel"><h3>Business profile</h3><p>These details personalize your workspace.</p><label className="form-field"><span>Business / workspace name</span><input value={settings.businessName||""} onChange={e=>setSettings({...settings,businessName:e.target.value})}/></label><label className="form-field"><span>Your name</span><input value={settings.ownerName||""} onChange={e=>setSettings({...settings,ownerName:e.target.value})}/></label><label className="form-field"><span>Business email</span><input type="email" value={settings.email||""} onChange={e=>setSettings({...settings,email:e.target.value})}/></label><button className="btn primary" onClick={()=>{update("settings",settings);notify("Business profile saved")}}>Save profile</button></section>
      <section className="panel settings-panel"><h3>90-day business goal</h3><p>Change your targets at any time.</p><label className="form-field"><span>Revenue goal (USD)</span><input type="number" value={goals.revenue} onChange={e=>setGoals({...goals,revenue:Number(e.target.value)})}/></label><label className="form-field"><span>Customer target</span><input type="number" value={goals.customers} onChange={e=>setGoals({...goals,customers:Number(e.target.value)})}/></label><label className="form-field"><span>Plan duration (days)</span><input type="number" value={goals.days} onChange={e=>setGoals({...goals,days:Number(e.target.value)})}/></label><label className="form-field"><span>Start date</span><input type="date" value={goals.startDate} onChange={e=>setGoals({...goals,startDate:e.target.value})}/></label><button className="btn primary" onClick={()=>{update("goals",goals);notify("Goals updated")}}>Save goals</button></section>
      <section className="panel settings-panel"><h3>Backup & export</h3><p>Your data is stored securely in your Supabase workspace. Back it up regularly.</p><div className="data-action"><div><b>Full workspace backup</b><span>All leads, tasks, messages, calendar and settings.</span></div><button className="btn outline" onClick={exportJSON}><Download size={15}/> Export JSON</button></div><div className="data-action"><div><b>Export lead list</b><span>Download your prospect records as CSV.</span></div><button className="btn outline" onClick={exportCSV}><Download size={15}/> Export CSV</button></div><div className="data-action"><div><b>Restore backup</b><span>Load a previously exported JSON backup.</span></div><label className="btn outline upload-btn"><Upload size={15}/> Import JSON<input type="file" accept=".json,application/json" onChange={e=>importJSON(e.target.files?.[0])}/></label></div></section>
      <section className="panel settings-panel warning-panel"><h3>Important data limitation</h3><p>Your dashboard records sync to your private Supabase workspace. This app does not yet connect to Gmail, send email automatically, or receive live inbox messages. Continue to export regular JSON backups.</p><p>Never put API keys, email passwords or private tokens into frontend code or a public GitHub repository.</p></section>
    </div>
  </>;
}

function Modal({modal,close,data,update,notify}) {
  const item=modal.item||{};
  const [form,setForm]=useState({...item});
  const [saving,setSaving]=useState(false);
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));
  const configs={
    lead:{title:item.id?"Edit prospect":"Add a prospect",key:"leads",fields:[["business","Business name","text"],["contact","Contact / owner","text"],["country","Country","text"],["email","Email","email"],["instagram","Instagram","text"],["website","Website URL","url"],["problem","Website opportunity","text"],["template","Suggested template number","text"],["source","Found through","text"],["status","Pipeline status","select",["New","Contacted","Replied","Interested","Preview sent","Negotiating","Won","Lost"]],["lastContact","Last contacted","date"],["nextFollowUp","Next follow-up","date"],["value","Expected value (USD)","number"],["notes","Notes","textarea"]]},
    task:{title:item.id?"Edit task":"Create task",key:"tasks",fields:[["title","Task title","text"],["category","Category","select",["Product","Prospecting","Sales","Delivery","Admin"]],["due","Due date","date"],["priority","Priority","select",["Low","Medium","High"]],["notes","Notes","textarea"]]},
    event:{title:item.id?"Edit calendar event":"Add calendar event",key:"events",fields:[["title","Event title","text"],["date","Date","date"],["time","Time","time"],["kind","Type","select",["Outreach","Follow-up","Meeting","Delivery","Admin"]],["notes","Notes","textarea"]]},
    milestone:{title:item.id?"Edit milestone":"Add milestone",key:"milestones",fields:[["title","Milestone","text"],["target","Target date","date"],["detail","What does success look like?","textarea"]]},
    message:{title:item.id?"Edit message":"Log a customer message",key:"messages",fields:[["from","From / business","text"],["channel","Channel","select",["Email","Instagram","Facebook","Other"]],["date","Date received","date"],["subject","Subject","text"],["type","Reply type","select",["Interested","Question","Not interested","Needs follow-up"]],["summary","Message summary","textarea"],["followUp","Follow-up date","date"]]}
  };
  const cfg=configs[modal.type];
  const save=()=>{
    const record={...form,id:item.id||uid()};
    const arr=data[cfg.key];
    update(cfg.key,item.id?arr.map(x=>x.id===item.id?record:x):[record,...arr]);
    notify(item.id?"Changes saved":"New record added");close();
  };
  const remove=()=>{
    if(!item.id||!window.confirm("Delete this record?"))return;
    update(cfg.key,data[cfg.key].filter(x=>x.id!==item.id));notify("Record deleted");close();
  };
  return <div className="modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&close()}><div className="modal"><div className="modal-head"><div><span className="eyebrow">WORKSPACE RECORD</span><h2>{cfg.title}</h2></div><button className="icon-btn" onClick={close}><X/></button></div><div className="modal-fields">{cfg.fields.map(([key,label,type,options])=><label className={`form-field ${type==="textarea"?"wide":""}`} key={key}><span>{label}</span>{type==="textarea"?<textarea rows="3" value={form[key]||""} onChange={e=>set(key,e.target.value)}/>:type==="select"?<select value={form[key]||options[0]} onChange={e=>set(key,e.target.value)}>{options.map(o=><option key={o}>{o}</option>)}</select>:<input type={type} value={form[key]??""} onChange={e=>set(key,type==="number"?Number(e.target.value):e.target.value)}/>}</label>)}</div><div className="modal-actions">{item.id&&<button className="btn danger-ghost" onClick={remove}><Trash2 size={15}/> Delete</button>}<div/><button className="btn outline" onClick={close}>Cancel</button><button className="btn primary" onClick={save}><Check size={15}/> Save record</button></div></div></div>;
}

function downloadBlob(blob,name){const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=name;a.click();URL.revokeObjectURL(url);}


const authPageStyle = { minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, background: "#f4efe9", fontFamily: "Inter, system-ui, sans-serif" };
const authCardStyle = { width: "100%", maxWidth: 420, boxSizing: "border-box", padding: 32, borderRadius: 18, background: "#fff", boxShadow: "0 18px 60px rgba(55,35,20,.12)" };
const authLabelStyle = { display: "block", marginBottom: 16, color: "#4d4038", fontSize: 13, fontWeight: 600 };
const authInputStyle = { display: "block", boxSizing: "border-box", width: "100%", marginTop: 7, padding: "12px 13px", border: "1px solid #ded5cc", borderRadius: 9, fontSize: 15, outlineColor: "#9a7558" };
const authButtonStyle = { width: "100%", marginTop: 8, padding: 13, border: 0, borderRadius: 9, background: "#59402f", color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer" };
const authSwitchStyle = { width: "100%", marginTop: 16, border: 0, background: "transparent", color: "#79583f", cursor: "pointer", fontSize: 14 };

export default App;
