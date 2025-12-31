
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Edit, Trash2, Plus, Calendar } from "lucide-react";
import { getAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement } from "../../../config/apis";
import { format } from "date-fns";
import { Switch } from "@/components/ui/switch";

export default function AnnouncementsTab() {
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editItem, setEditItem] = useState<any>(null);
    const [deleteData, setDeleteData] = useState<any>(null);
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data: announcements = [], isLoading } = useQuery({
        queryKey: ["content_announcements"],
        queryFn: getAnnouncements,
    });

    const createMutation = useMutation({
        mutationFn: createAnnouncement,
        onSuccess: () => {
            toast({ title: "Success", description: "Announcement created" });
            queryClient.invalidateQueries({ queryKey: ["content_announcements"] });
            setIsAddOpen(false);
        },
        onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
    });

    const updateMutation = useMutation({
        mutationFn: updateAnnouncement,
        onSuccess: () => {
            toast({ title: "Success", description: "Announcement updated" });
            queryClient.invalidateQueries({ queryKey: ["content_announcements"] });
            setEditItem(null);
        },
        onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
    });

    const deleteMutation = useMutation({
        mutationFn: deleteAnnouncement,
        onSuccess: () => {
            toast({ title: "Success", description: "Announcement deleted" });
            queryClient.invalidateQueries({ queryKey: ["content_announcements"] });
            setDeleteData(null);
        },
        onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
    });

    const handleSubmit = (data: any, isEdit = false) => {
        if (isEdit) {
            updateMutation.mutate({ id: editItem.id, data });
        } else {
            createMutation.mutate(data);
        }
    };

    if (isLoading) return <p>Loading announcements...</p>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-2xl font-semibold">Announcements</h3>
                <Button onClick={() => setIsAddOpen(true)} className="gap-2">
                    <Plus className="h-4 w-4" /> Add Announcement
                </Button>
            </div>

            <div className="space-y-4">
                {announcements.map((item: any) => (
                    <Card key={item.id} className={!item.isActive ? "opacity-60" : ""}>
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-bold text-lg">{item.title}</h4>
                                        {!item.isActive && <span className="text-xs bg-muted px-2 py-0.5 rounded">Draft</span>}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                        <Calendar className="h-3 w-3" /> {format(new Date(item.date), "PPP")}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="ghost" size="icon" onClick={() => setEditItem(item)}><Edit className="h-4 w-4" /></Button>
                                    <Button variant="ghost" size="icon" onClick={() => setDeleteData(item)}><Trash2 className="h-4 w-4" /></Button>
                                </div>
                            </div>
                            <p className="mt-3 text-sm">{item.description}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Add Announcement</DialogTitle></DialogHeader>
                    <AnnouncementForm onSubmit={(data: any) => handleSubmit(data)} onCancel={() => setIsAddOpen(false)} />
                </DialogContent>
            </Dialog>

            <Dialog open={!!editItem} onOpenChange={() => setEditItem(null)}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Edit Announcement</DialogTitle></DialogHeader>
                    {editItem && <AnnouncementForm initialData={editItem} onSubmit={(data: any) => handleSubmit(data, true)} onCancel={() => setEditItem(null)} />}
                </DialogContent>
            </Dialog>

            <Dialog open={!!deleteData} onOpenChange={() => setDeleteData(null)}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Delete Announcement</DialogTitle></DialogHeader>
                    <p>Are you sure?</p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteData(null)}>Cancel</Button>
                        <Button variant="destructive" onClick={() => deleteMutation.mutate(deleteData.id)}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function AnnouncementForm({ initialData, onSubmit, onCancel }: any) {
    const [form, setForm] = useState({
        title: initialData?.title || "",
        description: initialData?.description || "",
        date: initialData?.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        isActive: initialData?.isActive !== undefined ? initialData.isActive : true
    });

    return (
        <div className="space-y-4 py-4">
            <div>
                <Label>Title</Label>
                <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="mt-1" />
            </div>
            <div>
                <Label>Description</Label>
                <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="mt-1" />
            </div>
            <div>
                <Label>Date</Label>
                <Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="mt-1" />
            </div>
            <div className="flex items-center gap-2">
                <Switch checked={form.isActive} onCheckedChange={(c) => setForm({ ...form, isActive: c })} />
                <Label>Active</Label>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={onCancel}>Cancel</Button>
                <Button onClick={() => onSubmit(form)}>Save</Button>
            </DialogFooter>
        </div>
    );
}
