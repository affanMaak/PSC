
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Edit, Trash2, Plus } from "lucide-react";
import { getAboutUs, upsertAboutUs, getHistory, createHistory, updateHistory, deleteHistory } from "../../../config/apis";

export default function AboutUsTab() {
    const [clubInfo, setClubInfo] = useState("");
    const [aboutUsId, setAboutUsId] = useState<number | null>(null);
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isAddHistory, setIsAddHistory] = useState(false);
    const [editHistory, setEditHistory] = useState<any>(null);
    const [deleteHistoryData, setDeleteHistoryData] = useState<any>(null);

    // About Us Data
    const { data: aboutUsData } = useQuery({ queryKey: ["content_about_us"], queryFn: getAboutUs });

    useEffect(() => {
        if (aboutUsData) {
            setClubInfo(aboutUsData.clubInfo);
            setAboutUsId(aboutUsData.id);
        }
    }, [aboutUsData]);

    const upsertAboutUsMutation = useMutation({
        mutationFn: upsertAboutUs,
        onSuccess: () => toast({ title: "Success", description: "Club Info updated" }),
        onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" })
    });

    const handleSaveInfo = () => {
        upsertAboutUsMutation.mutate({ id: aboutUsId, clubInfo });
    }

    // History Data
    const { data: historyList = [] } = useQuery({ queryKey: ["content_history"], queryFn: getHistory });

    const createHistoryMutation = useMutation({
        mutationFn: createHistory,
        onSuccess: () => {
            toast({ title: "Success", description: "History Item created" });
            queryClient.invalidateQueries({ queryKey: ["content_history"] });
            setIsAddHistory(false);
        },
        onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" })
    });

    const updateHistoryMutation = useMutation({
        mutationFn: updateHistory,
        onSuccess: () => {
            toast({ title: "Success", description: "History Item updated" });
            queryClient.invalidateQueries({ queryKey: ["content_history"] });
            setEditHistory(null);
        },
        onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" })
    });

    const deleteHistoryMutation = useMutation({
        mutationFn: deleteHistory,
        onSuccess: () => {
            toast({ title: "Success", description: "History Item deleted" });
            queryClient.invalidateQueries({ queryKey: ["content_history"] });
            setDeleteHistoryData(null);
        },
        onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" })
    });

    const handleHistorySubmit = (data: any, isEdit = false) => {
        const formData = new FormData();
        formData.append("description", data.description);

        // If it's a File object (new upload), it goes as a file.
        // If it's a string (existing URL), it goes as a text field.
        if (data.image) {
            formData.append("image", data.image);
        }

        if (isEdit) {
            updateHistoryMutation.mutate({ id: editHistory.id, data: formData });
        } else {
            createHistoryMutation.mutate(formData);
        }
    }

    return (
        <div className="space-y-8">
            {/* Club Info Section */}
            <Card>
                <CardContent className="p-6 space-y-4">
                    <h3 className="text-xl font-bold">Club Info</h3>
                    <div>
                        <Label>Description</Label>
                        <Textarea value={clubInfo} onChange={(e) => setClubInfo(e.target.value)} rows={5} className="mt-2" />
                    </div>
                    <Button onClick={handleSaveInfo} disabled={upsertAboutUsMutation.isPending}>
                        {upsertAboutUsMutation.isPending ? "Saving..." : "Save Club Info"}
                    </Button>
                </CardContent>
            </Card>

            {/* History Section */}
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">Club History</h3>
                    <Button onClick={() => setIsAddHistory(true)} className="gap-2"><Plus className="h-4 w-4" /> Add History Item</Button>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    {historyList.map((item: any) => (
                        <Card key={item.id} className="overflow-hidden">
                            <div className="flex flex-col md:flex-row">
                                {item.image && (
                                    <div className="w-full md:w-1/3 aspect-square bg-muted">
                                        <img src={item.image} alt="history" className="w-full h-full object-cover" />
                                    </div>
                                )}
                                <div className="p-4 flex-1 flex flex-col justify-between">
                                    <p className="text-sm">{item.description}</p>
                                    <div className="flex justify-end gap-2 mt-2">
                                        <Button variant="ghost" size="icon" onClick={() => setEditHistory(item)}><Edit className="h-4 w-4" /></Button>
                                        <Button variant="ghost" size="icon" onClick={() => setDeleteHistoryData(item)}><Trash2 className="h-4 w-4" /></Button>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>

            {/* History Dialogs */}
            <Dialog open={isAddHistory} onOpenChange={setIsAddHistory}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Add History</DialogTitle></DialogHeader>
                    <HistoryForm onSubmit={handleHistorySubmit} onCancel={() => setIsAddHistory(false)} />
                </DialogContent>
            </Dialog>

            <Dialog open={!!editHistory} onOpenChange={() => setEditHistory(null)}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Edit History</DialogTitle></DialogHeader>
                    {editHistory && <HistoryForm initialData={editHistory} onSubmit={(data: any) => handleHistorySubmit(data, true)} onCancel={() => setEditHistory(null)} />}
                </DialogContent>
            </Dialog>

            <Dialog open={!!deleteHistoryData} onOpenChange={() => setDeleteHistoryData(null)}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Delete History Item</DialogTitle></DialogHeader>
                    <p>Are you sure?</p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteHistoryData(null)}>Cancel</Button>
                        <Button variant="destructive" onClick={() => deleteHistoryMutation.mutate(deleteHistoryData.id)}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function HistoryForm({ initialData, onSubmit, onCancel }: any) {
    const [form, setForm] = useState({
        description: initialData?.description || "",
        image: initialData?.image || null // Can be string (URL) or eventually File
    });

    // To track specifically the new file for preview, or use form.image if it's a File
    const [preview, setPreview] = useState<string | null>(initialData?.image || null);

    const handleFileChange = (e: any) => {
        const file = e.target.files[0];
        if (file) {
            setForm({ ...form, image: file });
            setPreview(URL.createObjectURL(file));
        }
    };

    return (
        <div className="space-y-4 py-4">
            <div>
                <Label>Description</Label>
                <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="mt-1" />
            </div>
            <div>
                <Label>Image</Label>
                <Input type="file" accept="image/*" onChange={handleFileChange} className="mt-1" />
                <div className="mt-2">
                    {preview ? (
                        <div className="relative w-32 h-32 rounded border overflow-hidden">
                            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                    ) : (
                        <p className="text-xs text-muted-foreground mt-1">No image selected</p>
                    )}
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={onCancel}>Cancel</Button>
                <Button onClick={() => onSubmit(form)}>Save</Button>
            </DialogFooter>
        </div>
    )
}
