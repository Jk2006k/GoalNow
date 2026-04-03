export default `
@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Sora:wght@300;400;500;600;700&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}

.iw{width:100vw;height:100vh;background:#f5f5f5;font-family:'Sora',sans-serif;display:flex;flex-direction:column;color:#111;}

.hdr{display:flex;justify-content:space-between;align-items:center;padding:0 36px;height:60px;background:#111;border-bottom:1px solid #222;flex-shrink:0;}
.hlogo{font-weight:700;font-size:1rem;letter-spacing:.12em;text-transform:uppercase;color:#fff;}
.hright{display:flex;align-items:center;gap:12px;}
.htmr{font-family:'DM Mono',monospace;background:transparent;color:#fff;padding:7px 16px;border-radius:6px;font-weight:500;font-size:.95rem;letter-spacing:.08em;border:1px solid #3a3a3a;}
.hexit{padding:7px 18px;border-radius:6px;border:1px solid #3a3a3a;cursor:pointer;background:transparent;color:#aaa;font-family:'Sora',sans-serif;font-size:.82rem;font-weight:500;transition:all .2s;}
.hexit:hover{border-color:#888;color:#fff;}

.bdy{flex:1;display:flex;overflow:hidden;}

.lft{width:160px;background:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:32px 16px;border-right:1px solid #e0e0e0;gap:10px;flex-shrink:0;}
.tlbl{font-size:.7rem;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:#999;}
.tdsp{font-family:'DM Mono',monospace;font-size:2.2rem;font-weight:500;color:#111;letter-spacing:.04em;}
.ptrk{width:2px;height:80px;background:#e5e5e5;border-radius:2px;margin-top:20px;position:relative;overflow:hidden;}
.pfll{position:absolute;bottom:0;left:0;width:100%;background:#111;border-radius:2px;transition:height 1s linear;}

.ctr{flex:1;display:flex;align-items:center;justify-content:center;padding:48px 64px;background:#f5f5f5;}
.qcn{display:flex;flex-direction:column;align-items:center;text-align:center;max-width:680px;width:100%;}
.qtg{font-size:.72rem;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:#999;margin-bottom:24px;display:flex;align-items:center;gap:8px;}
.qtg::before,.qtg::after{content:'';display:block;width:28px;height:1px;background:#ccc;}
.qtx{font-size:1.65rem;font-weight:600;line-height:1.55;color:#111;margin-bottom:52px;letter-spacing:-.01em;}
.tdv{background:#f0f0f0;border:2px solid #e0e0e0;border-radius:10px;padding:20px;margin-bottom:28px;min-height:80px;font-size:.95rem;line-height:1.6;color:#333;text-align:left;max-height:120px;overflow-y:auto;width:100%;}
.tdv.empty{color:#ccc;font-style:italic;}
.mca{display:flex;flex-direction:column;align-items:center;gap:24px;}
.mrng{width:96px;height:96px;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .25s;}
.mrng.idle{background:#111;}
.mrng.active{background:#1a1a1a;animation:mpls 1.6s ease-in-out infinite;}
@keyframes mpls{0%{box-shadow:0 0 0 0 rgba(17,17,17,.18),0 0 0 0 rgba(17,17,17,.08);}70%{box-shadow:0 0 0 10px rgba(17,17,17,.04),0 0 0 20px rgba(17,17,17,0);}100%{box-shadow:0 0 0 0 rgba(17,17,17,0),0 0 0 0 rgba(17,17,17,0);}}
.mrng svg{width:34px;height:34px;fill:#fff;}
.mst{font-size:.75rem;font-weight:500;letter-spacing:.1em;text-transform:uppercase;color:#888;}
.mst.rec{color:#333;}
.abts{display:flex;gap:12px;flex-wrap:wrap;justify-content:center;}
.bstop{padding:10px 26px;background:#fff;color:#111;border:1px solid #ccc;border-radius:7px;cursor:pointer;font-family:'Sora',sans-serif;font-weight:600;font-size:.82rem;transition:all .2s;}
.bstop:hover{background:#f0f0f0;border-color:#aaa;}
.bnxt{padding:10px 26px;background:#111;color:#fff;border:1px solid #111;border-radius:7px;cursor:pointer;font-family:'Sora',sans-serif;font-weight:600;font-size:.82rem;transition:all .2s;}
.bnxt:hover{background:#333;}
.bsub{padding:10px 26px;background:#2ecc71;color:#fff;border:1px solid #2ecc71;border-radius:7px;cursor:pointer;font-family:'Sora',sans-serif;font-weight:600;font-size:.82rem;transition:all .2s;}
.bsub:hover{background:#27ae60;}

.rgt{width:260px;background:#fff;border-left:1px solid #e0e0e0;padding:24px 20px;display:flex;flex-direction:column;align-items:center;gap:16px;flex-shrink:0;}
.clbl{font-size:.7rem;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:#999;align-self:flex-start;}

.cambox{
  width:100%;aspect-ratio:3/4;background:#111;border-radius:12px;
  overflow:hidden;position:relative;
  border:3px solid #e0e0e0;
  transition:border-color .08s ease;
}
.cambox video{width:100%;height:100%;object-fit:cover;display:block;transform:scaleX(-1);}

.cambox.alarm-red{
  border-color:#ff1111 !important;
  animation:alm-red .42s ease-in-out infinite;
}
.cambox.alarm-orange{
  border-color:#ff6600 !important;
  animation:alm-orange .42s ease-in-out infinite;
}

@keyframes alm-red{
  0%,100%{box-shadow:0 0 0 2px rgba(255,17,17,.4),0 0 12px rgba(255,17,17,.65),0 0 28px rgba(255,17,17,.3),inset 0 0 12px rgba(255,17,17,.2);}
  50%{box-shadow:0 0 0 6px rgba(255,17,17,.75),0 0 28px rgba(255,17,17,1),0 0 52px rgba(255,17,17,.55),inset 0 0 26px rgba(255,17,17,.5);}
}
@keyframes alm-orange{
  0%,100%{box-shadow:0 0 0 2px rgba(255,102,0,.4),0 0 12px rgba(255,102,0,.65),0 0 28px rgba(255,102,0,.3),inset 0 0 12px rgba(255,102,0,.2);}
  50%{box-shadow:0 0 0 6px rgba(255,102,0,.75),0 0 28px rgba(255,102,0,1),0 0 52px rgba(255,102,0,.55),inset 0 0 26px rgba(255,102,0,.5);}
}

.abar{
  position:absolute;bottom:0;left:0;right:0;
  padding:8px 10px;font-size:.67rem;font-weight:700;
  letter-spacing:.05em;text-align:center;text-transform:uppercase;
  border-radius:0 0 10px 10px;z-index:20;
  line-height:1.3;
  animation:brin .15s ease-out;
}
.abar.red{background:rgba(175,0,0,.92);color:#fff;}
.abar.orange{background:rgba(175,70,0,.92);color:#fff;}
@keyframes brin{from{opacity:0;transform:translateY(4px);}to{opacity:1;transform:translateY(0);}}

.mp-loading{position:absolute;inset:0;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;border-radius:10px;z-index:15;}
.mp-spinner{width:28px;height:28px;border-radius:50%;border:3px solid rgba(255,255,255,.2);border-top-color:#fff;animation:spin .7s linear infinite;}
@keyframes spin{to{transform:rotate(360deg);}}

.cind{display:flex;align-items:center;gap:6px;align-self:flex-start;}
.dot{width:6px;height:6px;border-radius:50%;background:#555;}
.dot.live{background:#222;animation:dblink 1.4s ease-in-out infinite;}
.dot.danger{background:#ff1111;animation:dfast .42s ease-in-out infinite;}
@keyframes dblink{0%,100%{opacity:1;}50%{opacity:.3;}}
@keyframes dfast{0%,100%{opacity:1;}50%{opacity:.1;}}
.itxt{font-size:.72rem;font-weight:500;letter-spacing:.06em;color:#888;}
.itxt.danger{color:#c80000;font-weight:700;}

.sbtn{margin-top:auto;padding:12px;width:100%;background:#111;color:#fff;border:none;border-radius:8px;cursor:pointer;font-family:'Sora',sans-serif;font-weight:600;font-size:.85rem;letter-spacing:.06em;text-transform:uppercase;transition:background .2s;}
.sbtn:hover{background:#333;}
.qlst{width:100%;margin-top:16px;padding-top:16px;border-top:1px solid #e0e0e0;max-height:300px;overflow-y:auto;}
.qltl{font-size:.7rem;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:#999;margin-bottom:12px;}
.qi{display:flex;align-items:center;gap:8px;padding:8px;margin-bottom:4px;border-radius:5px;font-size:.75rem;color:#666;cursor:pointer;transition:all .2s;}
.qi:hover{background:#f5f5f5;}
.qi.cur{background:#f0f0f0;color:#111;font-weight:600;}
.qi.ans{color:#2ecc71;}
.qnum{width:20px;height:20px;display:flex;align-items:center;justify-content:center;border-radius:50%;border:1px solid #d0d0d0;font-size:.65rem;font-weight:600;}
.qi.cur .qnum{border-color:#111;background:#111;color:#fff;}
.qi.ans .qnum{border-color:#2ecc71;background:#2ecc71;color:#fff;}
`