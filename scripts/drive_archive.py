"""Build lossless per-run archives for Google Drive. Uploads use the connected Drive tool."""
import argparse,hashlib,json,zipfile
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
def digest(data):return hashlib.sha256(data).hexdigest()
def build(output,run_id=None):
    output=Path(output).resolve()
    assert output!=ROOT and ROOT not in output.parents, 'Use an output directory outside the repository'
    output.mkdir(parents=True,exist_ok=True)
    index=json.loads((ROOT/'assets/daily/index.json').read_text(encoding='utf-8'))
    runs=[r for r in index['runs'] if run_id is None or r['id']==run_id]
    assert runs,'No matching runs'
    entries=[]
    for run in runs:
        paths={run['manifest']}
        folder=ROOT/Path(run['manifest']).parent
        paths.update(p.relative_to(ROOT).as_posix() for p in folder.rglob('*') if p.is_file())
        for a in run['assets']:
            p=ROOT/a['path'];data=p.read_bytes()
            assert digest(data)==a['sha256'],p
            paths.add(a['path'])
        for name in ['assets/styles.json','assets/categories.json','docs/STYLES.md']:
            paths.add(name)
        for name in paths:
            assert (ROOT/name).resolve().is_relative_to(ROOT), 'Archive path escapes repository'
        checks={name:digest((ROOT/name).read_bytes()) for name in sorted(paths)}
        filename=run['date']+'__'+run['id']+'__'+run['kind']+'.zip'
        dest=output/filename
        with zipfile.ZipFile(dest,'w',zipfile.ZIP_DEFLATED,compresslevel=1) as z:
            for name in sorted(paths):z.write(ROOT/name,name)
            z.writestr('DRIVE_ARCHIVE_CHECKSUMS.json',json.dumps(checks,ensure_ascii=False,indent=2))
        with zipfile.ZipFile(dest) as z:
            assert z.testzip() is None
            for name,sha in checks.items():assert digest(z.read(name))==sha,name
        data=dest.read_bytes()
        entries.append(dict(runId=run['id'],date=run['date'],assetCount=len(run['assets']),sourceManifestSha256=digest((ROOT/run['manifest']).read_bytes()),fileName=filename,path=str(dest),bytes=len(data),sha256=digest(data),md5=hashlib.md5(data).hexdigest()))
    (output/'upload-plan.json').write_text(json.dumps(entries,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(json.dumps(dict(archives=len(entries),images=sum(x['assetCount'] for x in entries),bytes=sum(x['bytes'] for x in entries),plan=str(output/'upload-plan.json')),ensure_ascii=False))
if __name__=='__main__':
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('--output',required=True);p.add_argument('--run-id');args=p.parse_args();build(args.output,args.run_id)

