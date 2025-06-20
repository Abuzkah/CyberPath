import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertBlogPostSchema, type BlogPost } from "@shared/schema";
import { CURRENT_USER_ID } from "@/lib/constants";
import { Plus, Eye, Edit, Calendar, Trash2 } from "lucide-react";
import { z } from "zod";

type BlogFormData = z.infer<typeof insertBlogPostSchema>;

export default function MarkdownEditor() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const { toast } = useToast();

  const { data: posts = [], isLoading } = useQuery<BlogPost[]>({
    queryKey: [`/api/blog/${CURRENT_USER_ID}`],
  });

  const form = useForm<BlogFormData>({
    resolver: zodResolver(insertBlogPostSchema),
    defaultValues: {
      userId: CURRENT_USER_ID,
      title: "",
      content: "",
      published: false,
    },
  });

  const createPostMutation = useMutation({
    mutationFn: async (data: BlogFormData) => {
      const response = await apiRequest("POST", "/api/blog", data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/blog/${CURRENT_USER_ID}`] });
      setIsDialogOpen(false);
      form.reset();
      toast({ title: "Blog post created successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to create blog post", variant: "destructive" });
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/blog/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/blog/${CURRENT_USER_ID}`] });
      toast({ title: "Blog post deleted successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to delete blog post", variant: "destructive" });
    },
  });

  const onSubmit = (data: BlogFormData) => {
    createPostMutation.mutate(data);
  };

  const renderMarkdown = (content: string) => {
    // Simple markdown rendering - in production, use a proper markdown parser
    return content
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold text-green-400 mb-4">$1</h1>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold text-blue-400 mb-3">$1</h2>')
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-medium text-cyan-400 mb-2">$1</h3>')
      .replace(/\*\*(.*)\*\*/gim, '<strong class="text-white">$1</strong>')
      .replace(/\*(.*)\*/gim, '<em class="text-gray-300">$1</em>')
      .replace(/`([^`]+)`/gim, '<code class="bg-gray-800 px-1 py-0.5 rounded text-green-400 font-mono text-sm">$1</code>')
      .replace(/```([^`]+)```/gim, '<pre class="bg-gray-800 p-4 rounded-lg text-green-400 font-mono text-sm overflow-x-auto mb-4"><code>$1</code></pre>')
      .replace(/\n/gim, '<br>');
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="terminal-window rounded-lg h-32"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-green-400 mb-2">Markdown Blog</h1>
          <p className="text-gray-400">Write and share your cybersecurity knowledge and walkthroughs</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-400 text-black hover:bg-green-500">
              <Plus className="mr-2 h-4 w-4" />
              New Post
            </Button>
          </DialogTrigger>
          <DialogContent className="terminal-window border-gray-700 max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-green-400">Create New Blog Post</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Post Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., How to Perform SQL Injection Testing" {...field} className="bg-gray-800 border-gray-600" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Content (Markdown)</FormLabel>
                      <FormControl>
                        <Tabs defaultValue="edit" className="w-full">
                          <TabsList className="grid w-full grid-cols-2 bg-gray-800">
                            <TabsTrigger value="edit">Edit</TabsTrigger>
                            <TabsTrigger value="preview">Preview</TabsTrigger>
                          </TabsList>
                          <TabsContent value="edit">
                            <Textarea
                              placeholder="# Introduction&#10;&#10;Write your blog post in Markdown format...&#10;&#10;## Code Example&#10;&#10;```bash&#10;nmap -sV target.com&#10;```"
                              className="bg-gray-800 border-gray-600 min-h-[300px] font-mono"
                              {...field}
                            />
                          </TabsContent>
                          <TabsContent value="preview">
                            <div 
                              className="bg-gray-800 border border-gray-600 rounded-md p-4 min-h-[300px] text-gray-300"
                              dangerouslySetInnerHTML={{ __html: renderMarkdown(field.value || '') }}
                            />
                          </TabsContent>
                        </Tabs>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="published"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gray-600 p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base text-gray-300">
                          Publish immediately
                        </FormLabel>
                        <div className="text-sm text-gray-400">
                          Make this post visible to others
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-green-400 text-black hover:bg-green-500" disabled={createPostMutation.isPending}>
                    {createPostMutation.isPending ? "Creating..." : "Create Post"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {posts.length === 0 ? (
        <div className="terminal-window rounded-lg p-8 text-center">
          <div className="text-gray-400 mb-4">
            <i className="fas fa-blog text-6xl"></i>
          </div>
          <h3 className="text-xl font-semibold text-gray-300 mb-2">No Blog Posts Yet</h3>
          <p className="text-gray-400 mb-4">Start sharing your cybersecurity knowledge with the community.</p>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-400 text-black hover:bg-green-500">
                <Plus className="mr-2 h-4 w-4" />
                Write Your First Post
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <Card key={post.id} className="terminal-window border-gray-700 hover:shadow-lg hover:shadow-green-400/20 transition-all">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-green-400 mb-2">{post.title}</CardTitle>
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <div className="flex items-center">
                        <Calendar className="mr-1 h-4 w-4" />
                        {new Date(post.createdAt).toLocaleDateString()}
                      </div>
                      <div className={`px-2 py-1 rounded text-xs ${
                        post.published ? "bg-green-400/20 text-green-400" : "bg-gray-600 text-gray-300"
                      }`}>
                        {post.published ? "Published" : "Draft"}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-400 hover:text-red-300"
                      onClick={() => deletePostMutation.mutate(post.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div 
                  className="text-gray-300 prose prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ 
                    __html: renderMarkdown(post.content.substring(0, 300) + (post.content.length > 300 ? '...' : ''))
                  }}
                />
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-700">
                  <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300">
                    Read More
                  </Button>
                  <Button variant="ghost" size="sm" className="text-cyan-400 hover:text-cyan-300">
                    <i className="fas fa-share-alt mr-2"></i>
                    Share
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
