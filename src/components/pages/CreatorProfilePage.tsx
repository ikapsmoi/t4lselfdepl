@@ .. @@
                 <img
                   src={creator.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(creator.name)}`}
                   alt={creator.name}
+                  loading="eager"
+                  decoding="async"
                   className="w-32 h-32 rounded-full border-4 border-white shadow-xl object-cover"
                 />