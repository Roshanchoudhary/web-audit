import { useMemo, useState, type FormEvent } from 'react';
import { useI18n } from '../i18n';
import { SEOHead } from '../components/SEOHead';
import { normalizeUrlInput, validateUrlInput, displayHost } from '../utils/url';

type Copy = {
  badge: string; title: string; intro: string; country: string; website: string;
  submit: string; reportTitle: string; overview: string;
  local: string; content: string; mobile: string; trust: string; competitorTitle: string;
  competitorNote: string; actions: string; actionItems: string[]; industries: string[];
};
function faviconFor(raw: string): string | null {
  const candidate = normalizeUrlInput(raw);
  if (!candidate || !validateUrlInput(candidate).ok) return null;
  try { return `https://www.google.com/s2/favicons?domain_url=${encodeURIComponent(new URL(candidate).origin)}&sz=64`; } catch { return null; }
}
function normalizedDomain(raw: string): string {
  const candidate = normalizeUrlInput(raw);
  return candidate && validateUrlInput(candidate).ok ? candidate : raw.trim();
}

const COPY: Record<string, Copy> = {
  en: { badge:'LOCAL SEO & GEO VISIBILITY', title:'Geo Audit', intro:'A practical local visibility review for your business. Build a structured report covering local SEO, business listings, content, mobile experience and competitor research.', business:'Business name', location:'City / service area', website:'Website URL', industry:'Industry', competitor:'Competitor websites (optional, comma-separated)', submit:'Build audit checklist', reportTitle:'Your Geo Audit report', overview:'Audit overview', local:'Local search presence', content:'Content & on-page SEO', mobile:'Mobile experience', trust:'Trust, reviews & business listings', competitorTitle:'Competitor comparison', competitorNote:'Competitor scores are not fetched live. Add verified competitor URLs and compare the same public signals manually; never treat missing data as a failing score.', actions:'Prioritised recommendations', actionItems:['Complete and verify your Google Business Profile; keep name, address/service area, phone and hours consistent.','Create a dedicated, useful landing page for each real service area—avoid doorway pages and duplicated city pages.','Add clear service pages, descriptive titles, local business details, FAQs and relevant LocalBusiness structured data.','Make contact, directions, phone and enquiry actions easy to use on small screens; test page speed and Core Web Vitals separately.','Request genuine customer reviews, respond professionally and keep business listings accurate across trusted directories.','Review each named competitor’s service coverage, page quality, reviews, local citations and useful content; record evidence and date checked.'], industries:['Select industry','Retail & ecommerce','Healthcare','Hospitality & restaurants','Professional services','Real estate','Education','Home services','Travel & tourism','Automotive','Other'] },
  hi: { badge:'लोकल SEO और GEO विज़िबिलिटी', title:'Geo Audit', intro:'अपने व्यवसाय की स्थानीय ऑनलाइन उपस्थिति की व्यवस्थित समीक्षा करें। रिपोर्ट में लोकल SEO, बिज़नेस लिस्टिंग, कंटेंट, मोबाइल अनुभव और प्रतिस्पर्धी रिसर्च शामिल हैं।', business:'व्यवसाय का नाम', location:'शहर / सेवा क्षेत्र', website:'वेबसाइट URL', industry:'उद्योग', competitor:'प्रतिस्पर्धी वेबसाइटें (वैकल्पिक, कॉमा से अलग)', submit:'ऑडिट चेकलिस्ट बनाएँ', reportTitle:'आपकी Geo Audit रिपोर्ट', overview:'ऑडिट सारांश', local:'स्थानीय खोज उपस्थिति', content:'कंटेंट और ऑन-पेज SEO', mobile:'मोबाइल अनुभव', trust:'विश्वास, रिव्यू और बिज़नेस लिस्टिंग', competitorTitle:'प्रतिस्पर्धी तुलना', competitorNote:'प्रतिस्पर्धियों के स्कोर लाइव नहीं लाए जाते। सत्यापित URL जोड़ें और समान सार्वजनिक संकेतकों की तुलना करें। बिना डेटा को असफल स्कोर न मानें।', actions:'प्राथमिकता के अनुसार सुझाव', actionItems:['Google Business Profile पूरा करें और सत्यापित करें; नाम, पता/सेवा क्षेत्र, फोन और समय हर जगह समान रखें।','हर वास्तविक सेवा क्षेत्र के लिए उपयोगी अलग पेज बनाएँ; एक जैसे शहर-आधारित पेज न बनाएँ।','स्पष्ट सेवा पेज, अच्छे शीर्षक, स्थानीय व्यवसाय विवरण, FAQ और उपयुक्त LocalBusiness structured data जोड़ें।','मोबाइल पर संपर्क, दिशा, फोन और पूछताछ आसान बनाएँ; पेज गति और Core Web Vitals अलग से जाँचें।','वास्तविक ग्राहकों से ईमानदार रिव्यू माँगें, जवाब दें और भरोसेमंद डायरेक्टरी में लिस्टिंग सही रखें।','हर प्रतिस्पर्धी की सेवाओं, पेज गुणवत्ता, रिव्यू, स्थानीय उल्लेख और उपयोगी कंटेंट की जाँच करें; प्रमाण और जाँच की तारीख लिखें।'], industries:['उद्योग चुनें','रिटेल और ई-कॉमर्स','स्वास्थ्य सेवाएँ','होटल और रेस्टोरेंट','प्रोफेशनल सेवाएँ','रियल एस्टेट','शिक्षा','होम सर्विसेज','यात्रा और पर्यटन','ऑटोमोबाइल','अन्य'] },
  bn: { badge:'লোকাল SEO ও GEO দৃশ্যমানতা', title:'Geo Audit', intro:'আপনার ব্যবসার স্থানীয় অনলাইন উপস্থিতি পর্যালোচনা করুন। রিপোর্টে লোকাল SEO, ব্যবসার তালিকা, কনটেন্ট, মোবাইল অভিজ্ঞতা এবং প্রতিযোগী গবেষণা অন্তর্ভুক্ত।', business:'ব্যবসার নাম', location:'শহর / পরিষেবা এলাকা', website:'ওয়েবসাইট URL', industry:'শিল্পক্ষেত্র', competitor:'প্রতিযোগী ওয়েবসাইট (ঐচ্ছিক, কমা দিয়ে আলাদা করুন)', submit:'অডিট চেকলিস্ট তৈরি করুন', reportTitle:'আপনার Geo Audit রিপোর্ট', overview:'অডিট সারাংশ', local:'স্থানীয় সার্চ উপস্থিতি', content:'কনটেন্ট ও অন-পেজ SEO', mobile:'মোবাইল অভিজ্ঞতা', trust:'বিশ্বাস, রিভিউ ও ব্যবসার তালিকা', competitorTitle:'প্রতিযোগী তুলনা', competitorNote:'প্রতিযোগীদের স্কোর লাইভ সংগ্রহ করা হয় না। যাচাইকৃত URL যোগ করে একই প্রকাশ্য সূচক তুলনা করুন; তথ্য না থাকাকে ব্যর্থ স্কোর ভাববেন না।', actions:'অগ্রাধিকারভিত্তিক পরামর্শ', actionItems:['Google Business Profile সম্পূর্ণ ও যাচাই করুন; নাম, ঠিকানা/পরিষেবা এলাকা, ফোন ও সময় সব জায়গায় এক রাখুন।','প্রতিটি বাস্তব পরিষেবা এলাকার জন্য উপযোগী আলাদা পেজ তৈরি করুন; একই রকম শহরভিত্তিক পেজ এড়িয়ে চলুন।','স্পষ্ট পরিষেবা পেজ, বর্ণনামূলক শিরোনাম, স্থানীয় ব্যবসার তথ্য, FAQ এবং উপযুক্ত LocalBusiness structured data যোগ করুন।','ছোট স্ক্রিনে যোগাযোগ, দিকনির্দেশ, ফোন ও enquiry সহজ করুন; পেজের গতি এবং Core Web Vitals আলাদাভাবে পরীক্ষা করুন।','প্রকৃত গ্রাহকের সৎ রিভিউ চান, উত্তর দিন এবং নির্ভরযোগ্য ডিরেক্টরিতে ব্যবসার তথ্য ঠিক রাখুন।','প্রতিটি প্রতিযোগীর পরিষেবা, পেজের মান, রিভিউ, স্থানীয় উল্লেখ ও কনটেন্ট যাচাই করে প্রমাণ এবং তারিখ নথিভুক্ত করুন।'], industries:['শিল্পক্ষেত্র বেছে নিন','রিটেল ও ই-কমার্স','স্বাস্থ্যসেবা','হোটেল ও রেস্তোরাঁ','পেশাদার পরিষেবা','রিয়েল এস্টেট','শিক্ষা','হোম সার্ভিস','ভ্রমণ ও পর্যটন','অটোমোটিভ','অন্যান্য'] }
};

export default function GeoAudit() {
  const { lang } = useI18n();
  const c = COPY[lang] ?? COPY.en;
  const [website, setWebsite] = useState('');
  const [country, setCountry] = useState('');
  const [generated, setGenerated] = useState(false);
  const websiteFavicon = faviconFor(website);
  const websiteHost = validateUrlInput(normalizedDomain(website)).ok ? displayHost(normalizedDomain(website)) : '';
  const submit = (event: FormEvent) => { event.preventDefault(); setWebsite(website ? normalizedDomain(website) : ''); setGenerated(true); };
  const sections = [c.local, c.content, c.mobile, c.trust];
  return <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
    <SEOHead title={c.title} description={c.intro} path={lang === 'en' ? '/geo-audit' : '/' + lang + '/geo-audit'} />
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="bg-gradient-to-br from-slate-950 via-teal-950 to-teal-800 px-6 py-10 text-white sm:px-10 sm:py-14">
        <p className="text-xs font-bold tracking-[.18em] text-teal-200">{c.badge}</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">{c.title}</h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-slate-200 sm:text-lg">{c.intro}</p>
        <div className="mt-6 flex flex-wrap gap-2 text-xs font-semibold">{['Local SEO','Industry review','Competitor checklist','Mobile friendly','Action plan'].map(x=><span key={x} className="rounded-full border border-white/20 bg-white/10 px-3 py-2">{x}</span>)}</div>
      </div>
      <div className="grid gap-8 p-5 sm:p-8 lg:grid-cols-[.95fr_1.05fr]">
        <form onSubmit={submit} className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">{c.overview}</h2>
          <label className="block text-sm font-semibold text-slate-700">{c.website}<input type="text" inputMode="url" autoCapitalize="none" spellCheck={false} value={website} onChange={e=>setWebsite(e.target.value)} onBlur={()=>website && setWebsite(normalizedDomain(website))} placeholder="example.com" className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-3 font-normal outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100" />{websiteHost && websiteFavicon && <span className="mt-2 flex items-center gap-2 text-xs font-normal text-slate-500"><img src={websiteFavicon} alt="" width="22" height="22" className="size-5 rounded object-contain" onError={e=>{e.currentTarget.style.visibility="hidden";}} /><span className="font-semibold text-slate-700">{websiteHost}</span><span>· HTTPS will be added automatically</span></span>}</label>
          <label className="block text-sm font-semibold text-slate-700">{c.country}<select required value={country} onChange={e=>setCountry(e.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 font-normal outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"><option value="">{lang === 'hi' ? 'देश चुनें' : lang === 'bn' ? 'দেশ বেছে নিন' : 'Select country'}</option>{["Australia","Bangladesh","Brazil","Canada","France","Germany","India","Indonesia","Ireland","Italy","Japan","Malaysia","Mexico","Nepal","Netherlands","New Zealand","Nigeria","Pakistan","Philippines","Singapore","South Africa","Spain","Sri Lanka","United Arab Emirates","United Kingdom","United States"].map(x=><option key={x} value={x}>{x}</option>)}</select></label>
          <button className="w-full rounded-xl bg-teal-700 px-5 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2">{c.submit}</button>
          <p className="text-xs leading-5 text-slate-500">This creates a structured checklist, not a live search-engine crawl. Validate findings against current public data before making business decisions.</p>
        </form>
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">{c.reportTitle}</h2>
          <div className="rounded-2xl border border-teal-100 bg-teal-50 p-4 sm:p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-teal-800">{c.overview}</p>
            <p className="mt-2 text-lg font-bold text-slate-900">{generated ? websiteHost || 'Website audit' : 'Local visibility • SEO • Competitors'}</p>
            <p className="mt-1 text-sm text-slate-600">{generated ? [country, websiteHost].filter(Boolean).join(' · ') : 'Enter a website domain and country to personalise the action plan.'}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">{sections.map((s,i)=><div key={s} className="rounded-2xl border border-slate-200 p-4"><p className="text-sm font-bold text-slate-900">{i+1}. {s}</p><p className="mt-2 text-sm leading-6 text-slate-600">{['Profile completeness, location relevance, NAP consistency and local intent.','Page titles, service-area pages, useful content, schema and internal links.','Responsive layout, tap targets, readable text, forms and page performance.','Authentic reviews, trusted citations, contact details and reputation signals.'][i]}</p><span className="mt-3 inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800">Needs verification</span></div>)}</div>
          <div className="rounded-2xl border border-slate-200 p-4 sm:p-5"><h3 className="font-bold text-slate-900">{c.competitorTitle}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{c.competitorNote}</p><p className="mt-3 text-sm text-slate-500">Use the selected country to guide local search intent, business listing checks, regional keywords and relevant competitor research. Live competitor discovery is not yet connected.</p></div>
          <div className="rounded-2xl border border-slate-200 p-4 sm:p-5"><h3 className="font-bold text-slate-900">{c.actions}</h3><ol className="mt-3 list-decimal space-y-3 ps-5 text-sm leading-6 text-slate-700">{c.actionItems.map(x=><li key={x}>{x}</li>)}</ol><button type="button" onClick={()=>window.print()} className="mt-5 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-800 hover:bg-slate-50">Print / Save as PDF</button></div>
        </div>
      </div>
    </div>
  </div>;
}
