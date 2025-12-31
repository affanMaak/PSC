
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Edit, Trash2, Plus, Calendar as CalendarIcon, MapPin, Clock, X } from "lucide-react";
import { format } from "date-fns";
import { getEvents, createEvent, updateEvent, deleteEvent } from "../../../config/apis";

export default function EventsTab() {
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editEvent, setEditEvent] = useState<any>(null);
    const [deleteData, setDeleteData] = useState<any>(null);
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data: events = [], isLoading } = useQuery({
        queryKey: ["content_events"],
        queryFn: getEvents,
    });

    const createMutation = useMutation({
        mutationFn: createEvent,
        onSuccess: () => {
            toast({ title: "Success", description: "Event created successfully" });
            queryClient.invalidateQueries({ queryKey: ["content_events"] });
            setIsAddOpen(false);
        },
        onError: (error: any) => toast({ title: "Error", description: error.message, variant: "destructive" }),
    });

    const updateMutation = useMutation({
        mutationFn: updateEvent,
        onSuccess: () => {
            toast({ title: "Success", description: "Event updated successfully" });
            queryClient.invalidateQueries({ queryKey: ["content_events"] });
            setEditEvent(null);
        },
        onError: (error: any) => toast({ title: "Error", description: error.message, variant: "destructive" }),
    });

    const deleteMutation = useMutation({
        mutationFn: deleteEvent,
        onSuccess: () => {
            toast({ title: "Success", description: "Event deleted successfully" });
            queryClient.invalidateQueries({ queryKey: ["content_events"] });
            setDeleteData(null);
        },
        onError: (error: any) => toast({ title: "Error", description: error.message, variant: "destructive" }),
    });

    const handleSubmit = (data: any, isEdit = false) => {
        const formData = new FormData();
        formData.append("title", data.title);
        formData.append("description", data.description);
        formData.append("venue", data.venue);
        // Ensure time is sent if present, otherwise handle accordingly. Backend type allows optional string.
        formData.append("time", data.time || "");
        formData.append("startDate", data.startDate);
        formData.append("endDate", data.endDate);

        if (data.images && data.images.length > 0) {
            // data.images is an array of File objects
            for (let i = 0; i < data.images.length; i++) {
                formData.append("images", data.images[i]); // Multer receives these
            }
        }

        if (isEdit) {
            // Send existing images that survived user removal
            if (data.existingImages) {
                formData.append("existingImages", JSON.stringify(data.existingImages));
            }
            updateMutation.mutate({ id: editEvent.id, data: formData });
        } else {
            createMutation.mutate(formData);
        }
    };

    if (isLoading) return <p>Loading events...</p>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-2xl font-semibold">Events</h3>
                <Button onClick={() => setIsAddOpen(true)} className="gap-2">
                    <Plus className="h-4 w-4" /> Add Event
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {events.map((event: any) => (
                    <Card key={event.id} className="overflow-hidden">

                        {event.images && event.images.length > 0 && (
                            <div className="aspect-video w-full overflow-hidden">
                                <img src={event.images[0]} alt={event.title} className="w-full h-full object-cover" />
                            </div>
                        )}
                        <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                                <h4 className="font-bold text-lg">{event.title}</h4>
                                <div className="flex gap-2">
                                    <Button variant="ghost" size="icon" onClick={() => setEditEvent(event)}><Edit className="h-4 w-4" /></Button>
                                    <Button variant="ghost" size="icon" onClick={() => setDeleteData(event)}><Trash2 className="h-4 w-4" /></Button>
                                </div>
                            </div>

                            <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2"><CalendarIcon className="h-3 w-3" /> {format(new Date(event.startDate), "PPP")} - {format(new Date(event.endDate), "PPP")}</div>
                                <div className="flex items-center gap-2"><Clock className="h-3 w-3" /> {event.time || "N/A"}</div>
                                <div className="flex items-center gap-2"><MapPin className="h-3 w-3" /> {event.venue || "N/A"}</div>
                            </div>
                            <p className="mt-3 text-sm line-clamp-3">{event.description}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader><DialogTitle>Add Event</DialogTitle></DialogHeader>
                    <EventForm onSubmit={(data: any) => handleSubmit(data)} onCancel={() => setIsAddOpen(false)} />
                </DialogContent>
            </Dialog>

            <Dialog open={!!editEvent} onOpenChange={() => setEditEvent(null)}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader><DialogTitle>Edit Event</DialogTitle></DialogHeader>
                    {editEvent && (
                        <EventForm
                            initialData={editEvent}
                            onSubmit={(data: any) => handleSubmit(data, true)}
                            onCancel={() => setEditEvent(null)}
                        />
                    )}
                </DialogContent>
            </Dialog>

            <Dialog open={!!deleteData} onOpenChange={() => setDeleteData(null)}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Delete Event</DialogTitle></DialogHeader>
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

function EventForm({ initialData, onSubmit, onCancel }: any) {
    const [form, setForm] = useState({
        title: initialData?.title || "",
        description: initialData?.description || "",
        venue: initialData?.venue || "",
        time: initialData?.time || "",
        startDate: initialData?.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : "",
        endDate: initialData?.endDate ? new Date(initialData.endDate).toISOString().split('T')[0] : "",
    });

    // Files to be uploaded
    const [newFiles, setNewFiles] = useState<File[]>([]);
    // Existing images (URLs)
    const [existingImagesData, setExistingImagesData] = useState<string[]>(initialData?.images || []);

    const handleFileChange = (e: any) => {
        if (e.target.files) {
            setNewFiles((prev) => [...prev, ...Array.from(e.target.files as FileList)]);
        }
    };

    const removeNewFile = (index: number) => {
        setNewFiles(prev => prev.filter((_, i) => i !== index));
    };

    const removeExistingImage = (index: number) => {
        setExistingImagesData(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = () => {
        onSubmit({
            ...form,
            images: newFiles,
            existingImages: existingImagesData
        })
    }

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
            <div className="grid grid-cols-2 gap-4">
                <div><Label>Venue</Label><Input value={form.venue} onChange={e => setForm({ ...form, venue: e.target.value })} className="mt-1" /></div>
                {/* Optional Time Picker */}
                <div>
                    <Label>Time (Optional)</Label>
                    <Input type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} className="mt-1" />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div><Label>Start Date</Label><Input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} className="mt-1" /></div>
                <div><Label>End Date</Label><Input type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} className="mt-1" /></div>
            </div>

            {/* Image Management Section */}
            <div>
                <Label>Images (Max 5)</Label>
                <Input type="file" multiple accept="image/*" onChange={handleFileChange} className="mt-1" />

                <div className="mt-4 space-y-4">
                    {/* Existing Images Preview & Remove */}
                    {existingImagesData.length > 0 && (
                        <div>
                            <p className="text-sm font-medium mb-2">Existing Images</p>
                            <div className="flex gap-2 flex-wrap">
                                {existingImagesData.map((src: string, i: number) => (
                                    <div key={`existing-${i}`} className="relative group">
                                        <img src={src} className="w-20 h-20 object-cover rounded border" />
                                        <button onClick={() => removeExistingImage(i)} className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* New Files Preview & Remove */}
                    {newFiles.length > 0 && (
                        <div>
                            <p className="text-sm font-medium mb-2">New Uploads</p>
                            <div className="flex gap-2 flex-wrap">
                                {newFiles.map((file: File, i: number) => (
                                    <div key={`new-${i}`} className="relative group">
                                        <img src={URL.createObjectURL(file)} className="w-20 h-20 object-cover rounded border" />
                                        <button onClick={() => removeNewFile(i)} className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <DialogFooter>
                <Button variant="outline" onClick={onCancel}>Cancel</Button>
                <Button onClick={handleSubmit}>Save</Button>
            </DialogFooter>
        </div>
    );
}
