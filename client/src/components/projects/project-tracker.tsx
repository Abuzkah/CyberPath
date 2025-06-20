import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProjectSchema, type Project } from "@shared/schema";
import { CURRENT_USER_ID } from "@/lib/constants";
import { Plus, Calendar, Trash2, Edit } from "lucide-react";
import { z } from "zod";

const projectFormSchema = insertProjectSchema.extend({
  tools: z.string().transform(str => str.split(',').map(s => s.trim()).filter(Boolean)),
});

type ProjectFormData = z.infer<typeof projectFormSchema>;

export default function ProjectTracker() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: [`/api/projects/${CURRENT_USER_ID}`],
  });

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      userId: CURRENT_USER_ID,
      title: "",
      description: "",
      tools: "",
      result: "",
      files: null,
      moduleId: null,
    },
  });

  const createProjectMutation = useMutation({
    mutationFn: async (data: ProjectFormData) => {
      const response = await apiRequest("POST", "/api/projects", data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${CURRENT_USER_ID}`] });
      setIsDialogOpen(false);
      form.reset();
      toast({ title: "Project created successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to create project", variant: "destructive" });
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/projects/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${CURRENT_USER_ID}`] });
      toast({ title: "Project deleted successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to delete project", variant: "destructive" });
    },
  });

  const onSubmit = (data: ProjectFormData) => {
    createProjectMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="terminal-window rounded-lg h-48"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-green-400 mb-2">Project Tracker</h1>
          <p className="text-gray-400">Document your cybersecurity projects and achievements</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-400 text-black hover:bg-green-500">
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent className="terminal-window border-gray-700 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-green-400">Create New Project</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Project Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Web App Penetration Test" {...field} className="bg-gray-800 border-gray-600" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Describe your project methodology and approach..." {...field} className="bg-gray-800 border-gray-600" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tools"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Tools Used (comma separated)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Burp Suite, Nmap, SQLmap" {...field} className="bg-gray-800 border-gray-600" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="result"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Result/Outcome</FormLabel>
                      <FormControl>
                        <Textarea placeholder="What did you discover or achieve?" {...field} className="bg-gray-800 border-gray-600" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-green-400 text-black hover:bg-green-500" disabled={createProjectMutation.isPending}>
                    {createProjectMutation.isPending ? "Creating..." : "Create Project"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {projects.length === 0 ? (
        <div className="terminal-window rounded-lg p-8 text-center">
          <div className="text-gray-400 mb-4">
            <i className="fas fa-project-diagram text-6xl"></i>
          </div>
          <h3 className="text-xl font-semibold text-gray-300 mb-2">No Projects Yet</h3>
          <p className="text-gray-400 mb-4">Start documenting your cybersecurity projects and build your portfolio.</p>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-400 text-black hover:bg-green-500">
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Project
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {projects.map((project) => (
            <Card key={project.id} className="terminal-window border-gray-700 hover:shadow-lg hover:shadow-green-400/20 transition-all">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-green-400 mb-2">{project.title}</CardTitle>
                    <div className="flex items-center text-sm text-gray-400 mb-2">
                      <Calendar className="mr-1 h-4 w-4" />
                      {new Date(project.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-400 hover:text-red-300"
                      onClick={() => deleteProjectMutation.mutate(project.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 mb-4">{project.description}</p>
                
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-400 mb-2">Tools Used:</h4>
                  <div className="flex flex-wrap gap-2">
                    {project.tools.map((tool) => (
                      <Badge key={tool} variant="secondary" className="bg-gray-800 text-cyan-400">
                        {tool}
                      </Badge>
                    ))}
                  </div>
                </div>

                {project.result && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-400 mb-2">Result:</h4>
                    <p className="text-gray-300 text-sm">{project.result}</p>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300">
                    <i className="fas fa-share-alt mr-2"></i>
                    Share
                  </Button>
                  <Button variant="ghost" size="sm" className="text-cyan-400 hover:text-cyan-300">
                    <i className="fas fa-download mr-2"></i>
                    Export
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
