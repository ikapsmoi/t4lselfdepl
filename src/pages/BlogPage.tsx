import React, { useState, useEffect } from 'react';
import { PenTool, Image, Video, Calendar, User, Heart, MessageCircle, Share2, Plus, X } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

interface BlogPost {
  id: string;
  host_id: string;
  title: string;
  content: string;
  image_urls: string[];
  video_urls: string[];
  published: boolean;
  created_at: string;
  updated_at: string;
  host?: {
    id: string;
    name: string;
    avatar_url?: string;
    verified: boolean;
  };
}

export const BlogPage: React.FC = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    image_urls: [] as string[],
    video_urls: [] as string[]
  });
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchBlogPosts();
  }, []);

  const fetchBlogPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select(`
          *,
          host:profiles!host_id (
            id, name, avatar_url, verified
          )
        `)
        .eq('published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddImageUrl = () => {
    if (newImageUrl.trim()) {
      setNewPost(prev => ({
        ...prev,
        image_urls: [...prev.image_urls, newImageUrl.trim()]
      }));
      setNewImageUrl('');
    }
  };

  const handleAddVideoUrl = () => {
    if (newVideoUrl.trim()) {
      setNewPost(prev => ({
        ...prev,
        video_urls: [...prev.video_urls, newVideoUrl.trim()]
      }));
      setNewVideoUrl('');
    }
  };

  const handleRemoveImageUrl = (index: number) => {
    setNewPost(prev => ({
      ...prev,
      image_urls: prev.image_urls.filter((_, i) => i !== index)
    }));
  };

  const handleRemoveVideoUrl = (index: number) => {
    setNewPost(prev => ({
      ...prev,
      video_urls: prev.video_urls.filter((_, i) => i !== index)
    }));
  };

  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || user.role !== 'host') {
      alert('Only hosts can create blog posts');
      return;
    }

    if (!newPost.title.trim() || !newPost.content.trim()) {
      alert('Title and content are required');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('blog_posts')
        .insert([{
          host_id: user.id,
          title: newPost.title.trim(),
          content: newPost.content.trim(),
          image_urls: newPost.image_urls,
          video_urls: newPost.video_urls,
          published: true
        }]);

      if (error) throw error;

      // Reset form
      setNewPost({
        title: '',
        content: '',
        image_urls: [],
        video_urls: []
      });
      setShowCreateModal(false);
      
      // Refresh posts
      await fetchBlogPosts();
      
      alert('Blog post created successfully!');
    } catch (error) {
      console.error('Error creating blog post:', error);
      alert('Failed to create blog post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center">
            <PenTool className="w-10 h-10 mr-4 text-purple-600" />
            Travel Stories & Tips
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover insights, tips, and stories from our community of travel hosts
          </p>
          
          {user && user.role === 'host' && (
            <div className="mt-6">
              <Button
                variant="primary"
                onClick={() => setShowCreateModal(true)}
                icon={Plus}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Write a Post
              </Button>
            </div>
          )}
        </div>

        {/* Blog Posts */}
        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading blog posts...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-md">
            <PenTool className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Blog Posts Yet</h3>
            <p className="text-gray-600 mb-6">Be the first host to share your travel insights!</p>
            {user && user.role === 'host' && (
              <Button
                variant="primary"
                onClick={() => setShowCreateModal(true)}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Write First Post
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {posts.map((post) => (
              <article key={post.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                {/* Post Images */}
                {post.image_urls.length > 0 && (
                  <div className="relative h-48">
                    <img
                      src={post.image_urls[0]}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                    {post.image_urls.length > 1 && (
                      <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                        +{post.image_urls.length - 1} more
                      </div>
                    )}
                  </div>
                )}

                <div className="p-6">
                  {/* Author Info */}
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                      {post.host?.avatar_url ? (
                        <img
                          src={post.host.avatar_url}
                          alt={post.host.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User className="w-5 h-5 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-gray-900">{post.host?.name || 'Unknown Host'}</span>
                        {post.host?.verified && (
                          <Badge variant="success" size="sm">Verified</Badge>
                        )}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="w-3 h-3 mr-1" />
                        {formatDate(post.created_at)}
                      </div>
                    </div>
                  </div>

                  {/* Post Content */}
                  <h2 className="text-xl font-bold text-gray-900 mb-3">{post.title}</h2>
                  <p className="text-gray-700 mb-4 line-clamp-3">{post.content}</p>

                  {/* Video Links */}
                  {post.video_urls.length > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <Video className="w-4 h-4 mr-1" />
                        Video Content
                      </div>
                      <div className="space-y-2">
                        {post.video_urls.slice(0, 2).map((url, index) => (
                          <a
                            key={index}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block text-blue-600 hover:text-blue-700 text-sm truncate"
                          >
                            📹 Watch Video {index + 1}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center space-x-4">
                      <button className="flex items-center text-gray-500 hover:text-red-500 transition-colors">
                        <Heart className="w-4 h-4 mr-1" />
                        <span className="text-sm">Like</span>
                      </button>
                      <button className="flex items-center text-gray-500 hover:text-blue-500 transition-colors">
                        <MessageCircle className="w-4 h-4 mr-1" />
                        <span className="text-sm">Comment</span>
                      </button>
                    </div>
                    <button className="flex items-center text-gray-500 hover:text-purple-500 transition-colors">
                      <Share2 className="w-4 h-4 mr-1" />
                      <span className="text-sm">Share</span>
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Create Post Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Write a Blog Post"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmitPost} className="space-y-6">
          <Input
            label="Post Title"
            placeholder="Share your travel insights..."
            value={newPost.title}
            onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content
            </label>
            <textarea
              value={newPost.content}
              onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Write your blog post content here..."
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          {/* Image URLs */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Image className="w-4 h-4 inline mr-1" />
              Image URLs (Optional)
            </label>
            <div className="flex space-x-2 mb-2">
              <Input
                placeholder="https://example.com/image.jpg"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                className="flex-1"
              />
              <Button type="button" onClick={handleAddImageUrl} icon={Plus} size="sm">
                Add
              </Button>
            </div>
            {newPost.image_urls.length > 0 && (
              <div className="space-y-2">
                {newPost.image_urls.map((url, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <span className="text-sm text-gray-600 truncate">{url}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveImageUrl(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Video URLs */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Video className="w-4 h-4 inline mr-1" />
              Video URLs (Optional)
            </label>
            <div className="flex space-x-2 mb-2">
              <Input
                placeholder="https://youtube.com/watch?v=..."
                value={newVideoUrl}
                onChange={(e) => setNewVideoUrl(e.target.value)}
                className="flex-1"
              />
              <Button type="button" onClick={handleAddVideoUrl} icon={Plus} size="sm">
                Add
              </Button>
            </div>
            {newPost.video_urls.length > 0 && (
              <div className="space-y-2">
                {newPost.video_urls.map((url, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <span className="text-sm text-gray-600 truncate">{url}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveVideoUrl(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowCreateModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={isSubmitting}
              className="flex-1 bg-purple-600 hover:bg-purple-700"
            >
              Publish Post
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};