import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface GalleryImage {
  id: string;
  image_url: string;
  client_name?: string;
  location?: string;
  trip_title?: string;
  display_order: number;
  active: boolean;
  created_at: string;
}

const FALLBACK_IMAGES = [
  { url: '/winter1.jpeg', name: 'Dr. Ankit Yadav', location: 'Tomorrowland Winter 2026' },
  { url: '/winter.jpeg', name: 'Vumi Bahl', location: 'Tomorrowland Winter 2026' },
  { url: '/2.jpg', name: 'Diane Edhume', location: 'Tomorrowland Belgium 2022' },
  { url: '/3.jpg', name: 'Arpita Patel', location: 'Tomorrowland Winter 2014' },
  { url: '/4.jpg', name: 'Nikhil Chinappa', location: 'Tomorrowland Belgium 2015' },
  { url: '/5.jpg', name: 'Samrity Malhotra', location: 'Tomorrowland Belgium 2014' },
  { url: '/6.jpg', name: 'Abhay Sharma', location: 'Tomorrowland Winter 2026' },
  { url: '/7.jpg', name: 'Ashish Seth', location: 'Tomorrowland Belgium 2021' },
  { url: '/5.jpg', name: 'Samrity Malhotra', location: 'Tomorrowland Belgium 2014' },
  { url: '/4.jpg', name: 'Nikhil Chinappa', location: 'Tomorrowland Belgium 2015' },
  { url: '/tml1.jpeg', name: 'Ishan Kapoor', location: 'Tomorrowland Belgium 2024' },
  { url: '/salzburg1.jpeg', name: 'Vishal Gulati & Perminder Kaur', location: 'Salzburg' },
  { url: '/edc2.jpeg', name: 'Mark & Vallerie', location: 'EDC Phuket 2025' },
  { url: '/edc1.jpeg', name: 'Ishan', location: 'EDC Phuket 2025' },
  { url: '/amster1.jpeg', name: 'Perminder', location: 'Amsterdam' },
  { url: '/Ibo Nu.JPG', name: 'Ibo Inu', location: 'Ultra Miami' },
  { url: '/Keerti Dubay.JPG', name: 'Keerti Dubey', location: 'Rajasthan, India' },
  { url: '/12.JPG', name: 'Alex K.', location: 'Goa Groups' },
  { url: '/Anshul and Renu.JPG', name: 'Anshul & Renu', location: 'Swiss Bliss' },
  { url: '/aman.JPG', name: 'Aman', location: 'Pushkar Trip' },
  { url: '/pedro.JPG', name: 'Pedro', location: 'Coachella' },
  { url: '/Kumud Dubey.JPG', name: 'Kumud', location: 'Kasol Trek' },
  { url: '/monical.JPG', name: 'Monica', location: 'Tomorrowland Belgium' },
  { url: '/mayur.JPG', name: 'Mayur', location: 'Ultra Croatia' },
  { url: '/Kushal patel.JPG', name: 'Kushal', location: 'EDC Vegas' },
  { url: '/Muskan wadhwani.JPG', name: 'Muskan', location: 'Tomorrowland Belgium' },
];

export function useGallery() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGalleryImages();
  }, []);

  const fetchGalleryImages = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('client_gallery')
        .select('*')
        .eq('active', true)
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      if (data && data.length > 0) {
        setImages(data);
      } else {
        const fallbackData: GalleryImage[] = FALLBACK_IMAGES.map((img, index) => ({
          id: `fallback-${index}`,
          image_url: img.url,
          client_name: img.name,
          location: img.location,
          trip_title: undefined,
          display_order: index,
          active: true,
          created_at: new Date().toISOString(),
        }));
        setImages(fallbackData);
      }
    } catch (err) {
      console.error('Error fetching gallery images:', err);
      setError(err instanceof Error ? err.message : 'Failed to load gallery');

      const fallbackData: GalleryImage[] = FALLBACK_IMAGES.map((img, index) => ({
        id: `fallback-${index}`,
        image_url: img.url,
        client_name: img.name,
        location: img.location,
        trip_title: undefined,
        display_order: index,
        active: true,
        created_at: new Date().toISOString(),
      }));
      setImages(fallbackData);
    } finally {
      setLoading(false);
    }
  };

  const addGalleryImage = async (imageData: Omit<GalleryImage, 'id' | 'created_at'>) => {
    try {
      const { data, error: insertError } = await supabase
        .from('client_gallery')
        .insert([imageData])
        .select()
        .single();

      if (insertError) throw insertError;

      await fetchGalleryImages();
      return { success: true, data };
    } catch (err) {
      console.error('Error adding gallery image:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Failed to add image' };
    }
  };

  const updateGalleryImage = async (id: string, updates: Partial<GalleryImage>) => {
    try {
      const { error: updateError } = await supabase
        .from('client_gallery')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (updateError) throw updateError;

      await fetchGalleryImages();
      return { success: true };
    } catch (err) {
      console.error('Error updating gallery image:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Failed to update image' };
    }
  };

  const deleteGalleryImage = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('client_gallery')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      await fetchGalleryImages();
      return { success: true };
    } catch (err) {
      console.error('Error deleting gallery image:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Failed to delete image' };
    }
  };

  return {
    images,
    loading,
    error,
    refetch: fetchGalleryImages,
    addGalleryImage,
    updateGalleryImage,
    deleteGalleryImage,
  };
}
