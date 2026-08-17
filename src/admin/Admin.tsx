import React, { useEffect, useState, useMemo } from "react";

type PortfolioProject = {
  id: string;
  category: string;
  client: string;
  description: { challenge: string; solution: string; impact: string; } | string;
  images: string[];
  logo: string;
  name: string;
  tags: string[];
};

export default function Admin() {
  const [content, setContent] = useState<Record<string, string>>({});
  const [portfolio, setPortfolio] = useState<PortfolioProject[]>([]);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [pin, setPin] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [loginError, setLoginError] = useState("");

  useEffect(() => {
    fetch('/api/data')
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch API");
        return res.json();
      })
      .then(data => {
        setContent(data.content || {});
        setPortfolio(data.portfolio || []);
        setLoaded(true);
      })
      .catch(err => {
        console.error(err);
        setStatus("ERROR LOADING DATA");
      });
  }, []);

  const save = async () => {
    setStatus("SAVING...");
    try {
      const res = await fetch("/api/save-all", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${pin}` },
        body: JSON.stringify({ content, portfolio }),
      });
      setStatus(res.ok ? "SAVED SUCCESSFULLY ✓" : "ERROR SAVING ✕");
      setTimeout(() => setStatus(""), 3000);
    } catch (e: any) {
      setStatus("ERROR: " + e.message);
    }
  };

  const filteredKeys = useMemo(() => {
    if (search.trim() === "") return [];
    return Object.keys(content).filter(k => 
      k.toLowerCase().includes(search.toLowerCase()) || 
      String(content[k]).toLowerCase().includes(search.toLowerCase())
    );
  }, [search]); // Intentionally not depending on 'content' so fields don't disappear while editing

  const updateContent = (key: string, value: string) => {
    setContent(prev => ({ ...prev, [key]: value }));
  };

  const updatePortfolio = (index: number, key: keyof PortfolioProject, value: any) => {
    setPortfolio(prev => {
      const newPortfolio = [...prev];
      newPortfolio[index] = { ...newPortfolio[index], [key]: value };
      return newPortfolio;
    });
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-[#0c0e16] flex items-center justify-center text-white p-6">
        <style>{`input[type="password"]::-ms-reveal, input[type="password"]::-ms-clear { display: none; }`}</style>
        <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-4 text-center">
           <h1 className="text-xs font-bold tracking-[.14em] text-[#d7ff55]">ADMIN CMS</h1>
           <input 
              type="password" 
              value={pin} 
              onChange={async e => {
                 const val = e.target.value;
                 setPin(val);
                 setLoginError("");
                 if (val.length === 4) {
                    try {
                      const res = await fetch('/api/verify-pin', {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${val}` }
                      });
                      if (res.ok) {
                        setAuthenticated(true);
                      } else {
                        setPin("");
                        setLoginError("INVALID PIN");
                      }
                    } catch (err) {
                      setPin("");
                      setLoginError("ERROR VERIFYING PIN");
                    }
                 }
              }} 
              placeholder="ENTER PIN" 
              className="bg-transparent border-b border-white/20 text-center py-2 text-2xl outline-none tracking-widest focus:border-[#d7ff55]" 
              autoFocus 
           />
           {loginError && <p className="text-xs font-bold tracking-widest text-red-500 mt-2">{loginError}</p>}
        </form>
      </div>
    );
  }

  if (!loaded) return <div className="min-h-screen bg-[#0c0e16] flex items-center justify-center text-white text-xs font-bold tracking-[.14em]">LOADING...</div>;

  return (
    <div className="min-h-screen bg-[#0c0e16] text-[#f8f7f1] selection:bg-[#d7ff55] selection:text-[#0c0e16] pb-20">
      <div className="mx-auto max-w-[1344px] px-5 pt-12 sm:px-8 lg:px-12">
        
        <header className="mb-14 flex flex-wrap items-end justify-between gap-5 border-b border-white/15 pb-8">
          <div>
            <p className="text-xs font-bold tracking-[0.16em] text-[#d7ff55]">CONTENT MANAGEMENT</p>
            <h1 className="mt-4 font-display text-5xl leading-none tracking-[-0.06em] sm:text-6xl">Admin CMS</h1>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-xs font-bold tracking-[.14em] text-[#d7ff55]">{status}</span>
            <button onClick={save} className="group rounded-full bg-[#d7ff55] px-5 py-3 text-xs font-black tracking-[.12em] text-[#10121a] transition hover:bg-white">SAVE CHANGES</button>
            <a href="/" target="_blank" rel="noopener noreferrer" className="rounded-full border border-white/20 px-4 py-3 text-xs font-bold tracking-[0.12em] transition hover:border-[#d7ff55] hover:bg-[#d7ff55] hover:text-[#0c0e16]">VIEW SITE ↗</a>
          </div>
        </header>

        <main className="grid gap-12 lg:grid-cols-[1fr_1.3fr] items-start">
          
          <section className="rounded-[2rem] bg-[#10121a] p-6 text-white sm:p-9 lg:sticky lg:top-12 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto custom-scrollbar">
            <h2 className="text-xs font-bold tracking-[0.16em] text-[#59604f] mb-6">CONTENT DICTIONARY</h2>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search keys or text..."
              className="w-full border-b border-white/25 bg-transparent py-3 text-base outline-none transition placeholder:text-white/25 focus:border-[#d7ff55] mb-8"
            />
            
            <div className="flex flex-col gap-6">
              {search.trim() === "" && (
                <div className="text-xs font-bold tracking-[.14em] text-white/25 py-8 text-center">
                  TYPE IN THE SEARCH BOX TO FIND & EDIT CONTENT KEYS
                </div>
              )}
              {filteredKeys.map(key => (
                <div key={key}>
                  <label className="block text-[10px] font-bold tracking-[.14em] text-white/55 uppercase mb-2">{key}</label>
                  <textarea
                    value={content[key] || ""}
                    onChange={e => updateContent(key, e.target.value)}
                    rows={String(content[key] || "").length > 80 ? 3 : 1}
                    className="w-full resize-none border-b border-white/25 bg-transparent py-3 text-base outline-none transition focus:border-[#d7ff55]"
                  />
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[2rem] bg-[#10121a] p-6 text-white sm:p-9 lg:sticky lg:top-12 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto custom-scrollbar">
            <h2 className="text-xs font-bold tracking-[0.16em] text-[#59604f] mb-8">PORTFOLIO PROJECTS</h2>
            
            <div className="flex flex-col gap-8">
              {portfolio.map((proj, i) => (
                <div className="rounded-[1.25rem] bg-[#0c0e16] p-6 sm:p-8 border border-white/10 flex flex-col gap-6" key={proj.id || i}>
                  <div>
                    <input
                      type="text"
                      value={proj.name}
                      onChange={e => updatePortfolio(i, 'name', e.target.value)}
                      placeholder="Project Name"
                      className="w-full bg-transparent border-b border-white/25 outline-none placeholder:text-white/25 focus:border-[#d7ff55] pb-2 font-display text-3xl tracking-[-.045em] sm:text-4xl text-white"
                    />
                  </div>
                  
                  <div className="grid gap-6 sm:grid-cols-2 mt-2">
                    <div>
                      <label className="block text-[10px] font-bold tracking-[.14em] text-white/55 uppercase mb-2">CLIENT</label>
                      <input 
                        type="text" 
                        value={proj.client} 
                        onChange={e => updatePortfolio(i, 'client', e.target.value)}
                        placeholder="Client name" 
                        className="w-full border-b border-white/25 bg-transparent py-3 text-base outline-none transition placeholder:text-white/25 focus:border-[#d7ff55]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold tracking-[.14em] text-white/55 uppercase mb-2">TAGS</label>
                      <input 
                        type="text" 
                        value={(proj.tags || []).join(', ')}
                        onChange={e => updatePortfolio(i, 'tags', e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
                        placeholder="e.g. React, Tailwind"
                        className="w-full border-b border-white/25 bg-transparent py-3 text-base outline-none transition placeholder:text-white/25 focus:border-[#d7ff55]"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-2">
                    <label className="block text-[10px] font-bold tracking-[.14em] text-white/55 uppercase mb-2">DESCRIPTION</label>
                    {typeof proj.description === 'object' ? (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-[10px] font-bold text-white/40 uppercase mb-1">The Challenge</label>
                          <textarea value={proj.description.challenge || ''} onChange={e => updatePortfolio(i, 'description', { ...proj.description, challenge: e.target.value } as any)} rows={2} className="w-full resize-none border-b border-white/25 bg-transparent py-2 text-sm outline-none transition placeholder:text-white/25 focus:border-[#d7ff55]" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-white/40 uppercase mb-1">Our Solution</label>
                          <textarea value={proj.description.solution || ''} onChange={e => updatePortfolio(i, 'description', { ...proj.description, solution: e.target.value } as any)} rows={2} className="w-full resize-none border-b border-white/25 bg-transparent py-2 text-sm outline-none transition placeholder:text-white/25 focus:border-[#d7ff55]" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-white/40 uppercase mb-1">The Impact</label>
                          <textarea value={proj.description.impact || ''} onChange={e => updatePortfolio(i, 'description', { ...proj.description, impact: e.target.value } as any)} rows={2} className="w-full resize-none border-b border-white/25 bg-transparent py-2 text-sm outline-none transition placeholder:text-white/25 focus:border-[#d7ff55]" />
                        </div>
                      </div>
                    ) : (
                      <textarea 
                        value={proj.description || ''}
                        onChange={e => updatePortfolio(i, 'description', e.target.value)}
                        placeholder="Project description"
                        rows={4}
                        className="w-full resize-none border-b border-white/25 bg-transparent py-3 text-base outline-none transition placeholder:text-white/25 focus:border-[#d7ff55]"
                      />
                    )}
                  </div>
                  
                  <div className="mt-4 border-t border-white/10 pt-4">
                    <label className="block text-[10px] font-bold tracking-[.14em] text-white/55 uppercase mb-2">CLIENT LOGO (R2)</label>
                    <div className="flex items-center gap-6 mt-3">
                      {proj.logo ? (
                        <div className="relative h-16 w-16 overflow-hidden rounded-full border border-white/10 bg-white/10 group flex-shrink-0">
                          <img src={`${process.env.R2_PUBLIC_URL}/images/${proj.logo}`} alt="Logo" className="h-full w-full object-contain p-2 transition duration-300 group-hover:opacity-50" />
                          <button 
                            onClick={() => updatePortfolio(i, 'logo', '')}
                            className="absolute inset-0 flex items-center justify-center opacity-0 transition group-hover:opacity-100 bg-red-500/80 text-white text-[10px] font-bold tracking-widest"
                          >
                            X
                          </button>
                        </div>
                      ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-full border border-dashed border-white/20 bg-black/20 text-[10px] font-bold text-white/30 flex-shrink-0">
                          NONE
                        </div>
                      )}
                      
                      <div className="flex-1">
                        <label className="group cursor-pointer inline-block rounded-full bg-white/10 px-4 py-2 text-[10px] font-black tracking-[.12em] text-white transition hover:bg-[#d7ff55] hover:text-[#10121a]">
                          {proj.logo ? "CHANGE LOGO" : "UPLOAD LOGO"}
                          <input 
                            type="file" accept="image/*" className="hidden" 
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              setStatus("UPLOADING LOGO...");
                              const reader = new FileReader();
                              reader.onload = async (ev) => {
                                const base64Str = (ev.target?.result as string).split(',')[1];
                                try {
                                  const res = await fetch('/api/upload-image', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${pin}` },
                                    body: JSON.stringify({ filename: file.name, contentType: file.type, base64Data: base64Str })
                                  });
                                  const data = await res.json();
                                  if (data.success) {
                                    updatePortfolio(i, 'logo', data.filename);
                                    setStatus("LOGO UPLOADED ✓");
                                    setTimeout(() => setStatus(""), 3000);
                                  } else setStatus("UPLOAD FAILED ✕");
                                } catch(err: any) { setStatus("UPLOAD ERROR ✕"); }
                              };
                              reader.readAsDataURL(file);
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 border-t border-white/10 pt-4">
                    <label className="block text-[10px] font-bold tracking-[.14em] text-white/55 uppercase mb-2">PROJECT IMAGES (R2)</label>
                    <div className="flex flex-wrap items-center gap-4 mt-3">
                      {(proj.images || []).map((imgUrl, imgIndex) => (
                        <div key={imgIndex} className="relative h-24 w-40 overflow-hidden rounded-xl border border-white/10 bg-black/40 group flex-shrink-0">
                          <img src={`${process.env.R2_PUBLIC_URL}/images/${imgUrl}`} alt="" className="h-full w-full object-cover transition duration-300 group-hover:opacity-50" />
                          <button 
                            onClick={() => {
                              const newImages = [...(proj.images || [])];
                              newImages.splice(imgIndex, 1);
                              updatePortfolio(i, 'images', newImages);
                            }}
                            className="absolute inset-0 flex items-center justify-center opacity-0 transition group-hover:opacity-100 bg-red-500/80 text-white text-[10px] font-bold tracking-widest"
                          >
                            REMOVE
                          </button>
                        </div>
                      ))}
                      
                      <label className="flex h-24 w-40 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 bg-black/20 text-white/50 transition hover:border-[#d7ff55] hover:text-[#d7ff55]">
                        <span className="text-[10px] font-bold tracking-[.1em]">+ ADD IMAGE</span>
                        <input 
                          type="file" accept="image/*" className="hidden" 
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            setStatus("UPLOADING IMAGE...");
                            const reader = new FileReader();
                            reader.onload = async (ev) => {
                              const base64Str = (ev.target?.result as string).split(',')[1];
                              try {
                                const res = await fetch('/api/upload-image', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${pin}` },
                                  body: JSON.stringify({ filename: file.name, contentType: file.type, base64Data: base64Str })
                                });
                                const data = await res.json();
                                if (data.success) {
                                  const newImages = [...(proj.images || []), data.filename];
                                  updatePortfolio(i, 'images', newImages);
                                  setStatus("IMAGE UPLOADED ✓");
                                  setTimeout(() => setStatus(""), 3000);
                                } else setStatus("UPLOAD FAILED ✕");
                              } catch(err: any) { setStatus("UPLOAD ERROR ✕"); }
                            };
                            reader.readAsDataURL(file);
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </main>
      </div>
    </div>
  );
}
