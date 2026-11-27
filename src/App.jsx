import React, { useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard, Users, CheckSquare, CalendarDays, Flag, Mail,
  MessageSquare, Settings, Search, Plus, ChevronDown, ArrowUpRight,
  ArrowDownRight, Coffee, CircleCheck, Clock3, Target, TrendingUp,
  MoreHorizontal, X, Trash2, Pencil, Download, Upload, Menu, Send,
  Phone, Globe, ExternalLink, Filter, Bell, CalendarPlus, Sparkles,
  CircleDollarSign, ListTodo, Check, ChevronLeft, ChevronRight,
  PanelLeftClose, PanelLeftOpen
} from "lucide-react";

const STORE_KEY = "roast-revenue-hq-v1";
const todayISO = () => new Date().toISOString().slice(0, 10);
const plusDays = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

// Starter records make the dashboard useful immediately. Edit or delete these examples.
const initialData = {
  goals: { revenue: 1000, customers: 10, days: 90, startDate: todayISO() },
  leads: [
    { id: 1, business: "Harbor & Oak Coffee", contact: "Jamie", country: "USA", email: "hello@example.com", instagram: "@harborandoak", website: "https://example.com", problem: "Outdated mobile website", template: "04", source: "Google Maps", status: "Contacted", lastContact: todayISO(), nextFollowUp: plusDays(2), notes: "Interested in a cleaner menu layout.", value: 99 },
    { id: 2, business: "Sunday Roast Cafe", contact: "Morgan", country: "USA", email: "owner@example.com", instagram: "@sundayroast", website: "", problem: "No dedicated website", template: "08", source: "Instagram", status: "New", lastContact: "", nextFollowUp: "", notes: "", value: 99 },
    { id: 3, business: "Little Fern Coffee", contact: "Alex", country: "Canada", email: "team@example.com", instagram: "@littleferncoffee", website: "https://example.org", problem: "Menu hard to find", template: "12", source: "Google Maps", status: "Interested", lastContact: plusDays(-1), nextFollowUp: plusDays(1), notes: "Asked to see a personalized preview.", value: 149 },
  ],
  tasks: [
    { id: 1, title: "Finish templates 01–05", category: "Product", due: todayISO(), priority: "High", done: false, notes: "Luxury and premium category" },
    { id: 2, title: "Research 25 qualified coffee shops", category: "Prospecting", due: todayISO(), priority: "High", done: false, notes: "Prioritize independent businesses" },
    { id: 3, title: "Send personalized Loom previews", category: "Sales", due: plusDays(1), priority: "Medium", done: false, notes: "Only for best-fit prospects" },
    { id: 4, title: "Review follow-ups", category: "Sales", due: plusDays(2), priority: "Medium", done: true, notes: "" },
  ],
  activity: [
    { id: 1, date: todayISO(), prospects: 12, emails: 8, dms: 3, followUps: 4, previews: 1, replies: 2, interested: 1, sales: 0, revenue: 0, notes: "Example daily activity — replace with your real numbers." }
  ],
  milestones: [
    { id: 1, title: "Publish first 5 templates", target: plusDays(5), detail: "First premium designs are live.", done: false },
    { id: 2, title: "Publish all 20 templates", target: plusDays(14), detail: "Catalogue is ready for prospects.", done: false },
    { id: 3, title: "First paying customer", target: plusDays(21), detail: "Validate the offer and delivery process.", done: false },
    { id: 4, title: "Reach $500 revenue", target: plusDays(55), detail: "Halfway to the revenue goal.", done: false },
    { id: 5, title: "Reach $1,000 revenue", target: plusDays(90), detail: "90-day business target.", done: false },
  ],
  messages: [
    { id: 1, date: todayISO(), channel: "Email", from: "Harbor & Oak Coffee", subject: "Re: Website idea", type: "Interested", summary: "Asked to see the mobile preview.", followUp: plusDays(1), leadId: 1 }
  ],
  events: [
    { id: 1, title: "Review warm leads", date: todayISO(), time: "16:00", kind: "Sales", notes: "Follow up with interested owners." }
  ],
  settings: { businessName: "Roast & Revenue", ownerName: "", email: "", currency: "USD" }
};

function loadData() {
  try {
    const saved = localStorage.getItem(STORE_KEY);
    return saved ? { ...initialData, ...JSON.parse(saved) } : initialData;
  } catch {
    return initialData;
  }
}
const money = (n) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(Number(n || 0));
const shortDate = (v) => v ? new Date(`${v}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—";
const uid = () => Date.now() + Math.floor(Math.random() * 1000);

export default function App() {
  // All business records live in one state object and are saved to this browser automatically.
  const [data, setData] = useState(loadData);
  const [page, setPage] = useState("Overview");
  const [modal, setModal] = useState(null);
  const [search, setSearch] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [toast, setToast] = useState("");

  useEffect(() => {
    localStorage.setItem(STORE_KEY, JSON.stringify(data));
  }, [data]);

  const update = (key, value) => setData((d) => ({ ...d, [key]: value }));
  const notify = (msg) => { setToast(msg); window.setTimeout(() => setToast(""), 2600); };

  const totals = useMemo(() => {
    const revenue = data.activity.reduce((s, x) => s + Number(x.revenue || 0), 0);
    const sales = data.activity.reduce((s, x) => s + Number(x.sales || 0), 0);
    const prospects = data.activity.reduce((s, x) => s + Number(x.prospects || 0), 0);
    const emails = data.activity.reduce((s, x) => s + Number(x.emails || 0), 0);
    const replies = data.activity.reduce((s, x) => s + Number(x.replies || 0), 0);
    const pending = data.tasks.filter((t) => !t.done).length;
    return { revenue, sales, prospects, emails, replies, pending };
  }, [data]);

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
            <button className="avatar top-avatar" onClick={() => setPage("Settings")}>RR</button>
          </div>
        </header>

        <div className="content">
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
        <footer className="footer"><span>Roast & Revenue HQ</span><span>Keep showing up. The numbers will tell you what to improve.</span><span>Saved in this browser <i className="online-dot"/></span></footer>
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

function Tracker({data,update,notify}) {
  const [date,setDate] = useState(todayISO());
  const current = data.activity.find(a=>a.date===date) || {date,prospects:0,emails:0,dms:0,followUps:0,previews:0,replies:0,interested:0,sales:0,revenue:0,notes:""};
  const fields = [["prospects","New prospects researched"],["emails","Personalized emails sent"],["dms","Instagram DMs sent"],["followUps","Follow-ups sent"],["previews","Personalized previews sent"],["replies","Replies received"],["interested","Interested prospects"],["sales","Customers who paid"],["revenue","Revenue received ($)"]];
  const setField=(k,v)=> {
    const updated={...current,[k]:Math.max(0,Number(v)||0)};
    update("activity",[...data.activity.filter(a=>a.date!==date),updated].sort((a,b)=>a.date.localeCompare(b.date)));
  };
  return <>
    <PageHeading eyebrow="CONSISTENCY BUILDS REVENUE" title="Daily activity tracker" subtitle="Log what happened today. Your dashboard and revenue progress update automatically."/>
    <div className="panel tracker-panel">
      <div className="tracker-header"><div><h3>Activity log</h3><p>Use actual numbers, not estimates.</p></div><input type="date" value={date} onChange={e=>setDate(e.target.value)}/></div>
      <div className="tracker-fields">{fields.map(([k,label])=><label className="tracker-field" key={k}><span>{label}</span><input type="number" min="0" value={current[k]??0} onChange={e=>setField(k,e.target.value)}/></label>)}</div>
      <label className="form-field"><span>Daily notes / what did you learn?</span><textarea rows="3" value={current.notes||""} onChange={e=>setField("notes",e.target.value)} placeholder="What worked? What objections did you hear? What should change tomorrow?"/></label>
      <div className="inline-tip"><Sparkles size={16}/> Log revenue only after payment is actually received. A verbal yes is not a sale.</div>
    </div>
    <div className="panel"><div className="panel-head"><div><h3>Activity history</h3><p>Review consistency over time.</p></div></div><div className="table-wrap"><table><thead><tr><th>DATE</th><th>PROSPECTS</th><th>EMAILS</th><th>DMs</th><th>FOLLOW-UPS</th><th>REPLIES</th><th>SALES</th><th>REVENUE</th></tr></thead><tbody>{[...data.activity].sort((a,b)=>b.date.localeCompare(a.date)).map(a=><tr key={a.date}><td>{shortDate(a.date)}</td><td>{a.prospects}</td><td>{a.emails}</td><td>{a.dms}</td><td>{a.followUps}</td><td>{a.replies}</td><td>{a.sales}</td><td>{money(a.revenue)}</td></tr>)}</tbody></table></div></div>
  </>;
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
      <section className="panel settings-panel"><h3>Backup & export</h3><p>Your data is stored in this browser. Back it up regularly.</p><div className="data-action"><div><b>Full workspace backup</b><span>All leads, tasks, messages, calendar and settings.</span></div><button className="btn outline" onClick={exportJSON}><Download size={15}/> Export JSON</button></div><div className="data-action"><div><b>Export lead list</b><span>Download your prospect records as CSV.</span></div><button className="btn outline" onClick={exportCSV}><Download size={15}/> Export CSV</button></div><div className="data-action"><div><b>Restore backup</b><span>Load a previously exported JSON backup.</span></div><label className="btn outline upload-btn"><Upload size={15}/> Import JSON<input type="file" accept=".json,application/json" onChange={e=>importJSON(e.target.files?.[0])}/></label></div></section>
      <section className="panel settings-panel warning-panel"><h3>Important data limitation</h3><p>This starter app saves records in the current browser using local storage. It does not yet sync across devices or users, connect to Gmail, send email automatically, or receive live inbox messages. Use JSON backups until a secure database and integrations are added.</p><p>Never put API keys, email passwords or private tokens into frontend code or a public GitHub repository.</p></section>
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
