import os, requests

def live_market():
    url=os.getenv('AGMARKNET_URL'); key=os.getenv('DATA_GOV_API_KEY')
    if not url or not key: return {'configured':False,'source':'saved evidence','items':[],'message':'Market connector needs official URL and API key.'}
    r=requests.get(url,params={'api-key':key,'format':'json','limit':100},timeout=30,headers={'User-Agent':'Swanirvar/1.1'})
    r.raise_for_status(); j=r.json(); return {'configured':True,'source':'Agmarknet/Data.gov.in','items':j.get('records',j.get('data',[]))}
