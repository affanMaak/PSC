
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Edit, Trash2, Plus } from "lucide-react";
import { getRules, createRule, updateRule, deleteRule } from "../../../config/apis";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export default function ClubRulesTab() {
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editRule, setEditRule] = useState<any>(null);
    const [deleteData, setDeleteData] = useState<any>(null);
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data: rules = [], isLoading } = useQuery({
        queryKey: ["content_rules"],
        queryFn: getRules,
    });

    const createMutation = useMutation({
        mutationFn: createRule,
        onSuccess: () => {
            toast({ title: "Success", description: "Rule created successfully" });
            queryClient.invalidateQueries({ queryKey: ["content_rules"] });
            setIsAddOpen(false);
        },
        onError: (error: any) => toast({ title: "Error", description: error.message, variant: "destructive" }),
    });

    const updateMutation = useMutation({
        mutationFn: updateRule,
        onSuccess: () => {
            toast({ title: "Success", description: "Rule updated successfully" });
            queryClient.invalidateQueries({ queryKey: ["content_rules"] });
            setEditRule(null);
        },
        onError: (error: any) => toast({ title: "Error", description: error.message, variant: "destructive" }),
    });

    const deleteMutation = useMutation({
        mutationFn: deleteRule,
        onSuccess: () => {
            toast({ title: "Success", description: "Rule deleted successfully" });
            queryClient.invalidateQueries({ queryKey: ["content_rules"] });
            setDeleteData(null);
        },
        onError: (error: any) => toast({ title: "Error", description: error.message, variant: "destructive" }),
    });

    const handleSubmit = (data: any, isEdit = false) => {
        if (isEdit) {
            updateMutation.mutate({ id: editRule.id, data });
        } else {
            createMutation.mutate(data);
        }
    }

    if (isLoading) return <p>Loading rules...</p>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-2xl font-semibold">Club Rules</h3>
                <Button onClick={() => setIsAddOpen(true)} className="gap-2">
                    <Plus className="h-4 w-4" /> Add Rule Section
                </Button>
            </div>

            <div className="space-y-4">
                {rules.map((rule: any) => (
                    <Card key={rule.id}>
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: rule.content }} />
                                <div className="flex gap-2 shrink-0 ml-4">
                                    <Button variant="ghost" size="icon" onClick={() => setEditRule(rule)}><Edit className="h-4 w-4" /></Button>
                                    <Button variant="ghost" size="icon" onClick={() => setDeleteData(rule)}><Trash2 className="h-4 w-4" /></Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader><DialogTitle>Add Rule Section</DialogTitle></DialogHeader>
                    <RuleForm onSubmit={(data: any) => handleSubmit(data)} onCancel={() => setIsAddOpen(false)} />
                </DialogContent>
            </Dialog>

            <Dialog open={!!editRule} onOpenChange={() => setEditRule(null)}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader><DialogTitle>Edit Rule Section</DialogTitle></DialogHeader>
                    {editRule && <RuleForm initialData={editRule} onSubmit={(data: any) => handleSubmit(data, true)} onCancel={() => setEditRule(null)} />}
                </DialogContent>
            </Dialog>

            <Dialog open={!!deleteData} onOpenChange={() => setDeleteData(null)}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Delete Rule</DialogTitle></DialogHeader>
                    <p>Are you sure you want to delete this rule section?</p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteData(null)}>Cancel</Button>
                        <Button variant="destructive" onClick={() => deleteMutation.mutate(deleteData.id)}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function RuleForm({ initialData, onSubmit, onCancel }: any) {
    const [content, setContent] = useState(initialData?.content || "");

    const modules = {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
            ['link', 'image'],
            [{ 'color': [] }, { 'background': [] }],
            ['clean']
        ],
    }

    const formats = [
        'header',
        'bold', 'italic', 'underline', 'strike', 'blockquote',
        'list', 'bullet', 'indent',
        'link', 'image', 'color', 'background'
    ]

    return (
        <div className="space-y-4 py-4">
            <ReactQuill
                theme="snow"
                value={content}
                onChange={setContent}
                className="h-64 mb-12"
                modules={modules}
                formats={formats}
            />
            <DialogFooter>
                <Button variant="outline" onClick={onCancel}>Cancel</Button>
                <Button onClick={() => onSubmit({ content, isActive: true })}>Save</Button>
            </DialogFooter>
        </div>
    )
}
