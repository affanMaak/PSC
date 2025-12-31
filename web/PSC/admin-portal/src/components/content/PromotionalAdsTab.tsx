
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Edit, Trash2, Plus, Megaphone } from "lucide-react";
import { getAds, createAd, updateAd, deleteAd } from "../../../config/apis";
import { Switch } from "@/components/ui/switch";

export default function PromotionalAdsTab() {
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editAd, setEditAd] = useState<any>(null);
    const [deleteData, setDeleteData] = useState<any>(null);
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data: ads = [], isLoading } = useQuery({
        queryKey: ["content_ads"],
        queryFn: getAds,
    });

    const createMutation = useMutation({
        mutationFn: createAd,
        onSuccess: () => {
            toast({ title: "Success", description: "Ad created successfully" });
            queryClient.invalidateQueries({ queryKey: ["content_ads"] });
            setIsAddOpen(false);
        },
        onError: (error: any) => toast({ title: "Error", description: error.message, variant: "destructive" }),
    });

    const updateMutation = useMutation({
        mutationFn: updateAd,
        onSuccess: () => {
            toast({ title: "Success", description: "Ad updated successfully" });
            queryClient.invalidateQueries({ queryKey: ["content_ads"] });
            setEditAd(null);
        },
        onError: (error: any) => toast({ title: "Error", description: error.message, variant: "destructive" }),
    });

    const deleteMutation = useMutation({
        mutationFn: deleteAd,
        onSuccess: () => {
            toast({ title: "Success", description: "Ad deleted successfully" });
            queryClient.invalidateQueries({ queryKey: ["content_ads"] });
            setDeleteData(null);
        },
        onError: (error: any) => toast({ title: "Error", description: error.message, variant: "destructive" }),
    });

    const handleSubmit = (data: any, isEdit = false) => {
        const formData = new FormData();
        formData.append("title", data.title);
        formData.append("description", data.description);
        formData.append("isActive", String(data.isActive));

        // If it's a File object (new upload), it goes as a file.
        // If it's a string (existing URL), it goes as a text field.
        if (data.image) formData.append("image", data.image);

        if (isEdit) {
            updateMutation.mutate({ id: editAd.id, data: formData });
        } else {
            createMutation.mutate(formData);
        }
    };

    if (isLoading) return <p>Loading ads...</p>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-2xl font-semibold">Promotional Ads</h3>
                <Button onClick={() => setIsAddOpen(true)} className="gap-2">
                    <Plus className="h-4 w-4" /> Add Promotion
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {ads.map((ad: any) => (
                    <Card key={ad.id} className={`overflow-hidden ${!ad.isActive ? 'opacity-60' : ''}`}>
                        <div className="aspect-video w-full overflow-hidden bg-muted relative">
                            <img src={ad.image} alt={ad.title} className="w-full h-full object-cover" />
                            {!ad.isActive && <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white font-bold">INACTIVE</div>}
                        </div>
                        <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="font-bold text-lg">{ad.title}</h4>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="ghost" size="icon" onClick={() => setEditAd(ad)}><Edit className="h-4 w-4" /></Button>
                                    <Button variant="ghost" size="icon" onClick={() => setDeleteData(ad)}><Trash2 className="h-4 w-4" /></Button>
                                </div>
                            </div>
                            <p className="mt-2 text-sm line-clamp-3 text-muted-foreground">{ad.description}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Add Promotion</DialogTitle></DialogHeader>
                    <AdForm onSubmit={(data: any) => handleSubmit(data)} onCancel={() => setIsAddOpen(false)} />
                </DialogContent>
            </Dialog>

            <Dialog open={!!editAd} onOpenChange={() => setEditAd(null)}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Edit Promotion</DialogTitle></DialogHeader>
                    {editAd && <AdForm initialData={editAd} onSubmit={(data: any) => handleSubmit(data, true)} onCancel={() => setEditAd(null)} />}
                </DialogContent>
            </Dialog>

            <Dialog open={!!deleteData} onOpenChange={() => setDeleteData(null)}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Delete Ad</DialogTitle></DialogHeader>
                    <p>Are you sure you want to delete <strong>{deleteData?.title}</strong>?</p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteData(null)}>Cancel</Button>
                        <Button variant="destructive" onClick={() => deleteMutation.mutate(deleteData.id)}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function AdForm({ initialData, onSubmit, onCancel }: any) {
    const [form, setForm] = useState({
        title: initialData?.title || "",
        description: initialData?.description || "",
        isActive: initialData?.isActive !== undefined ? initialData.isActive : true,
        image: initialData?.image || null
    });

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
                <Label>Title</Label>
                <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="mt-1" />
            </div>
            <div>
                <Label>Description</Label>
                <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="mt-1" />
            </div>
            <div className="flex items-center gap-2">
                <Switch checked={form.isActive} onCheckedChange={(c) => setForm({ ...form, isActive: c })} />
                <Label>Active</Label>
            </div>
            <div>
                <Label>Image</Label>
                <Input type="file" accept="image/*" onChange={handleFileChange} className="mt-1" />
                <div className="mt-2">
                    {preview ? (
                        <div className="relative w-full h-40 rounded border overflow-hidden">
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
    );
}
