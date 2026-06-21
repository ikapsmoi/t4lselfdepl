import React, { useState } from 'react';
import { Upload, Trash2, Eye, EyeOff, Image as ImageIcon, Plus, X, Save } from 'lucide-react';
import { useGallery } from '../../hooks/useGallery';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { OptimizedImage } from '../ui/OptimizedImage';

export function GalleryManager() {
  const { images, loading, addGalleryImage, updateGalleryImage, deleteGalleryImage } = useGallery();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    image_url: '',
    client_name: '',
    location: '',
    trip_title: '',
    display_order: 0,
    active: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      await updateGalleryImage(editingId, formData);
      setEditingId(null);
    } else {
      await addGalleryImage(formData);
    }

    setFormData({
      image_url: '',
      client_name: '',
      location: '',
      trip_title: '',
      display_order: 0,
      active: true,
    });
    setShowAddModal(false);
  };

  const handleEdit = (image: any) => {
    setFormData({
      image_url: image.image_url,
      client_name: image.client_name || '',
      location: image.location || '',
      trip_title: image.trip_title || '',
      display_order: image.display_order,
      active: image.active,
    });
    setEditingId(image.id);
    setShowAddModal(true);
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    await updateGalleryImage(id, { active: !currentActive });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this image?')) {
      await deleteGalleryImage(id);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gallery Management</h2>
          <p className="text-gray-600 mt-1">Manage client gallery images</p>
        </div>
        <Button
          onClick={() => {
            setFormData({
              image_url: '',
              client_name: '',
              location: '',
              trip_title: '',
              display_order: images.length,
              active: true,
            });
            setEditingId(null);
            setShowAddModal(true);
          }}
          className="bg-sky-600 hover:bg-sky-700 text-white"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Image
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {images.map((image) => (
          <div
            key={image.id}
            className={`bg-white rounded-xl shadow-md overflow-hidden ${
              !image.active ? 'opacity-60' : ''
            }`}
          >
            <div className="relative h-48">
              <OptimizedImage
                src={image.image_url}
                alt={image.client_name || 'Gallery image'}
                className="w-full h-full object-cover"
              />
              {!image.active && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <EyeOff className="w-8 h-8 text-white" />
                </div>
              )}
            </div>

            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-1">
                {image.client_name || 'Unnamed Client'}
              </h3>
              <p className="text-sm text-gray-600 mb-2">{image.location || 'No location'}</p>
              {image.trip_title && (
                <p className="text-xs text-gray-500 italic mb-3">"{image.trip_title}"</p>
              )}

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Order: {image.display_order}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggleActive(image.id, image.active)}
                    className={`p-2 rounded-lg transition-colors ${
                      image.active
                        ? 'bg-green-100 text-green-600 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    title={image.active ? 'Hide' : 'Show'}
                  >
                    {image.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleEdit(image)}
                    className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                    title="Edit"
                  >
                    <Save className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(image.id)}
                    className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {images.length === 0 && (
        <div className="text-center py-16">
          <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No images yet</h3>
          <p className="text-gray-600 mb-6">Start by adding your first client gallery image</p>
          <Button
            onClick={() => setShowAddModal(true)}
            className="bg-sky-600 hover:bg-sky-700 text-white"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add First Image
          </Button>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                {editingId ? 'Edit Image' : 'Add New Image'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingId(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image URL *
                </label>
                <Input
                  type="text"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="/image.jpg or https://..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Client Name
                </label>
                <Input
                  type="text"
                  value={formData.client_name}
                  onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                  placeholder="John D."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <Input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Bali, Indonesia"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trip Title
                </label>
                <Input
                  type="text"
                  value={formData.trip_title}
                  onChange={(e) => setFormData({ ...formData, trip_title: e.target.value })}
                  placeholder="Best trip ever!"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Display Order
                </label>
                <Input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) =>
                    setFormData({ ...formData, display_order: parseInt(e.target.value) })
                  }
                  min="0"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="w-4 h-4 text-sky-600 border-gray-300 rounded focus:ring-sky-500"
                />
                <label htmlFor="active" className="ml-2 text-sm text-gray-700">
                  Active (visible in gallery)
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingId(null);
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 hover:bg-gray-300"
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-sky-600 hover:bg-sky-700 text-white">
                  {editingId ? 'Update' : 'Add'} Image
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
