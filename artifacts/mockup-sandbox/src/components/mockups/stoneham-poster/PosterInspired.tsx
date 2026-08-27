import { useState } from "react";

type Product = {
  name: string;
  detail: string;
  price: string;
  accent: string;
};

const vendors = [
  {
    name: "Riverdale Farm",
    place: "Tewksbury, MA",
    note: "Just-picked, dirt-under-the-fingernails good.",
    products: [
      { name: "Heirloom tomatoes", detail: "Mixed pint · grown this week", price: "$6.00", accent: "#df332f" },
      { name: "Blueberries", detail: "Fresh pint · sweet and local", price: "$7.50", accent: "#356b4e" },
      { name: "Rainbow carrots", detail: "Bunch · purple, orange, yellow", price: "$4.00", accent: "#db7437" },
    ],
  },
  {
    name: "Bellini Baking Co.",
    place: "Stoneham, MA",
    note: "Small-batch breads, pastries, and the good kind of crumbs.",
    products: [
      { name: "Rosemary sourdough", detail: "One boule · naturally leavened", price: "$9.00", accent: "#bd8b43" },
      { name: "Strawberry galette", detail: "Serves 4 · local berries", price: "$14.00", accent: "#df332f" },
      { name: "Morning focaccia", detail: "Olive oil · sea salt · herbs", price: "$8.00", accent: "#356b4e" },
    ],
  },
  {
    name: "Del Sur Empanadas",
    place: "Woburn, MA",
    note: "Hand-folded comfort food with a little Buenos Aires spirit.",
    products: [
      { name: "Beef empanadas", detail: "Half dozen · oven baked", price: "$18.00", accent: "#df332f" },
      { name: "Spinach & cheese", detail: "Half dozen · vegetarian", price: "$17.00", accent: "#356b4e" },
    ],
  },
];

const css = `
  .sfm-root { --cream:#f7f0df; --paper:#fffaf0; --ink:#17251e; --green:#286345; --red:#d92f32; --line:#c9bfa9; background:var(--cream); color:var(--ink); min-height:100vh; font-family:Georgia, 'Times New Roman', serif; }
  .sfm-root * { box-sizing:border-box; }
  .sfm-root button, .sfm-root a { -webkit-tap-highlight-color:transparent; }
  .sfm-root button { font:inherit; cursor:pointer; }
  .sfm-topline { height:9px; background:var(--green); }
  .sfm-nav { max-width:1220px; margin:auto; padding:19px 5vw 15px; display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid var(--line); }
  .sfm-brand { text-decoration:none; color:var(--ink); display:flex; gap:10px; align-items:center; }
  .sfm-mark { width:36px; height:36px; border:2px solid var(--red); border-radius:50%; display:grid; place-items:center; color:var(--red); font:700 17px/1 'Arial Narrow', sans-serif; transform:rotate(-8deg); }
  .sfm-brand strong { font:700 15px/1 'Arial Narrow', sans-serif; letter-spacing:.08em; text-transform:uppercase; }
  .sfm-brand small { display:block; color:var(--green); font:600 10px/1.4 'Arial Narrow',sans-serif; letter-spacing:.14em; text-transform:uppercase; }
  .sfm-navlinks { display:flex; gap:28px; align-items:center; font:700 11px 'Arial Narrow',sans-serif; letter-spacing:.12em; text-transform:uppercase; }
  .sfm-navlinks a { color:var(--ink); text-decoration:none; }
  .sfm-navlinks a:hover { color:var(--red); }
  .sfm-navlinks button { border:0; background:var(--red); color:var(--paper); padding:11px 16px; font:700 11px 'Arial Narrow',sans-serif; letter-spacing:.11em; text-transform:uppercase; }
  .sfm-hero { max-width:1220px; margin:auto; display:grid; grid-template-columns:1fr 1fr; min-height:560px; border-bottom:1px solid var(--line); }
  .sfm-hero-copy { padding:66px 6vw 55px 5vw; display:flex; flex-direction:column; justify-content:center; position:relative; }
  .sfm-kicker { color:var(--green); font:700 13px 'Arial Narrow',sans-serif; letter-spacing:.23em; text-transform:uppercase; margin:0 0 16px; }
  .sfm-title { margin:0; font:800 clamp(66px,8.5vw,126px)/.79 'Arial Narrow', Impact, sans-serif; letter-spacing:-.055em; text-transform:uppercase; color:var(--red); }
  .sfm-title span { color:var(--green); display:block; }
  .sfm-hero-rule { width:100px; height:5px; background:var(--red); margin:27px 0 22px; }
  .sfm-lede { font-size:22px; line-height:1.22; max-width:420px; margin:0 0 26px; }
  .sfm-script { color:var(--green); font:italic 34px/1.1 'Brush Script MT', 'Segoe Script', cursive; transform:rotate(-3deg); display:block; margin:0 0 28px; }
  .sfm-cta { display:flex; gap:12px; align-items:center; flex-wrap:wrap; }
  .sfm-btn { border:2px solid var(--green); background:var(--green); color:var(--paper); padding:14px 20px; font:700 12px 'Arial Narrow',sans-serif; letter-spacing:.15em; text-transform:uppercase; text-decoration:none; transition:transform .2s, background .2s, color .2s; }
  .sfm-btn:hover, .sfm-btn:focus-visible { background:var(--red); border-color:var(--red); transform:translateY(-2px); outline:none; }
  .sfm-btn.alt { background:transparent; color:var(--green); }
  .sfm-btn.alt:hover { color:var(--paper); }
  .sfm-date { margin-top:37px; display:flex; gap:15px; align-items:center; }
  .sfm-date-day { color:var(--red); font:800 47px/.8 'Arial Narrow',sans-serif; letter-spacing:-.06em; }
  .sfm-date-copy { border-left:1px solid var(--line); padding-left:15px; font-size:15px; line-height:1.35; }
  .sfm-date-copy b { font:700 12px 'Arial Narrow',sans-serif; letter-spacing:.12em; text-transform:uppercase; }
  .sfm-hero-photo { position:relative; min-height:450px; overflow:hidden; }
  .sfm-hero-photo img { width:100%; height:100%; object-fit:cover; display:block; filter:saturate(.9) contrast(1.04); }
  .sfm-photo-label { position:absolute; left:26px; bottom:24px; background:var(--paper); border:2px solid var(--green); padding:13px 17px; color:var(--green); font:700 12px 'Arial Narrow',sans-serif; letter-spacing:.12em; text-transform:uppercase; transform:rotate(-2deg); }
  .sfm-photo-label em { display:block; color:var(--red); font:italic 22px Georgia,serif; letter-spacing:0; text-transform:none; margin-top:4px; }
  .sfm-strip { background:var(--green); color:var(--paper); padding:13px 5vw; display:flex; justify-content:center; gap:48px; flex-wrap:wrap; font:700 11px 'Arial Narrow',sans-serif; letter-spacing:.15em; text-transform:uppercase; }
  .sfm-strip span::before { content:'✦'; color:#e7b957; margin-right:10px; }
  .sfm-section { max-width:1220px; margin:auto; padding:74px 5vw; }
  .sfm-section-head { display:flex; justify-content:space-between; align-items:end; margin-bottom:34px; gap:20px; }
  .sfm-eyebrow { color:var(--red); font:700 12px 'Arial Narrow',sans-serif; letter-spacing:.2em; text-transform:uppercase; margin:0 0 8px; }
  .sfm-h2 { margin:0; font:800 clamp(42px,6vw,73px)/.84 'Arial Narrow',Impact,sans-serif; letter-spacing:-.045em; text-transform:uppercase; color:var(--green); }
  .sfm-head-note { font-style:italic; font-size:16px; max-width:260px; line-height:1.3; text-align:right; }
  .sfm-vendor { border-top:3px solid var(--green); padding:26px 0 38px; display:grid; grid-template-columns:30% 1fr; gap:35px; }
  .sfm-vendor-name { font:800 32px/.92 'Arial Narrow',sans-serif; text-transform:uppercase; letter-spacing:-.02em; color:var(--red); }
  .sfm-vendor-place { margin-top:9px; font:italic 15px Georgia,serif; }
  .sfm-vendor-note { margin-top:19px; font-size:15px; line-height:1.35; max-width:250px; }
  .sfm-products { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; }
  .sfm-product { background:var(--paper); border:1px solid var(--line); min-height:162px; padding:18px 16px 15px; display:flex; flex-direction:column; justify-content:space-between; transition:transform .2s, box-shadow .2s; }
  .sfm-product:hover { transform:translateY(-4px); box-shadow:5px 5px 0 var(--red); }
  .sfm-product-top { display:flex; justify-content:space-between; gap:8px; }
  .sfm-product h3 { font:700 20px/1.05 Georgia,serif; margin:0; }
  .sfm-price { font:700 15px 'Arial Narrow',sans-serif; color:var(--red); white-space:nowrap; }
  .sfm-detail { font-size:13px; color:#536159; margin:8px 0 16px; line-height:1.25; }
  .sfm-reserve { align-self:start; border:0; border-bottom:2px solid var(--green); color:var(--green); background:transparent; padding:0 0 3px; font:700 11px 'Arial Narrow',sans-serif; letter-spacing:.12em; text-transform:uppercase; }
  .sfm-reserve:hover { color:var(--red); border-color:var(--red); }
  .sfm-how { background:var(--red); color:var(--paper); max-width:none; padding:70px max(5vw, calc((100% - 1120px)/2)); }
  .sfm-how .sfm-h2 { color:var(--paper); }
  .sfm-steps { display:grid; grid-template-columns:repeat(3,1fr); gap:35px; margin-top:42px; }
  .sfm-step { border-top:1px solid rgba(255,250,240,.55); padding-top:15px; }
  .sfm-step-num { font:800 45px/.8 'Arial Narrow',sans-serif; color:#f2ba64; }
  .sfm-step h3 { font:700 22px Georgia,serif; margin:17px 0 8px; }
  .sfm-step p { line-height:1.4; font-size:15px; margin:0; max-width:270px; }
  .sfm-info { display:grid; grid-template-columns:1fr 1fr; gap:0; border:2px solid var(--green); background:var(--paper); }
  .sfm-info-block { padding:32px; }
  .sfm-info-block + .sfm-info-block { border-left:1px solid var(--line); }
  .sfm-info h3 { margin:0 0 9px; font:800 29px/.95 'Arial Narrow',sans-serif; text-transform:uppercase; color:var(--green); }
  .sfm-info p { margin:0; font-size:17px; line-height:1.42; }
  .sfm-footer { background:var(--green); color:var(--paper); text-align:center; padding:43px 5vw 50px; }
  .sfm-footer h2 { margin:0; font:800 34px/.9 'Arial Narrow',sans-serif; text-transform:uppercase; }
  .sfm-footer p { margin:14px 0 0; font-size:15px; }
  .sfm-modal-backdrop { position:fixed; inset:0; background:rgba(23,37,30,.68); z-index:10; display:grid; place-items:center; padding:20px; }
  .sfm-modal { background:var(--paper); border:3px solid var(--green); max-width:455px; width:100%; padding:28px; position:relative; box-shadow:9px 9px 0 var(--red); }
  .sfm-modal h2 { color:var(--red); font:800 35px/.9 'Arial Narrow',sans-serif; text-transform:uppercase; margin:0 30px 10px 0; }
  .sfm-modal p { line-height:1.4; margin:0 0 20px; }
  .sfm-modal label { display:block; font:700 11px 'Arial Narrow',sans-serif; letter-spacing:.14em; text-transform:uppercase; color:var(--green); margin:13px 0 6px; }
  .sfm-modal input { width:100%; padding:12px; border:1px solid var(--line); background:var(--cream); color:var(--ink); font:16px Georgia,serif; }
  .sfm-close { position:absolute; right:16px; top:12px; border:0; background:none; color:var(--green); font-size:26px; }
  @media (max-width:760px) {
    .sfm-navlinks a { display:none; }
    .sfm-hero { grid-template-columns:1fr; }
    .sfm-hero-copy { padding:50px 7vw 40px; }
    .sfm-hero-photo { min-height:300px; order:-1; }
    .sfm-title { font-size:clamp(52px, 15vw, 62px); letter-spacing:-.07em; }
    .sfm-script { font-size:29px; }
    .sfm-strip { gap:14px 25px; justify-content:flex-start; }
    .sfm-section { padding:54px 7vw; }
    .sfm-section-head { display:block; }
    .sfm-head-note { text-align:left; margin-top:16px; }
    .sfm-vendor { grid-template-columns:1fr; gap:21px; }
    .sfm-products { grid-template-columns:1fr; }
    .sfm-steps, .sfm-info { grid-template-columns:1fr; }
    .sfm-info-block + .sfm-info-block { border-left:0; border-top:1px solid var(--line); }
  }
`;

export function PosterInspired() {
  const [selected, setSelected] = useState<{ product: Product; vendor: string } | null>(null);
  const [reserved, setReserved] = useState(false);

  const reserve = (product: Product, vendor: string) => {
    setSelected({ product, vendor });
    setReserved(false);
  };

  return (
    <main className="sfm-root">
      <style>{css}</style>
      <div className="sfm-topline" />
      <nav className="sfm-nav" aria-label="Main navigation">
        <a className="sfm-brand" href="#top">
          <span className="sfm-mark">S</span>
          <span><strong>Stoneham</strong><small>Farmers Market</small></span>
        </a>
        <div className="sfm-navlinks">
          <a href="#vendors">Vendors</a>
          <a href="#how">How it works</a>
          <button onClick={() => document.getElementById("vendors")?.scrollIntoView({ behavior: "smooth" })}>Browse &amp; reserve</button>
        </div>
      </nav>

      <section className="sfm-hero" id="top">
        <div className="sfm-hero-copy">
          <p className="sfm-kicker">Community and connection</p>
          <h1 className="sfm-title">Stoneham<span>Farmers<br />Market</span></h1>
          <div className="sfm-hero-rule" />
          <p className="sfm-lede">Real food. Real neighbors. Everything worth bringing home on Thursday.</p>
          <span className="sfm-script">See it. Reserve it. Pick it up.</span>
          <div className="sfm-cta">
            <a className="sfm-btn" href="#vendors">Shop this week</a>
            <a className="sfm-btn alt" href="#how">How pickup works</a>
          </div>
          <div className="sfm-date">
            <span className="sfm-date-day">THU</span>
            <span className="sfm-date-copy"><b>Every Thursday</b><br />2:30–6:30 PM · Town Common<br />340 Main Street, Stoneham</span>
          </div>
        </div>
        <div className="sfm-hero-photo">
          <img src="/__mockup/images/market-hero.jpg" alt="Fresh carrots and greens at the Stoneham farmers market" />
          <div className="sfm-photo-label">Fresh from nearby<em>Bring your appetite.</em></div>
        </div>
      </section>

      <div className="sfm-strip"><span>Browse local</span><span>Reserve ahead</span><span>Pick up Thursday</span><span>Pay your vendor</span></div>

      <section className="sfm-section" id="vendors">
        <div className="sfm-section-head">
          <div><p className="sfm-eyebrow">Coming this Thursday</p><h2 className="sfm-h2">Meet the<br />makers</h2></div>
          <p className="sfm-head-note">A little something for dinner, breakfast, and the walk home.</p>
        </div>
        {vendors.map((vendor) => (
          <article className="sfm-vendor" key={vendor.name}>
            <div><div className="sfm-vendor-name">{vendor.name}</div><div className="sfm-vendor-place">{vendor.place}</div><p className="sfm-vendor-note">{vendor.note}</p></div>
            <div className="sfm-products">
              {vendor.products.map((product) => (
                <div className="sfm-product" key={product.name} style={{ borderTop: `6px solid ${product.accent}` }}>
                  <div><div className="sfm-product-top"><h3>{product.name}</h3><span className="sfm-price">{product.price}</span></div><p className="sfm-detail">{product.detail}</p></div>
                  <button className="sfm-reserve" onClick={() => reserve(product, vendor.name)}>Reserve for pickup</button>
                </div>
              ))}
            </div>
          </article>
        ))}
      </section>

      <section className="sfm-how" id="how">
        <p className="sfm-eyebrow" style={{ color: "#f2ba64" }}>No lines. No guesswork.</p>
        <h2 className="sfm-h2">Reserve your<br />Thursday.</h2>
        <div className="sfm-steps">
          <div className="sfm-step"><div className="sfm-step-num">01</div><h3>Browse online</h3><p>See who is coming and what they are bringing before market day.</p></div>
          <div className="sfm-step"><div className="sfm-step-num">02</div><h3>Reserve favorites</h3><p>Hold the good stuff ahead of time. No payment needed now.</p></div>
          <div className="sfm-step"><div className="sfm-step-num">03</div><h3>Pick up at the booth</h3><p>Show your confirmation, pay the vendor directly, and head home happy.</p></div>
        </div>
      </section>

      <section className="sfm-section">
        <div className="sfm-info">
          <div className="sfm-info-block"><h3>Market day</h3><p><strong>Every Thursday</strong><br />2:30–6:30 PM<br />Stoneham Town Common<br />340 Main Street</p></div>
          <div className="sfm-info-block"><h3>Good to know</h3><p>Reservations are held until 5:45 PM. Bring your confirmation code and your favorite market bag.</p></div>
        </div>
      </section>

      <footer className="sfm-footer"><h2>Support local. Eat fresh.<br />Build community.</h2><p>A United Main pilot · Stoneham, Massachusetts</p></footer>

      {selected && <div className="sfm-modal-backdrop" role="presentation" onClick={(event) => { if (event.target === event.currentTarget) setSelected(null); }}>
        <div className="sfm-modal" role="dialog" aria-modal="true" aria-labelledby="reserve-title">
          <button className="sfm-close" aria-label="Close reservation" onClick={() => setSelected(null)}>×</button>
          {reserved ? <><h2 id="reserve-title">You’re on the list.</h2><p>{selected.product.name} from {selected.vendor} is held for you until 5:45 PM Thursday. We’ll send the details to your inbox.</p><button className="sfm-btn" onClick={() => setSelected(null)}>Done</button></> :
            <><h2 id="reserve-title">Reserve a favorite.</h2><p><strong>{selected.product.name}</strong> · {selected.vendor}<br />{selected.product.price} · pickup at the Town Common</p><label htmlFor="reserve-name">Your name</label><input id="reserve-name" placeholder="First and last name" /><label htmlFor="reserve-email">Email for confirmation</label><input id="reserve-email" type="email" placeholder="you@example.com" /><button className="sfm-btn" style={{ marginTop: 20 }} onClick={() => setReserved(true)}>Confirm reservation</button></>}
        </div>
      </div>}
    </main>
  );
}

export default PosterInspired;