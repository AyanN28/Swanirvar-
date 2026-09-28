from __future__ import annotations
import json, os, uuid
from pathlib import Path
from typing import Optional, Dict, Any
from fastapi import FastAPI, HTTPException, UploadFile, File, Query
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

from .core.engine import evaluate, preliminary_decision, D6_KEYS, WEIGHTS
from .core.report import make_html, make_pdf
from .services.gemini import configured as gemini_configured, ask as gemini_ask, jury as gemini_jury
from .services.bhashini import configured as bhashini_configured, asr_configured as bhashini_asr_configured, tts_configured as bhashini_tts_configured, asr as bhashini_asr, tts as bhashini_tts
from .services.live_sources import osm_candidates, route_distance
from .services.market import live_market

BASE=Path(__file__).resolve().parent; DATA=BASE/'data'; WEB=BASE/'web'; ROOT=BASE.parent
RUNTIME=Path(os.getenv('SWANIRVAR_DATA_DIR',str(ROOT/'runtime'))); RUNTIME.mkdir(parents=True,exist_ok=True)
STATE_FILE=DATA/'state.json'; INPUT_FILE=RUNTIME/'evidence_inputs.json'
app=FastAPI(title='Swanirvar API',version='1.1.2',description='Evidence-first rural/peri-rural micro-enterprise decision support')
app.mount('/static',StaticFiles(directory=str(WEB)),name='static')
PILOT_ID='WB_RURAL_01'
LANGS={'en':'en-IN','bn':'bn-IN','hi':'hi-IN'}
PILOTS = [
    {'pilot_id':'WB_RURAL_01','label':'Gairkata, West Bengal — Tea Shop','status':'ACTIVE','location':'Gairkata','state':'West Bengal'},
    {'pilot_id':'TN_THR_01','label':'Thirumangalam, Tamil Nadu','status':'COMING_SOON','location':'Thirumangalam','state':'Tamil Nadu'},
    {'pilot_id':'MH_URA_01','label':'Urali Kanchan, Maharashtra','status':'COMING_SOON','location':'Urali Kanchan','state':'Maharashtra'},
    {'pilot_id':'PB_CHA_01','label':'Chatha Nanhera, Punjab','status':'COMING_SOON','location':'Chatha Nanhera','state':'Punjab'},
]

def loadj(p): return json.loads(p.read_text(encoding='utf-8'))
def state(): return loadj(STATE_FILE)
def inputs():
    if INPUT_FILE.exists():
        try:return loadj(INPUT_FILE)
        except Exception:pass
    return state()['evidence_inputs'].copy()
def save_inputs(d): INPUT_FILE.write_text(json.dumps(d,ensure_ascii=False,indent=2),encoding='utf-8')
def require(pid):
    if pid == PILOT_ID: return
    if any(p['pilot_id']==pid for p in PILOTS):
        raise HTTPException(409,'This Swanirvar pilot is coming soon. The live demo currently supports Gairkata, West Bengal.')
    raise HTTPException(404,'Pilot not available')
def snapshot():
    s=state(); inp=inputs(); return s,inp,evaluate(inp,s['base_evidence'])

def demo_decision(s, d):
    p = preliminary_decision(s['base_evidence'])
    p['canonical_7d_score'] = d['canonical_7d_score']
    p['canonical_release_ready'] = d['release_ready']
    return p

class SevenDInputs(BaseModel):
    d1_competitor_supply_kg_year: Optional[float]=Field(None,ge=0)
    d2_direct_competitors: Optional[int]=Field(None,ge=0)
    d2_saturation_threshold: Optional[int]=Field(None,ge=1)
    d4_observed_taste_fit: Optional[float]=Field(None,ge=0,le=100)
    d5_monthly_purchase_occasions: Optional[float]=Field(None,ge=0)
    d6_risk_factors: Optional[Dict[str,float]]=None
    d7_projected_monthly_revenue: Optional[float]=Field(None,ge=0)
    d7_monthly_operating_cost: Optional[float]=Field(None,ge=0)
    d7_break_even_revenue: Optional[float]=Field(None,ge=0)
    d7_startup_cost: Optional[float]=Field(None,ge=0)
    d7_monthly_debt_service: Optional[float]=Field(None,ge=0)
    verification_note: str='User-confirmed local/business evidence.'

class AnalysisRequest(BaseModel):
    business_type: str='Tea Shop'; location: str='Gairkata'
    projected_daily_customers: Optional[float]=Field(None,ge=0)
    average_customer_spend: Optional[float]=Field(None,ge=0)
    monthly_rent: Optional[float]=Field(None,ge=0)
    other_monthly_operating_cost: Optional[float]=Field(None,ge=0)
    break_even_revenue: Optional[float]=Field(None,ge=0)
    startup_cost: Optional[float]=Field(None,ge=0)
    monthly_debt_service: Optional[float]=Field(None,ge=0)
    confirmed: bool=False
class SathiRequest(BaseModel):
    message: str=Field(min_length=1,max_length=4000); language: str=Field('en',pattern='^(en|bn|hi)$'); context: Dict[str,Any]=Field(default_factory=dict)
class VoiceCommand(BaseModel): text: str=Field(min_length=1,max_length=2000); language: str=Field('en',pattern='^(en|bn|hi)$')
class VoiceTTSRequest(BaseModel): text: str=Field(min_length=1,max_length=3500); language: str=Field('en',pattern='^(en|bn|hi)$')
class RouteRequest(BaseModel): start_lat:float; start_lon:float; end_lat:float; end_lon:float; profile:str='driving'

@app.get('/',include_in_schema=False)
def root(): return FileResponse(WEB/'index.html')
@app.get('/health',include_in_schema=False)
def health(): return {'ok':True,'service':'swanirvar','version':'1.1.0'}
@app.get('/api/v1/pilots')
def pilots():
    return {'active_pilot':PILOT_ID,'pilots':PILOTS}

@app.get('/api/v1/outcome/status')
def outcome_status():
    s=state()
    return s.get('business_success_model',{'state':'COMING_SOON'})

@app.get('/api/v1/demo/scope')
def demo_scope():
    s=state()
    return s.get('demo_scope',{'active_pilot':PILOT_ID,'coming_soon':[]})

@app.get('/api/v1/status')
def status():
    s,inp,d=snapshot(); return {'ready':True,'demo_ready':True,'pilot':s['pilot'],'canonical_7d_score':d['canonical_7d_score'],'release_ready':d['release_ready'],'tier':d['tier'],'preliminary_decision':demo_decision(s,d),'ai_available':gemini_configured(),'voice_cloud_available':bhashini_configured(),'voice_asr_available':bhashini_asr_configured(),'voice_tts_available':bhashini_tts_configured(),'saved_ml_dl':True,'business_outcome_state':s.get('business_success_model',{}).get('state','COMING_SOON')}
@app.get('/api/v1/feasibility/{pilot_id}')
def feasibility(pilot_id): require(pilot_id); return snapshot()[2]
@app.get('/api/v1/7d/{pilot_id}')
def seven_d(pilot_id):
    require(pilot_id); s,inp,d=snapshot(); return {'pilot':s['pilot'],'dimensions':d['dimensions'],'canonical_7d_score':d['canonical_7d_score'],'release_ready':d['release_ready'],'tier':d['tier'],'preliminary_decision':demo_decision(s,d),'weights':WEIGHTS,'known_weighted_contribution':d['known_weighted_contribution'],'d7_metrics':d['d7_metrics'],'evidence_inputs':inp,'rules':d['rules']}
@app.post('/api/v1/7d/{pilot_id}/inputs')
def submit_7d(pilot_id, req:SevenDInputs):
    require(pilot_id); inc=req.model_dump()
    if inc.get('d6_risk_factors') is not None and set(inc['d6_risk_factors'])!=set(D6_KEYS): raise HTTPException(400,'D6 requires all 8 risk factors.')
    cur=inputs();
    for k,v in inc.items():
        if v is not None or k=='verification_note': cur[k]=v
    save_inputs(cur); return {'saved':True,**seven_d(pilot_id)}
@app.post('/api/v1/analysis')
def analysis(req:AnalysisRequest):
    if req.confirmed:
        vals=[req.projected_daily_customers,req.average_customer_spend,req.monthly_rent,req.other_monthly_operating_cost,req.break_even_revenue,req.startup_cost,req.monthly_debt_service]
        if any(v is None for v in vals): raise HTTPException(400,'Complete all local business inputs before confirming.')
        cur=inputs(); cur.update({'d7_projected_monthly_revenue':req.projected_daily_customers*req.average_customer_spend*30,'d7_monthly_operating_cost':req.monthly_rent+req.other_monthly_operating_cost,'d7_break_even_revenue':req.break_even_revenue,'d7_startup_cost':req.startup_cost,'d7_monthly_debt_service':req.monthly_debt_service,'verification_note':'User confirmed the entered business figures.'}); save_inputs(cur)
    s,inp,d=snapshot(); return {'pilot':s['pilot'],'analysis':d,'inputs':inp}
@app.get('/api/v1/profile/{pilot_id}')
def profile(pilot_id):
    require(pilot_id); s=state(); b=s['base_evidence']; return {'pilot':s['pilot'],'population_2011':b['population_2011'],'households_2011':b['households_2011'],'catchment_population_5km':b['catchment_population_5km'],'catchment_population_10km':b['catchment_population_10km'],'annual_tea_demand_pool_5km_kg':b['annual_tea_demand_pool_5km_kg'],'mean_annual_rainfall_mm':b['mean_annual_rainfall_mm'],'languages':b['languages'],'profile_coverage':'18/18','coverage_is_not_verification':True}
@app.get('/api/v1/market/{pilot_id}')
def market(pilot_id): require(pilot_id); return {'saved':state()['base_evidence']['input_prices'],'live':live_market()}
@app.get('/api/v1/evidence/{pilot_id}')
def evidence(pilot_id):
    require(pilot_id); s,inp,d=snapshot(); return {'base':s['base_evidence'],'inputs':inp,'decision':d}
@app.get('/api/v1/ml-advisory/{pilot_id}')
def ml_advisory(pilot_id): require(pilot_id); m=state()['base_evidence']['ml_dl']; return {'role':'ADVISORY_ONLY','can_modify_7d':False,**m}
@app.get('/api/v1/ml-registry')
def ml_registry(): return loadj(DATA/'ml_dl/registry.json')
@app.post('/api/v1/ai-jury/{pilot_id}')
def ai_jury(pilot_id, language:str='en'):
    require(pilot_id); s,inp,d=snapshot()
    if gemini_configured():
        return gemini_jury({'pilot':s['pilot'],'decision':d,'evidence_inputs':inp},language)
    return {'mode':'fallback','text':{'bn':'AI জুরি এখনো সংযুক্ত নয়। নির্ধারক 7D এবং উৎস-লেবেলযুক্ত প্রমাণ উপলভ্য।','hi':'AI जूरी अभी कनेक्ट नहीं है। निर्धारक 7D और स्रोत-लेबल वाला प्रमाण उपलब्ध है।','en':'AI Jury is not connected. Deterministic 7D and source-labelled evidence remain available.'}.get(language,'en'),'can_modify_7d':False}
@app.post('/api/v1/sathi')
def sathi(req:SathiRequest):
    s,inp,d=snapshot(); ctx={'pilot':s['pilot'],'decision':d,'ml_dl':s['base_evidence']['ml_dl'],'page':req.context.get('page')}; return gemini_ask(req.message,req.language,ctx)
def route_voice_text(text: str):
    """Deterministic keyword router for immediate page navigation from voice input."""
    t=text.strip().lower(); a=[]
    def nav(path,label): a.append({'action':'navigate','path':path,'label':label})
    if any(x in t for x in ['my location','আমার লোকেশন','আমার অবস্থান','मेरी लोकेशन','current location']): a.append({'action':'locate'})
    elif any(x in t for x in ['generate report','রিপোর্ট বানাও','রিপোর্ট তৈরি করো','रिपोर्ट बनाओ']): a.append({'action':'generate_report'})
    elif any(x in t for x in ['read page','পড়ে শোনাও','পড়ে শোনাও','পৃষ্ঠা পড়ো','पढ़कर सुनाओ']): a.append({'action':'read_page'})
    elif any(x in t for x in ['help','support','directory','সহায়তা','সাহায্য','মদद','मदद','सहायता']): nav('/directory','Help')
    elif any(x in t for x in ['sathi','assistant','chatbot','সাথী','चैटबॉट','साथी']): nav('/sathi','Sathi')
    elif any(x in t for x in ['home','হোম','घर']): nav('/','Home')
    elif any(x in t for x in ['business analysis','start analysis','business','analysis','ব্যবসা','বিশ্লেষণ','बिजनेस','विश्लेषण']): nav('/business-analysis','Business Analysis')
    elif any(x in t for x in ['local area','location','map','লোকেশন','মানচিত্র','लोकेशन','नक्शा']): nav('/local-area','Local Area')
    elif any(x in t for x in ['market','price','দাম','বাজার','मार्केट','कीमत','बाज़ार']): nav('/market','Market')
    elif any(x in t for x in ['finance','loan','ঋণ','লোন','वित्त','finance kholo']): nav('/finance','Finance')
    elif '7d' in t or any(x in t for x in ['সাত ডি','seven d','seven dimension','सात डी']): nav('/seven-d','7D')
    elif any(x in t for x in ['report','রিপোর্ট','रिपोर्ट']): nav('/reports','Reports')
    elif any(x in t for x in ['government','scheme','সরকার','স্কিম','योजना']): nav('/government','Government')
    elif any(x in t for x in ['document','data','ডকুমেন্ট','তথ্য','दस्तावेज़','डेटा']): nav('/documents','Documents')
    else: a.append({'action':'sathi','text':text})
    return a

@app.post('/api/v1/voice/command')
def voice_cmd(req:VoiceCommand):
    return {'language':req.language,'actions':route_voice_text(req.text)}

@app.get('/api/v1/map/evidence/{pilot_id}')
def map_evidence(pilot_id): require(pilot_id); s=state(); return {'center':s['pilot']['coordinates'],'saved':[{'name':'Litti Shop','osm_id':'12551125261','candidate_class':'INDIRECT_REVIEW','lat':26.69809,'lon':89.025638,'source':'Saved OSM evidence'}]}
@app.get('/api/v1/map/live')
def map_live(lat:float,lon:float,radius_m:int=5000):
    try:return osm_candidates(lat,lon,radius_m)
    except Exception as e: raise HTTPException(502,f'Live map source unavailable: {type(e).__name__}')
@app.post('/api/v1/routing')
def routing(req:RouteRequest):
    try:return route_distance(req.start_lat,req.start_lon,req.end_lat,req.end_lon,req.profile)
    except Exception as e: raise HTTPException(502,f'Routing source unavailable: {type(e).__name__}')
@app.post('/api/v1/report')
def report():
    s,inp,d=snapshot(); pd=demo_decision(s,d); payload={'decision':d,'preliminary_decision':pd}; html=make_html(payload,RUNTIME/'swanirvar_report.html'); make_pdf(html,RUNTIME/'swanirvar_report.pdf',payload); return {'html':'/api/v1/report/html','pdf':'/api/v1/report/pdf'}
@app.get('/api/v1/report/html')
def report_html():
    f=RUNTIME/'swanirvar_report.html';
    if not f.exists(): report();
    return FileResponse(f,media_type='text/html',filename='swanirvar_report.html')
@app.get('/api/v1/report/pdf')
def report_pdf():
    f=RUNTIME/'swanirvar_report.pdf';
    if not f.exists(): report();
    return FileResponse(f,media_type='application/pdf',filename='swanirvar_report.pdf')
@app.get('/api/v1/integrations')
def integrations():
    cs=[]
    for c in loadj(DATA/'connectors.json'):
        if c['id']=='bhashini':
            configured_now=bool((os.getenv('BHASHINI_TOKEN') or os.getenv('BHASHINI_INFERENCE_API_KEY')) and (os.getenv('BHASHINI_ASR_SERVICE_ID') or os.getenv('BHASHINI_ASR_SERVICE_ID_BN') or os.getenv('BHASHINI_ASR_SERVICE_ID_HI')))
        else:
            configured_now=all(os.getenv(k) for k in c['requires']) if c['requires'] else True
        cs.append({**c,'configured':configured_now})
    return {'connectors':cs}
@app.post('/api/v1/voice/recording')
async def voice_recording(language:str=Query('hi',pattern='^(en|bn|hi)$'),audio:UploadFile=File(...)):
    if not bhashini_asr_configured():
        raise HTTPException(503,'Cloud multilingual transcription is not configured. Add the Bhashini inference API key and an ASR service ID for the selected language in Colab Secrets.')
    try:
        result=bhashini_asr(await audio.read(),language,audio.content_type.split('/')[-1] if audio.content_type and '/' in audio.content_type else 'webm')
        text=result.get('text','').strip()
        if not text:
            return {'text':'','language':language,'actions':[{'action':'sathi','text':''}],'provider':'Bhashini'}
        actions=route_voice_text(text)
        return {'text':text,'language':language,'provider':'Bhashini','actions':actions}
    except Exception as e:
        raise HTTPException(502,f'Bhashini ASR failed: {type(e).__name__}: {e}')

@app.post('/api/v1/voice/asr')
async def voice_asr(language:str=Query('hi',pattern='^(en|bn|hi)$'),audio:UploadFile=File(...)):
    if not bhashini_asr_configured(): raise HTTPException(503,'Bhashini cloud ASR is not configured.')
    try:return bhashini_asr(await audio.read(),language,audio.content_type.split('/')[-1] if audio.content_type and '/' in audio.content_type else 'webm')
    except Exception as e: raise HTTPException(502,f'Bhashini ASR failed: {type(e).__name__}')
@app.post('/api/v1/voice/tts')
def voice_tts(req:VoiceTTSRequest):
    if not bhashini_tts_configured(): raise HTTPException(503,'Bhashini cloud TTS is not configured.')
    try:return bhashini_tts(req.text,req.language)
    except Exception as e: raise HTTPException(502,f'Bhashini TTS failed: {type(e).__name__}: {e}')
@app.get('/api/v1/services')
def services(): return {'service_groups':['Business analysis','Area intelligence','Market','Finance','7D','Reports','Government','Documents','Sathi','Voice']}
@app.post('/api/v1/reset-user-evidence')
def reset_user_evidence():
    if INPUT_FILE.exists(): INPUT_FILE.unlink()
    return {'reset':True}
@app.get('/{path:path}',include_in_schema=False)
def spa(path:str): return FileResponse(WEB/'index.html')
