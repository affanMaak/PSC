import React, { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2, CheckCircle, XCircle, Loader2, Clock, Upload, X, Image as ImageIcon, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { createSport, getSports, updateSport, deleteSport } from "../../config/apis";

interface SportChargeForm {
  chargeType: "PER_DAY" | "PER_MONTH" | "PER_GAME" | "PER_HOUR";
  memberCharges: string;
  spouseCharges: string;
  childrenCharges: string;
  guestCharges: string;
  affiliatedClubCharges: string;
}

interface DayTiming { open: string; close: string; isClosed: boolean; }
interface WeekTiming { monday: DayTiming; tuesday: DayTiming; wednesday: DayTiming; thursday: DayTiming; friday: DayTiming; saturday: DayTiming; sunday: DayTiming; }

interface SportForm {
  activity: string;
  description: string;
  isActive: boolean;
  charges: SportChargeForm[];
  enableGentsTiming: boolean;
  enableLadiesTiming: boolean;
  timingGents: WeekTiming;
  timingLadies: WeekTiming;
  dressCodeDos: string;
  dressCodeDonts: string;
  dos: string;
  donts: string;
  existingImages: string[];
  newImages: File[];
}

const daysOfWeek = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const;
const timeOptions = ["12:00 AM","12:30 AM","01:00 AM","01:30 AM","02:00 AM","02:30 AM","03:00 AM","03:30 AM","04:00 AM","04:30 AM","05:00 AM","05:30 AM","06:00 AM","06:30 AM","07:00 AM","07:30 AM","08:00 AM","08:30 AM","09:00 AM","09:30 AM","10:00 AM","10:30 AM","11:00 AM","11:30 AM","12:00 PM","12:30 PM","01:00 PM","01:30 PM","02:00 PM","02:30 PM","03:00 PM","03:30 PM","04:00 PM","04:30 PM","05:00 PM","05:30 PM","06:00 PM","06:30 PM","07:00 PM","07:30 PM","08:00 PM","08:30 PM","09:00 PM","09:30 PM","10:00 PM","10:30 PM","11:00 PM","11:30 PM"];
const initialDayTiming: DayTiming = { open: "09:00 AM", close: "05:00 PM", isClosed: false };
const initialWeekTiming: WeekTiming = { monday: {...initialDayTiming}, tuesday: {...initialDayTiming}, wednesday: {...initialDayTiming}, thursday: {...initialDayTiming}, friday: {...initialDayTiming}, saturday: {...initialDayTiming}, sunday: {...initialDayTiming, isClosed: true} };
const initialChargeForm: SportChargeForm = { chargeType: "PER_DAY", memberCharges: "", spouseCharges: "", childrenCharges: "", guestCharges: "", affiliatedClubCharges: "" };
const initialFormState: SportForm = { activity: "", description: "", isActive: true, charges: [initialChargeForm], enableGentsTiming: true, enableLadiesTiming: true, timingGents: {...initialWeekTiming}, timingLadies: {...initialWeekTiming}, dressCodeDos: "", dressCodeDonts: "", dos: "", donts: "", existingImages: [], newImages: [] };
const chargeTypeOptions = [{ value: "PER_DAY", label: "Per Day" },{ value: "PER_MONTH", label: "Per Month" },{ value: "PER_GAME", label: "Per Game" },{ value: "PER_HOUR", label: "Per Hour" }];
const quillModules = { toolbar: [[{'header':[1,2,3,false]}],['bold','italic','underline','strike'],[{'list':'ordered'},{'list':'bullet'}],['link'],[{'color':[]},{'background':[]}],['clean']] };
const quillFormats = ['header','bold','italic','underline','strike','list','bullet','link','color','background'];
const MAX_IMAGES = 5;

const ChargeTypeSection = React.memo(function ChargeTypeSection({ charges, onUpdateCharge, onAddCharge, onRemoveCharge }: { charges: SportChargeForm[]; onUpdateCharge: (i:number,f:string,v:string)=>void; onAddCharge: ()=>void; onRemoveCharge: (i:number)=>void }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-lg font-semibold">Pricing</Label>
        <Button type="button" variant="outline" size="sm" onClick={onAddCharge}><Plus className="h-4 w-4 mr-2"/>Add</Button>
      </div>
      {charges.map((c,i) => (
        <div key={i} className="p-4 border rounded-lg space-y-4 bg-muted/20">
          <div className="flex justify-between"><Label>Type #{i+1}</Label>{charges.length>1 && <Button type="button" variant="ghost" size="sm" onClick={()=>onRemoveCharge(i)}><Trash2 className="h-4 w-4"/></Button>}</div>
          <div className="grid grid-cols-3 gap-4">
            <div><Label>Type *</Label><select value={c.chargeType} onChange={e=>onUpdateCharge(i,"chargeType",e.target.value)} className="w-full p-2 border rounded-md mt-1">{chargeTypeOptions.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
            <div><Label>Member</Label><Input type="number" value={c.memberCharges} onChange={e=>onUpdateCharge(i,"memberCharges",e.target.value)} className="mt-1"/></div>
            <div><Label>Spouse</Label><Input type="number" value={c.spouseCharges} onChange={e=>onUpdateCharge(i,"spouseCharges",e.target.value)} className="mt-1"/></div>
            <div><Label>Children</Label><Input type="number" value={c.childrenCharges} onChange={e=>onUpdateCharge(i,"childrenCharges",e.target.value)} className="mt-1"/></div>
            <div><Label>Guest</Label><Input type="number" value={c.guestCharges} onChange={e=>onUpdateCharge(i,"guestCharges",e.target.value)} className="mt-1"/></div>
            <div><Label>Affiliated</Label><Input type="number" value={c.affiliatedClubCharges} onChange={e=>onUpdateCharge(i,"affiliatedClubCharges",e.target.value)} className="mt-1"/></div>
          </div>
        </div>
      ))}
    </div>
  );
});

const TimingSchedule = React.memo(function TimingSchedule({ timing, onUpdate }: { timing: WeekTiming; onUpdate: (d:keyof WeekTiming,f:keyof DayTiming,v:string|boolean)=>void }) {
  return (
    <div className="space-y-2">
      {daysOfWeek.map(day => (
        <div key={day} className="grid grid-cols-4 gap-4 items-center p-3 border rounded-lg bg-muted/10">
          <div className="capitalize font-medium">{day}</div>
          <div className="flex items-center gap-2"><Label className="text-sm">Closed</Label><Switch checked={timing[day].isClosed} onCheckedChange={c=>onUpdate(day,"isClosed",c)}/></div>
          <select value={timing[day].open} onChange={e=>onUpdate(day,"open",e.target.value)} disabled={timing[day].isClosed} className="w-full p-2 border rounded-md text-sm disabled:opacity-50">{timeOptions.map(t=><option key={t} value={t}>{t}</option>)}</select>
          <select value={timing[day].close} onChange={e=>onUpdate(day,"close",e.target.value)} disabled={timing[day].isClosed} className="w-full p-2 border rounded-md text-sm disabled:opacity-50">{timeOptions.map(t=><option key={t} value={t}>{t}</option>)}</select>
        </div>
      ))}
    </div>
  );
});

const TimingSection = React.memo(function TimingSection({ enableGents, enableLadies, timingGents, timingLadies, onToggleGents, onToggleLadies, onUpdateGents, onUpdateLadies }: { enableGents: boolean; enableLadies: boolean; timingGents: WeekTiming; timingLadies: WeekTiming; onToggleGents:(c:boolean)=>void; onToggleLadies:(c:boolean)=>void; onUpdateGents:(d:keyof WeekTiming,f:keyof DayTiming,v:string|boolean)=>void; onUpdateLadies:(d:keyof WeekTiming,f:keyof DayTiming,v:string|boolean)=>void }) {
  return (
    <div className="space-y-4">
      <Label className="text-lg font-semibold flex items-center gap-2"><Clock className="h-5 w-5"/>Schedule</Label>
      <div className="flex items-center gap-6 p-4 border rounded-lg bg-muted/20">
        <span className="text-sm font-medium">Enable for:</span>
        <label className="flex items-center gap-2"><input type="checkbox" checked={enableGents} onChange={e=>onToggleGents(e.target.checked)} className="w-4 h-4"/><span>Gents</span></label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={enableLadies} onChange={e=>onToggleLadies(e.target.checked)} className="w-4 h-4"/><span>Ladies</span></label>
      </div>
      {!enableGents && !enableLadies && <div className="text-center py-8 text-muted-foreground border rounded-lg">Enable at least one</div>}
      {(enableGents || enableLadies) && (
        <Tabs defaultValue={enableGents?"gents":"ladies"} className="w-full">
          <TabsList className={`grid w-full ${enableGents&&enableLadies?'grid-cols-2':'grid-cols-1'}`}>
            {enableGents && <TabsTrigger value="gents">Gents</TabsTrigger>}
            {enableLadies && <TabsTrigger value="ladies">Ladies</TabsTrigger>}
          </TabsList>
          {enableGents && <TabsContent value="gents" className="mt-4"><TimingSchedule timing={timingGents} onUpdate={onUpdateGents}/></TabsContent>}
          {enableLadies && <TabsContent value="ladies" className="mt-4"><TimingSchedule timing={timingLadies} onUpdate={onUpdateLadies}/></TabsContent>}
        </Tabs>
      )}
    </div>
  );
});

const RichTextSection = React.memo(function RichTextSection({ title, dosLabel, dontsLabel, dosValue, dontsValue, onDosChange, onDontsChange }: { title:string; dosLabel:string; dontsLabel:string; dosValue:string; dontsValue:string; onDosChange:(v:string)=>void; onDontsChange:(v:string)=>void }) {
  return (
    <div className="space-y-4">
      <Label className="text-lg font-semibold">{title}</Label>
      <div className="grid grid-cols-2 gap-4">
        <div><Label className="text-green-600">{dosLabel}</Label><div className="mt-1"><ReactQuill theme="snow" value={dosValue} onChange={onDosChange} className="h-40 mb-12" modules={quillModules} formats={quillFormats}/></div></div>
        <div><Label className="text-red-600">{dontsLabel}</Label><div className="mt-1"><ReactQuill theme="snow" value={dontsValue} onChange={onDontsChange} className="h-40 mb-12" modules={quillModules} formats={quillFormats}/></div></div>
      </div>
    </div>
  );
});

const ImageUploadSection = React.memo(function ImageUploadSection({ existingImages, newImages, onRemoveExisting, onRemoveNew, onAddImages }: { existingImages:string[]; newImages:File[]; onRemoveExisting:(i:number)=>void; onRemoveNew:(i:number)=>void; onAddImages:(f:File[])=>void }) {
  const ref = useRef<HTMLInputElement>(null);
  const total = existingImages.length + newImages.length;
  return (
    <div className="space-y-4">
      <div className="flex justify-between"><Label className="text-lg font-semibold"><ImageIcon className="h-5 w-5 inline mr-2"/>Images (Max {MAX_IMAGES})</Label><span className="text-sm text-muted-foreground">{total}/{MAX_IMAGES}</span></div>
      <div className="grid grid-cols-5 gap-4">
        {existingImages.map((u,i)=><div key={`e-${i}`} className="relative group aspect-square border rounded-lg overflow-hidden"><img src={u} className="w-full h-full object-cover"/><button type="button" onClick={()=>onRemoveExisting(i)} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100"><X className="h-4 w-4"/></button></div>)}
        {newImages.map((f,i)=><div key={`n-${i}`} className="relative group aspect-square border rounded-lg overflow-hidden"><img src={URL.createObjectURL(f)} className="w-full h-full object-cover"/><div className="absolute top-0 left-0 bg-blue-500 text-white text-xs px-1 rounded-br">New</div><button type="button" onClick={()=>onRemoveNew(i)} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100"><X className="h-4 w-4"/></button></div>)}
        {total<MAX_IMAGES && <button type="button" onClick={()=>ref.current?.click()} className="aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 hover:bg-muted/50"><Upload className="h-8 w-8 text-muted-foreground"/><span className="text-xs text-muted-foreground">Add</span></button>}
      </div>
      <input ref={ref} type="file" accept="image/*" multiple className="hidden" onChange={e=>{if(e.target.files){onAddImages(Array.from(e.target.files).slice(0,MAX_IMAGES-total));e.target.value=''}}}/>
    </div>
  );
});

export default function Sports() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editSport, setEditSport] = useState<any>(null);
  const [deleteData, setDeleteData] = useState<any>(null);
  const [viewSport, setViewSport] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<SportForm>(initialFormState);
  const [editForm, setEditForm] = useState<SportForm>(initialFormState);

  const { data: sports = [], isLoading } = useQuery({ queryKey: ["sports"], queryFn: getSports });
  const createMutation = useMutation({ mutationFn: createSport, onSuccess: () => { toast({ title: "Created" }); queryClient.invalidateQueries({ queryKey: ["sports"] }); setIsAddOpen(false); setForm(initialFormState); }, onError: (e:any) => toast({ title: "Failed", description: e?.message, variant: "destructive" }) });
  const updateMutation = useMutation({ mutationFn: ({ id, data }: { id: number; data: FormData }) => updateSport(id, data), onSuccess: () => { toast({ title: "Updated" }); queryClient.invalidateQueries({ queryKey: ["sports"] }); setEditSport(null); }, onError: (e:any) => toast({ title: "Failed", description: e?.message, variant: "destructive" }) });
  const deleteMutation = useMutation({ mutationFn: deleteSport, onSuccess: () => { toast({ title: "Deleted" }); queryClient.invalidateQueries({ queryKey: ["sports"] }); setDeleteData(null); }, onError: (e:any) => toast({ title: "Failed", description: e?.message, variant: "destructive" }) });

  useEffect(() => {
    if (editSport) {
      const hasG = editSport.timing && Object.keys(editSport.timing).length > 0;
      const hasL = editSport.timingLadies && Object.keys(editSport.timingLadies).length > 0;
      setEditForm({ activity: editSport.activity||"", description: editSport.description||"", isActive: editSport.isActive??true, charges: editSport.sportCharge?.length>0 ? editSport.sportCharge.map((c:any)=>({ chargeType:c.chargeType, memberCharges:c.memberCharges?.toString()||"0", spouseCharges:c.spouseCharges?.toString()||"0", childrenCharges:c.childrenCharges?.toString()||"0", guestCharges:c.guestCharges?.toString()||"0", affiliatedClubCharges:c.affiliatedClubCharges?.toString()||"0" })) : [initialChargeForm], enableGentsTiming: hasG, enableLadiesTiming: hasL, timingGents: hasG?editSport.timing:initialWeekTiming, timingLadies: hasL?editSport.timingLadies:initialWeekTiming, dressCodeDos: editSport.dressCodeDos||"", dressCodeDonts: editSport.dressCodeDonts||"", dos: editSport.dos||"", donts: editSport.donts||"", existingImages: (editSport.images as string[])||[], newImages: [] });
    }
  }, [editSport]);

  const buildFormData = useCallback((f: SportForm, isEdit: boolean) => {
    const fd = new FormData();
    fd.append("activity", f.activity); fd.append("description", f.description||""); fd.append("isActive", String(f.isActive));
    fd.append("timing", JSON.stringify(f.enableGentsTiming ? f.timingGents : {}));
    fd.append("timingLadies", JSON.stringify(f.enableLadiesTiming ? f.timingLadies : {}));
    fd.append("dressCodeDos", f.dressCodeDos||""); fd.append("dressCodeDonts", f.dressCodeDonts||""); fd.append("dos", f.dos||""); fd.append("donts", f.donts||"");
    const valid = f.charges.filter(c => c.memberCharges || c.spouseCharges || c.childrenCharges || c.guestCharges || c.affiliatedClubCharges);
    fd.append("sportCharge", JSON.stringify(valid));
    if (isEdit) fd.append("existingimgs", JSON.stringify(f.existingImages));
    f.newImages.forEach(file => fd.append("files", file));
    return fd;
  }, []);

  const handleCreate = useCallback(() => { if (!form.activity.trim()) { toast({ title: "Name required", variant: "destructive" }); return; } createMutation.mutate(buildFormData(form, false)); }, [form, createMutation, toast, buildFormData]);
  const handleUpdate = useCallback(() => { if (!editForm.activity.trim()) { toast({ title: "Name required", variant: "destructive" }); return; } updateMutation.mutate({ id: editSport.id, data: buildFormData(editForm, true) }); }, [editForm, editSport, updateMutation, toast, buildFormData]);

  const formatCurrency = (a: string|number) => new Intl.NumberFormat('en-PK', { minimumFractionDigits: 2 }).format(typeof a === 'string' ? parseFloat(a) : a);
  const getChargeLabel = (t: string) => chargeTypeOptions.find(o => o.value === t)?.label || t;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center gap-4">
        <div><h2 className="text-3xl font-bold">Sports Activities</h2><p className="text-muted-foreground">Manage sports facilities</p></div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2"/>Add Sport</Button></DialogTrigger>
          <DialogContent className="max-w-7xl h-[90vh] overflow-y-auto flex flex-col">
            <DialogHeader><DialogTitle>Add Sport Activity</DialogTitle></DialogHeader>
            <div className="py-4 flex-1">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-5"><TabsTrigger value="basic">Basic</TabsTrigger><TabsTrigger value="images">Images</TabsTrigger><TabsTrigger value="timing">Timing</TabsTrigger><TabsTrigger value="dresscode">Dress Code</TabsTrigger><TabsTrigger value="rules">Rules</TabsTrigger></TabsList>
                <TabsContent value="basic" className="space-y-6 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>Activity *</Label><Input value={form.activity} onChange={e=>setForm(p=>({...p,activity:e.target.value}))} className="mt-2"/></div>
                    <div className="flex justify-between p-4 border rounded-lg"><div><Label>Status</Label><p className="text-sm text-muted-foreground">{form.isActive?"Active":"Inactive"}</p></div><Switch checked={form.isActive} onCheckedChange={c=>setForm(p=>({...p,isActive:c}))}/></div>
                  </div>
                  <div><Label>Description</Label><Textarea value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} className="mt-2"/></div>
                  <ChargeTypeSection charges={form.charges} onUpdateCharge={(i,f,v)=>setForm(p=>({...p,charges:p.charges.map((c,j)=>j===i?{...c,[f]:v}:c)}))} onAddCharge={()=>setForm(p=>({...p,charges:[...p.charges,{...initialChargeForm}]}))} onRemoveCharge={i=>setForm(p=>({...p,charges:p.charges.filter((_,j)=>j!==i)}))}/>
                </TabsContent>
                <TabsContent value="images" className="mt-4"><ImageUploadSection existingImages={form.existingImages} newImages={form.newImages} onRemoveExisting={i=>setForm(p=>({...p,existingImages:p.existingImages.filter((_,j)=>j!==i)}))} onRemoveNew={i=>setForm(p=>({...p,newImages:p.newImages.filter((_,j)=>j!==i)}))} onAddImages={f=>setForm(p=>({...p,newImages:[...p.newImages,...f]}))}/></TabsContent>
                <TabsContent value="timing" className="mt-4"><TimingSection enableGents={form.enableGentsTiming} enableLadies={form.enableLadiesTiming} timingGents={form.timingGents} timingLadies={form.timingLadies} onToggleGents={c=>setForm(p=>({...p,enableGentsTiming:c}))} onToggleLadies={c=>setForm(p=>({...p,enableLadiesTiming:c}))} onUpdateGents={(d,f,v)=>setForm(p=>({...p,timingGents:{...p.timingGents,[d]:{...p.timingGents[d],[f]:v}}}))} onUpdateLadies={(d,f,v)=>setForm(p=>({...p,timingLadies:{...p.timingLadies,[d]:{...p.timingLadies[d],[f]:v}}}))}/></TabsContent>
                <TabsContent value="dresscode" className="mt-4"><RichTextSection title="Dress Code" dosLabel="✓ Do's" dontsLabel="✗ Don'ts" dosValue={form.dressCodeDos} dontsValue={form.dressCodeDonts} onDosChange={v=>setForm(p=>({...p,dressCodeDos:v}))} onDontsChange={v=>setForm(p=>({...p,dressCodeDonts:v}))}/></TabsContent>
                <TabsContent value="rules" className="mt-4"><RichTextSection title="General Rules" dosLabel="✓ Do's" dontsLabel="✗ Don'ts" dosValue={form.dos} dontsValue={form.donts} onDosChange={v=>setForm(p=>({...p,dos:v}))} onDontsChange={v=>setForm(p=>({...p,donts:v}))}/></TabsContent>
              </Tabs>
            </div>
            <DialogFooter><Button variant="outline" onClick={()=>setIsAddOpen(false)}>Cancel</Button><Button onClick={handleCreate} disabled={createMutation.isPending}>{createMutation.isPending?<><Loader2 className="h-4 w-4 animate-spin mr-2"/>Creating...</>:"Add"}</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="shadow-lg"><CardContent className="p-0">
        {isLoading ? <div className="flex justify-center py-32"><Loader2 className="h-12 w-12 animate-spin"/></div> : sports?.length===0 ? <div className="text-center py-32 text-muted-foreground">No sports found</div> : (
          <Table>
            <TableHeader><TableRow className="bg-muted/50"><TableHead>Image</TableHead><TableHead>Activity</TableHead><TableHead>Charges</TableHead><TableHead>Pricing</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {sports?.map((s:any) => (
                <TableRow key={s.id}>
                  <TableCell>{s.images?.length>0?<img src={s.images[0]} className="w-12 h-12 object-cover rounded"/>:<div className="w-12 h-12 bg-muted rounded flex items-center justify-center"><ImageIcon className="h-6 w-6 text-muted-foreground"/></div>}</TableCell>
                  <TableCell className="font-medium">{s.activity}</TableCell>
                  <TableCell>{s.sportCharge?.map((c:any,i:number)=><Badge key={i} variant="outline" className="mr-1">{getChargeLabel(c.chargeType)}</Badge>)}</TableCell>
                  <TableCell className="text-sm">{s.sportCharge?.slice(0,2).map((c:any,i:number)=><div key={i}>{getChargeLabel(c.chargeType)}: PKR {formatCurrency(c.memberCharges||0)}</div>)}</TableCell>
                  <TableCell>{s.isActive?<Badge className="bg-green-600"><CheckCircle className="h-3 w-3 mr-1"/>Active</Badge>:<Badge variant="secondary"><XCircle className="h-3 w-3 mr-1"/>Inactive</Badge>}</TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button variant="ghost" size="icon" onClick={()=>setViewSport(s)} title="View"><Eye className="h-4 w-4"/></Button>
                    <Button variant="ghost" size="icon" onClick={()=>setEditSport(s)} title="Edit"><Edit className="h-4 w-4"/></Button>
                    <Button variant="ghost" size="icon" onClick={()=>setDeleteData(s)} title="Delete"><Trash2 className="h-4 w-4"/></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent></Card>

      {/* Edit Dialog */}
      <Dialog open={!!editSport} onOpenChange={()=>setEditSport(null)}>
        <DialogContent className="max-w-7xl h-[90vh] overflow-y-auto flex flex-col">
          <DialogHeader><DialogTitle>Edit Sport Activity</DialogTitle></DialogHeader>
          <div className="py-4 flex-1">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-5"><TabsTrigger value="basic">Basic</TabsTrigger><TabsTrigger value="images">Images</TabsTrigger><TabsTrigger value="timing">Timing</TabsTrigger><TabsTrigger value="dresscode">Dress Code</TabsTrigger><TabsTrigger value="rules">Rules</TabsTrigger></TabsList>
              <TabsContent value="basic" className="space-y-6 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Activity *</Label><Input value={editForm.activity} onChange={e=>setEditForm(p=>({...p,activity:e.target.value}))} className="mt-2"/></div>
                  <div className="flex justify-between p-4 border rounded-lg"><div><Label>Status</Label><p className="text-sm text-muted-foreground">{editForm.isActive?"Active":"Inactive"}</p></div><Switch checked={editForm.isActive} onCheckedChange={c=>setEditForm(p=>({...p,isActive:c}))}/></div>
                </div>
                <div><Label>Description</Label><Textarea value={editForm.description} onChange={e=>setEditForm(p=>({...p,description:e.target.value}))} className="mt-2"/></div>
                <ChargeTypeSection charges={editForm.charges} onUpdateCharge={(i,f,v)=>setEditForm(p=>({...p,charges:p.charges.map((c,j)=>j===i?{...c,[f]:v}:c)}))} onAddCharge={()=>setEditForm(p=>({...p,charges:[...p.charges,{...initialChargeForm}]}))} onRemoveCharge={i=>setEditForm(p=>({...p,charges:p.charges.filter((_,j)=>j!==i)}))}/>
              </TabsContent>
              <TabsContent value="images" className="mt-4"><ImageUploadSection existingImages={editForm.existingImages} newImages={editForm.newImages} onRemoveExisting={i=>setEditForm(p=>({...p,existingImages:p.existingImages.filter((_,j)=>j!==i)}))} onRemoveNew={i=>setEditForm(p=>({...p,newImages:p.newImages.filter((_,j)=>j!==i)}))} onAddImages={f=>setEditForm(p=>({...p,newImages:[...p.newImages,...f]}))}/></TabsContent>
              <TabsContent value="timing" className="mt-4"><TimingSection enableGents={editForm.enableGentsTiming} enableLadies={editForm.enableLadiesTiming} timingGents={editForm.timingGents} timingLadies={editForm.timingLadies} onToggleGents={c=>setEditForm(p=>({...p,enableGentsTiming:c}))} onToggleLadies={c=>setEditForm(p=>({...p,enableLadiesTiming:c}))} onUpdateGents={(d,f,v)=>setEditForm(p=>({...p,timingGents:{...p.timingGents,[d]:{...p.timingGents[d],[f]:v}}}))} onUpdateLadies={(d,f,v)=>setEditForm(p=>({...p,timingLadies:{...p.timingLadies,[d]:{...p.timingLadies[d],[f]:v}}}))}/></TabsContent>
              <TabsContent value="dresscode" className="mt-4"><RichTextSection title="Dress Code" dosLabel="✓ Do's" dontsLabel="✗ Don'ts" dosValue={editForm.dressCodeDos} dontsValue={editForm.dressCodeDonts} onDosChange={v=>setEditForm(p=>({...p,dressCodeDos:v}))} onDontsChange={v=>setEditForm(p=>({...p,dressCodeDonts:v}))}/></TabsContent>
              <TabsContent value="rules" className="mt-4"><RichTextSection title="General Rules" dosLabel="✓ Do's" dontsLabel="✗ Don'ts" dosValue={editForm.dos} dontsValue={editForm.donts} onDosChange={v=>setEditForm(p=>({...p,dos:v}))} onDontsChange={v=>setEditForm(p=>({...p,donts:v}))}/></TabsContent>
            </Tabs>
          </div>
          <DialogFooter><Button variant="outline" onClick={()=>setEditSport(null)}>Cancel</Button><Button onClick={handleUpdate} disabled={updateMutation.isPending}>{updateMutation.isPending?<><Loader2 className="h-4 w-4 animate-spin mr-2"/>Updating...</>:"Update"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteData} onOpenChange={()=>setDeleteData(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Sport</DialogTitle></DialogHeader>
          <p className="py-4 text-muted-foreground">Delete <strong>{deleteData?.activity}</strong>?</p>
          <DialogFooter><Button variant="outline" onClick={()=>setDeleteData(null)}>Cancel</Button><Button variant="destructive" onClick={()=>deleteMutation.mutate(deleteData?.id)} disabled={deleteMutation.isPending}>{deleteMutation.isPending?<Loader2 className="h-4 w-4 animate-spin"/>:"Delete"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={!!viewSport} onOpenChange={()=>setViewSport(null)}>
        <DialogContent className="max-w-7xl h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Sport Details: {viewSport?.activity}</DialogTitle></DialogHeader>
          <div className="py-4 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div><Label className="text-muted-foreground">Activity</Label><p className="font-medium text-lg">{viewSport?.activity}</p></div>
              <div><Label className="text-muted-foreground">Status</Label><p>{viewSport?.isActive?<Badge className="bg-green-600"><CheckCircle className="h-3 w-3 mr-1"/>Active</Badge>:<Badge variant="secondary"><XCircle className="h-3 w-3 mr-1"/>Inactive</Badge>}</p></div>
            </div>
            {viewSport?.description && <div><Label className="text-muted-foreground">Description</Label><p className="mt-1">{viewSport.description}</p></div>}
            {viewSport?.images?.length>0 && <div><Label className="text-muted-foreground">Images</Label><div className="grid grid-cols-5 gap-4 mt-2">{viewSport.images.map((u:string,i:number)=><img key={i} src={u} className="w-full aspect-square object-cover rounded-lg border"/>)}</div></div>}
            {viewSport?.sportCharge?.length>0 && (
              <div><Label className="text-muted-foreground">Pricing</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">{viewSport.sportCharge.map((c:any,i:number)=>(
                  <div key={i} className="p-3 border rounded-lg bg-muted/20">
                    <Badge variant="outline" className="mb-2">{getChargeLabel(c.chargeType)}</Badge>
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between"><span>Member:</span><span className="font-medium">PKR {formatCurrency(c.memberCharges||0)}</span></div>
                      <div className="flex justify-between"><span>Spouse:</span><span className="font-medium">PKR {formatCurrency(c.spouseCharges||0)}</span></div>
                      <div className="flex justify-between"><span>Children:</span><span className="font-medium">PKR {formatCurrency(c.childrenCharges||0)}</span></div>
                      <div className="flex justify-between"><span>Guest:</span><span className="font-medium">PKR {formatCurrency(c.guestCharges||0)}</span></div>
                      <div className="flex justify-between"><span>Affiliated:</span><span className="font-medium">PKR {formatCurrency(c.affiliatedClubCharges||0)}</span></div>
                    </div>
                  </div>
                ))}</div>
              </div>
            )}
            {((viewSport?.timing && Object.keys(viewSport.timing).length>0) || (viewSport?.timingLadies && Object.keys(viewSport.timingLadies).length>0)) && (
              <div>
                <Label className="text-muted-foreground flex items-center gap-2"><Clock className="h-4 w-4"/>Timing</Label>
                <Tabs defaultValue={viewSport?.timing && Object.keys(viewSport.timing).length>0?"gents":"ladies"} className="mt-2">
                  <TabsList>
                    {viewSport?.timing && Object.keys(viewSport.timing).length>0 && <TabsTrigger value="gents">Gents</TabsTrigger>}
                    {viewSport?.timingLadies && Object.keys(viewSport.timingLadies).length>0 && <TabsTrigger value="ladies">Ladies</TabsTrigger>}
                  </TabsList>
                  {viewSport?.timing && Object.keys(viewSport.timing).length>0 && (
                    <TabsContent value="gents" className="mt-2">
                      <div className="grid grid-cols-7 gap-2 text-center text-sm">{daysOfWeek.map(d=><div key={d} className="p-2 border rounded bg-muted/20"><div className="font-medium capitalize">{d.slice(0,3)}</div>{viewSport.timing[d]?.isClosed?<div className="text-red-500 text-xs">Closed</div>:<div className="text-xs">{viewSport.timing[d]?.open} - {viewSport.timing[d]?.close}</div>}</div>)}</div>
                    </TabsContent>
                  )}
                  {viewSport?.timingLadies && Object.keys(viewSport.timingLadies).length>0 && (
                    <TabsContent value="ladies" className="mt-2">
                      <div className="grid grid-cols-7 gap-2 text-center text-sm">{daysOfWeek.map(d=><div key={d} className="p-2 border rounded bg-muted/20"><div className="font-medium capitalize">{d.slice(0,3)}</div>{viewSport.timingLadies[d]?.isClosed?<div className="text-red-500 text-xs">Closed</div>:<div className="text-xs">{viewSport.timingLadies[d]?.open} - {viewSport.timingLadies[d]?.close}</div>}</div>)}</div>
                    </TabsContent>
                  )}
                </Tabs>
              </div>
            )}
            {(viewSport?.dressCodeDos || viewSport?.dressCodeDonts) && (
              <div><Label className="text-muted-foreground">Dress Code</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  {viewSport.dressCodeDos && <div className="p-3 border rounded-lg bg-green-50"><span className="text-green-600 font-medium">✓ Do's</span><div className="mt-2 text-sm prose max-w-none" dangerouslySetInnerHTML={{__html:viewSport.dressCodeDos}}/></div>}
                  {viewSport.dressCodeDonts && <div className="p-3 border rounded-lg bg-red-50"><span className="text-red-600 font-medium">✗ Don'ts</span><div className="mt-2 text-sm prose max-w-none" dangerouslySetInnerHTML={{__html:viewSport.dressCodeDonts}}/></div>}
                </div>
              </div>
            )}
            {(viewSport?.dos || viewSport?.donts) && (
              <div><Label className="text-muted-foreground">General Rules</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  {viewSport.dos && <div className="p-3 border rounded-lg bg-green-50"><span className="text-green-600 font-medium">✓ Do's</span><div className="mt-2 text-sm prose max-w-none" dangerouslySetInnerHTML={{__html:viewSport.dos}}/></div>}
                  {viewSport.donts && <div className="p-3 border rounded-lg bg-red-50"><span className="text-red-600 font-medium">✗ Don'ts</span><div className="mt-2 text-sm prose max-w-none" dangerouslySetInnerHTML={{__html:viewSport.donts}}/></div>}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={()=>setViewSport(null)}>Close</Button>
            <Button onClick={()=>{setViewSport(null);setEditSport(viewSport)}}>Edit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}