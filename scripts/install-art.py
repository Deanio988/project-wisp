#!/usr/bin/env python3
"""Install the prepared Project Wisp artwork ZIP into the development checkout.

Usage: python3 scripts/install-art.py /path/to/project_wisp_github_artwork_ready.zip
The archive is generated from the approved local v0.4.0 prototype and must be
supplied explicitly. No artwork is downloaded from third parties.
"""
import pathlib,sys,zipfile,struct
ROOT=pathlib.Path(__file__).resolve().parents[1]
FAMILIES=('mossling','glimlet','mistril','pebblin')
ACTIONS=('idle','walk','sleep','interact')
STAGES=('dormant','awakening','forming','emergence')
EXPECTED={f'preview/art/creatures/{f}_{a}_{i:02}.png':(64,64) for f in FAMILIES for a in ACTIONS for i in range(4)}
EXPECTED.update({f'preview/art/eggs/{f}_egg_{s}.png':(96,96) for f in FAMILIES for s in STAGES})
def main(path):
 with zipfile.ZipFile(path) as archive:
  names=set(archive.namelist())
  missing=EXPECTED.keys()-names
  if missing:raise SystemExit('Archive missing '+str(len(missing))+' assets: '+str(sorted(missing)[:4]))
  validated={}
  for name,(width,height) in EXPECTED.items():
   data=archive.read(name)
   if len(data)<26 or data[:8]!=bytes((137,80,78,71,13,10,26,10)) or data[12:16]!=b'IHDR' or struct.unpack('>II',data[16:24])!=(width,height) or data[25]!=6:
    raise SystemExit('Invalid RGBA PNG: '+name)
   validated[name]=data
  for name,data in validated.items():
   target=ROOT/name;target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(data)
 print('Installed',len(validated),'validated PNGs; 4 neutral egg images still required.')
if __name__=='__main__':
 if len(sys.argv)!=2:raise SystemExit('Usage: python3 scripts/install-art.py <artwork.zip>')
 main(sys.argv[1])
